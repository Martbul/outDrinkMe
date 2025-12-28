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
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import { getCoefInfo, getLevelInfo } from "@/utils/levels";
import { useAuth } from "@clerk/clerk-expo";
import {
  Entypo,
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import type {
  YourMixPostData,
  CalendarResponse,
  StorySegment,
} from "@/types/api.types";
import MixPostModal from "@/components/mixPostModal";
import { onBackPress } from "@/utils/navigation";
import LogoutButton from "@/components/logoutButton";
import { FriendButton } from "@/components/friendButton";
import { apiService } from "@/api";
import Feedback from "./feedback";
import { ResizeMode, Video } from "expo-av";
import { DeleteModal } from "@/components/delete_modal";

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

const ModalOption = ({
  icon,
  label,
  subLabel,
  onPress,
  isDestructive = false,
  component,
}: {
  icon?: any;
  label?: string;
  subLabel?: string;
  onPress?: () => void;
  isDestructive?: boolean;
  component?: React.ReactNode;
}) => {
  if (component) {
    return <View className="mb-3">{component}</View>;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center p-4 mb-3 rounded-2xl border ${
        isDestructive
          ? "bg-red-500/10 border-red-500/20"
          : "bg-white/5 border-white/5"
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
        <Text
          className={`text-base font-bold ${
            isDestructive ? "text-red-500" : "text-white"
          }`}
        >
          {label}
        </Text>
        {subLabel && (
          <Text className="text-white/40 text-xs font-semibold mt-0.5">
            {subLabel}
          </Text>
        )}
      </View>
      <MaterialIcons
        name="chevron-right"
        size={20}
        color={isDestructive ? "#ef4444" : "#666"}
      />
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
    return url;
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

  const [activeTab, setActiveTab] = useState<
    "overview" | "stats" | "stories" | "inventory"
  >("overview");
  const [refreshing, setRefreshing] = useState(false);

  const [statsMonth, setStatsMonth] = useState(new Date().getMonth() + 1);
  const [statsYear, setStatsYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState<CalendarResponse | null>(
    null
  );
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<YourMixPostData | undefined>(
    undefined
  );
  const [currentAspectRatio, setCurrentAspectRatio] = useState(4 / 3);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  // Video State
  const [playingStoryId, setPlayingStoryId] = useState<string | null>(null);

  // --- NEW: Delete Modal States ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeletingStory, setIsDeletingStory] = useState(false);
  
  // --- ADDED: Local state to hide deleted stories instantly ---
  const [deletedStoryIds, setDeletedStoryIds] = useState<string[]>([]);

  const targetUserId = useMemo(() => {
    const paramId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
    return paramId || userData?.id;
  }, [rawUserId, userData?.id]);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);

  useEffect(() => {
    if (targetUserId && friendDiscoveryProfile?.user?.id !== targetUserId) {
      getFriendDiscoveryDisplayProfile(targetUserId);
    }
  }, [
    targetUserId,
    friendDiscoveryProfile?.user?.id,
    getFriendDiscoveryDisplayProfile,
  ]);

  useEffect(() => {
    const fetchUserCalendar = async () => {
      if (!targetUserId) return;

      setIsCalendarLoading(true);
      try {
        const token = await getToken();
        if (token) {
          const data = await apiService.getCalendar(
            statsYear,
            statsMonth,
            token,
            targetUserId
          );
          setCalendarData(data);
        }
      } catch (error) {
        console.error("Failed to fetch user calendar:", error);
      } finally {
        setIsCalendarLoading(false);
      }
    };

    if (activeTab === "stats") {
      fetchUserCalendar();
    }
  }, [statsMonth, statsYear, targetUserId, activeTab, getToken]);

  const isDataStale = friendDiscoveryProfile?.user?.id !== targetUserId;

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

  const isCurrentUser =
    userData?.clerkId === friendDiscoveryProfile?.user?.clerkId ||
    userData?.id === friendDiscoveryProfile?.user?.id;

  const { leftColumn, rightColumn } = useMemo(() => {
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
      if (activeTab === "stories") {
        await refreshUserStories(); // Ensure stories are refreshed on pull-to-refresh
      }
      if (activeTab === "stats") {
        const token = await getToken();
        if (token) {
          const data = await apiService.getCalendar(
            statsYear,
            statsMonth,
            token,
            targetUserId
          );
          setCalendarData(data);
        }
      }
      setRefreshing(false);
    }
  };

  const openDotsModal = () => {
    Vibration.vibrate(10);
    setSettingsModalVisible(true);
  };

  const handleFriendToggle = async (newState: boolean) => {
    if (!friendDiscoveryProfile?.user) return;

    if (newState) {
      await addFriend(friendDiscoveryProfile.user.clerkId);
    } else {
      await removeFriend(friendDiscoveryProfile.user.clerkId);
    }
  };

  // --- DELETE STORY LOGIC ---
  const handlePressDeleteStory = (storyId: string) => {
    Vibration.vibrate(10);
    setItemToDelete(storyId);
    setShowDeleteModal(true);
  };

  const executeDeleteStory = async () => {
    if (!itemToDelete) return;

    // 1. Optimistic Update: Hide it immediately from UI
    const idToDelete = itemToDelete;
    setDeletedStoryIds((prev) => [...prev, idToDelete]);
    setShowDeleteModal(false); // Close modal immediately
    setIsDeletingStory(true);

    try {
      const token = await getToken();
      if (token) {
        await apiService.deleteStory(token, idToDelete);
        
        // 2. Fetch new data in the background
        await onRefresh(); 
        await refreshUserStories();
      }
    } catch (error) {
      console.error("Failed to delete story:", error);
      // Revert optimistic update if failed (optional, but good practice)
      setDeletedStoryIds((prev) => prev.filter((id) => id !== idToDelete));
      // You could add an alert here
    } finally {
      setIsDeletingStory(false);
      setItemToDelete(null);
    }
  };

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

  const closeSettingsModal = () => {
    setSettingsModalVisible(false);
  };

  const renderStories = () => {
    if (!isCurrentUser) return null;

    // --- Filter out deleted stories using local state ---
    const stories = ((userStories || []) as StorySegment[]).filter(
      (story) => !deletedStoryIds.includes(story.id)
    );

    // --- GRID WIDTH CALCULATION ---
    const ITEM_WIDTH = (SCREEN_WIDTH - 84) / 2;
    const ITEM_HEIGHT = ITEM_WIDTH * 1.77; // 16:9 Aspect Ratio

    const getTimeAgo = (dateString: string) => {
      const now = new Date();
      const created = new Date(dateString);
      const diffInHours =
        (now.getTime() - created.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return `${Math.max(0, Math.floor(diffInHours * 60))}m`;
      }
      if (diffInHours >= 24) {
        return `${Math.floor(diffInHours / 24)}d`;
      }
      return `${Math.floor(diffInHours)}h`;
    };

    const getThumbnailUrl = (url: string) => {
      if (!url) return null;
      if (url.includes("cloudinary.com")) {
        return url.replace(/\.(mp4|mov|avi|mkv)$/i, ".jpg");
      }
      return null;
    };

    return (
      <View className="px-4 mb-4">
        <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
          {/* Header Section */}
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-white text-xl font-black">
                Your Stories
              </Text>
            </View>
            <View className="bg-white/10 rounded-lg px-3 py-1.5 items-center border border-white/5">
              <Text className="text-orange-500 text-xs font-black">
                {stories.length} TOTAL
              </Text>
            </View>
          </View>

          {/* Grid Container */}
          <View className="flex-row flex-wrap" style={{ gap: GAP }}>
            {stories.map((story) => {
              const isPlaying = playingStoryId === story.id;
              const thumbnailUrl = getThumbnailUrl(story.video_url);

              return (
                <TouchableOpacity
                  key={story.id}
                  activeOpacity={0.9}
                  style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT }}
                  onPress={() => {
                    setPlayingStoryId(isPlaying ? null : story.id);
                  }}
                >
                  <View
                    className={`w-full h-full rounded-xl overflow-hidden border relative bg-zinc-900 ${
                      isPlaying
                        ? "border-orange-500"
                        : !story.is_seen
                        ? "border-orange-600/50"
                        : "border-white/10"
                    }`}
                  >
                    {/* DELETE BUTTON - MODIFIED to use new Handler */}
                    <TouchableOpacity
                      onPress={() => handlePressDeleteStory(story.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      className="absolute top-2 left-2 bg-black/60 p-1.5 rounded-full z-30 border border-white/10"
                    >
                      <Feather name="trash-2" size={12} color="#ef4444" />
                    </TouchableOpacity>

                    {/* Media Content */}
                    {isPlaying ? (
                      <Video
                        source={{ uri: story.video_url }}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={true}
                        isLooping={true}
                        isMuted={false}
                        style={{ width: "100%", height: "100%" }}
                        useNativeControls={false}
                      />
                    ) : thumbnailUrl ? (
                      <Image
                        source={{ uri: thumbnailUrl }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center bg-white/[0.05]">
                        <MaterialCommunityIcons
                          name="play-circle-outline"
                          size={40}
                          color="rgba(255,255,255,0.3)"
                        />
                      </View>
                    )}

                    {/* Play Icon Overlay */}
                    {!isPlaying && (
                      <View className="absolute inset-0 items-center justify-center bg-black/20 z-10 pointer-events-none">
                        <View className="bg-black/40 p-2 rounded-full backdrop-blur-sm">
                          <Feather name="play" size={20} color="white" />
                        </View>
                      </View>
                    )}

                    {/* Gradient Overlay */}
                    {!isPlaying && (
                      <View className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
                    )}

                    {/* Time Badge */}
                    <View className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded backdrop-blur-sm border border-white/5 z-20">
                      <Text className="text-white/80 text-[9px] font-bold">
                        {getTimeAgo(story.created_at)}
                      </Text>
                    </View>

                    {/* Relates Count */}
                    <View className="absolute bottom-3 left-3 flex-row items-center z-20">
                      <MaterialCommunityIcons
                        name={story.has_related ? "heart" : "heart-outline"}
                        size={14}
                        color={story.has_related ? "#EA580C" : "white"}
                      />
                      <Text className="text-white/90 text-[10px] font-bold ml-1.5 shadow-black">
                        {story.relate_count || 0}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderInventory = () => {
    const rawInventory = isCurrentUser
      ? currentUserInventory
      : friendDiscoveryProfile?.inventory;

    const inventory = rawInventory || {
      flag: [],
      smoking: [],
      energy: [],
    };

    const renderSection = (
      title: string,
      items: any[],
      storeCategory: any[],
      icon: any
    ) => {
      const validItems = items?.filter((item) => item.quantity > 0) || [];
      const total =
        validItems.reduce((sum, item) => sum + item.quantity, 0) || 0;

      return (
        <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-orange-600 text-[10px] font-bold tracking-widest mb-1 uppercase">
                {title}
              </Text>
              {title === "Smoking" && (
                <Text className="text-white text-xl font-black">Kit</Text>
              )}
              {title === "Energy" && (
                <Text className="text-white text-xl font-black">Cans</Text>
              )}
              {title === "Sexuality" && (
                <Text className="text-white text-xl font-black">Flags</Text>
              )}
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
            {/* 3. Render valid items */}
            {validItems.length > 0 ? (
              validItems.map((item) => {
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
                  No items
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      );
    };

    return (
      <View className="px-4">
        {renderSection(
          "Smoking",
          inventory.smoking,
          storeItems?.smoking || [],
          "smoking"
        )}
        {renderSection(
          "Energy",
          inventory.energy,
          storeItems?.energy || [],
          "energy"
        )}
        {renderSection(
          "Sexuality",
          inventory.flag,
          storeItems?.flag || [],
          "flag"
        )}
      </View>
    );
  };

  const renderCalendar = () => {
    const getDaysInMonth = (month: number, year: number) =>
      new Date(year, month, 0).getDate();

    const getFirstDayOfMonth = (month: number, year: number) => {
      const day = new Date(year, month - 1, 1).getDay();
      return day === 0 ? 6 : day - 1;
    };

    const navigateMonth = (direction: "prev" | "next") => {
      if (direction === "next") {
        if (statsMonth === 12) {
          setStatsMonth(1);
          setStatsYear(statsYear + 1);
        } else {
          setStatsMonth(statsMonth + 1);
        }
      } else {
        if (statsMonth === 1) {
          setStatsMonth(12);
          setStatsYear(statsYear - 1);
        } else {
          setStatsMonth(statsMonth - 1);
        }
      }
    };

    const getDayData = (day: number) => {
      if (!calendarData?.days) return null;
      return (
        calendarData.days.find((d) => {
          const dayDate = new Date(d.date).getDate();
          return dayDate === day;
        }) || null
      );
    };

    const daysInMonth = getDaysInMonth(statsMonth, statsYear);
    const firstDay = getFirstDayOfMonth(statsMonth, statsYear);
    const days = [];

    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View
          key={`empty-${i}`}
          style={{ width: "14.28%" }}
          className="aspect-square p-[2px]"
        />
      );
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = getDayData(day);
      const isLogged = dayData?.drank_today || false;
      const isToday = dayData?.is_today || false;

      days.push(
        <View
          key={day}
          style={{ width: "14.28%" }}
          className="aspect-square p-[2px]"
        >
          <View
            className={`
            flex-1 items-center justify-center rounded-lg border
            ${
              isToday && isLogged
                ? "bg-orange-600/30 border-orange-600"
                : isToday
                ? "bg-white/[0.12] border-orange-600"
                : isLogged
                ? "bg-orange-600/30 border-orange-600/50"
                : "bg-white/[0.03] border-white/[0.08]"
            }
          `}
          >
            <Text
              className={`text-xs font-bold ${
                isToday
                  ? "text-white"
                  : isLogged
                  ? "text-orange-500"
                  : "text-white/30"
              }`}
            >
              {day}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity
            onPress={() => navigateMonth("prev")}
            className="w-10 h-10 rounded-lg bg-white/[0.05] items-center justify-center border border-white/[0.08]"
          >
            <Feather name="arrow-left" size={20} color="#999" />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-white text-lg font-black">
              {MONTH_NAMES[statsMonth - 1]}
            </Text>
            <Text className="text-white/50 text-xs font-semibold">
              {statsYear}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigateMonth("next")}
            className="w-10 h-10 rounded-lg bg-white/[0.05] items-center justify-center border border-white/[0.08]"
          >
            <Feather name="arrow-right" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap mb-2">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
            <View
              key={i}
              style={{ width: "14.28%" }}
              className="items-center justify-center pb-2"
            >
              <Text className="text-white/30 font-bold text-[10px] uppercase">
                {day}
              </Text>
            </View>
          ))}
        </View>

        {isCalendarLoading ? (
          <View className="items-center justify-center py-8">
            <ActivityIndicator size="small" color="#EA580C" />
          </View>
        ) : (
          <View className="flex-row flex-wrap">{days}</View>
        )}

        <View className="mt-4 pt-4 border-t border-white/5 flex-row items-center justify-center gap-4">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded bg-orange-600/30 border border-orange-600/50 mr-2" />
            <Text className="text-white/50 text-[10px] font-bold uppercase">
              Logged
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded bg-white/[0.12] border border-orange-600 mr-2" />
            <Text className="text-white/50 text-[10px] font-bold uppercase">
              Today
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderStats = () => {
    const stats = friendDiscoveryProfile?.stats;

    if (!stats) {
      return (
        <View className="px-4">
          <View className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center">
            <Text className="text-white/50 text-xs font-bold">
              No stats available for this user.
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View className="px-4 pb-6">
        <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-4">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-orange-600 text-[10px] font-bold tracking-widest mb-1">
                GLOBAL RANKING
              </Text>
              <Text className="text-white text-[32px] font-black">
                #{stats.rank}
              </Text>
            </View>
            <View className="w-12 h-12 rounded-full bg-orange-600/20 items-center justify-center">
              <MaterialCommunityIcons name="trophy" size={24} color="#EA580C" />
            </View>
          </View>

          <View className="h-[1px] bg-white/[0.08] mb-6" />

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-xl font-black">
                {stats.alcoholism_coefficient?.toFixed(2) || "0.00"}
              </Text>
              <Text className="text-white/40 text-[10px] font-bold tracking-wider mt-1">
                POINTS
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-white text-xl font-black">
                {stats.total_days_drank}
              </Text>
              <Text className="text-white/40 text-[10px] font-bold tracking-wider mt-1">
                TOTAL DRUNK DAYS
              </Text>
            </View>
          </View>
        </View>

        {renderCalendar()}
      </View>
    );
  };

  if (!friendDiscoveryProfile) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#EA580C" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black " style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="light-content" />
      <View className="px-4 pt-4 border-b border-white/[0.08]">
        <View className="flex-row items-center mb-2">
          <TouchableOpacity
            onPress={onBackPress}
            className="w-10 h-10 rounded-xl bg-white/[0.03] items-center justify-center border border-white/[0.08] mr-3"
          >
            <Feather name="arrow-left" size={22} color="#999999" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-orange-600 text-[11px] font-bold tracking-widest">
              USER
            </Text>
            <Text className="text-white text-3xl font-black">Profile</Text>
          </View>

          {isCurrentUser && (
            <TouchableOpacity
              onPress={openDotsModal}
              className="px-3 py-2 rounded-xl "
            >
              <Entypo name="dots-three-vertical" size={22} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EA580C"
            colors={["#EA580C"]}
            progressBackgroundColor="#000000"
          />
        }
      >
        <View className="px-4 pb-4 mt-4">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <View className="flex-row justify-between items-start mb-2">
              <View>
                <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
                  {/* ALCOHOLIC */}
                  {
                    getCoefInfo(
                      friendDiscoveryProfile.user.alcoholism_coefficient
                    ).title
                  }
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

            <View className="bg-white/[0.03] rounded-xl py-4 border border-white/[0.08] flex-row">
              {/* Column 1: Streak (Add Border Right) */}
              <View className="items-center flex-1 border-r border-white/[0.08]">
                <Text className="text-white text-xl font-black">
                  {friendDiscoveryProfile?.stats?.current_streak || 0}
                </Text>
                <Text className="text-white/40 text-[9px] font-bold mt-1 tracking-wider">
                  CURRENT STREAK
                </Text>
              </View>

              {/* Column 2: Buddies (Add Border Right, Remove Border Left) */}
              <View className="items-center flex-1 border-r border-white/[0.08]">
                <Text className="text-orange-600 text-xl font-black">
                  {friendDiscoveryProfile?.stats?.friends_count || 0}
                </Text>
                <Text className="text-white/40 text-[9px] font-bold mt-1 tracking-wider">
                  BUDDIES
                </Text>
              </View>

              {/* Column 3: Longest Streak (No Border) */}
              <View className="items-center flex-1">
                <Text className="text-white text-xl font-black">
                  {friendDiscoveryProfile?.stats?.longest_streak || 0}
                </Text>
                <Text className="text-white/40 text-[9px] font-bold mt-1 tracking-wider">
                  LONGEST STREAK
                </Text>
              </View>
            </View>
            {!isCurrentUser && (
              <View className="flex mt-2">
                {friendDiscoveryProfile?.user && (
                  <FriendButton
                    initialIsFriend={friendDiscoveryProfile.is_friend}
                    onToggle={handleFriendToggle}
                  />
                )}
              </View>
            )}
          </View>
        </View>

        <View className="px-4 mb-4">
          <View className="bg-white/[0.03] rounded-xl p-1.5 border border-white/[0.08] flex-row">
            {(isCurrentUser
              ? ["overview", "stories", "inventory"]
              : ["overview", "stats", "inventory"]
            ).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab as any)}
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
        {activeTab === "stories" && renderStories()}
        {activeTab === "stats" && renderStats()}
      </ScrollView>

      <MixPostModal
        expandedItem={expandedItem}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        currentAspectRatio={currentAspectRatio}
      />

      <Modal
        transparent
        visible={settingsModalVisible}
        onRequestClose={closeSettingsModal}
        animationType="slide"
      >
        <TouchableWithoutFeedback onPress={closeSettingsModal}>
          <View className="flex-1 bg-black/60 justify-end">
            <TouchableWithoutFeedback onPress={() => {}}>
              <View className="bg-neutral-900 rounded-t-[32px] border-t border-white/10 w-full overflow-hidden">
                {/* Drag Handle */}
                <View className="items-center pt-4 pb-2">
                  <View className="w-12 h-1.5 bg-white/20 rounded-full" />
                </View>

                {/* Header */}
                <View className="px-6 pb-6 pt-2 border-b border-white/5">
                  <Text className="text-white text-xl font-black tracking-tight text-center">
                    {isCurrentUser ? "Manage Profile" : "User Actions"}
                  </Text>
                  <Text className="text-white/40 text-xs font-semibold text-center mt-1">
                    {isCurrentUser
                      ? "Update your settings and preferences"
                      : "Manage your connection with this user"}
                  </Text>
                </View>

                {/* Content */}
                <View
                  className="p-6"
                  style={{ paddingBottom: Math.max(insets.bottom, 24) + 10 }}
                >
                  {isCurrentUser ? (
                    <>
                      <ModalOption
                        label="Bug"
                        subLabel="Report bugs, give ideas and ask for features"
                        icon={
                          <Ionicons
                            name="bug-outline"
                            size={24}
                            color="#EA580C"
                          />
                        }
                        onPress={() => {
                          closeSettingsModal();
                          setFeedbackModalVisible(true);
                        }}
                      />

                      <ModalOption
                        label="Edit Profile"
                        subLabel="Change name, bio, and photo"
                        icon={
                          <MaterialIcons
                            name="mode-edit"
                            size={20}
                            color="#EA580C"
                          />
                        }
                        onPress={() => {
                          closeSettingsModal();
                          router.push("/(screens)/editProfile");
                        }}
                      />

                      {/* Logout Button Wrapped for consistent style */}
                      <View className="mt-4">
                        <Text className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-2 pl-2">
                          Danger Zone
                        </Text>
                        <View className="overflow-hidden rounded-2xl">
                          <LogoutButton />
                        </View>
                      </View>
                    </>
                  ) : (
                    <>
                      <ModalOption
                        label="Report User"
                        subLabel="Flag inappropriate content or behavior"
                        isDestructive
                        icon={
                          <FontAwesome5 name="flag" size={16} color="#ef4444" />
                        }
                        onPress={() => {
                          // Placeholder for report logic
                          Vibration.vibrate(10);
                          closeSettingsModal();
                        }}
                      />
                      <ModalOption
                        label="Block User"
                        subLabel="They won't be able to see your posts"
                        isDestructive
                        icon={<Entypo name="block" size={18} color="#ef4444" />}
                        onPress={() => {
                          // Placeholder for block logic
                          Vibration.vibrate(10);
                          closeSettingsModal();
                        }}
                      />
                    </>
                  )}

                  {/* Cancel Button */}
                  <TouchableOpacity
                    onPress={closeSettingsModal}
                    className="mt-4 py-4 rounded-2xl bg-black border border-white/10 items-center justify-center"
                    activeOpacity={0.8}
                  >
                    <Text className="text-white font-bold text-sm">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <DeleteModal
        visible={showDeleteModal}
        onClose={() => {
          if (!isDeletingStory) setShowDeleteModal(false);
        }}
        onConfirm={executeDeleteStory}
        title="Delete Story?"
        message="This action cannot be undone. Are you sure you want to delete this story?"
        isDeleting={isDeletingStory}
      />

      <Feedback
        feedbackModalVisible={feedbackModalVisible}
        setFeedbackModalVisible={setFeedbackModalVisible}
      />
    </View>
  );
};

export default UserInfoScreen;