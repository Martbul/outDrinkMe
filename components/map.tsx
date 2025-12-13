import React, { useRef, useMemo, useState, useEffect } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import { useApp } from "@/providers/AppProvider";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from 'expo-location'; 
import { YourMixPostData } from "@/types/api.types";

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN_PUBLIC || "");

interface DrinkingMapProps {
  variant?: "preview" | "full";
}

// --- 1. Separated the Card Logic into its own component ---
const PostCard = ({ post, onClose }: { post: YourMixPostData; onClose: () => void }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => setImageLoading(false);
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const buddyCount = post.mentionedBuddies?.length || 0;
  const buddiesText =
    buddyCount > 0
      ? post.mentionedBuddies
          .slice(0, 2)
          .map((b) => b.username)
          .join(", ") + (buddyCount > 2 ? ` +${buddyCount - 2}` : "")
      : null;

  return (
    <View style={styles.floatingCardWrapper}>
      <View style={styles.calloutCard}>
        <View style={styles.calloutHeader}>
          <Text style={styles.calloutUsername} numberOfLines={1}>
            {post.username}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.calloutTimeBadge}>
              <Text style={styles.calloutTimeText}>
                {new Date(post.loggedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          </View>
        </View>

        {post.imageUrl && (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: post.imageUrl }}
              style={styles.calloutPostImage}
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {imageLoading && !imageError && (
              <View style={styles.imageLoadingOverlay}>
                <ActivityIndicator size="small" color="#EA580C" />
              </View>
            )}
            {imageError && (
              <View style={styles.imageErrorOverlay}>
                <Ionicons name="image-outline" size={24} color="rgba(255,255,255,0.3)" />
                <Text style={styles.imageErrorText}>Image unavailable</Text>
              </View>
            )}
          </View>
        )}

        {(post.locationText || (post.alcohol && post.alcohol.length > 0) || buddiesText) && <View style={styles.calloutDivider} />}
        
        <View style={styles.calloutContent}>
          {post.locationText && (
            <View style={styles.infoRow}>
              <Ionicons name="location-sharp" size={12} color="#EA580C" />
              <Text style={styles.infoText} numberOfLines={1}>{post.locationText}</Text>
            </View>
          )}
          {post.alcohol && post.alcohol.length > 0 && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="glass-cocktail" size={12} color="#EA580C" />
              <Text style={styles.infoText} numberOfLines={1}>{post.alcohol.join(", ")}</Text>
            </View>
          )}
          {buddiesText && (
            <View style={styles.infoRow}>
              <Ionicons name="people" size={12} color="#EA580C" />
              <Text style={styles.infoText} numberOfLines={1}>with {buddiesText}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// --- 2. Marker Component (Now simpler, handles Selection via callback) ---
const PostMarker = React.memo(({ post, isInteractive, onSelect }: { post: YourMixPostData; isInteractive: boolean; onSelect: (post: YourMixPostData) => void }) => {
  const annotationRef = useRef<MapboxGL.PointAnnotation>(null);
  const [markerImageLoading, setMarkerImageLoading] = useState(true);

  const handleMarkerImageLoad = () => {
    setMarkerImageLoading(false);
    // Refresh to ensure image renders inside annotation on Android
    setTimeout(() => {
      annotationRef.current?.refresh();
    }, 100);
  };

  const pinImage = post.userImageUrl || post.imageUrl;

  return (
    <MapboxGL.PointAnnotation
      ref={annotationRef}
      id={post.id}
      coordinate={[post.longitude!, post.latitude!]}
      anchor={{ x: 0.5, y: 1 }}
      onSelected={() => isInteractive && onSelect(post)} // Use onSelected event
    >
      <View style={styles.markerContainer}>
        <View style={styles.pinBackground} />
        <View style={styles.imageContainer}>
          {pinImage ? (
            <Image
              source={{ uri: pinImage }}
              style={styles.markerImage}
              resizeMode="cover"
              onLoad={handleMarkerImageLoad}
            />
          ) : (
            <View style={styles.fallbackAvatar}>
              <Text style={styles.fallbackText}>
                {post.username?.[0]?.toUpperCase() || "?"}
              </Text>
            </View>
          )}
        </View>
        {!pinImage && (
          <View style={styles.drinkBadge}>
            <Ionicons name="wine" size={12} color="white" />
          </View>
        )}
      </View>
      {/* We removed the MapboxGL.Callout here entirely */}
    </MapboxGL.PointAnnotation>
  );
});

PostMarker.displayName = "PostMarker";

export default function DrinkingMap({ variant = "preview" }: DrinkingMapProps) {
  const { mapFriendPosts } = useApp();
  const router = useRouter();
  const cameraRef = useRef<MapboxGL.Camera>(null);
  
  // --- 3. State to track the currently selected post ---
  const [selectedPost, setSelectedPost] = useState<YourMixPostData | null>(null);
  const [initialUserLocation, setInitialUserLocation] = useState<[number, number] | null>(null);

  const isInteractive = variant === "full";

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const location = await Location.getCurrentPositionAsync({});
        setInitialUserLocation([location.coords.longitude, location.coords.latitude]);
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    })();
  }, []);

  const validPosts = useMemo(() => {
    if (!mapFriendPosts) return [];
    return mapFriendPosts.filter(
      (post): post is YourMixPostData =>
        typeof post.latitude === "number" &&
        typeof post.longitude === "number" &&
        Math.abs(post.latitude) > 0.1
    );
  }, [mapFriendPosts]);

  const cameraSettings = useMemo(() => {
    // Camera logic remains the same...
    if (validPosts.length > 0) {
      let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
      validPosts.forEach((p) => {
        if (p.latitude! < minLat) minLat = p.latitude!;
        if (p.latitude! > maxLat) maxLat = p.latitude!;
        if (p.longitude! < minLng) minLng = p.longitude!;
        if (p.longitude! > maxLng) maxLng = p.longitude!;
      });
      const latDiff = maxLat - minLat;
      const lngDiff = maxLng - minLng;
      if (latDiff < 0.005) { minLat -= 0.01; maxLat += 0.01; }
      if (lngDiff < 0.005) { minLng -= 0.01; maxLng += 0.01; }

      return {
        type: 'bounds',
        bounds: { ne: [maxLng, maxLat], sw: [minLng, minLat], paddingBottom: 40, paddingLeft: 40, paddingRight: 40, paddingTop: 40 },
        zoom: undefined, center: undefined
      };
    }
    if (initialUserLocation) return { type: 'location', bounds: undefined, center: initialUserLocation, zoom: 6 };
    return { type: 'default', bounds: undefined, center: [23.3219, 42.6977], zoom: 4 };
  }, [validPosts, initialUserLocation]);

  const handlePreviewPress = () => {
    router.push("/(screens)/fullMap");
  };

  const handleMapPress = () => {
    // Deselect if map background is clicked
    if (selectedPost) setSelectedPost(null);
  };

  return (
    <View style={[styles.container, variant === "full" && styles.fullScreenContainer]}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Dark}
        logoEnabled={false}
        attributionEnabled={false}
        scrollEnabled={isInteractive}
        zoomEnabled={isInteractive}
        onPress={handleMapPress} // Add press handler to dismiss card
      >
        <MapboxGL.Camera
          ref={cameraRef}
          defaultSettings={{ centerCoordinate: [23.3219, 42.6977], zoomLevel: 4 }}
          bounds={cameraSettings.bounds}
          centerCoordinate={cameraSettings.center}
          zoomLevel={cameraSettings.zoom}
          animationMode="flyTo"
          animationDuration={2000}
        />

        {validPosts.map((post) => (
          <PostMarker 
            key={post.id} 
            post={post} 
            isInteractive={isInteractive}
            onSelect={setSelectedPost} // Pass the setter
          />
        ))}
      </MapboxGL.MapView>

      {/* --- 4. Render the Card as an Absolute Overlay --- */}
      {isInteractive && selectedPost && (
        <PostCard 
          post={selectedPost} 
          onClose={() => setSelectedPost(null)} 
        />
      )}

      {!isInteractive && (
        <TouchableOpacity style={styles.overlayButton} onPress={handlePreviewPress} activeOpacity={0.8}>
          <View style={styles.expandBadge}>
            <Ionicons name="expand" size={16} color="white" />
            <Text style={styles.expandText}>Explore Map</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 320,
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#121212",
    position: "relative",
  },
  fullScreenContainer: {
    height: "100%",
    width: "100%",
    marginTop: 0,
    borderRadius: 0,
    borderWidth: 0,
  },
  map: {
    flex: 1,
  },
  overlayButton: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    zIndex: 10,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: 16,
  },
  expandBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  expandText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 6,
  },
  markerContainer: {
    width: 64,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
  },
  pinBackground: {
    position: "absolute",
    width: 50,
    height: 50,
    backgroundColor: "#EA580C",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 2,
    transform: [{ rotate: "45deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  imageContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    zIndex: 2,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  markerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  fallbackAvatar: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333",
  },
  fallbackText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  drinkBadge: {
    position: "absolute",
    top: 0,
    right: 5,
    zIndex: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  
  // --- New Styles for the Floating Card ---
  floatingCardWrapper: {
    position: 'absolute',
    bottom: 30, // Positioned at the bottom of the map
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
    paddingHorizontal: 20,
  },
  calloutCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    width: "100%", // Full width minus padding
    maxWidth: 340,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  calloutHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  calloutUsername: {
    color: "white",
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
    marginRight: 8,
  },
  calloutTimeBadge: {
    backgroundColor: "rgba(234, 88, 12, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  calloutTimeText: {
    color: "#EA580C",
    fontSize: 10,
    fontWeight: "bold",
  },
  imageWrapper: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#222",
    position: "relative",
    overflow: 'hidden',
  },
  calloutPostImage: {
    width: "100%",
    height: "100%",
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222",
  },
  imageErrorOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222",
  },
  imageErrorText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    marginTop: 8,
  },
  calloutDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 8,
  },
  calloutContent: {
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
}); 