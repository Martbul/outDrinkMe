import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useApp } from "@/providers/AppProvider";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import NestedScreenHeader from "@/components/nestedScreenHeader";
import MixPostModal from "@/components/mixPostModal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Animated components
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function MixTimeline() {
  const insets = useSafeAreaInsets();
  const { mixTimelineData } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 1. NEW: State to hold the dynamic aspect ratio of the expanded image
  const [currentAspectRatio, setCurrentAspectRatio] = useState(4 / 3);

  // Pulse animation for badges
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };



  // Calculate time ago
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return "Just now";
  };

  const expandedItem = mixTimelineData.find((item) => item.id === expandedId);

  // 2. NEW: Calculate image size whenever the expanded item changes
  useEffect(() => {
    if (expandedItem?.imageUrl) {
      Image.getSize(
        expandedItem.imageUrl,
        (width, height) => {
          if (width && height) {
            setCurrentAspectRatio(width / height);
          }
        },
        (error) => console.log("Failed to get size", error)
      );
    } else {
      // Reset to default if closed
      setCurrentAspectRatio(4 / 3);
    }
  }, [expandedItem]);

  // Calculate heights for the curved line
  const imageHeight = (SCREEN_WIDTH - 32) * 0.7 * (3 / 4); // 70% width with 4:3 ratio
  const spacing = 40; // Space between images

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <NestedScreenHeader heading="Timeline" secondaryHeading="MIX" />
      <ScrollView
        className="flex-1 px-4 mt-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {mixTimelineData.length === 0 ? (
          <Animated.View
            entering={FadeInDown.duration(600).springify()}
            className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center mb-4"
          >
            <Text className="text-white text-xl font-black mb-2">
              Start Your Journey
            </Text>
            <Text className="text-white/50 text-sm text-center font-semibold">
              Share your first drink moment to begin building your drinking
              timeline
            </Text>
          </Animated.View>
        ) : (
          <View className="relative">
            {mixTimelineData.map((item, index) => {
              const isLeft = index % 2 === 0;
              const imageWidth = (SCREEN_WIDTH - 32) * 0.7;
              const delay = index * 100; // Stagger animations

              return (
                <Animated.View
                  key={item.id}
                  entering={
                    isLeft
                      ? FadeInLeft.delay(delay).duration(500).springify()
                      : FadeInRight.delay(delay).duration(500).springify()
                  }
                  className="mb-8 relative"
                  style={{ marginBottom: spacing }}
                >
                  {/* Date Badge */}
                  <Animated.View
                    entering={ZoomIn.delay(delay + 200).duration(400)}
                    className="absolute z-10"
                    style={{
                      left: isLeft
                        ? imageWidth * 0.05
                        : (SCREEN_WIDTH - 32) * 0.3 + imageWidth * 0.05,
                      top: 0,
                    }}
                  >
                    <Animated.View
                      style={pulseStyle}
                      className="bg-orange-600 px-3 py-1 rounded-full"
                    >
                      <Text className="text-black text-xs font-bold">
                        {formatDate(item.date)}
                      </Text>
                    </Animated.View>
                  </Animated.View>

                  {/* Image Preview */}
                  <View
                    style={{
                      marginTop: 36,
                      marginLeft: isLeft ? 0 : (SCREEN_WIDTH - 32) * 0.3,
                    }}
                  >
                    <AnimatedTouchable
                      onPress={() => setExpandedId(item.id)}
                      activeOpacity={0.7}
                      className="relative"
                      entering={FadeIn.delay(delay + 100).duration(500)}
                    >
                      {/* Outer glow effect */}
                      <View className="absolute -inset-1 rounded-[18px] blur-xl" />

                      <Animated.View
                        className="relative rounded-2xl overflow-hidden border-2 border-orange-600 bg-black"
                        style={{
                          width: imageWidth,
                          shadowColor: "#ea580c",
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: 0.3,
                          shadowRadius: 16,
                          elevation: 10,
                        }}
                      >
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={{
                            width: imageWidth,
                            aspectRatio: 4 / 3,
                          }}
                          resizeMode="cover"
                        />

                        {/* Multi-layer gradient overlay */}
                        <View className="absolute inset-0">
                          <View className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
                          <View className="absolute inset-0 bg-gradient-to-br from-orange-900/10 via-transparent to-transparent" />
                        </View>

                        {/* Bottom info section */}
                        <View className="absolute bottom-0 left-0 right-0 p-3">
                          <View className="flex-row items-center justify-between">
                            {/* Time Ago Badge */}
                            <Animated.View
                              entering={FadeIn.delay(delay + 300).duration(400)}
                              className="bg-white/10 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/20"
                            >
                              <Text className="text-white text-xs font-bold">
                                {getTimeAgo(item.loggedAt)}
                              </Text>
                            </Animated.View>

                            {/* Buddies indicator */}
                            {item.mentionedBuddies.length > 0 && (
                              <Animated.View
                                entering={FadeIn.delay(delay + 350).duration(
                                  400
                                )}
                                className="flex-row items-center gap-1 bg-white/10 backdrop-blur-xl px-2.5 py-1.5 rounded-full border border-white/20"
                              >
                                <FontAwesome5
                                  name="users"
                                  size={10}
                                  color="white"
                                />
                                <Text className="text-white text-xs font-bold">
                                  {item.mentionedBuddies.length}
                                </Text>
                              </Animated.View>
                            )}
                          </View>
                        </View>

                        {/* Tap to expand hint */}
                        <Animated.View
                          entering={FadeIn.delay(delay + 400).duration(400)}
                          className="absolute top-3 right-3 bg-black/40 backdrop-blur-xl p-1.5 rounded-full border border-white/20"
                        >
                          <Ionicons
                            name="expand-outline"
                            size={14}
                            color="white"
                          />
                        </Animated.View>
                      </Animated.View>
                    </AnimatedTouchable>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <MixPostModal
        expandedItem={expandedItem}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        currentAspectRatio={currentAspectRatio} 
      />
    </View>
  );
}
