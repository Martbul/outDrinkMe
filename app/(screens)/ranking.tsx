import NestedScreenHeader from "@/components/nestedScreenHeader";
import { useApp } from "@/providers/AppProvider";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, LayoutAnimation, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Leaderboard() {
  const insets = useSafeAreaInsets();
  const { userData, friends } = useApp();
  const [activeTab, setActiveTab] = useState<"buddies" | "global">("buddies");
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
      const data = activeTab === "buddies" ? mockFriendsData : mockGlobalData;
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

  const handleTabChange = (tab: "buddies" | "global") => {
   //  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
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

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      {/* Header Area */}
      <NestedScreenHeader heading="Ranking" secondaryHeading="Drunk" />
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
            className={`flex-1 py-3 rounded-lg items-center ${activeTab === "buddies" ? "bg-orange-600 shadow-md" : "bg-transparent"}`}
            onPress={() => handleTabChange("buddies")}
          >
            <Text
              className={`font-black tracking-wider text-xs ${activeTab === "buddies" ? "text-black" : "text-white/50"}`}
            >
              FRIENDS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg items-center ${activeTab === "global" ? "bg-orange-600 shadow-md" : "bg-transparent"}`}
            onPress={() => handleTabChange("global")}
          >
            <Text
              className={`font-black tracking-wider text-xs ${activeTab === "global" ? "text-black" : "text-white/50"}`}
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
         //  renderItem={renderRankItem}
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
