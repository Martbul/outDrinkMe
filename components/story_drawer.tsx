import React, { useRef, useState, useEffect, useMemo } from "react";
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
  StyleSheet,
  PanResponder,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVideoPlayer, VideoView } from "expo-video";
import { useApp } from "@/providers/AppProvider";
import { StoryRecorder } from "./story_recorder";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.22;
const GRAB_ZONE_WIDTH = 50;

export default function StoryDrawer() {
  const insets = useSafeAreaInsets();
  const { stories, markStoryAsSeen } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  
  // Track which USER is being watched and which STORY within their list
  const [activeUserIndex, setActiveUserIndex] = useState<number | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  const [isHolding, setIsHolding] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const pressStartTime = useRef<number>(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // 1. GROUP STORIES BY USER
  const groupedUsers = useMemo(() => {
    const groups: Record<string, any> = {};
    stories.forEach((story) => {
      if (!groups[story.user_id]) {
        groups[story.user_id] = {
          user_id: story.user_id,
          username: story.username || "User",
          user_image_url: story.user_image_url,
          items: [],
          allSeen: true,
        };
      }
      groups[story.user_id].items.push(story);
      if (!story.isSeen) groups[story.user_id].allSeen = false;
    });
    return Object.values(groups);
  }, [stories]);

  const activeUser = activeUserIndex !== null ? groupedUsers[activeUserIndex] : null;
  const activeStory = activeUser ? activeUser.items[activeStoryIndex] : null;

  // Initialize Player
  const player = useVideoPlayer(activeStory?.video_url || null, (p) => {
    p.loop = false; // We handle the loop manually to move to next story segment
    p.play();
  });

  // Smooth progress bar update
  useEffect(() => {
    const interval = setInterval(() => {
      if (player && player.duration > 0) {
        setVideoProgress(player.currentTime / player.duration);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [player]);

  // Handle source changes when navigating stories
  useEffect(() => {
    if (activeStory?.video_url) {
      setVideoProgress(0);
      player.replace(activeStory.video_url);
      player.play();
      markStoryAsSeen(activeStory.id);
    }
  }, [activeStoryIndex, activeUserIndex]);

  // Handle auto-advance
  useEffect(() => {
    const sub = player.addListener("playToEnd", () => {
      handleNext();
    });
    return () => sub.remove();
  }, [player, activeStoryIndex, activeUserIndex]);

  const handleNext = () => {
    if (activeUser) {
      if (activeStoryIndex < activeUser.items.length - 1) {
        // Go to next story of SAME user
        setActiveStoryIndex(activeStoryIndex + 1);
      } else {
        // Loop back to the FIRST story of the same user as requested
        setActiveStoryIndex(0);
        player.seekTo(0);
        player.play();
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePrev = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    } else {
      player.seekTo(0);
      player.play();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const closeStoryViewer = () => {
    setActiveUserIndex(null);
    setActiveStoryIndex(0);
    setIsHolding(false);
  };

  const onUserPress = (index: number) => {
    animateDrawer(0);
    setActiveUserIndex(index);
    setActiveStoryIndex(0);
  };

  const handlePressIn = () => {
    pressStartTime.current = Date.now();
    setIsHolding(true);
    player.pause();
  };

  const handlePressOut = () => {
    setIsHolding(false);
    player.play();
  };

  const handleTap = (direction: "next" | "prev") => {
    const pressDuration = Date.now() - pressStartTime.current;
    if (pressDuration < 200) {
      if (direction === "next") handleNext();
      else handlePrev();
    }
  };

  // Drawer Animation logic remains the same
  const animateDrawer = (toValue: number) => {
    const opening = toValue === 1;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start(() => setIsOpen(opening));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 5,
      onPanResponderMove: (_, gesture) => {
        let move = isOpen ? 1 + gesture.dx / DRAWER_WIDTH : -gesture.dx / DRAWER_WIDTH;
        if (move < 0) move = 0;
        if (move > 1) move = 1;
        slideAnim.setValue(move);
      },
      onPanResponderRelease: (_, gesture) => {
        const currentVal = (slideAnim as any)._value;
        if (isOpen) {
          gesture.dx > 20 || currentVal < 0.7 ? animateDrawer(0) : animateDrawer(1);
        } else {
          gesture.dx < -20 || currentVal > 0.3 ? animateDrawer(1) : animateDrawer(0);
        }
      },
    })
  ).current;

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [DRAWER_WIDTH, 0],
  });

  return (
    <>
      {isOpen && <Pressable style={StyleSheet.absoluteFill} onPress={() => animateDrawer(0)} />}

      <View style={[styles.mainWrapper, { top: insets.top + 50, bottom: insets.bottom + 80 }]} pointerEvents="box-none">
        <Animated.View {...panResponder.panHandlers} style={[styles.drawerInner, { transform: [{ translateX }] }]}>
          <View style={styles.handlePill}>
            <TouchableOpacity onPress={() => animateDrawer(1)} style={styles.pillTouchTarget}>
              <View className="w-1.5 h-12 bg-white/30 rounded-full" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 bg-zinc-900/95 rounded-l-[32px] border-l border-y border-white/10 shadow-2xl overflow-hidden">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: "center", paddingTop: 30 }}>
              <TouchableOpacity 
                onPress={() => { animateDrawer(0); setIsRecordingModalOpen(true); }}
                className="w-12 h-12 rounded-full border border-dashed border-white/30 items-center justify-center mb-8"
              >
                <Ionicons name="add" size={26} color="white" />
              </TouchableOpacity>

              {groupedUsers.map((userGroup: any, index: number) => (
                <TouchableOpacity key={userGroup.user_id} onPress={() => onUserPress(index)} className="mb-6 items-center">
                  <View className={`p-[2px] rounded-full ${!userGroup.allSeen ? "border-2 border-orange-500" : "border border-white/10"}`}>
                    <Image source={{ uri: userGroup.user_image_url }} className={`w-10 h-10 rounded-full ${userGroup.allSeen ? "opacity-40" : "opacity-100"}`} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Animated.View>
      </View>

      <Modal visible={isRecordingModalOpen} animationType="slide">
        <StoryRecorder onClose={() => setIsRecordingModalOpen(false)} />
      </Modal>

      {/* STORY VIEWER */}
      <Modal visible={activeUserIndex !== null} animationType="fade" transparent onRequestClose={closeStoryViewer}>
        <View className="flex-1 bg-black">
          <StatusBar hidden />
          {activeUser && (
            <>
              <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />

              {/* Navigation Zones */}
              <View style={StyleSheet.absoluteFill} className="flex-row">
                <Pressable style={{ flex: 1 }} onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={() => handleTap("prev")} />
                <Pressable style={{ flex: 2 }} onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={() => handleTap("next")} />
              </View>

              {/* UI Overlay */}
              {!isHolding && (
                <View className="absolute top-0 w-full" style={{ paddingTop: insets.top + 2 }}>
                  {/* MULTIPLE PROGRESS BARS for the current user */}
                  <View className="flex-row px-2 mb-3">
                    {activeUser.items.map((_: any, i: number) => (
                      <View key={i} className="h-1 flex-1 mx-0.5 rounded-full overflow-hidden bg-white/30">
                        <View 
                          style={{ 
                            height: '100%', 
                            backgroundColor: 'white', 
                            width: i < activeStoryIndex ? '100%' : i === activeStoryIndex ? `${videoProgress * 100}%` : '0%' 
                          }} 
                        />
                      </View>
                    ))}
                  </View>

                  <View className="px-5 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Image source={{ uri: activeUser.user_image_url }} className="w-9 h-9 rounded-full border border-white/20" />
                      <Text className="ml-3 text-white font-bold">{activeUser.username}</Text>
                    </View>
                    <TouchableOpacity onPress={closeStoryViewer} className="bg-white/10 p-2 rounded-full">
                      <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { position: "absolute", right: 0, width: DRAWER_WIDTH + GRAB_ZONE_WIDTH, zIndex: 100 },
  drawerInner: { flex: 1, flexDirection: "row", width: DRAWER_WIDTH + GRAB_ZONE_WIDTH },
  handlePill: { width: GRAB_ZONE_WIDTH, justifyContent: "center", alignItems: "center" },
  pillTouchTarget: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center" },
});