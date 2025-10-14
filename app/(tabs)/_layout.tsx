import { Tabs } from "expo-router";
import React from "react";
import { StatusBar, Text, View } from "react-native";

export default function TabLayout() {
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
            paddingTop: 15,
            paddingBottom: 25,
            height: 90,
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
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused, color }) => (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>
                  🏠
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="battle"
          options={{
            title: "Battle",
            tabBarIcon: ({ focused, color }) => (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>
                  ⚔️
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: "Add",
            tabBarIcon: ({ focused, color }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: focused
                    ? "#ff6600"
                    : "rgba(255, 69, 0, 0.2)",
                  marginTop: -20,
                  borderWidth: 3,
                  borderColor: focused ? "#ff8c00" : "rgba(255, 69, 0, 0.4)",
                }}
              >
                <Text style={{ fontSize: 28, opacity: 1 }}>➕</Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="achievements"
          options={{
            title: "Awards",
            tabBarIcon: ({ focused, color }) => (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>
                  🏆
                </Text>
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
}
