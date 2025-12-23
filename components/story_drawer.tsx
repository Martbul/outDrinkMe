import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Image,
  Modal,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { Video, ResizeMode } from "expo-av"; // Import Video for playback
import { useApp } from "@/providers/AppProvider";
import { StoryRecorder } from "./story_recorder";

// --- CUSTOM IMPORTS ---

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.25;

export default function StoryDrawer() {
   const insets = useSafeAreaInsets();
   
  const { user } = useUser();
  const { stories, markStoryAsSeen, deleteStory } = useApp(); 

  const [isOpen, setIsOpen] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  // Find the full story object based on ID
  const selectedStory = stories.find((s) => s.id === selectedStoryId);

  // Check if the current user owns the selected story
  // Note: Clerk user.id usually matches backend user.clerk_id,
  // but your backend Story object uses internal UUIDs for userId.
  // You might need to compare usernames or handle ID mapping.
  // Ideally, your backend Story object should return `isMine: boolean`.
  // For now, let's assume we compare usernames or you add a check.
  const isMyStory = selectedStory?.username === user?.username;

  const toggleDrawer = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
    setIsOpen(!isOpen);
  };

  const openStory = (id: string) => {
    setSelectedStoryId(id);
    markStoryAsSeen(id); // Trigger API call
  };

  const handleDelete = () => {
    if (!selectedStoryId) return;
    Alert.alert("Delete Story?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteStory(selectedStoryId);
          setSelectedStoryId(null);
        },
      },
    ]);
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [DRAWER_WIDTH, 0],
  });

  const arrowRotate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <>
      {/* --- DRAWER --- */}
      <Animated.View
        className="absolute right-0 bg-zinc-900/95 rounded-l-3xl border-l border-y border-white/10 z-40 flex-row"
        style={{
          top: insets.top + 60,
          bottom: insets.bottom + 80,
          width: DRAWER_WIDTH,
          transform: [{ translateX }],
        }}
      >
        <TouchableOpacity
          onPress={toggleDrawer}
          activeOpacity={0.9}
          className="absolute -left-10 top-1/2 -mt-10 w-10 h-20 bg-zinc-900 rounded-l-2xl border-l border-y border-white/10 justify-center items-center"
        >
          <Animated.View style={{ transform: [{ rotate: arrowRotate }] }}>
            <Ionicons name="chevron-back" size={24} color="#EA580C" />
          </Animated.View>
        </TouchableOpacity>

        <View className="flex-1 items-center py-6">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ alignItems: "center", paddingBottom: 20 }}
            className="w-full"
          >
            {/* POST BUTTON */}
            <TouchableOpacity
              onPress={() => setIsRecordingModalOpen(true)}
              className="items-center mb-5"
            >
              <View className="w-[52px] h-[52px] rounded-full border-2 border-white/20 justify-center items-center bg-black">
                <Ionicons name="add" size={28} color="white" />
              </View>
              <Text className="text-white/70 text-[10px] mt-1 font-bold">
                Post
              </Text>
            </TouchableOpacity>

            {/* REAL STORIES LIST */}
            {stories.map((story) => (
              <TouchableOpacity
                key={story.id}
                onPress={() => openStory(story.id)}
                className="items-center mb-5"
              >
                {!story.isSeen ? (
                  // Unseen: Gradient Ring
                  <View className="w-[52px] h-[52px] rounded-full overflow-hidden">
                    <LinearGradient
                      colors={[
                        "#f09433",
                        "#e6683c",
                        "#dc2743",
                        "#cc2366",
                        "#bc1888",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="flex-1 justify-center items-center"
                    >
                      <View className="w-[48px] h-[48px] rounded-full bg-black justify-center items-center">
                        <Image
                          source={{
                            uri: story.userImage || "https://i.pravatar.cc/150",
                          }}
                          className="w-[44px] h-[44px] rounded-full"
                        />
                      </View>
                    </LinearGradient>
                  </View>
                ) : (
                  // Seen: Grey Ring
                  <View className="w-[52px] h-[52px] rounded-full border border-white/20 justify-center items-center">
                    <Image
                      source={{
                        uri: story.userImage || "https://i.pravatar.cc/150",
                      }}
                      className="w-[44px] h-[44px] rounded-full opacity-40"
                    />
                  </View>
                )}
                <Text
                  numberOfLines={1}
                  className="text-white/70 text-[10px] mt-1 font-bold w-14 text-center"
                >
                  {story.username === user?.username ? "You" : story.username}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.View>

      {/* --- RECORDING MODAL (Connects to Provider via its own internal logic) --- */}
      <Modal visible={isRecordingModalOpen} animationType="slide">
        {/* Pass close handler */}
        <StoryRecorder onClose={() => setIsRecordingModalOpen(false)} />
      </Modal>

      {/* --- STORY VIEWER MODAL --- */}
      <Modal
        visible={!!selectedStory}
        animationType="fade"
        onRequestClose={() => setSelectedStoryId(null)}
      >
        <View className="flex-1 bg-black">
          <StatusBar hidden />

          {selectedStory && (
            <>
              {/* VIDEO PLAYER */}
              <Video
                source={{ uri: selectedStory.videoUrl }}
                style={{ width: "100%", height: "100%" }}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping={false}
                // Optional: Close modal when video finishes
                onPlaybackStatusUpdate={(status) => {
                  if (status.isLoaded && status.didJustFinish) {
                    setSelectedStoryId(null);
                  }
                }}
              />

              {/* OVERLAYS */}
              <View
                className="absolute top-0 w-full"
                style={{ paddingTop: insets.top + 10 }}
              >
                {/* Progress Bar (Simple Static for now, can animate based on duration) */}
                <View className="px-4 flex-row gap-1 mb-4">
                  <View className="flex-1 h-0.5 bg-white/80 rounded-full" />
                </View>

                {/* Header Info */}
                <View className="px-4 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Image
                      source={{ uri: selectedStory.userImage }}
                      className="w-9 h-9 rounded-full border border-white/50"
                    />
                    <View className="ml-3">
                      <Text className="text-white font-bold text-sm">
                        {selectedStory.username}
                      </Text>
                      <Text className="text-white/60 text-[10px]">
                        {new Date(selectedStory.createdAt).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    {/* DELETE BUTTON (Only if My Story) */}
                    {isMyStory && (
                      <TouchableOpacity
                        onPress={handleDelete}
                        className="p-2 mr-2 bg-red-500/20 rounded-full"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#ef4444"
                        />
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => setSelectedStoryId(null)}
                      className="p-2"
                    >
                      <Ionicons name="close" size={30} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
      </Modal>
    </>
  );
}
