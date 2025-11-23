// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   RefreshControl,
// } from "react-native";
// import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
// import NestedScreenHeader from "@/components/nestedScreenHeader";
// // Mock notification data
// const MOCK_NOTIFICATIONS = [
//   {
//     id: "1",
//     type: "friend_request",
//     user: {
//       name: "Alex Johnson",
//       username: "alexj",
//       imageUrl: "https://i.pravatar.cc/150?img=1",
//     },
//     timestamp: "2m ago",
//     read: false,
//   },
//   {
//     id: "2",
//     type: "achievement",
//     title: "New Achievement Unlocked!",
//     description: "Fire Starter - 7 day streak",
//     icon: "🔥",
//     timestamp: "1h ago",
//     read: false,
//   },
//   {
//     id: "3",
//     type: "streak_reminder",
//     title: "Don't break your streak!",
//     description: "You haven't logged today. Keep it going!",
//     timestamp: "3h ago",
//     read: true,
//   },
//   {
//     id: "4",
//     type: "friend_activity",
//     user: {
//       name: "Sarah Miller",
//       username: "sarahm",
//       imageUrl: "https://i.pravatar.cc/150?img=2",
//     },
//     action: "just logged a drink",
//     timestamp: "5h ago",
//     read: true,
//   },
//   {
//     id: "5",
//     type: "level_up",
//     title: "Level Up!",
//     description: "You've reached Level 12",
//     timestamp: "1d ago",
//     read: true,
//   },
//   {
//     id: "6",
//     type: "mix_mention",
//     user: {
//       name: "Mike Davis",
//       username: "miked",
//       imageUrl: "https://i.pravatar.cc/150?img=3",
//     },
//     action: "mentioned you in a mix",
//     timestamp: "1d ago",
//     read: true,
//   },
//   {
//     id: "7",
//     type: "weekly_recap",
//     title: "Weekly Recap",
//     description: "You drank 5 out of 7 days this week!",
//     timestamp: "2d ago",
//     read: true,
//   },
// ];

// export default function NotificationsScreen() {
//   const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
//   const [refreshing, setRefreshing] = useState(false);
//   const [filter, setFilter] = useState<"all" | "unread">("unread");

//   const unreadCount = notifications.filter((n) => !n.read).length;

//   const onRefresh = () => {
//     setRefreshing(true);
//     setTimeout(() => setRefreshing(false), 1000);
//   };

//   const markAsRead = (id: string) => {
//     setNotifications((prev) =>
//       prev.map((n) => (n.id === id ? { ...n, read: true } : n))
//     );
//   };

//   const markAllAsRead = () => {
//     setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
//   };

//   const getNotificationIcon = (type: string) => {
//     switch (type) {
//       case "friend_request":
//         return <Ionicons name="person-add" size={20} color="#EA580C" />;
//       case "achievement":
//         return <Ionicons name="trophy" size={20} color="#EA580C" />;
//       case "streak_reminder":
//         return <MaterialCommunityIcons name="fire" size={20} color="#EA580C" />;
//       case "friend_activity":
//         return <Ionicons name="notifications" size={20} color="#EA580C" />;
//       case "level_up":
//         return <Feather name="star" size={20} color="#EA580C" />;
//       case "mix_mention":
//         return <Ionicons name="at" size={20} color="#EA580C" />;
//       case "weekly_recap":
//         return <Ionicons name="calendar" size={20} color="#EA580C" />;
//       default:
//         return <Ionicons name="notifications" size={20} color="#EA580C" />;
//     }
//   };

