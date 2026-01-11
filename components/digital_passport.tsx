import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PaywallModal } from "./paywall_modal";
import { PassportCard } from "./passport_card";
import { useApp } from "@/providers/AppProvider";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 48;

export default function DigitalPassport({ onBuyPremium }: any) {
  const [showPaywall, setShowPaywall] = useState(false);
  const { premium } = useApp();

  const isPremiumActive = premium && premium.isActive;

  return (
    <View className="items-center justify-center w-full">
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchase={onBuyPremium || (() => {})}
      />

      <View className="mb-8">
        <PassportCard/>
      </View>

      {!isPremiumActive && (
        <TouchableOpacity
          onPress={() => setShowPaywall(true)}
          activeOpacity={0.8}
          style={{ width: CARD_WIDTH }}
          className="mt-4 bg-orange-600 py-4 rounded-xl items-center shadow-lg border border-orange-400/20 flex-row justify-center"
        >
          <MaterialCommunityIcons name="star-four-points" size={18} color="black" />
          <Text className="text-black font-black text-sm tracking-widest uppercase ml-2">UNLOCK PREMIUM PASSPORT</Text>
        </TouchableOpacity>
      )}

    
    </View>
  );
}
