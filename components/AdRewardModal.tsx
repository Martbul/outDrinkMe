import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "react-native-google-mobile-ads";


// Use test ID for development, real ID for production


// const adUnitId = __DEV__
//   ? TestIds.REWARDED
//   : "ca-app-pub-1167503921437683/4220175598";

const adUnitId = TestIds.REWARDED
 

interface RewardedAdModalProps {
  onClose: () => void;
  onRewardEarned: (amount: number) => void;
}

export default function RewardedAdModal({
  onClose,
  onRewardEarned,
}: RewardedAdModalProps) {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adShown, setAdShown] = useState(false);
  const rewardedRef = useRef<RewardedAd | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create rewarded ad instance
    const rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
      keywords: ["gaming", "mobile games", "casual games"],
    });

    rewardedRef.current = rewardedAd;

    // Event listener for when ad loads
    const loadedListener = rewardedAd.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log("✅ Ad loaded successfully");
        setLoaded(true);
        setLoading(false);

        // Clear timeout since ad loaded successfully
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    );

    // Event listener for when user earns reward
    const earnedListener = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log("💎 User earned reward:", reward);
        onRewardEarned(1);

        // Close modal after reward with small delay
        setTimeout(() => onClose(), 500);
      }
    );

    // Load the ad
    console.log("📱 Loading rewarded ad...");
    rewardedAd.load();

    // Timeout fallback in case ad fails to load
    timeoutRef.current = setTimeout(() => {
      if (!loaded) {
        console.log("⏱️ Ad load timeout");
        setLoading(false);
        Alert.alert(
          "Ad Unavailable",
          "Unable to load ad at this time. Please try again later.",
          [{ text: "OK", onPress: onClose }]
        );
      }
    }, 30000); // Increased to 15 seconds

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up ad listeners");
      loadedListener();
      earnedListener();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      rewardedRef.current = null;
    };
  }, []);

  const showAd = async () => {
    if (!loaded || !rewardedRef.current || adShown) {
      console.log("❌ Cannot show ad:", {
        loaded,
        hasRef: !!rewardedRef.current,
        adShown,
      });
      return;
    }

    try {
      console.log("🎬 Showing ad...");
      setAdShown(true);
      await rewardedRef.current.show();
    } catch (error) {
      console.error("❌ Error showing ad:", error);
      Alert.alert("Error", "Failed to show ad. Please try again.", [
        { text: "OK", onPress: onClose },
      ]);
    }
  };

  return (
    <View className="absolute inset-0 bg-black/90 justify-center items-center z-50 w-full h-screen">
      <View className="bg-white/10 rounded-3xl p-8 mx-4 border-2 border-orange-600/50">
        {/* Diamond Icon */}
        <View className="items-center mb-6">
          <View className="w-24 h-24 bg-orange-600/20 rounded-full items-center justify-center border-4 border-orange-600">
            <Text className="text-6xl">💎</Text>
          </View>
        </View>

        {/* Title */}
        <Text className="text-white text-2xl font-black text-center mb-3">
          Earn Free Gems!
        </Text>

        {/* Description */}
        <Text className="text-white/70 text-center mb-6 font-semibold">
          Watch a short video to earn{"\n"}
          <Text className="text-orange-600 font-black text-xl">1 Gems</Text>
        </Text>

        {/* Loading/Ready State */}
        {loading ? (
          <View className="items-center py-4">
            <ActivityIndicator size="large" color="#EA580C" />
            <Text className="text-white/50 text-sm mt-3 font-semibold">
              Loading ad...
            </Text>
          </View>
        ) : (
          <>
            {/* Watch Ad Button */}
            <TouchableOpacity
              onPress={showAd}
              disabled={!loaded || adShown}
              className={`${
                loaded && !adShown ? "bg-orange-600" : "bg-orange-600/50"
              } rounded-2xl py-4 mb-3`}
            >
              <Text className="text-black text-base font-black text-center tracking-widest">
                {adShown ? "SHOWING..." : loaded ? "WATCH AD" : "UNAVAILABLE"}
              </Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={onClose}
              className="py-3"
              disabled={adShown}
            >
              <Text className="text-white/50 text-sm font-bold text-center">
                Maybe Later
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
