import React, { useEffect, useMemo } from "react";
import { View, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolation,
  Easing,
} from "react-native-reanimated";
import { CanvasItem } from "@/types/api.types";

const FloatingReaction = React.memo(({ uri }: { uri: string }) => {
  // 1. Randomize configuration for this specific bubble
  // Position: 10% to 80% from the left to keep it inside the card
  const randomX = useMemo(() => Math.random() * 70 + 10, []);
  // Duration: Between 2s and 4s for varied speed
  const duration = useMemo(() => 2000 + Math.random() * 2000, []);
  // Delay: Random start time so they don't all pop up at once
  const delay = useMemo(() => Math.random() * 2000, []);
  // Random slight rotation for organic feel (-15 to 15 deg)
  const rotation = useMemo(() => (Math.random() - 0.5) * 30, []);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration,
          easing: Easing.out(Easing.ease),
        }),
        -1, // Infinite loop
        false // Do not reverse (restart from bottom)
      )
    );
  }, [delay, duration, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    // Upward movement (approx 120 logical pixels)
    const translateY = interpolate(progress.value, [0, 1], [20, -120]);

    // Fade in quickly, stay visible, then fade out at the end
    const opacity = interpolate(
      progress.value,
      [0, 0.15, 0.8, 1],
      [0, 1, 1, 0],
      Extrapolation.CLAMP
    );

    // Pop in scale effect
    const scale = interpolate(
      progress.value,
      [0, 0.1],
      [0.5, 1],
      Extrapolation.CLAMP
    );

    return {
      position: "absolute",
      left: `${randomX}%`,
      bottom: 0,
      opacity,
      transform: [{ translateY }, { scale }, { rotate: `${rotation}deg` }],
      zIndex: 20, // Ensure it floats above the image
    };
  });

  return (
    <Animated.View style={animatedStyle} pointerEvents="none">
      <Image
        source={{ uri }}
        style={{ width: 32, height: 32 }}
        resizeMode="contain"
      />
    </Animated.View>
  );
});

export const ReactionsOverlay = React.memo(
  ({ items }: { items?: CanvasItem[] }) => {
    const reactionImages = useMemo(() => {
      // 1. Log BEFORE checking if empty to see if data is arriving at all
      console.log("--- ReactionsOverlay Debug ---");
      console.log("Items received:", items);

      if (!items || items.length === 0) return [];

      // 2. Filter for reactions
      const allReactions = items.filter(
        (i) => i.item_type === "reaction" || i.item_type === "sticker"
      );

      // 3. Get unique stickers (deduplicate by URL)
      const uniqueUris = [...new Set(allReactions.map((r) => r.content))];

      // 4. Limit to max 6
      return uniqueUris.slice(0, 6);
    }, [items]);

    if (reactionImages.length === 0) return null;

    return (
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
        }}
        pointerEvents="none"
      >
        {reactionImages.map((uri, index) => (
          <FloatingReaction key={`${uri}-${index}`} uri={uri} />
        ))}
      </View>
    );
  }
);