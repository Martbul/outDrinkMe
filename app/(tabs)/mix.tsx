import { useApp } from "@/providers/AppProvider";
import type { YourMixPostData } from "@/types/api.types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ScrollView,
  RefreshControl,
} from "react-native";
import Header from "@/components/header";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";
import MixPostModal from "@/components/mixPostModal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCREEN_PADDING = 12;
const GAP = 10;
const COLUMN_WIDTH = (SCREEN_WIDTH - SCREEN_PADDING * 2 - GAP) / 2;

const MAX_CARD_HEIGHT = COLUMN_WIDTH * 1.8;
const MIN_CARD_HEIGHT = COLUMN_WIDTH * 0.8; // Increased slightly for back content

const getOptimizedImageUrl = (url: string, width = 600) => {
  // if (!url || !url.includes("cloudinary.com")) return url;
  // const parts = url.split("/upload/");
  // return `${parts[0]}/upload/f_auto,q_auto,w_${width},c_limit/${parts[1]}`;
  return url;
};

const getInitialHeight = (id: string) => {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const range = MAX_CARD_HEIGHT - MIN_CARD_HEIGHT;
  return (hash % range) + MIN_CARD_HEIGHT;
};

interface YourMixCardProps {
  item: YourMixPostData;
  onCardPress: (item: YourMixPostData) => void;
}

