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
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import DeleteAccountButton from "@/components/deleteAccountButton";
import { openPrivacy, openTerms } from "@/utils/links";
import NestedScreenHeader from "@/components/nestedScreenHeader";

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



      {hasChanges && !isLoading ? (
        <NestedScreenHeader heading="Profile" secondaryHeading="EDIT" buttonHeading="SAVE" buttonAction={handleSave}/>
      ) : (
        <NestedScreenHeader heading="Profile" secondaryHeading="EDIT" />
      )}

      <ScrollView
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
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
        <View className="gap-4 mb-6">
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Feather name="at-sign" size={14} color="#EA580C" />
              <Text className="text-white/70 text-xs font-bold tracking-wider ml-2">
                USERNAME
              </Text>
            </View>
            <TextInput
              value={formData.username}
              onChangeText={(text) =>
                setFormData({ ...formData, username: text })
              }
              placeholder="Enter username"
              placeholderTextColor="#666666"
              autoCapitalize="none"
              className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-base font-semibold"
            />
          </View>

          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Feather name="user" size={14} color="#EA580C" />
              <Text className="text-white/70 text-xs font-bold tracking-wider ml-2">
                FIRST NAME
              </Text>
            </View>
            <TextInput
              value={formData.firstName}
              onChangeText={(text) =>
                setFormData({ ...formData, firstName: text })
              }
              placeholder="Enter first name"
              placeholderTextColor="#666666"
              className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-base font-semibold"
            />
          </View>

          {/* Last Name */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Feather name="user" size={14} color="#EA580C" />
              <Text className="text-white/70 text-xs font-bold tracking-wider ml-2">
                LAST NAME
              </Text>
            </View>
            <TextInput
              value={formData.lastName}
              onChangeText={(text) =>
                setFormData({ ...formData, lastName: text })
              }
              placeholder="Enter last name"
              placeholderTextColor="#666666"
              className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-base font-semibold"
            />
          </View>

          <View>
            <View className="flex-row items-center mb-2">
              <Feather name="mail" size={14} color="#EA580C" />
              <Text className="text-white/70 text-xs font-bold tracking-wider ml-2">
                EMAIL
              </Text>
            </View>
            <View className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3.5 flex-row items-center">
              <Text className="text-white/50 text-base font-semibold flex-1">
                {userData?.email}
              </Text>
              <Ionicons name="lock-closed" size={16} color="#666" />
            </View>
            <Text className="text-white/40 text-xs font-semibold mt-1.5">
              Email cannot be changed
            </Text>
          </View>
        </View>

        <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-4">
          <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-4">
            LEGAL
          </Text>
          <TouchableOpacity
            className="flex-row justify-between items-center py-3 border-b border-white/[0.05]"
            onPress={openPrivacy}
          >
            <View className="flex-row items-center flex-1">
              <View className="w-8 h-8 rounded-lg bg-orange-600/20 items-center justify-center mr-3">
                <Feather name="shield" size={16} color="#EA580C" />
              </View>
              <Text className="text-white text-base font-bold">
                Privacy Policy
              </Text>
            </View>
            <Feather name="external-link" size={18} color="#999999" />
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row justify-between items-center py-3"
            onPress={openTerms}
          >
            <View className="flex-row items-center flex-1">
              <View className="w-8 h-8 rounded-lg bg-orange-600/20 items-center justify-center mr-3">
                <Feather name="file-text" size={16} color="#EA580C" />
              </View>
              <Text className="text-white text-base font-bold">
                Terms of Service
              </Text>
            </View>
            <Feather name="external-link" size={18} color="#999999" />
          </TouchableOpacity>
        </View>
        <View className="bg-red-900/10 rounded-2xl p-5 border border-red-900/30 mb-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="warning" size={18} color="#EF4444" />
            <Text className="text-red-500 text-[11px] font-bold tracking-widest ml-2">
              DANGER ZONE
            </Text>
          </View>
          <DeleteAccountButton />
        </View>
      </ScrollView>
    </View>
  );
}
