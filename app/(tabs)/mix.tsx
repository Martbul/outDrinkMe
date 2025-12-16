// // import Header from "@/components/header";
// // import MixPostModal from "@/components/mixPostModal";
// // import { useApp } from "@/providers/AppProvider";
// // import type { YourMixPostData } from "@/types/api.types";
// // import { Ionicons } from "@expo/vector-icons";
// // import { LinearGradient } from "expo-linear-gradient";
// // import { router, useLocalSearchParams } from "expo-router";
// // import { usePostHog } from "posthog-react-native";
// // import React, {
// //   useCallback,
// //   useEffect,
// //   useMemo,
// //   useRef,
// //   useState,
// // } from "react";
// // import {
// //   ActivityIndicator,
// //   Animated,
// //   Dimensions,
// //   Easing,
// //   Image,
// //   Pressable,
// //   RefreshControl,
// //   ScrollView,
// //   Text,
// //   TouchableOpacity,
// //   View,
// // } from "react-native";
// // import { useSafeAreaInsets } from "react-native-safe-area-context";

// // const { width: SCREEN_WIDTH } = Dimensions.get("window");
// // const SCREEN_PADDING = 16; // Increased padding for cleaner look
// // const GAP = 12;
// // const COLUMN_WIDTH = (SCREEN_WIDTH - SCREEN_PADDING * 2 - GAP) / 2;

// // const MAX_CARD_HEIGHT = COLUMN_WIDTH * 1.6;
// // const MIN_CARD_HEIGHT = COLUMN_WIDTH * 0.8;

// // // --- Helper Functions ---

// // const getInitialHeight = (id: string) => {
// //   const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
// //   const range = MAX_CARD_HEIGHT - MIN_CARD_HEIGHT;
// //   return (hash % range) + MIN_CARD_HEIGHT;
// // };

// // // --- Sub-Components ---

// // interface YourMixCardProps {
// //   item: YourMixPostData;
// //   onCardPress: (item: YourMixPostData) => void;
// // }

// // const YourMixCard = React.memo(({ item, onCardPress }: YourMixCardProps) => {
// //   const posthog = usePostHog();
// //   const [isFlipped, setIsFlipped] = useState(false);
// //   const rotateAnim = useRef(new Animated.Value(0)).current;
// //   const [isAnimating, setIsAnimating] = useState(false);
// //   const [cardHeight, setCardHeight] = useState(
// //     getInitialHeight(item.id || "0")
// //   );

// //   const hasBuddies = item.mentionedBuddies && item.mentionedBuddies.length > 0;
// //   const hasLocation = !!item.locationText;

// //   // Image optimization logic
// //   useEffect(() => {
// //     if (item.imageUrl) {
// //       Image.getSize(
// //         item.imageUrl,
// //         (width, height) => {
// //           if (width && height) {
// //             const aspectRatio = height / width;
// //             let calculatedHeight = COLUMN_WIDTH * aspectRatio;
// //             // Clamp height
// //             calculatedHeight = Math.min(
// //               Math.max(calculatedHeight, MIN_CARD_HEIGHT),
// //               MAX_CARD_HEIGHT
// //             );
// //             setCardHeight(calculatedHeight);
// //           }
// //         },
// //         () => {} // Fail silently
// //       );
// //     }
// //   }, [item.imageUrl]);

// //   const handleFlip = (e?: any) => {
// //     e?.stopPropagation(); // Prevent triggering navigation
// //     if (isAnimating) return;

// //     posthog?.capture("mix_card_flipped", {
// //       mix_id: item.id,
// //       flip_state_to: !isFlipped,
// //     });

// //     setIsAnimating(true);

// //     Animated.timing(rotateAnim, {
// //       toValue: isFlipped ? 0 : 1,
// //       duration: 400,
// //       easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Standard CSS ease-in-out
// //       useNativeDriver: true,
// //     }).start(() => {
// //       setIsFlipped(!isFlipped);
// //       setIsAnimating(false);
// //     });
// //   };

// //   const handleNavigation = () => {
// //     // If we are currently looking at the back, flip it back first?
// //     // Or just navigate. Let's just navigate.
// //     posthog?.capture("memory_canvas_opened", { postId: item.id });
// //     router.push({
// //       pathname: "/(screens)/memoryCanvas",
// //       params: { postId: item.id },
// //     });
// //   };

// //   // Interpolations for the flip animation
// //   const frontInterpolate = rotateAnim.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: ["0deg", "180deg"],
// //   });

// //   const backInterpolate = rotateAnim.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: ["180deg", "360deg"],
// //   });

// //   const frontOpacity = rotateAnim.interpolate({
// //     inputRange: [0, 0.5, 0.5, 1],
// //     outputRange: [1, 0, 0, 0],
// //   });

// //   const backOpacity = rotateAnim.interpolate({
// //     inputRange: [0, 0.5, 0.5, 1],
// //     outputRange: [0, 0, 1, 1],
// //   });

// //   // --- Render Front ---
// //   const renderFront = () => (
// //     <Animated.View
// //       style={{
// //         position: "absolute",
// //         width: "100%",
// //         height: "100%",
// //         backfaceVisibility: "hidden",
// //         transform: [{ rotateY: frontInterpolate }],
// //         opacity: frontOpacity,
// //         zIndex: isFlipped ? 0 : 1,
// //       }}
// //     >
// //       <Image
// //         source={{ uri: item.imageUrl }}
// //         style={{ width: "100%", height: "100%" }}
// //         resizeMode="cover"
// //         className="bg-zinc-800"
// //       />

// //       {/* Gradient Overlay for Readability */}
// //       <LinearGradient
// //         colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.85)"]}
// //         style={{
// //           position: "absolute",
// //           left: 0,
// //           right: 0,
// //           bottom: 0,
// //           height: "60%",
// //         }}
// //       />

// //       {/* Top Right: Flip Button */}
// //       <TouchableOpacity
// //         onPress={handleFlip}
// //         hitSlop={10}
// //         className="absolute top-2 right-2 w-7 h-7 bg-black/40 backdrop-blur-md rounded-full items-center justify-center border border-white/20"
// //       >
// //         <Ionicons name="repeat" size={14} color="white" />
// //       </TouchableOpacity>

