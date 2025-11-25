import { useApp } from "@/providers/AppProvider";
import type { YourMixPostData } from "@/types/api.types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
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
  Alert,
} from "react-native";
import Header from "@/components/header";
import { RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import { usePostHog } from "posthog-react-native";

// 1. Get Screen Dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const PADDING = 32; // 16px padding on left + 16px on right
const MAX_CONTENT_WIDTH = SCREEN_WIDTH - PADDING;

// FIX 1: Reduced max height from 0.7 to 0.6.
// On small screens, 0.7 leaves no room for headers/tabs.
const MAX_IMAGE_HEIGHT = SCREEN_HEIGHT * 0.6;

const getOptimizedImageUrl = (url: string, width = 1080) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  const parts = url.split("/upload/");
  return `${parts[0]}/upload/f_auto,q_auto,w_${width},c_limit/${parts[1]}`;
};

const MixScreen = () => {
  const posthog = usePostHog();
  const { getToken } = useAuth();
  const { userData, yourMixData, isLoading, refreshYourMixData } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const screens = [
    { key: "yourmix", title: "YOUR MIX" },
    // { key: "videos", title: "VIDEO FEED" },
  ];

  useEffect(() => {
    posthog?.capture("mix_tab_viewed", {
      tab_name: activeTab === 0 ? "your_mix" : "video_feed",
      mix_count: yourMixData.length,
    });
  }, [activeTab, yourMixData.length]);

  const YourMixCard = ({ item }: { item: YourMixPostData }) => {
    const [flipState, setFlipState] = useState(0);
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const [isAnimating, setIsAnimating] = useState(false);
    const [rotationCount, setRotationCount] = useState(0);

    // Default dimensions (4:3 ratio) before image loads
    const [cardDimensions, setCardDimensions] = useState({
      width: MAX_CONTENT_WIDTH,
      height: MAX_CONTENT_WIDTH * (3 / 4),
    });

    const hasBuddies =
      item.mentionedBuddies && item.mentionedBuddies.length > 0;
    const hasLocation = !!item.locationText;

    const optimizedImage = getOptimizedImageUrl(item.imageUrl);
    const optimizedUserImage = item.userImageUrl
      ? getOptimizedImageUrl(item.userImageUrl, 200)
      : null;

    useEffect(() => {
      if (item.imageUrl) {
        Image.getSize(
          item.imageUrl,
          (imgW, imgH) => {
            if (imgW && imgH) {
              const aspectRatio = imgW / imgH;

              // 1. Try setting width to max available width
              let finalWidth = MAX_CONTENT_WIDTH;
              let finalHeight = finalWidth / aspectRatio;

              // 2. If height exceeds limit, scale down based on height
              if (finalHeight > MAX_IMAGE_HEIGHT) {
                finalHeight = MAX_IMAGE_HEIGHT;
                finalWidth = finalHeight * aspectRatio;
              }

              // Safety check: Ensure width doesn't get too small on very tall images
              if (finalWidth < MAX_CONTENT_WIDTH * 0.5) {
                finalWidth = MAX_CONTENT_WIDTH * 0.5;
                // Recalculate height based on forced width (will crop slightly via overflow hidden)
                finalHeight = finalWidth / aspectRatio;
                // Cap height again just in case
                if (finalHeight > MAX_IMAGE_HEIGHT)
                  finalHeight = MAX_IMAGE_HEIGHT;
              }

              setCardDimensions({ width: finalWidth, height: finalHeight });
            }
          },
          (error) => {
            console.warn("Failed to get image size", error);
          }
        );
      }
    }, [item.imageUrl]);

    const handlePress = () => {
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

    const renderContent = () => {
      if (flipState === 0) {
        return (
          <>
            <Image
              source={{ uri: optimizedImage }}
              className="w-full h-full bg-white/5"
              // FIX 2: Ensure 'cover' is used so if dimensions are constrained, no whitespace appears
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <View className="absolute top-3 right-3">
              <View className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/[0.08]">
                <Text className="text-orange-600 text-xs font-bold tracking-wide">
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              className="absolute top-3 left-3"
              onPress={() => {
                posthog?.capture("mix_profile_clicked", {
                  target_user_id: item.userId,
                });
                router.push(`/(screens)/userInfo?userId=${item.userId}`);
              }}
            >
              {optimizedUserImage && (
                <View className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm border-2 border-white/[0.15] overflow-hidden">
                  <Image
                    source={{ uri: optimizedUserImage }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              )}
            </TouchableOpacity>
          </>
        );
      } else if (flipState === 1) {
        return (
          <View className="w-full h-full bg-black items-center justify-center p-6">
            <View className="items-center mb-5">
              <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-2">
                DRINKING BUDDIES
              </Text>
              <Text className="text-orange-600 text-2xl font-black">
                {item.mentionedBuddies.length}
              </Text>
            </View>
            {/* Added max-height to ScrollView inside card to prevent overflow on small cards */}
            <View className="flex-1 w-full justify-center">
              <View className="flex-row flex-wrap gap-4 justify-center">
                {item.mentionedBuddies.map((buddy, index) => (
                  <View
                    key={buddy.id || index}
                    className="items-center"
                    style={{ width: 75 }}
                  >
                    <View className="w-16 h-16 rounded-full bg-orange-600/20 border-2 border-orange-600/40 items-center justify-center mb-2 overflow-hidden">
                      {buddy.imageUrl ? (
                        <Image
                          source={{
                            uri: getOptimizedImageUrl(buddy.imageUrl, 150),
                          }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <Text className="text-orange-600 text-2xl font-black">
                          {buddy.firstName?.charAt(0).toUpperCase() ||
                            buddy.username?.charAt(0).toUpperCase() ||
                            "?"}
                        </Text>
                      )}
                    </View>
                    <Text
                      className="text-white text-xs text-center font-semibold"
                      numberOfLines={2}
                    >
                      {buddy.firstName && buddy.lastName
                        ? `${buddy.firstName} ${buddy.lastName}`
                        : buddy.username || "Unknown"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        );
      } else {
        return (
          <View className="w-full h-full bg-black items-center justify-center p-6">
            <View className="bg-white/[0.03] rounded-2xl p-6 w-full border border-white/[0.08]">
              <View className="items-center mb-5">
                <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-2">
                  LOCATION
                </Text>
                <Text className="text-white text-xl font-black text-center mb-4">
                  {item.locationText}
                </Text>
              </View>
              <View className="bg-white/[0.03] rounded-xl p-8 items-center justify-center border border-white/[0.08] mb-5">
                <Text className="text-orange-600 text-sm text-center font-semibold">
                  Map integration coming soon
                </Text>
              </View>
            </View>
          </View>
        );
      }
    };

    return (
      <TouchableOpacity
        onPress={handlePress}
        className="mb-6 items-center"
        activeOpacity={0.8}
        disabled={isAnimating}
      >
        <Animated.View
          style={{
            transform: [{ rotateY: rotateInterpolate }],
            width: cardDimensions.width,
            height: cardDimensions.height,
          }}
          className="relative bg-white/[0.03] rounded-2xl overflow-hidden border border-white/[0.08]"
        >
          {renderContent()}
        </Animated.View>
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
            Who&apos;s the one who can bring you back to drinking?
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderYourMixScreen = () => (
    <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
      <FlatList
        data={yourMixData}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 10,
          // FIX 3: Moved bottom padding here.
          // 'insets.bottom' ensures we clear the home indicator on iPhone.
          // + 100 gives enough space to scroll comfortably past the bottom bar.
          paddingBottom: insets.bottom + 100,
        }}
        renderItem={({ item }) => <YourMixCard item={item} />}
        ListEmptyComponent={renderEmptyYourMixComponent}
        refreshing={isLoading}
        onRefresh={refreshYourMixData}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshYourMixData}
            tintColor="#ff8c00"
            colors={["#ff8c00"]}
          />
        }
      />
    </View>
  );

  const renderPageItem = ({ item }: { item: (typeof screens)[0] }) => {
    if (item.key === "yourmix") {
      return renderYourMixScreen();
    }
    return null;
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveTab(viewableItems[0].index || 0);
    }
  }).current;

  return (
    // FIX 4: Removed 'paddingBottom' from here.
    // It was shrinking the view window. We want the view to be full height,
    // and the inner ScrollView (FlatList) to handle the padding.
    <View className="flex-1 bg-black">
      <Header />

      <View className="flex-row justify-center items-center py-3">
        {screens.map((screen, index) => (
          <View
            key={screen.key}
            className={`h-1.5 rounded-full mx-1 ${
              activeTab === index ? "w-6 bg-orange-600" : "w-1.5 bg-white/20"
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
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="center"
      />
    </View>
  );
};

export default MixScreen;