//   const notificationListHeader = () => {
//     return (
//       <View className="bg-white/[0.03] rounded-2xl p-1.5 flex-row border border-white/[0.08]">
//         <TouchableOpacity
//           onPress={() => setFilter("unread")}
//           className={`flex-1 py-3 rounded-xl items-center ${
//             filter === "unread" ? "bg-orange-600" : ""
//           }`}
//         >
//           <View className="flex-row items-center">
//             <Text
//               className={`text-sm font-black tracking-wider ${
//                 filter === "unread" ? "text-black" : "text-white/30"
//               }`}
//             >
//               UNREAD
//             </Text>
//             {unreadCount > 0 && (
//               <View
//                 className={`ml-2 px-2 py-0.5 rounded-full ${
//                   filter === "unread" ? "bg-black/20" : "bg-orange-600/30"
//                 }`}
//               >
//                 <Text
//                   className={`text-xs font-black ${
//                     filter === "unread" ? "text-black" : "text-orange-600"
//                   }`}
//                 >
//                   {unreadCount}
//                 </Text>
//               </View>
//             )}
//           </View>
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={() => setFilter("all")}
//           className={`flex-1 py-3 rounded-xl items-center ${
//             filter === "all" ? "bg-orange-600" : ""
//           }`}
//         >
//           <Text
//             className={`text-sm font-black tracking-wider ${
//               filter === "all" ? "text-black" : "text-white/30"
//             }`}
//           >
//             ALL
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   const renderNotification = (notification: any) => {
//     const isUnread = !notification.read;

//     return (
//       <TouchableOpacity
//         key={notification.id}
//         onPress={() => markAsRead(notification.id)}
//         className={`mb-3 rounded-2xl border overflow-hidden ${
//           isUnread
//             ? "bg-orange-600/10 border-orange-600/30"
//             : "bg-white/[0.03] border-white/[0.08]"
//         }`}
//       >
//         <View className="flex-row p-4">
//           {/* Left: Avatar or Icon */}
//           <View className="mr-3">
//             {notification.user ? (
//               <View className="relative">
//                 <Image
//                   source={{ uri: notification.user.imageUrl }}
//                   className="w-12 h-12 rounded-full"
//                 />
//                 {isUnread && (
//                   <View className="absolute -top-1 -right-1 w-3 h-3 bg-orange-600 rounded-full border-2 border-black" />
//                 )}
//               </View>
//             ) : (
//               <View
//                 className={`w-12 h-12 rounded-full items-center justify-center ${
//                   isUnread ? "bg-orange-600/20" : "bg-white/[0.05]"
//                 }`}
//               >
//                 {notification.icon ? (
//                   <Text className="text-2xl">{notification.icon}</Text>
//                 ) : (
//                   getNotificationIcon(notification.type)
//                 )}
//               </View>
//             )}
//           </View>

//           {/* Middle: Content */}
//           <View className="flex-1">
//             {notification.user && (
//               <Text className="text-white text-base font-bold mb-1">
//                 {notification.user.name}
//               </Text>
//             )}

//             {notification.title && (
//               <Text
//                 className={`text-base font-bold mb-1 ${
//                   isUnread ? "text-orange-600" : "text-white"
//                 }`}
//               >
//                 {notification.title}
//               </Text>
//             )}

//             <Text className="text-white/70 text-sm font-semibold mb-2">
//               {notification.action || notification.description}
//             </Text>

//             <Text className="text-white/40 text-xs font-semibold">
//               {notification.timestamp}
//             </Text>
//           </View>

//           {/* Right: Action buttons */}
//           {notification.type === "friend_request" && (
//             <View className="ml-2 gap-2">
//               <TouchableOpacity className="bg-orange-600 px-4 py-2 rounded-lg">
//                 <Text className="text-black text-xs font-black">ACCEPT</Text>
//               </TouchableOpacity>
//               <TouchableOpacity className="bg-white/[0.05] px-4 py-2 rounded-lg border border-white/[0.08]">
//                 <Text className="text-white text-xs font-black">DECLINE</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const filteredNotifications =
//     filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

//   return (
//     <View className="flex-1 bg-black" style={{ paddingTop: 10 }}>
//       {unreadCount > 0 ? (
//         <NestedScreenHeader
//           heading="Notifications"
//           secondaryHeading="UPDATES"
//           buttonHeading="CLEAR"
//           buttonAction={markAllAsRead}
//         />
//       ) : (
//         <NestedScreenHeader
//           heading="Notifications"
//           secondaryHeading="UPDATES"
//         />
//       )}

//       <ScrollView
//         className="flex-1 px-4"
//         contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
//         showsVerticalScrollIndicator={false}
//         stickyHeaderIndices={[0]}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             tintColor="#EA580C"
//             colors={["#EA580C"]}
//           />
//         }
//       >
//         <View className="mb-4 bg-black">{notificationListHeader()}</View>

//         {filteredNotifications.length === 0 ? (
//           <View className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center">
//             <View className="w-24 h-24 rounded-2xl bg-orange-600/20 items-center justify-center mb-4">
//               <Ionicons
//                 name="notifications-outline"
//                 size={48}
//                 color="#EA580C"
//               />
//             </View>
//             <Text className="text-white text-xl font-black mb-2">
//               No Notifications
//             </Text>
//             <Text className="text-white/50 text-sm text-center font-semibold">
//               {filter === "unread"
//                 ? "You're all caught up!"
//                 : "When you get notifications, they'll show up here"}
//             </Text>
//           </View>
//         ) : (
//           filteredNotifications.map(renderNotification)
//         )}
//       </ScrollView>
//     </View>
//   );
// }

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import NestedScreenHeader from "@/components/nestedScreenHeader";
import { useApp } from "@/providers/AppProvider";
import { NotificationItem } from "@/types/api.types";

export default function NotificationsScreen() {
  // 1. Use real data from Context
  const {
    notifications,
    unreadNotificationCount,
    refreshNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("unread");

  // 2. Handle Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  // 3. Helper for Timestamp (Simple version)
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

  // 4. Map Backend Types to Icons
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
        return <Ionicons name="at" size={20} color="#EA580C" />;
      case "weekly_recap":
        return <Ionicons name="calendar" size={20} color="#EA580C" />;
      default:
        return <Ionicons name="notifications" size={20} color="#EA580C" />;
    }
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
    // Check 'read_at' being null for unread status
    const isUnread = !notification.read_at;

    // Extract user image from 'data' if it exists (depends on how you save it in Go)
    // Example: req.Data["user_image"]
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
          {/* Left: Avatar or Icon */}
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

          {/* Middle: Content */}
          <View className="flex-1">
            {/* Use Title from Backend */}
            <Text
              className={`text-base font-bold mb-1 ${
                isUnread ? "text-orange-600" : "text-white"
              }`}
            >
              {notification.title}
            </Text>

            {/* Use Body from Backend */}
            <Text className="text-white/70 text-sm font-semibold mb-2">
              {notification.body}
            </Text>

            <Text className="text-white/40 text-xs font-semibold">
              {getTimeAgo(notification.created_at)}
            </Text>
          </View>

          {/* Right: Action buttons (Only if 'action_url' implies interaction, needs logic adaptation) */}
          {notification.type === "challenge_invite" && (
            <View className="ml-2 gap-2">
              <TouchableOpacity className="bg-orange-600 px-4 py-2 rounded-lg">
                <Text className="text-black text-xs font-black">VIEW</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Filter logic based on 'read_at'
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
        <View className="mb-4 bg-black">{notificationListHeader()}</View>

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