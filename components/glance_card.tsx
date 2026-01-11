import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface GlanceCardProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  badgeText?: string; // e.g., "5.8 mi" or "Top Rated"
  rating?: number;
  onPress: () => void;
  footerContent?: React.ReactNode; // Custom icons at the bottom
}

export const GlanceCard = ({
  title,
  subtitle,
  imageUrl,
  badgeText,
  rating,
  onPress,
  footerContent,
}: GlanceCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="mb-6 bg-[#121212] rounded-3xl overflow-hidden border border-white/[0.08]"
    >
      {/* Image Section */}
      <View className="relative w-full h-56 bg-gray-900">
        <Image
          source={{ uri: imageUrl }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "transparent"]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 80,
          }}
        />

        {/* Bookmark Icon */}
        <View className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full items-center justify-center border border-white/10">
          <Feather name="bookmark" size={18} color="white" />
        </View>

        {/* Badge (Bottom Right) */}
        {badgeText && (
          <View className="absolute bottom-4 right-4 bg-black/80 border border-white/10 px-3 py-1.5 rounded-xl">
            <Text className="text-white font-bold text-xs">{badgeText}</Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <Text className="text-xl font-black text-white flex-1 mr-2 leading-6">
            {title}
          </Text>
        </View>

        {subtitle && (
          <Text className="text-white/50 text-xs font-bold uppercase tracking-widest mt-1 mb-3">
            {subtitle}
          </Text>
        )}

        <View className="flex-row items-center space-x-2">
          {rating && (
            <View className="flex-row items-center bg-white/[0.05] px-2 py-1 rounded-md border border-white/[0.05] mr-2">
              <Ionicons name="star" size={12} color="#EA580C" />
              <Text className="text-xs font-bold text-white ml-1">
                {rating}
              </Text>
            </View>
          )}
          {footerContent}
        </View>
      </View>
    </TouchableOpacity>
  );
};
