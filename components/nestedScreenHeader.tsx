import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface ScreenHeaderProps {
  title: string;
  eyebrow?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  onBack?: () => void;
}

export const NestedScreenHeader = ({
  title,
  eyebrow,
  showBack = true,
  rightAction,
  onBack,
}: ScreenHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <View className="px-4 py-3 bg-black z-50 flex-row items-center justify-between border-b border-white/[0.05]">
      <View className="flex-row items-center flex-1">
        {/* Glassmorphic Back Button */}
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            className="mr-4 w-10 h-10 bg-white/[0.03] rounded-full items-center justify-center border border-white/10 activebg-white/[0.03]"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        )}

        {/* Titles */}
        <View className="flex-1">
          {eyebrow && (
            <Text className="text-orange-600 text-[10px] font-black tracking-[3px] uppercase mb-0.5">
              {eyebrow}
            </Text>
          )}
          <Text
            className="text-white text-2xl font-black tracking-tight"
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
      </View>

      {/* Right Action Slot (e.g. Counter, Add Button) */}
      {rightAction && <View className="ml-4">{rightAction}</View>}
    </View>
  );
};
