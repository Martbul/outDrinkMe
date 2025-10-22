import { Slot } from "expo-router";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { useFonts } from "expo-font";
import { TailwindProvider } from "tailwindcss-react-native";
import { AppProvider } from "@/providers/AppProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ErrorBoundary from "@/components/errorBoundary";
import "../global.css";
import SplashScreen from "@/components/spashScreen";

export default function RootLayout() {
  // Load custom fonts
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Show splash screen while fonts are loading
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
              <TailwindProvider>
                <Slot />
              </TailwindProvider>
            </AppProvider>
          </ClerkLoaded>
        </ClerkProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
