// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
//   ReactNode,
//   useRef,
// } from "react";
// import { Alert, Platform } from "react-native";
// import {
//   RewardedAd,
//   RewardedAdEventType,
//   TestIds,
//   AdEventType,
// } from "react-native-google-mobile-ads";
// import { usePostHog } from "posthog-react-native";
//   import MobileAds from "react-native-google-mobile-ads";

// // REPLACE THIS WITH YOUR REAL AD UNIT ID FROM ADMOB CONSOLE (Ads > Ad Units)
// // It looks like: ca-app-pub-1167503921437683/XXXXXXXXXX
// const PRODUCTION_ID = Platform.select({
//   ios: "ca-app-pub-1167503921437683/4220175598",
//   android: "ca-app-pub-1167503921437683/4220175598",
// });

// const adUnitId = __DEV__ ? TestIds.REWARDED : PRODUCTION_ID;
// const isShowingAdRef = useRef(false); //  LOCK

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
//   const posthog = usePostHog();

//   const [isAdLoaded, setIsAdLoaded] = useState(false);
//   const [isAdLoading, setIsAdLoading] = useState(true);
//   const [rewardedAd, setRewardedAd] = useState<RewardedAd | null>(null);

//   // We keep track of the ad instance to remove listeners later
//   const adRef = useRef<RewardedAd | null>(null);
//   const rewardEarnedRef = useRef(false);

//   // Add this import at the top of AdProvider.native.tsx

//   // Inside AdsProvider component...
//   useEffect(() => {
//     // 1. Initialize the SDK first
//     MobileAds()
//       .initialize()
//       .then((adapterStatuses) => {
//         console.log("Google Mobile Ads initialized:", adapterStatuses);
//         // 2. Then load the ad
//         loadAd();
//       });
//   }, []); // Remove loadAd from here, call it inside the .then()

//   const loadAd = useCallback(() => {
//     // Prevent multiple loads
//     if (isAdLoaded) return;

//     try {
//       setIsAdLoading(true);
//       console.log("Loading new rewarded ad...");
//       posthog?.capture("ad_load_requested", { ad_type: "rewarded" });

//       const ad = RewardedAd.createForAdRequest(adUnitId!, {
//         keywords: ["social", "alcohol", "drinks", "party"],
//       });

//       adRef.current = ad;

//       const unsubscribeLoaded = ad.addAdEventListener(
//         RewardedAdEventType.LOADED,
//         () => {
//           console.log("Rewarded ad loaded successfully");
//           setIsAdLoaded(true);
//           setIsAdLoading(false);
//           setRewardedAd(ad);
//           posthog?.capture("ad_loaded_success", { ad_type: "rewarded" });
//         }
//       );

//       const unsubscribeEarned = ad.addAdEventListener(
//         RewardedAdEventType.EARNED_REWARD,
//         (reward) => {
//           console.log("User earned reward:", reward);
//           rewardEarnedRef.current = true;
//           posthog?.capture("ad_reward_earned", {
//             amount: reward.amount,
//             currency: reward.type,
//           });
//         }
//       );

//       // Handle Load Failures
//       const unsubscribeError = ad.addAdEventListener(
//         AdEventType.ERROR,
//         (error) => {
//           console.error("Ad failed to load", error);
//           setIsAdLoading(false);
//           setIsAdLoaded(false);
//         }
//       );

//       ad.load();

//       // Cleanup listeners when the ad instance changes or unmounts
//       return () => {
//         unsubscribeLoaded();
//         unsubscribeEarned();
//         unsubscribeError();
//       };
//     } catch (error: any) {
//       console.error("Failed to initialize rewarded ad:", error);
//       posthog?.capture("ad_system_error", { error: error.message });
//       setIsAdLoading(false);
//     }
//   }, [posthog, isAdLoaded]);

//   useEffect(() => {
//     loadAd();
//   }, []);
//   const showRewardedAd = useCallback((): Promise<boolean> => {
//     return new Promise((resolve) => {
//       // 1. CHECK THE LOCK
//       if (isShowingAdRef.current) {
//         console.log("Ad is already showing, ignoring click");
//         resolve(false);
//         return;
//       }

//       if (!rewardedAd || !isAdLoaded) {
//         Alert.alert("Ad not ready", "Please try again in a moment.");
//         resolve(false);
//         return;
//       }

//       // 2. LOCK IMMEDIATELY
//       isShowingAdRef.current = true;

//       // 3. Immediately mark as unloaded to hide button in UI if you rely on that
//       setIsAdLoaded(false);

//       rewardEarnedRef.current = false;

//       const unsubscribeClosed = rewardedAd.addAdEventListener(
//         AdEventType.CLOSED,
//         () => {
//           console.log("Ad closed");

//           // 4. UNLOCK WHEN CLOSED
//           isShowingAdRef.current = false;

//           const earned = rewardEarnedRef.current;
//           resolve(earned);

//           if (!earned) {
//             posthog?.capture("ad_closed_no_reward");
//           }

//           unsubscribeClosed();
//           setRewardedAd(null);

//           setTimeout(() => loadAd(), 500);
//         }
//       );