const YourMixCard = ({ item, onCardPress }: YourMixCardProps) => {
  const posthog = usePostHog();
  const [flipState, setFlipState] = useState(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotationCount, setRotationCount] = useState(0);

  const [cardHeight, setCardHeight] = useState(
    getInitialHeight(item.id || "0")
  );

  const hasBuddies = item.mentionedBuddies && item.mentionedBuddies.length > 0;
  const hasLocation = !!item.locationText;

  const optimizedImage = item.imageUrl
    ? getOptimizedImageUrl(item.imageUrl, 600)
    : undefined;
  const optimizedUserImage = item.userImageUrl
    ? getOptimizedImageUrl(item.userImageUrl, 150)
    : null;

  useEffect(() => {
    if (item.imageUrl) {
      Image.getSize(
        item.imageUrl,
        (width, height) => {
          if (width && height) {
            const aspectRatio = height / width;
            let calculatedHeight = COLUMN_WIDTH * aspectRatio;

            if (calculatedHeight > MAX_CARD_HEIGHT)
              calculatedHeight = MAX_CARD_HEIGHT;
            if (calculatedHeight < MIN_CARD_HEIGHT)
              calculatedHeight = MIN_CARD_HEIGHT;

            setCardHeight(calculatedHeight);
          }
        },
        (err) => console.log("Image size error", err)
      );
    }
  }, [item.imageUrl]);

  const handleFlip = () => {
    if (isAnimating) return;
    posthog?.capture("mix_card_flipped", {
      mix_id: item.id,
      flip_state_from: flipState,
      has_buddies: hasBuddies,
      has_location: hasLocation,
    });
    setIsAnimating(true);

    const calculateNextState = (current: number) => {
      if (current === 0) {
        return hasBuddies ? 1 : hasLocation ? 2 : 0;
      } else if (current === 1) {
        return hasLocation ? 2 : 0;
      } else {
        return 0;
      }
    };

    const newState = calculateNextState(flipState);
    const nextRotation = rotationCount + 1;

    Animated.timing(rotateAnim, {
      toValue: nextRotation + 0.5,
      duration: 250,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setFlipState(newState);
      Animated.timing(rotateAnim, {
        toValue: nextRotation + 1,
        duration: 250,
        easing: Easing.out(Easing.quad),
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

  const renderCardContent = () => {
    if (flipState === 0) {
      return (
        <View className="flex-1 w-full h-full relative">
          <Image
            source={{ uri: optimizedImage }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
            className="bg-zinc-800"
          />
          <View className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-50" />

          <View className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded border border-white/10">
            <Text className="text-orange-500 text-[9px] font-bold">
              {new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>

          <TouchableOpacity
            className="absolute bottom-2 left-2"
            onPress={() =>
              router.push(`/(screens)/userInfo?userId=${item.userId}`)
            }
          >
            <View className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border border-white/20">
              {optimizedUserImage && (
                <Image
                  source={{ uri: optimizedUserImage }}
                  className="w-full h-full"
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      );
    } else if (flipState === 1) {
      return (
        <View className="flex-1 w-full h-full bg-black items-center justify-center p-3">
          <View className="items-center mb-3">
            <Text className="text-white/50 text-[9px] font-bold tracking-widest mb-1">
              DRINKING BUDDIES
            </Text>
            <Text className="text-orange-600 text-xl font-black">
              {item.mentionedBuddies.length}
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-center gap-2">
            {item.mentionedBuddies.slice(0, 6).map((b, i) => (
              <View key={b.id || i} className="items-center w-[40px]">
                <View className="w-10 h-10 rounded-full bg-zinc-800 border border-orange-600/40 overflow-hidden items-center justify-center mb-1">
                  {b.imageUrl ? (
                    <Image
                      source={{ uri: getOptimizedImageUrl(b.imageUrl, 100) }}
                      className="w-full h-full"
                    />
                  ) : (
                    <Text className="text-orange-500 text-[10px] font-bold">
                      {b.firstName?.[0] || "?"}
                    </Text>
                  )}
                </View>
                <Text
                  className="text-white/80 text-[8px] font-medium text-center"
                  numberOfLines={1}
                >
                  {b.firstName || "User"}
                </Text>
              </View>
            ))}
          </View>
        </View>
      );
    } else {
      return (
        <View className="flex-1 w-full h-full bg-black items-center justify-center p-4">
          <View className="w-full items-center">
            <Text className="text-white/50 text-[9px] font-bold tracking-widest mb-2">
              LOCATION
            </Text>
            <Text
              className="text-white text-sm font-bold text-center mb-4 leading-5"
              numberOfLines={4}
            >
              {item.locationText}
            </Text>

            <View className="bg-white/[0.05] rounded-lg p-3 w-full items-center border border-white/[0.1]">
              <Text className="text-orange-600 text-[10px] font-bold">
                Map coming soon
              </Text>
            </View>
          </View>
        </View>
      );
    }
  };

  return (
    <TouchableOpacity
      onPress={handleFlip}
      onLongPress={() => onCardPress(item)}
      delayLongPress={300}
      activeOpacity={0.9}
      style={{ marginBottom: GAP }}
    >
      <Animated.View
        style={{
          width: COLUMN_WIDTH,
          height: cardHeight,
          transform: [
            {
              rotateY: rotateInterpolate, 
            },
          ],
        }}
        className="rounded-xl overflow-hidden border border-white/[0.08] bg-zinc-900"
      >
        {renderCardContent()}
      </Animated.View>
    </TouchableOpacity>
  );
};

const MixScreen = () => {
  const posthog = usePostHog();
  const { userData, yourMixData, isLoading, refreshYourMixData } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<YourMixPostData | undefined>(
    undefined
  );
  const [currentAspectRatio, setCurrentAspectRatio] = useState(4 / 3);

  const screens = [{ key: "yourmix", title: "YOUR MIX" }];

  const { leftColumn, rightColumn } = useMemo(() => {
    const left: YourMixPostData[] = [];
    const right: YourMixPostData[] = [];

    yourMixData.forEach((item, index) => {
      if (index % 2 === 0) {
        left.push(item);
      } else {
        right.push(item);
      }
    });
    return { leftColumn: left, rightColumn: right };
  }, [yourMixData]);

  useEffect(() => {
    if (expandedId) {
      const item = yourMixData.find((post) => post.id === expandedId);
      setExpandedItem(item);
    } else {
      setExpandedItem(undefined);
    }
  }, [expandedId, yourMixData]);

  useEffect(() => {
    if (expandedItem?.imageUrl) {
      Image.getSize(
        expandedItem.imageUrl,
        (width, height) => {
          if (width && height) {
            setCurrentAspectRatio(width / height);
          }
        },
        (error) => console.log("Failed to get size for modal image", error)
      );
    } else {
      setCurrentAspectRatio(4 / 3);
    }
  }, [expandedItem]);

  const handleCardPressForModal = (item: YourMixPostData) => {
    setExpandedId(item.id);
  };

  useEffect(() => {
    posthog?.capture("mix_tab_viewed", {
      tab_name: activeTab === 0 ? "your_mix" : "video_feed",
      mix_count: yourMixData.length,
    });
  }, [activeTab, yourMixData.length]);

  const renderYourMixScreen = () => {
    if (isLoading && yourMixData.length === 0) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="small" color="#ff8c00" />
        </View>
      );
    }

    if (yourMixData.length === 0) {
      return (
        <View className="flex-1 items-center justify-center py-20 px-10">
          <Text className="text-white/50 text-center">No mixes yet.</Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={{ width: SCREEN_WIDTH }}
        contentContainerStyle={{
          paddingHorizontal: SCREEN_PADDING,
          paddingTop: SCREEN_PADDING,
          paddingBottom: insets.bottom + 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshYourMixData}
            tintColor="#ff8c00"
            colors={["#ff8c00"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row">
          <View className="flex-1" style={{ marginRight: GAP / 2 }}>
            {leftColumn.map((item) => (
              <YourMixCard
                key={item.id}
                item={item}
                onCardPress={handleCardPressForModal}
              />
            ))}
          </View>

          <View className="flex-1" style={{ marginLeft: GAP / 2 }}>
            {rightColumn.map((item) => (
              <YourMixCard
                key={item.id}
                item={item}
                onCardPress={handleCardPressForModal}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderPageItem = ({ item }: { item: (typeof screens)[0] }) => {
    if (item.key === "yourmix") return renderYourMixScreen();
    return null;
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setActiveTab(viewableItems[0].index || 0);
  }).current;

  return (
    <View className="flex-1 bg-black">
      <Header />

      <View className="flex-row justify-center items-center py-3 border-b border-white/[0.05]">
        {screens.map((screen, index) => (
          <View
            key={screen.key}
            className={`h-1.5 rounded-full mx-1 transition-all ${
              activeTab === index ? "w-6 bg-orange-600" : "w-1.5 bg-zinc-800"
            }`}
          />
        ))}
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={screens}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        renderItem={renderPageItem}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
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
