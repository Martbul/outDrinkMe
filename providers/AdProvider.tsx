// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
//   ReactNode,
//   useRef,
// } from "react";
// import { Alert } from "react-native";
// import {
//   RewardedAd,
//   RewardedAdEventType,
//   TestIds,
// } from "react-native-google-mobile-ads";

// //!TODO: comfigure for prod
// const adUnitId = __DEV__
//   ? TestIds.REWARDED // Test ad unit for development
//   : "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY"; // Your real rewarded ad unit for production

// interface AdsContextType {
//   isAdLoaded: boolean;
//   isAdLoading: boolean;
//   showRewardedAd: () => Promise<boolean>;
//   reloadAd: () => void;
// }

// const AdsContext = createContext<AdsContextType | undefined>(undefined);

// interface AdsProviderProps {
//   children: ReactNode;
// }

// export function AdsProvider({ children }: AdsProviderProps) {
//   const [isAdLoaded, setIsAdLoaded] = useState(false);
//   const [isAdLoading, setIsAdLoading] = useState(true);
//   const [rewardedAd, setRewardedAd] = useState<RewardedAd | null>(null);

//   // Use ref to track reward status across async operations
//   const rewardEarnedRef = useRef(false);
//   const showPromiseRef = useRef<{
//     resolve: (value: boolean) => void;
//     reject: (reason?: any) => void;
//   } | null>(null);

//   const loadAd = useCallback(() => {
//     try {
//       setIsAdLoading(true);
//       console.log("Loading new rewarded ad...");

//       // Create rewarded ad
//        const ad = RewardedAd.createForAdRequest(adUnitId, {
//          keywords: [
//            "fashion",
//            "clothing",
//            "lifestyle",
//            "social",
//            "alcohol",
//            "drinks",
//            "party",
//            "entertainment",
//          ],

//          // GDPR compliance - set to true for EU users if needed
//          // requestNonPersonalizedAdsOnly: true,
//        });
//       // Listen for ad loaded
//       const unsubscribeLoaded = ad.addAdEventListener(
//         RewardedAdEventType.LOADED,
//         () => {
//           console.log("Rewarded ad loaded successfully");
//           setIsAdLoaded(true);
//           setIsAdLoading(false);
//         }
//       );

//       // Listen for reward earned - THIS IS THE KEY EVENT
//       const unsubscribeEarned = ad.addAdEventListener(
//         RewardedAdEventType.EARNED_REWARD,
//         (reward) => {
//           console.log("User earned reward:", reward);
//           rewardEarnedRef.current = true;
//         }
//       );

//       setRewardedAd(ad);
//       ad.load();

//       return () => {
//         unsubscribeLoaded();
//         unsubscribeEarned();
//       };
//     } catch (error) {
//       console.error("Failed to initialize rewarded ad:", error);
//       setIsAdLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     // Small delay to ensure SDK is initialized
//     const timer = setTimeout(() => {
//       const cleanup = loadAd();
//       return cleanup;
//     }, 1000);

//     return () => {
//       clearTimeout(timer);
//     };
//   }, [loadAd]);

//   const showRewardedAd = useCallback((): Promise<boolean> => {
//     return new Promise((resolve, reject) => {
//       if (!rewardedAd) {
//         Alert.alert("Error", "Ad not initialized");
//         resolve(false);
//         return;
//       }

//       if (!isAdLoaded) {
//         Alert.alert(
//           "Ad Loading",
//           "The ad is still loading. Please try again in a moment.",
//           [{ text: "OK" }]
//         );
//         resolve(false);
//         return;
//       }

//       try {
//         // Reset reward flag and store promise resolvers
//         rewardEarnedRef.current = false;
//         showPromiseRef.current = { resolve, reject };

//         console.log("Showing rewarded ad...");

//         rewardedAd.show();

//         const checkTimeout = setTimeout(() => {
//           console.log("Ad session ended, checking reward status...");
//           const earnedReward = rewardEarnedRef.current;

//           if (earnedReward) {
//             console.log("Reward was earned!");
//           } else {
//             console.log("Ad closed without earning reward");
//           }

//           if (showPromiseRef.current) {
//             showPromiseRef.current.resolve(earnedReward);
//             showPromiseRef.current = null;
//           }

//           // Reload ad for next time
//           setIsAdLoaded(false);
//           loadAd();
//         }, 1000); // Small delay to ensure reward event fires first
//       } catch (error) {
//         console.error("Error showing rewarded ad:", error);
//         Alert.alert("Error", "Failed to show ad. Please try again.");

//         if (showPromiseRef.current) {
//           showPromiseRef.current.resolve(false);
//           showPromiseRef.current = null;
//         }
//       }
//     });
//   }, [rewardedAd, isAdLoaded, loadAd]);

//   const reloadAd = useCallback(() => {
//     setIsAdLoaded(false);
//     loadAd();
//   }, [loadAd]);

//   const value: AdsContextType = {
//     isAdLoaded,
//     isAdLoading,
//     showRewardedAd,
//     reloadAd,
//   };

//   return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
// }

// export function useAds() {
//   const context = useContext(AdsContext);
//   if (context === undefined) {
//     throw new Error("useAds must be used within an AdsProvider");
//   }
//   return context;
// }
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import { Alert, Platform } from "react-native";
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
  AdEventType,
} from "react-native-google-mobile-ads";
import { usePostHog } from "posthog-react-native";

// REPLACE THIS WITH YOUR REAL AD UNIT ID FROM ADMOB CONSOLE (Ads > Ad Units)
// It looks like: ca-app-pub-1167503921437683/XXXXXXXXXX
const PRODUCTION_ID = Platform.select({
  ios: "ca-app-pub-1167503921437683/4220175598",
  android: "ca-app-pub-1167503921437683/4220175598",
});

const adUnitId = __DEV__ ? TestIds.REWARDED : PRODUCTION_ID;

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
  const posthog = usePostHog();

  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(true);
  const [rewardedAd, setRewardedAd] = useState<RewardedAd | null>(null);

  // We keep track of the ad instance to remove listeners later
  const adRef = useRef<RewardedAd | null>(null);
  const rewardEarnedRef = useRef(false);

  const loadAd = useCallback(() => {
    // Prevent multiple loads
    if (isAdLoaded) return;

    try {
      setIsAdLoading(true);
      console.log("Loading new rewarded ad...");
      posthog?.capture("ad_load_requested", { ad_type: "rewarded" });

      const ad = RewardedAd.createForAdRequest(adUnitId!, {
        keywords: ["social", "alcohol", "drinks", "party"],
      });

      adRef.current = ad;

      const unsubscribeLoaded = ad.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          console.log("Rewarded ad loaded successfully");
          setIsAdLoaded(true);
          setIsAdLoading(false);
          setRewardedAd(ad);
          posthog?.capture("ad_loaded_success", { ad_type: "rewarded" });
        }
      );

      const unsubscribeEarned = ad.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          console.log("User earned reward:", reward);
          rewardEarnedRef.current = true;
          posthog?.capture("ad_reward_earned", {
            amount: reward.amount,
            currency: reward.type,
          });
        }
      );

      // Handle Load Failures
      const unsubscribeError = ad.addAdEventListener(
        AdEventType.ERROR,
        (error) => {
          console.error("Ad failed to load", error);
          setIsAdLoading(false);
          setIsAdLoaded(false);
        }
      );

      ad.load();

      // Cleanup listeners when the ad instance changes or unmounts
      return () => {
        unsubscribeLoaded();
        unsubscribeEarned();
        unsubscribeError();
      };
    } catch (error: any) {
      console.error("Failed to initialize rewarded ad:", error);
      posthog?.capture("ad_system_error", { error: error.message });
      setIsAdLoading(false);
    }
  }, [posthog, isAdLoaded]);

  // Initial load
  useEffect(() => {
    loadAd();
  }, []); // Only run once on mount

  const showRewardedAd = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!rewardedAd || !isAdLoaded) {
        Alert.alert("Ad not ready", "Please try again in a moment.");
        resolve(false);
        return;
      }

      rewardEarnedRef.current = false;

      // Define the close listener inside the show function so we can resolve the promise
      const unsubscribeClosed = rewardedAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          console.log("Ad closed");

          const earned = rewardEarnedRef.current;

          // 1. Resolve the promise for the UI
          resolve(earned);

          // 2. Track if closed without reward
          if (!earned) {
            posthog?.capture("ad_closed_no_reward");
          }

          // 3. Cleanup and Reload next ad
          unsubscribeClosed();
          setRewardedAd(null);
          setIsAdLoaded(false);

          // Load next ad after a short delay to ensure smooth UI transition
          setTimeout(() => loadAd(), 500);
        }
      );

      try {
        console.log("Showing rewarded ad...");
        posthog?.capture("ad_impression", { ad_type: "rewarded" });
        rewardedAd.show();
      } catch (error: any) {
        console.error("Error showing rewarded ad:", error);
        posthog?.capture("ad_show_error", { error: error.message });
        unsubscribeClosed(); // Clean up listener
        resolve(false);
      }
    });
  }, [rewardedAd, isAdLoaded, loadAd, posthog]);

  const reloadAd = useCallback(() => {
    setRewardedAd(null);
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