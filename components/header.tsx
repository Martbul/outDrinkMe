// import React, { useState } from "react";
// import { View, Text, TouchableOpacity, Image } from "react-native";
// import { useApp } from "@/providers/AppProvider";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import { getLevelInfo } from "@/utils/levels";
// import InfoTooltip from "./infoTooltip";
// import {
//   Entypo,
//   Ionicons,
//   MaterialCommunityIcons,
//   MaterialIcons,
//   Octicons,
// } from "@expo/vector-icons";

// const Header = () => {
//   const { userData, userStats, unreadNotificationCount } = useApp();
//   const [isLevelTooltipVisible, setIsLevelTooltipVisible] =
//     useState<boolean>(false);

//   const levelInfo = getLevelInfo(userData?.xp);
//   const insets = useSafeAreaInsets();

//   const xpNeededForThisLevel =
//     levelInfo.nextLevelStartXp - levelInfo.currentLevelStartXp;
//   const levelInfoDescr = `Drink to get xp and level up!\nLevel Progress: ${Math.floor(levelInfo.currentLevelProgress)}/${xpNeededForThisLevel} XP`;

//   const getInitials = () => {
//     if (!userData) return "??";
//     const first = userData.firstName?.[0] || "";
//     const last = userData.lastName?.[0] || "";
//     return (first + last).toUpperCase() || "??";
//   };

  

//   return (
//     <View className="bg-black" style={{ paddingTop: insets.top }}>
//       <View className="flex-row justify-between items-center px-4 pt-1">
//         <View className="flex-row items-center flex-1">
//           {userData?.imageUrl ? (
//             <TouchableOpacity
//               onPress={() => router.push("/(screens)/userInfo")}
//             >
//               <Image
//                 source={{ uri: userData.imageUrl }}
//                 className="w-14 h-14 rounded-full border-3 border-white"
//               />
//             </TouchableOpacity>
//           ) : (
//             <View className="w-14 h-14 rounded-full bg-orange-600 justify-center items-center border-3 border-white">
//               <Text className="text-white text-xl font-black">
//                 {getInitials()}
//               </Text>
//             </View>
//           )}
//           <TouchableOpacity
//             className="ml-3 flex-1"
//             onPress={() => setIsLevelTooltipVisible(!isLevelTooltipVisible)}
//           >
//             <Text className="text-white text-base font-bold mb-1">
//               Lv.{levelInfo.level}
//             </Text>
//             <View className="max-w-[140px]">
//               <View className="h-2 bg-white/10 rounded border border-white/20 overflow-hidden">
//                 <View
//                   className="h-full bg-orange-600 rounded"
//                   style={{ width: `${levelInfo.progressPercentage}%` }}
//                 />
//               </View>
//             </View>
//             {isLevelTooltipVisible && (
//               <InfoTooltip
//                 title="Level"
//                 visible={isLevelTooltipVisible}
//                 description={levelInfoDescr}
//                 onClose={() => setIsLevelTooltipVisible(false)}
//               />
//             )}
//           </TouchableOpacity>
//         </View>

//         <View className="flex-row items-center gap-2">
//           <View className="flex-row items-center  bg-white/5 px-3 py-2 rounded-full">
//             <MaterialCommunityIcons name="fire" size={34} color="#EA580C" />
//             <Text className="text-white text-base font-bold">
//               {userStats?.current_streak || 0}
//             </Text>
//           </View>

//           <TouchableOpacity
//             className="flex-row items-center gap-1.5 bg-white/5 px-3 py-2 rounded-full"
//             onPress={() => router.push("/(screens)/store")}
//           >
//             <View className="relative">
//               <Ionicons name="diamond" size={24} color="#EA580C" />

//               {/* {isAdLoaded && (
//                 <View className="absolute -bottom-0.5 -right-0.5 bg-orange-600 w-3 h-3 rounded-full justify-center items-center">
//                   <Text className="text-white text-[8px] font-black">+</Text>
//                 </View>
//               )} */}
//               <View className="absolute -bottom-0.5 -right-1 bg-orange-600 rounded-full justify-center items-center">
//                 <Entypo name="plus" size={10} color="black" />
//               </View>
//             </View>
//             <Text className="text-white text-base font-bold">
//               {userData?.gems || 0}
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             className="flex-row items-center gap-1.5 bg-white/5 px-3 py-2 rounded-full"
//             onPress={() => router.push("/(screens)/notifications")}
//           >
//             <View className="relative">
//               <MaterialIcons
//                 name="notifications-none"
//                 size={30}
//                 color="#EA580C"
//               />
//               {unreadNotificationCount > 0 && (
//                 <View
//                   style={{
//                     position: "absolute",
//                     bottom: -2,
//                     right: -2,
//                   }}
//                 >
//                   <Octicons name="dot-fill" size={18} color="#ff8c00" />
//                 </View>
//               )}
//             </View>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// };

// export default Header;

import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, LayoutChangeEvent } from "react-native";
import { useApp } from "@/providers/AppProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { getLevelInfo } from "@/utils/levels";
import InfoTooltip from "./infoTooltip";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
  SharedValue,
} from "react-native-reanimated";
import { Entypo, Ionicons, MaterialCommunityIcons, MaterialIcons, Octicons } from "@expo/vector-icons";

// ============================================================================
// 1. TYPES & INTERFACES
// ============================================================================

interface HeaderProps {
  /**
   * If true, header floats and hides on scroll.
   * If false, it sits at the top like a normal view.
   */
  sticky?: boolean;
  /**
   * Required only if sticky={true}.
   * The shared value from the parent ScrollView.
   */
  scrollY?: SharedValue<number>;
}

