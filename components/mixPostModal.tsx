import { useApp } from "@/providers/AppProvider";
import { YourMixPostData } from "@/types/api.types";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  // REMOVE Animated FROM HERE IF YOU HAVE IT
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Ensure this is the ONLY Animated import for reanimated components
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  ZoomIn,
} from "react-native-reanimated"; // <-- Keep this one

import { useSafeAreaInsets } from "react-native-safe-area-context";

// Define the props interface for better type safety
interface MixPostModalProps {
  expandedItem: YourMixPostData | undefined;
  expandedId: string | null;
  setExpandedId: React.Dispatch<React.SetStateAction<string | null>>;
  currentAspectRatio: number; // Add this prop
}

export default function MixPostModal({
  expandedItem,
  expandedId,
  setExpandedId,
  currentAspectRatio,
}: MixPostModalProps) {
  console.log(expandedItem);
  console.log(expandedId);
  const { userData } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      visible={expandedId !== null}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setExpandedId(null)}
    >
      <View className="flex-1 bg-black/95">
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
            paddingHorizontal: 16,
          }}
        >
          {expandedItem && (
            <Animated.View // This is the component causing the error
              entering={ZoomIn.duration(400).springify()}
              className="bg-[#0a0a0a] rounded-3xl overflow-hidden "
            >
              {/* Close Button */}
              <Animated.View
                entering={FadeIn.delay(200).duration(300)}
                className="absolute top-4 right-4 z-20"
              >
                <TouchableOpacity
                  onPress={() => setExpandedId(null)}
                  className="bg-black/50 p-2 rounded-full border border-white/10"
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-outline" size={24} color="white" />
                </TouchableOpacity>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(100).duration(400)}
                className="p-1"
              >
                <View className="rounded-2xl overflow-hidden bg-white/5">
                  <Image
                    source={{ uri: expandedItem.imageUrl }}
                    style={{
                      width: "100%",
                      aspectRatio: currentAspectRatio,
                    }}
                    resizeMode="contain"
                  />
                </View>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(200).duration(400)}
                className="p-6 space-y-4"
              >
                <View className="flex-row items-center gap-3 mb-4">
                  <TouchableOpacity
                    onPress={() =>
                      router.push(
                        `/(screens)/userInfo?userId=${expandedItem.userId}`
                      )
                    }
                  >
                    <Animated.Image
                      entering={ZoomIn.delay(300).duration(400)}
                      source={{ uri: expandedItem.userImageUrl }}
                      className="w-12 h-12 rounded-full border-2 border-orange-600"
                    />
                  </TouchableOpacity>

                  <Animated.View entering={FadeInLeft.delay(350).duration(400)}>
                    <Text className="text-white font-bold">
                      {expandedItem?.username}
                    </Text>
                    <Text className="text-white/50 text-sm">
                      {formatTime(expandedItem.loggedAt)}
                    </Text>
                  </Animated.View>
                </View>

                {expandedItem.mentionedBuddies.length > 0 && (
                  <Animated.View
                    entering={FadeInDown.delay(400).duration(400)}
                    className="bg-white/[0.05] rounded-xl p-3"
                  >
                    <View className="flex-row items-center gap-2 mb-3">
                      <FontAwesome5 name="user" size={24} color="white" />
                      <Text className="text-white/50 text-xs font-semibold">
                        WITH BUDDIES
                      </Text>
                    </View>
                    <View className="flex-row flex-wrap gap-2">
                      {expandedItem.mentionedBuddies.map((buddy, idx) => (
                        <TouchableOpacity
                          onPress={() =>
                            router.push(
                              `/(screens)/userInfo?userId=${buddy.id}`
                            )
                          }
                        >
                          <Animated.View
                            key={buddy.id}
                            entering={FadeIn.delay(450 + idx * 50).duration(
                              300
                            )}
                            className="flex-row items-center gap-2 bg-white/[0.05] rounded-full pl-1 pr-3 py-1"
                          >
                            <Image
                              source={{ uri: buddy.imageUrl }}
                              className="w-6 h-6 rounded-full"
                            />
                            <Text className="text-white text-sm font-medium">
                              {buddy.firstName}
                            </Text>
                          </Animated.View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Animated.View>
                )}
              </Animated.View>
            </Animated.View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
