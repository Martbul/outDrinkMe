import React, { useRef, useMemo, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import MapboxGL from "@rnmapbox/maps";
import { useApp } from "@/providers/AppProvider";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { YourMixPostData } from "@/types/api.types";

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN_PUBLIC || "");

interface DrinkingMapProps {
  variant?: "preview" | "full";
}

const PostCard = ({
  post,
  position,
  onClose,
}: {
  post: YourMixPostData;
  position: { x: number; y: number };
  onClose: () => void;
}) => {
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

  // Reduced offset for the smaller pin (Head 32 + Tip 6 + padding)
  const PIN_HEIGHT_OFFSET = 42;

  return (
    <View
      style={[
        styles.absoluteCardWrapper,
        {
          left: position.x,
          top: position.y - PIN_HEIGHT_OFFSET,
        },
      ]}
    >
      <View style={styles.calloutCard}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close-circle" size={28} color="#EA580C" />
        </TouchableOpacity>

        {/* Post Image */}
        {post.imageUrl && (
          <View style={styles.imageSection}>
            <Image
              source={{ uri: post.imageUrl }}
              style={styles.postImage}
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {imageLoading && !imageError && (
              <View style={styles.imageLoadingOverlay}>
                <ActivityIndicator size="small" color="#EA580C" />
              </View>
            )}
          </View>
        )}

        <View style={styles.infoSection}>
          <View style={styles.userHeader}>
            <View style={styles.avatarContainer}>
              {post.userImageUrl ? (
                <Image
                  source={{ uri: post.userImageUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>
                    {post.username?.[0]?.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.userTextContainer}>
              <Text style={styles.username} numberOfLines={1}>
                {post.username}
              </Text>
              <Text style={styles.timestamp}>
                {new Date(post.loggedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>

          {(post.locationText ||
            (post.alcohol && post.alcohol.length > 0) ||
            buddiesText) && (
            <View style={styles.detailsContainer}>
              {post.locationText && (
                <View style={styles.detailRow}>
                  <Ionicons
                    name="location-sharp"
                    size={14}
                    color="rgba(255,255,255,0.5)"
                  />
                  <Text style={styles.detailText} numberOfLines={2}>
                    {post.locationText}
                  </Text>
                </View>
              )}
              {post.alcohol && post.alcohol.length > 0 && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons
                    name="glass-cocktail"
                    size={14}
                    color="rgba(255,255,255,0.5)"
                  />
                  <Text style={styles.detailText} numberOfLines={2}>
                    {post.alcohol.join(", ")}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
      {/* Little arrow pointing down */}
      <View style={styles.cardArrow} />
    </View>
  );
};

// --- 2. Marker Component (Compact Version) ---
const PostMarker = React.memo(
  ({
    post,
    isInteractive,
    onSelect,
    zoomLevel,
  }: {
    post: YourMixPostData;
    isInteractive: boolean;
    onSelect: (post: YourMixPostData) => void;
    zoomLevel: number;
  }) => {
    const annotationRef = useRef<MapboxGL.PointAnnotation>(null);
    const [markerImageLoading, setMarkerImageLoading] = useState(true);

    const handleMarkerImageLoad = () => {
      setMarkerImageLoading(false);
      setTimeout(() => {
        annotationRef.current?.refresh();
      }, 100);
    };

    // Adjusted scaling logic for smaller base size:
    // Don't shrink too much (min 0.6) so they remain visible
    const scale = Math.min(Math.max(zoomLevel / 18, 0.6), 1.2);
    const pinImage = post.userImageUrl || post.imageUrl;

    return (
      <MapboxGL.PointAnnotation
        ref={annotationRef}
        id={post.id}
        coordinate={[post.longitude!, post.latitude!]}
        anchor={{ x: 0.5, y: 1 }}
        onSelected={() => isInteractive && onSelect(post)}
      >
        <View style={[styles.markerContainer, { transform: [{ scale }] }]}>
          <View style={styles.pinShadow}>
            <View style={styles.pinHead}>
              {pinImage ? (
                <Image
                  source={{ uri: pinImage }}
                  style={styles.markerImage}
                  resizeMode="cover"
                  onLoad={handleMarkerImageLoad}
                />
              ) : (
                <View style={styles.fallbackAvatarMarker}>
                  <Text style={styles.fallbackTextMarker}>
                    {post.username?.[0]?.toUpperCase() || "?"}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.pinPoint} />
          </View>
        </View>
      </MapboxGL.PointAnnotation>
    );
  }
);

PostMarker.displayName = "PostMarker";

export default function DrinkingMap({ variant = "preview" }: DrinkingMapProps) {
  const { mapFriendPosts } = useApp();
  const router = useRouter();

  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const [selectedPost, setSelectedPost] = useState<YourMixPostData | null>(
    null
  );
  const [cardPosition, setCardPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [initialUserLocation, setInitialUserLocation] = useState<
    [number, number] | null
  >(null);
  const [currentZoom, setCurrentZoom] = useState<number>(12);

  const isInteractive = variant === "full";

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const location = await Location.getCurrentPositionAsync({});
        setInitialUserLocation([
          location.coords.longitude,
          location.coords.latitude,
        ]);
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
    if (validPosts.length > 0) {
      let minLat = 90,
        maxLat = -90,
        minLng = 180,
        maxLng = -180;
      validPosts.forEach((p) => {
        if (p.latitude! < minLat) minLat = p.latitude!;
        if (p.latitude! > maxLat) maxLat = p.latitude!;
        if (p.longitude! < minLng) minLng = p.longitude!;
        if (p.longitude! > maxLng) maxLng = p.longitude!;
      });
      const latDiff = maxLat - minLat;
      const lngDiff = maxLng - minLng;
      if (latDiff < 0.005) {
        minLat -= 0.01;
        maxLat += 0.01;
      }
      if (lngDiff < 0.005) {
        minLng -= 0.01;
        maxLng += 0.01;
      }

      return {
        type: "bounds",
        bounds: {
          ne: [maxLng, maxLat],
          sw: [minLng, minLat],
          paddingBottom: 40,
          paddingLeft: 40,
          paddingRight: 40,
          paddingTop: 40,
        },
        zoom: undefined,
        center: undefined,
      };
    }
    if (initialUserLocation)
      return {
        type: "location",
        bounds: undefined,
        center: initialUserLocation,
        zoom: 6,
      };
    return {
      type: "default",
      bounds: undefined,
      center: [23.3219, 42.6977],
      zoom: 4,
    };
  }, [validPosts, initialUserLocation]);

  const handlePreviewPress = () => {
    router.push("/(screens)/fullMap");
  };

  const handleMapPress = () => {
    if (selectedPost) {
      setSelectedPost(null);
      setCardPosition(null);
    }
  };

  const handleMarkerSelect = async (post: YourMixPostData) => {
    if (!mapRef.current) return;

    setSelectedPost(post);

    try {
      const point = await mapRef.current.getPointInView([
        post.longitude!,
        post.latitude!,
      ]);
      if (point) {
        setCardPosition({ x: point[0], y: point[1] });
      }
    } catch (e) {
      console.log("Error getting point", e);
    }
  };

  return (
    <View
      style={[
        styles.container,
        variant === "full" && styles.fullScreenContainer,
      ]}
    >
      <MapboxGL.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Dark}
        logoEnabled={false}
        scaleBarEnabled={false}
        attributionEnabled={false}
        scrollEnabled={isInteractive}
        zoomEnabled={isInteractive}
        onPress={handleMapPress}
        onCameraChanged={(state) => {
          if (state.properties.zoom) {
            setCurrentZoom(state.properties.zoom);
          }
          if (isInteractive && selectedPost) {
            setSelectedPost(null);
            setCardPosition(null);
          }
        }}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: [23.3219, 42.6977],
            zoomLevel: 4,
          }}
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
            onSelect={handleMarkerSelect}
            zoomLevel={currentZoom}
          />
        ))}
      </MapboxGL.MapView>

      {/* Absolute Card Overlay */}
      {isInteractive && selectedPost && cardPosition && (
        <PostCard
          post={selectedPost}
          position={cardPosition}
          onClose={() => {
            setSelectedPost(null);
            setCardPosition(null);
          }}
        />
      )}

      {!isInteractive && (
        <TouchableOpacity
          style={styles.overlayButton}
          onPress={handlePreviewPress}
          activeOpacity={0.8}
        >
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
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
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

  // --- NEW SMALLER MARKER DESIGN ---
  markerContainer: {
    width: 32,
    height: 38, // 32 head + 6 tip
    alignItems: "center",
    justifyContent: "flex-end",
  },
  pinShadow: {
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  pinHead: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#222",
    borderWidth: 2, // Keeps it visible despite small size
    borderColor: "#FFFFFF",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  pinPoint: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 4, // Narrower tip
    borderRightWidth: 4,
    borderTopWidth: 6, // Shorter tip
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FFFFFF",
    marginTop: -1,
    zIndex: 1,
  },
  markerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  fallbackAvatarMarker: {
    width: "100%",
    height: "100%",
    backgroundColor: "#EA580C",
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackTextMarker: {
    color: "white",
    fontWeight: "800",
    fontSize: 12, // Smaller text
  },

  // --- CARD STYLES ---
  absoluteCardWrapper: {
    position: "absolute",
    zIndex: 1000,
    width: 280,
    transform: [{ translateX: -140 }, { translateY: "-100%" }],
  },
  calloutCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    width: "100%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  cardArrow: {
    position: "absolute",
    bottom: -10,
    left: "50%",
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#1E1E1E",
    zIndex: 1001,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "rgba(255, 253, 253, 0.4)",
    borderRadius: 20,
  },
  imageSection: {
    width: "100%",
    height: 140,
    backgroundColor: "rgba(255,255,255,0.05)",
    position: "relative",
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  infoSection: {
    padding: 12,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  userTextContainer: {
    flex: 1,
  },
  username: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  timestamp: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
  },
  detailsContainer: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    flex: 1,
  },
});
