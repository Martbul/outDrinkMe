import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { SwipeableSheet } from "./swipeable_sheet";
import { useApp } from "@/providers/AppProvider";
import { apiService } from "@/api";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

interface PaywallSheetProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

export const PaywallModal = ({ visible, onClose, onPurchase }: PaywallSheetProps) => {
  const { premiumPrices, refreshAll } = useApp();
  const { getToken } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = async(event: { url: string }) => {
      const parsed = Linking.parse(event.url);

      if (parsed.hostname === "payment-success") {
        await refreshAll()
        onPurchase();
        onClose();
        router.push("/(screens)/successful_purchase");
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, [onPurchase, onClose, router]);

  const priceData = useMemo(() => {
    const price = premiumPrices[0];

    const formatPrice = (amount: string, currency: string) => {
      const value = parseFloat(amount);
      const finalAmount = value > 100 ? value / 100 : value;
      return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(finalAmount);
    };

    return {
      priceStr: price ? formatPrice(price.amount, price.currency) : "...",
      priceId: price?.id,
      interval: price?.interval || "month",
      isLoading: !price && premiumPrices.length === 0,
      isAvailable: !!price,
    };
  }, [premiumPrices]);

  const handlePurchasePress = async () => {
    if (!priceData.priceId) return;

    try {
      setIsRedirecting(true);
      const token = await getToken();
      if (!token) throw new Error("No auth token");

      const response = await apiService.createTransaction(priceData.priceId, token);

      if (response.checkoutUrl) {
        await Linking.openURL(response.checkoutUrl);
      } else {
        Alert.alert("Checkout Error", "Could not generate a payment link.");
      }
    } catch (err) {
      console.error("Redirect Error:", err);
      Alert.alert("Error", "Check your internet connection and try again.");
    } finally {
      setIsRedirecting(false);
    }
  };

  const FeatureItem = ({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) => (
    <View className="flex-row items-center mb-4">
      <View className="w-10 h-10 rounded-xl bg-orange-600/20 items-center justify-center mr-4">
        <MaterialCommunityIcons name={icon as any} size={20} color="#EA580C" />
      </View>
      <View className="flex-1">
        <Text className="text-white text-sm font-black tracking-wide">{title}</Text>
        <Text className="text-white/50 text-xs font-medium mt-0.5">{subtitle}</Text>
      </View>
    </View>
  );

  return (
    <SwipeableSheet visible={visible} onClose={onClose} fullScreen={true}>
      <View className="flex-1 px-2 pb-8 pt-2 justify-between">
        <View className="flex-1 justify-center">
          <View className="items-center mb-8">
            <View className="w-28 h-24 rounded-2xl bg-orange-600/10 items-center justify-center border border-orange-600/30 mb-4 shadow-lg shadow-orange-600/20">
              <MaterialCommunityIcons name="card-account-details-star" size={64} color="#EA580C" />
            </View>
            <Text className="text-orange-600 text-[10px] font-black tracking-[4px] uppercase mb-2">
              PREMIUM ALCOHOLIC
            </Text>
            <Text className="text-white text-3xl font-black text-center leading-8">UNLOCK GLOBAL{"\n"}ACCESS</Text>
          </View>

          <View className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.08] mb-6 gap-4">
            <FeatureItem icon="ticket-percent" title="UNLIMITED DISCOUNT" subtitle="Guaranteed discounts every day" />
            <FeatureItem icon="earth" title="MULTIPLE VENUE ACCESS" subtitle="Valid at all partner bars & clubs." />
            <FeatureItem icon="shield-crown" title="SKIP THE LINE" subtitle="Priority access to venues." />
            <FeatureItem icon="star-face" title="PREMIUM ONLY EVENTS" subtitle="Exclusive parties and tastings." />
            <FeatureItem
              icon="card-account-details"
              title="OFFICIAL ALCOHOLIC ID"
              subtitle="Digital badge and stats tracking."
            />
          </View>

          <View>
            <View className="items-center mb-6">
              {priceData.isLoading ? (
                <Text className="text-white/50 text-sm">Loading price...</Text>
              ) : (
                <Text className="text-white/70 text-sm font-medium">
                  Only <Text className="text-white font-black text-xl">{priceData.priceStr}</Text> /{" "}
                  {priceData.interval}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={handlePurchasePress}
              disabled={priceData.isLoading || isRedirecting || !priceData.isAvailable}
              activeOpacity={0.8}
              className={`h-14 rounded-xl items-center justify-center mb-4 shadow-lg border-t border-white/20 ${
                isRedirecting || !priceData.isAvailable ? "bg-white/10" : "bg-orange-600 shadow-orange-600/20"
              }`}
            >
              {isRedirecting ? (
                <ActivityIndicator color="#EA580C" />
              ) : (
                <Text
                  className={`font-black text-base tracking-widest uppercase ${
                    !priceData.isAvailable ? "text-white/30" : "text-black"
                  }`}
                >
                  PURCHASE PREMIUM
                </Text>
              )}
            </TouchableOpacity>

            <Text className="text-white/20 text-[9px] text-center px-4 leading-3">
              Payments are handled securely by Paddle. You will be redirected to your browser to complete the
              transaction.
            </Text>
          </View>
        </View>
      </View>
    </SwipeableSheet>
  );
};
