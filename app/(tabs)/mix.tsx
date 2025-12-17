import Header from "@/components/header";
import MixPostModal from "@/components/mixPostModal";
import { useApp } from "@/providers/AppProvider";
import type { YourMixPostData } from "@/types/api.types";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { usePostHog } from "posthog-react-native";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCREEN_PADDING = 16;
const GAP = 12;
const COLUMN_WIDTH = (SCREEN_WIDTH - SCREEN_PADDING * 2 - GAP) / 2;

const MAX_CARD_HEIGHT = COLUMN_WIDTH * 1.6;
const MIN_CARD_HEIGHT = COLUMN_WIDTH * 0.8;

// --- Helper Functions ---

const getInitialHeight = (id: string) => {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const range = MAX_CARD_HEIGHT - MIN_CARD_HEIGHT;
  return (hash % range) + MIN_CARD_HEIGHT;
};

// --- Sub-Components ---

interface YourMixCardProps {
  item: YourMixPostData;
  onCardPress: (item: YourMixPostData) => void;
}

const YourMixCard = React.memo(({ item, onCardPress }: YourMixCardProps) => {
  const posthog = usePostHog();
  const [isFlipped, setIsFlipped] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  const [cardHeight, setCardHeight] = useState(() =>
    getInitialHeight(item.id || "0")
  );

  const isSmallCard = cardHeight < COLUMN_WIDTH * 1.2;
  const hasBuddies = item.mentionedBuddies && item.mentionedBuddies.length > 0;

  useEffect(() => {
    let isMounted = true;
    if (item.imageUrl) {
      Image.getSize(
        item.imageUrl,
        (width, height) => {
          if (width && height && isMounted) {
            const aspectRatio = height / width;
            let calculatedHeight = COLUMN_WIDTH * aspectRatio;
            calculatedHeight = Math.min(
              Math.max(calculatedHeight, MIN_CARD_HEIGHT),
              MAX_CARD_HEIGHT
            );
            setCardHeight(calculatedHeight);
          }
        },
        () => {}
      );
    }
    return () => {
      isMounted = false;
    };
  }, [item.imageUrl]);

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
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
        className="bg-zinc-800"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.85)"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "60%",
        }}
      />
      <TouchableOpacity
        onPress={handleFlip}
        hitSlop={10}
        className="absolute top-2 right-2 w-7 h-7 bg-black/40 backdrop-blur-md rounded-full items-center justify-center border border-white/20"
      >
        <Ionicons name="repeat" size={14} color="white" />
      </TouchableOpacity>
      <View className="absolute top-2 left-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md border border-white/10">
        <Text className="text-white/90 text-[10px] font-bold uppercase tracking-wider">
          {new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </Text>
      </View>
      <View className="absolute bottom-3 left-3 right-3 flex-row items-end justify-between">
        <TouchableOpacity
          onPress={() =>
            router.push(`/(screens)/userInfo?userId=${item.userId}`)
          }
          className="rounded-full border border-white/30 overflow-hidden w-10 h-10 bg-zinc-800"
        >
          {item.userImageUrl && (
            <Image
              source={{ uri: item.userImageUrl }}
              className="w-full h-full"
            />
          )}
        </TouchableOpacity>
        <View className="flex-row gap-1">
          {hasBuddies && (
            <View className="flex-row items-center bg-white/10 px-2 py-1 rounded-full border border-white/10">
              <Ionicons
                name="people"
                size={10}
                color="#ea580c"
                style={{ marginRight: 4 }}
              />
              <Text className="text-white text-[10px] font-bold">
                {item.mentionedBuddies.length}
              </Text>
            </View>
          )}
        </View>
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
      className={`bg-zinc-900 w-full h-full items-center justify-between ${
        isSmallCard ? "p-2" : "p-4"
      }`}
    >
      <View className="w-full flex-row justify-between items-center mb-1 shrink-0">
        <Text className="text-white/30 text-[10px] font-bold tracking-widest">
          DETAILS
        </Text>
        <TouchableOpacity onPress={handleFlip} hitSlop={15}>
          <Ionicons
            name="close-circle"
            size={isSmallCard ? 20 : 24}
            color="white"
            style={{ opacity: 0.5 }}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="w-full flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 4,
        }}
        showsVerticalScrollIndicator={false}
      >
        {hasBuddies ? (
          <View className="items-center">
            <Text
              className={`text-orange-500 font-bold uppercase tracking-wide mb-2 ${
                isSmallCard ? "text-xs" : "text-sm"
              }`}
            >
              With
            </Text>

            <View className="flex-row flex-wrap justify-center gap-2">
              {item.mentionedBuddies.slice(0, 4).map((b, i) => (
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/(screens)/userInfo?userId=${b.id}`)
                  }
                  key={b.id || i}
                  className="items-center"
                >
                  <Image
                    source={{ uri: b.imageUrl }}
                    className={`rounded-full border border-white/20 bg-zinc-800 mb-1 ${
                      isSmallCard ? "w-9 h-9" : "w-14 h-14"
                    }`}
                  />
                  <Text
                    className={`text-white/60 text-center max-w-[60px] ${
                      isSmallCard ? "text-[8px]" : "text-[10px]"
                    }`}
                    numberOfLines={1}
                  >
                    {b.firstName}
                  </Text>
                </TouchableOpacity>
              ))}
              {item.mentionedBuddies.length > 4 && (
                <View
                  className={`rounded-full bg-zinc-800 border border-white/10 items-center justify-center ${
                    isSmallCard ? "w-9 h-9" : "w-14 h-14"
                  }`}
                >
                  <Text
                    className={`text-white/50 ${
                      isSmallCard ? "text-[9px]" : "text-xs"
                    }`}
                  >
                    +{item.mentionedBuddies.length - 4}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View className="items-center justify-center h-full opacity-30">
            <Ionicons
              name="person-outline"
              size={isSmallCard ? 24 : 40}
              color="white"
            />
            <Text
              className={`text-white font-medium mt-1 ${
                isSmallCard ? "text-[10px]" : "text-xs"
              }`}
            >
              Solo Mix
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={handleNavigation}
        className={`w-full bg-white/5 rounded border border-white/10 flex-row items-center justify-center shrink-0 ${
          isSmallCard ? "py-2 mt-1" : "py-3 mt-2"
        }`}
      >
        <Text
          className={`text-white font-bold mr-1 ${
            isSmallCard ? "text-[10px]" : "text-xs"
          }`}
        >
          OPEN CANVAS
        </Text>
        <Ionicons
          name="arrow-forward"
          size={isSmallCard ? 10 : 12}
          color="white"
        />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <Pressable onPress={handleNavigation} style={{ marginBottom: GAP }}>
      <View
        style={{
          width: "100%",
          height: cardHeight,
        }}
        className="rounded-2xl overflow-hidden border border-white/[0.08] bg-zinc-900 relative"
      >
        {renderFront()}
        {renderBack()}
      </View>
    </Pressable>
  );
});

// --- Main Screen ---

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
  const [expandedItem, setExpandedItem] = useState<YourMixPostData | undefined>(
    undefined
  );
  const [currentAspectRatio, setCurrentAspectRatio] = useState(4 / 3);

  // --- Effects ---

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
    if (expandedItem?.imageUrl) {
      Image.getSize(
        expandedItem.imageUrl,
        (width, height) =>
          width && height && setCurrentAspectRatio(width / height),
        () => setCurrentAspectRatio(4 / 3)
      );
    }
  }, [expandedItem]);

  // --- Logic ---

  const activeData = activeTab === "personal" ? yourMixData : globalMixData;
  const activeHasMore =
    activeTab === "personal" ? yourMixHasMore : globalMixHasMore;

  const handleCardPressForModal = useCallback((item: YourMixPostData) => {
    setExpandedId(item.id);
  }, []);

  const handleLoadMore = async () => {
    if (isPaginating || !activeHasMore) return;
    setIsPaginating(true);
    try {
      activeTab === "personal"
        ? await loadMoreYourMixData()
        : await loadMoreGlobalMixData();
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
        <View className="mt-20">
          <ActivityIndicator size="large" color="#ea580c" />
        </View>
      );
    }
    const emptyMsg =
      activeTab === "personal"
        ? "Start capturing memories to see them here."
        : "No posts found";
    return (
      <View className="items-center justify-center pt-20 px-10 opacity-50">
        <Ionicons
          name="images-outline"
          size={48}
          color="white"
          style={{ marginBottom: 10 }}
        />
        <Text className="text-white text-center font-medium">
          Feed is empty
        </Text>
        <Text className="text-white/60 text-center text-sm mt-2">
          {emptyMsg}
        </Text>
      </View>
    );
  }, [isLoading, activeData.length, activeTab]);

  const renderItem = useCallback(
    ({ item }: { item: YourMixPostData }) => {
      return (
        <View style={{ paddingHorizontal: GAP / 2 }}>
          <YourMixCard item={item} onCardPress={handleCardPressForModal} />
        </View>
      );
    },
    [handleCardPressForModal]
  );

  return (
    <View className="flex-1 bg-black">
      {/* 
        FIX: Moved Header and Tabs OUTSIDE of FlashList.
        This creates a stable "Sticky" header that doesn't jump when the list loads.
        The Gradient is also kept here to underlay the header.
      */}
      <View className="z-10 bg-black">
        <View className="absolute top-0 w-full h-32 bg-gradient-to-b from-orange-900/20 to-transparent pointer-events-none" />
        <Header />
        <View className="px-4 border-b border-white/[0.05] items-center mb-4">
          <View className="flex-row items-center gap-6">
            <TouchableOpacity
              onPress={() => setActiveTab("personal")}
              className="items-center justify-center h-10 border-b-2"
              style={{
                borderColor:
                  activeTab === "personal" ? "#ea580c" : "transparent",
              }}
            >
              <Text
                className={`text-base font-bold ${activeTab === "personal" ? "text-white" : "text-white/40"}`}
              >
                MIX
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("global")}
              className="items-center justify-center h-10 border-b-2"
              style={{
                borderColor: activeTab === "global" ? "#ea580c" : "transparent",
              }}
            >
              <Text
                className={`text-base font-bold ${activeTab === "global" ? "text-white" : "text-white/40"}`}
              >
                FEED
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlashList
        masonry
        data={activeData}
        numColumns={2}
        renderItem={renderItem}
        estimatedItemSize={250}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        // ListHeaderComponent removed as it is now fixed at top
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{
          // Use Math.max to prevent 0-value jumps on initial render
          paddingBottom: Math.max(insets.bottom, 20) + 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#ea580c"
            colors={["#ea580c"]}
            // Adjust offset to appear below the fixed header
            progressViewOffset={Platform.OS === 'android' ? 120 : 20}
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