// import { Slot, usePathname } from "expo-router"; // Added usePathname
// import { ClerkProvider, ClerkLoaded, useUser } from "@clerk/clerk-expo";
// import { tokenCache } from "@clerk/clerk-expo/token-cache";
// import { useFonts } from "expo-font";
// import { TailwindProvider } from "tailwindcss-react-native";
// import { AppProvider } from "@/providers/AppProvider";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import ErrorBoundary from "@/components/errorBoundary";
// import SplashScreen from "@/components/spashScreen";
// import { Text, View } from "react-native";
// import { useEffect } from "react";
// import MobileAds from "react-native-google-mobile-ads";
// import { AdsProvider } from "@/providers/AdProvider";
// import "../global.css";
// import { PostHogProvider, usePostHog } from "posthog-react-native";

// // --- NEW: Screen Tracker Component ---
// function PostHogScreenTracker() {
//   const posthog = usePostHog();
//   const pathname = usePathname();

//   useEffect(() => {
//     if (posthog && pathname) {
//       posthog.screen(pathname);
//     }
//   }, [posthog, pathname]);

//   return null;
// }
// // -------------------------------------

// // 1. Created a new Inner component to handle logic that needs User/PostHog context
// function AuthenticatedAppContent() {
//   const posthog = usePostHog();
//   const { user } = useUser();

//   useEffect(() => {
//     if (user && posthog) {
//       posthog.identify(user.id, {
//         email: user.primaryEmailAddress?.emailAddress ?? "",
//         name: user.fullName ?? "",
//         username: user.username ?? "",
//         created_at: user.createdAt ? user.createdAt.toISOString() : "",
//       });
//     }
//   }, [user, posthog]);

//   useEffect(() => {
//     posthog?.capture("app_opened", {
//       timestamp: new Date().toISOString(),
//     });
//   }, [posthog]);

//   return <Slot />;
// }

// export default function RootLayout() {
//   useEffect(() => {
//     MobileAds()
//       .initialize()
//       .then((adapterStatuses) => {
//         console.log("Google Mobile Ads initialized:", adapterStatuses);
//       })
//       .catch((error) => {
//         console.error("Failed to initialize Google Mobile Ads:", error);
//       });
//   }, []);

//   const [loaded] = useFonts({
//     SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
//   });

//   const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
//   const posthogApiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;

//   if (!clerkPublishableKey) {
//     console.error("Missing Clerk Publishable Key!");
//     return (
//       <View className="flex-1 bg-black items-center justify-center">
//         <Text className="text-white text-xl">Configuration Error</Text>
//         <Text className="text-white/50 mt-2">Missing Clerk Key</Text>
//       </View>
//     );
//   }

//    if (!posthogApiKey) {
//      console.error("Missing Posthog Key!");
//      return (
//        <View className="flex-1 bg-black items-center justify-center">
//          <Text className="text-white text-xl">Configuration Error</Text>
//          <Text className="text-white/50 mt-2">Missing Posthog Key</Text>
//        </View>
//      );
//    }

//   if (!loaded) {
//     return <SplashScreen />;
//   }

//   // 2. Reorganized Providers: Providers wrap the content, not the other way around
//   return (
//     <ErrorBoundary>
//       <SafeAreaProvider>
//         <ClerkProvider
//           tokenCache={tokenCache}
//           publishableKey={clerkPublishableKey}
//         >
//           <ClerkLoaded>
//             <PostHogProvider
//               apiKey={posthogApiKey}
//               options={{
//                 host: "https://us.i.posthog.com",
//                 // flushAt: 1, // Send every event immediately (remove this in production!)
//               }}
//             >
//               {/* Added Screen Tracker Here */}
//               <PostHogScreenTracker />

//               <AppProvider>
//                 <AdsProvider>
//                   <TailwindProvider>
//                     <AuthenticatedAppContent />
//                   </TailwindProvider>
//                 </AdsProvider>
//               </AppProvider>
//             </PostHogProvider>
//           </ClerkLoaded>
//         </ClerkProvider>
//       </SafeAreaProvider>
//     </ErrorBoundary>
//   );
// }

import { Redirect, Slot, usePathname } from "expo-router";
import { ClerkProvider, ClerkLoaded, useUser } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { useFonts } from "expo-font";
import { TailwindProvider } from "tailwindcss-react-native";
import { AppProvider, useApp } from "@/providers/AppProvider"; // Added useApp
import { SafeAreaProvider } from "react-native-safe-area-context";
import ErrorBoundary from "@/components/errorBoundary";
import SplashScreen from "@/components/spashScreen";
import { Text, View, Platform } from "react-native";
import { useEffect, useRef } from "react";
import MobileAds from "react-native-google-mobile-ads";
import { AdsProvider } from "@/providers/AdProvider";
import "../global.css";
import { PostHogProvider, usePostHog } from "posthog-react-native";

// --- NEW: Notification Imports ---
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// --- NEW: Configure Notification Handler ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // Added to fix TS error
    shouldShowList: true,   // Added to fix TS error
  }),
});

// --- Screen Tracker Component ---
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

// --- Authenticated Content & Notification Logic ---
function AuthenticatedAppContent() {
  const posthog = usePostHog();
  const { user } = useUser();
  const { registerPushDevice } = useApp(); // Get the action from your context

  // Notification Refs
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // 1. PostHog Identification
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

  // 2. App Opened Tracking
  useEffect(() => {
    posthog?.capture("app_opened", {
      timestamp: new Date().toISOString(),
    });
  }, [posthog]);

  // 3. NEW: Notification Registration Logic
  useEffect(() => {
    // A. Register for Token
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        console.log("🔥 FCM TOKEN:", token);
        registerPushDevice(token);
      }
    });

    // B. Listen for incoming notifications (Foreground)
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Notification Received:", notification);
      });

    // C. Listen for user tapping the notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("👆 Notification Tapped:", response);
      });

    return () => {
      // FIX 2: Call .remove() directly on the subscription object
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [registerPushDevice]);

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
            <PostHogProvider
              apiKey={posthogApiKey}
              options={{
                host: "https://us.i.posthog.com",
              }}
            >
              <PostHogScreenTracker />

              <AppProvider>
                <AdsProvider>
                  <TailwindProvider>
                    {/* Logic is now inside here to access Context */}
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

// --- NEW: Helper Function to Get Token ---
async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (!Device.isDevice) {
    console.log("Must use physical device for Push Notifications");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token for push notification!");
    return null;
  }

  // CRITICAL: getDevicePushTokenAsync gets the raw FCM token for the backend
  // getExpoPushTokenAsync gets the Expo token (not what we want for Go+FCM)
  try {
    const tokenData = await Notifications.getDevicePushTokenAsync();
    return tokenData.data;
  } catch (error) {
    console.error("Error fetching push token:", error);
    return null;
  }
}

export function IndexScreen() {
  return <Redirect href="/(tabs)/add" />;
}