// import React, { useRef, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   Animated,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// // Animated Header Component
// export const Header = ({ activeTab, onTabChange }) => {
//   const scrollY = useRef(new Animated.Value(0)).current;

//   // Animated values for tab bar
//   const tabBarHeight = scrollY.interpolate({
//     inputRange: [0, 50],
//     outputRange: [48, 0],
//     extrapolate: "clamp",
//   });

//   const tabBarOpacity = scrollY.interpolate({
//     inputRange: [0, 50],
//     outputRange: [1, 0],
//     extrapolate: "clamp",
//   });

//   return {
//     scrollHandler: Animated.event(
//       [{ nativeEvent: { contentOffset: { y: scrollY } } }],
//       { useNativeDriver: false }
//     ),
//     HeaderComponent: () => (
//       <View className="bg-black">
//         {/* Top Header - Always Visible */}
//         <SafeAreaView edges={["top"]} className="bg-black">
//           <View className="px-4 py-3 flex-row items-center justify-between">
//             {/* Left: Level Badge */}
//             <View className="flex-row items-center">
//               <View className="w-10 h-10 rounded-full bg-orange-600 items-center justify-center mr-3">
//                 <Text className="text-black text-sm font-black">5</Text>
//               </View>
//               <View>
//                 <Text className="text-white text-sm font-bold">Level 5</Text>
//                 <View className="w-24 h-1.5 bg-gray-800 rounded-full mt-1">
//                   <View className="w-16 h-full bg-orange-600 rounded-full" />
//                 </View>
//               </View>
//             </View>

//             {/* Right: Stats */}
//             <View className="flex-row items-center gap-4">
//               {/* Streak */}
//               <View className="flex-row items-center">
//                 <Text className="text-2xl mr-1">🔥</Text>
//                 <Text className="text-white text-lg font-bold">7</Text>
//               </View>

//               {/* Days This Week */}
//               <View className="flex-row items-center">
//                 <Text className="text-2xl mr-1">📅</Text>
//                 <Text className="text-white text-lg font-bold">5</Text>
//               </View>

//               {/* Notifications */}
//               <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-900 items-center justify-center">
//                 <Text className="text-xl">🔔</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </SafeAreaView>

//         {/* Animated Tab Bar - Shrinks on Scroll */}
//         <Animated.View
//           style={{
//             height: tabBarHeight,
//             opacity: tabBarOpacity,
//             overflow: "hidden",
//           }}
//         >
//           <View className="flex-row px-4 border-b border-gray-900">
//             <TouchableOpacity
//               onPress={() => onTabChange("for-you")}
//               className="flex-1 items-center justify-center"
//             >
//               <Text
//                 className={`text-base font-bold pb-3 ${
//                   activeTab === "for-you" ? "text-orange-500" : "text-gray-600"
//                 }`}
//               >
//                 For You
//               </Text>
//               {activeTab === "for-you" && (
//                 <View className="absolute bottom-0 w-full h-1 bg-orange-600 rounded-t-lg" />
//               )}
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={() => onTabChange("friends")}
//               className="flex-1 items-center justify-center"
//             >
//               <Text
//                 className={`text-base font-bold pb-3 ${
//                   activeTab === "friends" ? "text-orange-500" : "text-gray-600"
//                 }`}
//               >
//                 Friends
//               </Text>
//               {activeTab === "friends" && (
//                 <View className="absolute bottom-0 w-full h-1 bg-orange-600 rounded-t-lg" />
//               )}
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={() => onTabChange("discovery")}
//               className="flex-1 items-center justify-center"
//             >
//               <Text
//                 className={`text-base font-bold pb-3 ${
//                   activeTab === "discovery"
//                     ? "text-orange-500"
//                     : "text-gray-600"
//                 }`}
//               >
//                 Discovery
//               </Text>
//               {activeTab === "discovery" && (
//                 <View className="absolute bottom-0 w-full h-1 bg-orange-600 rounded-t-lg" />
//               )}
//             </TouchableOpacity>
//           </View>
//         </Animated.View>
//       </View>
//     ),
//   };
// };

