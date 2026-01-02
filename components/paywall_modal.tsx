import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

type Tier = "pro" | "pro_plus";
type Billing = "yearly" | "monthly";

export const PaywallModal = ({
  visible,
  onClose,
  onPurchase,
}: PaywallModalProps) => {
  const [tier, setTier] = useState<Tier>("pro");
  const [billing, setBilling] = useState<Billing>("yearly");

  // Mock Pricing Data
  const pricing = {
    pro: {
      monthly: "$5.99",
      yearly: "$49.99",
      monthlyLabel: "/mo",
      yearlyLabel: "/yr",
      yearlySavings: "-30%",
    },
    pro_plus: {
      monthly: "$9.99",
      yearly: "$89.99",
      monthlyLabel: "/mo",
      yearlyLabel: "/yr",
      yearlySavings: "-25%",
    },
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
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black pt-6">
        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/[0.05] border border-white/[0.08] rounded-full items-center justify-center"
        >
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingTop: 60,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. TIER SELECTOR (Local vs Global) */}
          <View className="bg-white/[0.03] rounded-2xl p-2 border border-white/[0.08] mb-6 flex-row">
            <Pressable
              onPress={() => setTier("pro")}
              className={`flex-1 py-3 rounded-xl items-center ${
                tier === "pro" ? "bg-[#1A1A1A] border border-orange-600/50" : ""
              }`}
            >
              <Text
                className={`text-[10px] font-black tracking-widest mb-1 ${
                  tier === "pro" ? "text-orange-600" : "text-white/50"
                }`}
              >
                LOCAL
              </Text>
              <Text
                className={`text-sm font-black ${
                  tier === "pro" ? "text-white" : "text-white/30"
                }`}
              >
                PRO
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setTier("pro_plus")}
              className={`flex-1 py-3 rounded-xl items-center ${
                tier === "pro_plus"
                  ? "bg-[#1A1A1A] border border-orange-600/50"
                  : ""
              }`}
            >
              <Text
                className={`text-[10px] font-black tracking-widest mb-1 ${
                  tier === "pro_plus" ? "text-orange-600" : "text-white/50"
                }`}
              >
                GLOBAL
              </Text>
              <Text
                className={`text-sm font-black ${
                  tier === "pro_plus" ? "text-white" : "text-white/30"
                }`}
              >
                PRO +
              </Text>
            </Pressable>
          </View>

          {/* 2. HEADER INFO */}
          <View className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.08] mb-6">
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-2">
                  SELECTED ACCESS
                </Text>
                <Text className="text-white text-3xl font-black">
                  {tier === "pro_plus" ? "All Locations" : "Single Location"}
                </Text>
              </View>
              <View className="w-12 h-12 rounded-xl bg-orange-600/20 items-center justify-center border border-orange-600/30">
                <MaterialCommunityIcons
                  name={tier === "pro_plus" ? "earth" : "map-marker"}
                  size={24}
                  color="#EA580C"
                />
              </View>
            </View>
            <Text className="text-white/50 text-sm font-semibold mt-4 leading-5">
              {tier === "pro_plus"
                ? "Unlimited access to discounts and stats in every city worldwide."
                : "Unlock discounts and stats for your current city only."}
            </Text>
          </View>

          {/* 3. FEATURES LIST */}
          <View className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.08] mb-6">
            <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-6">
              INCLUDED BENEFITS
            </Text>

            <FeatureItem
              icon={tier === "pro_plus" ? "earth" : "map-marker-radius"}
              title={
                tier === "pro_plus"
                  ? "GLOBAL VENUE ACCESS"
                  : "LOCAL VENUE ACCESS"
              }
              subtitle={
                tier === "pro_plus"
                  ? "Valid at all partner bars worldwide."
                  : "Valid at partner bars in this city only."
              }
            />
            <FeatureItem
              icon="ticket-percent"
              title="25% OFF EVERYTHING"
              subtitle="Guaranteed discounts on all drinks."
            />
            <FeatureItem
              icon="card-account-details-star"
              title="DIGITAL PASSPORT"
              subtitle="Collect stamps and track history."
            />
          </View>

          {/* 4. BILLING CYCLE SELECTOR */}
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-6">
            <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-4">
              BILLING CYCLE
            </Text>

            <View className="flex-row gap-3">
              {/* Yearly Option */}
              <Pressable
                onPress={() => setBilling("yearly")}
                className={`flex-1 p-4 rounded-xl border-2 relative ${
                  billing === "yearly"
                    ? "bg-[#1A1A1A] border-orange-600"
                    : "bg-transparent border-white/[0.08]"
                }`}
              >
                {billing === "yearly" && (
                  <View className="absolute -top-3 left-3 bg-orange-600 px-2 py-0.5 rounded-md">
                    <Text className="text-[9px] font-black text-black tracking-widest">
                      {pricing[tier].yearlySavings}
                    </Text>
                  </View>
                )}

                <Text
                  className={`text-[10px] font-bold tracking-wide mb-1 ${
                    billing === "yearly" ? "text-orange-600" : "text-white/50"
                  }`}
                >
                  YEARLY
                </Text>
                <Text className="text-white text-xl font-black">
                  {pricing[tier].yearly}
                </Text>
                <Text className="text-white/30 text-[9px] font-bold mt-1">
                  Billed every 12 months
                </Text>
              </Pressable>

              {/* Monthly Option */}
              <Pressable
                onPress={() => setBilling("monthly")}
                className={`flex-1 p-4 rounded-xl border-2 relative ${
                  billing === "monthly"
                    ? "bg-[#1A1A1A] border-orange-600"
                    : "bg-transparent border-white/[0.08]"
                }`}
              >
                <Text
                  className={`text-[10px] font-bold tracking-wide mb-1 ${
                    billing === "monthly" ? "text-orange-600" : "text-white/50"
                  }`}
                >
                  MONTHLY
                </Text>
                <Text className="text-white text-xl font-black">
                  {pricing[tier].monthly}
                </Text>
                <Text className="text-white/30 text-[9px] font-bold mt-1">
                  Billed monthly
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={onPurchase}
            activeOpacity={0.8}
            className="bg-orange-600 py-4 rounded-xl items-center mb-4 shadow-lg shadow-orange-600/10"
          >
            <Text className="text-black font-black text-base tracking-widest">
              PURCHASE ACCESS
            </Text>
          </TouchableOpacity>

          {/* Footer Text */}
          <TouchableOpacity>
            <Text className="text-white/30 text-center text-[10px] font-bold tracking-widest uppercase mb-2">
              Restore Purchase
            </Text>
          </TouchableOpacity>
          <Text className="text-white/20 text-center text-[10px] px-8 leading-4 font-medium">
            Plan auto-renews. Cancel anytime in settings.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
};
