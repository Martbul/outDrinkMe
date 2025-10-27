import React, { useMemo } from "react";
import ThisWeekGadget from "@/components/thisWeekGadget";
import { useApp } from "@/providers/AppProvider";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LogoutButton from "@/components/logoutButton";
import { useRouter } from "expo-router";
import { getLevelInfo } from "@/utils/levels";
import BackHeader from "@/components/backHeader";
import { MaterialIcons } from "@expo/vector-icons";
 
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
  const { userData, userStats, achievements, isLoading } =
    useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const levelInfo = getLevelInfo(userData?.xp);

  const groupedAchievements = useMemo(() => {
    if (!achievements) return { streaks: [], competition: [], social: [] };

    return {
      streaks: achievements.filter(
        (a) =>
          a.criteria_type === "streak" ||
          a.criteria_type === "perfect_week" ||
          a.criteria_type === "total_days"
      ),
      competition: achievements.filter((a) => a.criteria_type === "weeks_won"),
      social: achievements.filter((a) => a.criteria_type === "friends"),
    };
  }, [achievements]);

  const unlockedCount = achievements?.filter((a) => a.unlocked).length || 0;
  const totalCount = achievements?.length || 0;

  const getAchievementImage = (name: string) => {
    const imageMap: { [key: string]: any } = {
      Lightning: ACHIEVEMENT_IMAGES.lightning,
      "Beast Mode": ACHIEVEMENT_IMAGES.druid,
      "Fire Starter": ACHIEVEMENT_IMAGES.campfire,
      Sharpshooter: ACHIEVEMENT_IMAGES.target,
      King: ACHIEVEMENT_IMAGES.crown,
      Champion: ACHIEVEMENT_IMAGES.trophy,
      Legend: ACHIEVEMENT_IMAGES.star,
      Century: ACHIEVEMENT_IMAGES.hundred,
    };
    return imageMap[name] || ACHIEVEMENT_IMAGES.lightning;
  };

  const renderAchievementCategory = (
    title: string,
    achievements: any[],
    icon: string
  ) => {
    if (achievements.length === 0) return null;

    return (
      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <Text className="text-2xl mr-2">{icon}</Text>
          <Text className="text-white text-base font-bold">{title}</Text>
          <View className="ml-auto bg-white/[0.05] px-2.5 py-1 rounded-full">
            <Text className="text-white/50 text-xs font-bold">
              {achievements.filter((a) => a.unlocked).length}/
              {achievements.length}
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-2.5">
          {achievements.map((achievement) => (
            <View
              key={achievement.id}
              className={`w-[30%] aspect-square rounded-xl items-center justify-center border ${
                achievement.unlocked
                  ? "bg-orange-600/20 border-orange-600/50"
                  : "bg-white/[0.03] border-white/[0.08]"
              }`}
            >
              <Image
                source={getAchievementImage(achievement.name)}
                style={{
                  width: 56,
                  height: 56,
                  opacity: achievement.unlocked ? 1 : 0.3,
                }}
                resizeMode="contain"
              />
              {achievement.unlocked && (
                <View className="absolute top-1.5 right-1.5 bg-orange-600 rounded-full w-4 h-4 items-center justify-center">
                  <Text className="text-white text-[10px] font-black">✓</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <BackHeader className="top-16" />

        {/* Profile Header */}
        <View
          className="items-center pb-6 px-4"
          style={{ paddingTop: insets.top + 16 }}
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
              <Text className="text-orange-600 text-sm font-black">{`LV. ${levelInfo.level}`}</Text>
            </View>
          </View>

          <Text className="text-white text-2xl font-black mb-1">
            {`${userData?.firstName} ${userData?.lastName}`}
          </Text>

          <Text className="text-white/50 text-base mb-4">
            {userData?.email}
          </Text>
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
                {userStats?.longest_streak || 0}
              </Text>
              <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase">
                Best Streak
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] items-center">
              <Text className="text-white text-4xl font-black mb-1">
                {userStats?.total_days_drank || 0}
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
                World Rank
              </Text>
            </View>
          </View>
        </View>

        <View className="px-4">
          <ThisWeekGadget />
        </View>

        {/* Achievements Section */}
        <View className="px-4 mb-6">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <View className="flex-row justify-between items-center mb-5">
              <View>
                <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-1">
                  ACHIEVEMENTS
                </Text>
                <Text className="text-white text-xl font-black">
                  Your Badges
                </Text>
              </View>
              <TouchableOpacity
                className="bg-orange-600/20 px-3.5 py-1.5 rounded-lg"
                onPress={() => router.push("/(tabs)/achievements")}
              >
                <Text className="text-orange-600 text-xs font-black">
                  {unlockedCount}/{totalCount}
                </Text>
              </TouchableOpacity>
            </View>

            {renderAchievementCategory(
              "Streaks & Days",
              groupedAchievements.streaks,
              "🔥"
            )}
            {renderAchievementCategory(
              "Competition",
              groupedAchievements.competition,
              "👑"
            )}
            {renderAchievementCategory(
              "Social",
              groupedAchievements.social,
              "🎯"
            )}

            <TouchableOpacity
              className="bg-white/[0.05] py-3 rounded-xl border border-white/[0.08] mt-2"
              onPress={() => router.push("/(tabs)/achievements")}
            >
              <Text className="text-white/70 text-sm font-bold text-center uppercase tracking-widest">
                View All
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4 gap-4">
          <TouchableOpacity
            className="bg-white/[0.03] rounded-2xl p-5  border border-white/[0.08]"
            onPress={() => router.push("/(screens)/editProfile")}
          >
            <View className="flex flex-row justify-between items-center">
              <Text className="text-white/80 font-bold uppercase tracking-widest text-sm">
                Edit Profile
              </Text>
              <MaterialIcons name="mode-edit" size={24} color="#999999" />
            </View>
          </TouchableOpacity>
          <LogoutButton />
        </View>
      </ScrollView>
    </View>
  );
}
