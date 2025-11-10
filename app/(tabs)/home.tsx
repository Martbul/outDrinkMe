import { Header } from "@/components/header";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import { getCoefInfo } from "@/utils/levels";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import ThisWeekGadget from "@/components/thisWeekGadget";
import InfoTooltip from "@/components/infoTooltip";
import DrunkThought from "@/components/drunkThought";

export default function HomeScreen() {
  const [isCoefTooltipVisible, setIsCoefTooltipVisible] =
    useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { userStats, friendsDrunkThoughts, isLoading, refreshAll } = useApp();
  const coefInfo = getCoefInfo(userStats);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const displayedThoughts = useMemo(() => {
    if (!friendsDrunkThoughts || friendsDrunkThoughts.length === 0) {
      return [];
    }

    const count = Math.min(
      Math.floor(Math.random() * 2) + 1,
      friendsDrunkThoughts.length
    );

    const result = [];
    const usedIndices = new Set<number>();

    while (result.length < count) {
      const randomIndex = Math.floor(
        Math.random() * friendsDrunkThoughts.length
      );
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        result.push(friendsDrunkThoughts[randomIndex]);
      }
    }

    return result;
  }, [friendsDrunkThoughts]);

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

      {displayedThoughts.map((thought) => (
        <DrunkThought
          key={thought.id}
          thought={thought.thought}
          userImageUrl={thought.user_image_url}
        />
      ))}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 100 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EA580C"
            colors={["#EA580C"]}
          />
        }
      >
        <View className="items-center mb-6">
          <View className="relative w-[120px] h-[120px] rounded-full bg-orange-600/15 border-4 border-orange-600 justify-center items-center mb-3">
            <Text className="text-orange-600 text-5xl font-black">
              {coefInfo.coef}
            </Text>

            <TouchableOpacity
              onPress={() => setIsCoefTooltipVisible(!isCoefTooltipVisible)}
              className="absolute  w-8 h-8 rounded-full  items-center justify-center"
              style={{ zIndex: 10, right: -14, bottom: -10 }}
            >
              <Feather name="help-circle" size={24} color="#666666" />
            </TouchableOpacity>

            {isCoefTooltipVisible && (
              <InfoTooltip
                title="Coefficient"
                visible={isCoefTooltipVisible}
                description="Your drinking coefficient calculated from your drunk performance. Higher number means more fun nights!"
                onClose={() => setIsCoefTooltipVisible(false)}
                position="bottom"
              />
            )}
          </View>

          <Text className="text-white text-[22px] font-black tracking-wide">
            {coefInfo.title}
          </Text>
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

        <View className="flex-row gap-3  mb-4">
          <TouchableOpacity
            onPress={() => router.push("/(screens)/mixTimeline")}
            className="flex-1 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] items-center"
          >
            <AntDesign
              name="align-center"
              size={30}
              color="#EA580C"
              className="mb-2"
            />
            <Text className="text-white/50 text-[12px] font-bold tracking-widest uppercase">
              Mix Timeline
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(screens)/stats")}
            className="flex-1 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] items-center"
          >
            <MaterialIcons
              name="query-stats"
              size={30}
              color="#EA580C"
              className="mb-2"
            />
            <Text className="text-white/50 text-[12px] font-bold tracking-widest uppercase">
              Stats
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-3 mb-4">
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