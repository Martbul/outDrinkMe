import { apiService } from "@/api";
import DrunkThought from "@/components/drunkThought";
import { Header } from "@/components/header";
import InfoTooltip from "@/components/infoTooltip";
import QrSessionManager from "@/components/qrCodeManager";
import ThisWeekGadget from "@/components/thisWeekGadget";
import { useApp } from "@/providers/AppProvider";
import { useAnalytics } from "@/utils/analytics";
import { getCoefInfo } from "@/utils/levels";
import { useAuth } from "@clerk/clerk-expo";
import {
  AntDesign,
  Feather,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface GroupSession {
  id: string;
  name: string;
  hostName: string;
  expiresAt: Date;
  memberCount: number;
  thumbnailUrls: string[];
  isActive: boolean;
}

interface PhotoMessage {
  id: string;
  userId: string;
  userAvatar: string;
  imageUrl: string;
  timestamp: Date;
  caption?: string;
}

const MOCK_DISK_PHOTOS: PhotoMessage[] = [
  {
    id: "p1",
    userId: "u1",
    userAvatar: "https://i.pravatar.cc/150?img=11",
    imageUrl:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400",
    timestamp: new Date(),
    caption: "Cheers!",
  },
  {
    id: "p2",
    userId: "u2",
    userAvatar: "https://i.pravatar.cc/150?img=5",
    imageUrl: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400",
    timestamp: new Date(),
    caption: "DJ was crazy",
  },
  {
    id: "p3",
    userId: "u1",
    userAvatar: "https://i.pravatar.cc/150?img=11",
    imageUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400",
    timestamp: new Date(),
  },
  {
    id: "p4",
    userId: "u3",
    userAvatar: "https://i.pravatar.cc/150?img=8",
    imageUrl:
      "https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=400",
    timestamp: new Date(),
  },
];
export default function HomeScreen() {
  const { getToken } = useAuth();
  const [isCoefTooltipVisible, setIsCoefTooltipVisible] =
    useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState<string | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<GroupSession | null>(
    null
  );

  const slideAnim = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;

  const openModal = () => {
    setQrModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get("window").height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setQrModalVisible(false));
  };
  if (selectedSession) {
    return (
      <SessionDiskView
        session={selectedSession}
        onBack={() => setSelectedSession(null)}
      />
    );
  }

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    userStats,
    userData,
    friends,
    friendsDrunkThoughts,
    isLoading,
    leaderboard,
    refreshAll,
  } = useApp();

  const coefInfo = getCoefInfo(userData?.alcoholism_coefficient);
  console.log("||||", leaderboard);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const displayedThoughts = useMemo(() => {
    if (!friendsDrunkThoughts || friendsDrunkThoughts.length === 0) {
      return [];
    }

    const count = Math.min(
      Math.floor(Math.random() * 2) + 1,
      friendsDrunkThoughts.length
    );

    const result = [];
    const usedIndices = new Set<number>();

    while (result.length < count) {
      const randomIndex = Math.floor(
        Math.random() * friendsDrunkThoughts.length
      );
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        result.push(friendsDrunkThoughts[randomIndex]);
      }
    }

    return result;
  }, [friendsDrunkThoughts]);

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

  if (isLoading && !userStats) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#EA580C" />
        <Text className="text-white/50 text-sm mt-4">
          Loading your stats...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Header />

      {displayedThoughts.map((thought) => (
        <DrunkThought
          key={thought.id}
          thought={thought.thought}
          userImageUrl={thought.user_image_url}
        />
      ))}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 100 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EA580C"
            colors={["#EA580C"]}
          />
        }
      >
        <View className="items-center mb-6">
          <View className="flex flex-row items-center gap-8">
            {/* <View className="rounded-full bg-orange-600/15 border-orange-600 ">
              <TouchableOpacity
                onPress={openModal}
                className=" w-16 h-16 rounded-full  items-center justify-center"
              >
                <Ionicons name="images-outline" size={24} color="#EA580C" />
              </TouchableOpacity>
            </View> */}
            <View className="rounded-full bg-orange-600/15 border-orange-600 ">
              <TouchableOpacity
                onPress={() => router.push("/(screens)/drinkingGames")}
                className=" w-16 h-16 rounded-full  items-center justify-center"
              >
                <Ionicons name="dice-outline" size={32} color="#EA580C" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(screens)/coeffInfo")}
              className="relative w-[120px] h-[120px] rounded-full bg-orange-600/15 border-4 border-orange-600 justify-center items-center mb-3"
            >
              <Text className="text-orange-600 text-5xl font-black">
                {coefInfo.coef}
              </Text>

              <TouchableOpacity
                onPress={() => setIsCoefTooltipVisible(!isCoefTooltipVisible)}
                className="absolute  w-8 h-8 rounded-full  items-center justify-center"
                style={{ zIndex: 10, right: -14, bottom: -10 }}
              >
                <Feather name="help-circle" size={24} color="#666666" />
              </TouchableOpacity>

              {isCoefTooltipVisible && (
                <InfoTooltip
                  title="Coefficient"
                  visible={isCoefTooltipVisible}
                  description="Your drinking coefficient calculated from your drunk performance. Higher number means more fun nights!"
                  onClose={() => setIsCoefTooltipVisible(false)}
                  position="bottom"
                />
              )}
            </TouchableOpacity>
            <View className="rounded-full bg-orange-600/15 border-orange-600 ">
              <TouchableOpacity
                onPress={() => router.push("/(screens)/sideQuestBoard")}
                className="w-16 h-16 rounded-full  items-center justify-center"
              >
                <MaterialCommunityIcons
                  name="sword"
                  size={34}
                  color="#EA580C"
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text className="text-white text-[22px] font-black tracking-wide">
            {coefInfo.title}
          </Text>
        </View>

        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            onPress={() => router.push("/(screens)/mixTimeline")}
            className="flex-1 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]"
          >
            <View className="w-12 h-12 rounded-xl bg-orange-600/20 items-center justify-center mb-3">
              <AntDesign name="align-center" size={24} color="#EA580C" />
            </View>
            <Text className="text-white text-base font-bold">Mix Timeline</Text>
            <Text className="text-white/40 text-xs font-semibold mt-1">
              View your history
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(screens)/stats")}
            className="flex-1 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]"
          >
            <View className="w-12 h-12 rounded-xl bg-orange-600/20 items-center justify-center mb-3">
              <MaterialIcons name="query-stats" size={24} color="#EA580C" />
            </View>
            <Text className="text-white text-base font-bold">Statistics</Text>
            <Text className="text-white/40 text-xs font-semibold mt-1">
              Detailed insights
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            className="flex-1 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]"
            onPress={() => router.push("/(screens)/buddies&discoverScreen")}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white text-2xl font-black">Buddies</Text>
                <Text className="text-white/40 text-xs font-semibold mt-1">
                  {friends.length || 0} friends
                </Text>
              </View>
              <View className="w-12 h-12 rounded-xl bg-orange-600/20 items-center justify-center">
                <Ionicons name="people" size={24} color="#EA580C" />
              </View>
            </View>
          </TouchableOpacity>

          {/* <TouchableOpacity
            onPress={() => router.push("/(screens)/store")}
            className="w-20 bg-white/[0.03] rounded-2xl border border-white/[0.08] items-center justify-center"
          >
            <View className="w-12 h-12 rounded-xl bg-orange-600/20 items-center justify-center">
              <SimpleLineIcons
                name="envelope-letter"
                size={24}
                color="#EA580C"
              />
            </View>
          </TouchableOpacity> */}
        </View>
        {/* <TouchableOpacity
          onPress={() => router.push("/(screens)/drinkingGames")}
          className="flex-1 bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08]"
        >
          <Text className="text-white/40 text-[10px] font-bold tracking-widest mb-0.5">
            DRINKING GAMES
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(screens)/profileBuilder")}
          className="flex-1 bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08]"
        >
          <Text className="text-white/40 text-[10px] font-bold tracking-widest mb-0.5">
            PROFILE BUILDER
          </Text>
        </TouchableOpacity> */}

        <ThisWeekGadget />

        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            onPress={() => router.push("/(screens)/ranking")}
            className="flex-1 bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08]"
          >
            <View className="w-10 h-10 rounded-xl bg-orange-600/20 items-center justify-center mb-2">
              <MaterialIcons name="leaderboard" size={20} color="#EA580C" />
            </View>
            <Text className="text-white/40 text-[10px] font-bold tracking-widest mb-0.5">
              RANK
            </Text>
            <Text className="text-white text-2xl font-black">
              #{leaderboard?.global?.user_position?.rank}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/calendar")}
            className="flex-1 bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08]"
          >
            <View className="w-10 h-10 rounded-xl bg-orange-600/20 items-center justify-center mb-2">
              <Ionicons name="calendar" size={20} color="#EA580C" />
            </View>
            <Text className="text-white/40 text-[10px] font-bold tracking-widest mb-0.5">
              TOTAL
            </Text>
            <Text className="text-white text-2xl font-black">
              {userStats?.total_days_drank || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(screens)/stats")}
            className="flex-1 bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08]"
          >
            <View className="w-10 h-10 rounded-xl bg-orange-600/20 items-center justify-center mb-2">
              <Ionicons name="trophy" size={20} color="#EA580C" />
            </View>
            <Text className="text-white/40 text-[10px] font-bold tracking-widest mb-0.5">
              WINS
            </Text>
            <Text className="text-white text-2xl font-black">
              {userStats?.total_weeks_won || 0}
            </Text>
          </TouchableOpacity>
        </View>
        {/* 
        <View className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/[0.08]">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white/50 text-[11px] font-bold tracking-[1.5px] mb-2">
                CURRENT STREAK
              </Text>

              <View className="flex-row items-center">
                <Text className="text-white text-[32px] font-black">
                  {userStats?.current_streak || 0} Days
                </Text>
                <MaterialCommunityIcons name="fire" size={56} color="#EA580C" />
              </View>
            </View>
            {userStats && userStats.current_streak > 0 && (
              <View className="bg-orange-600/20 px-3.5 py-1.5 rounded-lg">
                <Text className="text-orange-600 text-[11px] font-black tracking-wide">
                  ACTIVE
                </Text>
              </View>
            )}
          </View>
        </View> */}

        <View className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/[0.08]">
          <Text className="text-white text-lg font-black mb-4">
            Your Progress
          </Text>

          <View className="space-y-3">
            <View className="flex-row justify-between items-center py-2.5 border-b border-white/[0.05]">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-orange-600/20 items-center justify-center mr-3">
                  <Ionicons name="calendar-outline" size={16} color="#EA580C" />
                </View>
                <Text className="text-white/60 text-sm font-semibold">
                  This Month
                </Text>
              </View>
              <Text className="text-white text-lg font-black">
                {userStats?.days_this_month || 0}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-2.5 border-b border-white/[0.05]">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-orange-600/20 items-center justify-center mr-3">
                  <Ionicons
                    name="stats-chart-outline"
                    size={16}
                    color="#EA580C"
                  />
                </View>
                <Text className="text-white/60 text-sm font-semibold">
                  This Year
                </Text>
              </View>
              <Text className="text-white text-lg font-black">
                {userStats?.days_this_year || 0}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-2.5 border-b border-white/[0.05]">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-orange-600/20 items-center justify-center mr-3">
                  <MaterialCommunityIcons
                    name="fire"
                    size={18}
                    color="#EA580C"
                  />
                </View>
                <Text className="text-white/60 text-sm font-semibold">
                  Longest Streak
                </Text>
              </View>
              <Text className="text-white text-lg font-black">
                {userStats?.longest_streak || 0}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-2.5">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-orange-600/20 items-center justify-center mr-3">
                  <Ionicons name="ribbon-outline" size={16} color="#EA580C" />
                </View>
                <Text className="text-white/60 text-sm font-semibold">
                  Achievements
                </Text>
              </View>
              <Text className="text-white text-lg font-black">
                {userStats?.achievements_count || 0}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          className={`rounded-2xl py-6 items-center mb-4 shadow-lg ${
            userStats?.today_status
              ? "bg-white/[0.05] border border-white/[0.08]"
              : "bg-orange-600 shadow-orange-600/40"
          }`}
          onPress={() => router.push("/(tabs)/add")}
          disabled={isLoading}
          style={{
            shadowColor: userStats?.today_status ? "transparent" : "#EA580C",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {isLoading ? (
            <ActivityIndicator
              color={userStats?.today_status ? "#EA580C" : "#000000"}
            />
          ) : (
            <View className="items-center">
              {userStats?.today_status ? (
                <>
                  <Ionicons name="checkmark-circle" size={32} color="#EA580C" />
                  <Text className="text-white text-base font-black tracking-wider mt-2">
                    LOGGED TODAY
                  </Text>
                  <Text className="text-white/40 text-xs font-semibold mt-1">
                    Great job, my alcoholic!
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="add-circle" size={32} color="#000000" />
                  <Text className="text-black text-lg font-black tracking-wider mt-2">
                    LOG TODAY'S DRINKS
                  </Text>
                  <Text className="text-black/60 text-xs font-semibold mt-1">
                    Keep your streak alive
                  </Text>
                </>
              )}
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        onPress={() => setFeedbackModalVisible(true)}
        className="absolute bg-orange-600 rounded-full shadow-lg"
        style={{
          bottom: 100 + insets.bottom,
          right: 16,
          width: 56,
          height: 56,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#EA580C",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <FontAwesome6 name="wrench" size={26} color="black" />
      </TouchableOpacity>

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
                // Thank You Screen
                <View className="px-6 py-16 items-center">
                  <View className="w-20 h-20 rounded-full bg-orange-600/20 items-center justify-center mb-4">
                    <Ionicons
                      name="checkmark-circle"
                      size={48}
                      color="#EA580C"
                    />
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
                  {/* Header */}
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

                  {/* Category Selection */}
                  <View className="px-6 pt-5 pb-3">
                    <Text className="text-white/60 text-sm font-semibold mb-3">
                      What's this about?
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

                  {/* Text Input */}
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

                  {/* Submit Button */}
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

      <Modal visible={qrModalVisible} transparent onRequestClose={closeModal}>
        <View className="flex-1 justify-end bg-black/80">
          <TouchableOpacity className="flex-1" onPress={closeModal} />

          <Animated.View
            style={{ transform: [{ translateY: slideAnim }] }}
            className="bg-[#121212] rounded-t-[40px] border-t border-white/10 min-h-[70%] max-h-[90%]"
          >
            <QrSessionManager onClose={closeModal} />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

function SessionDiskView({
  session,
  onBack,
}: {
  session: GroupSession;
  onBack: () => void;
}) {
  // Calculate grid dimensions
  const windowWidth = Dimensions.get("window").width;
  const itemSize = (windowWidth - 32) / 2; // 2 column grid with padding

  return (
    <View className="flex-1 bg-black">
      {/* Navbar */}
      <View className="pt-14 pb-2 px-4 flex-row items-center justify-between z-10 bg-black/80">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-[#1A1A1A] items-center justify-center"
        >
          <Feather name="arrow-left" size={20} color="white" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-white font-bold text-lg">{session.name}</Text>
          <Text className="text-orange-500 text-xs font-bold tracking-widest">
            EXPIRES IN 23H 14M
          </Text>
        </View>

        <TouchableOpacity className="w-10 h-10 rounded-full bg-[#1A1A1A] items-center justify-center">
          <Ionicons name="settings-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Banner / Info */}
        <View className="bg-[#1A1A1A] rounded-2xl p-4 mb-6 flex-row items-center justify-between border border-white/5">
          <View className="flex-row items-center">
            <View className="flex-row -space-x-2 mr-3">
              {session.thumbnailUrls.map((url, i) => (
                <Image
                  key={i}
                  source={{ uri: url }}
                  className="w-8 h-8 rounded-full border border-black"
                />
              ))}
            </View>
            <Text className="text-gray-400 text-xs">
              {session.memberCount} members active
            </Text>
          </View>
          <TouchableOpacity className="bg-white/10 px-3 py-1.5 rounded-full">
            <Text className="text-white text-xs font-bold">Invite +</Text>
          </TouchableOpacity>
        </View>

        {/* The Disk Grid (Masonry-ish) */}
        <View className="flex-row flex-wrap justify-between">
          {MOCK_DISK_PHOTOS.map((photo) => (
            <View
              key={photo.id}
              className="mb-4 relative"
              style={{ width: itemSize }}
            >
              <Image
                source={{ uri: photo.imageUrl }}
                style={{ width: itemSize, height: itemSize * 1.3 }}
                className="rounded-2xl bg-[#1A1A1A]"
                resizeMode="cover"
              />

              {/* Overlay Gradient for Text */}
              <View className="absolute bottom-0 w-full h-16 rounded-b-2xl bg-black/40" />

              {/* Uploader Info */}
              <View className="absolute bottom-2 left-2 flex-row items-center">
                <Image
                  source={{ uri: photo.userAvatar }}
                  className="w-6 h-6 rounded-full border border-white mr-2"
                />
                {photo.caption && (
                  <Text
                    className="text-white text-xs font-bold shadow-sm"
                    numberOfLines={1}
                  >
                    {photo.caption}
                  </Text>
                )}
              </View>
            </View>
          ))}

          {/* Add Button in Grid */}
          <TouchableOpacity
            style={{ width: itemSize, height: itemSize * 1.3 }}
            className="rounded-2xl bg-[#111] border border-white/10 border-dashed items-center justify-center mb-4"
          >
            <View className="w-14 h-14 rounded-full bg-[#222] items-center justify-center mb-2">
              <Ionicons name="camera" size={28} color="#EA580C" />
            </View>
            <Text className="text-gray-500 font-bold text-xs">Add to Disk</Text>
          </TouchableOpacity>
        </View>
        <View className="h-20" />
      </ScrollView>

      {/* Floating Upload Button (Alternative) */}
      <View className="absolute bottom-8 self-center">
        <TouchableOpacity className="bg-orange-600 px-6 py-3 rounded-full flex-row items-center shadow-lg shadow-orange-600/30">
          <Ionicons name="cloud-upload" size={20} color="white" />
          <Text className="text-white font-bold ml-2">Upload Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

