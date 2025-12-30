import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

interface PremiumLockProps {
  isLocked: boolean;
  onUnlock: () => void;
  isProcessing?: boolean;
  price?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const PremiumLock = ({
  isLocked,
  onUnlock,
  isProcessing = false,
  price = "$4.99",
  title = "Premium Content",
  description = "Unlock to view this content.",
  children,
}: PremiumLockProps) => {
  return (
    <View className="relative overflow-hidden rounded-3xl">
      {/* The Content (Blurred if locked) */}
      <View
        style={
          isLocked ? { opacity: 0.2, filter: "blur(8px)" } : { opacity: 1 }
        }
        pointerEvents={isLocked ? "none" : "auto"}
      >
        {children}
      </View>

      {/* The Overlay */}
      {isLocked && (
        <View className="absolute inset-0 items-center justify-center bg-black/40 z-20">
          <View className="w-16 h-16 bg-[#1A1A1A] rounded-full items-center justify-center shadow-lg border border-orange-600/50 mb-4">
            <MaterialCommunityIcons name="lock" size={32} color="#EA580C" />
          </View>

          <Text className="text-xl font-black text-white mb-2">{title}</Text>
          <Text className="text-white/60 text-center px-8 mb-6 leading-5">
            {description}
          </Text>

          <TouchableOpacity
            onPress={onUnlock}
            disabled={isProcessing}
            className="bg-orange-600 px-8 py-4 rounded-full shadow-lg shadow-orange-600/20 flex-row items-center"
          >
            {isProcessing ? (
              <ActivityIndicator color="black" />
            ) : (
              <>
                <Text className="text-black font-black text-base mr-2 uppercase tracking-wide">
                  Unlock for {price}
                </Text>
                <Ionicons name="arrow-forward" color="black" size={18} />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
