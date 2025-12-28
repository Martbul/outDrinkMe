import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, StyleSheet, LayoutChangeEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type FeedbackType = "success" | "xp" | "level" | "info";

interface QuickFeedbackProps {
  visible: boolean;
  message: string;
  type?: FeedbackType;
  onHide: () => void;
}

export function QuickFeedback({
  visible,
  message,
  type = "success",
  onHide,
}: QuickFeedbackProps) {
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  const [layoutWidth, setLayoutWidth] = useState(0);

  useEffect(() => {
    if (visible) {
      progressAnim.setValue(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(-20);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 2200, // Matches the timer
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -10,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, 2200);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const onProgressBarLayout = (event: LayoutChangeEvent) => {
    setLayoutWidth(event.nativeEvent.layout.width);
  };

  const getConfig = () => {
    switch (type) {
      case "xp": return { icon: "flash", color: "#EA580C", label: "XP GAINED" };
      case "level": return { icon: "trophy", color: "#EA580C", label: "LEVEL UP" };
      case "info": return { icon: "information-circle", color: "#EA580C", label: "NOTICE" };
      default: return { icon: "checkmark-circle", color: "#EA580C", label: "SUCCESS" };
    }
  };

  const config = getConfig();

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.toast,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            borderColor: config.color,
          },
        ]}
      >
        <View className="flex-row items-center px-4 py-3">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: config.color + "20" }}
          >
            <Ionicons name={config.icon as any} size={24} color={config.color} />
          </View>

          <View>
            <Text className="text-white/50 text-[10px] font-black uppercase tracking-widest">
              {config.label}
            </Text>
            <Text className="text-white font-bold text-base leading-5">
              {message}
            </Text>
          </View>
        </View>

        <View 
          onLayout={onProgressBarLayout}
          className="h-1 bg-white/10 w-full overflow-hidden rounded-b-xl"
        >
          <Animated.View
            style={{
              height: "100%",
              width: "100%",
              backgroundColor: config.color,
              transform: [
                {
                  translateX: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-layoutWidth, 0],
                  }),
                },
              ],
            }}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  toast: {
    backgroundColor: "#111",
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
});