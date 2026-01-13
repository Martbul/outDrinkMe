import React from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AlertModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
  cancelText?: string;
  confirmText?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const AlertModal = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
  cancelText = "CANCEL",
  confirmText = "CONFIRM",
  icon = "information-circle-outline", // Default icon
}: AlertModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white/[0.03] justify-center items-center px-6">
        <View className="bg-[#1A1A1A] w-full rounded-[40px] p-8 border border-white/10 items-center">
          
          {/* Icon Container - Orange theme */}
          <View className="w-16 h-16 bg-orange-500/10 rounded-full items-center justify-center mb-6 border border-orange-500/20">
            <Ionicons name={icon} size={32} color="#EA580C" />
          </View>

          {/* Text Content */}
          <Text className="text-white text-2xl font-black mb-2 text-center">
            {title}
          </Text>
          <Text className="text-white/50 text-center mb-8 px-4 leading-5">
            {message}
          </Text>

          {/* Buttons */}
          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              onPress={onClose}
              disabled={isLoading}
              className="flex-1 bg-white/10 py-4 rounded-2xl items-center"
            >
              <Text className="text-white font-black">{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-orange-600 py-4 rounded-2xl items-center shadow-lg shadow-orange-600/20 flex-row justify-center"
            >
              {isLoading ? (
                <ActivityIndicator color="black" size="small" />
              ) : (
                <Text className="text-black font-black">{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};