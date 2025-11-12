import { useApp } from "@/providers/AppProvider";
import type { YourMixPostData } from "@/types/api.types";
import { Ionicons, } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
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
import MixVideo, { VideoPost } from "@/components/mixVideo";
import VideoRecorder from "@/components/videoRecoreder";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const mockVideos: VideoPost[] = [
  {
    id: "1",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    userId: "user1",
    username: "john_doe",
    userImageUrl: "https://i.pravatar.cc/150?img=1",
    caption: "First video post! 🎉",
    likes: 42,
    comments: 8,
    duration: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    userId: "user2",
    username: "jane_smith",
    userImageUrl: "https://i.pravatar.cc/150?img=2",
    caption: "Check this out!",
    likes: 128,
    comments: 23,
    duration: 30,
    createdAt: new Date().toISOString(),
  },
];

const MixScreen = () => {
  const { userData, yourMixData, isLoading, refreshYourMixData } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const [videos, setVideos] = useState<VideoPost[]>(mockVideos);
  const [showRecordModal, setShowRecordModal] = useState(false);

  const screens = [
    { key: "yourmix", title: "YOUR MIX" },
    { key: "videos", title: "VIDEO FEED" },
  ];

  const YourMixCard = ({ item }: { item: YourMixPostData }) => {
    const [flipState, setFlipState] = useState(0);
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const [isAnimating, setIsAnimating] = useState(false);
    const [rotationCount, setRotationCount] = useState(0);

    const hasBuddies =
      item.mentionedBuddies && item.mentionedBuddies.length > 0;
    const hasLocation = !!item.locationText;

    const handlePress = () => {
      if (isAnimating) return;
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
              source={{ uri: item.imageUrl }}
              className="w-full h-full"
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
              onPress={() =>
                router.push(`/(screens)/userInfo?userId=${item.userId}`)
              }
            >
              {item.userImageUrl && (
                <View className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm border-2 border-white/[0.15] overflow-hidden">
                  <Image
                    source={{ uri: item.userImageUrl }}
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
            <View className="flex-row flex-wrap gap-4 justify-center mb-5">
              {item.mentionedBuddies.map((buddy, index) => (
                <View
                  key={buddy.id || index}
                  className="items-center"
                  style={{ width: 75 }}
                >
                  <TouchableOpacity className="w-16 h-16 rounded-full bg-orange-600/20 border-2 border-orange-600/40 items-center justify-center mb-2 overflow-hidden">
                    {buddy.imageUrl ? (
                      <Image
                        source={{ uri: buddy.imageUrl }}
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
                  </TouchableOpacity>
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
        className="bg-white/[0.03] rounded-2xl overflow-hidden border border-white/[0.08] mb-4"
        activeOpacity={0.8}
        disabled={isAnimating}
      >
        <Animated.View
          style={{ transform: [{ rotateY: rotateInterpolate }] }}
          className="relative w-full aspect-[4/3]"
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
            Who's the one who can bring you back to drinking?
          </Text>
        </View>
      );
    }
    return null;
  };

  const handleVideoRecorded = async (
    videoUri: string,
    caption: string,
    duration: number
  ) => {
    if (!userData) return;

    //!TODO: Using the same folder as for the images(set them to be different and rebuild development)
    try {
      const CLOUDINARY_CLOUD_NAME =
        process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const CLOUDINARY_VIDEO_UPLOAD_PRESET =
        process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_VIDEO_UPLOAD_PRESET) {
        throw new Error("Cloudinary credentials are not configured.");
      }

      const formData = new FormData();
      formData.append("file", {
        uri: videoUri,
        type: "video/mp4",
        name: `video_${Date.now()}.mp4`,
      } as any);
      formData.append("upload_preset", CLOUDINARY_VIDEO_UPLOAD_PRESET);
      formData.append("resource_type", "video");
      formData.append("folder", "user_videos");
      formData.append("tags", `user_${userData.id},video_post`);

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
        {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        }
      );

      if (!cloudinaryResponse.ok) {
        const errorData = await cloudinaryResponse.json();
        throw new Error(
          `Upload failed: ${errorData.error?.message || "Unknown error"}`
        );
      }

      const cloudinaryData = await cloudinaryResponse.json();

      setVideos((prev) => [
        {
          id: Date.now().toString(),
          videoUrl: cloudinaryData.secure_url,
          userId: userData.id,
          username: userData.username || "You",
          userImageUrl: userData.imageUrl,
          caption: caption,
          likes: 0,
          comments: 0,
          duration: Math.round(cloudinaryData.duration || duration),
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      Alert.alert("Success", "Video posted successfully!");
    } catch (error) {
      console.error("Error uploading video:", error);
      throw error;
    }
  };

  const renderYourMixScreen = () => (
    <View style={{ width: SCREEN_WIDTH }}>
      <FlatList
        data={yourMixData}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 0,
          paddingBottom: 48,
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
    } else if (item.key === "videos") {
      return (
        <MixVideo
          videos={videos}
          onRecordPress={() => setShowRecordModal(true)}
        />
      );
    }
    return null;
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveTab(viewableItems[0].index || 0);
    }
  }).current;

  return (
    <View
      className="flex-1 bg-black"
      style={{ paddingBottom: insets.bottom + 40 }}
    >
      <Header />

      <View className="flex-row justify-center items-center py-3">
        {screens.map((_, index) => (
          <View
            key={index}
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

      {activeTab === 1 && (
        <TouchableOpacity
          onPress={() => setShowRecordModal(true)}
          className="absolute bottom-24 right-6 w-16 h-16 rounded-full bg-orange-600 items-center justify-center shadow-lg"
          style={{
            shadowColor: "#ff8c00",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons name="videocam" size={28} color="white" />
        </TouchableOpacity>
      )}

      <VideoRecorder
        visible={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        onVideoRecorded={handleVideoRecorded}
      />
    </View>
  );
};

export default MixScreen;
