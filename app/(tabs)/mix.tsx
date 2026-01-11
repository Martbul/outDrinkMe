import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  Platform,
  StatusBar,
  LayoutChangeEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image as ExpoImage } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  withTiming,
  FadeInRight,
  FadeOutRight,
  LinearTransition,
} from "react-native-reanimated";

import Header from "@/components/header";
import MixPostModal from "@/components/mixPostModal";
import { useApp } from "@/providers/AppProvider";
import type { DailyDrinkingPostResponse } from "@/types/api.types";
import { SegmentItem, TabSwitcher } from "@/components/tab_switcher";
import { ReactionsOverlay } from "@/components/reaction_overlay";

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

const PRIMARY_ORANGE = "#EA580C";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAP = 4;
const SCREEN_PADDING = 4;
const COLUMN_WIDTH = (SCREEN_WIDTH - SCREEN_PADDING * 2 - GAP) / 2;

const MAX_CARD_HEIGHT = COLUMN_WIDTH * 1.6;
const MIN_CARD_HEIGHT = COLUMN_WIDTH * 0.8;

const getInitialHeight = (id: string) => {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const range = MAX_CARD_HEIGHT - MIN_CARD_HEIGHT;
  return (hash % range) + MIN_CARD_HEIGHT;
};

interface YourMixCardProps {
  item: DailyDrinkingPostResponse;
  onCardPress: (item: DailyDrinkingPostResponse) => void;
}


