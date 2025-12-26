import React, { useRef, useState, useEffect } from "react";
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
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const DRAWER_WIDTH = width * 0.22;
const GRAB_ZONE_WIDTH = 50;
const DRAWER_HEIGHT = height * 0.55;

export default function StoryDrawer() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { userData, stories: groupedUsers, markStoryAsSeen, refreshStories } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);

  const [activeUserIndex, setActiveUserIndex] = useState<number | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  const [isHolding, setIsHolding] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const pressStartTime = useRef<number>(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const activeUser =
    activeUserIndex !== null ? groupedUsers[activeUserIndex] : null;
  const activeStory = activeUser ? activeUser.items[activeStoryIndex] : null;

  const player = useVideoPlayer(activeStory?.video_url || null, (p) => {
    p.loop = false;
    p.play();
  });

  const closeStoryViewer = () => {
    setActiveUserIndex(null);
    setActiveStoryIndex(0);
    setIsHolding(false);
    refreshStories();
  };

  const handleNext = () => {
    if (!activeUser) return;
    if (activeStoryIndex < activeUser.items.length - 1) {
      setActiveStoryIndex((prev) => prev + 1);
    } else if (
      activeUserIndex !== null &&
      activeUserIndex < groupedUsers.length - 1
    ) {
      setActiveUserIndex((prev) => (prev !== null ? prev + 1 : null));
      setActiveStoryIndex(0);
    } else {
      closeStoryViewer();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePrev = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex((prev) => prev - 1);
    } else if (activeUserIndex !== null && activeUserIndex > 0) {
      const prevIdx = activeUserIndex - 1;
      setActiveUserIndex(prevIdx);
      setActiveStoryIndex(groupedUsers[prevIdx].items.length - 1);
    } else {
      try {
        player.currentTime = 0;
        player.play();
      } catch (e) {}
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        if (player && player.duration > 0 && !isHolding) {
          setVideoProgress(player.currentTime / player.duration);
        }
      } catch (e) {}
    }, 16);
    return () => clearInterval(interval);
  }, [player, isHolding]);

  useEffect(() => {
    async function updateVideoSource() {
      if (activeStory?.video_url && player) {
        try {
          setVideoProgress(0);
          await player.replaceAsync(activeStory.video_url);
          player.play();
          markStoryAsSeen(activeStory.id);
        } catch (e) {}
      }
    }
    updateVideoSource();
  }, [activeStoryIndex, activeUserIndex, player]);

  useEffect(() => {
    const sub = player.addListener("playToEnd", () => {
      handleNext();
    });
    return () => sub.remove();
  }, [player, activeStoryIndex, activeUserIndex, groupedUsers]);

  const handlePressIn = () => {
    pressStartTime.current = Date.now();
    setIsHolding(true);
    try {
      player.pause();
    } catch (e) {}
  };

  const handlePressOut = () => {
    setIsHolding(false);
    try {
      player.play();
    } catch (e) {}
  };

  const handleTap = (direction: "next" | "prev") => {
    const duration = Date.now() - pressStartTime.current;
    if (duration < 200) {
      if (direction === "next") handleNext();
      else handlePrev();
    }
  };

  const animateDrawer = (toValue: number) => {
    const opening = toValue === 1;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (opening) setIsOpen(true);

    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start(() => {
      if (!opening) setIsOpen(false);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 5,
      onPanResponderMove: (_, gesture) => {
        let move = isOpen
          ? 1 + gesture.dx / DRAWER_WIDTH
          : -gesture.dx / DRAWER_WIDTH;
        if (move < 0) move = 0;
        if (move > 1) move = 1;
        slideAnim.setValue(move);

        if (!isOpen && move > 0) setIsOpen(true);
      },
      onPanResponderRelease: (_, gesture) => {
        const currentVal = (slideAnim as any)._value;
        if (currentVal > 0.5 || gesture.vx < -0.5) {
          animateDrawer(1);
        } else {
          animateDrawer(0);
        }
      },
    })
  ).current;

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [DRAWER_WIDTH, 0],
  });

  const scaleY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
    extrapolate: "clamp",
  });

  const verticalMargin = (height - DRAWER_HEIGHT) / 2;

  return (
    <>
      {/* 
        Transparent Overlay: 
        No visual opacity, but catches touches to close the drawer.
      */}
      {isOpen && (
        <Pressable
          style={[StyleSheet.absoluteFill, { zIndex: 90 }]}
          onPress={() => animateDrawer(0)}
        />
      )}

      <View
        style={[
          styles.mainWrapper,
          {
            top: verticalMargin,
            height: DRAWER_HEIGHT,
          },
        ]}
        pointerEvents="box-none"
      >
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.drawerInner,
            {
              transform: [{ translateX }, { scaleY }],
            },
          ]}
        >
          <View style={styles.handlePill}>
            <TouchableOpacity
              onPress={() => animateDrawer(isOpen ? 0 : 1)}
              style={styles.pillTouchTarget}
            >
              <View className="w-1.5 h-12 bg-white/30 rounded-full" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 bg-zinc-900/95 rounded-l-[32px] border-l border-y border-white/10 shadow-2xl overflow-hidden">
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ alignItems: "center", paddingTop: 30 }}
            >
              <TouchableOpacity
                onPress={() => {
                  animateDrawer(0);
                  setIsRecordingModalOpen(true);
                }}
                className="w-12 h-12 rounded-full border border-dashed border-orange-600/30 items-center justify-center mb-8"
              >
                <Ionicons name="add" size={26} color="#EA580C" />
              </TouchableOpacity>

              {groupedUsers.map((userGroup, index) => (
                <TouchableOpacity
                  key={userGroup.user_id}
                  onPress={() => {
                    animateDrawer(0);
                    setActiveUserIndex(index);
                    setActiveStoryIndex(0);
                  }}
                  className="mb-6 items-center"
                >
                  <View
                    className={`p-[2px] rounded-full ${
                      !userGroup.all_seen
                        ? "border-2 border-orange-600"
                        : "border border-white/10"
                    }`}
                  >
                    <Image
                      source={{ uri: userGroup.user_image_url }}
                      className={`w-10 h-10 rounded-full ${
                        userGroup.all_seen ? "opacity-50" : "opacity-100"
                      }`}
                    />
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

      <Modal
        visible={activeUserIndex !== null}
        animationType="fade"
        transparent
        onRequestClose={closeStoryViewer}
        statusBarTranslucent={true}
      >
        <View className="flex-1 bg-black">
          <StatusBar barStyle="light-content" backgroundColor="transparent" />

          {activeUser && (
            <>
              <VideoView
                player={player}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                nativeControls={false}
              />

              <View style={StyleSheet.absoluteFill} className="flex-row">
                <Pressable
                  style={{ flex: 1 }}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={() => handleTap("prev")}
                />
                <Pressable
                  style={{ flex: 2 }}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={() => handleTap("next")}
                />
              </View>

              {!isHolding && (
                <>
                  <View
                    className="absolute top-0 w-full"
                    style={{ paddingTop: insets.top + 10 }}
                  >
                    <View className="flex-row px-2">
                      {activeUser.items.map((story, i: number) => (
                        <View
                          key={story.id}
                          className="h-1 flex-1 mt-8 mx-0.5 rounded-full overflow-hidden bg-white/30"
                        >
                          <View
                            style={{
                              height: "100%",
                              backgroundColor: "white",
                              width:
                                i < activeStoryIndex
                                  ? "100%"
                                  : i === activeStoryIndex
                                  ? `${videoProgress * 100}%`
                                  : "0%",
                            }}
                          />
                        </View>
                      ))}
                    </View>
                  </View>

                  <View
                    className="absolute right-5 flex-row items-center"
                    style={{ bottom: insets.bottom + 40 }}
                  >
                    <View className="items-end mr-3">
                      <Text className="text-white font-bold text-lg shadow-black shadow-lg">
                        {activeUser.username}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        closeStoryViewer();

                        if (userData && userData.id === activeUser.user_id) {
                          router.push(`/(screens)/userInfo`);
                        } else {
                          router.push(
                            `/(screens)/userInfo?userId=${activeUser.user_id}`
                          );
                        }
                      }}
                      className="p-1 bg-white/10 rounded-full border border-white/20"
                    >
                      <Image
                        source={{ uri: activeUser.user_image_url }}
                        className="w-12 h-12 rounded-full"
                      />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    position: "absolute",
    right: 0,
    width: DRAWER_WIDTH + GRAB_ZONE_WIDTH,
    zIndex: 100,
  },
  drawerInner: {
    flex: 1,
    flexDirection: "row",
    width: DRAWER_WIDTH + GRAB_ZONE_WIDTH,
  },
  handlePill: {
    width: GRAB_ZONE_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  pillTouchTarget: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
