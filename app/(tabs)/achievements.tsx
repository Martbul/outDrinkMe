import React from "react";
import { View, Text, ScrollView, ActivityIndicator, Image } from "react-native";
import { useApp } from "@/providers/AppProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "@/components/header";

export default function AchievementsScreen() {
  const { achievements, userStats, isLoading } = useApp();
  const insets = useSafeAreaInsets();

  const achievementImages = [
    require("../../assets/images/achievements/lightning.png"),
    require("../../assets/images/achievements/druid.png"),
    require("../../assets/images/achievements/campfire.png"),
    require("../../assets/images/achievements/target.png"),
    require("../../assets/images/achievements/crown.png"),
    require("../../assets/images/achievements/trophy.png"),
    require("../../assets/images/achievements/star.png"),
    require("../../assets/images/achievements/100.png"),
  ];

  // Calculate progress for locked achievements
  const getProgress = (achievement: any) => {
    if (!userStats) return 0;

    switch (achievement.criteria_type) {
      case "streak":
        return Math.min(
          (userStats.current_streak / achievement.criteria_value) * 100,
          100
        );
      case "total_days":
        return Math.min(
          (userStats.total_days_drank / achievement.criteria_value) * 100,
          100
        );
      case "weeks_won":
        return Math.min(
          (userStats.total_weeks_won / achievement.criteria_value) * 100,
          100
        );
      case "friends":
        return Math.min(
          (userStats.friends_count / achievement.criteria_value) * 100,
          100
        );
      case "perfect_week":
        // This would need additional tracking - for now show 0
        return 0;
      default:
        return 0;
    }
  };

  const getProgressText = (achievement: any) => {
    if (!userStats) return "0/0";

    switch (achievement.criteria_type) {
      case "streak":
        return `${userStats.current_streak}/${achievement.criteria_value}`;
      case "total_days":
        return `${userStats.total_days_drank}/${achievement.criteria_value}`;
      case "weeks_won":
        return `${userStats.total_weeks_won}/${achievement.criteria_value}`;
      case "friends":
        return `${userStats.friends_count}/${achievement.criteria_value}`;
      case "perfect_week":
        return `0/${achievement.criteria_value}`;
      default:
        return "0/0";
    }
  };

  if (isLoading && !achievements) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#EA580C" />
        <Text className="text-gray-500 mt-4">Loading achievements...</Text>
      </View>
    );
  }

  const unlockedCount = achievements?.filter((a) => a.unlocked).length || 0;
  const totalCount = achievements?.length || 0;

  return (
    <View className="flex-1 bg-black">
      <Header />
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          paddingTop: insets.top - 10,
          paddingBottom: 100 + insets.bottom,
        }}
      >
        <View className="mb-8">
          <View className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/[0.08]">
            <View className="flex-row items-start justify-between mb-6">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-2">
                  <View className="w-2 h-2 bg-orange-600 rounded-full" />
                  <Text className="text-orange-500 text-xs font-black tracking-widest uppercase">
                    Achievements
                  </Text>
                </View>
                <Text className="text-white text-3xl font-black leading-tight">
                  Your Legacy{"\n"}Unlocked
                </Text>
              </View>
              <View className="bg-orange-600/15 border-2 border-orange-600 rounded-2xl px-5 py-3">
                <Text className="text-orange-600 text-xs font-bold mb-1 text-center">
                  COLLECTED
                </Text>
                <Text className="text-white text-2xl font-black text-center">
                  {unlockedCount}
                  <Text className="text-white/40 text-lg">/{totalCount}</Text>
                </Text>
              </View>
            </View>

            <View className="bg-black/20 rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                  Completion
                </Text>
                <Text className="text-orange-500 text-base font-black">
                  {Math.round((unlockedCount / totalCount) * 100)}%
                </Text>
              </View>
              <View className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <View
                  className="h-full bg-orange-600 rounded-full shadow-lg shadow-orange-600/50"
                  style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Achievements Grid */}
        <View className="flex-row flex-wrap justify-between">
          {achievements?.map((achievement, index) => {
            const progress = getProgress(achievement);
            const progressText = getProgressText(achievement);
            const isUnlocked = achievement.unlocked;

            return (
              <View
                key={achievement.id}
                className={`w-[48%] bg-orange-600/8 border border-orange-600/30 rounded-2xl p-6 items-center mb-4 ${
                  !isUnlocked ? "opacity-40" : ""
                }`}
              >
                {/* Icon */}
                <View className="relative mb-3">
                  <Image
                    source={achievementImages[index]}
                    style={{ width: 70, height: 70 }}
                  />
                  {/* <Text className="text-5xl">{achievement.icon}</Text> */}
                  {isUnlocked && (
                    <View className="absolute -bottom-1 -right-1 bg-orange-600 rounded-full w-5 h-5 items-center justify-center">
                      <Text className="text-white text-xs font-black">✓</Text>
                    </View>
                  )}
                </View>

                {/* Title */}
                <Text className="text-orange-400 text-sm font-bold text-center mb-1">
                  {achievement.name}
                </Text>

                {/* Description */}
                <Text className="text-gray-600 text-xs text-center uppercase tracking-wide mb-2">
                  {achievement.description}
                </Text>

                {/* Progress Bar (for locked achievements) */}
                {!isUnlocked && progress > 0 && (
                  <View className="w-full mt-2">
                    <View className="bg-gray-800 h-1.5 rounded-full overflow-hidden mb-1">
                      <View
                        className="bg-orange-600 h-full rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </View>
                    <Text className="text-gray-600 text-[10px] text-center font-semibold">
                      {progressText}
                    </Text>
                  </View>
                )}

                {/* Unlocked Badge */}
                {isUnlocked && (
                  <View className="mt-2 bg-orange-600/20 px-3 py-1 rounded-full">
                    <Text className="text-orange-500 text-[10px] font-black uppercase tracking-wider">
                      Unlocked
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
