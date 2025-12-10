import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useAuth } from "@clerk/clerk-expo";
import { usePostHog } from "posthog-react-native";
import { apiService } from "@/api";

// Types
type TimeFilter = "1M" | "3M" | "6M" | "1Y" | "ALL";

interface ChartDataPoint {
  value: number;
  date: string; // ISO string
  label?: string;
}

interface UserSeries {
  userId: string;
  username: string;
  color: string;
  data: ChartDataPoint[];
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_HEIGHT = 250;

const FILTERS: { label: string; value: TimeFilter }[] = [
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "6M", value: "6M" },
  { label: "1Y", value: "1Y" },
  { label: "ALL", value: "ALL" },
];

export default function AlcoholismChart() {
  const { getToken } = useAuth();
  const posthog = usePostHog();

  const [selectedFilter, setSelectedFilter] = useState<TimeFilter>("3M");
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<UserSeries[]>([]);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!isMounted.current) return;
      setIsLoading(true);
      try {
        const token = await getToken();
        if (!token) return;

        const data = await apiService.getAlcoholismChart(token, selectedFilter);

        if (isMounted.current) {
          if (Array.isArray(data)) {
            setChartData(data);
          } else {
            setChartData([]);
          }
          posthog?.capture("alcoholism_chart_viewed", {
            period: selectedFilter,
          });
        }
      } catch (error: any) {
        if (isMounted.current) {
          console.error("Failed to load chart data:", error);
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };
    loadData();
  }, [selectedFilter]);

  // --- 1. Dynamic Date Range Calculation ---
  const dateRangeDisplay = useMemo(() => {
    if (!chartData || chartData.length === 0 || !chartData[0].data.length)
      return "";

    // Sort data to ensure we get the true start/end
    const allDates = chartData[0].data
      .map((d) => new Date(d.date).getTime())
      .sort((a, b) => a - b);

    if (allDates.length === 0) return "";

    const startDate = new Date(allDates[0]);
    const endDate = new Date(allDates[allDates.length - 1]);

    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${startDate.toLocaleDateString("en-US", opts)} - ${endDate.toLocaleDateString("en-US", opts)}, ${endDate.getFullYear()}`;
  }, [chartData]);

  const formattedConfig = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;

    const [myData, ...friendsData] = chartData;

    // We attach the date string to the `label` property of the primary data
    // so the Pointer can access it for the tooltip header.
    const primaryData =
      myData?.data.map((pt) => ({
        value: pt.value,
        label: new Date(pt.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        labelTextStyle: { color: "rgba(255,255,255,0.3)", fontSize: 10 },
        hideDataPoint: true,
      })) || [];

    const secondaryDataSets = friendsData.map((friend) => ({
      data: friend.data.map((pt) => ({ value: pt.value, hideDataPoint: true })),
      color: friend.color,
      thickness: 2,
      curved: true,
      strokeDashArray: [5, 5],
    }));

    return { primaryData, secondaryDataSets };
  }, [chartData]);

  return (
    <View className="bg-white/[0.03] rounded-3xl p-5 border border-white/[0.08] mb-6 w-full overflow-hidden">
      {/* Header */}
      <View className="mb-6 flex-row justify-between items-start">
        <View>
          <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1 uppercase">
            Comparison
          </Text>
          <Text className="text-white text-xl font-black">
            Alcohol Coefficient
          </Text>
        </View>

        {/* --- 2. Top Right Date Display --- */}
        {dateRangeDisplay ? (
          <View className="bg-white/10 px-3 py-1.5 rounded-lg">
            <Text className="text-white/80 text-[11px] font-bold">
              {dateRangeDisplay}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Chart */}
      <View className="justify-center -ml-2" style={{ height: CHART_HEIGHT }}>
        {isLoading ? (
          <View className="w-full h-full items-center justify-center">
            <ActivityIndicator color="#EA580C" />
          </View>
        ) : formattedConfig && formattedConfig.primaryData.length > 0 ? (
          <LineChart
            height={CHART_HEIGHT - 40}
            width={SCREEN_WIDTH - 60} // Adjusted to fit screen better
            data={formattedConfig.primaryData}
            dataSet={formattedConfig.secondaryDataSets}
            maxValue={100}
            minValue={0}
            noOfSections={4}
            yAxisThickness={0}
            yAxisTextStyle={{
              color: "rgba(255, 255, 255, 0.3)",
              fontSize: 10,
              fontWeight: "600",
            }}
            yAxisLabelWidth={35}
            rulesColor="rgba(255, 255, 255, 0.05)"
            rulesType="solid"
            xAxisColor="transparent"
            xAxisLabelTextStyle={{
              color: "rgba(255, 255, 255, 0.3)",
              fontSize: 10,
            }}
            thickness={3}
            color="#EA580C"
            curved
            isAnimated
            animationDuration={1000}
            // --- 3. Interactive Pointer Configuration ---
            pointerConfig={{
              pointerStripHeight: 160,
              pointerStripColor: "rgba(255, 255, 255, 0.3)",
              pointerStripWidth: 2,
              pointerColor: "transparent",
              radius: 6,
              pointerLabelWidth: 120,
              pointerLabelHeight: 120,
              // "false" makes it respond instantly to touch/drag (movable)
              activatePointersOnLongPress: false,
              autoAdjustPointerLabelPosition: true,
              showPointerStrip: true,
              // Custom Tooltip showing ALL users
              pointerLabelComponent: (items: any[]) => {
                return (
                  <View className="bg-neutral-900/95 p-3 rounded-xl border border-white/10 w-32 shadow-xl ml-[-50px]">
                    {/* Date Header in Tooltip */}
                    <Text className="text-white/50 text-[10px] mb-2 font-bold text-center border-b border-white/10 pb-1">
                      {items[0]?.label}
                    </Text>

                    {/* Loop through chartData to display every user */}
                    {chartData.map((user, index) => {
                      // Items array matches the order of datasets (0=primary, 1..n=secondary)
                      const itemValue = items[index]?.value ?? 0;
                      return (
                        <View
                          key={user.userId}
                          className="flex-row items-center justify-between mb-1"
                        >
                          <View className="flex-row items-center flex-1 mr-2">
                            <View
                              className="w-2 h-2 rounded-full mr-1.5"
                              style={{ backgroundColor: user.color }}
                            />
                            <Text
                              className="text-white text-[10px] font-medium"
                              numberOfLines={1}
                            >
                              {user.username}
                            </Text>
                          </View>
                          <Text className="text-white font-bold text-[10px]">
                            {itemValue}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                );
              },
            }}
            startFillColor="#EA580C"
            endFillColor="#EA580C"
            startOpacity={0.2}
            endOpacity={0.01}
            areaChart
          />
        ) : (
          <View className="items-center justify-center h-full">
            <Text className="text-white/30">
              No data available for this period
            </Text>
          </View>
        )}
      </View>

      {/* Legend below chart */}
      <View className="flex-row flex-wrap justify-start gap-x-4 gap-y-2 mb-4 mt-2 px-1">
        {chartData.map((u) => (
          <View key={u.userId} className="flex-row items-center">
            <View
              className="w-2.5 h-2.5 rounded-full mr-2"
              style={{ backgroundColor: u.color }}
            />
            <Text className="text-white/60 text-[11px] font-semibold">
              {u.username}
            </Text>
          </View>
        ))}
      </View>

      {/* Filters */}
      <View className="flex-row justify-between bg-black/20 p-1 rounded-xl">
        {FILTERS.map((filter) => {
          const isActive = selectedFilter === filter.value;
          return (
            <TouchableOpacity
              key={filter.value}
              onPress={() => {
                if (!isLoading && selectedFilter !== filter.value) {
                  setSelectedFilter(filter.value);
                }
              }}
              className={`flex-1 items-center py-2 rounded-lg ${
                isActive ? "bg-white/[0.1]" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  isActive ? "text-white" : "text-white/30"
                }`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
