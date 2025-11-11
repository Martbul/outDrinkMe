import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { useApp } from "@/providers/AppProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { getLevelInfo } from "@/utils/levels";
import InfoTooltip from "./infoTooltip";
import { useAds } from "@/providers/AdProvider";

export const Header = () => {
  const { userData, userStats, updateUserProfile } = useApp();
  const { isAdLoaded, showRewardedAd } = useAds();
  const [isLevelTooltipVisible, setIsLevelTooltipVisible] =
    useState<boolean>(false);

  const levelInfo = getLevelInfo(userData?.xp);
  const insets = useSafeAreaInsets();

  const xpNeededForThisLevel =
    levelInfo.nextLevelStartXp - levelInfo.currentLevelStartXp;
  const levelInfoDescr = `Drink to get xp and level up!\nLevel Progress: ${Math.floor(levelInfo.currentLevelProgress)}/${xpNeededForThisLevel} XP`;

  const getInitials = () => {
    if (!userData) return "??";
    const first = userData.firstName?.[0] || "";
    const last = userData.lastName?.[0] || "";
    return (first + last).toUpperCase() || "??";
  };

  const handleEarnGems = async () => {
    // Show the ad and wait for result
    const rewardEarned = await showRewardedAd();

    if (rewardEarned) {
      const gemAmount = 1;
      try {
        const newGemCount = (userData?.gems || 0) + gemAmount;
        await updateUserProfile({ gems: newGemCount });

        // Alert.alert("Gems Earned! 💎", `You earned ${gemAmount} gems!`, [
        //   { text: "Awesome!", style: "default" },
        // ]);
      } catch (error) {
        console.error("Failed to update gems:", error);
        Alert.alert("Error", "Failed to award gems. Please try again.");
      }
    }
  };

  return (
    <View className="bg-black" style={{ paddingTop: insets.top }}>
      <View className="flex-row justify-between items-center px-4 py-2">
        <View className="flex-row items-center flex-1">
          {userData?.imageUrl ? (
            <TouchableOpacity
              onPress={() => router.push("/(screens)/userProfile")}
            >
              <Image
                source={{ uri: userData.imageUrl }}
                className="w-14 h-14 rounded-full border-3 border-white"
              />
            </TouchableOpacity>
          ) : (
            <View className="w-14 h-14 rounded-full bg-orange-600 justify-center items-center border-3 border-white">
              <Text className="text-white text-xl font-black">
                {getInitials()}
              </Text>
            </View>
          )}
          <TouchableOpacity
            className="ml-3 flex-1"
            onPress={() => setIsLevelTooltipVisible(!isLevelTooltipVisible)}
          >
            <Text className="text-white text-base font-bold mb-1">
              Lv.{levelInfo.level}
            </Text>
            <View className="max-w-[140px]">
              <View className="h-2 bg-white/10 rounded border border-white/20 overflow-hidden">
                <View
                  className="h-full bg-orange-600 rounded"
                  style={{ width: `${levelInfo.progressPercentage}%` }}
                />
              </View>
            </View>
            {isLevelTooltipVisible && (
              <InfoTooltip
                title="Level"
                visible={isLevelTooltipVisible}
                description={levelInfoDescr}
                onClose={() => setIsLevelTooltipVisible(false)}
              />
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1.5 bg-white/5 px-3 py-2 rounded-full">
            <Text className="text-xl">🔥</Text>
            <Text className="text-white text-base font-bold">
              {userStats?.current_streak || 0}
            </Text>
          </View>

          <TouchableOpacity
            className="flex-row items-center gap-1.5 bg-white/5 px-3 py-2 rounded-full"
            onPress={handleEarnGems}
            disabled={!isAdLoaded}
          >
            <View className="relative">
              <Text className="text-xl">💎</Text>

              {isAdLoaded && (
                <View className="absolute -bottom-0.5 -right-0.5 bg-orange-600 w-3 h-3 rounded-full justify-center items-center">
                  <Text className="text-white text-[8px] font-black">+</Text>
                </View>
              )}
            </View>
            <Text className="text-white text-base font-bold">
              {userData?.gems || 0}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Header;
