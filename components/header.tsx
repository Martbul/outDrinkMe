import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useApp } from "@/providers/AppProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";


export const Header = () => {
  const { userData, userStats } = useApp();
  const insets = useSafeAreaInsets();

  // Calculate level and progress (every 20 days = 1 level)
  const totalDays = userStats?.total_days_drank || 0;
  const level = Math.floor(totalDays / 20) + 1;
  const progressInLevel = totalDays % 20;
  const progressPercentage = (progressInLevel / 20) * 100;

  // Get user initials
  const getInitials = () => {
    if (!userData) return "??";
    const first = userData.firstName?.[0] || "";
    const last = userData.lastName?.[0] || "";
    return (first + last).toUpperCase() || "??";
  };


  return (          

    <View className="bg-black" style={{ paddingTop: insets.top }}>
      {/* Profile and Stats Bar */}
      <View className="flex-row justify-between items-center px-4 py-4">
        {/* Avatar and Level */}
        <View className="flex-row items-center flex-1">
          {userData?.imageUrl ? (
            <TouchableOpacity onPress={() => router.push("/(screens)/userProfile")}>
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
          <View className="ml-3 flex-1">
            <Text className="text-white text-base font-bold mb-1">
              Lv.{level}
            </Text>
            <View className="max-w-[140px]">
              <View className="h-2 bg-white/10 rounded border border-white/20 overflow-hidden">
                <View
                  className="h-full bg-orange-600 rounded"
                  style={{ width: `${progressPercentage}%` }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row items-center gap-4">
          {/* Streak */}
          <View className="flex-row items-center gap-1.5 bg-white/5 px-3 py-2 rounded-full">
            <Text className="text-xl">🔥</Text>
            <Text className="text-white text-base font-bold">
              {userStats?.current_streak || 0}
            </Text>
          </View>

          {/* Achievements */}
          <View className="flex-row items-center gap-1.5 bg-white/5 px-3 py-2 rounded-full">
            <View className="relative">
              <Text className="text-xl">💎</Text>
              {(userStats?.achievements_count || 0) > 0 && (
                <View className="absolute -bottom-0.5 -right-0.5 bg-orange-600 w-3 h-3 rounded-full justify-center items-center">
                  <Text className="text-white text-[8px] font-black">+</Text>
                </View>
              )}
            </View>
            <Text className="text-white text-base font-bold">
              {userStats?.achievements_count || 0}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Header;