import React, { useRef } from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import { DailyDrinkingPostResponse } from "@/types/api.types";

// Initialize Mapbox with your PUBLIC token
MapboxGL.setAccessToken(
  process.env.EXPO_PUBLIC_MAPBOX_KEY || "YOUR_PUBLIC_KEY_HERE"
);

interface DrinkingMapProps {
  posts: DailyDrinkingPostResponse[];
}

export default function DrinkingMap({ posts }: DrinkingMapProps) {
  const cameraRef = useRef<MapboxGL.Camera>(null);

  // Filter out posts that don't have coordinates
  const validPosts = posts.filter((p) => p.latitude && p.longitude);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Dark} // Dark mode fits a "night out" app
        logoEnabled={false}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: [23.3219, 42.6977], // Sofia, BG (Based on your timezone)
            zoomLevel: 12,
          }}
          followUserLocation={true}
          followUserMode={MapboxGL.UserTrackingMode.Follow}
        />

        {/* Show User Location */}
        <MapboxGL.UserLocation visible={true} animated={true} />

        {/* Render Markers */}
        {validPosts.map((post) => (
          <MapboxGL.PointAnnotation
            key={post.id}
            id={post.id}
            coordinate={[post.longitude!, post.latitude!]}
            onSelected={() => console.log(`Selected post by ${post.username}`)}
          >
            {/* Custom Marker View */}
            <View style={styles.markerContainer}>
              <View style={styles.markerBorder}>
                <Image
                  source={{
                    uri:
                      post.user_image_url ||
                      post.image_url ||
                      "https://via.placeholder.com/40",
                  }}
                  style={styles.markerImage}
                />
              </View>
              <View style={styles.arrow} />
            </View>

            {/* Popup (Callout) when clicked */}
            <MapboxGL.Callout title={post.username}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{post.username}</Text>
                <Text style={styles.calloutText}>{post.location_text}</Text>
                <Text style={styles.calloutTime}>
                  {new Date(post.logged_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </MapboxGL.Callout>
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 400, // Adjust height or use flex: 1
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 20,
  },
  map: {
    flex: 1,
  },
  // Marker Styling
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerBorder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EA580C", // Your app theme color
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  markerImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#000",
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 0,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#EA580C",
    marginTop: -1,
  },
  // Callout Styling
  calloutContainer: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    minWidth: 120,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
    color: "black",
  },
  calloutText: {
    fontSize: 12,
    color: "#333",
  },
  calloutTime: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
  },
});
