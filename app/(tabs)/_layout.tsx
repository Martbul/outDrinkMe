// import { Tabs } from "expo-router";
// import React from "react";
// import { StatusBar, Text, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function TabLayout() {
//   return (
//     <>
//       {/* <SafeAreaView style={{ flex: 1 }}> */}
//       <StatusBar barStyle="light-content" backgroundColor="#000000" />
//       <Tabs
//         screenOptions={{
//           headerShown: false,
//           tabBarStyle: {
//             backgroundColor: "rgba(0, 0, 0, 0.95)",
//             borderTopWidth: 2,
//             borderTopColor: "rgba(255, 69, 0, 0.3)",
//             paddingTop: 15,
//             paddingBottom: 25,
//             height: 90,
//             position: "absolute",
//           },

//           tabBarActiveTintColor: "#ff8c00",
//           tabBarInactiveTintColor: "#666666",
//           tabBarLabelStyle: {
//             fontSize: 10,
//             fontWeight: "600",
//             textTransform: "uppercase",
//             letterSpacing: 1,
//             marginTop: 5,
//           },
//           tabBarShowLabel: true,
//         }}
//       >
//         <Tabs.Screen
//           name="home"
//           options={{
//             title: "Home",
//             tabBarIcon: ({ focused, color }) => (
//               <View style={{ alignItems: "center", justifyContent: "center" }}>
//                 <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>
//                   🏠
//                 </Text>
//               </View>
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="duel"
//           options={{
//             title: "Duel",
//             tabBarIcon: ({ focused, color }) => (
//               <View style={{ alignItems: "center", justifyContent: "center" }}>
//                 <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>
//                   ⚔️
//                 </Text>
//               </View>
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="add"
//           options={{
//             title: "Add",
//             tabBarIcon: ({ focused, color }) => (
//               <View
//                 style={{
//                   alignItems: "center",
//                   justifyContent: "center",
//                   width: 60,
//                   height: 60,
//                   borderRadius: 30,
//                   backgroundColor: focused
//                     ? "#ff6600"
//                     : "rgba(255, 69, 0, 0.2)",
//                   marginTop: -20,
//                   borderWidth: 3,
//                   borderColor: focused ? "#ff8c00" : "rgba(255, 69, 0, 0.4)",
//                 }}
//               >
//                 <Text style={{ fontSize: 28, opacity: 1 }}>➕</Text>
//               </View>
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="achievements"
//           options={{
//             title: "Awards",
//             tabBarIcon: ({ focused, color }) => (
//               <View style={{ alignItems: "center", justifyContent: "center" }}>
//                 <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>
//                   🏆
//                 </Text>
//               </View>
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="calendar"
//           options={{
//             title: "Calendar",
//             tabBarIcon: ({ focused, color }) => (
//               <View style={{ alignItems: "center", justifyContent: "center" }}>
//                 <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>
//                   🏆
//                 </Text>
//               </View>
//             ),
//           }}
//         />
//       </Tabs>
//       {/* </SafeAreaView> */}
//     </>
//   );
// }


import { Tabs } from "expo-router";
import React from "react";
import { StatusBar, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
            paddingTop: 15,
            paddingBottom: 20 + insets.bottom, // 👈 add safe area padding
            height: 90 + insets.bottom, // 👈 increase height accordingly
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
                  🏠
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
            tabBarIcon: ({ focused }) => (
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
                <Text style={{ fontSize: 28 }}>➕</Text>
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
                  🏆
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
                  📅
                </Text>
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
}