// //       {/* Top Left: Date Badge */}
// //       <View className="absolute top-2 left-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md border border-white/10">
// //         <Text className="text-white/90 text-[10px] font-bold uppercase tracking-wider">
// //           {new Date(item.date).toLocaleDateString("en-US", {
// //             month: "short",
// //             day: "numeric",
// //           })}
// //         </Text>
// //       </View>

// //       {/* Bottom Content */}
// //       <View className="absolute bottom-3 left-3 right-3 flex-row items-end justify-between">
// //         {/* User Avatar */}
// //         <TouchableOpacity
// //           onPress={() =>
// //             router.push(`/(screens)/userInfo?userId=${item.userId}`)
// //           }
// //           className="rounded-full border border-white/30 overflow-hidden w-9 h-9 bg-zinc-800"
// //         >
// //           {item.userImageUrl && (
// //             <Image
// //               source={{ uri: item.userImageUrl }}
// //               className="w-full h-full"
// //             />
// //           )}
// //         </TouchableOpacity>

// //         {/* Indicators (Buddies / Location) */}
// //         <View className="flex-row gap-1">
// //           {hasBuddies && (
// //             <View className="flex-row items-center bg-white/10 px-2 py-1 rounded-full border border-white/10">
// //               <Ionicons
// //                 name="people"
// //                 size={10}
// //                 color="#ea580c"
// //                 style={{ marginRight: 4 }}
// //               />
// //               <Text className="text-white text-[10px] font-bold">
// //                 {item.mentionedBuddies.length}
// //               </Text>
// //             </View>
// //           )}

// //         </View>
// //       </View>
// //     </Animated.View>
// //   );

// //   // --- Render Back ---
// //   const renderBack = () => (
// //     <Animated.View
// //       style={{
// //         position: "absolute",
// //         width: "100%",
// //         height: "100%",
// //         backfaceVisibility: "hidden",
// //         transform: [{ rotateY: backInterpolate }],
// //         opacity: backOpacity,
// //         zIndex: isFlipped ? 1 : 0,
// //       }}
// //       className="bg-zinc-900 w-full h-full p-3 items-center justify-between"
// //     >
// //       {/* Header Back */}
// //       <View className="w-full flex-row justify-between items-center mb-2">
// //         <Text className="text-white/30 text-[10px] font-bold tracking-widest">
// //           DETAILS
// //         </Text>
// //         <TouchableOpacity onPress={handleFlip} hitSlop={10}>
// //           <Ionicons
// //             name="close-circle"
// //             size={20}
// //             color="white"
// //             style={{ opacity: 0.5 }}
// //           />
// //         </TouchableOpacity>
// //       </View>

// //       <View className="flex-1 w-full items-center justify-center">
// //         {hasBuddies ? (
// //           <View className="items-center mb-4">
// //             <Text className="text-orange-500 text-md font-bold mb-2 uppercase tracking-wide">
// //               With
// //             </Text>
// //             <View className="flex-row flex-wrap justify-center gap-2">
// //               {item.mentionedBuddies.slice(0, 4).map((b, i) => (
// //                 <TouchableOpacity
// //                   onPress={() => router.push(`/(screens)/userInfo?userId=${b.id}`)}
// //                   key={b.id || i}
// //                   className="items-center"
// //                 >
// //                   <Image
// //                     source={{ uri: b.imageUrl }}
// //                     className="w-12 h-12 rounded-full border border-white/20 bg-zinc-800 mb-1"
// //                   />
// //                   <Text
// //                     className="text-white/60 text-[8px] max-w-[50px] text-center"
// //                     numberOfLines={1}
// //                   >
// //                     {b.firstName}
// //                   </Text>
// //                 </TouchableOpacity>
// //               ))}
// //               {item.mentionedBuddies.length > 4 && (
// //                 <View className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 items-center justify-center">
// //                   <Text className="text-white/50 text-[9px]">
// //                     +{item.mentionedBuddies.length - 4}
// //                   </Text>
// //                 </View>
// //               )}
// //             </View>
// //           </View>
// //         ) : (
// //           <Text className="text-white/20 text-[14px] mb-4">Solo</Text>
// //         )}
// //       </View>

// //       <TouchableOpacity
// //         onPress={handleNavigation}
// //         className="w-full bg-white/5 py-2 rounded border border-white/10 flex-row items-center justify-center mt-2"
// //       >
// //         <Text className="text-white text-[10px] font-bold mr-1">
// //           OPEN CANVAS
// //         </Text>
// //         <Ionicons name="arrow-forward" size={10} color="white" />
// //       </TouchableOpacity>
// //     </Animated.View>
// //   );

// //   return (
// //     <Pressable onPress={handleNavigation} style={{ marginBottom: GAP }}>
// //       <View
// //         style={{
// //           width: COLUMN_WIDTH,
// //           height: cardHeight,
// //         }}
// //         className="rounded-2xl overflow-hidden border border-white/[0.08] bg-zinc-900 relative"
// //       >
// //         {renderFront()}
// //         {renderBack()}
// //       </View>
// //     </Pressable>
// //   );
// // });

// // // --- Main Screen ---

// // const MixScreen = () => {
// //   const posthog = usePostHog();
// //   const { userData, yourMixData, isLoading, refreshYourMixData } = useApp();
// //   const insets = useSafeAreaInsets();

// //   // Tabs State
// //   const [activeTab, setActiveTab] = useState<"mix" | "video">("mix");
// //   const scrollY = useRef(new Animated.Value(0)).current;

// //   // Navigation Params
// //   const { openPostId } = useLocalSearchParams();
// //   const [expandedId, setExpandedId] = useState<string | null>(null);
// //   const [expandedItem, setExpandedItem] = useState<YourMixPostData | undefined>(
// //     undefined
// //   );
// //   const [currentAspectRatio, setCurrentAspectRatio] = useState(4 / 3);

// //   // --- Effects ---