// import React from "react";
// import { View, Text, TouchableOpacity, Animated } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// // Animated Header Component - Fixed Version
// export const Header = ({ activeTab, onTabChange, scrollY }) => {
//   // Animated values for tab bar
//   const tabBarHeight = scrollY.interpolate({
//     inputRange: [0, 50],
//     outputRange: [48, 0],
//     extrapolate: "clamp",
//   });

//   const tabBarOpacity = scrollY.interpolate({
//     inputRange: [0, 50],
//     outputRange: [1, 0],
//     extrapolate: "clamp",
//   });

//   return (
//     <View className="bg-black">
//       {/* Top Header - Always Visible */}
//       <SafeAreaView edges={["top"]} className="bg-black">
//         <View className="px-4 py-3 flex-row items-center justify-between">
//           {/* Left: Level Badge */}
//           <View className="flex-row items-center">
//             <View className="w-10 h-10 rounded-full bg-orange-600 items-center justify-center mr-3">
//               <Text className="text-black text-sm font-black">5</Text>
//             </View>
//             <View>
//               <Text className="text-white text-sm font-bold">Level 5</Text>
//               <View className="w-24 h-1.5 bg-gray-800 rounded-full mt-1">
//                 <View className="w-16 h-full bg-orange-600 rounded-full" />
//               </View>
//             </View>
//           </View>

//           {/* Right: Stats */}
//           <View className="flex-row items-center gap-4">
//             {/* Streak */}
//             <View className="flex-row items-center">
//               <Text className="text-2xl mr-1">🔥</Text>
//               <Text className="text-white text-lg font-bold">7</Text>
//             </View>

//             {/* Days This Week */}
//             <View className="flex-row items-center">
//               <Text className="text-2xl mr-1">📅</Text>
//               <Text className="text-white text-lg font-bold">5</Text>
//             </View>

//             {/* Notifications */}
//             <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-900 items-center justify-center">
//               <Text className="text-xl">🔔</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </SafeAreaView>

//       {/* Animated Tab Bar - Shrinks on Scroll */}
//       <Animated.View
//         style={{
//           height: tabBarHeight,
//           opacity: tabBarOpacity,
//           overflow: "hidden",
//         }}
//       >
//         <View className="flex-row px-4 border-b border-gray-900">
//           <TouchableOpacity
//             onPress={() => onTabChange("for-you")}
//             className="flex-1 items-center justify-center"
//           >
//             <Text
//               className={`text-base font-bold pb-3 ${
//                 activeTab === "for-you" ? "text-orange-500" : "text-gray-600"
//               }`}
//             >
//               For You
//             </Text>
//             {activeTab === "for-you" && (
//               <View className="absolute bottom-0 w-full h-1 bg-orange-600 rounded-t-lg" />
//             )}
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => onTabChange("friends")}
//             className="flex-1 items-center justify-center"
//           >
//             <Text
//               className={`text-base font-bold pb-3 ${
//                 activeTab === "friends" ? "text-orange-500" : "text-gray-600"
//               }`}
//             >
//               Friends
//             </Text>
//             {activeTab === "friends" && (
//               <View className="absolute bottom-0 w-full h-1 bg-orange-600 rounded-t-lg" />
//             )}
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => onTabChange("discovery")}
//             className="flex-1 items-center justify-center"
//           >
//             <Text
//               className={`text-base font-bold pb-3 ${
//                 activeTab === "discovery" ? "text-orange-500" : "text-gray-600"
//               }`}
//             >
//               Discovery
//             </Text>
//             {activeTab === "discovery" && (
//               <View className="absolute bottom-0 w-full h-1 bg-orange-600 rounded-t-lg" />
//             )}
//           </TouchableOpacity>
//         </View>
//       </Animated.View>
//     </View>
//   );
// };

// import React from "react";
// import { View, Text, TouchableOpacity, Animated } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// export const Header = ({ activeTab, onTabChange, scrollY }) => {
//   // Ensure scrollY is a valid Animated.Value
//   const animatedScrollY = React.useMemo(
//     () => (scrollY instanceof Animated.Value ? scrollY : new Animated.Value(0)),
//     [scrollY]
//   );

//   // Animated tab bar height & opacity
//   const tabBarHeight = animatedScrollY.interpolate({
//     inputRange: [0, 50],
//     outputRange: [48, 0],
//     extrapolate: "clamp",
//   });

