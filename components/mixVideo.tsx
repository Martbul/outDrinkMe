// components/mixVideo.tsx
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface VideoPost {
  id: string;
  videoUrl: string;
  userId: string;
  username: string;
  userImageUrl?: string;
  caption?: string;
  likes: number;
  comments: number;
  duration: number;
  createdAt: string;
}

interface MixVideoProps {
  videos: VideoPost[];
  onRecordPress: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const VideoFeedCard = ({
  item,
  isActive,
}: {
  item: VideoPost;
  isActive: boolean;
}) => {
  const [isLiked, setIsLiked] = useState(false);

  // Create video player with expo-video
  const player = useVideoPlayer(item.videoUrl, (player) => {
    player.loop = true;
    player.muted = false;
  });

  // Play/pause based on visibility
  React.useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  return (
    <View
      style={{
        width: SCREEN_WIDTH - 32,
        height: SCREEN_HEIGHT * 0.7,
      }}
      className="bg-white/[0.03] rounded-2xl overflow-hidden border border-white/[0.08] mb-4 relative"
    >
      {/* Video Player */}
      <VideoView
        player={player}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        nativeControls={false}
      />

      {/* User Info Overlay - Top */}
      <View className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() =>
            router.push(`/(screens)/userInfo?userId=${item.userId}`)
          }
        >
          {item.userImageUrl ? (
            <Image
              source={{ uri: item.userImageUrl }}
              className="w-10 h-10 rounded-full border-2 border-white/20"
              resizeMode="cover"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-orange-600/30 border-2 border-orange-600/40 items-center justify-center">
              <Ionicons name="person" size={20} color="#ff8c00" />
            </View>
          )}
          <View className="ml-3">
            <Text className="text-white font-bold text-base">
              {item.username}
            </Text>
            <Text className="text-white/60 text-xs">
              {new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Play/Pause Overlay */}
      <TouchableOpacity
        className="absolute inset-0 items-center justify-center"
        onPress={() => {
          if (player.playing) {
            player.pause();
          } else {
            player.play();
          }
        }}
      >
       
      </TouchableOpacity>

      {/* Action Buttons - Right Side */}
      <View className="absolute right-4 bottom-20 items-center space-y-6">
        {/* Like Button */}
        <TouchableOpacity
          className="items-center"
          onPress={() => setIsLiked(!isLiked)}
        >
          <View className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm items-center justify-center border border-white/10">
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={28}
              color={isLiked ? "#ff8c00" : "white"}
            />
          </View>
          <Text className="text-white text-xs font-bold mt-1">
            {item.likes + (isLiked ? 1 : 0)}
          </Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity className="items-center">
          <View className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm items-center justify-center border border-white/10">
            <Ionicons name="chatbubble-outline" size={24} color="white" />
          </View>
          <Text className="text-white text-xs font-bold mt-1">
            {item.comments}
          </Text>
        </TouchableOpacity>

        {/* Share Button */}
        {/* <TouchableOpacity className="items-center">
          <View className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm items-center justify-center border border-white/10">
            <Ionicons name="paper-plane-outline" size={24} color="white" />
          </View>
          <Text className="text-white text-xs font-bold mt-1">Share</Text>
        </TouchableOpacity> */}
      </View>

      {/* Caption - Bottom */}
      {item.caption && (
        <View className="absolute bottom-0 left-0 right-0 p-4 pr-20 bg-gradient-to-t from-black/90 to-transparent">
          <Text className="text-white text-sm font-semibold" numberOfLines={2}>
            {item.caption}
          </Text>
        </View>
      )}

    </View>
  );
};

const EmptyVideoComponent = ({
  onRecordPress,
}: {
  onRecordPress: () => void;
}) => (
  <View
    className="flex-1 items-center justify-center px-8"
    style={{ height: SCREEN_HEIGHT * 0.6 }}
  >
    <View className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center w-full">
      <View className="w-24 h-24 rounded-2xl bg-orange-600/20 items-center justify-center mb-4">
        <Ionicons name="videocam-outline" size={48} color="#ff8c00" />
      </View>
      <Text className="text-white text-xl font-black mb-2">No Videos Yet</Text>
      <Text className="text-white/50 text-sm text-center font-semibold px-4 mb-6">
        Be the first to share a moment! Tap the button below to record.
      </Text>
      <TouchableOpacity
        onPress={onRecordPress}
        className="bg-orange-600 px-8 py-3 rounded-xl"
      >
        <Text className="text-white font-bold">Record Video</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function MixVideo({
  videos,
  onRecordPress,
  onRefresh,
  isRefreshing = false,
}: MixVideoProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentVideoIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const renderVideoItem = ({
    item,
    index,
  }: {
    item: VideoPost;
    index: number;
  }) => <VideoFeedCard item={item} isActive={index === currentVideoIndex} />;

  return (
    <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 100,
        }}
        renderItem={renderVideoItem}
        ListEmptyComponent={
          <EmptyVideoComponent onRecordPress={onRecordPress} />
        }
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT * 0.7 + 16}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}
