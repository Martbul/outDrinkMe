import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
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
import { QuickFeedback } from "./quickFeedback";

const { width, height } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.22;
const GRAB_ZONE_WIDTH = 50;
const DRAWER_HEIGHT = height * 0.55;

export default function StoryDrawer() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    userData,
    stories: groupedUsers,
    markStoryAsSeen,
    refreshStories,
  } = useApp();

  // --- UI STATE ---
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "xp" | "level";
  }>({ visible: false, message: "", type: "success" });
  
  const showFeedback = (message: string, type: any = "success") =>
    setFeedback({ visible: true, message, type });

  // --- LOGIC STATE ---
  const [indices, setIndices] = useState<{ uIdx: number; sIdx: number } | null>(null);
  const [stepCounter, setStepCounter] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  
  // Use REF for preloaded flag to avoid re-rendering the UI during playback
  const hasPreloaded = useRef(false);
  
  // Use REF to prevent infinite "Seen" API loops
  const lastSeenStoryId = useRef<string | null>(null);
  
  const pressStartTime = useRef<number>(0);

  // --- DATA HELPERS ---
  const getStoryAt = (uIdx: number, sIdx: number) =>
    groupedUsers[uIdx]?.items[sIdx] || null;
    
  const activeStory = indices ? getStoryAt(indices.uIdx, indices.sIdx) : null;
  const activeUser = indices ? groupedUsers[indices.uIdx] : null;

  const nextIndices = useMemo(() => {
    if (!indices) return null;
    const { uIdx, sIdx } = indices;
    const user = groupedUsers[uIdx];
    if (sIdx < user.items.length - 1) return { uIdx, sIdx: sIdx + 1 };
    else if (uIdx < groupedUsers.length - 1) return { uIdx: uIdx + 1, sIdx: 0 };
    return null;
  }, [indices, groupedUsers]);

  const nextStory = nextIndices
    ? getStoryAt(nextIndices.uIdx, nextIndices.sIdx)
    : null;

  // --- PLAYERS ---
  const playerA = useVideoPlayer(null, (p) => { p.loop = false; });
  const playerB = useVideoPlayer(null, (p) => { p.loop = false; });

  const isStepEven = stepCounter % 2 === 0;
  const currentPlayer = isStepEven ? playerA : playerB;
  const backgroundPlayer = isStepEven ? playerB : playerA;

  // Track sources manually to prevent re-renders
  const sourceRefA = useRef<string | null>(null);
  const sourceRefB = useRef<string | null>(null);
  const currentSourceRef = isStepEven ? sourceRefA : sourceRefB;
  const backgroundSourceRef = isStepEven ? sourceRefB : sourceRefA;

  // --- 1. SETUP ACTIVE STORY ---
  useEffect(() => {
    if (!indices || !activeStory) {
      try {
        playerA.pause();
        playerB.pause();
      } catch (e) {}
      return;
    }

    // FIX: PREVENT INFINITE LOOP
    // Only mark as seen if we haven't already marked THIS specific story ID in this session
    if (activeStory.id !== lastSeenStoryId.current) {
        markStoryAsSeen(activeStory.id);
        lastSeenStoryId.current = activeStory.id;
    }

    // Reset preload flag for the new story
    hasPreloaded.current = false;

    try {
      // Load active video if needed
      if (currentSourceRef.current !== activeStory.video_url) {
        // console.log("Loading Active:", activeStory.id);
        currentPlayer.replace(activeStory.video_url);
        currentSourceRef.current = activeStory.video_url;
        currentPlayer.currentTime = 0;
      }

      // AGGRESSIVE CLEANUP: Ensure background player is empty/paused initially
      if (backgroundSourceRef.current) {
        backgroundPlayer.replace(null);
        backgroundSourceRef.current = null;
      }

      currentPlayer.play();
    } catch (e) {
      console.log("Player Error: " + e);
    }
  }, [
    indices,
    stepCounter,
    // activeStory.id and video_url are the only things that matter for triggers
    activeStory?.id, 
    activeStory?.video_url
  ]);


  // --- 2. TRIGGER PRELOAD ---
  // Using useCallback to keep the reference stable for the interval
  const triggerPreload = useCallback(() => {
    if (hasPreloaded.current || !nextStory) return;

    // console.log("Triggering Preload for:", nextStory.id);
    try {
      if (backgroundSourceRef.current !== nextStory.video_url) {
        backgroundPlayer.replace(nextStory.video_url);
        backgroundSourceRef.current = nextStory.video_url;
        backgroundPlayer.currentTime = 0;
        backgroundPlayer.pause();
      }
      hasPreloaded.current = true;
    } catch (e) {
      console.log("Preload Error: " + e);
    }
  }, [backgroundPlayer, backgroundSourceRef, nextStory]); // Deps are stable


  // --- 3. PROGRESS LOOP & AUTO-FIXER ---
  const [videoProgress, setVideoProgress] = useState(0);

  useEffect(() => {
    if (!indices) return;

    const interval = setInterval(() => {
      try {
        if (currentPlayer && !isHolding) {
          const dur = currentPlayer.duration;
          const curr = currentPlayer.currentTime;

          // Update UI
          if (dur > 0 && curr >= 0) setVideoProgress(curr / dur);

          // --- SMART PRELOAD TRIGGER ---
          // Only load the next video if the current one has successfully
          // played for 0.5 seconds.
          if (!hasPreloaded.current && curr > 0.5 && dur > 2) {
            triggerPreload();
          }

          // --- SAFETY KICK ---
          // If supposed to be playing but isn't
          if (!currentPlayer.playing && currentPlayer.status === "readyToPlay") {
            if (curr < 0.2) currentPlayer.play();
          }
        }
      } catch (e) {
         // Silently fail logic updates
      }
    }, 50);

    return () => clearInterval(interval);
  }, [
    currentPlayer,
    isHolding,
    indices,
    nextStory,
    triggerPreload,
  ]);


  // --- NAVIGATION ---
  const closeStoryViewer = useCallback(() => {
    try {
      playerA.replace(null);
      playerB.replace(null);
      sourceRefA.current = null;
      sourceRefB.current = null;
    } catch (e) {}
    
    setIndices(null);
    setStepCounter(0);
    setIsHolding(false);
    refreshStories();
  }, [playerA, playerB, refreshStories]); // Removed refs from deps

  const handleNext = useCallback(() => {
    if (!indices) return;

    if (nextIndices) {
      setStepCounter((prev) => prev + 1);
      setIndices(nextIndices);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      closeStoryViewer();
    }
  }, [closeStoryViewer, indices, nextIndices]);


  // --- 4. END DETECTION ---
  useEffect(() => {
    if (!indices) return;
    const sub = currentPlayer.addListener("playToEnd", () => {
      // Prevents premature skipping if event fires at 0:00
      if (currentPlayer.currentTime > 0.5 || currentPlayer.duration < 1) {
        handleNext();
      }
    });
    return () => sub.remove();
  }, [currentPlayer, indices, handleNext]);


  // --- MANUAL NAVIGATION ---
  const handlePrev = () => {
    if (!indices) return;
    const { uIdx, sIdx } = indices;

    const forceReload = (url: string) => {
      currentPlayer.replace(url);
      currentSourceRef.current = url;
      currentPlayer.currentTime = 0;
      currentPlayer.play();
    };

    if (sIdx > 0) {
      const prevStory = groupedUsers[uIdx].items[sIdx - 1];
      forceReload(prevStory.video_url);
      setIndices({ uIdx, sIdx: sIdx - 1 });
    } else if (uIdx > 0) {
      const prevUserIdx = uIdx - 1;
      const prevUserStories = groupedUsers[prevUserIdx].items;
      const lastStory = prevUserStories[prevUserStories.length - 1];
      forceReload(lastStory.video_url);
      setIndices({ uIdx: prevUserIdx, sIdx: prevUserStories.length - 1 });
    } else {
      try {
        currentPlayer.currentTime = 0;
        currentPlayer.play();
      } catch (e) {}
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // --- GESTURES ---
  const handlePressIn = () => {
    pressStartTime.current = Date.now();
    setIsHolding(true);
    try { currentPlayer.pause(); } catch (e) {}
  };
  const handlePressOut = () => {
    setIsHolding(false);
    try { currentPlayer.play(); } catch (e) {}
  };
  const handleTap = (direction: "next" | "prev") => {
    if (Date.now() - pressStartTime.current < 200) {
      if (direction === "next") handleNext();
      else handlePrev();
    }
  };

  // --- DRAWER ANIMATION ---
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
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5,
      onPanResponderMove: (_, g) => {
        let move = isOpen ? 1 + g.dx / DRAWER_WIDTH : -g.dx / DRAWER_WIDTH;
        if (move < 0) move = 0;
        if (move > 1) move = 1;
        slideAnim.setValue(move);
        if (!isOpen && move > 0) setIsOpen(true);
      },
      onPanResponderRelease: (_, g) => {
        if ((slideAnim as any)._value > 0.5 || g.vx < -0.5) animateDrawer(1);
        else animateDrawer(0);
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
      {isOpen && (
        <Pressable
          style={[StyleSheet.absoluteFill, { zIndex: 90 }]}
          onPress={() => animateDrawer(0)}
        />
      )}

      <View
        style={[
          styles.mainWrapper,
          { top: verticalMargin, height: DRAWER_HEIGHT },
        ]}
        pointerEvents="box-none"
      >
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.drawerInner,
            { transform: [{ translateX }, { scaleY }] },
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

              {groupedUsers.map((userGroup, i) => (
                <TouchableOpacity
                  key={userGroup.user_id}
                  onPress={() => {
                    animateDrawer(0);
                    setIndices({ uIdx: i, sIdx: 0 });
                    setStepCounter(0);
                    try {
                      playerA.replace(null);
                      playerB.replace(null);
                      sourceRefA.current = null;
                      sourceRefB.current = null;
                    } catch (e) {}
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

      <QuickFeedback
        visible={feedback.visible}
        message={feedback.message}
        type={feedback.type}
        onHide={() => setFeedback((f) => ({ ...f, visible: false }))}
      />

      <Modal visible={isRecordingModalOpen} animationType="slide">
        <StoryRecorder
          onClose={() => setIsRecordingModalOpen(false)}
          showFeedback={showFeedback}
        />
      </Modal>

      <Modal
        visible={indices !== null}
        animationType="fade"
        transparent
        onRequestClose={closeStoryViewer}
        statusBarTranslucent={true}
      >
        <View className="flex-1 bg-black">
          <StatusBar barStyle="light-content" backgroundColor="transparent" />

          {indices && activeStory && (
            <>
              {/* VIDEO LAYERS */}
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { zIndex: isStepEven ? 1 : 0 },
                ]}
              >
                <VideoView
                  player={playerA}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  nativeControls={false}
                />
              </View>

              <View
                style={[
                  StyleSheet.absoluteFill,
                  { zIndex: !isStepEven ? 1 : 0 },
                ]}
              >
                <VideoView
                  player={playerB}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  nativeControls={false}
                />
              </View>

              {/* FALLBACK IMG */}
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    zIndex: -1,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Image
                  source={{ uri: activeUser?.user_image_url }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    opacity: 0.3,
                  }}
                />
              </View>

              {/* CONTROLS */}
              <View
                style={[StyleSheet.absoluteFill, { zIndex: 10 }]}
                className="flex-row"
              >
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

              {/* UI OVERLAY */}
              {!isHolding && (
                <View style={{ flex: 1, zIndex: 20 }} pointerEvents="box-none">
                  {/* Progress Bars */}
                  <View
                    className="absolute top-0 w-full"
                    style={{ paddingTop: insets.top + 10 }}
                  >
                    <View className="flex-row px-2">
                      {activeUser?.items.map((story, i) => (
                        <View
                          key={story.id}
                          className="h-1 flex-1 mt-8 mx-0.5 rounded-full overflow-hidden bg-white/30"
                        >
                          <View
                            style={{
                              height: "100%",
                              backgroundColor: "white",
                              width:
                                i < indices.sIdx
                                  ? "100%"
                                  : i === indices.sIdx
                                  ? `${videoProgress * 100}%`
                                  : "0%",
                            }}
                          />
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Header */}
                  <View
                    className="absolute right-5 flex-row items-center"
                    style={{ bottom: insets.bottom + 40 }}
                  >
                    <View className="items-end mr-3">
                      <Text className="text-white font-bold text-lg shadow-black shadow-lg">
                        {activeUser?.username}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        closeStoryViewer();
                        if (userData?.id === activeUser?.user_id)
                          router.push(`/(screens)/userInfo`);
                        else
                          router.push(
                            `/(screens)/userInfo?userId=${activeUser?.user_id}`
                          );
                      }}
                      className="p-1 bg-white/10 rounded-full border border-white/20"
                    >
                      <Image
                        source={{ uri: activeUser?.user_image_url }}
                        className="w-12 h-12 rounded-full"
                      />
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