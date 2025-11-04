import { Slot } from "expo-router";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { useFonts } from "expo-font";
import { TailwindProvider } from "tailwindcss-react-native";
import { AppProvider } from "@/providers/AppProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ErrorBoundary from "@/components/errorBoundary";
import SplashScreen from "@/components/spashScreen";
import { Text, View } from "react-native";
import "../global.css";


export default function RootLayout() {

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
