import { Tabs, Redirect } from "expo-router";
import { StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Octicons from "@expo/vector-icons/Octicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Feather } from "@expo/vector-icons";
import SplashScreen from "@/components/spashScreen";
import { useApp } from "@/providers/AppProvider";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { isSignedIn, isLoaded } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const { isInitialLoading } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1500); 

    return () => clearTimeout(timer);
  }, []);

   if (!isSignedIn) {
     return <Redirect href="/(auth)/google-sign-in" />;
   }


  if (!isLoaded || !isReady || isInitialLoading) {
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
          name="buddies"
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
            title: "Collection",
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
