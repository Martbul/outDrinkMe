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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Animated components
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function MixTimeline() {
  const insets = useSafeAreaInsets();
  const { userData, mixTimelineData } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  // Format timestamp to readable format
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

      {/* Expanded Detail Modal */}
      <Modal
        visible={expandedId !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setExpandedId(null)}
      >
        <View className="flex-1 bg-black/95">
          <ScrollView
            contentContainerStyle={{
              paddingTop: insets.top + 20,
              paddingBottom: insets.bottom + 20,
              paddingHorizontal: 16,
            }}
          >
            {expandedItem && (
              <Animated.View
                entering={ZoomIn.duration(400).springify()}
                className="bg-[#0a0a0a] rounded-3xl overflow-hidden border border-orange-600"
              >
                {/* Close Button */}
                <Animated.View
                  entering={FadeIn.delay(200).duration(300)}
                  className="absolute top-4 right-4 z-20"
                >
                  <TouchableOpacity
                    onPress={() => setExpandedId(null)}
                    className="bg-white/10 p-2 rounded-full"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-outline" size={24} color="white" />
                  </TouchableOpacity>
                </Animated.View>

                {/* Full Image */}
                <Animated.View
                  entering={FadeInDown.delay(100).duration(400)}
                  className="p-4 pb-0"
                >
                  <View className="rounded-2xl overflow-hidden">
                    <Image
                      source={{ uri: expandedItem.imageUrl }}
                      style={{
                        width: "100%",
                        aspectRatio: 4 / 3,
                      }}
                      resizeMode="cover"
                    />
                  </View>
                </Animated.View>

                {/* Details */}
                <Animated.View
                  entering={FadeInDown.delay(200).duration(400)}
                  className="p-6 space-y-4"
                >
                  {/* User Info */}
                  <View className="flex-row items-center gap-3 mb-4">
                    <Animated.Image
                      entering={ZoomIn.delay(300).duration(400)}
                      source={{ uri: expandedItem.userImageUrl }}
                      className="w-12 h-12 rounded-full border-2 border-orange-600"
                    />
                    <Animated.View
                      entering={FadeInLeft.delay(350).duration(400)}
                    >
                      <Text className="text-white font-bold">
                        {userData?.username}
                      </Text>
                      <Text className="text-white/50 text-sm">
                        {formatTime(expandedItem.loggedAt)}
                      </Text>
                    </Animated.View>
                  </View>

                  {expandedItem.mentionedBuddies.length > 0 && (
                    <Animated.View
                      entering={FadeInDown.delay(400).duration(400)}
                      className="bg-white/[0.05] rounded-xl p-3"
                    >
                      <View className="flex-row items-center gap-2 mb-3">
                        <FontAwesome5 name="user" size={24} color="white" />
                        <Text className="text-white/50 text-xs font-semibold">
                          WITH BUDDIES
                        </Text>
                      </View>
                      <View className="flex-row flex-wrap gap-2">
                        {expandedItem.mentionedBuddies.map((buddy, idx) => (
                          <Animated.View
                            key={buddy.id}
                            entering={FadeIn.delay(450 + idx * 50).duration(
                              300
                            )}
                            className="flex-row items-center gap-2 bg-white/[0.05] rounded-full pl-1 pr-3 py-1"
                          >
                            <Image
                              source={{ uri: buddy.imageUrl }}
                              className="w-6 h-6 rounded-full"
                            />
                            <Text className="text-white text-sm font-medium">
                              {buddy.firstName}
                            </Text>
                          </Animated.View>
                        ))}
                      </View>
                    </Animated.View>
                  )}
                </Animated.View>
              </Animated.View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