// //   // Handle Deep Links
// //   useEffect(() => {
// //     if (openPostId && yourMixData.length > 0) {
// //       const idToFind = Array.isArray(openPostId) ? openPostId[0] : openPostId;
// //       const foundPost = yourMixData.find((p) => p.id === idToFind);
// //       if (foundPost) setExpandedId(idToFind);
// //     }
// //   }, [openPostId, yourMixData]);

// //   // Handle Modal Expansion
// //   useEffect(() => {
// //     if (expandedId) {
// //       const item = yourMixData.find((post) => post.id === expandedId);
// //       setExpandedItem(item);
// //     } else {
// //       setExpandedItem(undefined);
// //     }
// //   }, [expandedId, yourMixData]);

// //   // Handle Aspect Ratio for Modal
// //   useEffect(() => {
// //     if (expandedItem?.imageUrl) {
// //       Image.getSize(
// //         expandedItem.imageUrl,
// //         (width, height) =>
// //           width && height && setCurrentAspectRatio(width / height),
// //         () => setCurrentAspectRatio(4 / 3)
// //       );
// //     }
// //   }, [expandedItem]);

// //   // --- Memoized Data ---

// //   // Memoize column splitting to prevent lag during re-renders
// //   const { leftColumn, rightColumn } = useMemo(() => {
// //     const left: YourMixPostData[] = [];
// //     const right: YourMixPostData[] = [];
// //     yourMixData.forEach((item, index) => {
// //       if (index % 2 === 0) left.push(item);
// //       else right.push(item);
// //     });
// //     return { leftColumn: left, rightColumn: right };
// //   }, [yourMixData]);

// //   const handleCardPressForModal = useCallback((item: YourMixPostData) => {
// //     setExpandedId(item.id);
// //   }, []);

// //   // --- Render Methods ---

// //   const renderContent = () => {
// //     if (isLoading && yourMixData.length === 0) {
// //       return (
// //         <View className="flex-1 items-center justify-center pt-20">
// //           <ActivityIndicator size="large" color="#ea580c" />
// //         </View>
// //       );
// //     }

// //     if (yourMixData.length === 0) {
// //       return (
// //         <View className="flex-1 items-center justify-center pt-40 px-10 opacity-50">
// //           <Ionicons
// //             name="images-outline"
// //             size={48}
// //             color="white"
// //             style={{ marginBottom: 10 }}
// //           />
// //           <Text className="text-white text-center font-medium">
// //             Your mix is empty.
// //           </Text>
// //           <Text className="text-white/60 text-center text-sm mt-2">
// //             Start capturing memories to see them here.
// //           </Text>
// //         </View>
// //       );
// //     }

// //     return (
// //       <View className="flex-row px-4 pt-4">
// //         <View className="flex-1" style={{ marginRight: GAP / 2 }}>
// //           {leftColumn.map((item) => (
// //             <YourMixCard
// //               key={item.id}
// //               item={item}
// //               onCardPress={handleCardPressForModal}
// //             />
// //           ))}
// //         </View>
// //         <View className="flex-1" style={{ marginLeft: GAP / 2 }}>
// //           {rightColumn.map((item) => (
// //             <YourMixCard
// //               key={item.id}
// //               item={item}
// //               onCardPress={handleCardPressForModal}
// //             />
// //           ))}
// //         </View>
// //       </View>
// //     );
// //   };

// //   return (
// //     <View className="flex-1 bg-black">
// //       <View className="absolute top-0 w-full h-32 bg-gradient-to-b from-orange-900/20 to-transparent pointer-events-none" />

// //       <Header />

// //       <View className="px-4 border-b border-white/[0.05] items-center">
// //         <View className="flex-row items-center gap-6">
// //           <TouchableOpacity
// //             onPress={() => setActiveTab("mix")}
// //             className="items-center justify-center h-10 border-b-2"
// //             style={{
// //               borderColor: activeTab === "mix" ? "#ea580c" : "transparent",
// //             }}
// //           >
// //             <Text
// //               className={`text-base font-bold ${activeTab === "mix" ? "text-white" : "text-white/40"}`}
// //             >
// //               YOUR MIX
// //             </Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity
// //             onPress={() => setActiveTab("video")}
// //             className="items-center justify-center h-10 border-b-2"
// //             style={{
// //               borderColor: activeTab === "video" ? "#ea580c" : "transparent",
// //             }}
// //           >
// //             <Text
// //               className={`text-base font-bold ${activeTab === "video" ? "text-white" : "text-white/40"}`}
// //             >
// //               FEED MIX
// //             </Text>
// //           </TouchableOpacity>
// //         </View>
// //       </View>

// //       <ScrollView
// //         contentContainerStyle={{
// //           paddingBottom: insets.bottom + 100,
// //         }}
// //         refreshControl={
// //           <RefreshControl
// //             refreshing={isLoading}
// //             onRefresh={refreshYourMixData}
// //             tintColor="#ea580c"
// //             colors={["#ea580c"]}
// //             progressViewOffset={20}
// //           />
// //         }
// //         showsVerticalScrollIndicator={false}
// //         scrollEventThrottle={16}
// //       >
// //         {activeTab === "mix" ? (
// //           renderContent()
// //         ) : (
// //           <View className="py-20 items-center">
// //             <Text className="text-white/30">Video feed coming soon...</Text>
// //           </View>
// //         )}
// //       </ScrollView>

// //       <MixPostModal
// //         expandedItem={expandedItem}
// //         expandedId={expandedId}
// //         setExpandedId={setExpandedId}
// //         currentAspectRatio={currentAspectRatio}
// //       />
// //     </View>
// //   );
// // };

// // export default MixScreen;

// import Header from "@/components/header";
// import MixPostModal from "@/components/mixPostModal";
// import { useApp } from "@/providers/AppProvider";
// import type { YourMixPostData } from "@/types/api.types";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { router, useLocalSearchParams } from "expo-router";
// import { usePostHog } from "posthog-react-native";
// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import {
//   ActivityIndicator,
//   Animated,
//   Dimensions,
//   Easing,
//   Image,
//   Pressable,
//   RefreshControl,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// const { width: SCREEN_WIDTH } = Dimensions.get("window");
// const SCREEN_PADDING = 16;
// const GAP = 12;
// const COLUMN_WIDTH = (SCREEN_WIDTH - SCREEN_PADDING * 2 - GAP) / 2;

