import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";

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

// --- MOCK DATA GENERATOR ---
const generateMockData = (filter: TimeFilter): UserSeries[] => {
  const daysMap = { "1M": 30, "3M": 90, "6M": 180, "1Y": 365, ALL: 500 };
  const dataPointsCount = 12; // Keep it clean for visualization
  const daysToLookBack = daysMap[filter];
  
  const generateSeries = (name: string, userId: string, color: string, baseValue: number, variance: number): UserSeries => {
    const data: ChartDataPoint[] = [];
    const now = new Date();
    
    for (let i = dataPointsCount; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - (i * (daysToLookBack / dataPointsCount)));
      
      data.push({
        date: date.toISOString(),
        // Generate a somewhat realistic fluctuating value
        value: Math.max(10, Math.min(100, Math.floor(baseValue + (Math.random() - 0.5) * variance))),
      });
    }
    return { userId, username: name, color, data };
  };

  return [
    generateSeries("Me (Focus)", "1", "#8B5CF6", 75, 30), // Primary: Purple
    generateSeries("Avg. Peer", "2", "#94A3B8", 60, 15),  // Secondary: Slate
  ];
};

export default function FocusIntensityChart() {
  const [selectedFilter, setSelectedFilter] = useState<TimeFilter>("3M");
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<UserSeries[]>([]);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (isMounted.current) {
        const mocked = generateMockData(selectedFilter);
        setChartData(mocked);
        setIsLoading(false);
      }
    };
    loadData();
  }, [selectedFilter]);

  const dateRangeDisplay = useMemo(() => {
    if (!chartData.length || !chartData[0].data.length) return "";
    const allDates = chartData[0].data.map((d) => new Date(d.date).getTime()).sort((a, b) => a - b);
    const startDate = new Date(allDates[0]);
    const endDate = new Date(allDates[allDates.length - 1]);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${startDate.toLocaleDateString("en-US", opts)} - ${endDate.toLocaleDateString("en-US", opts)}, ${endDate.getFullYear()}`;
  }, [chartData]);

  const formattedConfig = useMemo(() => {
    if (!chartData.length) return null;
    const [myData, ...friendsData] = chartData;

    const primaryData = myData.data.map((pt) => ({
      value: pt.value,
      label: new Date(pt.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      labelTextStyle: { color: "rgba(255,255,255,0.3)", fontSize: 10 },
      hideDataPoint: true,
    }));

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
    <View className="bg-[#0F172A] rounded-3xl p-5 border border-white/[0.08] mb-6 w-full overflow-hidden">
      {/* Header */}
      <View className="mb-6 flex-row justify-between items-start">
        <View>
          <Text className="text-purple-500 text-[11px] font-bold tracking-widest mb-1 uppercase">
            Performance
          </Text>
          <Text className="text-white text-xl font-black">
            Focus Intensity
          </Text>
        </View>

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
            <ActivityIndicator color="#8B5CF6" />
          </View>
        ) : formattedConfig ? (
          <LineChart
            height={CHART_HEIGHT - 40}
            width={SCREEN_WIDTH - 80}
            data={formattedConfig.primaryData}
            dataSet={formattedConfig.secondaryDataSets}
            maxValue={100}
            noOfSections={4}
            yAxisThickness={0}
            yAxisTextStyle={{ color: "rgba(255, 255, 255, 0.3)", fontSize: 10, fontWeight: "600" }}
            yAxisLabelWidth={30}
            rulesColor="rgba(255, 255, 255, 0.05)"
            xAxisColor="transparent"
            xAxisLabelTextStyle={{ color: "rgba(255, 255, 255, 0.3)", fontSize: 10 }}
            thickness={3}
            color="#8B5CF6"
            curved
            isAnimated
            pointerConfig={{
              pointerStripHeight: 160,
              pointerStripColor: "rgba(255, 255, 255, 0.3)",
              pointerStripWidth: 2,
              pointerColor: "transparent",
              radius: 6,
              pointerLabelWidth: 120,
              pointerLabelHeight: 120,
              activatePointersOnLongPress: false,
              autoAdjustPointerLabelPosition: true,
              showPointerStrip: true,
              pointerLabelComponent: (items: any[]) => (
                <View className="bg-slate-900 p-3 rounded-xl border border-white/10 w-32 shadow-2xl ml-[-50px]">
                  <Text className="text-white/50 text-[10px] mb-2 font-bold text-center border-b border-white/10 pb-1">
                    {items[0]?.label}
                  </Text>
                  {chartData.map((user, index) => (
                    <View key={user.userId} className="flex-row items-center justify-between mb-1">
                      <View className="flex-row items-center flex-1 mr-2">
                        <View className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: user.color }} />
                        <Text className="text-white text-[10px] font-medium" numberOfLines={1}>{user.username}</Text>
                      </View>
                      <Text className="text-white font-bold text-[10px]">{items[index]?.value ?? 0}%</Text>
                    </View>
                  ))}
                </View>
              ),
            }}
            startFillColor="#8B5CF6"
            endFillColor="#8B5CF6"
            startOpacity={0.2}
            endOpacity={0.01}
            areaChart
          />
        ) : null}
      </View>

      {/* Legend */}
      <View className="flex-row flex-wrap justify-start gap-x-4 gap-y-2 mb-4 mt-2 px-1">
        {chartData.map((u) => (
          <View key={u.userId} className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: u.color }} />
            <Text className="text-white/60 text-[11px] font-semibold">{u.username}</Text>
          </View>
        ))}
      </View>

      {/* Filters */}
      <View className="flex-row justify-between bg-black/40 p-1 rounded-xl">
        {FILTERS.map((filter) => {
          const isActive = selectedFilter === filter.value;
          return (
            <TouchableOpacity
              key={filter.value}
              onPress={() => !isLoading && setSelectedFilter(filter.value)}
              className={`flex-1 items-center py-2 rounded-lg ${isActive ? "bg-white/[0.1]" : "bg-transparent"}`}
            >
              <Text className={`text-xs font-bold ${isActive ? "text-white" : "text-white/30"}`}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}