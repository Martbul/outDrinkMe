import { useApp } from "@/providers/AppProvider";
import { UserData, YourMixPostData } from "@/types/api.types";
import { FontAwesome6, Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "@/components/header";
import { RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FriendsScreen = () => {
  const {
    userData,
    friends,
    yourMixData,
    discovery,
    isLoading,
    error,
    refreshYourMixData,
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
      <View className="px-4 pt-6 pb-4">
        <View className="bg-white/[0.03] rounded-2xl p-1.5 flex-row border border-white/[0.08]">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl items-center ${
              activeTab === "yourmix" ? "bg-orange-600" : ""
            }`}
            onPress={() => setActiveTab("yourmix")}
          >
            <Text
              className={`text-sm font-black tracking-wider ${
                activeTab === "yourmix" ? "text-white" : "text-white/30"
              }`}
            >
              YOUR MIX
            </Text>
          </TouchableOpacity>
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
              FRIENDS
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

  const YourMixCard = ({ item }: { item: YourMixPostData }) => {
    const [flipState, setFlipState] = useState(0); // 0: image, 1: map, 2: buddies
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const [isAnimating, setIsAnimating] = useState(false);
    const [rotationCount, setRotationCount] = useState(0);

    const hasLocation = !!item.locationText;
    const hasBuddies =
      item.mentionedBuddies && item.mentionedBuddies.length > 0;
    const handlePress = () => {
      if (isAnimating) return;

      setIsAnimating(true);

      const calculateNextState = (current: number) => {
        if (current === 0) {
          return hasLocation ? 1 : hasBuddies ? 2 : 0;
        } else if (current === 1) {
          return hasBuddies ? 2 : 0;
        } else {
          return 0;
        }
      };

      const newState = calculateNextState(flipState);
      const nextRotation = rotationCount + 1;

      // First half: rotate to edge (fast start, ease out)
      Animated.timing(rotateAnim, {
        toValue: nextRotation + 0.5,
        duration: 250,
        easing: Easing.out(Easing.quad), // Fast start, ease out
        useNativeDriver: true,
      }).start(() => {
        setFlipState(newState);

        // Second half: complete the flip (fast start, ease out)
        Animated.timing(rotateAnim, {
          toValue: nextRotation + 1,
          duration: 250,
          easing: Easing.out(Easing.quad), // Fast start, ease out
          useNativeDriver: true,
        }).start(() => {
          setRotationCount(nextRotation + 1);
          setIsAnimating(false);
        });
      });
    };

    const rotateInterpolate = rotateAnim.interpolate({
      inputRange: [0, 1, 2, 3, 4],
      outputRange: ["0deg", "180deg", "360deg", "540deg", "720deg"],
    });

    const animatedStyle = {
      transform: [{ rotateY: rotateInterpolate }],
    };

    const renderContent = () => {
      if (flipState === 0) {
        // State 0: Image with overlay text
        return (
          <>
            <Image
              source={{ uri: item.imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            <View className="absolute bottom-0 right-0 px-2 py-1">
              <Text className="text-[#ff8c00] text-md font-semibold text-right">
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>

            <TouchableOpacity
              className="absolute top-3 left-3"
              onPress={() =>
                router.push(`/(screens)/userInfo?userId=${item.userId}`)
              }
            >
              {item.userImageUrl && (
                <View className="w-14 h-14 rounded-full bg-black/40 p-0.5">
                  <Image
                    source={{ uri: item.userImageUrl }}
                    className="w-full h-full rounded-full"
                  />
                </View>
              )}
            </TouchableOpacity>
          </>
        );
      } else if (flipState === 1) {
        // State 1: Map with location
        return (
          <View className="w-full h-full bg-gray-900 items-center justify-center">
            <View className="bg-black/70 rounded-2xl p-6 m-6">
              <Text className="text-white text-xl font-bold mb-4 text-center">
                📍 Location
              </Text>
              <Text className="text-white/90 text-base font-semibold text-center mb-4">
                {item.locationText}
              </Text>
              <View className="bg-gray-800 rounded-xl p-8 items-center justify-center">
                <Text className="text-6xl mb-2">📍</Text>
                <Text className="text-white/60 text-sm text-center">
                  Map integration coming soon
                </Text>
              </View>
              <Text className="text-white/50 text-sm text-center mt-4">
                {new Date(item.loggedAt).toLocaleString()}
              </Text>
            </View>
          </View>
        );
      } else {
        // State 2: Mentioned buddies
        return (
          <View className="w-full bg-white/[0.03] p-4">
            <View className="flex-row flex-wrap gap-3">
              {item.mentionedBuddies.map((buddy, index) => (
                <View
                  key={buddy.id || index}
                  className="items-center"
                  style={{ width: 70 }}
                >
                  <View className="w-14 h-14 rounded-full bg-orange-600 items-center justify-center mb-1.5 overflow-hidden">
                    {buddy.imageUrl ? (
                      <Image
                        source={{ uri: buddy.imageUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Text className="text-white text-xl font-bold">
                        {buddy.firstName?.charAt(0).toUpperCase() ||
                          buddy.username?.charAt(0).toUpperCase() ||
                          "?"}
                      </Text>
                    )}
                  </View>
                  <Text
                    className="text-white text-xs text-center font-medium"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {buddy.firstName && buddy.lastName
                      ? `${buddy.firstName} ${buddy.lastName}`
                      : buddy.username || "Unknown"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );
      }
    };

    return (
      <TouchableOpacity
        onPress={handlePress}
        className="bg-white/[0.03] rounded-2xl overflow-hidden border border-white/[0.08] mb-3"
        activeOpacity={0.7}
        disabled={isAnimating}
      >
        <Animated.View
          style={animatedStyle}
          className="relative w-full aspect-[4/3]"
        >
          {renderContent()}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderYourMixItem = ({ item }: { item: YourMixPostData }) => {
    return <YourMixCard item={item} />;
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

  const renderEmptyYourMixComponent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <ActivityIndicator size="large" color="#ff8c00" />
          <Text className="text-white/50 mt-4 text-sm font-semibold">
            Loading ...
          </Text>
        </View>
      );
    }

    if (yourMixData.length === 0) {
      return (
        <View className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center">
          <View className="w-24 h-24 rounded-2xl bg-orange-600/20 items-center justify-center mb-4">
            <Ionicons name="people-outline" size={48} color="#ff8c00" />
          </View>
          <Text className="text-white text-xl font-black mb-2">
            No Mixes Ready Yet
          </Text>
          <Text className="text-white/50 text-sm text-center font-semibold px-4">
            Who's the one who can bring you back to drinking?
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderEmptyFriendComponent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <ActivityIndicator size="large" color="#ff8c00" />
          <Text className="text-white/50 mt-4 text-sm font-semibold">
            Loading friends...
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
            No friends found matching "{searchQueryFriend}"
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
            No Friends Yet
          </Text>
          <Text className="text-white/50 text-sm text-center font-semibold px-4">
            Who's the one who can bring you back to drinking?
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
        <View className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/[0.08]">
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-2">
                YOUR SQUAD
              </Text>
              <Text className="text-white text-[32px] font-black">Friends</Text>
            </View>
            <View className="bg-orange-600/20 px-3.5 py-1.5 rounded-lg">
              <Text className="text-orange-600 text-[11px] font-black tracking-wider">
                {friends.length} TOTAL
              </Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/[0.08]">
          <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-3">
            SEARCH FRIENDS
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
              : `ALL FRIENDS (${filteredFriends.length})`}
          </Text>
        )}
      </View>
    ),
    [searchQueryFriend, loading, friends.length, filteredFriends.length]
  );

  const DiscoveryListHeaderComponent = useMemo(
    () => (
      <View>
        {/* Header Card */}
        <View className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/[0.08]">
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-2">
                FIND FRIENDS
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
        </View>

        {/* Results Label */}
        {discovery.length > 0 && (
          <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-3">
            SUGGESTED DRINKERS ({discovery.length})
          </Text>
        )}
      </View>
    ),
    [discovery.length]
  );

  const ListFooterComponent = () => (
    <View className="mb-24 mt-4">
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
  );

  const handleYourMixRefresh = async () => {
    if (userData?.id) {
      refreshYourMixData();
    }
  };

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
      <Header />
      <TabSelection />

      {activeTab === "yourmix" && (
        <FlatList
          data={yourMixData}
          keyExtractor={(item) => item.id || Math.random().toString()}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 0,
            paddingBottom: 48,
          }}
          renderItem={renderYourMixItem}
          ListEmptyComponent={renderEmptyYourMixComponent}
          refreshing={isLoading}
          onRefresh={handleYourMixRefresh}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleYourMixRefresh}
              tintColor="#ff8c00"
              colors={["#ff8c00"]}
              progressBackgroundColor="black"
            />
          }
        />
      )}

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
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 0 }}
          ListHeaderComponent={DiscoveryListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
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

export default FriendsScreen;
