import { Slot, usePathname } from "expo-router"; // Added usePathname
import { ClerkProvider, ClerkLoaded, useUser } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { useFonts } from "expo-font";
import { TailwindProvider } from "tailwindcss-react-native";
import { AppProvider } from "@/providers/AppProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ErrorBoundary from "@/components/errorBoundary";
import SplashScreen from "@/components/spashScreen";
import { Text, View } from "react-native";
import { useEffect } from "react";
import MobileAds from "react-native-google-mobile-ads";
import { AdsProvider } from "@/providers/AdProvider";
import "../global.css";
import { PostHogProvider, usePostHog } from "posthog-react-native";

// --- NEW: Screen Tracker Component ---
function PostHogScreenTracker() {
  const posthog = usePostHog();
  const pathname = usePathname();

  useEffect(() => {
    if (posthog && pathname) {
      posthog.screen(pathname);
    }
  }, [posthog, pathname]);

  return null;
}
// -------------------------------------

// 1. Created a new Inner component to handle logic that needs User/PostHog context
function AuthenticatedAppContent() {
  const posthog = usePostHog();
  const { user } = useUser();

  useEffect(() => {
    if (user && posthog) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress ?? "",
        name: user.fullName ?? "",
        username: user.username ?? "",
        created_at: user.createdAt ? user.createdAt.toISOString() : "",
      });
    }
  }, [user, posthog]);

  useEffect(() => {
    posthog?.capture("app_opened", {
      timestamp: new Date().toISOString(),
    });
  }, [posthog]);

  return <Slot />;
}

export default function RootLayout() {
  useEffect(() => {
    MobileAds()
      .initialize()
      .then((adapterStatuses) => {
        console.log("Google Mobile Ads initialized:", adapterStatuses);
      })
      .catch((error) => {
        console.error("Failed to initialize Google Mobile Ads:", error);
      });
  }, []);

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!clerkPublishableKey) {
    console.error("Missing Clerk Publishable Key!");
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-xl">Configuration Error</Text>
        <Text className="text-white/50 mt-2">Missing Clerk Key</Text>
      </View>
    );
  }

  if (!loaded) {
    return <SplashScreen />;
  }

  // 2. Reorganized Providers: Providers wrap the content, not the other way around
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ClerkProvider
          tokenCache={tokenCache}
          publishableKey={clerkPublishableKey}
        >
          <ClerkLoaded>
            <PostHogProvider
              apiKey="phc_uKyX8lafavzA3k7eDokargFjl00Cx4Upqgb2bizdC1D"
              options={{
                host: "https://us.i.posthog.com",
                // flushAt: 1, // Send every event immediately (remove this in production!)
              }}
            >
              {/* Added Screen Tracker Here */}
              <PostHogScreenTracker />

              <AppProvider>
                <AdsProvider>
                  <TailwindProvider>
                    <AuthenticatedAppContent />
                  </TailwindProvider>
                </AdsProvider>
              </AppProvider>
            </PostHogProvider>
          </ClerkLoaded>
        </ClerkProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
