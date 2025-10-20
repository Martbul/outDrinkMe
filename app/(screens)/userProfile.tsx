import React, { useMemo } from "react";
import ThisWeekGadget from "@/components/thisWeekGadget";
import { useApp } from "@/providers/AppProvider";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LogoutButton from "@/components/logoutButton";

const ACHIEVEMENT_IMAGES = {
  lightning: require("../../assets/images/achievements/lightning.png"),
  druid: require("../../assets/images/achievements/druid.png"),
  campfire: require("../../assets/images/achievements/campfire.png"),
  target: require("../../assets/images/achievements/target.png"),
  crown: require("../../assets/images/achievements/crown.png"),
  trophy: require("../../assets/images/achievements/trophy.png"),
  star: require("../../assets/images/achievements/star.png"),
  hundred: require("../../assets/images/achievements/100.png"),
};

export default function UserProfileScreen() {
  const { userData, userStats, weeklyStats, isLoading } = useApp();
  const insets = useSafeAreaInsets();
 
  const achievements = useMemo(
    () => [
      { image: ACHIEVEMENT_IMAGES.lightning, unlocked: true },
      { image: ACHIEVEMENT_IMAGES.crown, unlocked: true },
      { image: ACHIEVEMENT_IMAGES.campfire, unlocked: true },
      { image: ACHIEVEMENT_IMAGES.hundred, unlocked: true },
      { image: ACHIEVEMENT_IMAGES.trophy, unlocked: false },
      { image: ACHIEVEMENT_IMAGES.star, unlocked: false },
    ],
    []
  );

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* Profile Header */}
        <View
          className="items-center pb-6 px-4"
          style={{ paddingTop: insets.top + 32 }}
        >
          {/* Avatar with Level */}
          <View className="relative mb-4">
            <View className="w-32 h-32 rounded-full bg-orange-600 items-center justify-center border-4 border-black">
              <Image
                source={{ uri: userData?.imageUrl }}
                className="w-32 h-32 rounded-full border-3 border-white"
              />
            </View>
            {/* Level Badge */}
            <View className="absolute -bottom-2 left-1/2 -ml-8 bg-gray-900 px-4 py-1 rounded-full border-2 border-orange-600">
              <Text className="text-orange-600 text-sm font-black">LV. 5</Text>
            </View>
          </View>

          {/* Name & Username */}
          <Text className="text-white text-2xl font-black mb-1">
            {`${userData?.firstName} ${userData?.lastName}`}
          </Text>

          <Text className="text-white/50 text-base mb-4">
            {userData?.email}
          </Text>

          {/* Edit Profile Button */}
          <TouchableOpacity className="bg-white/[0.03] px-8 py-3 rounded-xl border border-white/[0.08]">
            <Text className="text-white font-bold uppercase tracking-widest text-sm">
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View className="px-4 mb-4">
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] items-center">
              <Text className="text-orange-600 text-4xl font-black mb-1">
                {userStats?.current_streak || 0}
              </Text>
              <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase">
                Current Streak
              </Text>
            </View>
            <View className="flex-1 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] items-center">
              <Text className="text-white text-4xl font-black mb-1">
                {userStats?.best_streak || 0}
              </Text>
              <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase">
                Best Streak
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] items-center">
              <Text className="text-white text-4xl font-black mb-1">
                {userStats?.total_days || 0}
              </Text>
              <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase">
                Total Days
              </Text>
            </View>
            <View className="flex-1 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] items-center">
              <Text className="text-white text-4xl font-black mb-1">
                #{userStats?.rank || 0}
              </Text>
              <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase">
                Current Rank
              </Text>
            </View>
          </View>
        </View>

        <View className="px-4">
          <ThisWeekGadget />
        </View>

        <View className="px-4 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-black">Achievements</Text>
            <Text className="text-white/50 text-sm font-semibold">4/8</Text>
          </View>

          <View className="flex-row flex-wrap gap-3">
            {achievements.map((achievement, index) => (
              <View
                key={index}
                className={`w-[30%] aspect-square rounded-2xl items-center justify-center border ${
                  achievement.unlocked
                    ? "bg-orange-600/20 border-orange-600/50"
                    : "bg-white/[0.05] border-white/[0.08]"
                }`}
              >
                <Image
                  source={achievement.image}
                  style={{
                    width: 64,
                    height: 64,
                    opacity: achievement.unlocked ? 1 : 0.3,
                  }}
                  resizeMode="contain"
                />
              </View>
            ))}
          </View>
        </View>

        <View className="px-4">
          <LogoutButton/>
        </View>
      </ScrollView>
    </View>
  );
}
