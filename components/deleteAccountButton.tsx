import { useUser, useAuth } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import CustomModal, {
  ModalDangerButton,
  ModalSecondaryButton,
} from "./customModal";
import { useApp } from "@/providers/AppProvider";

export default function DeleteAccountButton() {
  const { signOut } = useAuth();
  const { deleteUserAccount } = useApp();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);

      // 1. First delete user data from your backend
      await deleteUserAccount();

      // 2. Then delete Clerk user account
      await user?.delete();

      // 3. Sign out and redirect
      await signOut();
      setShowModal(false);
      router.replace("/(auth)/google-sign-in");
    } catch (error: any) {
      console.error("Delete account error:", error);
      setIsLoading(false);
      // Show error - you could use your error handler here
      alert(error.message || "Failed to delete account. Please try again.");
    }
  };

  return (
    <>
      <TouchableOpacity
        className="flex-row justify-between items-center"
        onPress={() => setShowModal(true)}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#EF4444" />
        ) : (
          <>
            <Text className="text-red-500 font-bold">Delete Account</Text>
            <Feather name="trash-2" size={24} color="#EF4444" />
          </>
        )}
      </TouchableOpacity>

      <CustomModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        title="Delete Account"
        footer={
          <View className="gap-3">
            <ModalDangerButton
              title="Delete Forever"
              onPress={handleDeleteAccount}
              // disabled={!isConfirmValid || isLoading}
              disabled={isLoading}
            />
            <ModalSecondaryButton
              title="Cancel"
              onPress={() => {
                setShowModal(false);
              }}
            />
          </View>
        }
      >
        <View className="py-4">
          {/* Warning Box */}
          <View className="bg-red-900/10 rounded-2xl p-5 border border-red-900/30 mb-4">
            <Text className="text-red-500 text-xl font-black mb-3">
              ⚠️ Permanent Deletion
            </Text>
            <Text className="text-red-500/70 text-base leading-6 mb-3">
              This action cannot be undone. All your data will be permanently
              deleted:
            </Text>
            <View className="gap-2 ml-4">
              <Text className="text-red-500/70 text-sm">
                • Your profile and account
              </Text>
              <Text className="text-red-500/70 text-sm">
                • All drinking logs and streaks
              </Text>
              <Text className="text-red-500/70 text-sm">
                • Achievements and badges
              </Text>
              <Text className="text-red-500/70 text-sm">
                • Friends and connections
              </Text>
              <Text className="text-red-500/70 text-sm">
                • All statistics and history
              </Text>
            </View>
          </View>
        </View>
      </CustomModal>
    </>
  );
}
