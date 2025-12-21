import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";

const SCREEN_WIDTH = Dimensions.get("window").width;

// --- MOCK CALENDAR DATA ---
// Let's assume this is what you get from your DB: a list of dates the user drank.
const MOCK_DRINKING_DAYS = [
  "2023-10-01", "2023-10-05", "2023-10-06", "2023-10-12",
  "2023-10-13", "2023-10-14", "2023-10-20", "2023-10-27",
  "2023-10-28", "2023-11-02", "2023-11-03", "2023-11-10"
];

const generateConsistencyData = () => {
  const data = [];
  const today = new Date();
  
  // We'll calculate the "Dryness Score" for the last 30 days
  // Score = % of the last 7 days that were DRY.
  for (let i = 30; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Calculate rolling 7-day window
    let dryDaysInWindow = 0;
    for (let j = 0; j < 7; j++) {
      const checkDate = new Date(d);
      checkDate.setDate(d.getDate() - j);
      const checkStr = checkDate.toISOString().split('T')[0];
      if (!MOCK_DRINKING_DAYS.includes(checkStr)) {
        dryDaysInWindow++;
      }
    }

    const dryPercentage = Math.round((dryDaysInWindow / 7) * 100);

    data.push({
      value: dryPercentage,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      date: dateStr,
      // Color the point based on health: Green if high consistency, Red if low
      dataPointColor: dryPercentage > 70 ? "#10B981" : "#EF4444",
    });
  }
  return data;
};

export default function SobrietyTrendChart() {
  const chartData = useMemo(() => generateConsistencyData(), []);

  return (
    <View className="bg-[#0a0a0a] rounded-3xl p-5 border border-white/[0.08] mb-6 w-full">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-emerald-500 text-[11px] font-bold tracking-widest mb-1 uppercase">
          Lifestyle Stability
        </Text>
        <Text className="text-white text-xl font-black">
          Dry-Day Consistency
        </Text>
        <Text className="text-white/40 text-xs mt-1">
          Percentage of alcohol-free days in a rolling 7-day window.
        </Text>
      </View>

      <View className="justify-center -ml-4">
        <LineChart
          data={chartData}
          height={180}
          width={SCREEN_WIDTH - 80}
          initialSpacing={10}
          color="#10B981" // Emerald Green
          thickness={3}
          hideDataPoints={false}
          dataPointsHeight={4}
          dataPointsWidth={4}
          areaChart
          curved
          startFillColor="#10B981"
          endFillColor="#10B981"
          startOpacity={0.2}
          endOpacity={0.01}
          maxValue={100}
          noOfSections={4}
          yAxisThickness={0}
          xAxisColor="transparent"
          yAxisTextStyle={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}
          rulesColor="rgba(255,255,255,0.05)"
          pointerConfig={{
            pointerStripColor: "rgba(255,255,255,0.2)",
            pointerStripWidth: 2,
            pointerColor: "#10B981",
            radius: 4,
            pointerLabelWidth: 100,
            pointerLabelHeight: 90,
            activatePointersOnLongPress: false,
            pointerLabelComponent: (items: any) => (
              <View className="bg-neutral-900 p-2 rounded-lg border border-white/10 ml-[-40px]">
                <Text className="text-white/50 text-[9px] mb-1 font-bold">
                  {items[0].label}
                </Text>
                <Text className="text-white text-sm font-bold">
                  {items[0].value}% Dry
                </Text>
                <Text className="text-emerald-500 text-[9px]">
                  Consistency Score
                </Text>
              </View>
            ),
          }}
        />
      </View>

      {/* Summary Footer */}
      <View className="flex-row justify-between mt-6 pt-4 border-t border-white/5">
        <View>
          <Text className="text-white/40 text-[10px] uppercase font-bold">Current Streak</Text>
          <Text className="text-white text-lg font-black">4 Days</Text>
        </View>
        <View className="items-end">
          <Text className="text-white/40 text-[10px] uppercase font-bold">Monthly Average</Text>
          <Text className="text-emerald-500 text-lg font-black">82%</Text>
        </View>
      </View>
    </View>
  );
}