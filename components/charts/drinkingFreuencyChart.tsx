import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";

const SCREEN_WIDTH = Dimensions.get("window").width;

// --- MOCK CALENDAR DATA (ISO Dates of drinking events) ---
const MOCK_DRINKING_DAYS = [
  "2023-11-01", "2023-11-03", "2023-11-04", // Wed, Fri, Sat
  "2023-11-10", "2023-11-11",             // Fri, Sat
  "2023-11-17", "2023-11-18", "2023-11-19", // Fri, Sat, Sun
  "2023-11-24", "2023-11-25",             // Fri, Sat
  "2023-12-01", "2023-12-02"              // Fri, Sat
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DrinkingFrequencyChart() {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Transform Calendar Dates into "Frequency per Day of Week"
  const chartData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0]; // Sun - Sat
    
    MOCK_DRINKING_DAYS.forEach(dateStr => {
      const dayIndex = new Date(dateStr).getDay();
      counts[dayIndex]++;
    });

    const maxCount = Math.max(...counts);

    return counts.map((count, index) => {
      // Logic: Higher frequency = Hotter color
      let color = "#334155"; // Default Slate
      if (count > 0) color = "#6366f1"; // Indigo
      if (count > maxCount * 0.7) color = "#f43f5e"; // Rose (High Risk)

      return {
        value: count,
        label: DAYS_OF_WEEK[index],
        frontColor: color,
        gradientColor: count > maxCount * 0.7 ? "#fb7185" : "#818cf8",
        topLabelComponent: () => (
          <Text className="text-[10px] text-white/50 font-bold mb-1">{count}x</Text>
        ),
      };
    });
  }, []);

  return (
    <View className="bg-[#0F172A] rounded-3xl p-6 border border-white/[0.08] w-full">
      {/* Header */}
      <View className="mb-8">
        <Text className="text-rose-500 text-[11px] font-bold tracking-widest mb-1 uppercase">
          Pattern Analysis
        </Text>
        <Text className="text-white text-2xl font-black">
          High-Risk Days
        </Text>
        <Text className="text-white/40 text-xs mt-1">
          Frequency of drinking events mapped by weekday.
        </Text>
      </View>

      {/* Bar Chart */}
      <View className="items-center justify-center -ml-4">
        <BarChart
          data={chartData}
          barWidth={32}
          spacing={16}
          roundedTop
          roundedBottom
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisLabelWidth={0}
          height={160}
          noOfSections={3}
          showGradient
          isAnimated
          animationDuration={800}
          onPress={(item: any) => setSelectedDay(`${item.label}: ${item.value} times`)}
          renderTooltip={(item: any) => (
             <View className="bg-white px-2 py-1 rounded-md mb-2">
                <Text className="text-black text-[10px] font-bold">{item.value} Events</Text>
             </View>
          )}
        />
      </View>

      {/* Pattern Insight Card */}
      <View className="mt-8 bg-white/5 rounded-2xl p-4 border border-white/5">
        <View className="flex-row items-center mb-2">
          <View className="w-2 h-2 rounded-full bg-rose-500 mr-2" />
          <Text className="text-white font-bold text-sm">Key Insight</Text>
        </View>
        <Text className="text-white/60 text-xs leading-5">
          Your drinking frequency is <Text className="text-rose-400 font-bold">85% higher</Text> on Fridays and Saturdays compared to weekdays. Social triggers are your primary driver.
        </Text>
      </View>

      {/* Legend / X-Axis Footer */}
      <View className="flex-row justify-between mt-4 px-2">
        {DAYS_OF_WEEK.map((day, i) => (
          <Text key={i} className="text-white/30 text-[10px] font-bold w-[32px] text-center">
            {day}
          </Text>
        ))}
      </View>
    </View>
  );
}