import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import SecondaryHeader from "@/components/secondaryHeader";

interface Deal {
  id: number;
  title: string;
  type: string;
  discount: string;
  originalPrice: number;
  price: number;
  multiplier?: string;
  icon: string;
  isDark?: boolean;
}

interface ProDeal {
  id: number;
  title: string;
  subtitle: string;
  discount: string;
  originalPrice: number;
  price: number;
  icon: string;
}

export default function LiftoffStoreScreen() {
  const insets = useSafeAreaInsets();
  const [timeLeft, setTimeLeft] = useState({
    hours: 16,
    minutes: 25,
    seconds: 37,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const regularDeals: Deal[] = [
    {
      id: 1,
      title: "Double-XP Shake",
      type: "Consumable",
      discount: "33%",
      originalPrice: 40,
      price: 27,
      multiplier: "2x",
      icon: "🥤",
    },
    {
      id: 2,
      title: "Autumn Vibes",
      type: "Seasonal",
      discount: "25%",
      originalPrice: 150,
      price: 113,
      icon: "🍂",
      isDark: true,
    },
  ];

  const proDeals: ProDeal[] = [
    {
      id: 1,
      title: "Fire",
      subtitle: "Profile Border",
      discount: "33%",
      originalPrice: 500,
      price: 334,
      icon: "🔥",
    },
    {
      id: 2,
      title: "Water",
      subtitle: "Profile Border",
      discount: "50%",
      originalPrice: 500,
      price: 250,
      icon: "💧",
    },
  ];

  const DealCard = ({ deal }: { deal: Deal }) => (
    <View
      className={`w-[48%] rounded-2xl p-4 border mb-4 ${
        deal.isDark
          ? "bg-[#2a1a1a] border-[#3a2424]"
          : "bg-white/[0.03] border-white/[0.08]"
      }`}
    >
      {/* Discount Badge */}
      <View className="absolute -top-2 -left-2 bg-orange-600 px-3 py-1 rounded-lg border-2 border-black z-10">
        <Text className="text-white text-xs font-black">{deal.discount}</Text>
        <Text className="text-white text-[10px] font-bold">OFF</Text>
      </View>

      {/* Info Button */}
      <TouchableOpacity className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/[0.05] items-center justify-center border border-white/[0.08]">
        <Feather name="info" size={12} color="#999999" />
      </TouchableOpacity>

      {/* Title */}
      <Text className="text-white text-base font-bold mt-2 mb-1">
        {deal.title}
      </Text>
      <Text
        className={`text-xs font-semibold mb-3 ${
          deal.isDark ? "text-pink-500" : "text-white/50"
        }`}
      >
        {deal.type}
      </Text>

      {/* Icon */}
      <View className="items-center justify-center py-4 relative">
        <Text style={{ fontSize: 48 }}>{deal.icon}</Text>
        {deal.multiplier && (
          <View className="absolute bottom-2 right-[25%] bg-blue-500 w-8 h-8 rounded-full items-center justify-center">
            <Text className="text-white text-xs font-black">
              {deal.multiplier}
            </Text>
          </View>
        )}
      </View>

      {/* Prices */}
      <Text className="text-white/30 text-sm text-center line-through mb-2">
        {deal.originalPrice}
      </Text>
      <View className="bg-white/[0.05] rounded-xl py-2 px-3 flex-row items-center justify-center border border-white/[0.08]">
        <Text className="text-lg mr-1">🥚</Text>
        <Text className="text-white text-xl font-black">{deal.price}</Text>
      </View>
    </View>
  );

  const ProDealCard = ({ deal }: { deal: ProDeal }) => (
    <View className="w-[48%] bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] mb-4">
      {/* Discount Badge */}
      <View className="absolute -top-2 -left-2 bg-orange-600 px-3 py-1 rounded-lg border-2 border-black z-10">
        <Text className="text-white text-xs font-black">{deal.discount}</Text>
        <Text className="text-white text-[10px] font-bold">OFF</Text>
      </View>

      {/* Info Button */}
      <TouchableOpacity className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/[0.05] items-center justify-center border border-white/[0.08]">
        <Feather name="info" size={12} color="#999999" />
      </TouchableOpacity>

      {/* Title */}
      <Text className="text-white text-base font-bold mt-2 mb-1">
        {deal.title}
      </Text>
      <Text className="text-white/50 text-xs font-semibold mb-3">
        {deal.subtitle}
      </Text>

      {/* Icon with MB Badge */}
      <View className="items-center justify-center py-4">
        <Text style={{ fontSize: 48 }}>{deal.icon}</Text>
        <View className="bg-white/[0.05] px-3 py-1 rounded-full mt-2 border border-white/[0.08]">
          <Text className="text-white text-sm font-black">MB</Text>
        </View>
      </View>

      {/* Prices */}
      <Text className="text-white/30 text-sm text-center line-through mb-2">
        {deal.originalPrice}
      </Text>
      <View className="bg-white/[0.05] rounded-xl py-2 px-3 flex-row items-center justify-center border border-white/[0.08]">
        <Text className="text-lg mr-1">🥚</Text>
        <Text className="text-white text-xl font-black">{deal.price}</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      {/* <Header /> */}
      <SecondaryHeader title="Store" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Pro Banner */}
        <View className="mx-4 mt-6 mb-4">
          <View
            className="rounded-2xl p-5 flex-row items-center justify-between border border-purple-600/30"
            style={{
              backgroundColor: "#6B5FD9",
            }}
          >
            <View className="flex-row items-center flex-1">
              <Text style={{ fontSize: 32, marginRight: 12 }}>✨</Text>
              <View>
                <Text className="text-white text-2xl font-black">
                  Liftoff Pro
                </Text>
                <Text className="text-white/90 text-base font-semibold">
                  Try It For Free!
                </Text>
              </View>
            </View>
            <TouchableOpacity className="bg-purple-700 px-4 py-2 rounded-xl">
              <View className="flex-row items-center">
                <Text className="text-white font-black mr-1">GO PRO!</Text>
                <Text>☁️</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Timer */}
        <View className="mx-4 mb-4">
          <View className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08]">
            <Text className="text-white text-base font-bold text-center">
              Deals refresh in {timeLeft.hours}h {timeLeft.minutes}m{" "}
              {timeLeft.seconds}s
            </Text>
          </View>
        </View>

        {/* Regular Deals Section */}
        <View className="mx-4 mb-6">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-2xl font-black">
                Regular Deals
              </Text>
              <View className="bg-white/[0.05] px-3 py-1.5 rounded-full flex-row items-center border border-white/[0.08]">
                <Text className="text-lg mr-1">🥚</Text>
                <Text className="text-white font-black mr-2">10</Text>
                <Ionicons name="refresh" size={16} color="#999999" />
              </View>
            </View>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {regularDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </View>
        </View>

        {/* Pro Deals Section */}
        <View className="mx-4 mb-6">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Text className="text-white text-2xl font-black mr-2">
                  Pro Deals
                </Text>
                <Ionicons name="lock-closed" size={20} color="#999999" />
              </View>
              <View className="bg-white/[0.05] px-3 py-1.5 rounded-full flex-row items-center border border-white/[0.08]">
                <Text className="text-lg mr-1">🥚</Text>
                <Text className="text-white font-black mr-2">10</Text>
                <Ionicons name="refresh" size={16} color="#999999" />
              </View>
            </View>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {proDeals.map((deal) => (
              <ProDealCard key={deal.id} deal={deal} />
            ))}
          </View>
        </View>

        {/* XP Shakes Section - Scrollable */}
        <View className="mx-4 mb-6">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-4">
            <Text className="text-white text-2xl font-black">XP Shakes</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {/* 2x Shake */}
            <View className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] mr-3 items-center w-40">
              <Text style={{ fontSize: 48, marginBottom: 8 }}>🥤</Text>
              <View className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center mb-3">
                <Text className="text-white text-xs font-black">2x</Text>
              </View>
              <View className="bg-white/[0.05] rounded-xl py-2 px-3 flex-row items-center justify-center border border-white/[0.08] w-full">
                <Text className="text-lg mr-1">🥚</Text>
                <Text className="text-white text-xl font-black">40</Text>
              </View>
            </View>

            {/* 3x Shake */}
            <View className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] items-center w-40">
              <Text style={{ fontSize: 48, marginBottom: 8 }}>🥤</Text>
              <View className="bg-red-500 w-8 h-8 rounded-full items-center justify-center mb-3">
                <Text className="text-white text-xs font-black">3x</Text>
              </View>
              <View className="bg-white/[0.05] rounded-xl py-2 px-3 flex-row items-center justify-center border border-white/[0.08] w-full">
                <Text className="text-lg mr-1">🥚</Text>
                <Text className="text-white text-xl font-black">100</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Streak Restores */}
        <View className="mx-4 mb-6">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-4">
            <Text className="text-white text-2xl font-black">
              Streak Restores
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {/* Super Restore */}
            <View className="w-[48%] bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] mb-4">
              <Text className="text-white text-base font-bold mb-1">
                Super Restore
              </Text>
              <Text className="text-white/50 text-xs font-semibold mb-4">
                Consumable
              </Text>
              <View className="items-center py-4">
                <Text style={{ fontSize: 40 }}>🔥</Text>
                <View className="bg-blue-500 w-10 h-10 rounded-full items-center justify-center mt-2">
                  <Text className="text-white font-black">30</Text>
                </View>
              </View>
              <View className="bg-white/[0.05] rounded-xl py-2 px-3 flex-row items-center justify-center border border-white/[0.08]">
                <Text className="text-lg mr-1">🥚</Text>
                <Text className="text-white text-xl font-black">250</Text>
              </View>
            </View>

            {/* Mega Restore */}
            <View className="w-[48%] bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] mb-4">
              <Text className="text-white text-base font-bold mb-1">
                Mega Restore
              </Text>
              <Text className="text-white/50 text-xs font-semibold mb-4">
                Consumable
              </Text>
              <View className="items-center py-4">
                <Text style={{ fontSize: 40 }}>🔥</Text>
                <View className="bg-red-500 w-10 h-10 rounded-full items-center justify-center mt-2">
                  <Text className="text-white font-black">60</Text>
                </View>
              </View>
              <View className="bg-white/[0.05] rounded-xl py-2 px-3 flex-row items-center justify-center border border-white/[0.08]">
                <Text className="text-lg mr-1">🥚</Text>
                <Text className="text-white text-xl font-black">600</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Color Themes */}
        <View className="mx-4 mb-6">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-2xl font-black">
                Color Themes
              </Text>
              <View className="bg-white/[0.05] px-3 py-1.5 rounded-full flex-row items-center border border-white/[0.08]">
                <Text className="text-lg mr-1">🥚</Text>
                <Text className="text-white font-black">125</Text>
              </View>
            </View>
          </View>

          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity className="w-[48%] bg-[#2a1a1a] rounded-2xl p-4 border border-red-900/50 mb-3 flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-red-500 mr-3" />
              <View>
                <Text className="text-white font-bold">Cherry Dark</Text>
                <Text className="text-red-400 text-xs font-semibold">
                  Color
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="w-[48%] bg-[#1a2a1a] rounded-2xl p-4 border border-green-900/50 mb-3 flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-green-500 mr-3" />
              <View>
                <Text className="text-white font-bold">Lime Dark</Text>
                <Text className="text-green-400 text-xs font-semibold">
                  Color
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Get More Eggs */}
        <View className="mx-4 mb-6">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-4">
            <Text className="text-white text-2xl font-black">
              Get More Eggs!
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity className="w-[48%] bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] mb-3 items-center">
              <View className="bg-white/[0.05] rounded-full w-16 h-16 items-center justify-center mb-3">
                <Text style={{ fontSize: 32 }}>🥚</Text>
              </View>
              <View className="bg-white/[0.05] rounded-xl py-2 px-3 flex-row items-center justify-center border border-white/[0.08] w-full mb-2">
                <Text className="text-lg mr-1">🥚</Text>
                <Text className="text-white text-xl font-black">100</Text>
              </View>
              <Text className="text-white/50 text-sm font-bold">2,19 лв.</Text>
            </TouchableOpacity>

            <TouchableOpacity className="w-[48%] bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] mb-3 items-center">
              <View className="bg-white/[0.05] rounded-full w-16 h-16 items-center justify-center mb-3">
                <Text style={{ fontSize: 32 }}>🥚</Text>
              </View>
              <View className="bg-white/[0.05] rounded-xl py-2 px-3 flex-row items-center justify-center border border-white/[0.08] w-full mb-2">
                <Text className="text-lg mr-1">🥚</Text>
                <Text className="text-white text-xl font-black">500</Text>
              </View>
              <Text className="text-white/50 text-sm font-bold">10,99 лв.</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