const YourMixCard = React.memo(({ item, onCardPress }: YourMixCardProps) => {
  const posthog = usePostHog();
  const [showFriends, setShowFriends] = useState(false);

  const cardHeight = useMemo(() => {
    if (item.image_width && item.image_height) {
      const aspectRatio = item.image_height / item.image_width;
      const calculated = COLUMN_WIDTH * aspectRatio;
      return Math.min(Math.max(calculated, MIN_CARD_HEIGHT), MAX_CARD_HEIGHT);
    }
    return getInitialHeight(item.id || "0");
  }, [item.image_width, item.image_height, item.id]);

  const hasBuddies = item.mentioned_buddies && item.mentioned_buddies.length > 0;

  const handleToggleFriends = (e: any) => {
    e.stopPropagation();
    setShowFriends((prev) => !prev);
    if (!showFriends) {
      posthog?.capture("mix_card_friends_viewed", { mix_id: item.id });
    }
  };

const handleNavigation = () => {
  console.log("CLICKED CARD ID", item.id);
  posthog?.capture("memory_canvas_opened", { postId: item.id });

  router.push({
    pathname: "/(screens)/memory_canvas",
    params: {
      postId: item.id,
      initialImage: item.image_url,
      initialAuthor: item.username,
      initialOwnerId: item.user_id,
    },
  });
};

  return (
    <Pressable onPress={handleNavigation} style={{ padding: GAP / 2 }}>
      <View
        style={{ width: "100%", height: cardHeight }}
        className="rounded-3xl overflow-hidden border border-white/[0.08] bg-[#121212] relative shadow-sm"
      >
        {item.image_url ? (
          <ExpoImage
            source={{ uri: item.image_url }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
          />
        ) : (
          <View className="flex-1 items-center justify-center bg-zinc-800">
            <Ionicons name="image-outline" size={32} color="rgba(255,255,255,0.2)" />
          </View>
        )}
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.9)"]}
          style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "50%" }}
        />
        <View
          className="absolute bottom-4 left-0 right-0 p-2 z-50"
          style={{ overflow: "visible" }}
        >
          <ReactionsOverlay items={item.reactions} />
        </View>
        <View className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
          <Text className="text-white font-bold text-[10px] uppercase tracking-wider">
            {new Date(item.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
        <View className="absolute bottom-3 left-3 right-3 flex-row items-end justify-between pointer-events-box-none">
          <TouchableOpacity
            onPress={() => router.push(`/(screens)/userInfo?userId=${item.user_id}`)}
            className="rounded-full border border-white/20 overflow-hidden w-10 h-10 bg-zinc-800"
          >
            {item.user_image_url && (
              <ExpoImage source={{ uri: item.user_image_url }} style={{ width: "100%", height: "100%" }} />
            )}
          </TouchableOpacity>

          {hasBuddies && (
            <View>
              {showFriends ? (
                <Animated.View
                  entering={FadeInRight.duration(300)}
                  exiting={FadeOutRight.duration(200)}
                  layout={LinearTransition}
                  className="flex-row items-center bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/10"
                >
                  {item.mentioned_buddies?.slice(0, 3).map((buddy, index) => (
                    <TouchableOpacity key={index} onPress={handleToggleFriends} className="mr-1 last:mr-0">
                      <ExpoImage
                        source={{ uri: buddy.imageUrl }}
                        style={{ width: 24, height: 24, borderRadius: 12 }}
                        className="border border-white/20"
                      />
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    onPress={handleToggleFriends}
                    className="w-6 h-6 items-center justify-center bg-white/10 rounded-full ml-1"
                  >
                    <Ionicons name="close" size={12} color="white" />
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                // Simple Count
                <TouchableOpacity
                  onPress={handleToggleFriends}
                  className="flex-row items-center bg-white/[0.1] px-2 py-1.5 rounded-full border border-white/[0.1] backdrop-blur-sm"
                >
                  <Ionicons name="people" size={12} color={PRIMARY_ORANGE} style={{ marginRight: 4 }} />
                  <Text className="text-white text-[10px] font-bold">{item.mentioned_buddies?.length}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
});

YourMixCard.displayName = "YourMixCard";


const MixScreen = () => {
  const {
    yourMixData,
    yourMixHasMore,
    loadMoreYourMixData,
    refreshYourMixData,
    globalMixData = [],
    globalMixHasMore,
    loadMoreGlobalMixData,
    refreshGlobalMixData,
    isLoading,
  } = useApp();

  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"personal" | "global">("personal");
  const [isPaginating, setIsPaginating] = useState(false);
  const { openPostId } = useLocalSearchParams();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<DailyDrinkingPostResponse | undefined>(undefined);
  const [currentAspectRatio, setCurrentAspectRatio] = useState(4 / 3);

  // -- STICKY HEADER STATE --
  const [headerHeight, setHeaderHeight] = useState(120);
  const scrollY = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastContentOffset = useSharedValue(0);

  // 1. Handle Scroll Updates
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
    onBeginDrag: (e) => {
      lastContentOffset.value = e.contentOffset.y;
    },
  });

  // 2. DiffClamp Logic for Show/Hide
  useDerivedValue(() => {
    const nextY = scrollY.value;
    const diff = nextY - lastContentOffset.value;

    if (nextY <= 0) {
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      const newTranslate = translateY.value - diff;
      translateY.value = Math.max(Math.min(newTranslate, 0), -headerHeight);
    }
    lastContentOffset.value = nextY;
  });

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // -- EFFECTS --
  useEffect(() => {
    const allPosts = [...yourMixData, ...globalMixData];
    if (openPostId && allPosts.length > 0) {
      const idToFind = Array.isArray(openPostId) ? openPostId[0] : openPostId;
      const foundPost = allPosts.find((p) => p.id === idToFind);
      if (foundPost) setExpandedId(idToFind);
    }
  }, [openPostId, yourMixData, globalMixData]);

  useEffect(() => {
    if (expandedId) {
     const allPosts = [...yourMixData, ...(globalMixData || [])];
      const item = allPosts.find((post) => post.id === expandedId);
      setExpandedItem(item);
    } else {
      setExpandedItem(undefined);
    }
  }, [expandedId, yourMixData, globalMixData]);

  // -- UPDATED EFFECT: USE EXISTING DIMENSIONS --
  useEffect(() => {
    if (expandedItem?.image_width && expandedItem?.image_height) {
      setCurrentAspectRatio(expandedItem.image_width / expandedItem.image_height);
    } else {
      setCurrentAspectRatio(4 / 3);
    }
  }, [expandedItem]);

  const activeData = activeTab === "personal" ? yourMixData : globalMixData;
  const activeHasMore = activeTab === "personal" ? yourMixHasMore : globalMixHasMore;

  const handleCardPressForModal = useCallback((item: DailyDrinkingPostResponse) => {
    setExpandedId(item.id);
  }, []);

  const handleLoadMore = async () => {
    if (isPaginating || !activeHasMore) return;
    setIsPaginating(true);
    try {
      activeTab === "personal" ? await loadMoreYourMixData() : await loadMoreGlobalMixData();
    } finally {
      setIsPaginating(false);
    }
  };

  const handleRefresh = useCallback(() => {
    activeTab === "personal" ? refreshYourMixData() : refreshGlobalMixData?.();
  }, [activeTab, refreshYourMixData, refreshGlobalMixData]);

  const ListEmptyComponent = useMemo(() => {
    if (isLoading && activeData.length === 0) {
      return (
        <View className="mt-20 items-center">
          <ActivityIndicator size="large" color="#ea580c" />
        </View>
      );
    }
    return (
      <View className="items-center justify-center pt-20 px-10 opacity-50">
        <View className="w-20 h-20 bg-white/5 rounded-full items-center justify-center mb-4">
          <Ionicons name="images-outline" size={32} color="white" />
        </View>
        <Text className="text-white text-lg font-black tracking-wide">No Mixes Yet</Text>
        <Text className="text-white/60 text-center text-sm mt-2 max-w-[200px]">
          {activeTab === "personal" ? "Start capturing your nights to see them appear here." : "No public mixes found."}
        </Text>
      </View>
    );
  }, [isLoading, activeData.length, activeTab]);

  const renderItem = useCallback(
    ({ item }: { item: DailyDrinkingPostResponse }) => {
      return <YourMixCard item={item} onCardPress={handleCardPressForModal} />;
    },
    [handleCardPressForModal]
  );

 
type FeedType = "personal" | "global";
const feedTabs: SegmentItem<FeedType>[] = [
  {
    value: "personal",
    label: "MY MIX",
    icon: { name: "person", library: "Ionicons" },
  },
  {
    value: "global",
    label: "GLOBAL",
    icon: { name: "earth", library: "Ionicons" }, 
  },
];

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      <Animated.View
        style={[animatedHeaderStyle, { position: "absolute", top: 0, left: 0, right: 0, zIndex: 50 }]}
        onLayout={(e: LayoutChangeEvent) => {
          const h = e.nativeEvent.layout.height;
          if (Math.abs(headerHeight - h) > 2) setHeaderHeight(h);
        }}
      >
        <View className="bg-black/90 backdrop-blur-md pb-2">
          <Header sticky={false} />
          <TabSwitcher items={feedTabs} selected={activeTab} onSelect={setActiveTab} />
        </View>
      </Animated.View>

      <AnimatedFlashList
        masonry
        data={activeData}
        numColumns={2}
        renderItem={renderItem}
        estimatedItemSize={280}
        keyExtractor={(item: any) => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{
          paddingHorizontal: SCREEN_PADDING - GAP / 2,
          paddingTop: headerHeight,
          paddingBottom: Math.max(insets.bottom, 20) + 20,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#ea580c"
            colors={["#ea580c"]}
            progressBackgroundColor="#1A1A1A"
            progressViewOffset={Platform.OS === "android" ? headerHeight : headerHeight}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <MixPostModal
        expandedItem={expandedItem}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        currentAspectRatio={currentAspectRatio}
      />
    </View>
  );
};

export default MixScreen;