// ============================================================================
// 2. MAIN COMPONENT (The Switcher)
// ============================================================================

const Header = ({ sticky = false, scrollY }: HeaderProps) => {
  const { userData, userStats, unreadNotificationCount } = useApp();
  const insets = useSafeAreaInsets();

  // -- Data Preparation --
  const levelInfo = getLevelInfo(userData?.xp);
  const xpNeededForThisLevel = levelInfo.nextLevelStartXp - levelInfo.currentLevelStartXp;
  const levelInfoDescr = `Drink to get xp and level up!\nLevel Progress: ${Math.floor(
    levelInfo.currentLevelProgress
  )}/${xpNeededForThisLevel} XP`;

  const getInitials = () => {
    if (!userData) return "??";
    const first = userData.firstName?.[0] || "";
    const last = userData.lastName?.[0] || "";
    return (first + last).toUpperCase() || "??";
  };

  const contentProps = {
    userData,
    userStats,
    unreadNotificationCount,
    levelInfo,
    levelInfoDescr,
    getInitials,
    insets,
  };

  // -- Render Logic --

  // CASE A: Sticky Header (Animated)
  if (sticky && scrollY) {
    return <StickyHeaderWrapper scrollY={scrollY} content={contentProps} />;
  }

  // CASE B: Normal Header (Static)
  return (
    <View className="bg-black border-b border-white/5" style={{ paddingTop: insets.top, paddingBottom: 8 }}>
      <HeaderContent {...contentProps} />
    </View>
  );
};

export default Header;

// ============================================================================
// 3. STICKY WRAPPER (Animation Logic)
// ============================================================================

const StickyHeaderWrapper = ({ scrollY, content }: { scrollY: SharedValue<number>; content: any }) => {
  const [headerHeight, setHeaderHeight] = useState(100);
  const translateY = useSharedValue(0);
  const lastContentOffset = useSharedValue(0);

  useDerivedValue(() => {
    const nextY = scrollY.value;
    const diff = nextY - lastContentOffset.value;

    if (nextY <= 0) {
      // At the very top, always show
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      const newTranslate = translateY.value - diff;
      // Hide up to the exact height of the header
      translateY.value = Math.max(Math.min(newTranslate, 0), -headerHeight);
    }
    lastContentOffset.value = nextY;
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      onLayout={(e: LayoutChangeEvent) => setHeaderHeight(e.nativeEvent.layout.height)}
      style={[animatedStyle, { paddingTop: content.insets.top, zIndex: 100 }]}
      className="absolute top-0 left-0 right-0 bg-black shadow-md shadow-black/50 pb-2"
    >
      <HeaderContent {...content} />
    </Animated.View>
  );
};

// ============================================================================
// 4. HEADER CONTENT (Visuals Only)
// ============================================================================

const HeaderContent = ({
  userData,
  userStats,
  unreadNotificationCount,
  levelInfo,
  levelInfoDescr,
  getInitials,
}: any) => {
  const [isLevelTooltipVisible, setIsLevelTooltipVisible] = useState<boolean>(false);

  return (
    <View className="flex-row justify-between items-center px-4 pt-1">
      {/* LEFT SIDE: Avatar & Level */}
      <View className="flex-row items-center flex-1">
        {userData?.imageUrl ? (
          <TouchableOpacity onPress={() => router.push("/(screens)/userInfo")}>
            <Image source={{ uri: userData.imageUrl }} className="w-14 h-14 rounded-full border-3 border-white" />
          </TouchableOpacity>
        ) : (
          <View className="w-14 h-14 rounded-full bg-orange-600 justify-center items-center border-3 border-white">
            <Text className="text-white text-xl font-black">{getInitials()}</Text>
          </View>
        )}

        <TouchableOpacity className="ml-3 flex-1" onPress={() => setIsLevelTooltipVisible(!isLevelTooltipVisible)}>
          <Text className="text-white text-base font-bold mb-1">Lv.{levelInfo.level}</Text>
          <View className="max-w-[140px]">
            <View className="h-2 bg-white/10 rounded border border-white/20 overflow-hidden">
              <View className="h-full bg-orange-600 rounded" style={{ width: `${levelInfo.progressPercentage}%` }} />
            </View>
          </View>
          {isLevelTooltipVisible && (
            <InfoTooltip
              title="Level"
              visible={isLevelTooltipVisible}
              description={levelInfoDescr}
              onClose={() => setIsLevelTooltipVisible(false)}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* RIGHT SIDE: Stats & Icons */}
      <View className="flex-row items-center gap-2">
        <View className="flex-row items-center bg-white/5 px-3 py-2 rounded-full">
          <MaterialCommunityIcons name="fire" size={34} color="#EA580C" />
          <Text className="text-white text-base font-bold">{userStats?.current_streak || 0}</Text>
        </View>

        <TouchableOpacity
          className="flex-row items-center gap-1.5 bg-white/5 px-3 py-2 rounded-full"
          onPress={() => router.push("/(screens)/store")}
        >
          <View className="relative">
            <Ionicons name="diamond" size={24} color="#EA580C" />
            <View className="absolute -bottom-0.5 -right-1 bg-orange-600 rounded-full justify-center items-center">
              <Entypo name="plus" size={10} color="black" />
            </View>
          </View>
          <Text className="text-white text-base font-bold">{userData?.gems || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center gap-1.5 bg-white/5 px-3 py-2 rounded-full"
          onPress={() => router.push("/(screens)/notifications")}
        >
          <View className="relative">
            <MaterialIcons name="notifications-none" size={30} color="#EA580C" />
            {unreadNotificationCount > 0 && (
              <View className="absolute -bottom-2 -right-2">
                <Octicons name="dot-fill" size={18} color="#ff8c00" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};