//   const tabBarOpacity = animatedScrollY.interpolate({
//     inputRange: [0, 50],
//     outputRange: [1, 0],
//     extrapolate: "clamp",
//   });

//   return (
//     <View style={{ backgroundColor: "black" }}>
//       {/* Top Header - Always Visible */}
//       <SafeAreaView edges={["top"]} style={{ backgroundColor: "black" }}>
//         <View
//           style={{
//             paddingHorizontal: 16,
//             paddingVertical: 12,
//             flexDirection: "row",
//             alignItems: "center",
//             justifyContent: "space-between",
//           }}
//         >
//           {/* Left: Level Badge */}
//           <View style={{ flexDirection: "row", alignItems: "center" }}>
//             <View
//               style={{
//                 width: 40,
//                 height: 40,
//                 borderRadius: 20,
//                 backgroundColor: "#EA580C",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 marginRight: 12,
//               }}
//             >
//               <Text style={{ color: "black", fontWeight: "900" }}>5</Text>
//             </View>
//             <View>
//               <Text style={{ color: "white", fontWeight: "700" }}>Level 5</Text>
//               <View
//                 style={{
//                   width: 96,
//                   height: 6,
//                   backgroundColor: "#1F2937",
//                   borderRadius: 4,
//                   marginTop: 4,
//                 }}
//               >
//                 <View
//                   style={{
//                     width: 64,
//                     height: "100%",
//                     backgroundColor: "#EA580C",
//                     borderRadius: 4,
//                   }}
//                 />
//               </View>
//             </View>
//           </View>

//           {/* Right: Stats */}
//           <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
//             {/* Streak */}
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//               <Text style={{ fontSize: 20, marginRight: 4 }}>🔥</Text>
//               <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
//                 7
//               </Text>
//             </View>

//             {/* Days This Week */}
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//               <Text style={{ fontSize: 20, marginRight: 4 }}>📅</Text>
//               <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
//                 5
//               </Text>
//             </View>

//             {/* Notifications */}
//             <TouchableOpacity
//               style={{
//                 width: 40,
//                 height: 40,
//                 borderRadius: 20,
//                 backgroundColor: "#111827",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Text style={{ fontSize: 18 }}>🔔</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </SafeAreaView>

//       {/* Animated Tab Bar */}
//       <Animated.View
//         style={{
//           height: tabBarHeight,
//           opacity: tabBarOpacity,
//           overflow: "hidden",
//         }}
//       >
//         <View
//           style={{
//             flexDirection: "row",
//             paddingHorizontal: 16,
//             borderBottomWidth: 1,
//             borderBottomColor: "#1F2937",
//           }}
//         >
//           {["for-you", "friends", "discovery"].map((tab) => (
//             <TouchableOpacity
//               key={tab}
//               onPress={() => onTabChange(tab)}
//               style={{
//                 flex: 1,
//                 alignItems: "center",
//                 justifyContent: "center",
//                 paddingBottom: 12,
//               }}
//             >
//               <Text
//                 style={{
//                   fontSize: 16,
//                   fontWeight: "700",
//                   color:
//                     activeTab === tab ? "#F97316" : "rgba(255,255,255,0.5)",
//                 }}
//               >
//                 {tab === "for-you"
//                   ? "For You"
//                   : tab.charAt(0).toUpperCase() + tab.slice(1)}
//               </Text>
//               {activeTab === tab && (
//                 <View
//                   style={{
//                     position: "absolute",
//                     bottom: 0,
//                     width: "100%",
//                     height: 4,
//                     backgroundColor: "#EA580C",
//                     borderTopLeftRadius: 8,
//                     borderTopRightRadius: 8,
//                   }}
//                 />
//               )}
//             </TouchableOpacity>
//           ))}
//         </View>
//       </Animated.View>
//     </View>
//   );
// };

// import React from "react";
// import { View, Text, TouchableOpacity, Animated } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// export const Header = ({ activeTab, onTabChange, scrollY }) => {
//   // ✅ Ensure scrollY is valid
//   const animatedScrollY = React.useMemo(
//     () => (scrollY instanceof Animated.Value ? scrollY : new Animated.Value(0)),
//     [scrollY]
//   );

