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
import { Video, ResizeMode, Audio, AVPlaybackStatus } from "expo-av";
import { useApp } from "@/providers/AppProvider";
import { StoryRecorder } from "./story_recorder";
import { useRouter } from "expo-router";
import { QuickFeedback } from "./quickFeedback";
import * as Haptics from "expo-haptics";

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

  const [indices, setIndices] = useState<{ uIdx: number; sIdx: number } | null>(
    null
  );
  
  const [activePlayerIndex, setActivePlayerIndex] = useState<0 | 1>(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isReadyToLoadNext, setIsReadyToLoadNext] = useState(false);

  const videoARef = useRef<Video>(null);
  const videoBRef = useRef<Video>(null);
  const lastSeenStoryId = useRef<string | null>(null);
  const pressStartTime = useRef<number>(0);

  // --- AUDIO SETUP ---
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: false,
    }).catch((e) => console.warn("Audio Setup Failed", e));
  }, []);

  // --- DATA HELPERS ---
  const getStoryAt = useCallback((uIdx: number, sIdx: number) => 
    groupedUsers[uIdx]?.items[sIdx] || null, [groupedUsers]);

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

  const nextStory = nextIndices ? getStoryAt(nextIndices.uIdx, nextIndices.sIdx) : null;

  // --- NAVIGATION ---
  const closeStoryViewer = useCallback(() => {
    setIndices(null);
    setVideoProgress(0);
    setActivePlayerIndex(0);
    setIsHolding(false);
    refreshStories();
  }, [refreshStories]);

  const goToNext = useCallback(() => {
    if (nextIndices) {
      setActivePlayerIndex((prev) => (prev === 0 ? 1 : 0));
      setIndices(nextIndices);
      setVideoProgress(0);
      setIsReadyToLoadNext(false); 
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      closeStoryViewer();
    }
  }, [nextIndices, closeStoryViewer]);

  const goToPrev = useCallback(() => {
    if (!indices) return;
    const { uIdx, sIdx } = indices;
    
    if (sIdx > 0) {
      setIndices({ uIdx, sIdx: sIdx - 1 });
      setActivePlayerIndex((prev) => (prev === 0 ? 1 : 0));
    } else if (uIdx > 0) {
      const prevUserIdx = uIdx - 1;
      const prevUserStories = groupedUsers[prevUserIdx].items;
      setIndices({ uIdx: prevUserIdx, sIdx: prevUserStories.length - 1 });
      setActivePlayerIndex((prev) => (prev === 0 ? 1 : 0));
    } else {
      const ref = activePlayerIndex === 0 ? videoARef.current : videoBRef.current;
      ref?.replayAsync();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [indices, groupedUsers, activePlayerIndex]);


  // --- SIDE EFFECTS ---
  useEffect(() => {
    if (activeStory && activeStory.id !== lastSeenStoryId.current) {
      markStoryAsSeen(activeStory.id);
      lastSeenStoryId.current = activeStory.id;
    }
  }, [activeStory, markStoryAsSeen]);


  // --- PLAYBACK HANDLER ---
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus, isForActivePlayer: boolean) => {
    if (!status.isLoaded) return;

    if (isForActivePlayer) {
      const duration = status.durationMillis || 1;
      const position = status.positionMillis;
      setVideoProgress(position / duration);

      if (!isReadyToLoadNext && position > 500) {
        setIsReadyToLoadNext(true);
      }

      if (status.didJustFinish) {
        goToNext();
      }
    }
  };


  // --- GESTURES ---
  const handlePressIn = () => {
    pressStartTime.current = Date.now();
    setIsHolding(true);
    const ref = activePlayerIndex === 0 ? videoARef.current : videoBRef.current;
    ref?.pauseAsync();
  };
  const handlePressOut = () => {
    setIsHolding(false);
    const ref = activePlayerIndex === 0 ? videoARef.current : videoBRef.current;
    ref?.playAsync();
  };
  const handleTap = (direction: "next" | "prev") => {
    const dur = Date.now() - pressStartTime.current;
    if (dur < 200) {
      if (direction === "next") goToNext();
      else goToPrev();
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

  // --- SOURCE CALCULATION ---
  const sourceA = activePlayerIndex === 0 ? activeStory?.video_url : nextStory?.video_url;
  const sourceB = activePlayerIndex === 1 ? activeStory?.video_url : nextStory?.video_url;

  const shouldLoadBackground = isReadyToLoadNext;
  
  // DETERMINE IF WE SHOULD RENDER PLAYERS
  // We only render if we have a valid source string AND it is either active or ready to background load
  const shouldRenderA = (activePlayerIndex === 0 || shouldLoadBackground) && sourceA;
  const shouldRenderB = (activePlayerIndex === 1 || shouldLoadBackground) && sourceB;

  return (
    <>
      {isOpen && (
        <Pressable
          style={[StyleSheet.absoluteFill, { zIndex: 90 }]}
          onPress={() => animateDrawer(0)}
        />
      )}

      {/* DRAWER UI */}
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
                    setVideoProgress(0);
                    setActivePlayerIndex(0);
                    setIsReadyToLoadNext(false);
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

      {/* FULL SCREEN VIEWER */}
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
              {/* --- PLAYER A --- */}
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    zIndex: activePlayerIndex === 0 ? 1 : 0,
                    opacity: activePlayerIndex === 0 ? 1 : 0
                  },
                ]}
              >
                {shouldRenderA ? (
                  <Video
                    ref={videoARef}
                    source={{ uri: sourceA }}
                    style={StyleSheet.absoluteFill}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={activePlayerIndex === 0 && !isHolding}
                    isMuted={activePlayerIndex !== 0}
                    onPlaybackStatusUpdate={(s) => onPlaybackStatusUpdate(s, activePlayerIndex === 0)}
                    progressUpdateIntervalMillis={50}
                  />
                ) : null}
              </View>

              {/* --- PLAYER B --- */}
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    zIndex: activePlayerIndex === 1 ? 1 : 0,
                    opacity: activePlayerIndex === 1 ? 1 : 0
                  },
                ]}
              >
                {shouldRenderB ? (
                  <Video
                    ref={videoBRef}
                    source={{ uri: sourceB }}
                    style={StyleSheet.absoluteFill}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={activePlayerIndex === 1 && !isHolding}
                    isMuted={activePlayerIndex !== 1}
                    onPlaybackStatusUpdate={(s) => onPlaybackStatusUpdate(s, activePlayerIndex === 1)}
                    progressUpdateIntervalMillis={50}
                  />
                ) : null}
              </View>


              {/* CONTROLS LAYER */}
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