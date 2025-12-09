import NestedScreenHeader from "@/components/nestedScreenHeader";
import { useApp } from "@/providers/AppProvider";
import type { UserData } from "@/types/api.types";
import { FontAwesome6, Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");
  const insets = useSafeAreaInsets();

  const filteredFriends = useMemo(() => {
    if (!Array.isArray(friends)) {
      return [];
    }

    if (!searchQueryFriend.trim()) {
      return friends;
    }

    return friends.filter((item) =>
      (item.username || "")
        .toLowerCase()
        .includes(searchQueryFriend.toLowerCase().trim())
    );
  }, [friends, searchQueryFriend]);

  const TabSelection = () => {
    return (
      <View className="px-4 pt-1 pb-4">
        <View className="bg-white/[0.03] rounded-2xl p-1.5 flex-row border border-white/[0.08]">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl items-center ${
              activeTab === "friends" ? "bg-orange-600" : ""
            }`}
            onPress={() => setActiveTab("friends")}
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
              activeTab === "discovery" ? "bg-orange-600" : ""
            }`}
            onPress={() => setActiveTab("discovery")}
          >
            <Text
              className={`text-sm font-black tracking-wider ${
                activeTab === "discovery" ? "text-white" : "text-white/30"
              }`}
            >
              DISCOVERY
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFriendItem = ({ item }: { item: UserData }) => {
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(screens)/userInfo?userId=${item.id}`)}
        className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] flex-row items-center mb-3"
      >
        <View className="w-14 h-14 rounded-full bg-orange-600 items-center justify-center mr-4">
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              className="w-full h-full rounded-full"
            />
          ) : (
            <Text className="text-black text-2xl font-black">
              {item.username?.[0]?.toUpperCase() || "?"}
            </Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-white text-lg font-bold mb-1">
            {item.username || "Unknown User"}
          </Text>
          {(item.firstName || item.lastName) && (
            <Text className="text-white/50 text-sm font-semibold">
              {[item.firstName, item.lastName].filter(Boolean).join(" ")}
            </Text>
          )}
        </View>
        <View className="w-8 h-8 rounded-lg bg-white/[0.05] items-center justify-center">
          <Feather name="chevron-right" size={20} color="#999999" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderDiscoveryItem = ({ item }: { item: UserData }) => {
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(screens)/userInfo?userId=${item.id}`)}
        className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] flex-row items-center mb-3"
      >
        <View className="w-14 h-14 rounded-full bg-orange-600 items-center justify-center mr-4">
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              className="w-full h-full rounded-full"
            />
          ) : (
            <Text className="text-black text-2xl font-black">
              {item.username?.[0]?.toUpperCase() || "?"}
            </Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-white text-lg font-bold mb-1">
            {item.username || "Unknown User"}
          </Text>
          {(item.firstName || item.lastName) && (
            <Text className="text-white/50 text-sm font-semibold">
              {[item.firstName, item.lastName].filter(Boolean).join(" ")}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => {
            addFriend(item.clerkId);
          }}
          className="w-10 h-10 rounded-xl bg-orange-600/20 items-center justify-center border border-orange-600/50"
        >
          <Ionicons name="person-add" size={20} color="#ff8c00" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyFriendComponent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <ActivityIndicator size="large" color="#ff8c00" />
          <Text className="text-white/50 mt-4 text-sm font-semibold">
            Loading buddies...
          </Text>
        </View>
      );
    }

    if (searchQueryFriend.trim()) {
      return (
        <View className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center">
          <View className="w-20 h-20 rounded-2xl bg-orange-600/20 items-center justify-center mb-4">
            <FontAwesome6 name="sad-tear" size={40} color="#ff8c00" />
          </View>
          <Text className="text-white text-xl font-black mb-2">
            No Results Found
          </Text>
          <Text className="text-white/50 text-sm text-center font-semibold">
            No buddies found matching "{searchQueryFriend}"
          </Text>
        </View>
      );
    }

    if (friends.length === 0) {
      return (
        <View className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center">
          <View className="w-24 h-24 rounded-2xl bg-orange-600/20 items-center justify-center mb-4">
            <Ionicons name="people-outline" size={48} color="#ff8c00" />
          </View>
          <Text className="text-white text-xl font-black mb-2">
            No buddies Yet
          </Text>
          <Text className="text-white/50 text-sm text-center font-semibold px-4">
            Who&apos;s the one who can bring you back to drinking?
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderEmptyDiscoveryComponent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <ActivityIndicator size="large" color="#ff8c00" />
          <Text className="text-white/50 mt-4 text-sm font-semibold">
            Loading discovery...
          </Text>
        </View>
      );
    }

    if (discovery.length === 0) {
      return (
        <View className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center">
          <View className="w-24 h-24 rounded-2xl bg-orange-600/20 items-center justify-center mb-4">
            <Ionicons name="compass-outline" size={48} color="#ff8c00" />
          </View>
          <Text className="text-white text-xl font-black mb-2">
            No Suggestions
          </Text>
          <Text className="text-white/50 text-sm text-center font-semibold px-4">
            Seems there are no drinkers at the moment
          </Text>
        </View>
      );
    }

    return null;
  };

  const FriendsListHeaderComponent = useMemo(
    () => (
      <View>
        {/* Header Card */}
        {/* <View className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/[0.08]">
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-2">
                YOUR DRINKING
              </Text>
              <Text className="text-white text-[32px] font-black">Buddies</Text>
            </View>
            <View className="bg-orange-600/20 px-3.5 py-1.5 rounded-lg">
              <Text className="text-orange-600 text-[11px] font-black tracking-wider">
                {friends.length} TOTAL
              </Text>
            </View>
          </View>
        </View> */}

        {/* Search Bar */}
        <View className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/[0.08]">
          <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-3">
            SEARCH BUDDIES
          </Text>
          <View className="bg-white/[0.05] rounded-xl px-4 py-3 flex-row items-center border border-white/[0.08]">
            <Ionicons name="search" size={20} color="#ff8c00" />
            <TextInput
              value={searchQueryFriend}
              onChangeText={setSearchQueryFriend}
              placeholder="Type to search..."
              placeholderTextColor="#666666"
              className="flex-1 text-white text-base ml-3 font-semibold"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {(loading || searchQueryFriend.length > 0) && (
              <View className="ml-2">
                {loading ? (
                  <ActivityIndicator size="small" color="#ff8c00" />
                ) : (
                  <TouchableOpacity onPress={() => setSearchQueryFriend("")}>
                    <View className="w-6 h-6 rounded-full bg-white/[0.05] items-center justify-center">
                      <Text className="text-white/40 text-sm">✕</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Results Label */}
        {filteredFriends.length > 0 && (
          <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-3">
            {searchQueryFriend.trim()
              ? `RESULTS (${filteredFriends.length})`
              : `ALL BUDDIES (${filteredFriends.length})`}
          </Text>
        )}
      </View>
    ),
    [searchQueryFriend, loading, friends.length, filteredFriends.length]
  );

  const DiscoveryListHeaderComponent = useMemo(
    () => (
      <>
        <View>
          {/* Header Card */}
          {/* <View className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/[0.08]">
            <View className="flex-row justify-between items-center mb-2">
              <View>
                <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-2">
                  FIND BUDDIES
                </Text>
                <Text className="text-white text-[32px] font-black">
                  Discovery
                </Text>
              </View>
              <View className="bg-orange-600/20 px-3.5 py-1.5 rounded-lg">
                <Text className="text-orange-600 text-[11px] font-black tracking-wider">
                  {discovery.length} FOUND
                </Text>
              </View>
            </View>
          </View> */}

          {/* Results Label */}
        </View>
        <View className="mb-6 ">
          <TouchableOpacity
            className="bg-orange-600 rounded-2xl p-5 flex-row items-center justify-center"
            onPress={() => router.push(`/(screens)/searchDrinkers`)}
          >
            <Ionicons name="search" size={22} color="black" />
            <Text className="text-black text-base font-black uppercase tracking-wider ml-3">
              Search Drinkers
            </Text>
          </TouchableOpacity>
        </View>
        {discovery.length > 0 && (
          <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-1">
            SUGGESTED DRINKERS ({discovery.length})
          </Text>
        )}
      </>
    ),
    [discovery.length]
  );

  const handleFriendsRefresh = async () => {
    if (userData?.id) {
      refreshFriends();
    }
  };

  const handleDiscoveryRefresh = async () => {
    if (userData?.id) {
      refreshDiscovery();
    }
  };

  return (
    <View
      className="flex-1 bg-black"
      style={{ paddingBottom: insets.bottom + 40 }}
    >
      <NestedScreenHeader heading="Buddies" secondaryHeading="ALCOHOLIC" />

      <TabSelection />

      {activeTab === "friends" && (
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) =>
            item.id || item.username || Math.random().toString()
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 0,
            paddingBottom: 48,
          }}
          ListHeaderComponent={FriendsListHeaderComponent}
          renderItem={renderFriendItem}
          ListEmptyComponent={renderEmptyFriendComponent}
          refreshing={isLoading}
          onRefresh={handleFriendsRefresh}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleFriendsRefresh}
              tintColor="#ff8c00"
              colors={["#ff8c00"]}
              progressBackgroundColor="black"
            />
          }
        />
      )}

      {activeTab === "discovery" && (
        <FlatList
          data={discovery}
          keyExtractor={(item) =>
            item.id || item.username || Math.random().toString()
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 0,
            paddingBottom: 48,
          }}
          ListHeaderComponent={DiscoveryListHeaderComponent}
          renderItem={renderDiscoveryItem}
          ListEmptyComponent={renderEmptyDiscoveryComponent}
          refreshing={isLoading}
          onRefresh={handleDiscoveryRefresh}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleDiscoveryRefresh}
              tintColor="#ff8c00"
              colors={["#ff8c00"]}
              progressBackgroundColor="black"
            />
          }
        />
      )}
    </View>
  );
};

export default BuddiesDiscoverScreen;
