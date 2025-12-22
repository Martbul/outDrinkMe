import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useAuth } from "@clerk/clerk-expo";
import { usePostHog } from "posthog-react-native";
import { apiService } from "@/api";

type TimeFilter = "1M" | "3M" | "6M" | "1Y" | "ALL";
interface DataPoint { value: number; date: string; }
interface UserSeries { userId: string; username: string; color: string; data: DataPoint[]; }

const SCREEN_WIDTH = Dimensions.get("window").width;
const FILTERS: { label: string; value: TimeFilter }[] = [
  { label: "1M", value: "1M" }, { label: "3M", value: "3M" },
  { label: "6M", value: "6M" }, { label: "1Y", value: "1Y" }, { label: "ALL", value: "ALL" },
];

const toVisualValue = (val: number) => Math.sqrt(Math.max(0, val)) * 10;

export default function AlcoholismChart() {
  const { getToken } = useAuth();

  const [selectedFilter, setSelectedFilter] = useState<TimeFilter>("3M");
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
          if (visibleUserIds.length === 0) setVisibleUserIds(series.map(u => u.userId));
        }
      } catch (error) {
        console.error("Chart error:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [selectedFilter]);

  const toggleUser = (userId: string) => {
    setVisibleUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const processedData = useMemo(() => {
    const activeSeries = rawSeries.filter(u => visibleUserIds.includes(u.userId));
    if (!activeSeries.length || !activeSeries[0].data.length) return null;

    const now = new Date();
    let startDate = new Date();
    let endDate = now;
    let stepDays = 1;

    if (selectedFilter === "1M") startDate.setMonth(now.getMonth() - 1);
    else if (selectedFilter === "3M") { startDate.setMonth(now.getMonth() - 3); stepDays = 2; }
    else if (selectedFilter === "6M") { startDate.setMonth(now.getMonth() - 6); stepDays = 5; }
    else if (selectedFilter === "1Y") { startDate.setFullYear(now.getFullYear() - 1); stepDays = 10; }
    else if (selectedFilter === "ALL") {
      const allT = rawSeries.flatMap(u => u.data.map(d => new Date(d.date).getTime()));
      startDate = new Date(Math.min(...allT));
      endDate = new Date(Math.max(...allT));
      stepDays = Math.max(1, Math.ceil(Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) / 25));
    }

    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dateRangeText = `${fmt(startDate)} — ${fmt(endDate)}`;

    const buckets: string[] = [];
    let current = new Date(startDate);
    while (current.getTime() <= endDate.getTime() + 1000) {
      buckets.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + stepDays);
    }

    const formatData = (user: UserSeries) => {
      return buckets.map((bucketDate, index) => {
        const bt = new Date(bucketDate).getTime();
        const pts = user.data.filter(d => {
          const t = new Date(d.date).getTime();
          return t >= bt && t < bt + stepDays * 86400000;
        });
        const avg = pts.length ? pts.reduce((s, p) => s + p.value, 0) / pts.length : 0;
        return {
          value: toVisualValue(avg),
          realValue: Math.round(avg),
          fullDate: new Date(bucketDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          index,
        };
      });
    };

    const primaryData = formatData(activeSeries[0]);
    const secondaryDataSets = activeSeries.slice(1).map(s => ({
      data: formatData(s),
      color: s.color,
      thickness: 3,
      curved: true,
      curvature: 0.15,
      hideDataPoints: true,
    }));

    return { 
      primaryData, 
      secondaryDataSets, 
      calculatedSpacing: (SCREEN_WIDTH - 110) / (buckets.length - 1 || 1), 
      dateRangeText,
      totalPoints: buckets.length,
      activeUsers: activeSeries
    };
  }, [rawSeries, selectedFilter, visibleUserIds]);


  return (
    <View className="bg-white/[0.03] rounded-3xl p-5 border border-white/10 mb-6 shadow-2xl">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="text-orange-500 text-[10px] font-black tracking-[2px] uppercase mb-1">
            HISTORY
          </Text>
          <Text className="text-white text-2xl font-bold tracking-tight">
            Alcohol Points
          </Text>
        </View>
        <View className="bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <Text className="text-white/80 text-[10px] font-bold">
            {isLoading ? "..." : processedData?.dateRangeText}
          </Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        {isLoading ? (
          <ActivityIndicator color="#EA580C" />
        ) : processedData ? (
          <LineChart
            areaChart
            curved
            curvature={0.15}
            data={processedData.primaryData}
            dataSet={processedData.secondaryDataSets}
            maxValue={100}
            noOfSections={4}
            yAxisLabelTexts={["0", "6", "25", "56", "100"]}
            height={180}
            width={SCREEN_WIDTH - 110}
            spacing={processedData.calculatedSpacing}
            initialSpacing={10}
            xAxisThickness={2}
            xAxisColor="rgba(255,255,255,0.15)"
            yAxisThickness={0}
            yAxisLabelWidth={30}
            color={processedData.activeUsers[0].color}
            thickness={3}
            startFillColor={processedData.activeUsers[0].color}
            endFillColor={processedData.activeUsers[0].color}
            startOpacity={0.1}
            endOpacity={0.01}
            hideDataPoints
            yAxisTextStyle={styles.axisText}
            rulesColor="rgba(255,255,255,0.02)"
            pointerConfig={{
              pointerStripColor: "rgba(255, 255, 255, 0.15)",
              pointerStripWidth: 2,
              pointerColor: "#EA580C",
              radius: 6,
              pointerLabelWidth: 160,
              pointerLabelHeight: 130,
              pointerLabelComponent: (items: any[]) => {
                const itemIndex = items[0]?.index;
                const visualValue = items[0]?.value; // visualValue goes 0 to 100
                const total = processedData.totalPoints;

                // Horizontal alignment logic
                const isNearStart = itemIndex < total * 0.25;
                const isNearEnd = itemIndex > total * 0.75;
                let marginLeft = isNearStart ? -15 : isNearEnd ? -145 : -80;
                let caretLeft = isNearStart ? 20 : isNearEnd ? 130 : 72;

                // VERTICAL ALIGNMENT FIX:
                // If the point is high (visualValue > 60), we flip the tooltip to show BELOW the finger
                const isHighValue = visualValue > 60;
                let topOffset = isHighValue ? 100 : -10; // Positive moves it down, negative moves it up

                return (
                  <View
                    style={[
                      styles.pointerContainer,
                      { marginLeft, marginTop: topOffset },
                    ]}
                  >
                    {/* Render Caret at top or bottom depending on position */}
                    {!isHighValue && (
                      <View style={styles.tooltipBox}>
                        <Text style={styles.tooltipDate}>
                          {items[0]?.fullDate}
                        </Text>
                        {processedData.activeUsers.map((user, idx) => (
                          <View key={user.userId} style={styles.tooltipRow}>
                            <View style={styles.tooltipUser}>
                              <View
                                style={[
                                  styles.dot,
                                  { backgroundColor: user.color },
                                ]}
                              />
                              <Text
                                style={styles.tooltipName}
                                numberOfLines={1}
                              >
                                {user.username}
                              </Text>
                            </View>
                            <Text style={styles.tooltipValue}>
                              {items[idx]?.realValue ?? 0}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {!isHighValue && (
                      <View
                        style={[styles.tooltipCaret, { left: caretLeft }]}
                      />
                    )}

                    {/* Flipped Tooltip for High Values */}
                    {isHighValue && (
                      <View
                        style={[
                          styles.tooltipCaretFlipped,
                          { left: caretLeft },
                        ]}
                      />
                    )}
                    {isHighValue && (
                      <View style={styles.tooltipBox}>
                        <Text style={styles.tooltipDate}>
                          {items[0]?.fullDate}
                        </Text>
                        {processedData.activeUsers.map((user, idx) => (
                          <View key={user.userId} style={styles.tooltipRow}>
                            <View style={styles.tooltipUser}>
                              <View
                                style={[
                                  styles.dot,
                                  { backgroundColor: user.color },
                                ]}
                              />
                              <Text
                                style={styles.tooltipName}
                                numberOfLines={1}
                              >
                                {user.username}
                              </Text>
                            </View>
                            <Text style={styles.tooltipValue}>
                              {items[idx]?.realValue ?? 0}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              },
            }}
          />
        ) : (
          <Text className="text-white/20 font-bold uppercase tracking-widest text-[10px]">
            Select users
          </Text>
        )}
      </View>

      {/* Legend */}
      <View className="flex-row flex-wrap gap-2 mt-4 mb-6">
        {rawSeries.map((u) => {
          const isVisible = visibleUserIds.includes(u.userId);
          return (
            <TouchableOpacity
              key={u.userId}
              onPress={() => toggleUser(u.userId)}
              style={[
                styles.legendItem,
                isVisible ? { borderColor: u.color + "60" } : { opacity: 0.3 },
              ]}
            >
              <View style={[styles.legendDot, { backgroundColor: u.color }]} />
              <Text style={styles.legendText}>{u.username}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Filters */}
      <View className="flex-row bg-black/40 p-1 rounded-2xl border border-white/5">
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            onPress={() => setSelectedFilter(f.value)}
            className={`flex-1 py-2.5 rounded-xl ${selectedFilter === f.value ? "bg-zinc-800" : ""}`}
          >
            <Text
              className={`text-center text-[10px] font-black ${selectedFilter === f.value ? "text-orange-500" : "text-white/20"}`}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartWrapper: { 
    height: 250, 
    justifyContent: "flex-end", // Push chart to bottom to give tooltip room at top
    alignItems: "center",
    paddingTop: 40, // Significant padding at the top for the tooltip "Safe Zone"
    paddingBottom: 10,
  },
  axisText: { color: "rgba(255,255,255,0.2)", fontSize: 9, fontWeight: "800" },
  pointerContainer: { width: 160, justifyContent: 'center', zIndex: 999 },
  tooltipBox: {
    backgroundColor: "#09090b",
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  tooltipCaret: {
    position: 'absolute',
    bottom: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#09090b',
  },
  tooltipCaretFlipped: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#09090b',
    marginBottom: -1,
  },
  tooltipDate: { color: "#f97316", fontSize: 9, fontWeight: "900", marginBottom: 8, textAlign: "center" },
  tooltipRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 3 },
  tooltipUser: { flexDirection: "row", alignItems: "center", flex: 1 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  tooltipName: { color: "white", fontSize: 11, fontWeight: "600" },
  tooltipValue: { color: "white", fontSize: 12, fontWeight: "800" },
  legendItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 11, fontWeight: "700", color: 'white' },
});