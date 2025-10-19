import { useApp } from "@/providers/AppProvider";
import { UserData } from "@/types/api.types";
import { AntDesign, Ionicons } from "@expo/vector-icons";
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
  const { userData, friends, refreshFriends, isLoading, error } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const renderFriendItem = ({ item }: { item: UserData }) => {
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(screens)/userInfo?userId=${item.id}`)}
        className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex-row items-center mb-3"
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

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <Text className="text-gray-500 text-base">Loading friends...</Text>
        </View>
      );
    }

    if (searchQuery.trim()) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <Text className="text-6xl mb-4">😕</Text>
          <Text className="text-white text-xl font-bold mb-2">No results</Text>
          <Text className="text-gray-500 text-center px-8">
            No friends found matching "{searchQuery}"
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

  const ListHeaderComponent = () => (
    <>
      <View className="bg-gray-900 rounded-2xl px-4 py-4 mb-4 flex-row items-center border border-gray-800">
        <Ionicons name="search" size={24} color="#6B7280" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search Friends"
          placeholderTextColor="#6B7280"
          className="flex-1 text-white text-base"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")} className="ml-2">
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
        onPress={() => router.push(`/(screens)/addFriendByUsername`)}
      >
        <FontAwesome5
          name="user-plus"
          size={22}
          color="black"
          className="mr-3"
        />
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

    if (!searchQuery.trim()) {
      return friends;
    }

    return friends.filter((item) =>
      (item.username || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim())
    );
  }, [friends, searchQuery]);

  const handleRefresh = async () => {
    if (userData?.id) {
      await refreshFriends();
    }
  };

  return (
    <View className="flex-1 bg-black">
      <Header />
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) =>
          item.id || item.username || Math.random().toString()
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24 }}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        renderItem={renderFriendItem}
        ListEmptyComponent={renderEmptyComponent}
        refreshing={isLoading}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default FriendsScreen;
