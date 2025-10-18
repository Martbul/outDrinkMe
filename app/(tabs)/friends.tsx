import Header from "@/components/header";
import { useApp } from "@/providers/AppProvider";
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const FriendsScreen = () => {
  const { userData, friends, refreshFriends, isLoading, error } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFriends = useMemo(() => {
    if (!Array.isArray(friends)) {
      console.log("Friends is not an array:", friends);
      return [];
    }

    if (!searchQuery.trim()) {
      return friends;
    }

    return friends.filter((item) =>
      (item.userName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim())
    );
  }, [friends, searchQuery]);

  return (
    <View className="flex-1 bg-black">
      <Header />
      <ScrollView className="flex-1 px-4 pt-6">
        {/* Leaderboard Button */}
        <TouchableOpacity className="bg-orange-600 rounded-2xl p-5 mb-4 flex-row items-center justify-center">
          <Text className="text-4xl mr-3">
            <MaterialIcons name="leaderboard" size={24} color="black" />
          </Text>
          <Text className="text-black text-xl font-black uppercase tracking-wider">
            Leaderboards
          </Text>
        </TouchableOpacity>

        {/* Search Bar */}
        <View className="bg-gray-900 rounded-2xl px-4 py-1 mb-6 flex-row items-center border border-gray-800">
          <Text className="text-gray-600 text-2xl mr-3">
            <Ionicons name="search" size={24} color="#6B7280" />
          </Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search Friends"
            placeholderTextColor="#6B7280"
            className="flex-1 text-white text-base"
          />
        </View>

        {/* Empty State */}
        {friends.length === 0 && (
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
            <Text className="text-gray-600 text-center text-base px-8 mb-8">
              Who's the one who can bring you{"\n"}back to drinking?
            </Text>

            {/* Action Buttons */}
            <View className="w-full gap-3 px-4">
              <TouchableOpacity className="bg-orange-600 rounded-2xl p-5 flex-row items-center justify-center">
                <Text className="text-3xl mr-3">
                  <FontAwesome5 name="user-plus" size={22} color="black" />
                </Text>
                <Text className="text-black text-lg font-black uppercase tracking-wider">
                  Search Drinkers
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Friends List (when not empty) */}
        {friends.length > 0 && (
          <View className="gap-3 mb-6">
            {friends.map((friend, index) => (
              <View
                key={index}
                className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex-row items-center"
              >
                <View className="w-12 h-12 rounded-full bg-orange-600 items-center justify-center mr-4">
                  <Text className="text-black text-xl font-black">
                    {friend.name[0]}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold mb-1">
                    {friend.name}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {friend.daysThisWeek}/7 days • Rank #{friend.rank}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-orange-500 text-2xl font-black">
                    {friend.daysThisWeek}
                  </Text>
                  <Text className="text-gray-600 text-xs">days</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default FriendsScreen;
