import React, { useRef, useMemo } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import { useApp } from "@/providers/AppProvider";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { YourMixPostData } from "@/types/api.types";

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN_PUBLIC || "");

interface DrinkingMapProps {
  variant?: "preview" | "full";
}

export default function DrinkingMap({ variant = "preview" }: DrinkingMapProps) {
  const { mapFriendPosts } = useApp();
  const router = useRouter();
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const isInteractive = variant === "full";

  const validPosts = useMemo(() => {
    if (!mapFriendPosts) return [];
    return mapFriendPosts.filter(
      (post): post is YourMixPostData =>
        typeof post.latitude === "number" &&
        typeof post.longitude === "number" &&
        Math.abs(post.latitude) > 0.1 &&
        Math.abs(post.longitude) > 0.1
    );
  }, [mapFriendPosts]);

  const cameraSettings = useMemo(() => {
    if (validPosts.length === 0) {
      return {
        followUserLocation: true,
        bounds: undefined,
        zoom: 12,
      };
    }

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
      followUserLocation: false,
      bounds: {
        ne: [maxLng, maxLat],
        sw: [minLng, minLat],
        paddingBottom: 40,
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 40,
      },
      zoom: undefined,
    };
  }, [validPosts]);

  const handlePreviewPress = () => {
    router.push("/(screens)/fullMap");
  };

  return (
    <View
      style={[
        styles.container,
        variant === "full" && styles.fullScreenContainer,
      ]}
    >
      <MapboxGL.MapView
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Dark}
        logoEnabled={false}
        attributionEnabled={false}
        scrollEnabled={isInteractive}
        zoomEnabled={isInteractive}
        pitchEnabled={isInteractive}
        rotateEnabled={isInteractive}
        scaleBarEnabled={false}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: [23.3219, 42.6977],
            zoomLevel: 10,
          }}
          bounds={cameraSettings.bounds}
          followUserLocation={cameraSettings.followUserLocation}
          followUserMode={
            cameraSettings.followUserLocation
              ? MapboxGL.UserTrackingMode.Follow
              : undefined
          }
          animationMode="flyTo"
          animationDuration={1500}
        />

        <MapboxGL.UserLocation visible={true} animated={true}>
          <MapboxGL.CircleLayer
            id="userLocOuter"
            style={{
              circleRadius: 12,
              circleColor: "#EA580C",
              circleOpacity: 0.3,
              circlePitchAlignment: "map",
            }}
          />
          <MapboxGL.CircleLayer
            id="userLocInner"
            style={{
              circleRadius: 6,
              circleColor: "#EA580C",
              circleStrokeWidth: 2,
              circleStrokeColor: "#FFFFFF",
              circlePitchAlignment: "map",
            }}
          />
        </MapboxGL.UserLocation>

        {validPosts.map((post) => {
          // Determine what image to show in the PIN (User Avatar preferred, else Post Image)
          const pinImage = post.userImageUrl || post.imageUrl;

          // Determine buddy text
          const buddyCount = post.mentionedBuddies?.length || 0;
          const buddiesText =
            buddyCount > 0
              ? post.mentionedBuddies
                  .slice(0, 2)
                  .map((b) => b.username)
                  .join(", ") + (buddyCount > 2 ? ` +${buddyCount - 2}` : "")
              : null;

          return (
            <MapboxGL.PointAnnotation
              key={post.id}
              id={post.id}
              coordinate={[post.longitude!, post.latitude!]}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={styles.markerContainer}>
                <View style={styles.pinBackground} />
                <View style={styles.imageContainer}>
                  {pinImage ? (
                    <Image
                      source={{ uri: pinImage }}
                      style={styles.markerImage}
                      resizeMode="cover"
                      key={pinImage}
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

              {isInteractive ? (
                <MapboxGL.Callout title={post.username}>
                  <View style={styles.calloutCard}>
                    {/* Header: Name & Time */}
                    <View style={styles.calloutHeader}>
                      <Text style={styles.calloutUsername} numberOfLines={1}>
                        {post.username}
                      </Text>
                      <View style={styles.calloutTimeBadge}>
                        <Text style={styles.calloutTimeText}>
                          {new Date(post.loggedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                    </View>

                    {/* --- THE ACTUAL POST IMAGE --- */}
                    {post.imageUrl && (
                      <Image
                        source={{ uri: post.imageUrl }}
                        style={styles.calloutPostImage}
                        resizeMode="cover"
                      />
                    )}

                    {/* Divider (Only show if we have details below) */}
                    {(post.locationText ||
                      (post.alcohol && post.alcohol.length > 0) ||
                      buddiesText) && <View style={styles.calloutDivider} />}

                    {/* Content Rows */}
                    <View style={styles.calloutContent}>
                      {post.locationText && (
                        <View style={styles.infoRow}>
                          <Ionicons
                            name="location-sharp"
                            size={12}
                            color="#EA580C"
                          />
                          <Text style={styles.infoText} numberOfLines={1}>
                            {post.locationText}
                          </Text>
                        </View>
                      )}

                      {post.alcohol && post.alcohol.length > 0 && (
                        <View style={styles.infoRow}>
                          <MaterialCommunityIcons
                            name="glass-cocktail"
                            size={12}
                            color="#EA580C"
                          />
                          <Text style={styles.infoText} numberOfLines={1}>
                            {post.alcohol.join(", ")}
                          </Text>
                        </View>
                      )}

                      {buddiesText && (
                        <View style={styles.infoRow}>
                          <Ionicons name="people" size={12} color="#EA580C" />
                          <Text style={styles.infoText} numberOfLines={1}>
                            with {buddiesText}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </MapboxGL.Callout>
              ) : (
                <View />
              )}
            </MapboxGL.PointAnnotation>
          );
        })}
      </MapboxGL.MapView>

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

  // --- Pin Styles ---
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

  // --- Callout Styles (Medium-Big Image) ---
  calloutCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    width: 260, // Wider for better image display
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    marginBottom: 10,
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
  // The Post Image
  calloutPostImage: {
    width: "100%",
    height: 180, // Medium-Big size
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#222",
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
