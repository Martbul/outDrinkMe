import React, { createContext, useContext, useState } from "react";

interface AdsContextType {
  isAdLoaded: boolean;
  isAdLoading: boolean;
  showRewardedAd: () => Promise<boolean>;
  reloadAd: () => void;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

export function AdsProvider({ children }: { children: React.ReactNode }) {
  const [isAdLoaded] = useState(false);
  const [isAdLoading] = useState(false);

  const showRewardedAd = async (): Promise<boolean> => {
    console.warn("Rewarded Ads are not supported on the Web PWA.");
    return false;
  };

  const reloadAd = () => {
    // No-op for web
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
