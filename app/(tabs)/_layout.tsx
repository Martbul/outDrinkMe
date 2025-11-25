import { Tabs, Redirect } from "expo-router";
import { StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Octicons from "@expo/vector-icons/Octicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Feather } from "@expo/vector-icons";
import SplashScreen from "@/components/spashScreen";
import { useApp } from "@/providers/AppProvider";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "@/utils/registerPushNotification";


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { isSignedIn, isLoaded } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const { isInitialLoading } = useApp();
  const { registerPushDevice } = useApp(); 
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);


  //! Uselec timer??
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // A. Register for Token
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        console.log("FCM TOKEN:", token);
        registerPushDevice(token);
      }
    });

    // B. Listen for incoming notifications (Foreground)
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification Received:", notification);
      });

    // C. Listen for user tapping the notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification Tapped:", response);
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
  if (!isSignedIn) {
    return <Redirect href="/(auth)/google-sign-in" />;
  }

  if (isInitialLoading) {
    return <SplashScreen />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            borderTopWidth: 2,
            borderTopColor: "rgba(255, 69, 0, 0.3)",
            paddingTop: 10,
            paddingBottom: 10 + insets.bottom,
            height: 75 + insets.bottom,
            position: "absolute",
          },
          tabBarActiveTintColor: "#ff8c00",
          tabBarInactiveTintColor: "#666666",
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginTop: 4,
          },
          tabBarShowLabel: true,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: focused ? 1 : 0.5,
                }}
              >
                <AntDesign name="home" size={24} color="#ff8c00" />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="mix"
          options={{
            title: "Mix",
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: focused ? 1 : 0.5,
                }}
              >
                <Feather name="users" size={28} color="#ff8c00" />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: "Add",
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: focused ? 1 : 0.5,
                }}
              >
                <MaterialIcons
                  name="add-circle-outline"
                  size={30}
                  color="#ff8c00"
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="collection"
          options={{
            title: "Collect",
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: focused ? 1 : 0.5,
                }}
              >
                <Octicons name="trophy" size={24} color="#ff8c00" />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: "Calendar",
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: focused ? 1 : 0.5,
                }}
              >
                <FontAwesome name="calendar" size={24} color="#ff8c00" />
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
}
