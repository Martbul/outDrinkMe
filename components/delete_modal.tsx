import React from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isDeleting?: boolean; 
  cancelText?: string;
  confirmText?: string;
}

export const DeleteModal = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting = false,
  cancelText = "CANCEL",
  confirmText = "DELETE",
}: DeleteModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 justify-center items-center px-6">
        <View className="bg-[#1A1A1A] w-full rounded-[40px] p-8 border border-white/10 items-center">
          
          {/* Icon Container */}
          <View className="w-16 h-16 bg-red-500/10 rounded-full items-center justify-center mb-6 border border-red-500/20">
            <Ionicons name="trash-outline" size={32} color="#ef4444" />
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
              disabled={isDeleting}
              className="flex-1 bg-white/10 py-4 rounded-2xl items-center"
            >
              <Text className="text-white font-black">{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-600 py-4 rounded-2xl items-center shadow-lg shadow-red-600/20 flex-row justify-center"
            >
              {isDeleting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-black">{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};