import { apiService } from "@/api";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Feedback({
  feedbackModalVisible,
  setFeedbackModalVisible,
}: {
  feedbackModalVisible: boolean;
  setFeedbackModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const insets = useSafeAreaInsets();
  const { getToken } = useAuth();
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState<string | null>(null);

  const feedbackCategories = [
    { id: "bug", label: "Bug Report", icon: "bug-outline" },
    { id: "feature", label: "Feature Request", icon: "bulb-outline" },
    { id: "improvement", label: "Improvement", icon: "rocket-outline" },
    { id: "other", label: "Other", icon: "chatbox-outline" },
  ];

  const handleSubmitFeedback = async () => {
    const token = await getToken();
    if (!token) return;

    if (!feedbackText.trim() || !feedbackCategory) return;

    setIsSubmittingFeedback(true);

    await apiService.submitFeedback(feedbackCategory, feedbackText, token);

    setIsSubmittingFeedback(false);
    setFeedbackSubmitted(true);

    setTimeout(() => {
      setFeedbackModalVisible(false);
      setFeedbackText("");
      setFeedbackCategory(null);
      setFeedbackSubmitted(false);
    }, 2300);
  };

  const closeFeedbackModal = () => {
    setFeedbackModalVisible(false);
    setFeedbackText("");
    setFeedbackCategory(null);
    setFeedbackSubmitted(false);
  };

  return (
    <Modal
      visible={feedbackModalVisible}
      transparent
      animationType="slide"
      onRequestClose={closeFeedbackModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeFeedbackModal}
          className="flex-1 bg-black/80 justify-end"
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-black/95 rounded-t-3xl border-t-2 border-orange-600/30"
            style={{
              paddingBottom: insets.bottom + 20,
            }}
          >
            {feedbackSubmitted ? (
              <View className="px-6 py-16 items-center">
                <View className="w-20 h-20 rounded-full bg-orange-600/20 items-center justify-center mb-4">
                  <Ionicons name="checkmark-circle" size={48} color="#EA580C" />
                </View>
                <Text className="text-white text-2xl font-black mb-2">
                  Thank You!
                </Text>
                <Text className="text-white/60 text-center text-sm">
                  Your feedback has been received.{"\n"}We appreciate your
                  input!
                </Text>
              </View>
            ) : (
              <>
                <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.08]">
                  <Text className="text-white text-2xl font-black">
                    Tell us how to suck less
                  </Text>
                  <TouchableOpacity
                    onPress={closeFeedbackModal}
                    className="w-10 h-10 rounded-full bg-white/[0.05] items-center justify-center"
                  >
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View className="px-6 pt-5 pb-3">
                  <Text className="text-white/60 text-sm font-semibold mb-3">
                    What&apos;s this about?
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {feedbackCategories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() => setFeedbackCategory(category.id)}
                        className={`flex-row items-center px-4 py-2.5 rounded-xl border ${
                          feedbackCategory === category.id
                            ? "bg-orange-600 border-orange-600"
                            : "bg-white/[0.03] border-white/[0.08]"
                        }`}
                      >
                        <Ionicons
                          name={category.icon as any}
                          size={16}
                          color={
                            feedbackCategory === category.id
                              ? "#000000"
                              : "#EA580C"
                          }
                        />
                        <Text
                          className={`ml-2 text-sm font-bold ${
                            feedbackCategory === category.id
                              ? "text-black"
                              : "text-white"
                          }`}
                        >
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View className="px-6 pb-5">
                  <Text className="text-white/60 text-sm font-semibold mb-3">
                    Tell us more
                  </Text>
                  <TextInput
                    className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-white min-h-[120px]"
                    placeholder="Share your thoughts, ideas, or issues..."
                    placeholderTextColor="#666666"
                    multiline
                    textAlignVertical="top"
                    value={feedbackText}
                    onChangeText={setFeedbackText}
                    maxLength={500}
                  />
                  <Text className="text-white/40 text-xs mt-2 text-right">
                    {feedbackText.length}/500
                  </Text>
                </View>

                <View className="px-6">
                  <TouchableOpacity
                    onPress={handleSubmitFeedback}
                    disabled={
                      !feedbackText.trim() ||
                      !feedbackCategory ||
                      isSubmittingFeedback
                    }
                    className={`rounded-2xl py-4 items-center ${
                      !feedbackText.trim() || !feedbackCategory
                        ? "bg-white/[0.05]"
                        : "bg-orange-600"
                    }`}
                  >
                    {isSubmittingFeedback ? (
                      <ActivityIndicator color="#000000" />
                    ) : (
                      <Text
                        className={`text-base font-black tracking-wider ${
                          !feedbackText.trim() || !feedbackCategory
                            ? "text-white/40"
                            : "text-black"
                        }`}
                      >
                        SEND FEEDBACK
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
