import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";
import { Header } from "@/components/header";
import { useApp } from "@/providers/AppProvider";
import { UserData } from "@/types/api.types";
import { useAuth } from "@clerk/clerk-expo";
// You might need to adjust this import path depending on where your gradients are,
// or remove if using pure Tailwind classes.
import { LinearGradient } from "expo-linear-gradient";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Mock Types - Adjust to your actual DB types
interface RankedUser extends UserData {
  rank: number;
  score: number; // Derived from collection count + streak
  bottleCount: number;
  streak: number;
  title: string; // e.g. "Tipsy King", "Novice", "Legend"
}

export default function Leaderboard() {
  const insets = useSafeAreaInsets();
  const { user, friends } = useApp(); // Assuming user provides current user data
  const [activeTab, setActiveTab] = useState<"friends" | "global">("friends");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock Data states
  const [rankingData, setRankingData] = useState<RankedUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<RankedUser | null>(
    null
  );

  useEffect(() => {
    fetchRankings();
  }, [activeTab]);

  const fetchRankings = async () => {
    setLoading(true);
    // Simulate API Call
    setTimeout(() => {
      const data = activeTab === "friends" ? mockFriendsData : mockGlobalData;
      setRankingData(data);

      // Find current user in the list (Simulated)
      // In real app: use user.id to find
      const myRank = data.find((u) => u.id === "current_user_id") || null;
      setCurrentUserRank(myRank);

      setLoading(false);
    }, 800);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRankings();
    setRefreshing(false);
  };

  const handleTabChange = (tab: "friends" | "global") => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "#F59E0B"; // Gold/Orange-ish
      case 2:
        return "#E2E8F0"; // Silver
      case 3:
        return "#B45309"; // Bronze
      default:
        return "#ffffff50";
    }
  };

  // Render the Top 3 podium differently
  const renderPodium = () => {
    if (rankingData.length < 3) return null;
    const [first, second, third] = rankingData;

    return (
      <View className="flex-row justify-center items-end mb-10 mt-6 px-4 gap-3">
        {/* Second Place (Left) */}
        <View className="items-center w-1/3 mb-4">
          <View className="border border-white/10 rounded-full p-1 bg-black mb-2">
            <Image
              source={{
                uri: second.imageUrl || "https://github.com/shadcn.png",
              }}
              className="w-16 h-16 rounded-full"
              style={{ opacity: 0.8 }}
            />
          </View>
          <Text className="text-white font-bold text-sm mb-1" numberOfLines={1}>
            {second.username}
          </Text>
          <Text className="text-white/40 text-xs font-bold">
            {second.score} XP
          </Text>
          <View className="bg-white/10 w-full h-24 rounded-t-lg mt-2 items-center justify-start pt-2 border-t border-l border-r border-white/20">
            <Text className="text-3xl font-black text-white/50">2</Text>
          </View>
        </View>

        {/* First Place (Center - Biggest) */}
        <View className="items-center w-1/3 z-10">
          <MaterialCommunityIcons
            name="crown"
            size={32}
            color="#EA580C"
            style={{ marginBottom: -10, zIndex: 10 }}
          />
          <View className="border-2 border-orange-600 rounded-full p-1 bg-black shadow-lg shadow-orange-600/50 mb-2">
            <Image
              source={{
                uri: first.imageUrl || "https://github.com/shadcn.png",
              }}
              className="w-24 h-24 rounded-full"
            />
          </View>
          <Text
            className="text-white font-bold text-base mb-1"
            numberOfLines={1}
          >
            {first.username}
          </Text>
          <View className="bg-orange-600/20 px-3 py-1 rounded-full mb-1 border border-orange-600/30">
            <Text className="text-orange-500 text-[10px] font-black tracking-wider uppercase">
              {first.title}
            </Text>
          </View>
          <Text className="text-white/60 text-xs font-bold">
            {first.score} XP
          </Text>

          <LinearGradient
            colors={["#EA580C", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="w-full h-32 rounded-t-xl mt-2 items-center justify-start pt-2 opacity-80"
          >
            <Text className="text-5xl font-black text-black/50 mt-1">1</Text>
          </LinearGradient>
        </View>

        {/* Third Place (Right) */}
        <View className="items-center w-1/3 mb-2">
          <View className="border border-white/10 rounded-full p-1 bg-black mb-2">
            <Image
              source={{
                uri: third.imageUrl || "https://github.com/shadcn.png",
              }}
              className="w-16 h-16 rounded-full"
              style={{ opacity: 0.6 }}
            />
          </View>
          <Text className="text-white font-bold text-sm mb-1" numberOfLines={1}>
            {third.username}
          </Text>
          <Text className="text-white/40 text-xs font-bold">
            {third.score} XP
          </Text>
          <View className="bg-[#B45309]/20 w-full h-20 rounded-t-lg mt-2 items-center justify-start pt-2 border-t border-l border-r border-[#B45309]/30">
            <Text className="text-3xl font-black text-[#B45309]/50">3</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderRankItem = ({ item }: { item: RankedUser }) => {
    // Top 3 are handled by podium, skip them in list or style them differently?
    // Usually lists skip top 3 or highlight them. Let's just list 4 onwards for this "Unique" look.
    if (item.rank <= 3) return null;

    const isMe = item.id === "current_user_id";

    return (
      <View
        className={`flex-row items-center p-4 mx-4 mb-3 rounded-2xl border ${
          isMe
            ? "bg-orange-600/10 border-orange-600"
            : "bg-white/[0.03] border-white/[0.08]"
        }`}
      >
        <Text
          className={`text-xl font-black w-10 text-center mr-2 ${isMe ? "text-orange-500" : "text-white/30"}`}
        >
          {item.rank}
        </Text>

        <View className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-white/5 border border-white/10">
          <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-full"
            contentFit="cover"
          />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              className={`font-bold text-base ${isMe ? "text-orange-500" : "text-white"}`}
            >
              {item.username}
            </Text>
            {isMe && (
              <View className="bg-orange-600/20 px-2 rounded-md">
                <Text className="text-orange-600 text-[9px] font-bold">
                  YOU
                </Text>
              </View>
            )}
          </View>
          <Text className="text-white/30 text-[10px] font-bold tracking-widest uppercase mt-0.5">
            {item.bottleCount} Bottles • {item.streak} Day Streak
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-white font-black text-lg">{item.score}</Text>
          <Text className="text-white/30 text-[9px] font-bold">XP</Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      {/* Header Area */}
      <Header />

      <View className="px-4 pb-2">
        <Text className="text-white text-3xl font-black mb-1">Rankings</Text>
        <Text className="text-white/50 text-xs font-bold tracking-widest uppercase mb-6">
          See who is the biggest alcoholic
        </Text>
      </View>

      {/* Custom Segmented Tab Control */}
      <View className="px-4 mb-4">
        <View className="flex-row bg-white/[0.05] p-1 rounded-xl border border-white/[0.1]">
          <TouchableOpacity
            className={`${
              activeTab === "friends"
                ? "flex-1 py-3 rounded-lg items-center bg-orange-600 shadow-md"
                : "flex-1 py-3 rounded-lg items-center bg-transparent"
            }`}
            onPress={() => handleTabChange("friends")}
          >
            <Text
              className={`${
                activeTab === "friends"
                  ? "font-black tracking-wider text-xs text-black"
                  : "font-black tracking-wider text-xs text-white/50"
              }`}
            >
              FRIENDS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`${
              activeTab === "global"
                ? "flex-1 py-3 rounded-lg items-center bg-orange-600 shadow-md"
                : "flex-1 py-3 rounded-lg items-center bg-transparent"
            }`}
            onPress={() => handleTabChange("global")}
          >
            <Text
              className={`${
                activeTab === "global"
                  ? "font-black tracking-wider text-xs text-black"
                  : "font-black tracking-wider text-xs text-white/50"
              }`}
            >
              GLOBAL
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EA580C" />
        </View>
      ) : (
        <FlatList
          data={rankingData}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderPodium}
          renderItem={renderRankItem}
          contentContainerStyle={{ paddingBottom: 120 }} // Space for the sticky user bar
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#EA580C"
            />
          }
          ListEmptyComponent={
            <View className="items-center py-20 opacity-50">
              <Ionicons name="trophy-outline" size={64} color="white" />
              <Text className="text-white mt-4 font-bold">
                No ranking data yet.
              </Text>
            </View>
          }
        />
      )}

      {/* Sticky User Position Bar (At bottom) */}
      {currentUserRank && (
        <View
          className="absolute bottom-0 left-0 right-0 bg-[#0F0F0F] border-t-2 border-orange-600 pb-10 pt-4 px-4 shadow-2xl"
          style={{ paddingBottom: insets.bottom + 10 }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="items-center mr-4 w-8">
                <MaterialCommunityIcons
                  name="chevron-up"
                  size={16}
                  color="#22c55e"
                />
                <Text className="text-white font-black text-xl leading-5">
                  {currentUserRank.rank}
                </Text>
              </View>

              <Image
                source={{ uri: currentUserRank.imageUrl }}
                className="w-10 h-10 rounded-full bg-gray-800 mr-3 border border-white/20"
              />

              <View>
                <Text className="text-white font-bold text-sm">
                  Your Position
                </Text>
                <Text className="text-white/40 text-[10px] font-bold tracking-widest uppercase">
                  {currentUserRank.title}
                </Text>
              </View>
            </View>

            <View className="items-end bg-orange-600/10 px-4 py-2 rounded-xl border border-orange-600/30">
              <Text className="text-orange-500 font-black text-lg">
                {currentUserRank.score}
              </Text>
              <Text className="text-orange-500/50 text-[8px] font-bold uppercase text-right">
                Points
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// ----------------------
// Mock Data Helpers
// ----------------------

const mockFriendsData: RankedUser[] = [
  {
    id: "u1",
    username: "Alejandro",
    rank: 1,
    score: 2450,
    bottleCount: 15,
    streak: 12,
    imageUrl: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    title: "THE LEGEND",
    firstName: "Ale",
    lastName: "G",
  },
  {
    id: "u2",
    username: "Sarah_B",
    rank: 2,
    score: 2100,
    bottleCount: 11,
    streak: 8,
    imageUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    title: "Wine Lover",
    firstName: "Sarah",
    lastName: "B",
  },
  {
    id: "u3",
    username: "MikeDranks",
    rank: 3,
    score: 1850,
    bottleCount: 8,
    streak: 5,
    imageUrl: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    title: "Social Drinker",
    firstName: "Mike",
    lastName: "D",
  },
  {
    id: "current_user_id",
    username: "You",
    rank: 4,
    score: 1600,
    bottleCount: 5,
    streak: 15,
    imageUrl: "https://github.com/shadcn.png",
    title: "Rising Star",
    firstName: "Me",
    lastName: "Me",
  },
  {
    id: "u5",
    username: "Dave_shots",
    rank: 5,
    score: 1200,
    bottleCount: 20,
    streak: 0,
    imageUrl: "https://i.pravatar.cc/150?u=a04258a2462d826712d",
    title: "Party Animal",
    firstName: "Dave",
    lastName: "S",
  },
  // Add more mock users to test scrolling...
];

const mockGlobalData: RankedUser[] = [
  {
    id: "g1",
    username: "VodkaVal",
    rank: 1,
    score: 9900,
    bottleCount: 124,
    streak: 365,
    imageUrl: "https://i.pravatar.cc/150?u=vodka",
    title: "IMORTAL",
    firstName: "V",
    lastName: "V",
  },
  {
    id: "g2",
    username: "BeerBaron",
    rank: 2,
    score: 8750,
    bottleCount: 95,
    streak: 200,
    imageUrl: "https://i.pravatar.cc/150?u=beer",
    title: "Baron",
    firstName: "B",
    lastName: "B",
  },
  {
    id: "g3",
    username: "GinGenius",
    rank: 3,
    score: 8200,
    bottleCount: 80,
    streak: 45,
    imageUrl: "https://i.pravatar.cc/150?u=gin",
    title: "Mixologist",
    firstName: "G",
    lastName: "G",
  },
  // ... fill gap ...
  {
    id: "current_user_id",
    username: "You",
    rank: 142,
    score: 1600,
    bottleCount: 5,
    streak: 15,
    imageUrl: "https://github.com/shadcn.png",
    title: "Rising Star",
    firstName: "Me",
    lastName: "Me",
  },
];
