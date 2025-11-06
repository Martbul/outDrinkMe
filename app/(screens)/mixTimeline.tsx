import React, { useState } from "react";
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
import SecondaryHeader from "@/components/secondaryHeader";
import { useApp } from "@/providers/AppProvider";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function MixTimeline() {
  const insets = useSafeAreaInsets();
  const { mixTimelineData } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      <SecondaryHeader title="Mix Timeline" />

      {/* Hero Section */}
      {/* <View className="px-4 pb-2">
        <View className="bg-white/[0.03] rounded-2xl p-5 border border-[#00d4ff]/30">
          <Text className="text-[#00d4ff] text-[11px] font-bold tracking-widest mb-2">
            YOUR DRINK DNA
          </Text>
          <Text className="text-white text-[24px] font-black mb-1">
            Beverage Timeline
          </Text>
          <Text className="text-white/50 text-sm font-semibold">
            Every drink tells your story
          </Text>
        </View>
      </View> */}

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {mixTimelineData.length === 0 ? (
          <View className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center mb-4">
            <Text className="text-white text-xl font-black mb-2">
              Start Your Journey
            </Text>
            <Text className="text-white/50 text-sm text-center font-semibold">
              Share your first drink moment to begin building your drinking DNA
              timeline
            </Text>
          </View>
        ) : (
          <View className="relative">
            {/* Curved Swerving Line */}
            <View
              className="absolute top-0 left-0 right-0"
              style={{
                height: (imageHeight + spacing) * mixTimelineData.length,
              }}
            >
              {/* <Svg
                width={SCREEN_WIDTH - 32}
                height={(imageHeight + spacing) * mixTimelineData.length}
              >
                <Path
                  d={mixTimelineData
                    .map((_, index) => {
                      const isLeft = index % 2 === 0;
                      const y = index * (imageHeight + spacing) + 30;
                      const nextY = (index + 1) * (imageHeight + spacing) + 30;
                      const x = isLeft
                        ? (SCREEN_WIDTH - 32) * 0.15
                        : (SCREEN_WIDTH - 32) * 0.85;
                      const nextX = !isLeft
                        ? (SCREEN_WIDTH - 32) * 0.15
                        : (SCREEN_WIDTH - 32) * 0.85;

                      if (index === 0) {
                        return `M ${x} ${y}`;
                      }

                      const controlY = y + (nextY - y) / 2;
                      return `Q ${x} ${controlY}, ${nextX} ${nextY}`;
                    })
                    .join(" ")}
                  stroke="#00d4ff"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.3"
                />
              </Svg> */}
            </View>

            {mixTimelineData.map((item, index) => {
              const isLeft = index % 2 === 0;
              const imageWidth = (SCREEN_WIDTH - 32) * 0.7;

              return (
                <View
                  key={item.id}
                  className="mb-8 relative"
                  style={{ marginBottom: spacing }}
                >
                  {/* Date Badge */}
                  <View
                    className="absolute z-10"
                    style={{
                      left: isLeft
                        ? imageWidth * 0.05
                        : (SCREEN_WIDTH - 32) * 0.3 + imageWidth * 0.05,
                      top: 0,
                    }}
                  >
                    <View className="bg-orange-600 px-3 py-1 rounded-full">
                      <Text className="text-black text-xs font-bold">
                        {formatDate(item.date)}
                      </Text>
                    </View>
                  </View>

                  {/* Image Preview */}
                  <View
                    style={{
                      marginTop: 36,
                      marginLeft: isLeft ? 0 : (SCREEN_WIDTH - 32) * 0.3,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setExpandedId(item.id)}
                      activeOpacity={0.7}
                      className="relative"
                    >
                      <View
                        className="relative rounded-2xl overflow-hidden border-2 border-orange-600"
                        style={{
                          width: imageWidth,
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

                        {/* Gradient Overlay */}
                        <View className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Time Ago Badge */}
                        <View className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded-full">
                          <Text className="text-white text-xs font-semibold">
                            {getTimeAgo(item.loggedAt)}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
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
              <View className="bg-[#0a0a0a] rounded-3xl overflow-hidden border border-[#00d4ff]/30">
                {/* Close Button */}
                <View className="absolute top-4 right-4 z-20">
                  <TouchableOpacity
                    onPress={() => setExpandedId(null)}
                    className="bg-white/10 p-2 rounded-full"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-outline" size={24} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Full Image */}
                <View className="p-4 pb-0">
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
                </View>

                {/* Details */}
                <View className="p-6 space-y-4">
                  {/* User Info */}
                  <View className="flex-row items-center gap-3 mb-4">
                    <Image
                      source={{ uri: expandedItem.userImageUrl }}
                      className="w-12 h-12 rounded-full border-2 border-[#00d4ff]"
                    />
                    <View>
                      <Text className="text-white font-bold">
                        {expandedItem.sourceType === "friend"
                          ? "Friend"
                          : "Community"}
                      </Text>
                      <Text className="text-white/50 text-sm">
                        {formatTime(expandedItem.loggedAt)}
                      </Text>
                    </View>
                  </View>

                  {/* Mentioned Buddies */}
                  {expandedItem.mentionedBuddies.length > 0 && (
                    <View className="bg-white/[0.05] rounded-xl p-3 mb-3">
                      <View className="flex-row items-center gap-2 mb-3">
                        <FontAwesome5 name="user" size={24} color="white" />
                        <Text className="text-white/50 text-xs font-semibold">
                          WITH BUDDIES
                        </Text>
                      </View>
                      <View className="flex-row flex-wrap gap-2">
                        {expandedItem.mentionedBuddies.map((buddy) => (
                          <View
                            key={buddy.id}
                            className="flex-row items-center gap-2 bg-white/[0.05] rounded-full pl-1 pr-3 py-1"
                          >
                            <Image
                              source={{ uri: buddy.imageUrl }}
                              className="w-6 h-6 rounded-full"
                            />
                            <Text className="text-white text-sm font-medium">
                              {buddy.firstName}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Status Badge */}
                  <View className="pt-2">
                    <View
                      className={`self-start px-4 py-2 rounded-full ${
                        expandedItem.drankToday
                          ? "bg-[#00d4ff]/20 border border-[#00d4ff]/40"
                          : "bg-white/[0.05] border border-white/10"
                      }`}
                    >
                      <Text
                        className={`text-sm font-bold ${
                          expandedItem.drankToday
                            ? "text-[#00d4ff]"
                            : "text-white/50"
                        }`}
                      >
                        {expandedItem.drankToday
                          ? "🍹 Drank Today"
                          : "📅 Logged"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