//   // ✅ Use Animated.Value directly, NOT Animated interpolation for height
//   // Instead of interpolating height (unsafe), we'll animate translateY & opacity
//   const translateY = animatedScrollY.interpolate({
//     inputRange: [0, 50],
//     outputRange: [0, -48],
//     extrapolate: "clamp",
//   });

//   const tabBarOpacity = animatedScrollY.interpolate({
//     inputRange: [0, 50],
//     outputRange: [1, 0],
//     extrapolate: "clamp",
//   });

//   return (
//     <View style={{ backgroundColor: "black" }}>
//       {/* Top Header - Always Visible */}
//       <SafeAreaView edges={["top"]} style={{ backgroundColor: "black" }}>
//         <View
//           style={{
//             paddingHorizontal: 16,
//             paddingVertical: 12,
//             flexDirection: "row",
//             alignItems: "center",
//             justifyContent: "space-between",
//           }}
//         >
//           {/* Left: Level Badge */}
//           <View style={{ flexDirection: "row", alignItems: "center" }}>
//             <View
//               style={{
//                 width: 40,
//                 height: 40,
//                 borderRadius: 20,
//                 backgroundColor: "#EA580C",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 marginRight: 12,
//               }}
//             >
//               <Text style={{ color: "black", fontWeight: "900" }}>5</Text>
//             </View>
//             <View>
//               <Text style={{ color: "white", fontWeight: "700" }}>Level 5</Text>
//               <View
//                 style={{
//                   width: 96,
//                   height: 6,
//                   backgroundColor: "#1F2937",
//                   borderRadius: 4,
//                   marginTop: 4,
//                 }}
//               >
//                 <View
//                   style={{
//                     width: 64,
//                     height: "100%",
//                     backgroundColor: "#EA580C",
//                     borderRadius: 4,
//                   }}
//                 />
//               </View>
//             </View>
//           </View>

//           {/* Right: Stats */}
//           <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
//             {/* Streak */}
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//               <Text style={{ fontSize: 20, marginRight: 4 }}>🔥</Text>
//               <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
//                 7
//               </Text>
//             </View>

//             {/* Days This Week */}
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//               <Text style={{ fontSize: 20, marginRight: 4 }}>📅</Text>
//               <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
//                 5
//               </Text>
//             </View>

//             {/* Notifications */}
//             <TouchableOpacity
//               style={{
//                 width: 40,
//                 height: 40,
//                 borderRadius: 20,
//                 backgroundColor: "#111827",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Text style={{ fontSize: 18 }}>🔔</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </SafeAreaView>

//       {/* Animated Tab Bar - translateY instead of height */}
//       <Animated.View
//         style={{
//           transform: [{ translateY }],
//           opacity: tabBarOpacity,
//         }}
//       >
//         <View
//           style={{
//             flexDirection: "row",
//             paddingHorizontal: 16,
//             borderBottomWidth: 1,
//             borderBottomColor: "#1F2937",
//             height: 48,
//           }}
//         >
//           {["for-you", "friends", "discovery"].map((tab) => (
//             <TouchableOpacity
//               key={tab}
//               onPress={() => onTabChange(tab)}
//               style={{
//                 flex: 1,
//                 alignItems: "center",
//                 justifyContent: "center",
//                 paddingBottom: 12,
//               }}
//             >
//               <Text
//                 style={{
//                   fontSize: 16,
//                   fontWeight: "700",
//                   color:
//                     activeTab === tab ? "#F97316" : "rgba(255,255,255,0.5)",
//                 }}
//               >
//                 {tab === "for-you"
//                   ? "For You"
//                   : tab.charAt(0).toUpperCase() + tab.slice(1)}
//               </Text>
//               {activeTab === tab && (
//                 <View
//                   style={{
//                     position: "absolute",
//                     bottom: 0,
//                     width: "100%",
//                     height: 4,
//                     backgroundColor: "#EA580C",
//                     borderTopLeftRadius: 8,
//                     borderTopRightRadius: 8,
//                   }}
//                 />
//               )}
//             </TouchableOpacity>
//           ))}
//         </View>
//       </Animated.View>
//     </View>
//   );
// };

