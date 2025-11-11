import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import { Alert } from "react-native";
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

//!TODO: comfigure for prod
const adUnitId = __DEV__
  ? TestIds.REWARDED // Test ad unit for development
  : "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY"; // Your real rewarded ad unit for production

interface AdsContextType {
  isAdLoaded: boolean;
  isAdLoading: boolean;
  showRewardedAd: () => Promise<boolean>;
  reloadAd: () => void;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

interface AdsProviderProps {
  children: ReactNode;
}

export function AdsProvider({ children }: AdsProviderProps) {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(true);
  const [rewardedAd, setRewardedAd] = useState<RewardedAd | null>(null);

  // Use ref to track reward status across async operations
  const rewardEarnedRef = useRef(false);
  const showPromiseRef = useRef<{
    resolve: (value: boolean) => void;
    reject: (reason?: any) => void;
  } | null>(null);

  const loadAd = useCallback(() => {
    try {
      setIsAdLoading(true);
      console.log("Loading new rewarded ad...");

      // Create rewarded ad
       const ad = RewardedAd.createForAdRequest(adUnitId, {
         keywords: [
           "fashion",
           "clothing",
           "lifestyle",
           "social",
           "alcohol",
           "drinks",
           "party",
           "entertainment",
         ],

         // GDPR compliance - set to true for EU users if needed
         // requestNonPersonalizedAdsOnly: true,
       });
      // Listen for ad loaded
      const unsubscribeLoaded = ad.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          console.log("Rewarded ad loaded successfully");
          setIsAdLoaded(true);
          setIsAdLoading(false);
        }
      );

      // Listen for reward earned - THIS IS THE KEY EVENT
      const unsubscribeEarned = ad.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          console.log("User earned reward:", reward);
          rewardEarnedRef.current = true;
        }
      );

      setRewardedAd(ad);
      ad.load();

      return () => {
        unsubscribeLoaded();
        unsubscribeEarned();
      };
    } catch (error) {
      console.error("Failed to initialize rewarded ad:", error);
      setIsAdLoading(false);
    }
  }, []);

  useEffect(() => {
    // Small delay to ensure SDK is initialized
    const timer = setTimeout(() => {
      const cleanup = loadAd();
      return cleanup;
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [loadAd]);

  const showRewardedAd = useCallback((): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (!rewardedAd) {
        Alert.alert("Error", "Ad not initialized");
        resolve(false);
        return;
      }

      if (!isAdLoaded) {
        Alert.alert(
          "Ad Loading",
          "The ad is still loading. Please try again in a moment.",
          [{ text: "OK" }]
        );
        resolve(false);
        return;
      }

      try {
        // Reset reward flag and store promise resolvers
        rewardEarnedRef.current = false;
        showPromiseRef.current = { resolve, reject };

        console.log("Showing rewarded ad...");

      
        rewardedAd.show();

        const checkTimeout = setTimeout(() => {
          console.log("Ad session ended, checking reward status...");
          const earnedReward = rewardEarnedRef.current;

          if (earnedReward) {
            console.log("Reward was earned!");
          } else {
            console.log("Ad closed without earning reward");
          }

          if (showPromiseRef.current) {
            showPromiseRef.current.resolve(earnedReward);
            showPromiseRef.current = null;
          }

          // Reload ad for next time
          setIsAdLoaded(false);
          loadAd();
        }, 1000); // Small delay to ensure reward event fires first
      } catch (error) {
        console.error("Error showing rewarded ad:", error);
        Alert.alert("Error", "Failed to show ad. Please try again.");

        if (showPromiseRef.current) {
          showPromiseRef.current.resolve(false);
          showPromiseRef.current = null;
        }
      }
    });
  }, [rewardedAd, isAdLoaded, loadAd]);

  const reloadAd = useCallback(() => {
    setIsAdLoaded(false);
    loadAd();
  }, [loadAd]);

  const value: AdsContextType = {
    isAdLoaded,
    isAdLoading,
    showRewardedAd,
    reloadAd,
  };

  return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
}

export function useAds() {
  const context = useContext(AdsContext);
  if (context === undefined) {
    throw new Error("useAds must be used within an AdsProvider");
  }
  return context;
}
