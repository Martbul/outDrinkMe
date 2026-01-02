import React, { useEffect, useRef } from "react";
import { ScrollView, View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {NestedScreenHeader} from "@/components/nestedScreenHeader";
import { getCoefInfo } from "@/utils/levels";
import { useApp } from "@/providers/AppProvider";

const coefficientTiers = [
  {
    range: "0 - 9",
    title: "SOBER SOUL",
    color: "#9CA3AF", // Gray
  },
  {
    range: "10 - 19",
    title: "FIRST SIP",
    color: "#60A5FA", // Blue
  },
  {
    range: "20 - 29",
    title: "TEMPTED",
    color: "#34D399", // Emerald
  },
  {
    range: "30 - 39",
    title: "INTOXICATED",
    color: "#FBBF24", // Amber
  },
  {
    range: "40 - 49",
    title: "UNHINGED",
    color: "#F97316", // Orange
  },
  {
    range: "50 - 59",
    title: "FALLEN",
    color: "#EF4444", // Red
  },
  {
    range: "60 - 69",
    title: "DROWNED IN SPIRITS",
    color: "#DC2626", // Darker Red
  },
  {
    range: "70 - 79",
    title: "WHISPERER OF WINE",
    color: "#B91C1C", // Crimson
  },
  {
    range: "80 - 89",
    title: "LIQUOR SHADE",
    color: "#991B1B", // Dark Crimson
  },
  {
    range: "90 - 100",
    title: "VOID DRINKER",
    color: "#7F1D1D", // Deep Maroon
  },
];

export default function CoeffInfoScreen() {
  const { userData, userStats } = useApp();
  const scrollViewRef = useRef<ScrollView>(null);

  const coefInfo = getCoefInfo(userData?.alcoholism_coefficient);
  const userScore = coefInfo?.coef || 0;

  // Calculate active index (e.g., score 25 -> index 2). Cap at 9 for score 100.
  const activeTierIndex = Math.min(Math.floor(userScore / 10), 9);

  return (
    <View className="flex-1 bg-black">
      <NestedScreenHeader title="Tiers" eyebrow="POINTS" />
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-4 pb-4">
          <View className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.08]">
            <View className="flex-row items-center mb-2">
              <View className="w-12 h-12 rounded-full bg-orange-600/20 items-center justify-center mr-3">
                <MaterialCommunityIcons
                  name="chart-line"
                  size={24}
                  color="#EA580C"
                />
              </View>
              <View className="flex-1">
                <Text className="text-orange-600 text-[11px] font-bold tracking-widest">
                  POINTS
                </Text>
                <Text className="text-white text-2xl font-black">System</Text>
              </View>
            </View>
            <Text className="text-white/70 text-sm leading-6">
              Your coefficient score determines your rank. Climb from the bottom
              to the void.
            </Text>
          </View>
        </View>

        <View className="px-4 mb-6">
          <View className="mb-4 flex-row justify-between items-end">
            <View>
              <Text className="text-white/50 text-[11px] font-bold tracking-widest">
                TIER LIST
              </Text>
              <Text className="text-white text-xl font-black mt-1">
                Status Levels
              </Text>
            </View>
            <View className="bg-white/10 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">
                Current Score: {userScore}
              </Text>
            </View>
          </View>

          {coefficientTiers.map((tier, index) => {
            const isActive = index === activeTierIndex;

            return (
              <View
                key={index}
                className={`mb-3 rounded-2xl overflow-hidden border-l-4 ${
                  isActive ? "border-2" : "border"
                }`}
                style={{
                  borderLeftColor: tier.color,
                  // If active, use the tier color for the border, otherwise subtle white
                  borderColor: isActive ? tier.color : "rgba(255,255,255,0.05)",
                  // If active, tint the background slightly with the tier color
                  backgroundColor: isActive
                    ? `${tier.color}15`
                    : "rgba(255,255,255,0.03)",
                }}
              >
                <View className="p-4 flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    {/* Rank Number Circle */}
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-4"
                      style={{
                        backgroundColor: isActive
                          ? tier.color
                          : `${tier.color}15`,
                      }}
                    >
                      <Text
                        className="text-lg font-black"
                        style={{ color: isActive ? "black" : tier.color }}
                      >
                        {index + 1}
                      </Text>
                    </View>

                    {/* Text Container */}
                    <View className="flex-1">
                      {isActive && (
                        <View className="flex-row items-center mb-1">
                          <MaterialCommunityIcons
                            name="star-four-points"
                            size={12}
                            color={tier.color}
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            className="text-[10px] font-bold tracking-widest uppercase"
                            style={{ color: tier.color }}
                          >
                            Current Status
                          </Text>
                        </View>
                      )}

                      <Text
                        className="text-white text-lg font-black mb-0.5 uppercase"
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {tier.title}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-white/40 text-xs font-bold mr-2">
                          SCORE
                        </Text>
                        <View
                          className="px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: `${tier.color}20` }}
                        >
                          <Text
                            className="text-xs font-bold"
                            style={{ color: tier.color }}
                          >
                            {tier.range}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Checkmark for passed tiers or active tier */}
                  {index <= activeTierIndex && (
                    <MaterialCommunityIcons
                      name={
                        index === activeTierIndex
                          ? "map-marker"
                          : "check-circle"
                      }
                      size={20}
                      color={
                        index === activeTierIndex
                          ? tier.color
                          : "rgba(255,255,255,0.2)"
                      }
                    />
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View className="px-4 mb-8">
          <View className="bg-gradient-to-br from-orange-600/20 to-orange-600/5 rounded-2xl p-6 border-2 border-orange-600/30">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full bg-orange-600 items-center justify-center mr-3">
                <MaterialCommunityIcons
                  name="lightbulb-on"
                  size={20}
                  color="black"
                />
              </View>
              <Text className="text-orange-600 text-lg font-black">
                How to Progress
              </Text>
            </View>

            <View className="space-y-3">
              <View className="flex-row items-start">
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#EA580C"
                  style={{ marginRight: 12, marginTop: 2 }}
                />
                <Text className="text-white/70 text-sm flex-1 leading-6">
                  <Text className="text-white font-bold">Consistency:</Text>{" "}
                  Daily logging is the fastest way to increase your score.
                </Text>
              </View>

              <View className="flex-row items-start">
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#EA580C"
                  style={{ marginRight: 12, marginTop: 2 }}
                />
                <Text className="text-white/70 text-sm flex-1 leading-6">
                  <Text className="text-white font-bold">Streaks:</Text>{" "}
                  Dona&apos;t break the chain. Long streaks multiply your
                  points.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
