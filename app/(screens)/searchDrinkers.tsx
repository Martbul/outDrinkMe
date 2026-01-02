import { useApp } from "@/providers/AppProvider";
import { useEffect, useState, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  TextInput,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { UserCard } from "@/components/userCard";
import { UserData } from "@/types/api.types";
import { onBackPress } from "@/utils/navigation";
import Header from "@/components/header";
import {NestedScreenHeader} from "@/components/nestedScreenHeader";

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

  const renderEmptyState = () => {
    if (searchQuery.length >= 2 && !loading && searchResults.length === 0) {
      return (
        <View className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center">
          <View className="w-20 h-20 rounded-2xl bg-orange-600/20 items-center justify-center mb-4">
            <FontAwesome6 name="sad-tear" size={40} color="#ff8c00" />
          </View>
          <Text className="text-white text-xl font-black mb-2">
            No Results Found
          </Text>
          <Text className="text-white/50 text-sm text-center font-semibold">
            No users found matching "{searchQuery}". Try a different search
            term.
          </Text>
        </View>
      );
    }

    if (searchQuery.length < 2) {
      return (
        <View className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center">
          <View className="w-24 h-24 rounded-2xl bg-orange-600/20 items-center justify-center mb-4">
            <Ionicons name="search" size={48} color="#ff8c00" />
          </View>
          <Text className="text-white text-xl font-black mb-2">
            Start Searching
          </Text>
          <Text className="text-white/50 text-sm text-center font-semibold px-4">
            Enter at least 2 characters to find and add friends to your drinking
            squad!
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View
      className="flex-1 bg-black"
      style={{ paddingBottom: insets.bottom + 40 }}
    >
      <NestedScreenHeader title="Drinkers" eyebrow="SEARCH" />
      <ScrollView className="flex-1 px-4 pt-6">
        <View className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/[0.08]">
          <View className="bg-white/[0.05] rounded-xl px-4 py-3 flex-row items-center border border-white/[0.08]">
            <Ionicons name="search" size={20} color="#ff8c00" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Type to search..."
              placeholderTextColor="#666666"
              className="flex-1 text-white text-base ml-3 font-semibold"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {(loading || searchQuery.length > 0) && (
              <View className="ml-2">
                {loading ? (
                  <ActivityIndicator size="small" color="#ff8c00" />
                ) : (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <View className="w-6 h-6 rounded-full bg-white/[0.05] items-center justify-center">
                      <Text className="text-white/40 text-sm">✕</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Results Section */}
        {searchResults.length > 0 && (
          <View className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/[0.08]">
            <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-4">
              SEARCH RESULTS ({searchResults.length})
            </Text>
            {searchResults.map((user, index) => (
              <View key={user.id || index}>
                <UserCard
                  user={user}
                  onPress={() =>
                    router.push(`/(screens)/userInfo?userId=${user.id}`)
                  }
                  rightAction={{
                    loading: addingFriendId === user.id,
                    onAction: () => handleAddFriend(user.id),
                    icon: "arrow",
                  }}
                />
                {index < searchResults.length - 1 && (
                  <View className="h-px bg-white/[0.05] my-3" />
                )}
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {renderEmptyState()}

        {/* Bottom Spacing */}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
