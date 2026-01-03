import React, { useState } from "react";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SwipeableSheet } from "./swipeable_sheet";

interface PaywallSheetProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

type Billing = "yearly" | "monthly";

export const PaywallModal = ({
  visible,
  onClose,
  onPurchase,
}: PaywallSheetProps) => {
  const [billing, setBilling] = useState<Billing>("yearly");

  const pricing = {
    monthly: "$9.99",
    yearly: "$89.99",
    yearlySavings: "SAVE 25%",
  };

  const FeatureItem = ({
    icon,
    title,
    subtitle,
  }: {
    icon: string;
    title: string;
    subtitle: string;
  }) => (
    <View className="flex-row items-center mb-5 last:mb-0">
      <View className="w-10 h-10 rounded-xl bg-orange-600/20 items-center justify-center mr-4">
        <MaterialCommunityIcons name={icon as any} size={20} color="#EA580C" />
      </View>
      <View className="flex-1">
        <Text className="text-white text-sm font-black tracking-wide">
          {title}
        </Text>
        <Text className="text-white/50 text-[11px] font-semibold mt-0.5">
          {subtitle}
        </Text>
      </View>
    </View>
  );

  return (
    <SwipeableSheet
      visible={visible}
      onClose={onClose}
      fullScreen={true} 
      coverImage={require("../assets/images/icon.png")}
    >
      <View className="pb-10">
        
        <View className="items-center mb-8 mt-2">
          <View className="w-16 h-16 rounded-2xl bg-orange-600/10 items-center justify-center border border-orange-600/30 mb-4 shadow-lg shadow-orange-600/20">
            <MaterialCommunityIcons
              name="crown"
              size={32}
              color="#EA580C"
            />
          </View>
          <Text className="text-orange-600 text-[10px] font-black tracking-[4px] uppercase mb-2">
            BECOME A MEMBER
          </Text>
          <Text className="text-white text-3xl font-black text-center leading-8">
            UNLOCK GLOBAL{"\n"}ACCESS
          </Text>
          <Text className="text-white/40 text-xs font-medium text-center mt-3 max-w-[80%] leading-5">
            Get unlimited discounts at all partner venues worldwide and track your drinking career.
          </Text>
        </View>

        <View className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.08] mb-8">
          <FeatureItem
            icon="earth"
            title="GLOBAL VENUE ACCESS"
            subtitle="Valid at all partner bars & clubs worldwide."
          />
          <FeatureItem
            icon="ticket-percent"
            title="25% OFF DRINKS"
            subtitle="Guaranteed discounts on every order."
          />
          <FeatureItem
            icon="shield-crown"
            title="OFFICIAL PASSPORT"
            subtitle="Track stats, savings, and earn stamps."
          />
        </View>

        <View className="mb-8">
          <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-4 ml-1">
            CHOOSE YOUR PLAN
          </Text>

          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setBilling("yearly")}
              className={`flex-1 p-4 rounded-2xl border-2 relative ${
                billing === "yearly"
                  ? "bg-[#1A1A1A] border-orange-600"
                  : "bg-white/[0.02] border-white/[0.08]"
              }`}
            >
              {billing === "yearly" && (
                <View className="absolute -top-3 left-0 right-0 items-center">
                  <View className="bg-orange-600 px-3 py-1 rounded-full shadow-sm shadow-orange-600/50">
                    <Text className="text-[9px] font-black text-black tracking-widest">
                      {pricing.yearlySavings}
                    </Text>
                  </View>
                </View>
              )}

              <View className="items-center mt-2">
                <Text
                  className={`text-[10px] font-bold tracking-wide mb-1 ${
                    billing === "yearly" ? "text-orange-600" : "text-white/50"
                  }`}
                >
                  YEARLY
                </Text>
                <Text className="text-white text-2xl font-black">
                  {pricing.yearly}
                </Text>
                <Text className="text-white/30 text-[9px] font-bold mt-1">
                  Billed every 12 months
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setBilling("monthly")}
              className={`flex-1 p-4 rounded-2xl border-2 relative ${
                billing === "monthly"
                  ? "bg-[#1A1A1A] border-orange-600"
                  : "bg-white/[0.02] border-white/[0.08]"
              }`}
            >
              <View className="items-center mt-2">
                <Text
                  className={`text-[10px] font-bold tracking-wide mb-1 ${
                    billing === "monthly" ? "text-orange-600" : "text-white/50"
                  }`}
                >
                  MONTHLY
                </Text>
                <Text className="text-white text-2xl font-black">
                  {pricing.monthly}
                </Text>
                <Text className="text-white/30 text-[9px] font-bold mt-1">
                  Billed monthly
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        <TouchableOpacity
          onPress={onPurchase}
          activeOpacity={0.8}
          className="bg-orange-600 py-4 rounded-2xl items-center mb-6 shadow-lg shadow-orange-600/20 border-t border-white/20"
        >
          <Text className="text-black font-black text-base tracking-widest uppercase">
            Start {billing} Plan
          </Text>
          <Text className="text-black/60 text-[10px] font-bold mt-0.5">
            7-day free trial, then {billing === "yearly" ? pricing.yearly : pricing.monthly}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center space-x-6 mb-2">
            <TouchableOpacity>
                <Text className="text-white/30 text-[10px] font-bold tracking-widest uppercase">Restore</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text className="text-white/30 text-[10px] font-bold tracking-widest uppercase">Terms</Text>
            </TouchableOpacity>
        </View>
        
        <Text className="text-white/20 text-center text-[9px] px-8 leading-4 font-medium">
          Subscription automatically renews unless auto-renew is turned off at least 24-hours before the end of the current period.
        </Text>
      </View>
    </SwipeableSheet>
  );
};