import React from "react";
import { View, Text, ScrollView } from "react-native";

export default function AchievementsScreen() {
  const achievements = [
    { icon: "🔥", title: "Fire Starter", desc: "7 Day Streak", unlocked: true },
    { icon: "👑", title: "King", desc: "15 Weeks Won", unlocked: true },
    { icon: "⚡", title: "Perfect Week", desc: "7/7 Days", unlocked: true },
    { icon: "💯", title: "Century", desc: "100 Total Days", unlocked: true },
    { icon: "🏆", title: "Champion", desc: "30 Weeks Won", unlocked: false },
    { icon: "🌟", title: "Legend", desc: "30 Day Streak", unlocked: false },
    {
      icon: "💥",
      title: "Beast Mode",
      desc: "5 Perfect Weeks",
      unlocked: false,
    },
    {
      icon: "🎯",
      title: "Sharpshooter",
      desc: "7 Friends Added",
      unlocked: false,
    },
  ];

  return (
    <ScrollView className="flex-1 bg-black px-5 pt-5">
      <View className="bg-orange-600/10 rounded-3xl p-5 mb-8 border border-orange-600/30">
        <Text className="text-4xl font-black text-orange-500 mb-2">
          Achievements
        </Text>
        <Text className="text-orange-400 text-xs font-semibold tracking-widest uppercase">
          Unlock Your Greatness
        </Text>
      </View>

      <View className="flex-row flex-wrap justify-between mb-24">
        {achievements.map((achievement, index) => (
          <View
            key={index}
            className={`w-[48%] bg-orange-600/8 border border-orange-600/30 rounded-2xl p-6 items-center mb-4 ${
              !achievement.unlocked ? "opacity-40" : ""
            }`}
          >
            <Text className="text-5xl mb-3">{achievement.icon}</Text>
            <Text className="text-orange-400 text-sm font-bold text-center mb-1">
              {achievement.title}
            </Text>
            <Text className="text-gray-600 text-xs text-center uppercase tracking-wide">
              {achievement.desc}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
