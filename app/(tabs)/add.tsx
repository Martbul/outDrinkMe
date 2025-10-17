import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Header } from "@/components/header";

export default function AddDrinksScreen() {
  const router = useRouter();
 

  const logToday = (status: boolean) => {
    const message = status
      ? "✅ Logged for today! Keep the streak alive! 🔥"
      : "❌ Marked as NO for today";

    Alert.alert("Success", message, [
      { text: "OK", onPress: () => router.push("/(tabs)/home") },
    ]);
  };

  return (
    <View className="flex-1 bg-black px-5 pt-5 justify-center">

      <View className="bg-orange-600/10 rounded-3xl p-5 mb-10 border border-orange-600/30">
        <Text className="text-4xl font-black text-orange-500 mb-2">
          Log Today
        </Text>
        <Text className="text-orange-400 text-xs font-semibold tracking-widest uppercase">
          Did you drink today?
        </Text>
      </View>

      <Text className="text-gray-400 text-center text-lg mb-8 px-8">
        Simple question: Did you have a drink today?
      </Text>

      {/* YES Button */}
      <TouchableOpacity
        onPress={() => logToday(true)}
        className="bg-orange-600 rounded-3xl p-8 mb-6 shadow-lg shadow-orange-600/50"
      >
        <Text className="text-8xl text-center mb-4">✅</Text>
        <Text className="text-black text-2xl font-black text-center uppercase tracking-widest">
          YES
        </Text>
        <Text className="text-black/70 text-sm text-center mt-2">
          I drank today
        </Text>
      </TouchableOpacity>

      {/* NO Button */}
      <TouchableOpacity
        onPress={() => logToday(false)}
        className="bg-gray-800 border-2 border-gray-700 rounded-3xl p-8 mb-6"
      >
        <Text className="text-8xl text-center mb-4">❌</Text>
        <Text className="text-white text-2xl font-black text-center uppercase tracking-widest">
          NO
        </Text>
        <Text className="text-gray-500 text-sm text-center mt-2">
          I didn't drink today
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
        className="bg-orange-600/10 rounded-2xl p-6 border border-orange-600/30"
      >
        <Text className="text-orange-400 text-lg font-black text-center uppercase tracking-widest">
          Cancel
        </Text>
      </TouchableOpacity>

      <Text className="text-gray-600 text-xs text-center mt-8 px-8">
        Be honest! Your streak and stats depend on it 🔥
      </Text>
    </View>
  );
}
