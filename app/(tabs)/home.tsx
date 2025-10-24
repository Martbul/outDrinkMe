import { Header } from "@/components/header";
import ThisWeekGadget from "@/components/thisWeekGadget";
import { useApp } from "@/providers/AppProvider";
import { getLevelInfo2 } from "@/utils/levels";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    userStats,
    isLoading,
  } = useApp();
  const router = useRouter();



  const levelInfo = getLevelInfo2(userStats);

  if (isLoading && !userStats) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#EA580C" />
        <Text className="text-white/50 text-sm mt-4">
          Loading your stats...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Header />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 100 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-6">
          <View className="w-[120px] h-[120px] rounded-full bg-orange-600/15 border-4 border-orange-600 justify-center items-center mb-3">
            <Text className="text-orange-600 text-5xl font-black">
              {levelInfo.coef}
            </Text>
          </View>
          <Text className="text-white text-[22px] font-black tracking-wide">
            {levelInfo.title}
          </Text>
          {/* <Text className="text-white/40 text-xs font-bold tracking-[2px] mt-1">
            Coef
          </Text> */}
        </View>

        <View className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/[0.08]">
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

        <ThisWeekGadget />

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-white/[0.03] rounded-xl p-4 border border-white/[0.08]">
            <Text className="text-white/50 text-[10px] font-bold tracking-[1.5px] mb-1.5">
              RANK
            </Text>
            <Text className="text-white text-2xl font-black">
              #{userStats?.rank || 0}
            </Text>
            {/* <Text className="text-white/40 text-[11px] font-semibold mt-0.5">
              of {leaderboard?.total_users || 0}
            </Text> */}
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

        {/* Additional Stats */}
        <View className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/[0.08]">
          <Text className="text-white/50 text-[11px] font-bold tracking-[1.5px] mb-2">
            YOUR STATS
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

          <View className="flex-row justify-between items-center py-3 border-b border-white/[0.05]">
            <Text className="text-white/50 text-[13px] font-semibold">
              Longest Streak
            </Text>
            <Text className="text-white text-[15px] font-bold">
              {userStats?.longest_streak || 0} days
            </Text>
          </View>

          <View className="flex-row justify-between items-center py-3 border-b border-white/[0.05]">
            <Text className="text-white/50 text-[13px] font-semibold">
              Achievements
            </Text>
            <Text className="text-white text-[15px] font-bold">
              {userStats?.achievements_count || 0}
            </Text>
          </View>

          <View className="flex-row justify-between items-center py-3">
            <Text className="text-white/50 text-[13px] font-semibold">
              Friends
            </Text>
            <Text className="text-white text-[15px] font-bold">
              {userStats?.friends_count || 0}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className={`rounded-2xl py-5 items-center mb-4 ${
            userStats?.today_status
              ? "bg-orange-600/50"
              : "bg-orange-600 shadow-lg shadow-orange-600/30"
          }`}
          onPress={() => router.push("/(tabs)/add")}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text className="text-black text-base font-black tracking-[1.5px]">
              {userStats?.today_status
                ? "CONGRATS MY ALCOHOLIC"
                : "DRINK TODAY"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
