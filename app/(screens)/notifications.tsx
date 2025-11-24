import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  AppState,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import NestedScreenHeader from "@/components/nestedScreenHeader";
import { useApp } from "@/providers/AppProvider";
import { NotificationItem } from "@/types/api.types";
import { registerForPushNotificationsAsync } from "@/utils/registerPushNotification";

export default function NotificationsScreen() {
  const {
    notifications,
    unreadNotificationCount,
    refreshNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    registerPushDevice,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);

  // 1. Default to "unread" as requested
  const [filter, setFilter] = useState<"all" | "unread">("unread");

  // --- Permission State ---
  const [hasPermission, setHasPermission] = useState(true);
  const appState = useRef(AppState.currentState);

  // --- NEW: Mark as Read on Exit Logic ---
  useEffect(() => {
    // A. When entering: Refresh to get the latest state
    refreshNotifications();

    // B. When leaving (Unmounting): Mark everything as read
    return () => {
      // We use a clean function here.
      // Even though the component is unmounting, the Context provider
      // (where markAllNotificationsRead lives) stays alive, so the API call works.
      markAllNotificationsRead();
    };
  }, []); // Empty array ensures this runs only on Mount and Unmount

  // --- Check Permissions Logic ---
  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const handleEnablePermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status === "granted") {
      setHasPermission(true);
      const token = await registerForPushNotificationsAsync();
      if (token) {
        registerPushDevice(token);
      }
    } else {
      Alert.alert(
        "Notifications Disabled",
        "To receive updates, you need to enable notifications in your device settings.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
    }
  };

  useEffect(() => {
    checkPermissions();
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        checkPermissions();
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    await checkPermissions();
    setRefreshing(false);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "friend_overtook_you":
      case "challenge_invite":
        return <Ionicons name="person-add" size={20} color="#EA580C" />;
      case "streak_milestone":
        return <MaterialCommunityIcons name="fire" size={20} color="#EA580C" />;
      case "streak_at_risk":
        return (
          <MaterialCommunityIcons
            name="clock-alert"
            size={20}
            color="#EA580C"
          />
        );
      case "video_chips_milestone":
        return <Ionicons name="videocam" size={20} color="#EA580C" />;
      case "level_up":
        return <Feather name="star" size={20} color="#EA580C" />;
      case "mentioned_in_post":
      case "friend_posted_mix": // Added your new type icon
        return <Ionicons name="images" size={20} color="#EA580C" />;
      case "weekly_recap":
        return <Ionicons name="calendar" size={20} color="#EA580C" />;
      default:
        return <Ionicons name="notifications" size={20} color="#EA580C" />;
    }
  };

  const PermissionBanner = () => {
    if (hasPermission) return null;

    return (
      <View className="mb-4 bg-orange-600/10 border border-orange-600/30 rounded-2xl p-4 flex-row items-center justify-between">
        <View className="flex-1 mr-2">
          <Text className="text-white font-bold text-sm">
            Notifications are disabled
          </Text>
          <Text className="text-white/60 text-xs mt-0.5">
            Enable them to get streak updates & friend activity.
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleEnablePermissions}
          className="bg-orange-600 px-3 py-2 rounded-lg"
        >
          <Text className="text-black font-black text-xs">ENABLE</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const notificationListHeader = () => {
    return (
      <View className="bg-white/[0.03] rounded-2xl p-1.5 flex-row border border-white/[0.08]">
        <TouchableOpacity
          onPress={() => setFilter("unread")}
          className={`flex-1 py-3 rounded-xl items-center ${
            filter === "unread" ? "bg-orange-600" : ""
          }`}
        >
          <View className="flex-row items-center">
            <Text
              className={`text-sm font-black tracking-wider ${
                filter === "unread" ? "text-black" : "text-white/30"
              }`}
            >
              UNREAD
            </Text>
            {unreadNotificationCount > 0 && (
              <View
                className={`ml-2 px-2 py-0.5 rounded-full ${
                  filter === "unread" ? "bg-black/20" : "bg-orange-600/30"
                }`}
              >
                <Text
                  className={`text-xs font-black ${
                    filter === "unread" ? "text-black" : "text-orange-600"
                  }`}
                >
                  {unreadNotificationCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter("all")}
          className={`flex-1 py-3 rounded-xl items-center ${
            filter === "all" ? "bg-orange-600" : ""
          }`}
        >
          <Text
            className={`text-sm font-black tracking-wider ${
              filter === "all" ? "text-black" : "text-white/30"
            }`}
          >
            ALL
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderNotification = (notification: NotificationItem) => {
    const isUnread = !notification.read_at;
    const userImage =
      notification.data?.user_image || notification.data?.image_url;

    return (
      <TouchableOpacity
        key={notification.id}
        onPress={() => markNotificationRead(notification.id)}
        className={`mb-3 rounded-2xl border overflow-hidden ${
          isUnread
            ? "bg-orange-600/10 border-orange-600/30"
            : "bg-white/[0.03] border-white/[0.08]"
        }`}
      >
        <View className="flex-row p-4">
          <View className="mr-3">
            {userImage ? (
              <View className="relative">
                <Image
                  source={{ uri: userImage }}
                  className="w-12 h-12 rounded-full"
                />
                {isUnread && (
                  <View className="absolute -top-1 -right-1 w-3 h-3 bg-orange-600 rounded-full border-2 border-black" />
                )}
              </View>
            ) : (
              <View
                className={`w-12 h-12 rounded-full items-center justify-center ${
                  isUnread ? "bg-orange-600/20" : "bg-white/[0.05]"
                }`}
              >
                {getNotificationIcon(notification.type)}
              </View>
            )}
          </View>

          <View className="flex-1">
            <Text
              className={`text-base font-bold mb-1 ${
                isUnread ? "text-orange-600" : "text-white"
              }`}
            >
              {notification.title}
            </Text>

            <Text className="text-white/70 text-sm font-semibold mb-2">
              {notification.body}
            </Text>

            <Text className="text-white/40 text-xs font-semibold">
              {getTimeAgo(notification.created_at)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read_at)
      : notifications;

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: 10 }}>
      {unreadNotificationCount > 0 ? (
        <NestedScreenHeader
          heading="Notifications"
          secondaryHeading="UPDATES"
          buttonHeading="CLEAR"
          buttonAction={markAllNotificationsRead}
        />
      ) : (
        <NestedScreenHeader
          heading="Notifications"
          secondaryHeading="UPDATES"
        />
      )}

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EA580C"
            colors={["#EA580C"]}
          />
        }
      >
        <View className="bg-black pb-4">
          <PermissionBanner />
          {notificationListHeader()}
        </View>

        {filteredNotifications.length === 0 ? (
          <View className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center">
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
            <Text className="text-white/50 text-sm text-center font-semibold">
              {filter === "unread"
                ? "You're all caught up!"
                : "When you get notifications, they'll show up here"}
            </Text>
          </View>
        ) : (
          filteredNotifications.map(renderNotification)
        )}
      </ScrollView>
    </View>
  );
}
