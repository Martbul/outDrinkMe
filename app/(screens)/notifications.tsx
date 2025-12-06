import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  AppState,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useApp } from "@/providers/AppProvider";
import { NotificationItem } from "@/types/api.types";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const [hasPermission, setHasPermission] = useState(true);
  const appState = useRef(AppState.currentState);

  // --- SAFE HELPERS ---
  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      if (seconds < 60) return "just now";
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch (e) {
      return "";
    }
  };

  const getNotificationIcon = (type?: string) => {
    const size = 20;
    const color = "#EA580C";
    try {
      switch (type) {
        case "friend_overtook_you":
        case "challenge_invite":
          return <Ionicons name="person-add" size={size} color={color} />;
        case "streak_milestone":
          return (
            <MaterialCommunityIcons name="fire" size={size} color={color} />
          );
        case "streak_at_risk":
          return (
            <MaterialCommunityIcons
              name="clock-alert"
              size={size}
              color={color}
            />
          );
        case "video_chips_milestone":
          return <Ionicons name="videocam" size={size} color={color} />;
        case "level_up":
          return <Feather name="star" size={size} color={color} />;
        case "mentioned_in_post":
        case "friend_posted_mix":
          return <Ionicons name="images" size={size} color={color} />;
        case "weekly_recap":
          return <Ionicons name="calendar" size={size} color={color} />;
        default:
          return <Ionicons name="notifications" size={size} color={color} />;
      }
    } catch (e) {
      return (
        <View
          style={{
            width: 20,
            height: 20,
            backgroundColor: color,
            borderRadius: 10,
          }}
        />
      );
    }
  };

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const InlineHeader = () => (
    <View className="px-4 py-2 flex-row items-center justify-between bg-black">
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 p-2 bg-white/10 rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-2xl font-black tracking-tighter">
            NOTIFICATIONS
          </Text>
          <Text className="text-orange-600 text-xs font-bold tracking-widest">
            UPDATES
          </Text>
        </View>
      </View>

      {unreadNotificationCount > 0 && (
        <TouchableOpacity
          onPress={markAllNotificationsRead}
          className="bg-white/10 px-3 py-1.5 rounded-lg"
        >
          <Text className="text-white text-xs font-black">CLEAR</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const PermissionBanner = () => {
    if (hasPermission) return null;
    return (
      <View className="mb-4 bg-orange-600/10 border border-orange-600/30 rounded-2xl p-4 flex-row items-center justify-between mx-4 mt-2">
        <View className="flex-1 mr-2">
          <Text className="text-white font-bold text-sm">
            Notifications disabled
          </Text>
          <Text className="text-white/60 text-xs mt-0.5">
            Enable for updates.
          </Text>
        </View>
        <TouchableOpacity className="bg-orange-600 px-3 py-2 rounded-lg">
          <Text className="text-black font-black text-xs">ENABLE</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const NotificationTabs = () => (
    <View className="bg-black px-4 pb-4 pt-2">
      <View className="bg-white/[0.03] rounded-2xl p-1.5 flex-row border border-white/[0.08] w-full">
        <TouchableOpacity
          onPress={() => setFilter("unread")}
          className={`flex-1 py-3 rounded-xl items-center justify-center ${filter === "unread" ? "bg-orange-600" : ""}`}
        >
          <View className="flex-row items-center justify-center">
            <Text
              className={`text-sm font-black tracking-wider ${filter === "unread" ? "text-black" : "text-white/30"}`}
            >
              UNREAD
            </Text>
            {unreadNotificationCount > 0 && (
              <View
                className={`ml-2 px-2 py-0.5 rounded-full ${filter === "unread" ? "bg-black/20" : "bg-orange-600/30"}`}
              >
                <Text
                  className={`text-xs font-black ${filter === "unread" ? "text-black" : "text-orange-600"}`}
                >
                  {unreadNotificationCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter("all")}
          className={`flex-1 py-3 rounded-xl items-center justify-center ${filter === "all" ? "bg-orange-600" : ""}`}
        >
          <Text
            className={`text-sm font-black tracking-wider ${filter === "all" ? "text-black" : "text-white/30"}`}
          >
            ALL
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNotification = (notification: NotificationItem) => {
    if (!notification || !notification.id) return null;

    const isUnread = !notification.read_at;
    const safeData = notification.data || {};

    let userImage = safeData.user_image || safeData.image_url;
    if (userImage && typeof userImage === "string") {
      userImage = userImage.trim();
      if (!userImage.startsWith("http")) userImage = null;
    } else {
      userImage = null;
    }

    return (
      <TouchableOpacity
        key={notification.id}
        onPress={() => markNotificationRead(notification.id)}
        className={`mb-3 mx-4 rounded-2xl border overflow-hidden ${
          isUnread
            ? "bg-orange-600/10 border-orange-600/30"
            : "bg-white/[0.03] border-white/[0.08]"
        }`}
      >
        <View className="flex-row p-4">
          <View className="mr-3">
            {userImage ? (
              <Image
                source={{ uri: userImage }}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <View
                className={`w-12 h-12 rounded-full items-center justify-center ${isUnread ? "bg-orange-600/20" : "bg-white/[0.05]"}`}
              >
                {getNotificationIcon(notification.type)}
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text
              className={`text-base font-bold mb-1 ${isUnread ? "text-orange-600" : "text-white"}`}
            >
              {notification.title || "Notification"}
            </Text>
            <Text className="text-white/70 text-sm font-semibold mb-2">
              {notification.body || ""}
            </Text>
            <Text className="text-white/40 text-xs font-semibold">
              {getTimeAgo(notification.created_at)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!notifications) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "black",
          // 3. APPLY INSETS AS STYLE
          paddingTop: insets.top,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#EA580C" />
      </View>
    );
  }

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read_at)
      : notifications;

  return (
    // 4. USE STANDARD VIEW WITH PADDING STYLES (Crash Proof)
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <InlineHeader />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EA580C"
            colors={["#EA580C"]}
            progressViewOffset={10}
          />
        }
      >
        <View>
          <PermissionBanner />
          <NotificationTabs />
        </View>

        {filteredNotifications.length === 0 ? (
          <View className="mx-4 bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center mt-4">
            <View className="w-24 h-24 rounded-2xl bg-orange-600/20 items-center justify-center mb-4">
              <Ionicons
                name="notifications-outline"
                size={48}
                color="#EA580C"
              />
            </View>
            <Text className="text-white text-xl font-black mb-2">
              No Notifications
            </Text>
          </View>
        ) : (
          <View className="mt-2">
            {filteredNotifications.map(renderNotification)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
