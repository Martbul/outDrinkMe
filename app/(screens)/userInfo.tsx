import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Vibration,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import { getLevelInfo } from "@/utils/levels";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { YourMixPostData } from "@/types/api.types";
import NestedScreenHeader from "@/components/nestedScreenHeader";
import MixPostModal from "@/components/mixPostModal";

// --- CONSTANTS ---
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAP = 12;
const SCREEN_PADDING = 16;
const COLUMN_WIDTH = (SCREEN_WIDTH - SCREEN_PADDING * 2 - GAP) / 2;

// --- HELPER COMPONENTS ---

const ActionButton = ({
  initialIsFriend,
  onToggle,
  isCurrentUser,
}: {
  initialIsFriend: boolean;
  onToggle: (state: boolean) => void;
  isCurrentUser: boolean;
}) => {
  if (isCurrentUser) return null;

  const [isFriend, setIsFriend] = useState(initialIsFriend);
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    Vibration.vibrate(10);
    setLoading(true);
    const newState = !isFriend;
    setIsFriend(newState);
    await onToggle(newState);
    setLoading(false);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.8}
      className={`py-3 rounded-xl items-center justify-center mt-6 border ${
        isFriend
          ? "bg-white/[0.03] border-white/[0.08]"
          : "bg-orange-600 border-orange-600"
      }`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isFriend ? "white" : "black"} />
      ) : (
        <Text
          className={`text-sm font-black tracking-widest ${
            isFriend ? "text-white" : "text-black"
          }`}
        >
          {isFriend ? "REMOVE FRIEND" : "ADD FRIEND"}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const GalleryItem = ({
  item,
  setExpandedId,
}: {
  item: YourMixPostData;
  setExpandedId: (id: string) => void;
}) => {
  const [height, setHeight] = useState(COLUMN_WIDTH * 1.3);

  useEffect(() => {
    if (item.imageUrl) {
      Image.getSize(
        item.imageUrl,
        (w, h) => {
          const ratio = Math.min(h / w, 1.5);
          setHeight(COLUMN_WIDTH * ratio);
        },
        () => {}
      );
    }
  }, [item.imageUrl]);

  const getOptimizedImageUrl = (url: string | undefined) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", "/upload/f_auto,q_auto,w_500/");
  };

  return (
    <TouchableOpacity
      onPress={() => setExpandedId(item.id)}
      activeOpacity={0.8}
      className="mb-4"
    >
      <View className="bg-white/[0.03] rounded-2xl overflow-hidden border border-white/[0.08] p-2">
        <View className="rounded-xl overflow-hidden relative">
          <Image
            source={{ uri: getOptimizedImageUrl(item.imageUrl) }}
            style={{ width: "100%", height: height - 16 }}
            resizeMode="cover"
          />
          <View className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded border border-white/10">
            <Text className="text-orange-500 text-[9px] font-bold">
              {new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
          {item.locationText && (
            <View className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
              <Text
                className="text-white text-[11px] font-bold"
                numberOfLines={1}
              >
                {item.locationText}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// --- MAIN COMPONENT ---
const UserInfoScreen = () => {
  const insets = useSafeAreaInsets();
  const { userId: rawUserId } = useLocalSearchParams();
  const {
    userData,
    friendDiscoveryProfile,
    getFriendDiscoveryDisplayProfile,
    addFriend,
    removeFriend,
    storeItems,
    isLoading,
  } = useApp();

  // --- STATE ---
  const [activeTab, setActiveTab] = useState<"overview" | "inventory">(
    "overview"
  );
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<YourMixPostData | undefined>(
    undefined
  );
  const [currentAspectRatio, setCurrentAspectRatio] = useState(4 / 3);

  // 1. DETERMINE TARGET ID
  // If rawUserId is present, use it. Otherwise, default to the logged-in user's ID.
  const targetUserId = useMemo(() => {
    const paramId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
    return paramId || userData?.id;
  }, [rawUserId, userData?.id]);

  // 2. FETCH DATA ON MOUNT OR ID CHANGE
  useEffect(() => {
    if (targetUserId) {
      getFriendDiscoveryDisplayProfile(targetUserId);
    }
  }, [targetUserId]);

  // 3. CHECK IF DATA IS STALE
  // If the loaded profile ID doesn't match the target ID, we are looking at stale data.
  const isDataStale = friendDiscoveryProfile?.user?.id !== targetUserId;

  // --- OTHER EFFECTS ---
  useEffect(() => {
    if (expandedId && friendDiscoveryProfile?.mix_posts) {
      const item = friendDiscoveryProfile.mix_posts.find(
        (post) => post.id === expandedId
      );
      setExpandedItem(item);
    } else {
      setExpandedItem(undefined);
    }
  }, [expandedId, friendDiscoveryProfile?.mix_posts]);

  useEffect(() => {
    if (expandedItem?.imageUrl) {
      Image.getSize(
        expandedItem.imageUrl,
        (width, height) => {
          if (width && height) setCurrentAspectRatio(width / height);
        },
        (error) => console.log("Failed to get size for modal image", error)
      );
    } else {
      setCurrentAspectRatio(4 / 3);
    }
  }, [expandedItem]);

  // --- LOGIC ---
  const isCurrentUser =
    userData?.clerkId === friendDiscoveryProfile?.user?.clerkId ||
    userData?.id === friendDiscoveryProfile?.user?.id;

  const { leftColumn, rightColumn } = useMemo(() => {
    // If data is stale, return empty columns to avoid flash
    if (isDataStale) return { leftColumn: [], rightColumn: [] };

    const left: YourMixPostData[] = [];
    const right: YourMixPostData[] = [];
    const userPosts = friendDiscoveryProfile?.mix_posts || [];
    userPosts.forEach((item, index) => {
      index % 2 === 0 ? left.push(item) : right.push(item);
    });
    return { leftColumn: left, rightColumn: right };
  }, [friendDiscoveryProfile, isDataStale]);

  const levelInfo = getLevelInfo(friendDiscoveryProfile?.user?.xp || 0);

  const onRefresh = async () => {
    if (targetUserId) {
      setRefreshing(true);
      await getFriendDiscoveryDisplayProfile(targetUserId);
      setRefreshing(false);
    }
  };

  const handleFriendToggle = async (newState: boolean) => {
    if (!friendDiscoveryProfile?.user) return;
    newState
      ? await addFriend(friendDiscoveryProfile.user.clerkId)
      : await removeFriend(friendDiscoveryProfile.user.clerkId);
  };

  // --- RENDER HELPERS ---

  const renderOverview = () => {
    if (leftColumn.length === 0 && rightColumn.length === 0) {
      return (
        <View className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center mt-2 mx-4">
          <View className="w-20 h-20 rounded-2xl bg-orange-600/20 items-center justify-center mb-4">
            <MaterialCommunityIcons
              name="image-off-outline"
              size={32}
              color="#EA580C"
            />
          </View>
          <Text className="text-white text-lg font-black mb-2">
            No Mixes Found
          </Text>
          <Text className="text-white/50 text-xs text-center font-semibold">
            {isCurrentUser
              ? "You haven't posted any drinking memories yet."
              : "This user has not posted any drinking memories yet."}
          </Text>
        </View>
      );
    }

    return (
      <View className="px-4">
        <View className="flex-row w-full justify-between">
          <View style={{ width: COLUMN_WIDTH }}>
            {leftColumn.map((item) => (
              <GalleryItem
                key={item.id}
                item={item}
                setExpandedId={setExpandedId}
              />
            ))}
          </View>
          <View style={{ width: COLUMN_WIDTH }}>
            {rightColumn.map((item) => (
              <GalleryItem
                key={item.id}
                item={item}
                setExpandedId={setExpandedId}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderInventory = () => {
    const inventory = friendDiscoveryProfile?.inventory || {
      flag: [],
      smoking: [],
    };

    const renderSection = (
      title: string,
      items: any[],
      storeCategory: any[],
      icon: any
    ) => {
      const total = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

      return (
        <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-orange-600 text-[10px] font-bold tracking-widest mb-1 uppercase">
                {title}
              </Text>
              <Text className="text-white text-xl font-black">Collection</Text>
            </View>
            <View className="bg-orange-600 rounded-lg px-3 py-1.5 items-center">
              <Text className="text-black text-xs font-black">
                {total} ITEMS
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 10 }}
          >
            {items && items.length > 0 ? (
              items.map((item) => {
                const storeItem = storeCategory?.find(
                  (si) => si.id === item.item_id
                );
                return (
                  <View
                    key={item.id}
                    className={`bg-black/40 rounded-xl p-3 mr-3 items-center border ${
                      item.is_equipped ? "border-orange-600" : "border-white/10"
                    }`}
                    style={{ width: 140, height: 180 }}
                  >
                    {item.is_equipped && (
                      <View className="absolute top-2 right-2 bg-orange-600 px-1.5 py-0.5 rounded">
                        <Text className="text-[8px] font-bold text-white">
                          EQUIPPED
                        </Text>
                      </View>
                    )}

                    <View className="flex-1 items-center justify-center">
                      {storeItem?.image_url ? (
                        <Image
                          source={{ uri: storeItem.image_url }}
                          style={{ width: 80, height: 80 }}
                          resizeMode="contain"
                        />
                      ) : (
                        <View className="w-16 h-16 bg-white/5 rounded-full items-center justify-center">
                          <MaterialCommunityIcons
                            name={icon}
                            size={30}
                            color="#666"
                          />
                        </View>
                      )}
                    </View>
                    <Text
                      className="text-white text-sm font-bold text-center mb-1"
                      numberOfLines={1}
                    >
                      {storeItem?.name || "Unknown Item"}
                    </Text>
                    <Text className="text-white/40 text-xs font-bold">
                      x{item.quantity}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View className="w-full items-center py-6">
                <Text className="text-white/30 text-xs font-bold italic">
                  No items in this collection.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      );
    };

    return (
      <View className="px-4">
        {renderSection("Sexuality", inventory.flag, storeItems?.flag, "flag")}
        {renderSection(
          "Smoking",
          inventory.smoking,
          storeItems?.smoking,
          "smoking"
        )}
      </View>
    );
  };

  // --- LOADING / STALE CHECK ---
  // If we are loading OR the data currently in state belongs to someone else, show loader
  if ((isLoading || isDataStale) && !refreshing) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#EA580C" size="large" />
      </View>
    );
  }

  // Ensure friendDiscoveryProfile exists before rendering
  if (!friendDiscoveryProfile) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#EA580C" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="light-content" />
      <NestedScreenHeader heading="Profile" secondaryHeading="USER" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EA580C"
            colors={["#EA580C"]}
          />
        }
      >
        {/* --- IDENTITY CARD --- */}
        <View className="px-4 pb-6">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <View className="flex-row justify-between items-start mb-2">
              <View>
                <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
                  IDENTITY
                </Text>
                <Text className="text-white text-[28px] font-black leading-8">
                  {friendDiscoveryProfile?.user?.firstName}
                </Text>
                <Text className="text-white/50 text-xl font-black uppercase">
                  {friendDiscoveryProfile?.user?.lastName}
                </Text>
              </View>
              <View className="w-20 h-20 rounded-2xl border-2 border-orange-600 p-0.5">
                <Image
                  source={{ uri: friendDiscoveryProfile?.user?.imageUrl }}
                  className="w-full h-full rounded-xl bg-zinc-800"
                />
              </View>
            </View>

            {/* Level Bar */}
            <View className="flex-row items-center gap-3 mt-4 mb-6">
              <View className="bg-orange-600/20 px-3 py-1.5 rounded-lg">
                <Text className="text-orange-600 text-[10px] font-black tracking-widest">
                  LEVEL {levelInfo.level}
                </Text>
              </View>
              <Text className="text-white/50 text-xs font-bold tracking-widest">
                @{friendDiscoveryProfile?.user?.username?.toUpperCase()}
              </Text>
            </View>

            {/* Stats Row */}
            <View className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.08] flex-row justify-between">
              <View className="items-center flex-1 border-r border-white/[0.08]">
                <Text className="text-white text-xl font-black">
                  {friendDiscoveryProfile?.stats?.current_streak || 0}
                </Text>
                <Text className="text-white/40 text-[9px] font-bold mt-1 tracking-wider">
                  STREAK
                </Text>
              </View>
              <View className="items-center flex-1 border-r border-white/[0.08]">
                <Text className="text-orange-600 text-xl font-black">
                  {friendDiscoveryProfile?.stats?.total_weeks_won || 0}
                </Text>
                <Text className="text-white/40 text-[9px] font-bold mt-1 tracking-wider">
                  WINS
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-white text-xl font-black">
                  {friendDiscoveryProfile?.stats?.friends_count || 0}
                </Text>
                <Text className="text-white/40 text-[9px] font-bold mt-1 tracking-wider">
                  BUDDIES
                </Text>
              </View>
            </View>

            <ActionButton
              initialIsFriend={friendDiscoveryProfile?.is_friend ? true : false}
              onToggle={handleFriendToggle}
              isCurrentUser={!!isCurrentUser}
            />
          </View>
        </View>

        <View className="px-4 mb-4">
          <View className="bg-white/[0.03] rounded-xl p-1.5 border border-white/[0.08] flex-row">
            {(["overview", "inventory"] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-lg items-center ${
                  activeTab === tab ? "bg-orange-600" : ""
                }`}
              >
                <Text
                  className={`text-[10px] font-black tracking-wider uppercase ${
                    activeTab === tab ? "text-black" : "text-white/40"
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {activeTab === "overview" && renderOverview()}
        {activeTab === "inventory" && renderInventory()}
      </ScrollView>

      <MixPostModal
        expandedItem={expandedItem}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        currentAspectRatio={currentAspectRatio}
      />
    </View>
  );
};

export default UserInfoScreen;
