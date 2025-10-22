import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "@/providers/AppProvider";
import { UserData } from "@/types/api.types";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";

export default function AddByUsername() {
  const [searchQuery, setSearchQuery] = useState("");
  const { searchUsers, addFriend } = useApp();
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingFriendId, setAddingFriendId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const users = await searchUsers(searchQuery);
      setSearchResults(users);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    setAddingFriendId(friendId);
    try {
      await addFriend(friendId);
      setSearchResults((prev) => prev.filter((user) => user.id !== friendId));
    } catch (error) {
      console.error("Failed to add friend:", error);
    } finally {
      setAddingFriendId(null);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View
        className="px-4 py-4 border-b border-gray-900"
        style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
      >
        <Text className="text-white text-2xl font-black mb-1">Add Friends</Text>
        <Text className="text-gray-500 text-sm mb-4">Search by username</Text>

        {/* Search Bar */}
        <View className="bg-white/[0.03]  rounded-2xl px-4 py-4 flex-row items-center border border-gray-800">
          <Ionicons name="search" size={24} color="#6B7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Type to search..."
            placeholderTextColor="#6B7280"
            className="flex-1 text-white text-base"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {(loading || searchQuery.length > 0) && (
            <View className="ml-2">
              {loading ? (
                <ActivityIndicator size="small" color="#f97316" />
              ) : (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Text className="text-gray-600 text-xl">✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Search Results */}
        {searchResults.length > 0 && (
          <View className="gap-3 mb-6">
            {searchResults.map((user) => (
              <View
                key={user.id}
                className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex-row items-center"
              >
                <View className="w-14 h-14 rounded-full bg-orange-600 items-center justify-center mr-4">
                  <Text className="text-black text-2xl font-black">
                    {user.username?.[0]?.toUpperCase() || "?"}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text className="text-white text-lg font-bold">
                    {user.username}
                  </Text>
                  {(user.firstName || user.lastName) && (
                    <Text className="text-gray-500 text-sm">
                      {[user.firstName, user.lastName]
                        .filter(Boolean)
                        .join(" ")}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => handleAddFriend(user.id)}
                  disabled={addingFriendId === user.id}
                  className="bg-orange-600 px-6 py-3 rounded-xl"
                >
                  {addingFriendId === user.id ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text className="text-black font-bold uppercase text-xs">
                      Add
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* No Results */}
        {searchQuery.length >= 2 && !loading && searchResults.length === 0 && (
          <View className="items-center py-16">
            <Entypo name="emoji-sad" size={64} color="#ff8c00" />
            <Text className="text-white text-xl font-bold mb-2">
              No results
            </Text>
            <Text className="text-gray-500 text-center px-8">
              No users found matching "{searchQuery}"
            </Text>
          </View>
        )}

        {/* Empty State */}
        {searchQuery.length < 2 && (
          <View className="items-center py-16">
            <Text className="text-white text-xl font-bold mb-2">
              Start typing to search
            </Text>
            <Text className="text-gray-500 text-center px-8">
              Enter at least 2 characters to find friends
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
