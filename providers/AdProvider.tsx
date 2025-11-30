import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
  AdEventType,
} from "react-native-google-mobile-ads";


const productionAdUnitId = "ca-app-pub-1167503921437683/4220175598";
const adUnitId = __DEV__ ? TestIds.REWARDED : productionAdUnitId;

const rewarded = RewardedAd.createForAdRequest(adUnitId, {
  keywords: ["fashion", "clothing", "accessories"],
});

interface AdsContextType {
  isAdLoaded: boolean;
  isAdLoading: boolean;
  showRewardedAd: () => Promise<boolean>;
  reloadAd: () => void;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

export function AdsProvider({ children }: { children: React.ReactNode }) {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);

  const loadAd = () => {
    // If already loaded or currently loading, stop here
    if (isAdLoaded || isAdLoading) return;

    console.log("Loading Ad with ID:", adUnitId);
    setIsAdLoading(true);
    rewarded.load();
  };

  useEffect(() => {
    if (Platform.OS === "web") return;


    const unsubscribeLoaded = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log("Ad Loaded Successfully");
        setIsAdLoaded(true);
        setIsAdLoading(false);
      }
    );

    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log("User earned reward:", reward);
        // Note: Actual reward logic (giving gems) is 
        setIsAdLoaded(false);
      }
    );

    const unsubscribeClosed = rewarded.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log("Ad Closed");
        setIsAdLoaded(false);
        setIsAdLoading(false);
        loadAd();
      }
    );

    const unsubscribeError = rewarded.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.error("Ad Failed to Load:", error);
        setIsAdLoading(false);
        setIsAdLoaded(false);
      }
    );

    loadAd();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  const showRewardedAd = async (): Promise<boolean> => {
    if (isAdLoaded) {
      return new Promise((resolve) => {
        const earnedListener = rewarded.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          () => {
            earnedListener(); 
            resolve(true);
          }
        );

        const closedListener = rewarded.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            closedListener(); 
           
          }
        );

        try {
          rewarded.show();
        } catch (error) {
          console.error("Failed to show ad:", error);
          resolve(false);
        }
      });
    } else {
      console.log("Ad not ready. Reloading...");
      loadAd();
      return false;
    }
  };

  const reloadAd = () => {
    setIsAdLoaded(false);
    loadAd();
  };

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