// import React from "react";
// import { View, Text, TouchableOpacity } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// export const Header = ({ activeTab = "for-you", onTabChange = () => {} }) => {
//   return (
//     <View style={{ backgroundColor: "black" }}>
//       {/* Top Header */}
//       <SafeAreaView style={{ backgroundColor: "black" }}>
//         {/* <SafeAreaView edges={["top"]} style={{ backgroundColor: "black" }}> */}
//         <View
//           style={{
//             paddingHorizontal: 16,
//             paddingVertical: 12,
//             flexDirection: "row",
//             alignItems: "center",
//             justifyContent: "space-between",
//           }}
//         >
//           {/* Left: Level Badge */}
//           <View style={{ flexDirection: "row", alignItems: "center" }}>
//             <View
//               style={{
//                 width: 40,
//                 height: 40,
//                 borderRadius: 20,
//                 backgroundColor: "#EA580C",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 marginRight: 12,
//               }}
//             >
//               <Text style={{ color: "black", fontWeight: "900" }}>5</Text>
//             </View>
//             <View>
//               <Text style={{ color: "white", fontWeight: "700" }}>Level 5</Text>
//               <View
//                 style={{
//                   width: 96,
//                   height: 6,
//                   backgroundColor: "#1F2937",
//                   borderRadius: 4,
//                   marginTop: 4,
//                 }}
//               >
//                 <View
//                   style={{
//                     width: 64,
//                     height: "100%",
//                     backgroundColor: "#EA580C",
//                     borderRadius: 4,
//                   }}
//                 />
//               </View>
//             </View>
//           </View>

//           {/* Right: Stats */}
//           <View style={{ flexDirection: "row", alignItems: "center" }}>
//             {/* Streak */}
//             <View
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 marginRight: 16,
//               }}
//             >
//               <Text style={{ fontSize: 20, marginRight: 4 }}>🔥</Text>
//               <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
//                 7
//               </Text>
//             </View>

//             {/* Days This Week */}
//             <View
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 marginRight: 16,
//               }}
//             >
//               <Text style={{ fontSize: 20, marginRight: 4 }}>📅</Text>
//               <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
//                 5
//               </Text>
//             </View>

//             {/* Notifications */}
//             <TouchableOpacity
//               style={{
//                 width: 40,
//                 height: 40,
//                 borderRadius: 20,
//                 backgroundColor: "#111827",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Text style={{ fontSize: 18 }}>🔔</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </SafeAreaView>

//       {/* Tab Bar */}
//       <View
//         style={{
//           flexDirection: "row",
//           paddingHorizontal: 16,
//           borderBottomWidth: 1,
//           borderBottomColor: "#1F2937",
//           height: 48,
//         }}
//       >
//         {["for-you", "friends", "discovery"].map((tab) => (
//           <TouchableOpacity
//             key={tab}
//             onPress={() => onTabChange(tab)}
//             style={{
//               flex: 1,
//               alignItems: "center",
//               justifyContent: "center",
//               paddingBottom: 12,
//             }}
//           >
//             <Text
//               style={{
//                 fontSize: 16,
//                 fontWeight: "700",
//                 color: activeTab === tab ? "#F97316" : "rgba(255,255,255,0.5)",
//               }}
//             >
//               {tab === "for-you"
//                 ? "For You"
//                 : tab.charAt(0).toUpperCase() + tab.slice(1)}
//             </Text>
//             {activeTab === tab && (
//               <View
//                 style={{
//                   position: "absolute",
//                   bottom: 0,
//                   width: "100%",
//                   height: 4,
//                   backgroundColor: "#EA580C",
//                   borderTopLeftRadius: 8,
//                   borderTopRightRadius: 8,
//                 }}
//               />
//             )}
//           </TouchableOpacity>
//         ))}
//       </View>
//     </View>
//   );
// };

// // import React from "react";
// // import { View, Text, TouchableOpacity, Animated } from "react-native";
// // import { SafeAreaView } from "react-native-safe-area-context";

// // // Animated Header Component - Fixed Version
// // export const Header = ({ activeTab, onTabChange, scrollY }) => {
// //   // Animated values for tab bar
// //   const tabBarHeight = scrollY.interpolate({
// //     inputRange: [0, 50],
// //     outputRange: [48, 0],
// //     extrapolate: "clamp",
// //   });

