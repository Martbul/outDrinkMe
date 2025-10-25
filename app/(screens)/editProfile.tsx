import React, { useState } from "react";
import { useApp } from "@/providers/AppProvider";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SecondaryHeader from "@/components/secondaryHeader";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import DeleteAccountButton from "@/components/deleteAccountButton";

export default function EditProfileScreen() {
  const { userData, updateUserProfile } = useApp();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: userData?.username || "",
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    imageUrl: userData?.imageUrl || "",
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUserProfile(formData);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
      router.push("/(screens)/userProfile");
    }
  };

  const hasChanges =
    formData.username !== userData?.username ||
    formData.firstName !== userData?.firstName ||
    formData.lastName !== userData?.lastName ||
    formData.imageUrl !== userData?.imageUrl;

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <SecondaryHeader
        title="Edit Profile"
        secondActionTitle={hasChanges && !isLoading ? "Save" : undefined}
        secondOnPressAction={hasChanges ? handleSave : undefined}
      />

      <ScrollView
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        {/* Avatar Section */}
        <View className="items-center mb-8">
          <View className="relative">
            <View className="w-32 h-32 rounded-full bg-orange-600 items-center justify-center border-4 border-black">
              <Image
                source={{ uri: formData?.imageUrl }}
                className="w-32 h-32 rounded-full border-3 border-white"
              />
            </View>
            {/* TODO: Add a image changer  */}
            {/* <TouchableOpacity className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-black items-center justify-center border-2 border-black">
              <Feather name="image" size={24} color="#ff8c00" />
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Form Fields */}
        <View className="gap-4 mb-6">
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

          <View>
            <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase mb-2">
              Email
            </Text>
            <Text className="bg-white/[0.03] border border-white/[0.08] rounded-2xl px-4 py-4 text-white text-base">
              {userData?.email}
            </Text>
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
            <Feather name="arrow-right" size={24} color="#999999" />
          </TouchableOpacity>
        </View>

        <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-6">
          <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase mb-4">
            Terms
          </Text>

          <TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-white/[0.05]">
            <Text className="text-white text-base font-semibold">
              Privacy Policy
            </Text>
            <Feather name="arrow-right" size={24} color="#999999" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-white/[0.05]">
            <Text className="text-white text-base font-semibold">
              Terms of Service
            </Text>
            <Feather name="arrow-right" size={24} color="#999999" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View className="bg-red-900/10 rounded-2xl p-5 border border-red-900/30 mb-6">
          <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase mb-4">
            Danger Zone
          </Text>
          <DeleteAccountButton />
        </View>
      </ScrollView>
    </View>
  );
}
