import {
  View,
  Text,
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useEffect, useRef, useState } from "react";

export default function DrunkThought({
  thought,
  userImageUrl,
}: {
  thought: string;
  userImageUrl: string; 
}) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const [isDeleted, setIsDeleted] = useState(false);
  const lastTap = useRef<number | null>(null);

  const { width, height } = Dimensions.get("window");

  const randomX = Math.random() * (width - 200) + 20;
  const randomY = Math.random() * (height - 300) + 150;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2500 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500 + Math.random() * 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTap.current && now - lastTap.current < DOUBLE_TAP_DELAY) {
      setIsDeleted(true);
    } else {
      lastTap.current = now;
    }
  };

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const opacity = floatAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.85, 1, 0.85],
  });

  const scale = floatAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.02, 1],
  });

  if (isDeleted) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: randomX,
          top: randomY,
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={handleDoubleTap}>
        <View style={styles.bubble}>
          <Text style={styles.text} numberOfLines={3}>
            {thought}
          </Text>
          <View style={styles.corner} />
          <Image source={{ uri: userImageUrl }} style={styles.imageCorner} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}



const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 100,
    maxWidth: 180,
  },
  bubble: {
    backgroundColor: "rgba(234, 88, 12, 0.95)",
    borderRadius: 16,
    padding: 12,
    paddingTop: 8,
    shadowColor: "#EA580C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
  },
  text: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
    lineHeight: 18,
    textAlign: "center",
  },
  corner: {
    position: "absolute",
    top: 2,
    right: 115,
    width: 10,
    height: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "rgba(234, 88, 12, 1)",
  },  
  imageCorner: {
    position: "absolute",
    bottom: -10,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 10,
  },
});