import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 bg-black px-5 pt-5">
        <View className="bg-orange-600/10 rounded-3xl p-5 mb-8 border border-orange-600/30">
          <Text className="text-4xl font-black text-orange-500 mb-2">
            OUTDRINKME
          </Text>
          <Text className="text-orange-400 text-xs font-semibold tracking-widest uppercase">
            Ignite The Competition
          </Text>
        </View>

        {/* VS Challenge Card */}
        <View className="bg-orange-600/10 rounded-3xl p-8 mb-6 border-2 border-orange-600/40">
          <View className="flex-row justify-between items-center mb-5">
            <View className="flex-1 items-center">
              <Text className="text-gray-400 text-sm mb-2 uppercase tracking-wide">
                You
              </Text>
              <Text className="text-5xl font-black text-orange-500">5/7</Text>
            </View>
            <Text className="text-2xl font-black text-orange-600 px-5">VS</Text>
            <View className="flex-1 items-center">
              <Text className="text-gray-400 text-sm mb-2 uppercase tracking-wide">
                Mike
              </Text>
              <Text className="text-5xl font-black text-orange-500">6/7</Text>
            </View>
          </View>
          <Text className="text-orange-400 font-semibold text-sm text-center">
            🔥 1 day behind! Catch up!
          </Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-orange-600/8 border border-orange-600/30 rounded-2xl p-4">
            <Text className="text-3xl font-black text-orange-400 text-center mb-1">
              5
            </Text>
            <Text className="text-gray-600 text-[10px] text-center uppercase tracking-wide">
              Days This Week
            </Text>
          </View>
          <View className="flex-1 bg-orange-600/8 border border-orange-600/30 rounded-2xl p-4">
            <Text className="text-3xl font-black text-orange-400 text-center mb-1">
              #2
            </Text>
            <Text className="text-gray-600 text-[10px] text-center uppercase tracking-wide">
              Rank
            </Text>
          </View>
          <View className="flex-1 bg-orange-600/8 border border-orange-600/30 rounded-2xl p-4">
            <Text className="text-3xl font-black text-orange-400 text-center mb-1">
              15
            </Text>
            <Text className="text-gray-600 text-[10px] text-center uppercase tracking-wide">
              Wins
            </Text>
          </View>
        </View>

        {/* Today's Status */}
        <View className="bg-orange-600/10 rounded-3xl p-6 mb-6 border-2 border-orange-600/40">
          <Text className="text-gray-400 text-xs uppercase tracking-widest text-center mb-3">
            Today
          </Text>
          <Text className="text-6xl text-center mb-3">✅</Text>
          <Text className="text-orange-400 text-lg font-bold text-center">
            Logged for today!
          </Text>
        </View>

        {/* Streak Card */}
        <View className="bg-orange-600/10 rounded-3xl p-8 mb-6 border-2 border-orange-600/40 items-center">
          <Text className="text-8xl font-black text-orange-500 leading-tight">
            7
          </Text>
          <Text className="text-orange-400 text-base font-bold uppercase tracking-widest mt-2">
            Day Streak
          </Text>
          <Text className="text-gray-600 text-xs mt-2">
            Don't break it! Keep going! 🔥
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/add")}
          className="bg-orange-600 rounded-2xl p-6 mb-24 shadow-lg shadow-orange-600/50"
        >
          <Text className="text-black text-lg font-black text-center uppercase tracking-widest">
            Log Today
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
