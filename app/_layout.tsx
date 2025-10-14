import { Stack } from "expo-router";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { StatusBar } from "react-native";
import ErrorBoundary from "@/components/errorBoundary";
import { UserDataProvider } from "@/providers/UserDataProvider";
import { useFonts } from "expo-font";
import { TailwindProvider } from "tailwindcss-react-native";
import "../global.css";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ErrorBoundary>
      <ClerkProvider
        tokenCache={tokenCache}
        publishableKey={clerkPublishableKey}
      >
        <UserDataProvider>
          <TailwindProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(screens)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar />
          </TailwindProvider>
        </UserDataProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
