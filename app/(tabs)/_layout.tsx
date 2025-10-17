import { Tabs } from "expo-router";
import { StatusBar, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Octicons from "@expo/vector-icons/Octicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
export default function TabLayout() {
  const insets = useSafeAreaInsets();

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
            marginTop: 5,
          },
          tabBarShowLabel: true,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>
                  <AntDesign name="home" size={24} color="#ff8c00" />
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="duel"
          options={{
            title: "Duel",
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>
                  <MaterialCommunityIcons
                    name="sword-cross"
                    size={24}
                    color="#ff8c00"
                  />
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: "Add",
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>
                  <MaterialIcons
                    name="add-circle-outline"
                    size={32}
                    color="#ff8c00"
                  />
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="achievements"
          options={{
            title: "Awards",
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>
                  <Octicons name="trophy" size={24} color="#ff8c00" />
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: "Calendar",
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>
                  <FontAwesome name="calendar" size={24} color="#ff8c00" />
                </Text>
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
}