//       try {
//         console.log("Showing rewarded ad...");
//         posthog?.capture("ad_impression", { ad_type: "rewarded" });
//         rewardedAd.show();
//       } catch (error: any) {
//         console.error("Error showing rewarded ad:", error);
//         posthog?.capture("ad_show_error", { error: error.message });

//         // Unlock on error
//         isShowingAdRef.current = false;
//         unsubscribeClosed();
//         resolve(false);
//       }
//     });
//   }, [rewardedAd, isAdLoaded, loadAd, posthog]);

//   const reloadAd = useCallback(() => {
//     setRewardedAd(null);
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
import MobileAds, {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
  AdEventType,
} from "react-native-google-mobile-ads";
import { usePostHog } from "posthog-react-native";

// 1. SETUP AD UNIT ID
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
  const [isAdLoading, setIsAdLoading] = useState(true); // Start true until init
  const [rewardedAd, setRewardedAd] = useState<RewardedAd | null>(null);

  // Moved inside component to prevent global state issues
  const isShowingAdRef = useRef(false);
  const rewardEarnedRef = useRef(false);
  const isInitializedRef = useRef(false);

  // 2. LOAD AD FUNCTION
  const loadAd = useCallback(() => {
    // Safety check: Don't load if SDK isn't ready or already loaded
    if (!isInitializedRef.current || isAdLoaded) return;

    try {
      console.log("Loading Ad Unit:", adUnitId);
      setIsAdLoading(true);
      posthog?.capture("ad_load_requested", { ad_type: "rewarded" });

      // Create a new instance
      const ad = RewardedAd.createForAdRequest(adUnitId!, {
        keywords: ["social", "party", "drinks"], // Keywords are optional
      });

      // --- LISTENERS ---
      const unsubscribeLoaded = ad.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          console.log("Rewarded Ad LOADED");
          setIsAdLoaded(true);
          setIsAdLoading(false);
          setRewardedAd(ad);
          posthog?.capture("ad_loaded_success");
        }
      );

      const unsubscribeEarned = ad.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          console.log("Reward Earned:", reward);
          rewardEarnedRef.current = true;
          posthog?.capture("ad_reward_earned", {
            amount: reward.amount,
          });
        }
      );

      const unsubscribeError = ad.addAdEventListener(
        AdEventType.ERROR,
        (error) => {
          console.error("Ad Load Error:", error);
          setIsAdLoading(false);
          setIsAdLoaded(false);
          setRewardedAd(null);
          posthog?.capture("ad_load_error", { message: error.message });
        }
      );

      // --- START LOAD ---
      ad.load();

      // Return cleanup function for this specific ad instance
      return () => {
        unsubscribeLoaded();
        unsubscribeEarned();
        unsubscribeError();
      };
    } catch (error: any) {
      console.error("Failed to create ad request:", error);
      setIsAdLoading(false);
    }
  }, [isAdLoaded, posthog]);

  // 3. INITIALIZATION EFFECT (RUNS ONCE)
  useEffect(() => {
    let cleanupAdListeners: (() => void) | undefined;

    MobileAds()
      .initialize()
      .then((adapterStatuses) => {
        console.log("Mobile Ads Initialized:", adapterStatuses);
        isInitializedRef.current = true;

        // ONLY load the ad after initialization is complete
        cleanupAdListeners = loadAd();
      })
      .catch((err) => {
        console.error("Failed to initialize Mobile Ads SDK", err);
        setIsAdLoading(false);
      });

    return () => {
      if (cleanupAdListeners) cleanupAdListeners();
    };
  }, []); // Empty dependency array ensures this runs once

  // 4. SHOW AD FUNCTION
  const showRewardedAd = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (isShowingAdRef.current) {
        console.log("Ad already showing");
        resolve(false);
        return;
      }

      if (!rewardedAd || !isAdLoaded) {
        // If it failed before, try loading one now for next time
        if (!isAdLoading) loadAd();
        Alert.alert("Ad not ready", "Please wait a moment...");
        resolve(false);
        return;
      }

      isShowingAdRef.current = true;
      rewardEarnedRef.current = false;

      // Update UI immediately
      setIsAdLoaded(false);

      const unsubscribeClosed = rewardedAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          console.log("Ad Closed");
          isShowingAdRef.current = false;

          const earned = rewardEarnedRef.current;
          resolve(earned);

          unsubscribeClosed();
          setRewardedAd(null);

          // Load the next ad
          setTimeout(() => loadAd(), 1000);
        }
      );

      const unsubscribeShowError = rewardedAd.addAdEventListener(
        AdEventType.ERROR,
        (error) => {
          console.error("Ad Show Error:", error);
          isShowingAdRef.current = false;
          unsubscribeClosed();
          unsubscribeShowError();
          resolve(false);
        }
      );

      try {
        rewardedAd.show();
      } catch (error) {
        console.error("Exception showing ad:", error);
        isShowingAdRef.current = false;
        resolve(false);
      }
    });
  }, [rewardedAd, isAdLoaded, isAdLoading, loadAd]);

  const reloadAd = useCallback(() => {
    setRewardedAd(null);
    setIsAdLoaded(false);
    loadAd();
  }, [loadAd]);

  const value = {
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