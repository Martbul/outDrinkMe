import React, { useRef } from "react";
import {
  View,
  Modal,
  Animated,
  PanResponder,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageSourcePropType,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface SwipeableSheetProps {
  visible: boolean;
  onClose: () => void;
  coverImage?: string | ImageSourcePropType;
  children: React.ReactNode;
}

export const SwipeableSheet = ({
  visible,
  onClose,
  coverImage,
  children,
}: SwipeableSheetProps) => {
  const panY = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          gestureState.dy > 5 &&
          Math.abs(gestureState.dx) < Math.abs(gestureState.dy) &&
          scrollY.current <= 0
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) panY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          onClose();
          setTimeout(() => panY.setValue(0), 200);
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = event.nativeEvent.contentOffset.y;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        <Animated.View
          style={{ flex: 1, transform: [{ translateY: panY }] }}
          {...panResponder.panHandlers}
        >
          {/* Drag Handle */}
          <View className="absolute top-2 left-0 right-0 items-center z-50">
            <View className="w-12 h-1.5 bg-white/30 rounded-full" />
          </View>

          {/* Close Button (Floating) */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 left-4 z-50 w-10 h-10 bg-black/60 backdrop-blur-md rounded-full items-center justify-center border border-white/10"
          >
            <Ionicons name="chevron-down" size={24} color="white" />
          </TouchableOpacity>

          <ScrollView
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Optional Hero Image */}
            {coverImage && (
              <View className="h-72 w-full relative">
                <Image
                  source={
                    typeof coverImage === "string"
                      ? { uri: coverImage }
                      : coverImage
                  }
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
                <LinearGradient
                  colors={["transparent", "#000000"]}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 100,
                  }}
                />
              </View>
            )}

            {/* Content Container (Pushes up if image exists) */}
            <View className={coverImage ? "px-5 -mt-4" : "px-5 pt-16"}>
              {children}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};
