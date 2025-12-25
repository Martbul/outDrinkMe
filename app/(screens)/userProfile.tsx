import React, { useMemo, useState } from "react";
import ThisWeekGadget from "@/components/thisWeekGadget";
import { useApp } from "@/providers/AppProvider";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LogoutButton from "@/components/logoutButton";
import { useRouter } from "expo-router";
import { getLevelInfo } from "@/utils/levels";
import BackHeader from "@/components/backHeader";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { LevelsComponent } from "@/components/level";

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
  const {
    userData,
    userStats,
    achievements,
    userInventory,
    storeItems,
    isLoading,
    refreshAll,
  } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "achievements" | "inventory"
  >("overview");
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const levelInfo = getLevelInfo(userData?.xp);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

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

  const renderAchievementCategory = (title: string, achievements: any[]) => {
    if (achievements.length === 0) return null;

    return (
      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <Text className="text-white text-base font-bold">{title}</Text>
          <View className="ml-auto bg-orange-600/20 px-2.5 py-1 rounded-lg border border-orange-600/40">
            <Text className="text-orange-600 text-xs font-black">
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
                <View className="absolute top-1.5 right-1.5 bg-orange-600 rounded-full w-5 h-5 items-center justify-center border-2 border-black">
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderOverviewTab = () => (
    <>
      {/* Stats Grid */}
      <View className="px-4 mb-4">
        <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
          <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-4">
            YOUR STATISTICS
          </Text>
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1 bg-black/20 rounded-xl p-4 items-center">
              <Text className="text-orange-600 text-3xl font-black mt-2 mb-1">
                {userStats?.current_streak || 0}
              </Text>
              <Text className="text-white/50 text-[10px] font-bold tracking-widest uppercase">
                Current Streak
              </Text>
            </View>
            <View className="flex-1 bg-black/20 rounded-xl p-4 items-center">
              <Text className="text-white text-3xl font-black mt-2 mb-1">
                {userStats?.longest_streak || 0}
              </Text>
              <Text className="text-white/50 text-[10px] font-bold tracking-widest uppercase">
                Best Streak
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-black/20 rounded-xl p-4 items-center">
              <Text className="text-white text-3xl font-black mt-2 mb-1">
                {userStats?.total_days_drank || 0}
              </Text>
              <Text className="text-white/50 text-[10px] font-bold tracking-widest uppercase">
                Total Days
              </Text>
            </View>
            <View className="flex-1 bg-black/20 rounded-xl p-4 items-center">
              <Text className="text-white text-3xl font-black mt-2 mb-1">
                #{userStats?.rank || 0}
              </Text>
              <Text className="text-white/50 text-[10px] font-bold tracking-widest uppercase">
                World Rank
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* This Week Widget */}
      <View className="px-4 mb-4">
        <ThisWeekGadget />
      </View>

      {/* Level Progress */}
      <View className="px-4 mb-4">
        <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
          <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-4">
            LEVEL PROGRESS
          </Text>
          <LevelsComponent
            currentLevel={levelInfo.level}
            currentXP={levelInfo.currentLevelProgress}
            xpForNextLevel={
              levelInfo.nextLevelStartXp - levelInfo.currentLevelStartXp
            }
            totalXP={levelInfo.totalXp}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-4 mb-4">
        <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
          <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-4">
            QUICK ACTIONS
          </Text>

          <TouchableOpacity
            className="bg-black/20 rounded-xl p-4 mb-3"
            onPress={() => router.push("/(screens)/editProfile")}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-orange-600/20 p-2.5 rounded-xl mr-3">
                  <MaterialIcons name="mode-edit" size={20} color="#EA580C" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-black mb-1">
                    Edit Profile
                  </Text>
                  <Text className="text-white/50 text-xs font-semibold">
                    Update your information
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-black/20 rounded-xl p-4"
            onPress={() => router.push("/(screens)/store")}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-orange-600/20 p-2.5 rounded-xl mr-3">
                  <MaterialCommunityIcons
                    name="store"
                    size={20}
                    color="#EA580C"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-black mb-1">
                    Visit Store
                  </Text>
                  <Text className="text-white/50 text-xs font-semibold">
                    {userData?.gems || 0} gems available
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4 mb-4">
        <LogoutButton />
      </View>
    </>
  );

  const renderAchievementsTab = () => (
    <View className="px-4 mb-4">
      <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
        <View className="flex-row justify-between items-center mb-5">
          <View>
            <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
              ACHIEVEMENTS
            </Text>
            <Text className="text-white text-xl font-black">Your Badges</Text>
          </View>
          <View className="bg-orange-600 px-4 py-2 rounded-xl">
            <Text className="text-black text-xs font-black">
              {unlockedCount}/{totalCount}
            </Text>
          </View>
        </View>

        {renderAchievementCategory(
          "Streaks & Days",
          groupedAchievements.streaks
        )}
        {renderAchievementCategory(
          "Competition",
          groupedAchievements.competition
        )}
        {renderAchievementCategory("Social", groupedAchievements.social)}

        <TouchableOpacity
          className="bg-white/[0.05] py-3 rounded-xl border border-white/[0.08] mt-2"
          onPress={() => router.push("/(screens)/achievements")}
          activeOpacity={0.7}
        >
          <Text className="text-white/70 text-sm font-bold text-center uppercase tracking-widest">
            View All Achievements
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Replace the renderInventoryTab function with this enhanced version

  const renderInventoryTab = () => {
    // Calculate total quantities
    const totalFlags =
      userInventory?.flag?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const totalSmoking =
      userInventory?.smoking?.reduce((sum, item) => sum + item.quantity, 0) ||
      0;

    return (
      <View className="px-4 mb-4">
        <View className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.08] mb-4">
          <View className="flex-row justify-between items-center mb-5">
            <View>
              <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
                SEXUALITY
              </Text>
              <Text className="text-white text-2xl font-black">Flags</Text>
            </View>
            <View className="bg-orange-600 rounded-xl px-4 py-2.5 items-center">
              <Text className="text-xs font-bold text-white/70 mb-0.5">
                TOTAL
              </Text>
              <Text className="text-black text-xl font-black">
                {totalFlags}
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16, paddingVertical: 8 }}
          >
            {userInventory?.flag && userInventory.flag.length > 0 ? (
              <>
                {userInventory.flag.map((item: any) => {
                  const storeItem = storeItems?.flag?.find(
                    (si: any) => si.id === item.item_id
                  );

                  return (
                    <TouchableOpacity
                      key={item.id}
                      className={`bg-black/30 rounded-2xl p-4 mr-4 items-center border-2 ${
                        item.is_equipped
                          ? "border-orange-600"
                          : "border-white/10"
                      }`}
                      style={{ width: 160, height: 210 }}
                      activeOpacity={0.7}
                    >
                      <View className="flex-1 items-center justify-center ">
                        {storeItem?.image_url ? (
                          <Image
                            source={{ uri: storeItem.image_url }}
                            style={{ width: 120, height: 80 }}
                            resizeMode="stretch"
                          />
                        ) : (
                          <View className="w-24 h-24 bg-orange-600/20 rounded-2xl items-center justify-center">
                            <MaterialCommunityIcons
                              name="flag"
                              size={40}
                              color="#EA580C"
                            />
                          </View>
                        )}
                      </View>

                      <View className="w-full">
                        <Text
                          className="text-white text-md font-black text-center mb-2"
                          numberOfLines={2}
                        >
                          {storeItem?.name || "Flag"}
                        </Text>

                        <View className="bg-orange-600/20 rounded-lg py-1.5 px-2">
                          <Text className="text-orange-600 text-md font-bold text-center">
                            {"x"}
                            {item.quantity}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* Get More Button */}
                <TouchableOpacity
                  className="bg-orange-600/20 rounded-2xl p-4 items-center justify-center border-2 border-orange-600/40"
                  style={{ width: 140, height: 210 }}
                  activeOpacity={0.7}
                  onPress={() => router.push("/(screens)/store")}
                >
                  <Ionicons name="add-circle" size={48} color="#EA580C" />
                  <Text className="text-orange-600 text-sm font-black mt-3 text-center">
                    GET MORE{"\n"}FLAGS
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View className="flex-1 items-center justify-center py-8">
                <MaterialCommunityIcons
                  name="flag-outline"
                  size={56}
                  color="#666"
                />
                <Text className="text-white/50 text-base font-semibold mt-4 mb-5">
                  No flags owned yet
                </Text>
                <TouchableOpacity
                  className="bg-orange-600 px-6 py-3 rounded-xl"
                  activeOpacity={0.7}
                  onPress={() => router.push("/(screens)/store")}
                >
                  <Text className="text-black text-sm font-black">
                    VISIT STORE
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Owned Smoking Devices Section - Enhanced */}
        <View className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.08] mb-4">
          <View className="flex-row justify-between items-center mb-5">
            <View>
              <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
                SMOKING
              </Text>
              <Text className="text-white text-2xl font-black">Devices</Text>
            </View>
            <View className="bg-orange-600 rounded-xl px-4 py-2.5 items-center">
              <Text className="text-xs font-bold text-white/70 mb-0.5">
                TOTAL
              </Text>
              <Text className="text-black text-xl font-black">
                {totalSmoking}
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16, paddingVertical: 8 }}
          >
            {userInventory?.smoking && userInventory.smoking.length > 0 ? (
              <>
                {userInventory.smoking.map((item: any) => {
                  const storeItem = storeItems?.smoking?.find(
                    (si: any) => si.id === item.item_id
                  );

                  return (
                    <TouchableOpacity
                      key={item.id}
                      className={`bg-black/30 rounded-2xl p-4 mr-4 items-center border-2 ${
                        item.is_equipped
                          ? "border-orange-600"
                          : "border-white/10"
                      }`}
                      style={{ width: 160, height: 210 }}
                      activeOpacity={0.7}
                    >
                      

                     
                      {/* Item Image */}
                      <View className="flex-1 items-center justify-center">
                        {storeItem?.image_url ? (
                          <Image
                            source={{ uri: storeItem.image_url }}
                            style={{ width: 80, height: 80 }}
                            resizeMode="contain"
                          />
                        ) : (
                          <View className="w-24 h-24 bg-orange-600/20 rounded-2xl items-center justify-center">
                            <MaterialCommunityIcons
                              name="smoking"
                              size={40}
                              color="#EA580C"
                            />
                          </View>
                        )}
                      </View>

                      {/* Item Name and Quantity Info */}
                      <View className="w-full">
                        <Text
                          className="text-white text-md font-black text-center mb-2"
                          numberOfLines={2}
                        >
                          {storeItem?.name || "Device"}
                        </Text>

                        {/* Quantity Text */}
                      <View className="bg-orange-600/20 rounded-lg py-1.5 px-2">
                          <Text className="text-orange-600 text-md font-bold text-center">
                            {"x"}
                            {item.quantity}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* Get More Button */}
                <TouchableOpacity
                  className="bg-orange-600/20 rounded-2xl p-4 items-center justify-center border-2 border-orange-600/40"
                  style={{ width: 140, height: 210 }}
                  activeOpacity={0.7}
                  onPress={() => router.push("/(screens)/store")}
                >
                  <Ionicons name="add-circle" size={48} color="#EA580C" />
                  <Text className="text-orange-600 text-sm font-black mt-3 text-center">
                    GET MORE{"\n"}DEVICES
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View className="flex-1 items-center justify-center py-8">
                <MaterialCommunityIcons
                  name="smoking-off"
                  size={56}
                  color="#666"
                />
                <Text className="text-white/50 text-base font-semibold mt-4 mb-5">
                  No smoking devices owned yet
                </Text>
                <TouchableOpacity
                  className="bg-orange-600 px-6 py-3 rounded-xl"
                  activeOpacity={0.7}
                  onPress={() => router.push("/(screens)/store")}
                >
                  <Text className="text-black text-sm font-black">
                    VISIT STORE
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EA580C"
            colors={["#EA580C"]}
                        progressBackgroundColor="#000000"

          />
        }
      >
        <BackHeader className="top-16" />

        {/* Profile Header */}
        <View
          className="items-center pb-4 px-4"
          style={{ paddingTop: insets.top + 16 }}
        >
          {/* Avatar with Level */}
          <View className="relative mb-4">
            <View className="w-32 h-32 rounded-full bg-orange-600/20 items-center justify-center border-4 border-orange-600/50">
              <Image
                source={{ uri: userData?.imageUrl }}
                className="w-full h-full rounded-full"
                style={{ width: 128, height: 128 }}
              />
            </View>
            {/* Level Badge */}
            <View className="absolute -bottom-2 left-1/2 -ml-10 bg-black px-4 py-1.5 rounded-full border-2 border-orange-600">
              <Text className="text-orange-600 text-sm font-black tracking-wider">
                LV. {levelInfo.level}
              </Text>
            </View>
          </View>

          <Text className="text-white text-2xl font-black mb-1">
            {`${userData?.firstName} ${userData?.lastName}`}
          </Text>

          <Text className="text-white/50 text-sm font-semibold mb-3">
            {userData?.email}
          </Text>

          {/* Gems & XP Row */}
          <View className="flex-row gap-2">
            <View className="bg-white/[0.03] rounded-xl px-3 py-2 border border-white/[0.08]">
              <View className="flex-row items-center">
                <Ionicons name="diamond" size={16} color="#EA580C" />

                <Text className="text-orange-600 text-sm font-black ml-1">
                  {userData?.gems || 0}
                </Text>
              </View>
            </View>

            <View className="bg-white/[0.03] rounded-xl px-3 py-2 border border-white/[0.08]">
              <View className="flex-row items-center">
                <Feather name="star" size={16} color="#EA580C" />

                <Text className="text-orange-600 text-sm font-black ml-1">
                  {levelInfo.totalXp} XP
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="px-4 mb-4">
          <View className="bg-white/[0.03] rounded-2xl p-2 border border-white/[0.08]">
            <View className="flex-row gap-2">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl ${
                  selectedTab === "overview"
                    ? "bg-orange-600"
                    : "bg-transparent"
                }`}
                onPress={() => setSelectedTab("overview")}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-center text-sm font-black ${
                    selectedTab === "overview" ? "text-black" : "text-white/50"
                  }`}
                >
                  Overview
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl ${
                  selectedTab === "achievements"
                    ? "bg-orange-600"
                    : "bg-transparent"
                }`}
                onPress={() => setSelectedTab("achievements")}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-center text-sm font-black ${
                    selectedTab === "achievements"
                      ? "text-black"
                      : "text-white/50"
                  }`}
                >
                  Achievements
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl ${
                  selectedTab === "inventory"
                    ? "bg-orange-600"
                    : "bg-transparent"
                }`}
                onPress={() => setSelectedTab("inventory")}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-center text-sm font-black ${
                    selectedTab === "inventory" ? "text-black" : "text-white/50"
                  }`}
                >
                  Inventory
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tab Content */}
        {selectedTab === "overview" && renderOverviewTab()}
        {selectedTab === "achievements" && renderAchievementsTab()}
        {selectedTab === "inventory" && renderInventoryTab()}
      </ScrollView>
    </View>
  );
}
