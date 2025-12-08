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
  date: string; // ISO string from API
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

  // Ref to track if component is mounted to prevent state updates on unmount
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

  const formattedConfig = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;

    const [myData, ...friendsData] = chartData;

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
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1 uppercase">
            Comparison
          </Text>
          <Text className="text-white text-xl font-black">
            Alcohol Coefficient
          </Text>
        </View>

        <View className="flex-row gap-2 flex-wrap justify-end max-w-[50%]">
          {chartData.map((u) => (
            <View key={u.userId} className="flex-row items-center ml-2 mb-1">
              <View
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: u.color }}
              />
              <Text
                className="text-white/40 text-[10px] font-bold"
                numberOfLines={1}
              >
                {u.username}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="justify-center -ml-2" style={{ height: CHART_HEIGHT }}>
        {isLoading ? (
          <View className="w-full h-full items-center justify-center">
            <ActivityIndicator color="#EA580C" />
          </View>
        ) : formattedConfig && formattedConfig.primaryData.length > 0 ? (
          <LineChart
            height={CHART_HEIGHT - 40}
            width={SCREEN_WIDTH - 90}
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
            pointerConfig={{
              pointerStripHeight: 160,
              pointerStripColor: "rgba(255, 255, 255, 0.2)",
              pointerStripWidth: 2,
              pointerColor: "#EA580C",
              radius: 6,
              pointerLabelWidth: 100,
              pointerLabelHeight: 90,
              activatePointersOnLongPress: true,
              autoAdjustPointerLabelPosition: false,
              pointerComponent: () => (
                <View className="bg-orange-600 h-3 w-3 rounded-full border-2 border-black" />
              ),
              showPointerStrip: true,
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

      {/* Filter Tabs */}
      <View className="flex-row justify-between bg-black/20 p-1 rounded-xl mt-2">
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
