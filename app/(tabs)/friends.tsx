import { useApp } from "@/providers/AppProvider";
import { UserData } from "@/types/api.types";
import { AntDesign, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Header from "@/components/header";

const FriendsScreen = () => {
  const {
    userData,
    friends,
    refreshFriends,
    discovery,
    refreshDiscovery,
    isLoading,
    error,
  } = useApp();
  const [searchQueryFriend, setSearchQueryFriend] = useState("");
  const [searchQueryDiscovery, setSearchQueryDiscovery] = useState("");
  const [activeTab, setActiveTab] = useState("friends");

  const renderFriendItem = ({ item }: { item: UserData }) => {
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(screens)/userInfo?userId=${item.id}`)}
        className="bg-white/[0.03] rounded-2xl p-4 border border-gray-800 flex-row items-center mb-3"
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
            <Text className="text-gray-500 text-sm">
              {[item.firstName, item.lastName].filter(Boolean).join(" ")}
            </Text>
          )}
        </View>
        <AntDesign name="right" size={20} color="#6B7280" />
      </TouchableOpacity>
    );
  };

  const renderDiscoveryItem = ({ item }: { item: UserData }) => {
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(screens)/userInfo?userId=${item.id}`)}
        className="bg-white/[0.03] rounded-2xl p-4 border border-gray-800 flex-row items-center mb-3"
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
            <Text className="text-gray-500 text-sm">
              {[item.firstName, item.lastName].filter(Boolean).join(" ")}
            </Text>
          )}
        </View>
        <AntDesign name="right" size={20} color="#6B7280" />
      </TouchableOpacity>
    );
  };

  const renderEmptyFriendComponent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <Text className="text-gray-500 text-base">Loading friends...</Text>
        </View>
      );
    }

    if (searchQueryFriend.trim()) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <FontAwesome6 name="sad-tear" size={24} color="#9CA3AF" />
          <Text className="text-white text-xl font-bold mb-2 mt-4">
            No results
          </Text>
          <Text className="text-gray-500 text-center px-8">
            No friends found matching "{searchQueryFriend}"
          </Text>
        </View>
      );
    }

    if (friends.length === 0) {
      return (
        <View className="items-center justify-center py-16">
          {/* Empty Frame Illustration */}
          <View className="items-center mb-8">
            <View className="w-48 h-32 border-4 border-gray-800 rounded-2xl items-center justify-center relative">
              {/* Hanging String */}
              <View className="absolute -top-8 w-0.5 h-8 bg-gray-700" />
              <View className="absolute -top-10 w-3 h-3 rounded-full bg-gray-700" />

              {/* Empty Message */}
              <Text className="text-gray-700 text-lg font-bold">
                There's no one
              </Text>
              <Text className="text-gray-700 text-lg font-bold">here...</Text>
            </View>
          </View>

          {/* Motivational Text */}
          <Text className="text-gray-600 text-center text-base px-8 mb-0">
            Who's the one who can bring you{"\n"}back to drinking?
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
          <Text className="text-gray-500 text-base">Loading ...</Text>
        </View>
      );
    }

    if (searchQueryDiscovery.trim()) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <FontAwesome6 name="sad-tear" size={24} color="#9CA3AF" />
          <Text className="text-white text-xl font-bold mb-2 mt-4">
            No results
          </Text>
          <Text className="text-gray-500 text-center px-8">
            No users found matching "{searchQueryDiscovery}"
          </Text>
        </View>
      );
    }

    if (discovery.length === 0) {
      return (
        <View className="items-center justify-center py-16">
          {/* Empty Frame Illustration */}
          <View className="items-center mb-8">
            <View className="w-48 h-32 border-4 border-gray-800 rounded-2xl items-center justify-center relative">
              {/* Hanging String */}
              <View className="absolute -top-8 w-0.5 h-8 bg-gray-700" />
              <View className="absolute -top-10 w-3 h-3 rounded-full bg-gray-700" />

              {/* Empty Message */}
              <Text className="text-gray-700 text-lg font-bold">
                There's no one
              </Text>
              <Text className="text-gray-700 text-lg font-bold">here...</Text>
            </View>
          </View>

          {/* Motivational Text */}
          <Text className="text-gray-600 text-center text-base px-8 mb-0">
            Who's the one who can bring you{"\n"}back to drinking?
          </Text>
        </View>
      );
    }

    return null;
  };
  const TabSelection = () => {
    return (
      <View className="flex-row px-4 border-b-[1.5px] border-gray-700">
        <TouchableOpacity
          className="flex-1 py-3.5 items-center relative"
          onPress={() => setActiveTab("friends")}
        >
          <Text
            className={`text-[15px] font-semibold ${
              activeTab === "friends" ? "text-[#ff8c00]" : "text-gray-700"
            }`}
          >
            Friends
          </Text>
          {activeTab === "friends" && (
            <View className="absolute -bottom-[1.5px] left-0 right-0 h-[3px] bg-[#ff8c00]" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 py-3.5 items-center relative"
          onPress={() => setActiveTab("discovery")}
        >
          <Text
            className={`text-[15px] font-semibold ${
              activeTab === "discovery" ? "text-[#ff8c00]" : "text-gray-700"
            }`}
          >
            Discovery
          </Text>
          {activeTab === "discovery" && (
            <View className="absolute -bottom-[1.5px] left-0 right-0 h-[3px] bg-[#ff8c00]" />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const FriendsListHeaderComponent = () => (
    <>
      <View className="bg-white/[0.03] rounded-2xl px-4 py-2 mb-4 flex-row items-center border border-gray-800">
        <Ionicons name="search" size={24} color="#6B7280" />
        <TextInput
          value={searchQueryFriend}
          onChangeText={setSearchQueryFriend}
          placeholder="Search Friends"
          placeholderTextColor="#6B7280"
          className="flex-1 text-white text-base ml-2"
        />
        {searchQueryFriend.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQueryFriend("")}
            className="ml-2 justify-center items-center"
          >
            <Text className="text-gray-600 text-xl">✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  const DiscoveryListHeaderComponent = () => (
    <>
      <View className="bg-white/[0.03] rounded-2xl px-4 py-2 mb-4 flex-row items-center border border-gray-800">
        <Ionicons name="search" size={24} color="#6B7280" />
        <TextInput
          value={searchQueryDiscovery}
          onChangeText={setSearchQueryDiscovery}
          placeholder="Search Users"
          placeholderTextColor="#6B7280"
          className="flex-1 text-white text-base ml-2"
        />
        {searchQueryDiscovery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQueryDiscovery("")}
            className="ml-2 justify-center items-center"
          >
            <Text className="text-gray-600 text-xl">✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  const ListFooterComponent = () => (
    <>
      <TouchableOpacity
        className="bg-orange-600 rounded-2xl p-5 flex-row items-center justify-center mb-24 mt-4"
        onPress={() => router.push(`/(screens)/searchDrinkers`)}
      >
        <FontAwesome5 name="user-plus" size={22} color="black" />
        <Text className="text-black text-lg font-black uppercase tracking-wider ml-3">
          Search Drinkers
        </Text>
      </TouchableOpacity>
    </>
  );

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

  const filteredDiscovery = useMemo(() => {
    if (!Array.isArray(discovery)) {
      return [];
    }

    if (!searchQueryDiscovery.trim()) {
      return discovery;
    }

    return discovery.filter((item) =>
      (item.username || "")
        .toLowerCase()
        .includes(searchQueryDiscovery.toLowerCase().trim())
    );
  }, [discovery, searchQueryDiscovery]);

  const handleFriendsRefresh = async () => {
    if (userData?.id) {
      await refreshFriends();
    }
  };

  const handleDiscoveryRefresh = async () => {
    if (userData?.id) {
      await refreshDiscovery();
    }
  };

  return (
    <View className="flex-1 bg-black">
      <Header />
      <TabSelection />

      {activeTab === "friends" && (
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) =>
            item.id || item.username || Math.random().toString()
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24 }}
          ListHeaderComponent={FriendsListHeaderComponent}
          // ListFooterComponent={ListFooterComponent}
          renderItem={renderFriendItem}
          ListEmptyComponent={renderEmptyFriendComponent}
          refreshing={isLoading}
          onRefresh={handleFriendsRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === "discovery" && (
        <FlatList
          data={filteredDiscovery}
          keyExtractor={(item) =>
            item.id || item.username || Math.random().toString()
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24 }}
          // ListHeaderComponent={DiscoveryListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          renderItem={renderDiscoveryItem}
          ListEmptyComponent={renderEmptyDiscoveryComponent}
          refreshing={isLoading}
          onRefresh={handleDiscoveryRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default FriendsScreen;