// //   const tabBarOpacity = scrollY.interpolate({
// //     inputRange: [0, 50],
// //     outputRange: [1, 0],
// //     extrapolate: "clamp",
// //   });

// //   return (
// //     <View className="bg-black">
// //       {/* Top Header - Always Visible */}
// //       <SafeAreaView edges={["top"]} className="bg-black">
// //         <View className="px-4 py-3 flex-row items-center justify-between">
// //           {/* Left: Level Badge */}
// //           <View className="flex-row items-center">
// //             <View className="w-10 h-10 rounded-full bg-orange-600 items-center justify-center mr-3">
// //               <Text className="text-black text-sm font-black">5</Text>
// //             </View>
// //             <View>
// //               <Text className="text-white text-sm font-bold">Level 5</Text>
// //               <View className="w-24 h-1.5 bg-gray-800 rounded-full mt-1">
// //                 <View className="w-16 h-full bg-orange-600 rounded-full" />
// //               </View>
// //             </View>
// //           </View>

// //           {/* Right: Stats */}
// //           <View className="flex-row items-center gap-4">
// //             {/* Streak */}
// //             <View className="flex-row items-center">
// //               <Text className="text-2xl mr-1">🔥</Text>
// //               <Text className="text-white text-lg font-bold">7</Text>
// //             </View>

// //             {/* Days This Week */}
// //             <View className="flex-row items-center">
// //               <Text className="text-2xl mr-1">📅</Text>
// //               <Text className="text-white text-lg font-bold">5</Text>
// //             </View>

// //             {/* Notifications */}
// //             <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-900 items-center justify-center">
// //               <Text className="text-xl">🔔</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </SafeAreaView>

// //       {/* Animated Tab Bar - Shrinks on Scroll */}
// //       <Animated.View
// //         style={{
// //           height: tabBarHeight,
// //           opacity: tabBarOpacity,
// //           overflow: "hidden",
// //         }}
// //       >
// //         <View className="flex-row px-4 border-b border-gray-900">
// //           <TouchableOpacity
// //             onPress={() => onTabChange("for-you")}
// //             className="flex-1 items-center justify-center"
// //           >
// //             <Text
// //               className={`text-base font-bold pb-3 ${
// //                 activeTab === "for-you" ? "text-orange-500" : "text-gray-600"
// //               }`}
// //             >
// //               For You
// //             </Text>
// //             {activeTab === "for-you" && (
// //               <View className="absolute bottom-0 w-full h-1 bg-orange-600 rounded-t-lg" />
// //             )}
// //           </TouchableOpacity>

// //           <TouchableOpacity
// //             onPress={() => onTabChange("friends")}
// //             className="flex-1 items-center justify-center"
// //           >
// //             <Text
// //               className={`text-base font-bold pb-3 ${
// //                 activeTab === "friends" ? "text-orange-500" : "text-gray-600"
// //               }`}
// //             >
// //               Friends
// //             </Text>
// //             {activeTab === "friends" && (
// //               <View className="absolute bottom-0 w-full h-1 bg-orange-600 rounded-t-lg" />
// //             )}
// //           </TouchableOpacity>

// //           <TouchableOpacity
// //             onPress={() => onTabChange("discovery")}
// //             className="flex-1 items-center justify-center"
// //           >
// //             <Text
// //               className={`text-base font-bold pb-3 ${
// //                 activeTab === "discovery" ? "text-orange-500" : "text-gray-600"
// //               }`}
// //             >
// //               Discovery
// //             </Text>
// //             {activeTab === "discovery" && (
// //               <View className="absolute bottom-0 w-full h-1 bg-orange-600 rounded-t-lg" />
// //             )}
// //           </TouchableOpacity>
// //         </View>
// //       </Animated.View>
// //     </View>
// //   );
// // };

// // // Example usage in a screen
// // import { useRef } from "react";

// // export default function ExampleScreen() {
// //   const [activeTab, setActiveTab] = React.useState("for-you");
// //   const scrollY = useRef(new Animated.Value(0)).current;

// //   const scrollHandler = Animated.event(
// //     [{ nativeEvent: { contentOffset: { y: scrollY } } }],
// //     { useNativeDriver: false }
// //   );

