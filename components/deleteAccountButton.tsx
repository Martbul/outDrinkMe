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
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const { deleteUserAccount } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDeleteAccount = async () => {
    // if (confirmText.toLowerCase() !== "delete") {
    //   return;
    // }

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

  // const isConfirmValid = confirmText.toLowerCase() === "delete";

  return (
    <>
      <TouchableOpacity
        className="bg-red-900/20 rounded-2xl p-5 border border-red-900/50 flex-row justify-between items-center"
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
          setConfirmText("");
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
                setConfirmText("");
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

          {/* Confirmation Input */}
          {/* <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <Text className="text-white text-sm font-bold mb-3">
              Type <Text className="text-red-500">DELETE</Text> to confirm:
            </Text>
            <TextInput
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="Type DELETE here"
              placeholderTextColor="#6B7280"
              autoCapitalize="none"
              autoCorrect={false}
              className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-base"
            />
            {confirmText.length > 0 && !isConfirmValid && (
              <Text className="text-red-500/70 text-xs mt-2">
                Please type DELETE exactly as shown
              </Text>
            )}
          </View> */}
        </View>
      </CustomModal>
    </>
  );
}
