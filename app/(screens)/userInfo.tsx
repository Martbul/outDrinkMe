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
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import {
  Entypo,
  Feather,
  FontAwesome5,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";

import { useApp } from "@/providers/AppProvider";
import { getCoefInfo, getLevelInfo } from "@/utils/levels";
import { onBackPress } from "@/utils/navigation";
import { apiService } from "@/api";
import type { CalendarResponse, StorySegment, DailyDrinkingPostResponse } from "@/types/api.types";

import MixPostModal from "@/components/mixPostModal";
import LogoutButton from "@/components/logoutButton";
import { FriendButton } from "@/components/friendButton";
import Feedback from "./feedback";
import { DeleteModal } from "@/components/delete_modal";
import { NestedScreenHeader } from "@/components/nestedScreenHeader";
import { SwipeableSheet } from "@/components/swipeable_sheet";

const PRIMARY_ORANGE = "#EA580C";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAP = 12;
const SCREEN_PADDING = 16;
const COLUMN_WIDTH = (SCREEN_WIDTH - SCREEN_PADDING * 2 - GAP) / 2;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];


const CompactSegmentedControl = ({
  items,
  selected,
  onSelect,
}: {
  items: { key: string; label: string }[];
  selected: string;
  onSelect: (val: any) => void;
}) => {
  return (
    <View className="mx-8 mb-4 mt-2 h-10 bg-white/[0.03] rounded-full border border-white/[0.1] p-1 flex-row relative">
      {items.map((item) => (
        <TouchableOpacity
          key={item.key}
          onPress={() => onSelect(item.key)}
          className={`flex-1 items-center justify-center rounded-full flex-row ${
            selected === item.key ? "bg-orange-600" : "bg-transparent"
          }`}
        >
          <Text
            className={`text-[10px] font-black tracking-wide uppercase ${
              selected === item.key ? "text-black" : "text-white/40"
            }`}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// 2. Settings Option Row
const ModalOption = ({
  icon,
  label,
  subLabel,
  onPress,
  isDestructive = false,
}: {
  icon?: any;
  label: string;
  subLabel?: string;
  onPress: () => void;
  isDestructive?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className={`flex-row items-center p-4 mb-3 rounded-2xl border ${
      isDestructive ? "bg-red-500/10 border-red-500/20" : "bg-white/5 border-white/5"
    }`}
  >
    <View
      className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${
        isDestructive ? "bg-red-500/20" : "bg-white/5"
      }`}
    >
      {icon}
    </View>
    <View className="flex-1">
      <Text className={`text-base font-bold ${isDestructive ? "text-red-500" : "text-white"}`}>{label}</Text>
      {subLabel && <Text className="text-white/40 text-xs font-semibold mt-0.5">{subLabel}</Text>}
    </View>
    <MaterialIcons name="chevron-right" size={20} color={isDestructive ? "#ef4444" : "#666"} />
  </TouchableOpacity>
);

// 3. Gallery Item (Grid Image)
const GalleryItem = ({
  item,
  setExpandedId,
}: {
  item: DailyDrinkingPostResponse;
  setExpandedId: (id: string) => void;
}) => {
  const [height, setHeight] = useState(COLUMN_WIDTH * 1.3);

  useEffect(() => {
    if (item.image_url) {
      Image.getSize(
        item.image_url,
        (w, h) => {
          const ratio = Math.min(h / w, 1.5);
          setHeight(COLUMN_WIDTH * ratio);
        },
        () => {}
      );
    }
  }, [item.image_url]);

  return (
    <TouchableOpacity onPress={() => setExpandedId(item.id)} activeOpacity={0.8} className="mb-3">
      <View className="bg-white/0.03 rounded-2xl overflow-hidden border border-white/[0.08] p-1.5 shadow-sm">
        <View className="rounded-xl overflow-hidden relative">
          {item.image_url && (
            <Image source={{ uri: item.image_url }} style={{ width: "100%", height: height - 12 }} resizeMode="cover" />
          )}
          <View className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/[0.08]">
            <Text className="text-white text-[9px] font-bold uppercase">
              {new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const UserInfoScreen = () => {
  const insets = useSafeAreaInsets();
  const { userId: rawUserId } = useLocalSearchParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const {
    userData,
    friendDiscoveryProfile,
    getFriendDiscoveryDisplayProfile,
    addFriend,
    removeFriend,
    refreshUserStories,
    storeItems,
    userInventory: currentUserInventory,
    userStories,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"overview" | "stats" | "stories" | "inventory">("overview");
  const [refreshing, setRefreshing] = useState(false);

  // Stats Calendar
  const [statsMonth, setStatsMonth] = useState(new Date().getMonth() + 1);
  const [statsYear, setStatsYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState<CalendarResponse | null>(null);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);

  // Modals & Sheets
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<DailyDrinkingPostResponse | undefined>(undefined);
  const [currentAspectRatio, setCurrentAspectRatio] = useState(4 / 3);
  const [settingsSheetVisible, setSettingsSheetVisible] = useState(false); // Using SwipeableSheet now
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Video & Delete Logic
  const [playingStoryId, setPlayingStoryId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeletingStory, setIsDeletingStory] = useState(false);
  const [deletedStoryIds, setDeletedStoryIds] = useState<string[]>([]);

  // --- Logic ---
  const targetUserId = useMemo(() => {
    const paramId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
    return paramId || userData?.id;
  }, [rawUserId, userData?.id]);

  const isCurrentUser =
    userData?.clerkId === friendDiscoveryProfile?.user?.clerkId || userData?.id === friendDiscoveryProfile?.user?.id;

  const isDataStale = friendDiscoveryProfile?.user?.id !== targetUserId;

  // Fetch Data
  useEffect(() => {
    if (targetUserId && friendDiscoveryProfile?.user?.id !== targetUserId) {
      getFriendDiscoveryDisplayProfile(targetUserId);
    }
  }, [targetUserId, friendDiscoveryProfile?.user?.id]);

  // Fetch Calendar
  useEffect(() => {
    const fetchUserCalendar = async () => {
      if (!targetUserId) return;
      setIsCalendarLoading(true);
      try {
        const token = await getToken();
        if (token) {
          const data = await apiService.getCalendar(statsYear, statsMonth, token, targetUserId);
          setCalendarData(data);
        }
      } catch (error) {
        console.error("Failed to fetch user calendar:", error);
      } finally {
        setIsCalendarLoading(false);
      }
    };
    if (activeTab === "stats") fetchUserCalendar();
  }, [statsMonth, statsYear, targetUserId, activeTab]);

  // Expanded Item Logic
  useEffect(() => {
    if (expandedId && friendDiscoveryProfile?.mix_posts) {
      const item = friendDiscoveryProfile.mix_posts.find((post) => post.id === expandedId);
      setExpandedItem(item);
    } else {
      setExpandedItem(undefined);
    }
  }, [expandedId, friendDiscoveryProfile?.mix_posts]);

  useEffect(() => {
    if (expandedItem?.image_url) {
      Image.getSize(
        expandedItem.image_url,
        (width, height) => {
          if (width && height) setCurrentAspectRatio(width / height);
        },
        () => {}
      );
    } else {
      setCurrentAspectRatio(4 / 3);
    }
  }, [expandedItem]);

  const { leftColumn, rightColumn } = useMemo(() => {
    if (isDataStale) return { leftColumn: [], rightColumn: [] };
    const left: DailyDrinkingPostResponse[] = [];
    const right: DailyDrinkingPostResponse[] = [];
    (friendDiscoveryProfile?.mix_posts || []).forEach((item, index) => {
      index % 2 === 0 ? left.push(item) : right.push(item);
    });
    return { leftColumn: left, rightColumn: right };
  }, [friendDiscoveryProfile, isDataStale]);

  const levelInfo = getLevelInfo(friendDiscoveryProfile?.user?.xp || 0);

  const onRefresh = async () => {
    if (targetUserId) {
      setRefreshing(true);
      await getFriendDiscoveryDisplayProfile(targetUserId);
      if (activeTab === "stories") await refreshUserStories();
      if (activeTab === "stats") {
        const token = await getToken();
        if (token) {
          const data = await apiService.getCalendar(statsYear, statsMonth, token, targetUserId);
          setCalendarData(data);
        }
      }
      setRefreshing(false);
    }
  };

  const handleFriendToggle = async (newState: boolean) => {
    if (!friendDiscoveryProfile?.user) return;
    newState
      ? await addFriend(friendDiscoveryProfile.user.clerkId)
      : await removeFriend(friendDiscoveryProfile.user.clerkId);
  };

  const handlePressDeleteStory = (storyId: string) => {
    Vibration.vibrate(10);
    setItemToDelete(storyId);
    setShowDeleteModal(true);
  };

  const executeDeleteStory = async () => {
    if (!itemToDelete) return;
    const idToDelete = itemToDelete;
    setDeletedStoryIds((prev) => [...prev, idToDelete]);
    setShowDeleteModal(false);
    setIsDeletingStory(true);
    try {
      const token = await getToken();
      if (token) {
        await apiService.deleteStory(token, idToDelete);
        await onRefresh();
        await refreshUserStories();
      }
    } catch (error) {
      console.error(error);
      setDeletedStoryIds((prev) => prev.filter((id) => id !== idToDelete));
    } finally {
      setIsDeletingStory(false);
      setItemToDelete(null);
    }
  };

  const renderOverview = () => {
    if (leftColumn.length === 0 && rightColumn.length === 0) {
      return (
        <View className="items-center py-20 px-1 opacity-50">
          <View className="w-20 h-20 bg-white/[0.03] rounded-full items-center justify-center mb-4 border border-white/10">
            <MaterialCommunityIcons name="image-off-outline" size={32} color="white" />
          </View>
          <Text className="text-white text-lg font-black">No Mixes Found</Text>
          <Text className="text-white/60 text-center text-sm mt-2">
            {isCurrentUser
              ? "You haven't posted any drinking memories yet."
              : "This user has not posted any drinking memories yet."}
          </Text>
        </View>
      );
    }
    return (
      <View className="px-4 pb-20">
        <View className="flex-row w-full justify-between">
          <View style={{ width: COLUMN_WIDTH }}>
            {leftColumn.map((item) => (
              <GalleryItem key={item.id} item={item} setExpandedId={setExpandedId} />
            ))}
          </View>
          <View style={{ width: COLUMN_WIDTH }}>
            {rightColumn.map((item) => (
              <GalleryItem key={item.id} item={item} setExpandedId={setExpandedId} />
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderStories = () => {
    if (!isCurrentUser) return null;
    const stories = ((userStories || []) as StorySegment[]).filter((s) => !deletedStoryIds.includes(s.id));
    const ITEM_WIDTH = (SCREEN_WIDTH - 48) / 3; // 3 cols with gap
    const ITEM_HEIGHT = ITEM_WIDTH * 1.77;

    return (
      <View className="px-1 pb-20">
        <View className="flex-row flex-wrap justify-between">
          {stories.map((story) => {
            const isPlaying = playingStoryId === story.id;
            const thumbnailUrl = story.video_url?.replace(/\.(mp4|mov|avi|mkv)$/i, ".jpg");

            return (
              <TouchableOpacity
                key={story.id}
                activeOpacity={0.9}
                style={{
                  width: ITEM_WIDTH,
                  height: ITEM_HEIGHT,
                  marginBottom: 12,
                }}
                onPress={() => setPlayingStoryId(isPlaying ? null : story.id)}
              >
                <View
                  className={`w-full h-full rounded-2xl overflow-hidden border bg-zinc-900 relative ${
                    isPlaying ? "border-orange-500" : "border-white/10"
                  }`}
                >
                  <TouchableOpacity
                    onPress={() => handlePressDeleteStory(story.id)}
                    className="absolute top-2 left-2 bg-black/60 p-2 rounded-full z-30 border border-white/10"
                  >
                    <Feather name="trash-2" size={14} color="#ef4444" />
                  </TouchableOpacity>

                  {isPlaying ? (
                    <Video
                      source={{ uri: story.video_url }}
                      resizeMode={ResizeMode.COVER}
                      shouldPlay
                      isLooping
                      isMuted={false}
                      style={{ width: "100%", height: "100%" }}
                      useNativeControls={false}
                    />
                  ) : (
                    <>
                      {thumbnailUrl ? (
                        <Image
                          source={{ uri: thumbnailUrl }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <Feather name="video" size={24} color="white" />
                        </View>
                      )}
                      <View className="absolute inset-0 items-center justify-center bg-black/20">
                        <View className="bg-black/40 p-3 rounded-full backdrop-blur-sm">
                          <Feather name="play" size={24} color="white" />
                        </View>
                      </View>
                      <View className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
                      <View className="absolute bottom-3 left-3 flex-row items-center">
                        <MaterialCommunityIcons
                          name="heart"
                          size={14}
                          color={story.has_related ? PRIMARY_ORANGE : "white"}
                        />
                        <Text className="text-white text-xs font-bold ml-1">{story.relate_count || 0}</Text>
                      </View>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderInventory = () => {
    const rawInventory = isCurrentUser ? currentUserInventory : friendDiscoveryProfile?.inventory;
    const inventory = rawInventory || { flag: [], smoking: [], energy: [] };

    const renderSection = (title: string, items: any[], storeCategory: any[]) => {
      const validItems = items?.filter((i) => i.quantity > 0) || [];
      return (
        <View className="bg-white/[0.03] rounded-3xl p-5 border border-white/[0.08] mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-orange-600 text-[10px] font-black tracking-widest uppercase">{title}</Text>
            <Text className="text-white/40 text-xs font-bold">
              {validItems.reduce((s, i) => s + i.quantity, 0)} ITEMS
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 10 }}>
            {validItems.length > 0 ? (
              validItems.map((item) => {
                const storeItem = storeCategory?.find((si) => si.id === item.item_id);
                return (
                  <View
                    key={item.id}
                    className={`bg-white/0.03 rounded-2xl p-4 mr-3 items-center border ${
                      item.is_equipped ? "border-orange-600" : "border-white/[0.08]"
                    }`}
                    style={{ width: 120 }}
                  >
                    {item.is_equipped && <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-600" />}
                    <Image
                      source={{ uri: storeItem?.image_url }}
                      style={{ width: 60, height: 60, marginBottom: 10 }}
                      resizeMode="contain"
                    />
                    <Text className="text-white text-xs font-bold text-center mb-1" numberOfLines={1}>
                      {storeItem?.name}
                    </Text>
                    <Text className="text-white/40 text-[10px] font-bold">x{item.quantity}</Text>
                  </View>
                );
              })
            ) : (
              <Text className="text-white/30 text-xs font-bold italic py-4">No items in this category.</Text>
            )}
          </ScrollView>
        </View>
      );
    };

    return (
      <View className="px-4 pb-20">
        {renderSection("Bottles", inventory.bottle, storeItems?.bottle || [])}
        {renderSection("Energy Drinks", inventory.energy, storeItems?.energy || [])}
        {renderSection("Specials", inventory.special, storeItems?.special || [])}
        {renderSection("Flags", inventory.flag, storeItems?.flag || [])}
        {renderSection("Smoking Kit", inventory.smoking, storeItems?.smoking || [])}
      </View>
    );
  };

  const renderStats = () => {
    if (!calendarData || !friendDiscoveryProfile?.stats)
      return (
        <View className="py-20">
          <ActivityIndicator color={PRIMARY_ORANGE} />
        </View>
      );
    return (
      <View className="px-4 pb-20">
        <View className="bg-white/[0.03] rounded-3xl p-6 border border-white/[0.08] mb-4">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-orange-600 text-[10px] font-black tracking-widest uppercase mb-1">Rank</Text>
              <Text className="text-white text-4xl font-black">#{friendDiscoveryProfile.stats.rank}</Text>
            </View>
            <View className="w-14 h-14 rounded-2xl bg-orange-600/10 items-center justify-center border border-orange-600/20">
              <MaterialCommunityIcons name="trophy-variant-outline" size={28} color={PRIMARY_ORANGE} />
            </View>
          </View>
          <View className="flex-row gap-4">
            <View className="flex-1 bg-white/0.03 p-4 rounded-xl border border-white/[0.08]">
              <Text className="text-white text-xl font-black">
                {friendDiscoveryProfile.stats.alcoholism_coefficient?.toFixed(2)}
              </Text>
              <Text className="text-white/40 text-[9px] font-bold mt-1">POINTS</Text>
            </View>
            <View className="flex-1 bg-white/0.03 p-4 rounded-xl border border-white/5">
              <Text className="text-white text-xl font-black">{friendDiscoveryProfile.stats.total_days_drank}</Text>
              <Text className="text-white/40 text-[9px] font-bold mt-1">DRUNK DAYS</Text>
            </View>
          </View>
        </View>

        <View className="bg-white/[0.03] rounded-3xl p-5 border border-white/[0.08]">
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity
              onPress={() => {
                setStatsMonth((m) => (m === 1 ? 12 : m - 1));
                if (statsMonth === 1) setStatsYear((y) => y - 1);
              }}
            >
              <Feather name="chevron-left" size={20} color="white" />
            </TouchableOpacity>
            <Text className="text-white font-black">
              {MONTH_NAMES[statsMonth - 1]} {statsYear}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setStatsMonth((m) => (m === 12 ? 1 : m + 1));
                if (statsMonth === 12) setStatsYear((y) => y + 1);
              }}
            >
              <Feather name="chevron-right" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap">
            {Array.from({
              length: new Date(statsYear, statsMonth, 0).getDate(),
            }).map((_, i) => {
              const day = i + 1;
              const dData = calendarData.days.find((d) => new Date(d.date).getDate() === day);
              return (
                <View key={day} style={{ width: "14.28%" }} className="aspect-square p-1 items-center justify-center">
                  <View
                    className={`w-full h-full rounded-md items-center justify-center ${
                      dData?.drank_today ? "bg-orange-600/30 border border-orange-600" : "bg-white/[0.03]"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${dData?.drank_today ? "text-orange-500" : "text-white/30"}`}
                    >
                      {day}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  if (!friendDiscoveryProfile)
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color={PRIMARY_ORANGE} />
      </View>
    );

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      <View style={{ paddingTop: insets.top }} className="bg-white/[0.03] z-10">
        <NestedScreenHeader
          title="Profile"
          eyebrow="USER"
          showBack
          onBack={onBackPress}
          rightAction={
            isCurrentUser ? (
              <TouchableOpacity
                onPress={() => {
                  Vibration.vibrate(10);
                  setSettingsSheetVisible(true);
                }}
                className="w-10 h-10 bg-white/[0.03] rounded-full items-center justify-center border border-white/[0.08]"
              >
                <Entypo name="dots-three-vertical" size={18} color="white" />
              </TouchableOpacity>
            ) : null
          }
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EA580C"
            colors={["#EA580C"]}
            progressBackgroundColor="#000000"
          />
        }
        contentContainerStyle={{ paddingTop: 10 }}
      >
        <View className="px-1 pb-4">
          <View className="bg-white/[0.03] rounded-3xl p-3 border border-white/[0.08]">
            <View className="flex-row min-h-[110px]">
              {/* --- LEFT COLUMN: Identity --- */}
              <View className="w-[30%] items-center justify-center border-r border-white/[0.05] pr-3 mr-3">
                {/* Image */}
                <View className="w-16 h-16 rounded-xl border border-orange-600/50 p-0.5 mb-2 shadow-sm shadow-orange-600/20">
                  <Image
                    source={{ uri: friendDiscoveryProfile.user.imageUrl }}
                    className="w-full h-full rounded-lg bg-zinc-800"
                    resizeMode="cover"
                  />
                </View>

                {/* Name & Username */}
                <Text
                  className="text-white text-sm font-black text-center leading-4 mb-0.5"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {friendDiscoveryProfile.user.firstName}
                </Text>
                <Text className="text-white/50 text-[10px] font-black uppercase text-center mb-1" numberOfLines={1}>
                  {friendDiscoveryProfile.user.lastName}
                </Text>
                <Text className="text-orange-600/80 text-[9px] font-bold tracking-tighter">
                  @{friendDiscoveryProfile.user.username}
                </Text>
              </View>

              {/* --- MIDDLE COLUMN: Friend Action (Centered) --- */}
              <View className="flex-1 justify-center pr-2">
                {!isCurrentUser && (
                  <FriendButton initialIsFriend={friendDiscoveryProfile.is_friend} onToggle={handleFriendToggle} />
                )}
              </View>

              {/* --- RIGHT COLUMN: Navigation --- */}
              <View className="w-[70px] flex-col justify-between gap-2">
                {/* Wall Of Shame */}
                <TouchableOpacity
                  onPress={() => router.push("/(screens)/wall_of_shame")}
                  className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl items-center justify-center active:bg-red-500/20 active:border-red-500/50 min-h-[50px]"
                >
                  <MaterialCommunityIcons
                    name="skull-outline"
                    size={20}
                    color={friendDiscoveryProfile.user.alcoholism_coefficient > 50 ? "#EF4444" : "#ffffff80"}
                  />
                  <Text className="text-[8px] text-white/50 text-center font-bold mt-1">WALL</Text>
                </TouchableOpacity>

                {/* Spots */}
                <TouchableOpacity
                  onPress={() => router.push("/(screens)/not_bars")}
                  className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl items-center justify-center active:bg-blue-500/20 active:border-blue-500/50 min-h-[50px]"
                >
                  <Ionicons name="map-outline" size={20} color="#3B82F6" />
                  <Text className="text-[8px] text-white/50 text-center font-bold mt-1">SPOTS</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <CompactSegmentedControl
          selected={activeTab}
          onSelect={setActiveTab}
          items={
            isCurrentUser
              ? [
                  { key: "overview", label: "Overview" },
                  { key: "stories", label: "Stories" },
                  { key: "inventory", label: "Items" },
                ]
              : [
                  { key: "overview", label: "Overview" },
                  { key: "stats", label: "Stats" },
                  { key: "inventory", label: "Items" },
                ]
          }
        />

        {activeTab === "overview" && renderOverview()}
        {activeTab === "inventory" && renderInventory()}
        {activeTab === "stories" && renderStories()}
        {activeTab === "stats" && renderStats()}
      </ScrollView>

      <MixPostModal
        expandedItem={expandedItem}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        currentAspectRatio={currentAspectRatio}
      />

      <SwipeableSheet visible={settingsSheetVisible} onClose={() => setSettingsSheetVisible(false)} fullScreen={false}>
        <View className="px-2 pb-8">
          <View className="items-center mb-6">
            <View className="w-12 h-1 bg-white/[0.03] rounded-full mb-4" />
            <Text className="text-white text-xl font-black tracking-tight">
              {isCurrentUser ? "Manage Profile" : "Actions"}
            </Text>
          </View>

          {isCurrentUser ? (
            <>
              <ModalOption
                label="Edit Profile"
                subLabel="Change your details"
                icon={<MaterialIcons name="mode-edit" size={20} color={PRIMARY_ORANGE} />}
                onPress={() => {
                  setSettingsSheetVisible(false);
                  router.push("/(screens)/editProfile");
                }}
              />
              {/* //!do to remove */}
              {/* <ModalOption
                label="Bar Mode"
                subLabel="Working at a bar"
                icon={<FontAwesome6 name="martini-glass-citrus" size={20} color={PRIMARY_ORANGE} />}
                onPress={() => {
                  setSettingsSheetVisible(false);
                  router.push("/(venue)/scan");
                }}
              /> */}
              <ModalOption
                label="Bug Report"
                subLabel="Help us improve"
                icon={<Ionicons name="bug-outline" size={20} color={PRIMARY_ORANGE} />}
                onPress={() => {
                  setSettingsSheetVisible(false);
                  setFeedbackModalVisible(true);
                }}
              />

              <View className="mt-4 pt-4 border-t border-white/10">
                <LogoutButton />
              </View>
            </>
          ) : (
            <>
              <ModalOption
                label="Report User"
                isDestructive
                icon={<FontAwesome5 name="flag" size={16} color="#ef4444" />}
                onPress={() => {
                  Vibration.vibrate(10);
                  setSettingsSheetVisible(false);
                }}
              />
              <ModalOption
                label="Block User"
                isDestructive
                icon={<Entypo name="block" size={18} color="#ef4444" />}
                onPress={() => {
                  Vibration.vibrate(10);
                  setSettingsSheetVisible(false);
                }}
              />
            </>
          )}
        </View>
      </SwipeableSheet>

      <DeleteModal
        visible={showDeleteModal}
        onClose={() => !isDeletingStory && setShowDeleteModal(false)}
        onConfirm={executeDeleteStory}
        title="Delete Story?"
        message="This action cannot be undone."
        isDeleting={isDeletingStory}
      />

      <Feedback feedbackModalVisible={feedbackModalVisible} setFeedbackModalVisible={setFeedbackModalVisible} />
    </View>
  );
};

export default UserInfoScreen;