// //   return (
// //     <View className="flex-1 bg-black">
// //       <Header
// //         activeTab={activeTab}
// //         onTabChange={setActiveTab}
// //         scrollY={scrollY}
// //       />

// //       <Animated.ScrollView
// //         onScroll={scrollHandler}
// //         scrollEventThrottle={16}
// //         className="flex-1"
// //       >
// //         <View className="px-4 pt-6">
// //           {/* Your content here */}
// //           <View className="bg-gray-900 rounded-2xl p-6 mb-4 border border-gray-800">
// //             <Text className="text-white text-xl font-bold">Content</Text>
// //             <Text className="text-gray-500 mt-2">
// //               Scroll down to see the tab bar disappear...
// //             </Text>
// //           </View>

// //           {/* More content for scrolling */}
// //           {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
// //             <View
// //               key={i}
// //               className="bg-gray-900 rounded-2xl p-6 mb-4 border border-gray-800"
// //             >
// //               <Text className="text-white text-lg font-bold mb-2">
// //                 Section {i}
// //               </Text>
// //               <Text className="text-gray-500">
// //                 Keep scrolling to see the animation...
// //               </Text>
// //             </View>
// //           ))}
// //         </View>
// //       </Animated.ScrollView>
// //     </View>
// //   );
// // }

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export const Header = () => {
  const [activeTab, setActiveTab] = useState("forYou");

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.leftSection}>
          {/* Menu Icon */}
          <View style={styles.menuIcon}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
        </View>

        <View style={styles.rightSection}>
          {/* Replace with your icon components */}
          <View style={styles.iconButton}>
            <Text style={styles.iconText}>🔍</Text>
          </View>
          <View style={styles.iconButton}>
            <Text style={styles.iconText}>📋</Text>
          </View>
          <View style={styles.iconButton}>
            <Text style={styles.iconText}>⚙️</Text>
          </View>
          <View style={styles.iconButton}>
            <Text style={styles.iconText}>👤</Text>
          </View>
        </View>
      </View>

      {/* Profile and Stats Bar */}
      <View style={styles.profileBar}>
        {/* Avatar and Level */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>MB</Text>
          </View>
          <View style={styles.levelSection}>
            <Text style={styles.levelText}>Lv.1</Text>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>0</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.gemIcon}>
              <Text style={styles.gemText}>💎</Text>
              <View style={styles.plusBadge}>
                <Text style={styles.plusText}>+</Text>
              </View>
            </View>
            <Text style={styles.statValue}>0</Text>
          </View>
          <View style={styles.bellIcon}>
            <Text style={styles.bellText}>🔔</Text>
          </View>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab("forYou")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "forYou" && styles.activeTabText,
            ]}
          >
            For You
          </Text>
          {activeTab === "forYou" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab("friends")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "friends" && styles.activeTabText,
            ]}
          >
            Friends
          </Text>
          {activeTab === "friends" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab("discovery")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "discovery" && styles.activeTabText,
            ]}
          >
            Discovery
          </Text>
          {activeTab === "discovery" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a1d2e",
    paddingTop: 50,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  leftSection: {
    flexDirection: "row",
  },
  menuIcon: {
    width: 24,
    height: 24,
    justifyContent: "space-around",
  },
  menuLine: {
    width: 20,
    height: 2,
    backgroundColor: "#fff",
    borderRadius: 1,
  },
  rightSection: {
    flexDirection: "row",
    gap: 15,
  },
  iconButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 18,
  },
  profileBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3b9ff3",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  levelSection: {
    marginLeft: 12,
    flex: 1,
  },
  levelText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  progressBar: {
    height: 12,
    backgroundColor: "#2a2d3e",
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#3b9ff3",
  },
  progressFill: {
    height: "100%",
    width: "15%",
    backgroundColor: "#3b9ff3",
    borderRadius: 4,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  gemIcon: {
    position: "relative",
  },
  gemText: {
    fontSize: 24,
  },
  plusBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#3b9ff3",
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  plusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  bellIcon: {
    marginLeft: 5,
  },
  bellText: {
    fontSize: 24,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2d3e",
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    position: "relative",
  },
  tabText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#3b9ff3",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#3b9ff3",
  },
});

export default Header;