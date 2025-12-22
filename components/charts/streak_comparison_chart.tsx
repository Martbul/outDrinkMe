import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { apiService } from "@/api";

// --- Types ---
type TimeFilter = "1M" | "3M" | "6M" | "1Y" | "ALL";
interface DataPoint {
  value: number;
  date: string;
}
interface UserSeries {
  userId: string;
  username: string;
  color: string;
  data: DataPoint[];
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const FILTERS: { label: string; value: TimeFilter }[] = [
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "6M", value: "6M" },
  { label: "1Y", value: "1Y" },
  { label: "ALL", value: "ALL" },
];

export default function AlcoholCompetitionLeaderboard() {
  const { getToken } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<TimeFilter>("1M");
  const [isLoading, setIsLoading] = useState(true);
  const [rawSeries, setRawSeries] = useState<UserSeries[]>([]);
  const [visibleUserIds, setVisibleUserIds] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        if (!token) return;
        const data = await apiService.getAlcoholismChart(token, selectedFilter);
        if (isMounted) {
          const series = Array.isArray(data) ? data : [];
          setRawSeries(series);
          if (visibleUserIds.length === 0)
            setVisibleUserIds(series.map((u) => u.userId));
        }
      } catch (error) {
        console.error("Competition Load Error:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedFilter]);

  const competitionData = useMemo(() => {
    if (!rawSeries.length) return null;

    // 1. Determine Date Range for Header
    const now = new Date();
    let startDate = new Date();
    if (selectedFilter === "1M") startDate.setMonth(now.getMonth() - 1);
    else if (selectedFilter === "3M") startDate.setMonth(now.getMonth() - 3);
    else if (selectedFilter === "6M") startDate.setMonth(now.getMonth() - 6);
    else if (selectedFilter === "1Y")
      startDate.setFullYear(now.getFullYear() - 1);
    else {
      const allTs = rawSeries.flatMap((u) =>
        u.data.map((d) => new Date(d.date).getTime())
      );
      startDate = new Date(Math.min(...allTs));
    }

    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "2-digit",
      });
    const rangeLabel = `${fmt(startDate)} — ${fmt(now)}`;

    // 2. Process Stats for each user
    const stats = rawSeries
      .map((user) => {
        const drinkDays = user.data.filter((d) => d.value > 0).length;
        const totalVolume = Math.round(
          user.data.reduce((sum, d) => sum + d.value, 0)
        );

        // Create a simplified "Activity Sparkline" (Heatmap)
        // We divide the selected period into 20 "chunks" to keep the UI clean
        const chunks = 20;
        const startTime = startDate.getTime();
        const endTime = now.getTime();
        const interval = (endTime - startTime) / chunks;

        const activityMap = Array.from({ length: chunks }).map((_, i) => {
          const chunkStart = startTime + i * interval;
          const chunkEnd = chunkStart + interval;
          const pointsInChunk = user.data.filter((d) => {
            const t = new Date(d.date).getTime();
            return t >= chunkStart && t < chunkEnd;
          });
          const chunkAvg = pointsInChunk.length
            ? pointsInChunk.reduce((s, p) => s + p.value, 0) /
              pointsInChunk.length
            : 0;
          return chunkAvg;
        });

        return {
          ...user,
          drinkDays,
          totalVolume,
          activityMap,
        };
      })
      .sort((a, b) => b.totalVolume - a.totalVolume); // Rank by Volume

    return { stats, rangeLabel };
  }, [rawSeries, selectedFilter]);

  const maxVolume = competitionData?.stats[0]?.totalVolume || 1;

  return (
    <View className="bg-zinc-900 rounded-3xl p-5 border border-white/10 mb-6 shadow-2xl">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-8">
        <View>
          <Text className="text-red-500 text-[10px] font-black tracking-[3px] uppercase mb-1">
            Weekly Battle
          </Text>
          <Text className="text-white text-2xl font-bold tracking-tight">
            Drink Race
          </Text>
        </View>
        <View className="items-end">
          <View className="bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <Text className="text-white/60 text-[9px] font-bold uppercase">
              {isLoading ? "..." : competitionData?.rangeLabel}
            </Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#EF4444" style={{ height: 200 }} />
      ) : (
        <View>
          {competitionData?.stats.map((user, index) => {
            const isVisible = visibleUserIds.includes(user.userId);
            const progress = (user.totalVolume / maxVolume) * 100;

            return (
              <TouchableOpacity
                key={user.userId}
                onPress={() =>
                  setVisibleUserIds((prev) =>
                    prev.includes(user.userId)
                      ? prev.filter((id) => id !== user.userId)
                      : [...prev, user.userId]
                  )
                }
                className="mb-6"
                style={{ opacity: isVisible ? 1 : 0.3 }}
              >
                {/* User Info Row */}
                <View className="flex-row justify-between items-end mb-2">
                  <View className="flex-row items-center">
                    <Text className="text-white/20 font-black text-xs mr-2">
                      #{index + 1}
                    </Text>
                    <Text className="text-white font-bold text-sm">
                      {user.username}
                    </Text>
                    {index === 0 && <Text className="ml-2">👑</Text>}
                  </View>
                  <View className="items-end">
                    <Text
                      style={{ color: user.color }}
                      className="font-black text-sm"
                    >
                      {user.totalVolume}
                    </Text>
                    <Text className="text-white/20 text-[8px] font-bold uppercase">
                      Volume Index
                    </Text>
                  </View>
                </View>

                {/* Progress Bar (The Race Track) */}
                <View className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-3">
                  <View
                    style={{
                      width: `${progress}%`,
                      backgroundColor: user.color,
                    }}
                    className="h-full rounded-full"
                  />
                </View>

                {/* Activity Pulse Map (Heatmap) */}
                <View className="flex-row justify-between">
                  {user.activityMap.map((intensity, i) => (
                    <View
                      key={i}
                      style={{
                        width: (SCREEN_WIDTH - 120) / 20,
                        height: 6,
                        backgroundColor:
                          intensity > 0 ? user.color : "rgba(255,255,255,0.05)",
                        borderRadius: 2,
                        opacity:
                          intensity > 0 ? Math.min(intensity / 50 + 0.3, 1) : 1,
                      }}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Filter Tabs */}
      <View className="flex-row bg-black/40 p-1 rounded-2xl border border-white/5 mt-4">
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            onPress={() => setSelectedFilter(f.value)}
            className={`flex-1 py-2 rounded-xl ${selectedFilter === f.value ? "bg-zinc-800" : ""}`}
          >
            <Text
              className={`text-center text-[10px] font-black ${selectedFilter === f.value ? "text-red-500" : "text-white/20"}`}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Legend */}
      <View className="mt-6 flex-row justify-between border-t border-white/5 pt-4">
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-white/20 mr-2" />
          <Text className="text-white/30 text-[9px] font-bold uppercase">
            Colored blocks = Drink Activity
          </Text>
        </View>
      </View>
    </View>
  );
}
