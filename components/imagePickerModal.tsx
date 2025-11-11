import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void; // Changed from (value: React.SetStateAction<boolean>) => void
  onSelectCamera: () => void | Promise<void>; // Simplified
  onSelectLibrary: () => void | Promise<void>; // Simplified
}

export const ImagePickerModal = ({
  visible,
  onClose,
  onSelectCamera,
  onSelectLibrary,
}: ImagePickerModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/70 items-center justify-center"
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="bg-[#1a1a1a] rounded-2xl p-5 mx-4 w-[90%] max-w-md border border-white/[0.08]">
          <Text className="text-white text-xl font-black mb-4">
            Choose Image Source
          </Text>

          <TouchableOpacity
            onPress={onSelectCamera}
            className="flex-row items-center bg-white/[0.05] rounded-xl p-4 mb-3 border border-white/[0.08]"
            activeOpacity={0.7}
          >
            <View className="w-12 h-12 rounded-xl bg-orange-600/20 items-center justify-center mr-3">
              <Feather name="camera" size={24} color="#ff8c00" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-bold">Camera</Text>
              <Text className="text-white/50 text-sm">Take a new photo</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSelectLibrary}
            className="flex-row items-center bg-white/[0.05] rounded-xl p-4 mb-3 border border-white/[0.08]"
            activeOpacity={0.7}
          >
            <View className="w-12 h-12 rounded-xl bg-orange-600/20 items-center justify-center mr-3">
              <Feather name="image" size={24} color="#ff8c00" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-bold">
                Photo Library
              </Text>
              <Text className="text-white/50 text-sm">Choose from gallery</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.08]"
            activeOpacity={0.7}
          >
            <Text className="text-white/50 text-center font-semibold">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
