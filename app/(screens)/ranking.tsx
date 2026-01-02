import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Platform,
  UIManager,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useApp } from "@/providers/AppProvider";
import type { LeaderboardEntry } from "@/types/api.types";
import { LinearGradient } from "expo-linear-gradient";
import {NestedScreenHeader} from "@/components/nestedScreenHeader";
import { getCoefInfo } from "@/utils/levels";
import { useRouter } from "expo-router";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Leaderboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { leaderboard, refreshLeaderboard, userData, isLoading } = useApp();
  const [activeTab, setActiveTab] = useState<"friends" | "global">("friends");
  const [refreshing, setRefreshing] = useState(false);

  const currentLeaderboard =
    activeTab === "global" ? leaderboard?.global : leaderboard?.friends;

  const entries = useMemo(
    () => currentLeaderboard?.entries || [],
    [currentLeaderboard]
  );
  const userPosition = currentLeaderboard?.user_position;

  console.log("-----------------------------------------------");
  console.log(entries);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshLeaderboard();
    setRefreshing(false);
  };

  const handleTabChange = (tab: "friends" | "global") => {
    setActiveTab(tab);
  };


  const renderPodium = () => {
    if (entries.length === 0) return null;

    const first = entries[0];
    const second = entries[1];
    const third = entries[2];

    return (
      <View className="flex-row justify-center items-end mb-10 mt-6 px-4 gap-3">
        {second && (
          <View className="items-center w-1/3 mb-4">
            <TouchableOpacity
              onPress={() =>
                router.push(`/(screens)/userInfo?userId=${second.user_id}`)
              }
              className="p-1 bg-black mb-2"
            >
              <Image
                source={{
                  uri: second?.image_url || "https://github.com/shadcn.png",
                }}
                className="w-16 h-16 rounded-full"
                style={{ opacity: 0.8 }}
              />
            </TouchableOpacity>
            <Text
              className="text-white font-bold text-sm mb-1"
              numberOfLines={1}
            >
              {second.username}
            </Text>
            <Text className="text-white/40 text-xs font-bold">
              {second.alcoholism_coefficient.toFixed(0)} Pts
            </Text>
            <View className="bg-white/10 w-full h-24 rounded-t-lg mt-2 items-center justify-start pt-2 border-t border-l border-r border-white/20">
              <Text className="text-3xl font-black text-white/50">2</Text>
            </View>
          </View>
        )}

        {first && (
          <View className="items-center w-1/3 z-10">
            <MaterialCommunityIcons
              name="crown"
              size={32}
              color="#EA580C"
              style={{ marginBottom: -10, zIndex: 10 }}
            />
            <TouchableOpacity
              onPress={() =>
                router.push(`/(screens)/userInfo?userId=${first.user_id}`)
              }
              className=" p-1 bg-black shadow-lg shadow-orange-600/50 mb-2"
            >
              <Image
                source={{
                  uri: first.image_url || "https://github.com/shadcn.png",
                }}
                className="w-24 h-24 rounded-full"
              />
            </TouchableOpacity>
            <Text
              className="text-white font-bold text-base mb-1"
              numberOfLines={1}
            >
              {first.username}
            </Text>
            <View className="bg-orange-600/20 px-3 py-1 rounded-full mb-1 border border-orange-600/30">
              <Text className="text-orange-500 text-[10px] font-black tracking-wider uppercase">
                {getCoefInfo(first.alcoholism_coefficient).title}
              </Text>
            </View>
            <Text className="text-white/60 text-xs font-bold">
              {first.alcoholism_coefficient.toFixed(0)} Pts
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
        )}

        {third && (
          <View className="items-center w-1/3 mb-2">
            <TouchableOpacity
              onPress={() =>
                router.push(`/(screens)/userInfo?userId=${third.user_id}`)
              }
              className="p-1 bg-black mb-2"
            >
              <Image
                source={{
                  uri: third.image_url || "https://github.com/shadcn.png",
                }}
                className="w-16 h-16 rounded-full"
                style={{ opacity: 0.6 }}
              />
            </TouchableOpacity>
            <Text
              className="text-white font-bold text-sm mb-1"
              numberOfLines={1}
            >
              {third.username}
            </Text>
            <Text className="text-white/40 text-xs font-bold">
              {third.alcoholism_coefficient.toFixed(0)} Pts
            </Text>
            <View className="bg-[#B45309]/20 w-full h-20 rounded-t-lg mt-2 items-center justify-start pt-2 border-t border-l border-r border-[#B45309]/30">
              <Text className="text-3xl font-black text-[#B45309]/50">3</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const TabSelection = () => {
    return (
      <View className="px-2">
        <View className="bg-white/[0.03] rounded-2xl p-1.5 flex-row border border-white/[0.08]">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl items-center ${
              activeTab === "friends" ? "bg-orange-600" : ""
            }`}
            onPress={() => handleTabChange("friends")}
          >
            <Text
              className={`text-sm font-black tracking-wider ${
                activeTab === "friends" ? "text-white" : "text-white/30"
              }`}
            >
              BUDDIES
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl items-center ${
              activeTab === "global" ? "bg-orange-600" : ""
            }`}
            onPress={() => handleTabChange("global")}
          >
            <Text
              className={`text-sm font-black tracking-wider ${
                activeTab === "global" ? "text-white" : "text-white/30"
              }`}
            >
              GLOBAL
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const renderRankItem = ({ item }: { item: LeaderboardEntry }) => {
    if (item.rank === 1) return null;

    const isMe = item.user_id === userData?.id;

    return (
      <TouchableOpacity
        onPress={() =>
          router.push(`/(screens)/userInfo?userId=${item.user_id}`)
        }
        className={`flex-row items-center p-4 mx-4 mb-3 rounded-2xl border ${
          isMe
            ? "bg-orange-600/10 border-orange-600"
            : "bg-white/[0.03] border-white/[0.08]"
        }`}
      >
        <Text
          className={`text-xl font-black w-10 text-center mr-2 ${
            isMe ? "text-orange-500" : "text-white/30"
          }`}
        >
          {item.rank}
        </Text>

        <View className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-white/5 border border-white/10">
          <Image
            source={{ uri: item.image_url || "https://github.com/shadcn.png" }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              className={`font-bold text-base ${
                isMe ? "text-orange-500" : "text-white"
              }`}
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
            {getCoefInfo(item.alcoholism_coefficient).title}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-white font-black text-lg">
            {item.alcoholism_coefficient.toFixed(0)}
          </Text>
          <Text className="text-white/30 text-[9px] font-bold">PTS</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top + 6 }}>
      <NestedScreenHeader title="Ranking" eyebrow="BIGGEST ALCOHOLIC" />
      <TabSelection />

      {isLoading && !refreshing && entries.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EA580C" />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.user_id}
          ListHeaderComponent={renderPodium}
          renderItem={renderRankItem}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ff8c00"
              colors={["#ff8c00"]}
              progressBackgroundColor="#000000"
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

      {userPosition && (
        <View
          className="absolute bottom-0 left-0 right-0 bg-[#0F0F0F] border-t-2 border-orange-600 pb-10 pt-4 px-4 shadow-2xl"
          style={{ paddingBottom: insets.bottom + 10 }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="items-center mr-4 w-8">
                <Text className="text-white font-black text-xl leading-5">
                  #{userPosition.rank}
                </Text>
              </View>

              <Image
                source={{
                  uri:
                    userPosition.image_url || "https://github.com/shadcn.png",
                }}
                className="w-10 h-10 rounded-full bg-gray-800 mr-3 border border-white/20"
              />

              <View>
                <Text className="text-white font-bold text-sm">
                  Your Position
                </Text>
                <Text className="text-white/40 text-[10px] font-bold tracking-widest uppercase">
                  {getCoefInfo(userPosition.alcoholism_coefficient).title}
                </Text>
              </View>
            </View>

            <View className="items-center bg-orange-600/10 px-4 py-2 rounded-xl border border-orange-600/30">
              <Text className="text-orange-500 font-black text-lg">
                {userPosition.alcoholism_coefficient.toFixed(0)}
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
