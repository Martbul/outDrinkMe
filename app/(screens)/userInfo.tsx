import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { apiService } from "@/api";
import { useAuth } from "@clerk/clerk-expo";
import { Achievement, UserData, UserStats } from "@/types/api.types";
import { getLevelInfo2 } from "@/utils/levels";
import SecondaryHeader from "@/components/secondaryHeader";

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

const UserInfoScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId: rawUserId } = useLocalSearchParams();
  const { getToken, isSignedIn } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[] | []>([]);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    const friendDiscoveryId = Array.isArray(rawUserId)
      ? rawUserId[0]
      : rawUserId;

    if (!friendDiscoveryId) return;

    const loadData = async () => {
      setIsLoading(true);

      try {
        const token = await getToken();
        if (!token) return; //!TODO: Add error handling like appDataProvider

        const response = await apiService.getFriendDiscoveryDisplayProfile(
          friendDiscoveryId,
          token
        );

        setUserData(response.user);
        setUserStats(response.stats);
        setAchievements(response.achievements);
        setIsFriend(response.is_friend);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }

      setIsLoading(false);
    };

    loadData();
  }, [rawUserId]);

  const levelInfo = getLevelInfo2(userStats);

  // Group achievements by category
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
  const handleFriendAction = () => {
    // Add friend logic
    setIsFriend(!isFriend);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#EA580C" />
        <Text className="text-white/50 text-sm mt-4">Loading profile...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 pb-4 border-b border-white/[0.08]"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <FontAwesome5 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Profile</Text>
        <View className="w-10" />
      </View>
      <SecondaryHeader title="Profile" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View className="items-center pt-8 pb-6 px-4">
          {/* Avatar with Level & Coef Badge */}
          <View className="relative mb-4">
            <View className="w-32 h-32 rounded-full bg-orange-600 items-center justify-center border-4 border-black">
              {userData?.imageUrl ? (
                <Image
                  source={{ uri: userData.imageUrl }}
                  className="w-full h-full rounded-full"
                />
              ) : (
                <Text className="text-black text-5xl font-black">
                  {userData?.username?.[0]?.toUpperCase()}
                </Text>
              )}
            </View>

            {/* Level Badge - Bottom Left */}
            <View className="absolute -bottom-2 -left-2 bg-gray-900 px-3 py-1 rounded-full border-2 border-orange-600">
              <Text className="text-orange-600 text-xs font-black">
                LV. {levelInfo.level}
              </Text>
            </View>

            {/* Coef Badge - Bottom Right */}
            <View className="absolute -bottom-2 -right-2 bg-gray-900 px-3 py-1 rounded-full border-2 border-purple-600">
              <Text className="text-purple-400 text-xs font-black">
                {levelInfo.coef}%
              </Text>
            </View>
          </View>

          {/* Name & Username */}
          <Text className="text-white text-2xl font-black mb-1">
            {userData?.firstName} {userData?.lastName}
          </Text>
          <Text className="text-white/50 text-base mb-4">
            @{userData?.username}
          </Text>

          {/* Action Button */}
          <TouchableOpacity
            className={`px-8 py-3 rounded-xl ${
              isFriend
                ? "bg-white/[0.03] border border-white/[0.08]"
                : "bg-orange-600"
            }`}
            onPress={handleFriendAction}
          >
            <Text
              className={`font-black uppercase tracking-widest text-sm ${
                isFriend ? "text-white" : "text-black"
              }`}
            >
              {isFriend ? "Remove Friend" : "Add Friend"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Streak Section */}
        <View className="px-4 mb-4">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white/50 text-[11px] font-bold tracking-[1.5px] mb-2">
                  CURRENT STREAK
                </Text>
                <Text className="text-white text-[32px] font-black">
                  {userStats?.current_streak || 0} Days 🔥
                </Text>
              </View>
              {userStats && userStats.current_streak > 0 && (
                <View className="bg-orange-600/20 px-3.5 py-1.5 rounded-lg">
                  <Text className="text-orange-600 text-[11px] font-black tracking-wide">
                    ACTIVE
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* This Week Progress */}
        <View className="px-4 mb-4">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <Text className="text-white/50 text-[11px] font-bold tracking-[1.5px] mb-3">
              THIS WEEK
            </Text>
            <View className="flex-row justify-between mb-2">
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <View
                  key={day}
                  className={`w-10 h-10 rounded-lg items-center justify-center ${
                    day < (userStats?.days_this_week || 0)
                      ? "bg-orange-600"
                      : "bg-white/[0.05]"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      day < (userStats?.days_this_week || 0)
                        ? "text-black"
                        : "text-white/30"
                    }`}
                  >
                    {["M", "T", "W", "T", "F", "S", "S"][day]}
                  </Text>
                </View>
              ))}
            </View>
            <Text className="text-white text-lg font-bold mt-2">
              {userStats?.days_this_week || 0}/7 days
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="px-4 mb-4">
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1 bg-white/[0.03] rounded-xl p-4 border border-white/[0.08]">
              <Text className="text-white/50 text-[10px] font-bold tracking-[1.5px] mb-1.5">
                RANK
              </Text>
              <Text className="text-white text-2xl font-black">
                #{userStats?.rank || 0}
              </Text>
            </View>

            <View className="flex-1 bg-white/[0.03] rounded-xl p-4 border border-white/[0.08]">
              <Text className="text-white/50 text-[10px] font-bold tracking-[1.5px] mb-1.5">
                TOTAL
              </Text>
              <Text className="text-white text-2xl font-black">
                {userStats?.total_days_drank || 0}
              </Text>
              <Text className="text-white/40 text-[11px] font-semibold mt-0.5">
                days
              </Text>
            </View>

            <View className="flex-1 bg-white/[0.03] rounded-xl p-4 border border-white/[0.08]">
              <Text className="text-white/50 text-[10px] font-bold tracking-[1.5px] mb-1.5">
                WINS
              </Text>
              <Text className="text-white text-2xl font-black">
                {userStats?.total_weeks_won || 0}
              </Text>
              <Text className="text-white/40 text-[11px] font-semibold mt-0.5">
                weeks
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-white/[0.03] rounded-xl p-4 border border-white/[0.08]">
              <Text className="text-white/50 text-[10px] font-bold tracking-[1.5px] mb-1.5">
                BEST STREAK
              </Text>
              <Text className="text-white text-2xl font-black">
                {userStats?.longest_streak || 0}
              </Text>
              <Text className="text-white/40 text-[11px] font-semibold mt-0.5">
                days
              </Text>
            </View>

            <View className="flex-1 bg-white/[0.03] rounded-xl p-4 border border-white/[0.08]">
              <Text className="text-white/50 text-[10px] font-bold tracking-[1.5px] mb-1.5">
                FRIENDS
              </Text>
              <Text className="text-white text-2xl font-black">
                {userStats?.friends_count || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Additional Stats */}
        <View className="px-4 mb-4">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <Text className="text-white/50 text-[11px] font-bold tracking-[1.5px] mb-3">
              DETAILED STATS
            </Text>

            <View className="flex-row justify-between items-center py-3 border-b border-white/[0.05]">
              <Text className="text-white/50 text-[13px] font-semibold">
                This Month
              </Text>
              <Text className="text-white text-[15px] font-bold">
                {userStats?.days_this_month || 0} days
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-3 border-b border-white/[0.05]">
              <Text className="text-white/50 text-[13px] font-semibold">
                This Year
              </Text>
              <Text className="text-white text-[15px] font-bold">
                {userStats?.days_this_year || 0} days
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-3">
              <Text className="text-white/50 text-[13px] font-semibold">
                Achievements
              </Text>
              <Text className="text-white text-[15px] font-bold">
                {userStats?.achievements_count || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements Preview */}
        <View className="px-4 mb-6">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-1">
                  ACHIEVEMENTS
                </Text>
                <Text className="text-white text-xl font-black">
                  Badges Earned
                </Text>
              </View>
              <View className="bg-orange-600/20 px-3.5 py-1.5 rounded-lg">
                <Text className="text-orange-600 text-xs font-black">
                  {achievements.filter((a) => a.unlocked).length}/
                  {achievements.length}
                </Text>
              </View>
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
            )}{" "}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default UserInfoScreen;