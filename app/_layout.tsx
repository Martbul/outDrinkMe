import ErrorBoundary from "@/components/errorBoundary";
import SplashScreen from "@/components/spashScreen";
import { AdsProvider } from "@/providers/AdProvider";
import { AppProvider } from "@/providers/AppProvider";
import { ClerkLoaded, ClerkProvider, useUser } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { useFonts } from "expo-font";
import { Slot, usePathname } from "expo-router";
import { PostHogProvider, usePostHog } from "posthog-react-native";
import { useEffect } from "react";
import PostHog from "posthog-react-native";
import { Platform, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TailwindProvider } from "tailwindcss-react-native";
import { AppStorage } from "@/utils/storage"; 
import "../global.css";
import { DrunkGameProvider } from "@/providers/DrunkGameProvider";
import DeepLinkHandler from "@/components/deepLinkHandler";
import MandatoryUpdateModal from "@/components/mandatoryUpdateModal";

let posthog: PostHog;

if (Platform.OS === "web") {
  // WEB: Uses the real LocalStorage wrapper from storage.web.ts
  posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_API_KEY!, {
    host: "https://us.i.posthog.com",
    customStorage: AppStorage,
  });
} else {
  // MOBILE: Uses 'memory'. The AppStorage import exists but is ignored here.
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
   </>
 );}

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
        <ClerkProvider
          tokenCache={tokenCache}
          publishableKey={clerkPublishableKey}
        >
          <ClerkLoaded>
            <PostHogProvider client={posthog}>
              <PostHogScreenTracker />
              <AppProvider>
                <DrunkGameProvider>
                  <AdsProvider>
                    <TailwindProvider>
                      <AuthenticatedAppContent />
                        <MandatoryUpdateModal  />
                    </TailwindProvider>
                  </AdsProvider>
                </DrunkGameProvider>
              </AppProvider>
            </PostHogProvider>
          </ClerkLoaded>
        </ClerkProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
