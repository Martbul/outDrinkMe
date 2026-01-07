import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { PassportCard } from "@/components/passport_card";
const REAL_USER_DATA = {
  name: "ALEXANDER DRINKER",
  id: "DRK-8821-X99",
  joined: "21 JAN 2024",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400",
  moneySaved: 425.5,
  barsVisited: 18,
  validDue: "12/25",
};

const EXAMPLE_USER_DATA = {
  name: "EXAMPLE PASSPORT",
  id: "000-0000-000",
  joined: "01 JAN 2024",
  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400",
  moneySaved: 1250.0,
  barsVisited: 42,
  validDue: "12/99",
};
export default function PurchaseSuccess() {
  const router = useRouter();
  const hasPremium = false;
  const DATA = hasPremium ? REAL_USER_DATA : EXAMPLE_USER_DATA;

  return (
    <SafeAreaView className="flex-1 bg-black px-6 justify-center items-center">
      <View className="w-28 h-24 rounded-2xl bg-orange-600/10 items-center justify-center border border-orange-600/30 mb-4 shadow-lg shadow-orange-600/20">
        <MaterialCommunityIcons name="card-account-details-star" size={64} color="#EA580C" />
      </View>

      <Text className="text-white text-3xl font-black text-center mb-2">WELCOME TO{"\n"}PREMIUM</Text>
      <View className="my-10">
        <PassportCard data={DATA} hasPremium={false} />
      </View>
      <Text className="text-white/50 text-center mb-3 px-4 font-medium">
        That's your digital id, use it responsibly. Jk obliterate yourself
      </Text>

      <TouchableOpacity
        onPress={() => router.replace("/(tabs)/premium")}
        className="w-full h-14 bg-orange-600 rounded-xl items-center justify-center shadow-lg shadow-orange-600/20"
      >
        <Text className="text-black font-black tracking-widest uppercase">Go Drinking</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
