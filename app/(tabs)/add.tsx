import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import Entypo from "@expo/vector-icons/Entypo";





//!TODO: Remove the Alert for modal(and confetti)
export default function AddDrinksScreenV3() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userStats, weeklyStats, addDrinking } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const hasCompletedRef = useRef(false);

  // Check if user has already logged today
  const alreadyLogged = userStats?.today_status || false;

  const logToday = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDrinking(true);
      Alert.alert("Success", "✅ Logged for today! Keep the streak alive! 🔥", [
        { text: "OK", onPress: () => router.push("/(tabs)/home") },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to log. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startHold = () => {
    setIsHolding(true);
    hasCompletedRef.current = false;
    let progress = 0;

    progressIntervalRef.current = setInterval(() => {
      progress += 2;
      setHoldProgress(progress);

      if (progress >= 100) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        hasCompletedRef.current = true;
        setIsHolding(false);
        setHoldProgress(0);
        logToday();
      }
    }, 30);
  };

  const cancelHold = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Only reset if the hold wasn't completed
    if (!hasCompletedRef.current) {
      setHoldProgress(0);
      setIsHolding(false);
    }
  };

  const potentialStreak = (userStats?.current_streak || 0) + 1;

  if (alreadyLogged) {
    return (
      <View
        className="flex-1 bg-black px-4 justify-center"
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 40,
        }}
      >
        {/* Success Header */}
        <View className="mb-12 items-center">
          <View className="w-32 h-32 rounded-full bg-orange-600/20 items-center justify-center mb-6 border-4 border-orange-600/50">
            <Entypo name="check" size={84} color="#ff8c00" />
          </View>
          <Text className="text-white text-4xl font-black text-center leading-tight mb-3">
            Already Logged!
          </Text>
          <Text className="text-white/50 text-base text-center font-semibold">
            You are my alcoholic pride!{"\n"}Drink again tomorrow and keep your
            steak!
          </Text>
        </View>

        {/* Current Streak Display */}
        <View className="bg-white/[0.03] rounded-2xl p-6 mb-8 border border-white/[0.08]">
          <View className="items-center">
            <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-2">
              CURRENT STREAK
            </Text>
            <Text className="text-orange-600 text-6xl font-black mb-2">
              {userStats?.current_streak || 0}
            </Text>
            {/* <Text className="text-white text-lg font-bold">Days Strong 💪</Text> */}
          </View>
        </View>

        {/* Stats Cards */}
        {/* <View className="flex-row gap-3 mb-8">
          <View className="flex-1 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] items-center">
            <Text className="text-white text-3xl font-black mb-1">
              {userStats?.best_streak || 0}
            </Text>
            <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase">
              Best Streak
            </Text>
          </View>
          <View className="flex-1 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] items-center">
            <Text className="text-white text-3xl font-black mb-1">
              {userStats?.total_days || 0}
            </Text>
            <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase">
              Total Days
            </Text>
          </View>
        </View> */}

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/home")}
          className="bg-orange-600 rounded-2xl py-5"
        >
          <Text className="text-black text-base font-black text-center tracking-widest uppercase">
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-black px-4 justify-center"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 40,
      }}
    >
      <View className="mb-12">
        <View className="flex-row items-center justify-center mb-6">
          <View className="w-2 h-2 bg-orange-600 rounded-full mr-3" />
          <Text className="text-orange-600 text-xs font-black tracking-widest uppercase">
            Quick Log
          </Text>
        </View>
        <Text className="text-white text-5xl font-black text-center leading-tight">
          Did you{"\n"}drink today?
        </Text>
      </View>

      <View className="bg-white/[0.03] rounded-2xl p-6 mb-12 border border-white/[0.08]">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-1">
              CURRENT STREAK
            </Text>
            <Text className="text-white text-4xl font-black">
              {userStats?.current_streak || 0} 🔥
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
              NEXT
            </Text>
            <Text className="text-orange-600 text-3xl font-black">
              {potentialStreak}
            </Text>
          </View>
        </View>
      </View>

      <View className="mb-6">
        <TouchableOpacity
          onPressIn={startHold}
          onPressOut={cancelHold}
          disabled={isSubmitting}
          activeOpacity={0.9}
          className="bg-orange-600 rounded-3xl overflow-hidden"
          style={{ height: 140 }}
        >
          <View className="flex-1 items-center justify-center">
            <Text className="text-black text-3xl font-black mb-2">
              {isHolding ? "HOLD..." : "DRINK"}
            </Text>
            <Text className="text-black/60 text-sm font-bold">
              Press and hold to confirm
            </Text>
          </View>
          {holdProgress > 0 && (
            <View
              className="absolute bottom-0 left-0 right-0 bg-black/30"
              style={{ height: `${holdProgress}%` }}
            />
          )}
        </TouchableOpacity>

        <Text className="text-white/50 text-xs text-center mt-3 font-semibold">
          Hold the button for 2 seconds to log
        </Text>
      </View>

      <TouchableOpacity onPress={() => router.back()} className="py-4 mb-8">
        <Text className="text-white/40 text-sm font-bold text-center">
          Not now
        </Text>
      </TouchableOpacity>
    </View>
  );
}