// const MAX_CARD_HEIGHT = COLUMN_WIDTH * 1.6;
// const MIN_CARD_HEIGHT = COLUMN_WIDTH * 0.8;

// // --- Helper Functions ---

// const getInitialHeight = (id: string) => {
//   const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
//   const range = MAX_CARD_HEIGHT - MIN_CARD_HEIGHT;
//   return (hash % range) + MIN_CARD_HEIGHT;
// };

// // --- Sub-Components ---

// interface YourMixCardProps {
//   item: YourMixPostData;
//   onCardPress: (item: YourMixPostData) => void;
// }

// const YourMixCard = React.memo(({ item, onCardPress }: YourMixCardProps) => {
//   const posthog = usePostHog();
//   const [isFlipped, setIsFlipped] = useState(false);
//   const rotateAnim = useRef(new Animated.Value(0)).current;
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [cardHeight, setCardHeight] = useState(
//     getInitialHeight(item.id || "0")
//   );

//   const hasBuddies = item.mentionedBuddies && item.mentionedBuddies.length > 0;
//   const hasLocation = !!item.locationText;

//   useEffect(() => {
//     if (item.imageUrl) {
//       Image.getSize(
//         item.imageUrl,
//         (width, height) => {
//           if (width && height) {
//             const aspectRatio = height / width;
//             let calculatedHeight = COLUMN_WIDTH * aspectRatio;
//             calculatedHeight = Math.min(
//               Math.max(calculatedHeight, MIN_CARD_HEIGHT),
//               MAX_CARD_HEIGHT
//             );
//             setCardHeight(calculatedHeight);
//           }
//         },
//         () => {}
//       );
//     }
//   }, [item.imageUrl]);

//   const handleFlip = (e?: any) => {
//     e?.stopPropagation();
//     if (isAnimating) return;

//     posthog?.capture("mix_card_flipped", {
//       mix_id: item.id,
//       flip_state_to: !isFlipped,
//     });

//     setIsAnimating(true);

//     Animated.timing(rotateAnim, {
//       toValue: isFlipped ? 0 : 1,
//       duration: 400,
//       easing: Easing.bezier(0.25, 0.1, 0.25, 1),
//       useNativeDriver: true,
//     }).start(() => {
//       setIsFlipped(!isFlipped);
//       setIsAnimating(false);
//     });
//   };

//   const handleNavigation = () => {
//     posthog?.capture("memory_canvas_opened", { postId: item.id });
//     router.push({
//       pathname: "/(screens)/memoryCanvas",
//       params: { postId: item.id },
//     });
//   };

//   const frontInterpolate = rotateAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ["0deg", "180deg"],
//   });

//   const backInterpolate = rotateAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ["180deg", "360deg"],
//   });

//   const frontOpacity = rotateAnim.interpolate({
//     inputRange: [0, 0.5, 0.5, 1],
//     outputRange: [1, 0, 0, 0],
//   });

//   const backOpacity = rotateAnim.interpolate({
//     inputRange: [0, 0.5, 0.5, 1],
//     outputRange: [0, 0, 1, 1],
//   });

//   const renderFront = () => (
//     <Animated.View
//       style={{
//         position: "absolute",
//         width: "100%",
//         height: "100%",
//         backfaceVisibility: "hidden",
//         transform: [{ rotateY: frontInterpolate }],
//         opacity: frontOpacity,
//         zIndex: isFlipped ? 0 : 1,
//       }}
//     >
//       <Image
//         source={{ uri: item.imageUrl }}
//         style={{ width: "100%", height: "100%" }}
//         resizeMode="cover"
//         className="bg-zinc-800"
//       />
//       <LinearGradient
//         colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.85)"]}
//         style={{
//           position: "absolute",
//           left: 0,
//           right: 0,
//           bottom: 0,
//           height: "60%",
//         }}
//       />
//       <TouchableOpacity
//         onPress={handleFlip}
//         hitSlop={10}
//         className="absolute top-2 right-2 w-7 h-7 bg-black/40 backdrop-blur-md rounded-full items-center justify-center border border-white/20"
//       >
//         <Ionicons name="repeat" size={14} color="white" />
//       </TouchableOpacity>
//       <View className="absolute top-2 left-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md border border-white/10">
//         <Text className="text-white/90 text-[10px] font-bold uppercase tracking-wider">
//           {new Date(item.date).toLocaleDateString("en-US", {
//             month: "short",
//             day: "numeric",
//           })}
//         </Text>
//       </View>
//       <View className="absolute bottom-3 left-3 right-3 flex-row items-end justify-between">
//         <TouchableOpacity
//           onPress={() =>
//             router.push(`/(screens)/userInfo?userId=${item.userId}`)
//           }
//           className="rounded-full border border-white/30 overflow-hidden w-9 h-9 bg-zinc-800"
//         >
//           {item.userImageUrl && (
//             <Image
//               source={{ uri: item.userImageUrl }}
//               className="w-full h-full"
//             />
//           )}
//         </TouchableOpacity>
//         <View className="flex-row gap-1">
//           {hasBuddies && (
//             <View className="flex-row items-center bg-white/10 px-2 py-1 rounded-full border border-white/10">
//               <Ionicons
//                 name="people"
//                 size={10}
//                 color="#ea580c"
//                 style={{ marginRight: 4 }}
//               />
//               <Text className="text-white text-[10px] font-bold">
//                 {item.mentionedBuddies.length}
//               </Text>
//             </View>
//           )}
//         </View>
//       </View>
//     </Animated.View>
//   );

//   const renderBack = () => (
//     <Animated.View
//       style={{
//         position: "absolute",
//         width: "100%",
//         height: "100%",
//         backfaceVisibility: "hidden",
//         transform: [{ rotateY: backInterpolate }],
//         opacity: backOpacity,
//         zIndex: isFlipped ? 1 : 0,
//       }}
//       className="bg-zinc-900 w-full h-full p-3 items-center justify-between"
//     >
//       <View className="w-full flex-row justify-between items-center mb-2">
//         <Text className="text-white/30 text-[10px] font-bold tracking-widest">
//           DETAILS
//         </Text>
//         <TouchableOpacity onPress={handleFlip} hitSlop={10}>
//           <Ionicons
//             name="close-circle"
//             size={20}
//             color="white"
//             style={{ opacity: 0.5 }}
//           />
//         </TouchableOpacity>
//       </View>
//       <View className="flex-1 w-full items-center justify-center">
//         {hasBuddies ? (
//           <View className="items-center mb-4">
//             <Text className="text-orange-500 text-md font-bold mb-2 uppercase tracking-wide">
//               With
//             </Text>
//             <View className="flex-row flex-wrap justify-center gap-2">
//               {item.mentionedBuddies.slice(0, 4).map((b, i) => (
//                 <TouchableOpacity
//                   onPress={() =>
//                     router.push(`/(screens)/userInfo?userId=${b.id}`)
//                   }
//                   key={b.id || i}
//                   className="items-center"
//                 >
//                   <Image
//                     source={{ uri: b.imageUrl }}
//                     className="w-12 h-12 rounded-full border border-white/20 bg-zinc-800 mb-1"
//                   />
//                   <Text
//                     className="text-white/60 text-[8px] max-w-[50px] text-center"
//                     numberOfLines={1}
//                   >
//                     {b.firstName}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//               {item.mentionedBuddies.length > 4 && (
//                 <View className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 items-center justify-center">
//                   <Text className="text-white/50 text-[9px]">
//                     +{item.mentionedBuddies.length - 4}
//                   </Text>
//                 </View>
//               )}
//             </View>
//           </View>
//         ) : (
//           <Text className="text-white/20 text-[14px] mb-4">Solo</Text>
//         )}
//       </View>
//       <TouchableOpacity
//         onPress={handleNavigation}
//         className="w-full bg-white/5 py-2 rounded border border-white/10 flex-row items-center justify-center mt-2"
//       >
//         <Text className="text-white text-[10px] font-bold mr-1">
//           OPEN CANVAS
//         </Text>
//         <Ionicons name="arrow-forward" size={10} color="white" />
//       </TouchableOpacity>
//     </Animated.View>
//   );

//   return (
//     <Pressable onPress={handleNavigation} style={{ marginBottom: GAP }}>
//       <View
//         style={{
//           width: COLUMN_WIDTH,
//           height: cardHeight,
//         }}
//         className="rounded-2xl overflow-hidden border border-white/[0.08] bg-zinc-900 relative"
//       >
//         {renderFront()}
//         {renderBack()}
//       </View>
//     </Pressable>
//   );
// });

// // --- Main Screen ---

// const MixScreen = () => {
//   const posthog = usePostHog();
//   // Ensure your AppProvider is returning globalMixData.
//   // If not, default it to empty array here to prevent crash.
//   const {
//     userData,
//     yourMixData,
//     globalMixData = [], // Default to empty if not in provider yet
//     isLoading,
//     refreshYourMixData,
//   } = useApp();

//   const insets = useSafeAreaInsets();

//   // Updated Tabs State
//   const [activeTab, setActiveTab] = useState<"personal" | "global">("personal");

//   // Navigation Params
//   const { openPostId } = useLocalSearchParams();
//   const [expandedId, setExpandedId] = useState<string | null>(null);
//   const [expandedItem, setExpandedItem] = useState<YourMixPostData | undefined>(
//     undefined
//   );
//   const [currentAspectRatio, setCurrentAspectRatio] = useState(4 / 3);

//   // --- Effects ---

//   // Handle Deep Links
//   useEffect(() => {
//     // Check both lists for the post ID
//     const allPosts = [...yourMixData, ...globalMixData];
//     if (openPostId && allPosts.length > 0) {
//       const idToFind = Array.isArray(openPostId) ? openPostId[0] : openPostId;
//       const foundPost = allPosts.find((p) => p.id === idToFind);
//       if (foundPost) setExpandedId(idToFind);
//     }
//   }, [openPostId, yourMixData, globalMixData]);

//   // Handle Modal Expansion
//   useEffect(() => {
//     if (expandedId) {
//       // Look in both data sources
//       const allPosts = [...yourMixData, ...globalMixData];
//       const item = allPosts.find((post) => post.id === expandedId);
//       setExpandedItem(item);
//     } else {
//       setExpandedItem(undefined);
//     }
//   }, [expandedId, yourMixData, globalMixData]);

//   // Handle Aspect Ratio for Modal
//   useEffect(() => {
//     if (expandedItem?.imageUrl) {
//       Image.getSize(
//         expandedItem.imageUrl,
//         (width, height) =>
//           width && height && setCurrentAspectRatio(width / height),
//         () => setCurrentAspectRatio(4 / 3)
//       );
//     }
//   }, [expandedItem]);

//   // --- Column Logic ---

//   // Determine which data to show
//   const activeData = activeTab === "personal" ? yourMixData : globalMixData;

//   // Memoize column splitting based on the ACTIVE data
//   const { leftColumn, rightColumn } = useMemo(() => {
//     const left: YourMixPostData[] = [];
//     const right: YourMixPostData[] = [];

//     activeData.forEach((item, index) => {
//       if (index % 2 === 0) left.push(item);
//       else right.push(item);
//     });

//     return { leftColumn: left, rightColumn: right };
//   }, [activeData]);

//   const handleCardPressForModal = useCallback((item: YourMixPostData) => {
//     setExpandedId(item.id);
//   }, []);

//   // --- Render Content ---

//   const renderContent = () => {
//     if (isLoading && activeData.length === 0) {
//       return (
//         <View className="flex-1 items-center justify-center pt-20">
//           <ActivityIndicator size="large" color="#ea580c" />
//         </View>
//       );
//     }

//     if (activeData.length === 0) {
//       const emptyMsg =
//         activeTab === "personal"
//           ? "Start capturing memories to see them here."
//           : "No global posts found yet.";

//       return (
//         <View className="flex-1 items-center justify-center pt-40 px-10 opacity-50">
//           <Ionicons
//             name="images-outline"
//             size={48}
//             color="white"
//             style={{ marginBottom: 10 }}
//           />
//           <Text className="text-white text-center font-medium">
//             Mix is empty.
//           </Text>
//           <Text className="text-white/60 text-center text-sm mt-2">
//             {emptyMsg}
//           </Text>
//         </View>
//       );
//     }

//     return (
//       <View className="flex-row px-4 pt-4">
//         <View className="flex-1" style={{ marginRight: GAP / 2 }}>
//           {leftColumn.map((item) => (
//             <YourMixCard
//               key={item.id}
//               item={item}
//               onCardPress={handleCardPressForModal}
//             />
//           ))}
//         </View>
//         <View className="flex-1" style={{ marginLeft: GAP / 2 }}>
//           {rightColumn.map((item) => (
//             <YourMixCard
//               key={item.id}
//               item={item}
//               onCardPress={handleCardPressForModal}
//             />
//           ))}
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View className="flex-1 bg-black">
//       <View className="absolute top-0 w-full h-32 bg-gradient-to-b from-orange-900/20 to-transparent pointer-events-none" />

//       <Header />

//       <View className="px-4 border-b border-white/[0.05] items-center">
//         <View className="flex-row items-center gap-6">
//           <TouchableOpacity
//             onPress={() => setActiveTab("personal")}
//             className="items-center justify-center h-10 border-b-2"
//             style={{
//               borderColor: activeTab === "personal" ? "#ea580c" : "transparent",
//             }}
//           >
//             <Text
//               className={`text-base font-bold ${activeTab === "personal" ? "text-white" : "text-white/40"}`}
//             >
//               YOUR MIX
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={() => setActiveTab("global")}
//             className="items-center justify-center h-10 border-b-2"
//             style={{
//               borderColor: activeTab === "global" ? "#ea580c" : "transparent",
//             }}
//           >
//             <Text
//               className={`text-base font-bold ${activeTab === "global" ? "text-white" : "text-white/40"}`}
//             >
//               GLOBAL MIX
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       <ScrollView
//         contentContainerStyle={{
//           paddingBottom: insets.bottom + 100,
//         }}
//         refreshControl={
//           <RefreshControl
//             refreshing={isLoading}
//             onRefresh={refreshYourMixData}
//             tintColor="#ea580c"
//             colors={["#ea580c"]}
//             progressViewOffset={20}
//           />
//         }
//         showsVerticalScrollIndicator={false}
//         scrollEventThrottle={16}
//       >
//         {renderContent()}
//       </ScrollView>

//       <MixPostModal
//         expandedItem={expandedItem}
//         expandedId={expandedId}
//         setExpandedId={setExpandedId}
//         currentAspectRatio={currentAspectRatio}
//       />
//     </View>
//   );
// };

// export default MixScreen;
import Header from "@/components/header";
import MixPostModal from "@/components/mixPostModal";
import { useApp } from "@/providers/AppProvider";
import type { YourMixPostData } from "@/types/api.types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { usePostHog } from "posthog-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCREEN_PADDING = 16;
const GAP = 12;
const COLUMN_WIDTH = (SCREEN_WIDTH - SCREEN_PADDING * 2 - GAP) / 2;

const MAX_CARD_HEIGHT = COLUMN_WIDTH * 1.6;
const MIN_CARD_HEIGHT = COLUMN_WIDTH * 0.8;

// --- Helper Functions ---

const getInitialHeight = (id: string) => {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const range = MAX_CARD_HEIGHT - MIN_CARD_HEIGHT;
  return (hash % range) + MIN_CARD_HEIGHT;
};

// --- Sub-Components ---

interface YourMixCardProps {
  item: YourMixPostData;
  onCardPress: (item: YourMixPostData) => void;
}

const YourMixCard = React.memo(({ item, onCardPress }: YourMixCardProps) => {
  const posthog = usePostHog();
  const [isFlipped, setIsFlipped] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  const [cardHeight, setCardHeight] = useState(
    getInitialHeight(item.id || "0")
  );
const isSmallCard = cardHeight < COLUMN_WIDTH * 1.2; 

  const hasBuddies = item.mentionedBuddies && item.mentionedBuddies.length > 0;
  const hasLocation = !!item.locationText;

  useEffect(() => {
    if (item.imageUrl) {
      Image.getSize(
        item.imageUrl,
        (width, height) => {
          if (width && height) {
            const aspectRatio = height / width;
            let calculatedHeight = COLUMN_WIDTH * aspectRatio;
            calculatedHeight = Math.min(
              Math.max(calculatedHeight, MIN_CARD_HEIGHT),
              MAX_CARD_HEIGHT
            );
            setCardHeight(calculatedHeight);
          }
        },
        () => {}
      );
    }
  }, [item.imageUrl]);

  const handleFlip = (e?: any) => {
    e?.stopPropagation();
    if (isAnimating) return;

    posthog?.capture("mix_card_flipped", {
      mix_id: item.id,
      flip_state_to: !isFlipped,
    });

    setIsAnimating(true);

    Animated.timing(rotateAnim, {
      toValue: isFlipped ? 0 : 1,
      duration: 400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start(() => {
      setIsFlipped(!isFlipped);
      setIsAnimating(false);
    });
  };

  const handleNavigation = () => {
    posthog?.capture("memory_canvas_opened", { postId: item.id });
    router.push({
      pathname: "/(screens)/memoryCanvas",
      params: { postId: item.id },
    });
  };

  const frontInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const frontOpacity = rotateAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [1, 0, 0, 0],
  });

  const backOpacity = rotateAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  const renderFront = () => (
    <Animated.View
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        backfaceVisibility: "hidden",
        transform: [{ rotateY: frontInterpolate }],
        opacity: frontOpacity,
        zIndex: isFlipped ? 0 : 1,
      }}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
        className="bg-zinc-800"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.85)"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "60%",
        }}
      />
      <TouchableOpacity
        onPress={handleFlip}
        hitSlop={10}
        className="absolute top-2 right-2 w-7 h-7 bg-black/40 backdrop-blur-md rounded-full items-center justify-center border border-white/20"
      >
        <Ionicons name="repeat" size={14} color="white" />
      </TouchableOpacity>
      <View className="absolute top-2 left-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md border border-white/10">
        <Text className="text-white/90 text-[10px] font-bold uppercase tracking-wider">
          {new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </Text>
      </View>
      <View className="absolute bottom-3 left-3 right-3 flex-row items-end justify-between">
        <TouchableOpacity
          onPress={() =>
            router.push(`/(screens)/userInfo?userId=${item.userId}`)
          }
          className="rounded-full border border-white/30 overflow-hidden w-10 h-10 bg-zinc-800"
        >
          {item.userImageUrl && (
            <Image
              source={{ uri: item.userImageUrl }}
              className="w-full h-full"
            />
          )}
        </TouchableOpacity>
        <View className="flex-row gap-1">
          {hasBuddies && (
            <View className="flex-row items-center bg-white/10 px-2 py-1 rounded-full border border-white/10">
              <Ionicons
                name="people"
                size={10}
                color="#ea580c"
                style={{ marginRight: 4 }}
              />
              <Text className="text-white text-[10px] font-bold">
                {item.mentionedBuddies.length}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );

const renderBack = () => (
  <Animated.View
    style={{
      position: "absolute",
      width: "100%",
      height: "100%",
      backfaceVisibility: "hidden",
      transform: [{ rotateY: backInterpolate }],
      opacity: backOpacity,
      zIndex: isFlipped ? 1 : 0,
    }}
    // Dynamic padding: p-2 for small cards, p-4 for large cards
    className={`bg-zinc-900 w-full h-full items-center justify-between ${
      isSmallCard ? "p-2" : "p-4"
    }`}
  >
    {/* 1. Header */}
    <View className="w-full flex-row justify-between items-center mb-1 shrink-0">
      <Text className="text-white/30 text-[10px] font-bold tracking-widest">
        DETAILS
      </Text>
      <TouchableOpacity onPress={handleFlip} hitSlop={15}>
        <Ionicons
          name="close-circle"
          size={isSmallCard ? 20 : 24} // Bigger icon for big cards
          color="white"
          style={{ opacity: 0.5 }}
        />
      </TouchableOpacity>
    </View>

    {/* 2. Middle Content (Scrollable for safety, but centered) */}
    <ScrollView
      className="w-full flex-1"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 4,
      }}
      showsVerticalScrollIndicator={false}
    >
      {hasBuddies ? (
        <View className="items-center">
          <Text
            className={`text-orange-500 font-bold uppercase tracking-wide mb-2 ${
              isSmallCard ? "text-xs" : "text-sm"
            }`}
          >
            With
          </Text>

          <View className="flex-row flex-wrap justify-center gap-2">
            {item.mentionedBuddies.slice(0, 4).map((b, i) => (
              <TouchableOpacity
                onPress={() =>
                  router.push(`/(screens)/userInfo?userId=${b.id}`)
                }
                key={b.id || i}
                className="items-center"
              >
                {/* Dynamic Avatar Size: w-9 (36px) vs w-12 (48px) */}
                <Image
                  source={{ uri: b.imageUrl }}
                  className={`rounded-full border border-white/20 bg-zinc-800 mb-1 ${
                    isSmallCard ? "w-9 h-9" : "w-14 h-14"
                  }`}
                />
                <Text
                  className={`text-white/60 text-center max-w-[60px] ${
                    isSmallCard ? "text-[8px]" : "text-[10px]"
                  }`}
                  numberOfLines={1}
                >
                  {b.firstName}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Overflow Counter */}
            {item.mentionedBuddies.length > 4 && (
              <View
                className={`rounded-full bg-zinc-800 border border-white/10 items-center justify-center ${
                  isSmallCard ? "w-9 h-9" : "w-14 h-14"
                }`}
              >
                <Text
                  className={`text-white/50 ${
                    isSmallCard ? "text-[9px]" : "text-xs"
                  }`}
                >
                  +{item.mentionedBuddies.length - 4}
                </Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        /* Empty State (Solo) */
        <View className="items-center justify-center h-full opacity-30">
          <Ionicons
            name="person-outline"
            size={isSmallCard ? 24 : 40}
            color="white"
          />
          <Text
            className={`text-white font-medium mt-1 ${
              isSmallCard ? "text-[10px]" : "text-xs"
            }`}
          >
            Solo Mix
          </Text>
        </View>
      )}
    </ScrollView>

    {/* 3. Footer */}
    <TouchableOpacity
      onPress={handleNavigation}
      className={`w-full bg-white/5 rounded border border-white/10 flex-row items-center justify-center shrink-0 ${
        isSmallCard ? "py-2 mt-1" : "py-3 mt-2"
      }`}
    >
      <Text
        className={`text-white font-bold mr-1 ${
          isSmallCard ? "text-[10px]" : "text-xs"
        }`}
      >
        OPEN CANVAS
      </Text>
      <Ionicons
        name="arrow-forward"
        size={isSmallCard ? 10 : 12}
        color="white"
      />
    </TouchableOpacity>
  </Animated.View>
);
  
  
  return (
    <Pressable onPress={handleNavigation} style={{ marginBottom: GAP }}>
      <View
        style={{
          width: COLUMN_WIDTH,
          height: cardHeight,
        }}
        className="rounded-2xl overflow-hidden border border-white/[0.08] bg-zinc-900 relative"
      >
        {renderFront()}
        {renderBack()}
      </View>
    </Pressable>
  );
});

// --- Main Screen ---

const MixScreen = () => {
  const posthog = usePostHog();
  const {
    yourMixData,
    yourMixHasMore,
    loadMoreYourMixData,
    refreshYourMixData,

    globalMixData = [],
    globalMixHasMore,
    loadMoreGlobalMixData,
    refreshGlobalMixData,

    isLoading,
  } = useApp();

  const insets = useSafeAreaInsets();

  // Updated Tabs State
  const [activeTab, setActiveTab] = useState<"personal" | "global">("personal");
  const [isPaginating, setIsPaginating] = useState(false);

  // Navigation Params
  const { openPostId } = useLocalSearchParams();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<YourMixPostData | undefined>(
    undefined
  );
  const [currentAspectRatio, setCurrentAspectRatio] = useState(4 / 3);

  // --- Effects ---

  // Handle Deep Links
  useEffect(() => {
    const allPosts = [...yourMixData, ...globalMixData];
    if (openPostId && allPosts.length > 0) {
      const idToFind = Array.isArray(openPostId) ? openPostId[0] : openPostId;
      const foundPost = allPosts.find((p) => p.id === idToFind);
      if (foundPost) setExpandedId(idToFind);
    }
  }, [openPostId, yourMixData, globalMixData]);

  // Handle Modal Expansion
  useEffect(() => {
    if (expandedId) {
      const allPosts = [...yourMixData, ...globalMixData];
      const item = allPosts.find((post) => post.id === expandedId);
      setExpandedItem(item);
    } else {
      setExpandedItem(undefined);
    }
  }, [expandedId, yourMixData, globalMixData]);

  // Handle Aspect Ratio for Modal
  useEffect(() => {
    if (expandedItem?.imageUrl) {
      Image.getSize(
        expandedItem.imageUrl,
        (width, height) =>
          width && height && setCurrentAspectRatio(width / height),
        () => setCurrentAspectRatio(4 / 3)
      );
    }
  }, [expandedItem]);

  // --- Column Logic ---

  const activeData = activeTab === "personal" ? yourMixData : globalMixData;
  const activeHasMore =
    activeTab === "personal" ? yourMixHasMore : globalMixHasMore;

  // Memoize column splitting based on the ACTIVE data
  const { leftColumn, rightColumn } = useMemo(() => {
    const left: YourMixPostData[] = [];
    const right: YourMixPostData[] = [];

    activeData.forEach((item, index) => {
      if (index % 2 === 0) left.push(item);
      else right.push(item);
    });

    return { leftColumn: left, rightColumn: right };
  }, [activeData]);

  const handleCardPressForModal = useCallback((item: YourMixPostData) => {
    setExpandedId(item.id);
  }, []);

  // --- Scroll & Pagination Logic ---

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 1000; // Trigger load before reaching bottom

    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    ) {
      handleLoadMore();
    }
  };

  const handleLoadMore = async () => {
    if (isPaginating || !activeHasMore) return;

    setIsPaginating(true);
    try {
      if (activeTab === "personal") {
        await loadMoreYourMixData();
      } else {
        await loadMoreGlobalMixData();
      }
    } finally {
      setIsPaginating(false);
    }
  };

  const handleRefresh = useCallback(() => {
    if (activeTab === "personal") {
      refreshYourMixData();
    } else {
      // Ensure refreshGlobalMixData exists in your AppProvider
      if (refreshGlobalMixData) {
        refreshGlobalMixData();
      }
    }
  }, [activeTab, refreshYourMixData, refreshGlobalMixData]);

  // --- Render Content ---

  const renderContent = () => {
    // Initial loading state (page 1 only)
    if (isLoading && activeData.length === 0) {
      return (
        <View className="flex-1 items-center justify-center pt-20">
          <ActivityIndicator size="large" color="#ea580c" />
        </View>
      );
    }

    // Empty State
    if (activeData.length === 0) {
      const emptyMsg =
        activeTab === "personal"
          ? "Start capturing memories to see them here."
          : "No global posts found yet.";

      return (
        <View className="flex-1 items-center justify-center pt-40 px-10 opacity-50">
          <Ionicons
            name="images-outline"
            size={48}
            color="white"
            style={{ marginBottom: 10 }}
          />
          <Text className="text-white text-center font-medium">
            Mix is empty.
          </Text>
          <Text className="text-white/60 text-center text-sm mt-2">
            {emptyMsg}
          </Text>
        </View>
      );
    }

    return (
      <View>
        <View className="flex-row px-4 pt-4">
          <View className="flex-1" style={{ marginRight: GAP / 2 }}>
            {leftColumn.map((item) => (
              <YourMixCard
                key={item.id}
                item={item}
                onCardPress={handleCardPressForModal}
              />
            ))}
          </View>
          <View className="flex-1" style={{ marginLeft: GAP / 2 }}>
            {rightColumn.map((item) => (
              <YourMixCard
                key={item.id}
                item={item}
                onCardPress={handleCardPressForModal}
              />
            ))}
          </View>
        </View>

        {/* Footer Loader for Pagination */}
        {activeHasMore && (
          <View className="py-8 items-center justify-center">
            <ActivityIndicator size="small" color="#ea580c" />
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-black">
      <View className="absolute top-0 w-full h-32 bg-gradient-to-b from-orange-900/20 to-transparent pointer-events-none" />

      <Header />

      <View className="px-4 border-b border-white/[0.05] items-center">
        <View className="flex-row items-center gap-6">
          <TouchableOpacity
            onPress={() => setActiveTab("personal")}
            className="items-center justify-center h-10 border-b-2"
            style={{
              borderColor: activeTab === "personal" ? "#ea580c" : "transparent",
            }}
          >
            <Text
              className={`text-base font-bold ${activeTab === "personal" ? "text-white" : "text-white/40"}`}
            >
              YOUR MIX
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("global")}
            className="items-center justify-center h-10 border-b-2"
            style={{
              borderColor: activeTab === "global" ? "#ea580c" : "transparent",
            }}
          >
            <Text
              className={`text-base font-bold ${activeTab === "global" ? "text-white" : "text-white/40"}`}
            >
              FEED MIX
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#ea580c"
            colors={["#ea580c"]}
            progressViewOffset={20}
          />
        }
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16} // Good balance for performance/responsiveness
        onScroll={handleScroll}
      >
        {renderContent()}
      </ScrollView>

      <MixPostModal
        expandedItem={expandedItem}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        currentAspectRatio={currentAspectRatio}
      />
    </View>
  );
};

export default MixScreen;