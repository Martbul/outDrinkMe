import React, { useState } from "react";
import { useApp } from "@/providers/AppProvider";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const { userData, updateUserProfile } = useApp();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    email: userData?.email || "",
    username: userData?.username || "",
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUserProfile(formData);
      // Navigate back or show success message
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges =
    formData.firstName !== userData?.firstName ||
    formData.lastName !== userData?.lastName ||
    formData.email !== userData?.email ||
    formData.username !== userData?.username;

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View
        className="px-4 border-b border-white/[0.08]"
        style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
      >
        <Text className="text-white text-2xl font-black mb-1">
          Edit Profile
        </Text>
        <Text className="text-white/50 text-sm">
          Update your personal information
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        {/* Avatar Section */}
        <View className="items-center mb-8">
          <View className="relative">
            <View className="w-32 h-32 rounded-full bg-orange-600 items-center justify-center border-4 border-black">
              <Image
                source={{ uri: userData?.imageUrl }}
                className="w-32 h-32 rounded-full border-3 border-white"
              />
            </View>
            <TouchableOpacity className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-orange-600 items-center justify-center border-2 border-black">
              <Text className="text-black text-lg font-black">📷</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-white/50 text-xs mt-3">
            Tap to change profile photo
          </Text>
        </View>

        {/* Form Fields */}
        <View className="gap-4 mb-6">
          {/* First Name */}
          <View>
            <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase mb-2">
              First Name
            </Text>
            <TextInput
              value={formData.firstName}
              onChangeText={(text) =>
                setFormData({ ...formData, firstName: text })
              }
              placeholder="Enter first name"
              placeholderTextColor="#6B7280"
              className="bg-white/[0.03] border border-white/[0.08] rounded-2xl px-4 py-4 text-white text-base"
            />
          </View>

          {/* Last Name */}
          <View>
            <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase mb-2">
              Last Name
            </Text>
            <TextInput
              value={formData.lastName}
              onChangeText={(text) =>
                setFormData({ ...formData, lastName: text })
              }
              placeholder="Enter last name"
              placeholderTextColor="#6B7280"
              className="bg-white/[0.03] border border-white/[0.08] rounded-2xl px-4 py-4 text-white text-base"
            />
          </View>

          {/* Username */}
          <View>
            <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase mb-2">
              Username
            </Text>
            <TextInput
              value={formData.username}
              onChangeText={(text) =>
                setFormData({ ...formData, username: text })
              }
              placeholder="Enter username"
              placeholderTextColor="#6B7280"
              autoCapitalize="none"
              className="bg-white/[0.03] border border-white/[0.08] rounded-2xl px-4 py-4 text-white text-base"
            />
          </View>

          {/* Email */}
          <View>
            <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase mb-2">
              Email
            </Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Enter email"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-white/[0.03] border border-white/[0.08] rounded-2xl px-4 py-4 text-white text-base"
            />
          </View>
        </View>

        {/* Account Settings Card */}
        <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-6">
          <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase mb-4">
            Account Settings
          </Text>

          <TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-white/[0.05]">
            <Text className="text-white text-base font-semibold">
              Change Password
            </Text>
            <Text className="text-white/50">→</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-white/[0.05]">
            <Text className="text-white text-base font-semibold">
              Privacy Settings
            </Text>
            <Text className="text-white/50">→</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row justify-between items-center py-3">
            <Text className="text-white text-base font-semibold">
              Notification Preferences
            </Text>
            <Text className="text-white/50">→</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View className="bg-red-900/10 rounded-2xl p-5 border border-red-900/30 mb-6">
          <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase mb-4">
            Danger Zone
          </Text>

          <TouchableOpacity className="py-3">
            <Text className="text-red-500 text-base font-bold">
              Delete Account
            </Text>
            <Text className="text-red-500/70 text-xs mt-1">
              This action cannot be undone
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Save Button - Fixed at bottom */}
      <View
        className="px-4 py-4 border-t border-white/[0.08] bg-black"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanges || isLoading}
          className={`rounded-2xl py-4 items-center ${
            hasChanges && !isLoading ? "bg-orange-600" : "bg-white/[0.05]"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text
              className={`font-black uppercase tracking-widest text-sm ${
                hasChanges ? "text-black" : "text-white/30"
              }`}
            >
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
