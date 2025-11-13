import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

interface LevelsComponentProps {
  currentLevel: number;
  currentXP: number;
  xpForNextLevel: number;
  totalXP: number;
  onInfoPress?: () => void;
  onClaimPress?: () => void;
  hasRewardToClaim?: boolean;
}

export const LevelsComponent = ({
  currentLevel = 1,
  currentXP = 0,
  xpForNextLevel = 506,
  totalXP = 0,
  onInfoPress,
  onClaimPress,
  hasRewardToClaim = false,
}: LevelsComponentProps) => {
  const xpProgress = (currentXP / xpForNextLevel) * 100;
  const nextLevel = currentLevel + 1;

  return (
    <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
      {/* Header */}
      <View className="flex-row items-center mb-5">
        <View className="w-8 h-8 items-center justify-center mr-2">
          <Feather name="award" size={24} color="#EA580C" />
        </View>
        <Text className="text-white text-xl font-black">Levels</Text>
      </View>

      {/* Level Display */}
      <View className="flex-row items-center mb-4">
        {/* Hexagon Level Badge */}
        <View className="mr-4">
          <View className="relative">
            {/* Hexagon Shape using border trick */}
            <View className="items-center justify-center">
              <View
                className="w-20 h-20 items-center justify-center border-4 border-orange-600"
                style={{
                  transform: [{ rotate: "0deg" }],
                  borderRadius: 12,
                }}
              >
                <Text className="text-white text-3xl font-black">
                  {currentLevel}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white text-lg font-bold">
              {currentXP} / {xpForNextLevel} XP
            </Text>
            <Text className="text-white/50 text-sm font-bold">
              Lv.{nextLevel}
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="w-full h-4 bg-white/[0.08] rounded-full overflow-hidden border border-orange-400/30">
            <View
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
              style={{
                width: `${Math.min(xpProgress, 100)}%`,
                backgroundColor: "#EA580C",
              }}
            />
          </View>
        </View>
      </View>

      {/* Total XP and Claim Section */}
      <View className="flex-row items-center justify-center pt-4 border-t border-white/[0.08]">
        {/* Total XP */}
        <View className="flex-row items-center">
          <Feather name="star" size={16} color="#EA580C" />
          <Text className="text-white/50 text-sm font-semibold ml-2">
            {totalXP}
          </Text>
          <Text className="text-white/50 text-sm font-semibold ml-1">
            Total XP
          </Text>
        </View>
      </View>
    </View>
  );
};
