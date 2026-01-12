import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome6, Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { useApp } from "@/providers/AppProvider";
import type { UserData } from "@/types/api.types";
import { NestedScreenHeader } from "@/components/nestedScreenHeader";


const CompactSegmentedControl = ({
  selected,
  onSelect,
}: {
  selected: "friends" | "discovery";
  onSelect: (val: "friends" | "discovery") => void;
}) => {
  return (
    <View className="mx-12 mb-4 mt-4 h-10 bg-white/[0.03] rounded-full border border-white/[0.08] p-1 flex-row relative">
      <TouchableOpacity
        onPress={() => onSelect("friends")}
        className={`flex-1 items-center justify-center rounded-full flex-row ${
          selected === "friends" ? "bg-orange-600" : "bg-transparent"
        }`}
      >
        <Ionicons
          name="people"
          size={12}
          color={selected === "friends" ? "black" : "#666"}
          style={{ marginRight: 4 }}
        />
        <Text
          className={`text-[11px] font-black tracking-wide ${selected === "friends" ? "text-black" : "text-white/40"}`}
        >
          BUDDIES
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onSelect("discovery")}
        className={`flex-1 items-center justify-center rounded-full flex-row ${
          selected === "discovery" ? "bg-orange-600" : "bg-transparent"
        }`}
      >
        <Ionicons
          name="compass"
          size={12}
          color={selected === "discovery" ? "black" : "#666"}
          style={{ marginRight: 4 }}
        />
        <Text
          className={`text-[11px] font-black tracking-wide ${
            selected === "discovery" ? "text-black" : "text-white/40"
          }`}
        >
          DISCOVERY
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const SearchBar = ({ value, onChangeText, placeholder, onClear }: any) => (
  <View className="flex-row items-center bg-white/[0,03] border border-white/[0.08] rounded-full px-4 h-12 mb-4">
    <Ionicons name="search" size={20} color="#666" />
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#666"
      className="flex-1 ml-3 text-base font-bold text-white"
      autoCapitalize="none"
      autoCorrect={false}
    />
    {value.length > 0 && (
      <TouchableOpacity
        onPress={onClear}
        className="bg-white/10 rounded-full p-1"
      >
        <Ionicons name="close" size={14} color="white" />
      </TouchableOpacity>
    )}
  </View>
);

const UserRowCard = ({
  item,
  actionIcon,
  onPress,
  onActionPress,
}: {
  item: UserData;
  actionIcon?: any;
  onPress: () => void;
  onActionPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="bg-white/[0.03] rounded-3xl p-4 border border-white/[0.08] flex-row items-center mb-3"
    >
      {/* Avatar */}
      <View className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-white/10 items-center justify-center mr-4 overflow-hidden">
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} className="w-full h-full" />
        ) : (
          <Text className="text-white/60 text-lg font-black">
            {item.username?.[0]?.toUpperCase() || "?"}
          </Text>
        )}
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-white text-base font-black mb-0.5">
          {item.username || "Unknown"}
        </Text>
        {(item.firstName || item.lastName) && (
          <Text className="text-white/40 text-xs font-bold tracking-wide">
            {[item.firstName, item.lastName].filter(Boolean).join(" ")}
          </Text>
        )}
      </View>

      {onActionPress ? (
        <TouchableOpacity
          onPress={onActionPress}
          className="w-10 h-10 rounded-xl bg-orange-600/10 items-center justify-center border border-orange-600/30"
        >
          {actionIcon}
        </TouchableOpacity>
      ) : (
        <View className="w-8 h-8 rounded-full bg-white/[0.05] items-center justify-center">
          <Feather name="chevron-right" size={16} color="#666" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const BuddiesDiscoverScreen = () => {
  const {
    userData,
    friends,
    discovery,
    isLoading,
    addFriend,
    refreshFriends,
    refreshDiscovery,
  } = useApp();

  const [searchQueryFriend, setSearchQueryFriend] = useState("");
  const [activeTab, setActiveTab] = useState<"friends" | "discovery">(
    "friends"
  );
  const insets = useSafeAreaInsets();

  const filteredFriends = useMemo(() => {
    if (!Array.isArray(friends)) return [];
    if (!searchQueryFriend.trim()) return friends;
    return friends.filter((item) =>
      (item.username || "")
        .toLowerCase()
        .includes(searchQueryFriend.toLowerCase().trim())
    );
  }, [friends, searchQueryFriend]);

  const handleRefresh = async () => {
    if (userData?.id) {
      activeTab === "friends" ? refreshFriends() : refreshDiscovery();
    }
  };

  const renderFriendItem = ({ item }: { item: UserData }) => (
    <UserRowCard
      item={item}
      onPress={() => router.push(`/(screens)/userInfo?userId=${item.id}`)}
    />
  );

  const renderDiscoveryItem = ({ item }: { item: UserData }) => (
    <UserRowCard
      item={item}
      onPress={() => router.push(`/(screens)/userInfo?userId=${item.id}`)}
      onActionPress={() => addFriend(item.clerkId)}
      actionIcon={<Ionicons name="person-add" size={18} color="#EA580C" />}
    />
  );

  const ListEmptyComponent = () => {
    if (isLoading) {
      return (
        <View className="py-20 items-center">
          <ActivityIndicator size="large" color="#EA580C" />
        </View>
      );
    }

    const isSearch = searchQueryFriend.trim().length > 0;
    const iconName =
      activeTab === "friends"
        ? isSearch
          ? "sad-tear"
          : "people-outline"
        : "compass-outline";
    const title =
      activeTab === "friends"
        ? isSearch
          ? "No Results"
          : "No Buddies Yet"
        : "No Suggestions";
    const subtitle =
      activeTab === "friends"
        ? isSearch
          ? `No buddies found matching "${searchQueryFriend}"`
          : "Who's the one who can bring you back to drinking?"
        : "Seems there are no drinkers nearby.";

    return (
      <View className="items-center justify-center pt-20 px-10 opacity-50">
        <View className="w-20 h-20 bg-white/5 rounded-full items-center justify-center mb-4 border border-white/10">
          {activeTab === "friends" && isSearch ? (
            <FontAwesome6 name="sad-tear" size={32} color="white" />
          ) : (
            <Ionicons name={iconName as any} size={32} color="white" />
          )}
        </View>
        <Text className="text-white text-lg font-black">{title}</Text>
        <Text className="text-white/60 text-center text-sm mt-2 font-medium">
          {subtitle}
        </Text>
      </View>
    );
  };

  const DiscoveryHeader = () => (
    <View className="mb-4 mt-2">
      <TouchableOpacity
        activeOpacity={0.8}
        className="bg-orange-600 rounded-3xl p-5 flex-row items-center justify-center shadow-lg shadow-orange-600/20 mb-6"
        onPress={() => router.push(`/(screens)/searchDrinkers`)}
      >
        <Ionicons name="search" size={20} color="black" />
        <Text className="text-black text-base font-black uppercase tracking-wider ml-2">
          Find New Drinkers
        </Text>
      </TouchableOpacity>

      {discovery.length > 0 && (
        <Text className="text-white/40 text-[10px] font-black tracking-[3px] uppercase mb-3 pl-2">
          SUGGESTED ({discovery.length})
        </Text>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

     
      <View className="flex-1" style={{ paddingTop: insets.top }}>
        <NestedScreenHeader
          eyebrow="DRUNK"
          title={activeTab === "friends" ? "Your Buddies" : "Discover"}
          showBack={true}
          rightAction={
            activeTab === "friends" ? (
              <View className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                <Text className="text-white font-bold text-xs">
                  {filteredFriends.length}
                </Text>
              </View>
            ) : null
          }
        />

        <View className="px-4 z-10 bg-black pb-2 border-b border-white/[0.05]">
          <CompactSegmentedControl
            selected={activeTab}
            onSelect={setActiveTab}
          />

          {activeTab === "friends" && (
            <SearchBar
              value={searchQueryFriend}
              onChangeText={setSearchQueryFriend}
              onClear={() => setSearchQueryFriend("")}
              placeholder="Search your list..."
            />
          )}
        </View>

        <FlatList
          data={activeTab === "friends" ? filteredFriends : discovery}
          keyExtractor={(item) =>
            item.id || item.username || Math.random().toString()
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 100,
          }}
          ListHeaderComponent={
            activeTab === "discovery" ? DiscoveryHeader : null
          }
          renderItem={
            activeTab === "friends" ? renderFriendItem : renderDiscoveryItem
          }
          ListEmptyComponent={ListEmptyComponent}
          refreshing={isLoading}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor="#EA580C"
              colors={["#EA580C"]}
              progressBackgroundColor="#1A1A1A"
            />
          }
        />
      </View>
    </View>
  );
};

export default BuddiesDiscoverScreen;
