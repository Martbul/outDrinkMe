
import { Header } from "@/components/header";
import React, { useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";


export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("for-you");
const scrollY = React.useRef(new Animated.Value(0)).current;

  const scrollHandler = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  return (
    <SafeAreaProvider className="flex-1 bg-black">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24 }}
      >
        {/* Rank Badge - Liftoff Style */}
        <View className="items-center mb-8">
          <View className="w-32 h-32 rounded-full bg-orange-600/20 border-4 border-orange-600 items-center justify-center mb-3">
            <Text className="text-orange-500 text-5xl font-black">5</Text>
          </View>
          <Text className="text-white text-2xl font-bold">FIRE STARTER</Text>
          <Text className="text-gray-500 text-sm uppercase tracking-widest mt-1">
            Rank 5/10
          </Text>
        </View>

        {/* Current Streak - Prominent */}
        <View className="bg-gray-900 rounded-2xl p-6 mb-4 border border-gray-800">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Current Streak
              </Text>
              <Text className="text-white text-4xl font-black">7 Days 🔥</Text>
            </View>
            <View className="bg-orange-600/20 px-4 py-2 rounded-lg">
              <Text className="text-orange-500 text-xs font-bold uppercase">
                Active
              </Text>
            </View>
          </View>
        </View>

        {/* This Week Stats */}
        <View className="bg-gray-900 rounded-2xl p-6 mb-4 border border-gray-800">
          <Text className="text-gray-400 text-xs uppercase tracking-wider mb-4">
            This Week
          </Text>

          {/* Progress Bar */}
          <View className="mb-4">
            <View className="flex-row justify-between items-end mb-2">
              <Text className="text-white text-3xl font-black">5/7</Text>
              <Text className="text-gray-500 text-sm">Days Logged</Text>
            </View>
            <View className="w-full h-2 bg-gray-800 rounded-full">
              <View
                className="h-full bg-orange-600 rounded-full"
                style={{ width: "71%" }}
              />
            </View>
          </View>

          {/* Week Grid */}
          <View className="flex-row justify-between mt-4">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <View key={index} className="items-center">
                <View
                  className={`w-10 h-10 rounded-lg ${index < 5 ? "bg-orange-600" : "bg-gray-800"} items-center justify-center mb-1`}
                >
                  <Text
                    className={`text-sm font-bold ${index < 5 ? "text-black" : "text-gray-600"}`}
                  >
                    {index < 5 ? "✓" : ""}
                  </Text>
                </View>
                <Text className="text-gray-600 text-xs font-semibold">
                  {day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-gray-900 rounded-xl p-4 border border-gray-800">
            <Text className="text-gray-500 text-xs uppercase tracking-wider mb-1">
              Rank
            </Text>
            <Text className="text-white text-2xl font-black">#2</Text>
            <Text className="text-gray-600 text-xs mt-1">of 12</Text>
          </View>
          <View className="flex-1 bg-gray-900 rounded-xl p-4 border border-gray-800">
            <Text className="text-gray-500 text-xs uppercase tracking-wider mb-1">
              Total
            </Text>
            <Text className="text-white text-2xl font-black">203</Text>
            <Text className="text-gray-600 text-xs mt-1">days</Text>
          </View>
          <View className="flex-1 bg-gray-900 rounded-xl p-4 border border-gray-800">
            <Text className="text-gray-500 text-xs uppercase tracking-wider mb-1">
              Wins
            </Text>
            <Text className="text-white text-2xl font-black">15</Text>
            <Text className="text-gray-600 text-xs mt-1">weeks</Text>
          </View>
        </View>

        {/* Log Button - Prominent */}
        <TouchableOpacity
          onPress={() => console.log("Log today")}
          className="bg-orange-600 rounded-2xl p-5 mb-24 shadow-lg shadow-orange-600/30"
        >
          <Text className="text-black text-center text-lg font-black uppercase tracking-wider">
            Log Today
          </Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </SafeAreaProvider>
  );
}