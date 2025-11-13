import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { Header } from "@/components/header";
import { useApp } from "@/providers/AppProvider";
import SecondaryHeader from "@/components/secondaryHeader";
import { CategoryRadarChart } from "@/components/radarChart";

export default function StatsPage() {
  const insets = useSafeAreaInsets();
  const {
    userStats,
    calendar,
    alcoholCollection,
    refreshAll,
    isInitialLoading,
  } = useApp();

  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "year" | "all_time"
  >("week");
  const [refreshing, setRefreshing] = useState(false);

  const periods = [
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
    { key: "year", label: "Year" },
    { key: "all_time", label: "All Time" },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const handlePeriodChange = (
    period: "week" | "month" | "year" | "all_time"
  ) => {
    setSelectedPeriod(period);
  };

  const getDaysStat = () => {
    if (!userStats) return null;

    switch (selectedPeriod) {
      case "week":
        return {
          period: "week" as const,
          days_drank: userStats.days_this_week,
          total_days: 7,
        };
      case "month":
        return {
          period: "month" as const,
          days_drank: userStats.days_this_month,
          total_days: 30,
        };
      case "year":
        return {
          period: "year" as const,
          days_drank: userStats.days_this_year,
          total_days: 365,
        };
      case "all_time":
        return {
          period: "all_time" as const,
          days_drank: userStats.total_days_drank,
          total_days: userStats.total_days_drank + 100, // Approximate total for progress bar
        };
      default:
        return null;
    }
  };

  const daysStat = getDaysStat();

 const radarChartData = Object.values(alcoholCollection || {}).flat();

  const calculateCollectionStats = () => {
    if (!alcoholCollection) {
      return {
        uniqueItems: 0,
        averageABV: 0,
        rarityBreakdown: { legendary: 0, epic: 0, rare: 0, common: 0 },
        typeBreakdown: {} as Record<string, number>,
      };
    }

    const allItems = Object.values(alcoholCollection).flat();
    const totalItems = allItems.length;
    const totalABV = allItems.reduce(
      (sum, item: any) => sum + (parseFloat(item.abv) || 0),
      0
    );

    return {
      uniqueItems: totalItems,
      averageABV: totalItems > 0 ? (totalABV / totalItems).toFixed(1) : "0",
      rarityBreakdown: {
        legendary: allItems.filter((i: any) => i.rarity === "Legendary").length,
        epic: allItems.filter((i: any) => i.rarity === "Epic").length,
        rare: allItems.filter((i: any) => i.rarity === "Rare").length,
        common: allItems.filter((i: any) => i.rarity === "Common").length,
      },
      typeBreakdown: Object.entries(alcoholCollection).reduce(
        (acc, [type, items]) => {
          acc[type] = items.length;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  };

  const collectionStats = calculateCollectionStats();

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "legendary":
        return "#d08700";
      case "epic":
        return "#6e11b0";
      case "rare":
        return "#193cb8";
      default:
        return "#9CA3AF";
    }
  };

  const totalRarity = Object.values(collectionStats.rarityBreakdown).reduce(
    (a, b) => a + b,
    0
  );
  const maxType = Math.max(...Object.values(collectionStats.typeBreakdown), 1);
  const nextMilestone = userStats
    ? Math.ceil(userStats.total_days_drank / 50) * 50
    : 50;

  if (isInitialLoading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#EA580C" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <SecondaryHeader title="Stats" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
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
        {/* Header */}
        <View className="px-4 pt-1 pb-4">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
              YOUR STATISTICS
            </Text>
            <Text className="text-white text-[28px] font-black">
              Collection Insights
            </Text>
          </View>
        </View>

        {/* Period Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-6 mb-4"
        >
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              onPress={() => handlePeriodChange(period.key as any)}
              className={`${
                selectedPeriod === period.key
                  ? "bg-orange-600"
                  : "bg-white/[0.03]"
              } px-5 py-3 rounded-xl mr-3 border ${
                selectedPeriod === period.key
                  ? "border-orange-600"
                  : "border-white/[0.08]"
              }`}
            >
              <Text
                className={`${
                  selectedPeriod === period.key ? "text-black" : "text-white"
                } text-sm font-bold`}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Main Stats Grid - Drinking Stats */}
        <View className="px-4 mb-4">
          <View className="flex-row flex-wrap">
            {/* Days Drank This Period */}
            <View className="w-1/2 p-2">
              <View className="bg-orange-600/10 rounded-2xl p-4 border border-orange-600/30">
                <FontAwesome5 name="glass-cheers" size={28} color="#EA580C" />
                <Text className="text-white text-3xl font-black mt-3">
                  {daysStat?.days_drank || 0}
                </Text>
                <Text className="text-white/50 text-xs font-bold mt-1">
                  DAYS DRANK
                </Text>
              </View>
            </View>

            {/* Current Streak */}
            <View className="w-1/2 p-2">
              <View className="bg-orange-600/10 rounded-2xl p-4 border border-orange-600/30">
                <FontAwesome5 name="fire" size={28} color="#EA580C" />
                <Text className="text-white text-3xl font-black mt-3">
                  {userStats?.current_streak || 0}
                </Text>
                <Text className="text-white/50 text-xs font-bold mt-1">
                  CURRENT STREAK
                </Text>
              </View>
            </View>

            {/* Longest Streak */}
            <View className="w-1/2 p-2">
              <View className="bg-orange-600/10 rounded-2xl p-4 border border-orange-600/30">
                <MaterialCommunityIcons
                  name="fire-circle"
                  size={28}
                  color="#EA580C"
                />
                <Text className="text-white text-3xl font-black mt-3">
                  {userStats?.longest_streak || 0}
                </Text>
                <Text className="text-white/50 text-xs font-bold mt-1">
                  LONGEST STREAK
                </Text>
              </View>
            </View>

            {/* Weeks Won */}
            <View className="w-1/2 p-2">
              <View className="bg-orange-600/10 rounded-2xl p-4 border border-orange-600/30">
                <FontAwesome5 name="trophy" size={28} color="#EA580C" />
                <Text className="text-white text-3xl font-black mt-3">
                  {userStats?.total_weeks_won || 0}
                </Text>
                <Text className="text-white/50 text-xs font-bold mt-1">
                  WEEKS WON
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Card */}
        {daysStat && (
          <View className="px-4 mb-4">
            <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
              <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-3">
                {selectedPeriod.toUpperCase()} PROGRESS
              </Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-white text-sm font-bold">
                  Days Active
                </Text>
                <Text className="text-orange-600 text-sm font-bold">
                  {daysStat.days_drank} / {daysStat.total_days}
                </Text>
              </View>
              <View className="h-3 bg-white/[0.05] rounded-full overflow-hidden">
                <View
                  className="h-full bg-orange-600 rounded-full"
                  style={{
                    width: `${(daysStat.days_drank / daysStat.total_days) * 100}%`,
                  }}
                />
              </View>
            </View>
          </View>
        )}
        {radarChartData.length > 0 && (
          <CategoryRadarChart data={radarChartData} size={320} />
        )}

        {/* Collection Stats Grid */}
        <View className="px-4 mb-4">
          <View className="flex-row flex-wrap">
            {/* Unique Items */}
            <View className="w-1/2 p-2">
              <View className="bg-orange-600/10 rounded-2xl p-4 border border-orange-600/30">
                <FontAwesome5 name="wine-bottle" size={28} color="#EA580C" />
                <Text className="text-white text-3xl font-black mt-3">
                  {collectionStats.uniqueItems}
                </Text>
                <Text className="text-white/50 text-xs font-bold mt-1">
                  COLLECTED
                </Text>
              </View>
            </View>

            {/* Average ABV */}
            <View className="w-1/2 p-2">
              <View className="bg-orange-600/10 rounded-2xl p-4 border border-orange-600/30">
                <MaterialCommunityIcons
                  name="percent"
                  size={28}
                  color="#EA580C"
                />
                <Text className="text-white text-3xl font-black mt-3">
                  {collectionStats.averageABV}%
                </Text>
                <Text className="text-white/50 text-xs font-bold mt-1">
                  AVG ABV
                </Text>
              </View>
            </View>

            {/* Friends */}
            <View className="w-1/2 p-2">
              <View className="bg-orange-600/10 rounded-2xl p-4 border border-orange-600/30">
                <FontAwesome5 name="user-friends" size={28} color="#EA580C" />
                <Text className="text-white text-3xl font-black mt-3">
                  {userStats?.friends_count || 0}
                </Text>
                <Text className="text-white/50 text-xs font-bold mt-1">
                  FRIENDS
                </Text>
              </View>
            </View>

            {/* Global Rank */}
            <View className="w-1/2 p-2">
              <View className="bg-orange-600/10 rounded-2xl p-4 border border-orange-600/30">
                <FontAwesome5 name="crown" size={28} color="#EA580C" />
                <Text className="text-white text-3xl font-black mt-3">
                  #{userStats?.rank || 0}
                </Text>
                <Text className="text-white/50 text-xs font-bold mt-1">
                  GLOBAL RANK
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rarity Distribution */}
        {totalRarity > 0 && (
          <View className="px-4 mb-4">
            <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
              <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-4">
                RARITY DISTRIBUTION
              </Text>

              {Object.entries(collectionStats.rarityBreakdown).map(
                ([rarity, count]) => {
                  const percentage =
                    totalRarity > 0 ? (count / totalRarity) * 100 : 0;
                  return (
                    <View key={rarity} className="mb-4">
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-white text-sm font-bold capitalize">
                          {rarity}
                        </Text>
                        <Text className="text-white/70 text-sm font-bold">
                          {count} ({percentage.toFixed(0)}%)
                        </Text>
                      </View>
                      <View className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getRarityColor(rarity),
                          }}
                        />
                      </View>
                    </View>
                  );
                }
              )}
            </View>
          </View>
        )}

        {/* Milestone Card */}
        {userStats && (
          <View className="px-4 mb-8">
            <View className="bg-orange-600/20 rounded-2xl p-5 border-2 border-orange-600/50">
              <View className="flex-row items-center mb-3">
                <View className="bg-orange-600 w-12 h-12 rounded-full items-center justify-center mr-3">
                  <FontAwesome5 name="trophy" size={24} color="black" />
                </View>
                <View className="flex-1">
                  <Text className="text-orange-600 text-xs font-bold tracking-widest">
                    NEXT MILESTONE
                  </Text>
                  <Text className="text-white text-xl font-black">
                    {nextMilestone} Days Drank
                  </Text>
                </View>
              </View>

              <View className="h-3 bg-black/30 rounded-full overflow-hidden">
                <View
                  className="h-full bg-orange-600 rounded-full"
                  style={{
                    width: `${(userStats.total_days_drank / nextMilestone) * 100}%`,
                  }}
                />
              </View>

              <Text className="text-white/70 text-xs font-semibold mt-2">
                {nextMilestone - userStats.total_days_drank} days to go!
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
