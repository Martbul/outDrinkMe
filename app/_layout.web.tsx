import ErrorBoundary from "@/components/errorBoundary";
import SplashScreen from "@/components/spashScreen";
import { AdsProvider } from "@/providers/AdProvider";
import { AppProvider } from "@/providers/AppProvider";
import { ClerkLoaded, ClerkProvider, useUser } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { useFonts } from "expo-font";
import { Redirect, Slot, usePathname } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TailwindProvider } from "tailwindcss-react-native";
import "../global.css";


export default function RootLayout() {
  // FIX 3: REMOVED the useEffect that called MobileAds().initialize().
  // That logic is now safely inside AdProvider.native.tsx

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const posthogApiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;

  if (!clerkPublishableKey) {
    console.error("Missing Clerk Publishable Key!");
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-xl">Configuration Error</Text>
        <Text className="text-white/50 mt-2">Missing Clerk Key</Text>
      </View>
    );
  }

  if (!posthogApiKey) {
    console.error("Missing Posthog Key!");
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-xl">Configuration Error</Text>
        <Text className="text-white/50 mt-2">Missing Posthog Key</Text>
      </View>
    );
  }

  if (!loaded) {
    return <SplashScreen />;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ClerkProvider
          tokenCache={tokenCache}
          publishableKey={clerkPublishableKey}
        >
          <ClerkLoaded>
              <AppProvider>
                <AdsProvider>
                  <TailwindProvider>
                  </TailwindProvider>
                </AdsProvider>
              </AppProvider>
          </ClerkLoaded>
        </ClerkProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

