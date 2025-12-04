// utils/registerPushNotification.ts
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

// 1. Configure "Instagram-like" behavior when app is FOREGROUNDED
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // Required for strict typing (iOS Banner)
    shouldShowList: true, // Required for strict typing (iOS Notification Center)
  }),
});
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    // Android 8.0+ requires channels
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return null;
    }

    // 2. GET THE NATIVE TOKEN (FCM)
    // We use getDevicePushTokenAsync because your Go backend talks directly to FCM.
    try {
      const tokenData = await Notifications.getDevicePushTokenAsync();
      token = tokenData.data;
      console.log("FCM Native Token:", token);
    } catch (e) {
      console.error("Error fetching device token:", e);
    }
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  return token;
}
