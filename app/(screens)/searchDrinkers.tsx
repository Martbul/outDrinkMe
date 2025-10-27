import { useApp } from "@/providers/AppProvider";
import { useEffect, useState, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  FlatList,
  StatusBar,
  TextInput,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { AntDesign, FontAwesome5, Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { UserCard } from "@/components/userCard";
import { UserData } from "@/types/api.types";
import { onBackPress } from "@/utils/navigation";

export default function AddByUsername() {
  const [searchQuery, setSearchQuery] = useState("");
  const { searchUsers, addFriend } = useApp();
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingFriendId, setAddingFriendId] = useState<string | null>(null);
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const trimmedQuery = searchQuery.trim();

      if (trimmedQuery.length >= 2 && trimmedQuery !== lastSearchedQuery) {
        setLoading(true);
        try {
          const users = await searchUsers(trimmedQuery);
          setSearchResults(users);
          setLastSearchedQuery(trimmedQuery);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setLoading(false);
        }
      } else if (trimmedQuery.length < 2) {
        setSearchResults([]);
        setLastSearchedQuery("");
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers, lastSearchedQuery]);

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

  const ListHeaderComponent = useMemo(
    () => (
      <View className="mt-10 mb-4">
        <View className="flex-row justify-between">
          <TouchableOpacity onPress={onBackPress} className="flex">
            <AntDesign name="arrow-left" size={28} color="#f54900" />
          </TouchableOpacity>
          <View className="flex">
            <Text className="text-white text-2xl font-black mb-1">
              Search Drinkers
            </Text>
            <Text className="text-gray-500 text-sm mb-4">by username</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="bg-white/[0.03] rounded-2xl px-4 py-2 flex-row items-center border border-gray-800">
          <Ionicons name="search" size={24} color="#6B7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Type to search..."
            placeholderTextColor="#6B7280"
            className="flex-1 text-white text-base ml-2"
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
    ),
    [searchQuery, loading]
  );

  const ListEmptyComponent = useMemo(() => {
    if (searchQuery.length >= 2 && !loading && searchResults.length === 0) {
      return (
        <View className="items-center py-16">
          <FontAwesome6 name="sad-tear" size={64} color="#9CA3AF" />
          <Text className="text-white text-xl font-bold mb-2 mt-4">
            No results
          </Text>
          <Text className="text-gray-500 text-center px-8">
            No users found matching "{searchQuery}"
          </Text>
        </View>
      );
    }

    if (searchQuery.length < 2) {
      return (
        <View className="items-center py-16">
          <View className="w-32 h-32 rounded-full bg-white/[0.03] border-2 border-gray-800 items-center justify-center mb-6">
            <FontAwesome5 name="search" size={56} color="#f54900" />
          </View>
          <Text className="text-white text-xl font-bold mb-2">
            Search for friends
          </Text>
          <Text className="text-gray-500 text-center px-8">
            Enter at least 2 characters to find and add friends to your drinking
            squad!
          </Text>
        </View>
      );
    }

    return null;
  }, [searchQuery, loading, searchResults.length]);

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <FlatList
        data={searchResults}
        keyExtractor={(item) =>
          item.id || item.username || Math.random().toString()
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 24,
        }}
        ListHeaderComponent={ListHeaderComponent}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            onPress={() => router.push(`/(screens)/userInfo?userId=${item.id}`)}
            rightAction={{
              loading: addingFriendId === item.id,
              onAction: () => handleAddFriend(item.id),
              icon: "add",
            }}
          />
        )}
        ListEmptyComponent={ListEmptyComponent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}
