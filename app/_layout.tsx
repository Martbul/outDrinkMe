import ErrorBoundary from "@/components/errorBoundary";
import SplashScreen from "@/components/spashScreen";
import { AdsProvider } from "@/providers/AdProvider";
import { AppProvider, useApp } from "@/providers/AppProvider";
import { ClerkLoaded, ClerkProvider, useUser } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { useFonts } from "expo-font";
import { Slot, usePathname } from "expo-router";
import PostHog, { PostHogProvider, usePostHog } from "posthog-react-native";
import { useEffect } from "react";
import { Platform, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TailwindProvider } from "tailwindcss-react-native";
import { AppStorage } from "@/utils/storage";
import { DrunkGameProvider } from "@/providers/DrunkGameProvider";
import DeepLinkHandler from "@/components/deepLinkHandler";
import MandatoryUpdateModal from "@/components/mandatoryUpdateModal";
import "../global.css";
import { FunctionProvider } from "@/providers/FunctionProvider";
import { RateAppModal } from "@/components/rate_app";

let posthog: PostHog;

if (Platform.OS === "web") {
  posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_API_KEY!, {
    host: "https://us.i.posthog.com",
    customStorage: AppStorage,
  });
} else {
  posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_API_KEY!, {
    host: "https://us.i.posthog.com",
    persistence: "memory",
  });
}

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

function AuthenticatedAppContent() {
  const posthog = usePostHog();
  const { user } = useUser();
    const { showRateModal, closeRateModal } = useApp();

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

  return (
    <>
      <DeepLinkHandler />

      <Slot />
      <RateAppModal visible={showRateModal} onClose={closeRateModal} />
    </>
  );
}

export default function RootLayout() {
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
        <ClerkProvider tokenCache={tokenCache} publishableKey={clerkPublishableKey}>
          <ClerkLoaded>
            <PostHogProvider client={posthog}>
              <PostHogScreenTracker />
              <AppProvider>
                <FunctionProvider>
                  <DrunkGameProvider>
                    <AdsProvider>
                      <TailwindProvider>
                        <AuthenticatedAppContent />
                        <MandatoryUpdateModal />
                      </TailwindProvider>
                    </AdsProvider>
                  </DrunkGameProvider>
                </FunctionProvider>
              </AppProvider>
            </PostHogProvider>
          </ClerkLoaded>
        </ClerkProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
