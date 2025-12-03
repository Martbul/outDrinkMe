import React, { useEffect, useMemo } from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { UserStats } from "@/types/api.types";
import { useApp } from "@/providers/AppProvider";
import { getCoefInfo, getLevelInfo } from "@/utils/levels";
import { FriendButton } from "@/components/friendButton";
import SplashScreen from "@/components/spashScreen";
import BackHeader from "@/components/backHeader";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ACHIEVEMENT_IMAGES = {
  lightning: require("../../assets/images/achievements/lightning.png"),
  druid: require("../../assets/images/achievements/druid.png"),
  campfire: require("../../assets/images/achievements/campfire.png"),
  target: require("../../assets/images/achievements/target.png"),
  crown: require("../../assets/images/achievements/crown.png"),
  trophy: require("../../assets/images/achievements/trophy.png"),
  star: require("../../assets/images/achievements/star.png"),
  hundred: require("../../assets/images/achievements/100.png"),
};

const UserInfoScreen = () => {
  const insets = useSafeAreaInsets();
  const { userId: rawUserId } = useLocalSearchParams();
  const {
    userData,
    friendDiscoveryProfile,
    getFriendDiscoveryDisplayProfile,
    addFriend,
    removeFriend,
    isLoading,
  } = useApp();

  useEffect(() => {
    const friendDiscoveryId = Array.isArray(rawUserId)
      ? rawUserId[0]
      : rawUserId;

    if (!friendDiscoveryId) return;

    const loadData = async () => {
      await getFriendDiscoveryDisplayProfile(friendDiscoveryId);
    };

    loadData();
  }, [rawUserId]);

   const coefInfo = getCoefInfo(userData?.alcoholism_coefficient);
 
  const levelInfo = getLevelInfo(userData?.xp);
  const achievements = friendDiscoveryProfile?.achievements;

  const groupedAchievements = useMemo(() => {
    if (!achievements) return { streaks: [], competition: [], social: [] };

    return {
      streaks: achievements.filter(
        (a) =>
          a.criteria_type === "streak" ||
          a.criteria_type === "perfect_week" ||
          a.criteria_type === "total_days"
      ),
      competition: achievements.filter((a) => a.criteria_type === "weeks_won"),
      social: achievements.filter((a) => a.criteria_type === "friends"),
    };
  }, [achievements]);

  const getAchievementImage = (name: string) => {
    const imageMap: { [key: string]: any } = {
      Lightning: ACHIEVEMENT_IMAGES.lightning,
      "Beast Mode": ACHIEVEMENT_IMAGES.druid,
      "Fire Starter": ACHIEVEMENT_IMAGES.campfire,
      Sharpshooter: ACHIEVEMENT_IMAGES.target,
      King: ACHIEVEMENT_IMAGES.crown,
      Champion: ACHIEVEMENT_IMAGES.trophy,
      Legend: ACHIEVEMENT_IMAGES.star,
      Century: ACHIEVEMENT_IMAGES.hundred,
    };
    return imageMap[name] || ACHIEVEMENT_IMAGES.lightning;
  };

  const handleFriendToggle = async (newState: boolean) => {
    if (!friendDiscoveryProfile?.user) return;

    if (newState) {
      await addFriend(friendDiscoveryProfile.user.clerkId);
    } else {
      await removeFriend(friendDiscoveryProfile.user.clerkId);
    }
  };

  const renderAchievementCategory = (
    title: string,
    achievements: any[],
  ) => {
    if (achievements.length === 0) return null;

    return (
      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <Text className="text-white text-base font-bold">{title}</Text>
          <View className="ml-auto bg-white/[0.05] px-2.5 py-1 rounded-full">
            <Text className="text-white/50 text-xs font-bold">
              {achievements.filter((a) => a.unlocked).length}/
              {achievements.length}
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-2.5">
          {achievements.map((achievement) => (
            <View
              key={achievement.id}
              className={`w-[30%] aspect-square rounded-xl items-center justify-center border ${
                achievement.unlocked
                  ? "bg-orange-600/20 border-orange-600/50"
                  : "bg-white/[0.03] border-white/[0.08]"
              }`}
            >
              <Image
                source={getAchievementImage(achievement.name)}
                style={{
                  width: 56,
                  height: 56,
                  opacity: achievement.unlocked ? 1 : 0.3,
                }}
                resizeMode="contain"
              />
              {achievement.unlocked && (
                <View className="absolute top-1.5 right-1.5 bg-orange-600 rounded-full w-4 h-4 items-center justify-center">
                  <Text className="text-white text-[10px] font-black">✓</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Show splash screen style loader only on initial load
  if (isLoading && !friendDiscoveryProfile) {
    return <SplashScreen />;
  }

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top - 15 }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 10 }}
        showsVerticalScrollIndicator={false}
      >
        <BackHeader className="top-12" />

        {/* Profile Header */}
        <View className="items-center pt-8 pb-6 px-4">
          {/* Avatar with Level & Coef Badge */}
          <View className="relative mb-4">
            <View className="w-32 h-32 rounded-full items-center justify-center border-4 border-black">
              {friendDiscoveryProfile?.user?.imageUrl ? (
                <Image
                  source={{ uri: friendDiscoveryProfile.user.imageUrl }}
                  className="w-full h-full rounded-full"
                />
              ) : (
                <Text className="text-black text-5xl font-black">
                  {friendDiscoveryProfile?.user?.username?.[0]?.toUpperCase()}
                </Text>
              )}
            </View>

            {/* Level Badge - Bottom Left */}
            <View className="absolute -bottom-2 -left-2 bg-gray-900 px-3 py-1 rounded-full border-2 border-orange-600">
              <Text className="text-orange-600 text-xs font-black">
                {coefInfo.coef}
              </Text>
            </View>

            {/* Coef Badge - Bottom Right */}
            <View className="absolute -bottom-2 -right-2 bg-gray-900 px-3 py-1 rounded-full border-2 border-[#666666]">
              <Text className="text-neutral-500 text-xs font-black">
                LV. {levelInfo.level}
              </Text>
            </View>
          </View>

          {/* Name & Username */}
          <Text className="text-white text-2xl font-black mb-1">
            {`${friendDiscoveryProfile?.user?.firstName} ${friendDiscoveryProfile?.user?.lastName}`}
          </Text>
          <Text className="text-white/50 text-base mb-4">
            {friendDiscoveryProfile?.user?.username}
          </Text>

          {/* Friend Button */}
          {friendDiscoveryProfile?.user && (
            <FriendButton
              initialIsFriend={friendDiscoveryProfile.is_friend}
              onToggle={handleFriendToggle}
            />
          )}
        </View>

        {/* Streak Section */}
        <View className="px-4 mb-4">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white/50 text-[11px] font-bold tracking-[1.5px] mb-2">
                  CURRENT STREAK
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-white text-[32px] font-black">
                    {friendDiscoveryProfile?.stats?.current_streak || 0} Days
                  </Text>
                  <MaterialCommunityIcons
                    name="fire"
                    size={48}
                    color="#EA580C"
                  />
                </View>
              </View>
              {friendDiscoveryProfile?.stats &&
                friendDiscoveryProfile.stats.current_streak > 0 && (
                  <View className="bg-orange-600/20 px-3.5 py-1.5 rounded-lg">
                    <Text className="text-orange-600 text-[11px] font-black tracking-wide">
                      ACTIVE
                    </Text>
                  </View>
                )}
            </View>
          </View>
        </View>

        {/* This Week Progress */}
        <View className="px-4 mb-4">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <Text className="text-white/50 text-[11px] font-bold tracking-[1.5px] mb-3">
              THIS WEEK
            </Text>
            <View className="flex-row justify-between mb-2">
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <View
                  key={day}
                  className={`w-10 h-10 rounded-lg items-center justify-center ${
                    day < (friendDiscoveryProfile?.stats?.days_this_week || 0)
                      ? "bg-orange-600"
                      : "bg-white/[0.05]"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      day < (friendDiscoveryProfile?.stats?.days_this_week || 0)
                        ? "text-black"
                        : "text-white/30"
                    }`}
                  >
                    {["M", "T", "W", "T", "F", "S", "S"][day]}
                  </Text>
                </View>
              ))}
            </View>
            <Text className="text-white text-lg font-bold mt-2">
              {friendDiscoveryProfile?.stats?.days_this_week || 0}/7 days
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="px-4 mb-4">
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1 bg-white/[0.03] rounded-xl p-4 border border-white/[0.08]">
              <Text className="text-white/50 text-[10px] font-bold tracking-[1.5px] mb-1.5">
                RANK
              </Text>
              <Text className="text-white text-2xl font-black">
                #{friendDiscoveryProfile?.stats?.rank || 0}
              </Text>
            </View>

            <View className="flex-1 bg-white/[0.03] rounded-xl p-4 border border-white/[0.08]">
              <Text className="text-white/50 text-[10px] font-bold tracking-[1.5px] mb-1.5">
                TOTAL
              </Text>
              <Text className="text-white text-2xl font-black">
                {friendDiscoveryProfile?.stats?.total_days_drank || 0}
              </Text>
              <Text className="text-white/40 text-[11px] font-semibold mt-0.5">
                days
              </Text>
            </View>

            <View className="flex-1 bg-white/[0.03] rounded-xl p-4 border border-white/[0.08]">
              <Text className="text-white/50 text-[10px] font-bold tracking-[1.5px] mb-1.5">
                WINS
              </Text>
              <Text className="text-white text-2xl font-black">
                {friendDiscoveryProfile?.stats?.total_weeks_won || 0}
              </Text>
              <Text className="text-white/40 text-[11px] font-semibold mt-0.5">
                weeks
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-white/[0.03] rounded-xl p-4 border border-white/[0.08]">
              <Text className="text-white/50 text-[10px] font-bold tracking-[1.5px] mb-1.5">
                BEST STREAK
              </Text>
              <Text className="text-white text-2xl font-black">
                {friendDiscoveryProfile?.stats?.longest_streak || 0}
              </Text>
              <Text className="text-white/40 text-[11px] font-semibold mt-0.5">
                days
              </Text>
            </View>

            <View className="flex-1 bg-white/[0.03] rounded-xl p-4 border border-white/[0.08]">
              <Text className="text-white/50 text-[10px] font-bold tracking-[1.5px] mb-1.5">
                FRIENDS
              </Text>
              <Text className="text-white text-2xl font-black">
                {friendDiscoveryProfile?.stats?.friends_count || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Additional Stats */}
        <View className="px-4 mb-4">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <Text className="text-white/50 text-[11px] font-bold tracking-[1.5px] mb-3">
              DETAILED STATS
            </Text>

            <View className="flex-row justify-between items-center py-3 border-b border-white/[0.05]">
              <Text className="text-white/50 text-[13px] font-semibold">
                This Month
              </Text>
              <Text className="text-white text-[15px] font-bold">
                {friendDiscoveryProfile?.stats?.days_this_month || 0} days
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-3 border-b border-white/[0.05]">
              <Text className="text-white/50 text-[13px] font-semibold">
                This Year
              </Text>
              <Text className="text-white text-[15px] font-bold">
                {friendDiscoveryProfile?.stats?.days_this_year || 0} days
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-3">
              <Text className="text-white/50 text-[13px] font-semibold">
                Achievements
              </Text>
              <Text className="text-white text-[15px] font-bold">
                {friendDiscoveryProfile?.stats?.achievements_count || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements Preview */}
        <View className="px-4 mb-6">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-1">
                  ACHIEVEMENTS
                </Text>
                <Text className="text-white text-xl font-black">
                  Badges Earned
                </Text>
              </View>
              <View className="bg-orange-600/20 px-3.5 py-1.5 rounded-lg">
                <Text className="text-orange-600 text-xs font-black">
                  {achievements?.filter((a) => a.unlocked).length}/
                  {achievements?.length}
                </Text>
              </View>
            </View>
            {renderAchievementCategory(
              "Streaks & Days",
              groupedAchievements.streaks,
          
            )}
            {renderAchievementCategory(
              "Competition",
              groupedAchievements.competition,
             
            )}
            {renderAchievementCategory(
              "Social",
              groupedAchievements.social,
         
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default UserInfoScreen;



// import React, { useEffect, useMemo } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   ImageBackground,
//   Dimensions,
//   TouchableOpacity,
//   Platform,
// } from "react-native";
// import { Image } from "expo-image";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useApp } from "@/providers/AppProvider";
// import { getCoefInfo, getLevelInfo } from "@/utils/levels";
// import { FriendButton } from "@/components/friendButton";
// import SplashScreen from "@/components/spashScreen";
// import {
//   Ionicons,
//   MaterialCommunityIcons,
//   FontAwesome5,
// } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient"; // Assuming you have this, if not, standard Views work too

// const { width } = Dimensions.get("window");
// const IMG_HEIGHT = 300;

// const ACHIEVEMENT_IMAGES = {
//   lightning: require("../../assets/images/achievements/lightning.png"),
//   druid: require("../../assets/images/achievements/druid.png"),
//   campfire: require("../../assets/images/achievements/campfire.png"),
//   target: require("../../assets/images/achievements/target.png"),
//   crown: require("../../assets/images/achievements/crown.png"),
//   trophy: require("../../assets/images/achievements/trophy.png"),
//   star: require("../../assets/images/achievements/star.png"),
//   hundred: require("../../assets/images/achievements/100.png"),
// };

// export default function UserInfoScreen() {
//   const insets = useSafeAreaInsets();
//   const router = useRouter();
//   const { userId: rawUserId } = useLocalSearchParams();
//   const {
//     userData,
//     friendDiscoveryProfile,
//     getFriendDiscoveryDisplayProfile,
//     addFriend,
//     removeFriend,
//     isLoading,
//   } = useApp();

//   useEffect(() => {
//     const friendDiscoveryId = Array.isArray(rawUserId)
//       ? rawUserId[0]
//       : rawUserId;

//     if (!friendDiscoveryId) return;
//     getFriendDiscoveryDisplayProfile(friendDiscoveryId);
//   }, [rawUserId]);

//   const coefInfo = getCoefInfo(userData?.alcoholism_coefficient);
//   const levelInfo = getLevelInfo(userData?.xp);
//   const achievements = friendDiscoveryProfile?.achievements || [];

//   const handleFriendToggle = async (newState: boolean) => {
//     if (!friendDiscoveryProfile?.user) return;
//     newState
//       ? await addFriend(friendDiscoveryProfile.user.clerkId)
//       : await removeFriend(friendDiscoveryProfile.user.clerkId);
//   };

//   const getAchievementImage = (name: string) => {
//     const imageMap: { [key: string]: any } = {
//       Lightning: ACHIEVEMENT_IMAGES.lightning,
//       "Beast Mode": ACHIEVEMENT_IMAGES.druid,
//       "Fire Starter": ACHIEVEMENT_IMAGES.campfire,
//       Sharpshooter: ACHIEVEMENT_IMAGES.target,
//       King: ACHIEVEMENT_IMAGES.crown,
//       Champion: ACHIEVEMENT_IMAGES.trophy,
//       Legend: ACHIEVEMENT_IMAGES.star,
//       Century: ACHIEVEMENT_IMAGES.hundred,
//     };
//     return imageMap[name] || ACHIEVEMENT_IMAGES.lightning;
//   };

//   if (isLoading && !friendDiscoveryProfile) return <SplashScreen />;

//   return (
//     <View className="flex-1 bg-black">
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
//       >
//         {/* --- 1. IMMERSIVE HEADER SECTION --- */}
//         <View className="relative h-[420px]">
//           {/* Blurred Background Cover */}
//           <Image
//             source={{ uri: friendDiscoveryProfile?.user?.imageUrl }}
//             style={{ width: "100%", height: "100%", position: "absolute" }}
//             contentFit="cover"
//             blurRadius={30}
//           />
//           {/* Gradient Overlay for text readability */}
//           <View className="absolute inset-0 bg-black/60" />
//           <View className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

//           {/* Navigation Header */}
//           <View
//             style={{ paddingTop: insets.top + 10 }}
//             className="flex-row justify-between px-4 z-10"
//           >
//             <TouchableOpacity
//               onPress={() => router.back()}
//               className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/20"
//             >
//               <Ionicons name="arrow-back" size={20} color="white" />
//             </TouchableOpacity>

//             {/* Share/Menu Icon could go here */}
//             <TouchableOpacity className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/20">
//               <Ionicons name="share-outline" size={20} color="white" />
//             </TouchableOpacity>
//           </View>

//           {/* Main Profile Info */}
//           <View className="absolute bottom-0 w-full px-6 pb-10">
//             <View className="flex-row items-end justify-between">
//               {/* Avatar & Badges */}
//               <View>
//                 <View className="relative">
//                   <Image
//                     source={{ uri: friendDiscoveryProfile?.user?.imageUrl }}
//                     style={{ width: 100, height: 100, borderRadius: 30 }}
//                     className="border-2 border-white/20"
//                   />
//                   {/* Level Badge overlapping avatar */}
//                   <View className="absolute -bottom-3 -right-3 bg-orange-600 px-3 py-1 rounded-xl shadow-lg border-2 border-black">
//                     <Text className="text-white text-xs font-black">
//                       LVL {levelInfo.level}
//                     </Text>
//                   </View>
//                 </View>

//                 <View className="mt-4">
//                   <Text className="text-white text-3xl font-black tracking-tight shadow-md">
//                     {friendDiscoveryProfile?.user?.firstName}{" "}
//                     {friendDiscoveryProfile?.user?.lastName}
//                   </Text>
//                   <Text className="text-orange-500 font-bold text-sm tracking-widest uppercase opacity-90">
//                     @{friendDiscoveryProfile?.user?.username}
//                   </Text>
//                 </View>
//               </View>

//               {/* Action Button */}
//               <View className="mb-2">
//                 <FriendButton
//                   initialIsFriend={friendDiscoveryProfile?.is_friend}
//                   onToggle={handleFriendToggle}
//                 />
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* --- 2. HERO STATS (BENTO GRID) --- */}
//         <View className="px-4 -mt-6">
//           <View className="flex-row gap-3 mb-3 h-32">
//             {/* MAIN STAT: Streak */}
//             <View className="flex-[2] bg-[#1a1a1a] rounded-3xl p-5 border border-white/10 justify-between overflow-hidden relative">
//               <View className="absolute right-0 top-0 opacity-10">
//                 <MaterialCommunityIcons
//                   name="fire"
//                   size={100}
//                   color="#EA580C"
//                 />
//               </View>

//               <View className="flex-row items-center gap-2">
//                 <View className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
//                 <Text className="text-white/50 text-[10px] font-black uppercase tracking-widest">
//                   Streak
//                 </Text>
//               </View>

//               <View>
//                 <Text className="text-white text-5xl font-black tracking-tighter">
//                   {friendDiscoveryProfile?.stats?.current_streak || 0}
//                 </Text>
//                 <Text className="text-orange-500 font-bold text-xs">
//                   Days Active
//                 </Text>
//               </View>
//             </View>

//             {/* SECONDARY: Rank */}
//             <View className="flex-1 bg-[#1a1a1a] rounded-3xl p-4 border border-white/10 justify-between items-center">
//               <Text className="text-white/40 text-[10px] font-black uppercase tracking-widest">
//                 Rank
//               </Text>
//               <View className="items-center">
//                 <Text className="text-white text-3xl font-black">
//                   #{friendDiscoveryProfile?.stats?.rank || "-"}
//                 </Text>
//                 <Ionicons
//                   name="trophy"
//                   size={16}
//                   color="#fbbf24"
//                   style={{ marginTop: 4 }}
//                 />
//               </View>
//               <View />
//             </View>
//           </View>

//           {/* SECONDARY ROW */}
//           <View className="flex-row gap-3 mb-8">
//             {/* Total Drinks */}
//             <View className="flex-1 bg-[#1a1a1a] rounded-3xl p-4 border border-white/10 h-28 justify-center items-center">
//               <Text className="text-white text-2xl font-black mb-1">
//                 {friendDiscoveryProfile?.stats?.total_days_drank || 0}
//               </Text>
//               <Text className="text-white/40 text-[10px] font-bold uppercase text-center">
//                 Total Days
//               </Text>
//             </View>

//             {/* Wins */}
//             <View className="flex-1 bg-[#1a1a1a] rounded-3xl p-4 border border-white/10 h-28 justify-center items-center">
//               <Text className="text-orange-500 text-2xl font-black mb-1">
//                 {friendDiscoveryProfile?.stats?.total_weeks_won || 0}
//               </Text>
//               <Text className="text-white/40 text-[10px] font-bold uppercase text-center">
//                 Weeks Won
//               </Text>
//             </View>

//             {/* Friends */}
//             <View className="flex-1 bg-[#1a1a1a] rounded-3xl p-4 border border-white/10 h-28 justify-center items-center">
//               <Text className="text-white text-2xl font-black mb-1">
//                 {friendDiscoveryProfile?.stats?.friends_count || 0}
//               </Text>
//               <Text className="text-white/40 text-[10px] font-bold uppercase text-center">
//                 Buddies
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* --- 3. WEEKLY ACTIVITY (BAR CHART STYLE) --- */}
//         <View className="px-4 mb-8">
//           <View className="bg-white/[0.03] rounded-[32px] p-6 border border-white/10">
//             <View className="flex-row justify-between items-end mb-6">
//               <View>
//                 <Text className="text-white text-lg font-black">This Week</Text>
//                 <Text className="text-white/40 text-xs font-medium">
//                   Activity Breakdown
//                 </Text>
//               </View>
//               <Text className="text-orange-500 text-2xl font-black">
//                 {friendDiscoveryProfile?.stats?.days_this_week || 0}
//                 <Text className="text-white/30 text-base">/7</Text>
//               </Text>
//             </View>

//             <View className="flex-row justify-between items-end h-24 px-2">
//               {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => {
//                 const isActive =
//                   index < (friendDiscoveryProfile?.stats?.days_this_week || 0);
//                 const height = isActive ? "80%" : "20%"; // Mocking bar height based on activity

//                 return (
//                   <View key={index} className="items-center gap-3">
//                     <View
//                       className={`w-3 rounded-full ${isActive ? "bg-orange-500 shadow-lg shadow-orange-500/50" : "bg-white/10"}`}
//                       style={{ height }}
//                     />
//                     <Text
//                       className={`text-[10px] font-bold ${isActive ? "text-white" : "text-white/30"}`}
//                     >
//                       {day}
//                     </Text>
//                   </View>
//                 );
//               })}
//             </View>
//           </View>
//         </View>

//         {/* --- 4. TROPHY SHELF (SCROLLABLE) --- */}
//         <View className="mb-8">
//           <View className="px-6 flex-row justify-between items-center mb-4">
//             <Text className="text-white text-xl font-black">Trophy Case</Text>
//             <TouchableOpacity>
//               <Text className="text-orange-500 text-xs font-bold">
//                 View All
//               </Text>
//             </TouchableOpacity>
//           </View>

//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
//           >
//             {/* Completion Card */}
//             <View className="w-32 h-40 bg-orange-600 rounded-3xl p-4 justify-between items-start">
//               <View className="bg-black/20 p-2 rounded-full">
//                 <Ionicons name="star" size={16} color="white" />
//               </View>
//               <View>
//                 <Text className="text-black text-3xl font-black">
//                   {achievements.filter((a) => a.unlocked).length}
//                 </Text>
//                 <Text className="text-black/60 text-xs font-bold leading-tight">
//                   Unlocked Badges
//                 </Text>
//               </View>
//             </View>

//             {/* Achievement Items */}
//             {achievements.map((item, index) => (
//               <View
//                 key={index}
//                 className={`w-32 h-40 rounded-3xl p-3 justify-center items-center border ${
//                   item.unlocked
//                     ? "bg-[#1A1A1A] border-orange-500/30"
//                     : "bg-[#111] border-white/5"
//                 }`}
//               >
//                 <Image
//                   source={getAchievementImage(item.name)}
//                   style={{
//                     width: 64,
//                     height: 64,
//                     opacity: item.unlocked ? 1 : 0.2,
//                     marginBottom: 12,
//                   }}
//                   contentFit="contain"
//                 />
//                 <Text
//                   numberOfLines={1}
//                   className={`text-xs font-bold text-center ${item.unlocked ? "text-white" : "text-white/30"}`}
//                 >
//                   {item.name}
//                 </Text>
//               </View>
//             ))}
//           </ScrollView>
//         </View>

//         {/* --- 5. DETAILED DATA --- */}
//         <View className="px-4">
//           <View className="bg-[#111] rounded-3xl p-1 border border-white/5">
//             {[
//               {
//                 label: "Current Level XP",
//                 value: `${userData?.xp || 0} XP`,
//                 icon: "flash",
//               },
//               { label: "Account Age", value: "Nov 2024", icon: "calendar" }, // Mock data, replace if avail
//               {
//                 label: "Alcohol Coefficient",
//                 value: coefInfo.coef,
//                 icon: "analytics",
//               },
//             ].map((stat, i) => (
//               <View
//                 key={i}
//                 className="flex-row items-center justify-between p-5 border-b border-white/5 last:border-0"
//               >
//                 <View className="flex-row items-center gap-4">
//                   <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
//                     <Ionicons name={stat.icon as any} size={18} color="#666" />
//                   </View>
//                   <Text className="text-white/60 font-medium">
//                     {stat.label}
//                   </Text>
//                 </View>
//                 <Text className="text-white font-bold text-base">
//                   {stat.value}
//                 </Text>
//               </View>
//             ))}
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }
