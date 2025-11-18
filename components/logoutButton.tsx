import { useAuth } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import CustomModal, { ModalDangerButton, ModalSecondaryButton } from "./customModal";


export default function LogoutButton() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      setShowModal(false);
      router.replace("/(auth)/google-sign-in");
    } catch (error: any) {
      console.error("Logout error:", error);
      // You could show an error modal here if needed
      setIsLoading(false);
    }
  };

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
            <Text className="text-red-500 font-bold">Logout</Text>
            <Feather name="arrow-right" size={20} color="#EF4444" />
          </>
        )}
      </TouchableOpacity>

      <CustomModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Logout"
        footer={
          <View className="gap-3">
            <ModalDangerButton
              title="Logout"
              onPress={handleLogout}
              disabled={isLoading}
            />
            <ModalSecondaryButton
              title="Cancel"
              onPress={() => setShowModal(false)}
            />
          </View>
        }
      >
        <View className="py-4">
          <View className="bg-red-900/10 rounded-2xl p-5 border border-red-900/30 mb-4">
            <Text className="text-red-500 text-lg font-bold mb-2">
              Confirm Logout
            </Text>
            <Text className="text-red-500/70 text-base leading-6">
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </Text>
          </View>

          <View className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08]">
            <Text className="text-white/50 text-xs leading-5">
              Your data will be safe and waiting for you when you return. Keep the streak alive!
            </Text>
          </View>
        </View>
      </CustomModal>
    </>
  );
}