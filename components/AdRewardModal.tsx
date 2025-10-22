import React, { useState, useEffect } from "react";
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
const adUnitId = __DEV__
  ? TestIds.REWARDED
  : "ca-app-pub-1167503921437683/4220175598";

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
  const [rewarded, setRewarded] = useState<RewardedAd | null>(null);

  useEffect(() => {
    // Create rewarded ad instance
    const rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    // Event listeners - only LOADED and EARNED_REWARD are available
    const loadedListener = rewardedAd.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log("Ad loaded successfully");
        setLoaded(true);
        setLoading(false);
      }
    );

    const earnedListener = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log("User earned reward:", reward);
        // Award gems (typically 10-50 gems per ad)
        onRewardEarned(25);
        setRewarded(null);
        // Close modal after reward with small delay
        setTimeout(() => onClose(), 500);
      }
    );

    // Load the ad
    rewardedAd.load();
    setRewarded(rewardedAd);

    // Timeout fallback in case ad fails to load
    const timeout = setTimeout(() => {
      if (!loaded && loading) {
        console.log("Ad load timeout");
        setLoading(false);
        Alert.alert(
          "Ad Unavailable",
          "Unable to load ad. Please try again later."
        );
        onClose();
      }
    }, 10000); // 10 second timeout

    // Cleanup
    return () => {
      loadedListener();
      earnedListener();
      clearTimeout(timeout);
    };
  }, []);

  const showAd = () => {
    if (loaded && rewarded) {
      rewarded.show();
    }
  };

  return (
    <View className="absolute inset-0 bg-black/90 justify-center items-center z-50">
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
          <Text className="text-orange-600 font-black text-xl">25 Gems</Text>
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
              disabled={!loaded}
              className={`${
                loaded ? "bg-orange-600" : "bg-orange-600/50"
              } rounded-2xl py-4 mb-3`}
            >
              <Text className="text-black text-base font-black text-center tracking-widest">
                {loaded ? "WATCH AD" : "LOADING..."}
              </Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity onPress={onClose} className="py-3">
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