import mobileAds, { MaxAdContentRating } from "react-native-google-mobile-ads";

export const initializeAdMob = async () => {
  try {
    await mobileAds().initialize();
    console.log("AdMob initialized successfully");

    // Optional: Set request configuration
    await mobileAds().setRequestConfiguration({
      // Max Ad Content Rating
      maxAdContentRating: MaxAdContentRating.T, // T for Teen
      // Other options: MaxAdContentRating.G, MaxAdContentRating.PG, MaxAdContentRating.MA

      // Indicate to serve non-personalized ads
      tagForChildDirectedTreatment: false,

      // Indicate to under age of consent
      tagForUnderAgeOfConsent: false,
    });

    return true;
  } catch (error) {
    console.error("Failed to initialize AdMob:", error);
    return false;
  }
};
