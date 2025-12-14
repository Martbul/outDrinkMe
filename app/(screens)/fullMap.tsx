import React from "react";
import { View, TouchableOpacity, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DrinkingMap from "@/components/map";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FullMapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      <DrinkingMap variant="full" />

      <TouchableOpacity
        onPress={() => router.back()}
        style={{ top: insets.top + 10, left: 16 }}
        className="absolute w-12 h-12 rounded-full bg-black/60 items-center justify-center border border-white/20 z-50 backdrop-blur-md"
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
