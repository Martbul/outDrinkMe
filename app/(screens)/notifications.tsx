import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useApp } from "@/providers/AppProvider";
import { NotificationItem } from "@/types/api.types";
import { NestedScreenHeader } from "@/components/nestedScreenHeader";
import { PRIMARY_ORANGE } from "@/utils/constants";


const CompactSegmentedControl = ({
  selected,
  onSelect,
  badges,
}: {
  selected: "unread" | "all";
  onSelect: (val: "unread" | "all") => void;
  badges?: { unread?: number };
}) => {
  return (
    <View className="mx-16 mb-4 mt-2 h-10 bg-white/[0.03] rounded-full border border-white/[0.08] p-1 flex-row relative">
      <TouchableOpacity
        onPress={() => onSelect("unread")}
        className={`flex-1 items-center justify-center rounded-full flex-row ${
          selected === "unread" ? "bg-orange-600" : "bg-transparent"
        }`}
      >
        <Text
          className={`text-[11px] font-black tracking-wide ${selected === "unread" ? "text-black" : "text-white/40"}`}
        >
          UNREAD
        </Text>
        {(badges?.unread ?? 0) > 0 && (
          <View
            className={`ml-1.5 px-1.5 py-0.5 rounded-full ${
              selected === "unread" ? "bg-black/20" : "bg-orange-600/20"
            }`}
          >
            <Text className={`text-[9px] font-bold ${selected === "unread" ? "text-black" : "text-orange-500"}`}>
              {badges?.unread}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onSelect("all")}
        className={`flex-1 items-center justify-center rounded-full ${
          selected === "all" ? "bg-orange-600" : "bg-transparent"
        }`}
      >
        <Text className={`text-[11px] font-black tracking-wide ${selected === "all" ? "text-black" : "text-white/40"}`}>
          ALL
        </Text>
      </TouchableOpacity>
    </View>
  );
};


const NotificationCard = ({ notification, onPress }: { notification: NotificationItem; onPress: () => void }) => {
  const isUnread = !notification.read_at;
  const safeData = notification.data || {};
  let userImage = safeData.user_image || safeData.image_url;

  const getIcon = (type?: string) => {
    const size = 18;
    const color = isUnread ? PRIMARY_ORANGE : "#666";
    switch (type) {
      case "friend_overtook_you":
      case "challenge_invite":
        return <Ionicons name="person-add" size={size} color={color} />;
      case "streak_milestone":
        return <MaterialCommunityIcons name="fire" size={size} color={color} />;
      case "streak_at_risk":
        return <MaterialCommunityIcons name="clock-alert" size={size} color={color} />;
      case "video_chips_milestone":
        return <Ionicons name="videocam" size={size} color={color} />;
      case "level_up":
        return <Feather name="star" size={size} color={color} />;
      case "mentioned_in_post":
      case "friend_posted_mix":
        return <Ionicons name="images" size={size} color={color} />;
      default:
        return <Ionicons name="notifications" size={size} color={color} />;
    }
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      if (seconds < 60) return "just now";
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h`;
      return `${Math.floor(hours / 24)}d`;
    } catch {
      return "";
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`mb-3 mx-4 p-4 rounded-3xl border flex-row items-center ${
        isUnread
          ? "bg-[#1E1E1E] border-orange-600/30 shadow-sm shadow-orange-900/10"
          : "bg-white/[0.03] border-white/[0.05]"
      }`}
    >
      <View
        className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
          isUnread ? "bg-orange-600/10" : "bg-white/[0.03]"
        }`}
      >
        {userImage && typeof userImage === "string" && userImage.startsWith("http") ? (
          <Image source={{ uri: userImage }} className="w-full h-full rounded-2xl" />
        ) : (
          getIcon(notification.type)
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row justify-between items-start mb-1">
          <Text className={`text-sm font-bold flex-1 mr-2 ${isUnread ? "text-white" : "text-white/60"}`}>
            {notification.title || "Notification"}
          </Text>
          {isUnread && <View className="w-2 h-2 rounded-full bg-orange-600 mt-1.5" />}
        </View>

        <Text className="text-white/40 text-xs font-medium leading-4 mb-1" numberOfLines={2}>
          {notification.body || ""}
        </Text>

        <Text className="text-orange-600/60 text-[10px] font-bold tracking-wide">
          {getTimeAgo(notification.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};


export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    notifications,
    unreadNotificationCount,
    refreshNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("unread");

  useEffect(() => {
    refreshNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = (notification: NotificationItem) => {
    const safeData = notification.data || {};
    const postIdToOpen = safeData.post_id;

    if (postIdToOpen) {
      router.push({
        pathname: "/(tabs)/mix",
        params: { openPostId: postIdToOpen },
      });
    }
    if (!notification.read_at) {
      markNotificationRead(notification.id);
    }
  };

  const filteredNotifications =
    filter === "unread" ? notifications?.filter((n) => !n.read_at) || [] : notifications || [];

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      <View style={{ paddingTop: insets.top }} className="z-10 bg-black pb-2">
        <NestedScreenHeader
          title="Notifications"
          eyebrow="TIPSY"
          rightAction={
            unreadNotificationCount > 0 ? (
              <TouchableOpacity
                onPress={markAllNotificationsRead}
                activeOpacity={0.7}
                className="flex-row items-center bg-white/10 px-3 py-1.5 rounded-full border border-white/10"
              >
                <Ionicons name="checkmark-done" size={14} color={PRIMARY_ORANGE} style={{ marginRight: 4 }} />
                <Text className="text-white text-[10px] font-bold tracking-wide">Mark Read</Text>
              </TouchableOpacity>
            ) : null
          }
        />

        <CompactSegmentedControl selected={filter} onSelect={setFilter} badges={{ unread: unreadNotificationCount }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
          paddingTop: 10,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EA580C"
            colors={["#EA580C"]}
            progressBackgroundColor="#1A1A1A"
          />
        }
      >
        {!notifications ? (
          <View className="pt-20 items-center">
            <ActivityIndicator size="large" color={PRIMARY_ORANGE} />
          </View>
        ) : filteredNotifications.length === 0 ? (
          <View className="items-center justify-center pt-20 px-10 opacity-50">
            <View className="w-20 h-20 bg-white/5 rounded-full items-center justify-center mb-4 border border-white/10">
              <Ionicons name="notifications-off-outline" size={32} color="white" />
            </View>
            <Text className="text-white text-lg font-black">All Caught Up</Text>
            <Text className="text-white/60 text-center text-sm mt-2">
              {filter === "unread" ? "No new notifications." : "You have no notifications yet."}
            </Text>
          </View>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onPress={() => handleNotificationPress(notification)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
