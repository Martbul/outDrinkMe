import React from "react";
import {
  Modal,
  View,
  Text,
  Platform,
  Alert,
  Linking,
  TouchableOpacity,
} from "react-native";
import { useApp } from "@/providers/AppProvider";
import * as Application from "expo-application";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Optional: Adds a nice icon

const MandatoryUpdateModal = () => {
  const { showMandatoryUpdateModal, updateMessage } = useApp();

  const handleUpdatePress = () => {
    let url = "";
    if (Platform.OS === "android") {
      const packageName = Application.applicationId;
      if (packageName) {
        url = `market://details?id=${packageName}`;
      } else {
        url = `https://play.google.com/store/apps/details?id=com.martbul.outDrinkMe`;
        console.warn(
          "Could not get Android package name, using fallback Play Store URL."
        );
      }
    } else if (Platform.OS === "ios") {
      // REPLACE WITH YOUR ACTUAL APP ID
      url = `itms-apps://itunes.apple.com/app/idYOUR_APPLE_APP_ID`;
      console.warn("Please replace 'YOUR_APPLE_APP_ID' with your actual ID.");
    }

    if (url) {
      Linking.openURL(url).catch((err) => {
        console.error("Failed to open app store link:", err);
        Alert.alert(
          "Error",
          "Could not open the app store. Please update manually."
        );
      });
    } else {
      Alert.alert("Error", "Could not determine the app store URL.");
    }
  };

  if (!showMandatoryUpdateModal) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showMandatoryUpdateModal}
      statusBarTranslucent
      onRequestClose={() => {
        // Prevent closing on Android back button
        Alert.alert("Update Required", "You must update the app to continue.");
      }}
    >
      {/* Dark Overlay */}
      <View className="flex-1 justify-center items-center bg-black/80 px-4">
        
        {/* Modal Card */}
        <View className="w-full max-w-[340px] bg-orange-600 rounded-3xl p-6 items-center shadow-xl shadow-black">
          
          {/* Icon Header */}
          <View className="bg-white/20 p-4 rounded-full mb-4 border border-white/10">
            <MaterialCommunityIcons name="rocket-launch" size={32} color="white" />
          </View>

          {/* Title */}
          <Text className="text-2xl font-black text-white text-center mb-2 tracking-wide uppercase">
            Update Required
          </Text>

          {/* Message Body */}
          <Text className="text-white/90 text-center text-base mb-8 leading-6 font-medium">
            {updateMessage || "A new version is available. Please update to continue using the app."}
          </Text>

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleUpdatePress}
            activeOpacity={0.8}
            className="w-full bg-white py-4 rounded-2xl items-center shadow-sm"
          >
            <Text className="text-orange-600 font-black text-lg uppercase tracking-widest">
              Update Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default MandatoryUpdateModal;