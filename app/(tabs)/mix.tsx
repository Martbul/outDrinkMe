import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image as ExpoImage } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import Header from "@/components/header";
import MixPostModal from "@/components/mixPostModal";
import { ReactionsOverlay } from "@/components/reactionOberlay";
import { useApp } from "@/providers/AppProvider";
import type { DailyDrinkingPostResponse } from "@/types/api.types";
import { SegmentItem, TabSwitcher } from "@/components/tab_switcher";

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
  const [isFlipped, setIsFlipped] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const cardHeight = useMemo(() => {
    if (item.image_width && item.image_height) {
      const aspectRatio = item.image_height / item.image_width;
      const calculated = COLUMN_WIDTH * aspectRatio;
      return Math.min(Math.max(calculated, MIN_CARD_HEIGHT), MAX_CARD_HEIGHT);
    }
    return getInitialHeight(item.id || "0");
  }, [item.image_width, item.image_height, item.id]);

  const isSmallCard = cardHeight < COLUMN_WIDTH * 1.2;
  const hasBuddies = item.mentioned_buddies && item.mentioned_buddies.length > 0;

  const handleFlip = (e?: any) => {
    e?.stopPropagation();
    if (isAnimating) return;

    posthog?.capture("mix_card_flipped", {
      mix_id: item.id,
      flip_state_to: !isFlipped,
    });

    setIsAnimating(true);
    Animated.timing(rotateAnim, {
      toValue: isFlipped ? 0 : 1,
      duration: 400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start(() => {
      setIsFlipped(!isFlipped);
      setIsAnimating(false);
    });
  };

  const handleNavigation = () => {
    posthog?.capture("memory_canvas_opened", { postId: item.id });
    router.push({
      pathname: "/(screens)/memoryCanvas",
      params: { postId: item.id },
    });
  };

  const frontInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });
  const frontOpacity = rotateAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [1, 0, 0, 0],
  });
  const backOpacity = rotateAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  const renderFront = () => (
    <Animated.View
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        backfaceVisibility: "hidden",
        transform: [{ rotateY: frontInterpolate }],
        opacity: frontOpacity,
        zIndex: isFlipped ? 0 : 1,
      }}
      className="bg-[#121212]"
    >
      {item.image_url ? (
        <ExpoImage
          source={{ uri: item.image_url }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View className="flex-1 items-center justify-center bg-zinc-800">
          <Ionicons name="image-outline" size={32} color="rgba(255,255,255,0.2)" />
        </View>
      )}

      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.9)"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "50%",
        }}
      />

      <View className="absolute top-0 left-0 right-0 p-2">
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

      <TouchableOpacity
        onPress={handleFlip}
        hitSlop={10}
        className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full items-center justify-center border border-white/20"
      >
        <MaterialCommunityIcons name="rotate-3d-variant" size={16} color="white" />
      </TouchableOpacity>

      <View className="absolute bottom-3 left-3 right-3 flex-row items-end justify-between">
        <TouchableOpacity
          onPress={() => router.push(`/(screens)/userInfo?userId=${item.user_id}`)}
          className="rounded-full border border-white/20 overflow-hidden w-8 h-8 bg-zinc-800"
        >
          {item.user_image_url && (
            <ExpoImage source={{ uri: item.user_image_url }} style={{ width: "100%", height: "100%" }} />
          )}
        </TouchableOpacity>

        {hasBuddies && (
          <View className="flex-row items-center bg-white/[0.1] px-2 py-1 rounded-full border border-white/[0.1]">
            <Ionicons name="people" size={10} color={PRIMARY_ORANGE} style={{ marginRight: 4 }} />
            <Text className="text-white text-[10px] font-bold">{item.mentioned_buddies?.length}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  const renderBack = () => (
    <Animated.View
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        backfaceVisibility: "hidden",
        transform: [{ rotateY: backInterpolate }],
        opacity: backOpacity,
        zIndex: isFlipped ? 1 : 0,
      }}
      className="bg-[#1A1A1A] w-full h-full p-3 justify-between border border-white/[0.08] rounded-3xl"
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-white/40 text-[10px] font-black tracking-widest uppercase">DETAILS</Text>
        <TouchableOpacity onPress={handleFlip}>
          <Ionicons name="close-circle" size={24} color="white" style={{ opacity: 0.5 }} />
        </TouchableOpacity>
      </View>

      <View className="flex-1 items-center justify-center">
        {hasBuddies ? (
          <View className="items-center">
            <Text className="text-orange-600 font-bold uppercase tracking-widest text-[10px] mb-3">DRINKING WITH</Text>
            <View className="flex-row flex-wrap justify-center gap-2">
              {item.mentioned_buddies?.slice(0, 3).map((b, i) => (
                <View key={i} className="items-center">
                  <ExpoImage
                    source={{ uri: b.imageUrl }}
                    style={{ width: 36, height: 36, borderRadius: 18 }}
                    className="border border-white/20 mb-1"
                  />
                  <Text className="text-white/60 text-[9px] max-w-[50px] text-center" numberOfLines={1}>
                    {b.firstName}
                  </Text>
                </View>
              ))}
              {item.mentioned_buddies && item.mentioned_buddies.length > 3 && (
                <View className="w-9 h-9 rounded-full bg-white/10 items-center justify-center border border-white/10">
                  <Text className="text-white/60 text-[10px] font-bold">+{item.mentioned_buddies.length - 3}</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View className="items-center opacity-30">
            <Ionicons name="person" size={32} color="white" />
            <Text className="text-white text-[10px] font-bold mt-2 uppercase tracking-wide">Solo Session</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={handleNavigation}
        className="w-full bg-orange-600/20 rounded-xl border border-orange-600/50 py-3 flex-row items-center justify-center mt-2"
      >
        <Text className="text-orange-500 font-black text-[10px] mr-1 tracking-widest">OPEN MEMORY</Text>
        <Ionicons name="arrow-forward" size={10} color="#EA580C" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <Pressable onPress={handleNavigation} style={{ padding: GAP / 2 }}>
      <View
        style={{ width: "100%", height: cardHeight }}
        className="rounded-3xl overflow-hidden border border-white/[0.08] bg-[#121212] relative shadow-sm"
      >
        {renderFront()}
        {renderBack()}
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
      const allPosts = [...yourMixData, ...globalMixData];
      const item = allPosts.find((post) => post.id === expandedId);
      setExpandedItem(item);
    } else {
      setExpandedItem(undefined);
    }
  }, [expandedId, yourMixData, globalMixData]);

  useEffect(() => {
    if (expandedItem?.image_url) {
      Image.getSize(
        expandedItem.image_url,
        (width, height) => width && height && setCurrentAspectRatio(width / height),
        () => setCurrentAspectRatio(4 / 3)
      );
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

  const ListEmptyComponent = useCallback(() => {
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
    { value: "personal", label: "MY MIX", icon: "person" },
    { value: "global", label: "GLOBAL", icon: "earth" },
  ];

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      <View className="z-10 bg-black" style={{ paddingTop: insets.top }}>
        <Header />
        <TabSwitcher items={feedTabs} selected={activeTab} onSelect={setActiveTab} />
      </View>

      <FlashList
        masonry
        data={activeData}
        numColumns={2}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{
          paddingHorizontal: SCREEN_PADDING - GAP / 2,
          paddingBottom: Math.max(insets.bottom, 20) + 20,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#ea580c"
            colors={["#ea580c"]}
            progressBackgroundColor="#1A1A1A"
            progressViewOffset={Platform.OS === "android" ? 0 : 0}
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
