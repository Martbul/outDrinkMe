import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  footer?: React.ReactNode;
  fullHeight?: boolean;
  loading?: boolean;
}

export default function CustomModal({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnBackdrop = true,
  footer,
  fullHeight = false,
  loading = false,
}: CustomModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      transparent={!fullHeight}
    >
      <TouchableWithoutFeedback
        onPress={closeOnBackdrop ? onClose : undefined}
      >
        <View
          className={`flex-1 ${fullHeight ? "bg-black" : "bg-black/50"} justify-end`}
        >
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              className={`bg-black ${fullHeight ? "flex-1" : "rounded-t-3xl max-h-[85%]"} border-t-2 border-orange-600/30`}
              style={{
                paddingTop: fullHeight ? insets.top : 0,
                paddingBottom: fullHeight ? insets.bottom : 0,
              }}
            >
              {/* Header */}
              <View className="px-4 py-4 border-b border-white/[0.08] flex-row justify-between items-center">
                {title ? (
                  <View>
                    <Text className="text-[#ff8c00] text-2xl font-black">
                      {title}
                    </Text>
                  </View>
                ) : (
                  <View />
                )}
                
                {showCloseButton && (
                  <TouchableOpacity
                    onPress={onClose}
                    className="w-10 h-10 rounded-xl bg-white/[0.03] items-center justify-center border border-white/[0.08]"
                  >
                    <Feather name="x" size={24} color="#ff8c00" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Content */}
              {loading ? (
                <View className="flex-1 items-center justify-center py-16">
                  <ActivityIndicator size="large" color="#ff8c00" />
                  <Text className="text-white/50 text-sm mt-4">Loading...</Text>
                </View>
              ) : (
                <ScrollView
                  className="flex-1 px-4"
                  contentContainerStyle={{
                    paddingTop: 16,
                    paddingBottom: footer ? 0 : 16 + insets.bottom,
                  }}
                  showsVerticalScrollIndicator={false}
                >
                  {children}
                </ScrollView>
              )}

              {/* Footer */}
              {footer && !loading && (
                <View
                  className="px-4 py-4 border-t border-white/[0.08]"
                  style={{ paddingBottom: 16 + insets.bottom }}
                >
                  {footer}
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// Preset button components for consistency
export const ModalPrimaryButton = ({
  onPress,
  title,
  disabled = false,
  loading = false,
}: {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  loading?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    className={`rounded-2xl py-5 items-center ${
      disabled ? "bg-orange-600/30" : "bg-orange-600"
    }`}
  >
    {loading ? (
      <ActivityIndicator color="#000" />
    ) : (
      <Text className="text-black text-base font-black tracking-widest uppercase">
        {title}
      </Text>
    )}
  </TouchableOpacity>
);

export const ModalSecondaryButton = ({
  onPress,
  title,
  disabled = false,
}: {
  onPress: () => void;
  title: string;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={`rounded-2xl py-5 items-center border ${
      disabled
        ? "bg-white/[0.03] border-white/[0.03]"
        : "bg-white/[0.03] border-white/[0.08]"
    }`}
  >
    <Text
      className={`text-base font-black tracking-widest uppercase ${
        disabled ? "text-white/30" : "text-[#ff8c00]"
      }`}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

export const ModalDangerButton = ({
  onPress,
  title,
  disabled = false,
}: {
  onPress: () => void;
  title: string;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={`rounded-2xl py-5 items-center ${
      disabled ? "bg-red-600/30" : "bg-red-600"
    }`}
  >
    <Text className="text-black text-base font-black tracking-widest uppercase">
      {title}
    </Text>
  </TouchableOpacity>
);