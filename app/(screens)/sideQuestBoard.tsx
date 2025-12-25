import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { apiService } from "@/api";
import { usePostHog } from "posthog-react-native";
import { useApp } from "@/providers/AppProvider";

// ... [Types] ...
type QuestStatus = "OPEN" | "COMPLETED" | "EXPIRED" | "CANCELLED";
type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";
type PayoutStatus = "PENDING" | "SUCCESS" | "FAILED";

interface SideQuest {
  id: string;
  issuerId: string;
  issuerName?: string;
  issuerImage?: string;
  title: string;
  description: string;
  rewardAmount: number;
  isLocked: boolean;
  isPublic: boolean;
  isAnonymous: boolean;
  status: QuestStatus;
  expiresAt: string;
  createdAt: string;
  submissionCount?: number;
}

interface SideQuestCompletion {
  id: string;
  sideQuestId: string;
  questTitle?: string;
  completerId: string;
  completerName?: string;
  completerImage?: string;
  proofImageUrl: string;
  proofText?: string;
  status: SubmissionStatus;
  rejectionReason?: string;
  payoutStatus: PayoutStatus;
  paidAt?: string;
  createdAt: string;
  rewardAmount?: number;
}

// --- MOCKS ---
const MOCK_MY_QUESTS: SideQuest[] = [
  {
    id: "q_my_1",
    issuerId: "currentUser",
    issuerName: "You",
    title: "Bring me lunch from dining hall",
    description: "Chicken sandwich and fries please!",
    rewardAmount: 150,
    isLocked: true,
    isPublic: false,
    isAnonymous: false,
    status: "OPEN",
    expiresAt: new Date(Date.now() + 5400000).toISOString(),
    createdAt: new Date(Date.now() - 900000).toISOString(),
    submissionCount: 2,
  },
];

const MOCK_INCOMING_SUBMISSIONS: SideQuestCompletion[] = [
  {
    id: "sub_in_1",
    sideQuestId: "q_my_1",
    questTitle: "Bring me lunch from dining hall",
    completerId: "user5",
    completerName: "Sarah Miller",
    completerImage: "https://i.pravatar.cc/150?img=5",
    proofImageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400",
    proofText: "Got your sandwich! Waiting outside.",
    status: "PENDING",
    payoutStatus: "PENDING",
    createdAt: new Date(Date.now() - 600000).toISOString(),
    rewardAmount: 150,
  },
];

const MOCK_MY_ATTEMPTS: SideQuestCompletion[] = [
  {
    id: "att_1",
    sideQuestId: "1",
    questTitle: "Find me a phone charger",
    completerId: "currentUser",
    proofImageUrl:
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=400",
    proofText: "Found one in the computer lab!",
    status: "APPROVED",
    payoutStatus: "SUCCESS",
    paidAt: new Date(Date.now() - 300000).toISOString(),
    createdAt: new Date(Date.now() - 900000).toISOString(),
    rewardAmount: 50,
  },
];

const DURATION_PRESETS = [
  { label: "1 Hour", value: 1 },
  { label: "2 Hour", value: 2 },
  { label: "4 Hours", value: 4 },
  { label: "8 Hours", value: 8 },
  { label: "12 Hours", value: 12 },
  { label: "24 Hours", value: 24 },
  { label: "2 Days", value: 48 },
  { label: "5 Days", value: 120 },
];

const getTimeRemaining = (expiresAt: string) => {
  const now = Date.now();
  const expires = new Date(expiresAt).getTime();
  const diff = expires - now;

  if (diff <= 0)
    return { text: "Expired", color: "text-red-500", bg: "bg-red-500/10" };
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  if (hours < 1)
    return {
      text: `${minutes}m left`,
      color: "text-red-500",
      bg: "bg-red-500/10",
    };
  if (hours < 24)
    return {
      text: `${hours}h ${minutes}m left`,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    };
  const days = Math.floor(hours / 24);
  return {
    text: `${days}d left`,
    color: "text-green-500",
    bg: "bg-green-500/10",
  };
};

// ... [Components] ...
const QuestCard = ({
  quest,
  onPress,
}: {
  quest: SideQuest;
  onPress: () => void;
}) => {
  const timeStatus = getTimeRemaining(quest.expiresAt);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="bg-[#1A1A1A] rounded-3xl p-4 mb-4 border border-white/[0.05]"
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center flex-1 mr-2">
          {!quest.isAnonymous && quest.issuerImage ? (
            <Image
              source={{ uri: quest.issuerImage }}
              className="w-10 h-10 rounded-full border border-white/10"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-orange-600/20 items-center justify-center border border-orange-500/30">
              <Ionicons name="person" size={20} color="#EA580C" />
            </View>
          )}
          <View className="ml-3 flex-1">
            <Text className="text-white text-base font-bold" numberOfLines={1}>
              {quest.isAnonymous ? "Anonymous" : quest.issuerName}
            </Text>
            <View
              className={`self-start mt-1 px-2 py-0.5 rounded-md ${timeStatus.bg}`}
            >
              <Text
                className={`${timeStatus.color} text-[10px] font-bold uppercase`}
              >
                {timeStatus.text}
              </Text>
            </View>
          </View>
        </View>
        <View className="bg-orange-600/10 px-3 py-1.5 rounded-xl border border-orange-500/20 flex-row items-center">
          <Ionicons name="diamond" size={14} color="#EA580C" />
          <Text className="text-orange-500 text-base font-black ml-1">
            {quest.rewardAmount}
          </Text>
        </View>
      </View>
      <Text className="text-white text-lg font-black mb-1.5">
        {quest.title}
      </Text>
      <Text className="text-gray-400 text-sm" numberOfLines={2}>
        {quest.description}
      </Text>
    </TouchableOpacity>
  );
};

const MyQuestItem = ({
  quest,
  onReviewPress,
}: {
  quest: SideQuest;
  onReviewPress: (sub: SideQuestCompletion) => void;
}) => {
  const submissions = MOCK_INCOMING_SUBMISSIONS.filter(
    (s) => s.sideQuestId === quest.id
  );
  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;
  const timeStatus = getTimeRemaining(quest.expiresAt);

  return (
    <View className="bg-[#1A1A1A] rounded-3xl p-5 mb-4 border border-white/[0.05]">
      <View className="flex-row justify-between items-start mb-2">
        <View className={`px-2 py-0.5 rounded-md ${timeStatus.bg}`}>
          <Text
            className={`${timeStatus.color} text-[10px] font-bold uppercase`}
          >
            {timeStatus.text}
          </Text>
        </View>
        {quest.status === "OPEN" ? (
          <View className="flex-row items-center">
            <View className="w-2 h-2 bg-green-500 rounded-full mr-1" />
            <Text className="text-green-500 text-xs font-bold">ACTIVE</Text>
          </View>
        ) : (
          <Text className="text-gray-500 text-xs font-bold">
            {quest.status}
          </Text>
        )}
      </View>

      <Text className="text-white text-xl font-black mb-1">{quest.title}</Text>
      <Text className="text-gray-400 text-sm mb-4">{quest.description}</Text>

      <View className="flex-row justify-between items-center border-t border-white/10 pt-4">
        <View>
          <Text className="text-gray-500 text-xs font-bold uppercase">
            Reward
          </Text>
          <Text className="text-white font-bold">
            {quest.rewardAmount} Gems
          </Text>
        </View>

        {pendingCount > 0 ? (
          <TouchableOpacity
            onPress={() => {
              const sub = submissions.find((s) => s.status === "PENDING");
              if (sub) onReviewPress(sub);
            }}
            className="bg-orange-600 px-4 py-2 rounded-xl flex-row items-center shadow-lg shadow-orange-600/20"
          >
            <Text className="text-white font-bold mr-2">
              Review ({pendingCount})
            </Text>
            <Feather name="arrow-right" size={16} color="white" />
          </TouchableOpacity>
        ) : (
          <View className="bg-white/5 px-4 py-2 rounded-xl">
            <Text className="text-gray-500 font-bold text-xs">
              No pending reviews
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const SubmissionStatusCard = ({
  submission,
}: {
  submission: SideQuestCompletion;
}) => {
  let statusColor = "text-yellow-500";
  let statusBg = "bg-yellow-500/10";
  let statusBorder = "border-yellow-500/20";
  let icon = "time-outline";

  if (submission.status === "APPROVED") {
    statusColor = "text-green-500";
    statusBg = "bg-green-500/10";
    statusBorder = "border-green-500/20";
    icon = "checkmark-circle";
  } else if (submission.status === "REJECTED") {
    statusColor = "text-red-500";
    statusBg = "bg-red-500/10";
    statusBorder = "border-red-500/20";
    icon = "close-circle";
  }

  return (
    <View className="bg-[#1A1A1A] rounded-3xl p-4 mb-4 border border-white/[0.05] overflow-hidden">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-gray-500 text-xs font-bold">
          {new Date(submission.createdAt).toLocaleDateString()}
        </Text>
        <View
          className={`flex-row items-center px-2 py-1 rounded-lg border ${statusBg} ${statusBorder}`}
        >
          <Ionicons
            name={icon as any}
            size={14}
            className={statusColor}
            style={{ marginRight: 4 }}
          />
          <Text className={`${statusColor} text-xs font-black uppercase`}>
            {submission.status}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        <Image
          source={{ uri: submission.proofImageUrl }}
          className="w-20 h-20 rounded-xl bg-gray-800"
          resizeMode="cover"
        />
        <View className="flex-1 justify-center">
          <Text className="text-white font-bold text-lg leading-6 mb-1">
            {submission.questTitle}
          </Text>

          {submission.status === "APPROVED" ? (
            <View className="flex-row items-center">
              <Text className="text-green-500 text-sm font-bold mr-1">
                +{submission.rewardAmount} Gems
              </Text>
              <Ionicons name="sparkles" size={12} color="#22c55e" />
            </View>
          ) : submission.status === "REJECTED" ? (
            <Text className="text-red-400 text-xs">
              {submission.rejectionReason || "Criteria not met"}
            </Text>
          ) : (
            <Text className="text-gray-400 text-xs">Waiting for review...</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const SideQuestBoard = () => {
  // --- 1. GET REAL DATA FROM APP PROVIDER ---
  const { sideQuestBoards, refreshUserData, refreshSideQuestBoard, isLoading } =
    useApp();
  const { getToken } = useAuth();
  const posthog = usePostHog();
  const router = useRouter();

  // --- STATE ---
  const [activeMainTab, setActiveMainTab] = useState<
    "board" | "myQuests" | "submissions"
  >("board");
  const [activeBoardTab, setActiveBoardTab] = useState<"friends" | "public">(
    "friends"
  );
  const [refreshing, setRefreshing] = useState(false);
  const [screenLoading, setScreenLoading] = useState(false);

  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  // Selection
  const [selectedReviewSub, setSelectedReviewSub] =
    useState<SideQuestCompletion | null>(null);

  // Form State
  const [newQuestTitle, setNewQuestTitle] = useState("");
  const [newQuestDescription, setNewQuestDescription] = useState("");
  const [newQuestReward, setNewQuestReward] = useState("5");
  const [selectedDurationHours, setSelectedDurationHours] = useState<number>(1);
  const [isPublic, setIsPublic] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // --- 2. CALCULATE WHICH QUESTS TO SHOW ---
  const boardQuestsToDisplay = useMemo(() => {
    if (!sideQuestBoards) return [];
    return activeBoardTab === "friends"
      ? sideQuestBoards.buddies || []
      : sideQuestBoards.random || [];
  }, [sideQuestBoards, activeBoardTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshSideQuestBoard(), refreshUserData()]);
    setRefreshing(false);
  };

  const handleReviewPress = (submission: SideQuestCompletion) => {
    setSelectedReviewSub(submission);
    setReviewModalVisible(true);
  };

  const handleCreateQuest = async () => {
    // --- VALIDATION START ---
    if (!newQuestTitle.trim()) {
      Alert.alert("Missing Title", "Please enter a title for your side quest.");
      return;
    }

    if (!newQuestDescription.trim()) {
      Alert.alert(
        "Missing Description",
        "Please enter a description so others know what to do."
      );
      return;
    }

    const rewardValue = Number(newQuestReward);
    if (!newQuestReward.trim() || isNaN(rewardValue) || rewardValue <= 0) {
      Alert.alert(
        "Invalid Reward",
        "Please enter a valid reward amount greater than 0."
      );
      return;
    }
    // --- VALIDATION END ---

    const token = await getToken();
    if (!token) return;
    setScreenLoading(true);

    try {
      const data = {
        title: newQuestTitle.trim(),
        description: newQuestDescription.trim(),
        rewardAmount: rewardValue,
        durationHours: selectedDurationHours,
        isPublic,
        isAnonymous,
      };

      await apiService.createSideQuest(data, token);
      await refreshSideQuestBoard();
      await refreshUserData();

      posthog?.capture("new_quest_created", { ...data });

      // Reset form
      setNewQuestTitle("");
      setNewQuestDescription("");
      setNewQuestReward("5");
      setSelectedDurationHours(1);
      setIsPublic(true);
      setIsAnonymous(false);
      setCreateModalVisible(false);
    } catch (error) {
      console.error("Error creating quest:", error);
      Alert.alert("Error", "Failed to post quest. Check your gem balance.");
    } finally {
      setScreenLoading(false);
    }
  };

  // --- VALIDATION HELPER FOR UI ---
  const isValid =
    newQuestTitle.trim().length > 0 &&
    newQuestDescription.trim().length > 0 &&
    !isNaN(Number(newQuestReward)) &&
    Number(newQuestReward) > 0;

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="px-5 pt-8 pb-4 bg-black border-b border-white/[0.08] z-10">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row gap-3 items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/[0.05] items-center justify-center"
            >
              <Feather name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
            <View>
              <Text className="text-orange-500 text-[10px] font-bold tracking-[2px] uppercase mb-0.5">
                Community
              </Text>
              <Text className="text-white text-2xl font-black tracking-tight">
                Quest Board
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setCreateModalVisible(true)}
            className="bg-orange-600 w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-orange-900/20"
          >
            <Ionicons name="add" size={30} color="white" />
          </TouchableOpacity>
        </View>

        {/* Main Tabs */}
        <View className="flex-row bg-[#1A1A1A] rounded-xl p-1.5">
          {(["board", "myQuests", "submissions"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveMainTab(tab)}
              className={`flex-1 py-2.5 rounded-lg ${
                activeMainTab === tab ? "bg-[#333333]" : ""
              }`}
            >
              <Text
                className={`text-center text-xs font-bold ${
                  activeMainTab === tab ? "text-white" : "text-gray-500"
                }`}
              >
                {tab === "board"
                  ? "Board"
                  : tab === "myQuests"
                    ? "My Quests"
                    : "My Tries"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EA580C"
                        progressBackgroundColor="#000000"

          />
        }
      >
        {/* --- BOARD TAB (REAL DATA) --- */}
        {activeMainTab === "board" && (
          <>
            <View className="flex-row mb-6 gap-3">
              {(["friends", "public"] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setActiveBoardTab(t)}
                  className={`px-5 py-2 rounded-full border ${
                    activeBoardTab === t
                      ? "bg-white border-white"
                      : "bg-transparent border-white/20"
                  }`}
                >
                  <Text
                    className={`text-sm font-bold capitalize ${
                      activeBoardTab === t ? "text-black" : "text-white"
                    }`}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {isLoading && !refreshing && boardQuestsToDisplay.length === 0 ? (
              <View className="mt-10">
                <ActivityIndicator size="large" color="#EA580C" />
              </View>
            ) : boardQuestsToDisplay.length > 0 ? (
              boardQuestsToDisplay.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onPress={() => {
                    // Navigate to details if needed
                  }}
                />
              ))
            ) : (
              <View className="items-center py-20 opacity-50">
                <Ionicons name="search" size={48} color="white" />
                <Text className="text-white mt-4 font-bold text-center">
                  No active quests found.{"\n"}Be the first to post one!
                </Text>
              </View>
            )}
          </>
        )}

        {/* --- MY QUESTS TAB (MOCK DATA) --- */}
        {activeMainTab === "myQuests" && (
          <>
            <View className="mb-6">
              <Text className="text-white text-3xl font-black mb-2">
                My Quests
              </Text>
              <Text className="text-gray-400">
                Manage quests you've posted and review submissions.
              </Text>
            </View>

            {MOCK_MY_QUESTS.map((quest) => (
              <MyQuestItem
                key={quest.id}
                quest={quest}
                onReviewPress={handleReviewPress}
              />
            ))}
          </>
        )}

        {/* --- SUBMISSIONS TAB (MOCK DATA) --- */}
        {activeMainTab === "submissions" && (
          <>
            <View className="mb-6 flex-row items-center justify-between">
              <View>
                <Text className="text-white text-3xl font-black mb-2">
                  My Tries
                </Text>
                <Text className="text-gray-400">Track your attempts.</Text>
              </View>
              <View className="bg-[#1A1A1A] px-4 py-2 rounded-xl border border-white/10">
                <Text className="text-white font-black text-lg text-center">
                  {
                    MOCK_MY_ATTEMPTS.filter((a) => a.status === "APPROVED")
                      .length
                  }
                </Text>
                <Text className="text-gray-500 text-[10px] uppercase font-bold">
                  Completed
                </Text>
              </View>
            </View>

            {MOCK_MY_ATTEMPTS.map((sub) => (
              <SubmissionStatusCard key={sub.id} submission={sub} />
            ))}
          </>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* --- Review Modal (For Issuer) --- */}
      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View className="flex-1 bg-[#121212]">
          {selectedReviewSub && (
            <>
              <View className="p-4 border-b border-white/10 flex-row justify-between items-center">
                <Text className="text-white font-bold text-lg">
                  Review Proof
                </Text>
                <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1 p-5">
                <View className="flex-row items-center mb-4">
                  {selectedReviewSub.completerImage && (
                    <Image
                      source={{ uri: selectedReviewSub.completerImage }}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                  )}
                  <View>
                    <Text className="text-white font-bold text-lg">
                      {selectedReviewSub.completerName}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      Submitted{" "}
                      {new Date(
                        selectedReviewSub.createdAt
                      ).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>

                <View className="bg-[#1A1A1A] p-1 rounded-2xl mb-4 border border-white/10">
                  <Image
                    source={{ uri: selectedReviewSub.proofImageUrl }}
                    className="w-full h-96 rounded-xl"
                    resizeMode="cover"
                  />
                </View>

                <View className="bg-[#1A1A1A] p-4 rounded-xl border border-white/10 mb-8">
                  <Text className="text-gray-500 text-xs font-bold uppercase mb-2">
                    Message
                  </Text>
                  <Text className="text-white text-base italic">
                    "{selectedReviewSub.proofText}"
                  </Text>
                </View>
              </ScrollView>

              <View className="p-5 border-t border-white/10 pb-10 flex-row gap-4">
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert("Rejected", "Submission marked as rejected.");
                    setReviewModalVisible(false);
                  }}
                  className="flex-1 bg-[#1A1A1A] border border-red-500/30 py-4 rounded-xl items-center"
                >
                  <Text className="text-red-500 font-bold text-lg">Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    Alert.alert("Approved", "Reward sent to user!");
                    setReviewModalVisible(false);
                  }}
                  className="flex-1 bg-green-600 py-4 rounded-xl items-center shadow-lg shadow-green-600/20"
                >
                  <Text className="text-white font-bold text-lg">Approve</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>

      {/* --- CREATE NEW QUEST MODAL --- */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-[#121212]"
        >
          <View className="px-5 py-5 border-b border-white/[0.08] flex-row items-center justify-between">
            <Text className="text-white text-xl font-black">
              New Side Quest
            </Text>
            <TouchableOpacity
              onPress={() => setCreateModalVisible(false)}
              className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
            >
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <ScrollView
            className="flex-1 px-5 pt-6"
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-6">
              <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                Quest Title
              </Text>
              <TextInput
                value={newQuestTitle}
                onChangeText={setNewQuestTitle}
                placeholder="e.g. Bring me a coffee"
                placeholderTextColor="#555"
                className="bg-[#1E1E1E] border border-white/10 rounded-xl p-4 text-white text-lg font-bold"
              />
            </View>
            <View className="mb-6">
              <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                Description
              </Text>
              <TextInput
                value={newQuestDescription}
                onChangeText={setNewQuestDescription}
                placeholder="Details..."
                placeholderTextColor="#555"
                multiline
                numberOfLines={4}
                className="bg-[#1E1E1E] border border-white/10 rounded-xl p-4 text-white text-base min-h-[100px]"
                style={{ textAlignVertical: "top" }}
              />
            </View>
            <View className="mb-6">
              <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                Reward (Gems)
              </Text>
              <TextInput
                value={newQuestReward}
                onChangeText={setNewQuestReward}
                placeholder="5"
                placeholderTextColor="#555"
                keyboardType="numeric"
                className="bg-[#1E1E1E] border border-white/10 rounded-xl p-4 text-white text-lg font-bold"
              />
            </View>
            <View className="mb-8">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                  Expires In
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {DURATION_PRESETS.map((duration) => (
                  <TouchableOpacity
                    key={duration.value}
                    onPress={() => setSelectedDurationHours(duration.value)}
                    className={`px-4 py-2.5 rounded-xl border ${selectedDurationHours === duration.value ? "bg-orange-600 border-orange-600" : "bg-[#1E1E1E] border-white/10"}`}
                  >
                    <Text
                      className={`text-xs font-bold ${selectedDurationHours === duration.value ? "text-white" : "text-gray-400"}`}
                    >
                      {duration.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* --- VISIBILITY --- */}
            <View className="mb-6">
              <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
                Visibility
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setIsPublic(true)}
                  className={`flex-1 p-4 rounded-xl border flex-row items-center justify-center ${isPublic ? "bg-orange-600/10 border-orange-600" : "bg-[#1E1E1E] border-white/10"}`}
                >
                  <Ionicons
                    name="earth"
                    size={18}
                    color={isPublic ? "#EA580C" : "#666"}
                  />
                  <Text
                    className={`ml-2 font-bold ${isPublic ? "text-orange-500" : "text-gray-400"}`}
                  >
                    Public
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsPublic(false)}
                  className={`flex-1 p-4 rounded-xl border flex-row items-center justify-center ${!isPublic ? "bg-orange-600/10 border-orange-600" : "bg-[#1E1E1E] border-white/10"}`}
                >
                  <Ionicons
                    name="people"
                    size={18}
                    color={!isPublic ? "#EA580C" : "#666"}
                  />
                  <Text
                    className={`ml-2 font-bold ${!isPublic ? "text-orange-500" : "text-gray-400"}`}
                  >
                    Friends Only
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* --- ANONYMITY --- */}
            <TouchableOpacity
              onPress={() => setIsAnonymous(!isAnonymous)}
              className={`flex-row items-center justify-between p-4 rounded-xl border mb-10 ${isAnonymous ? "bg-white/10 border-white/30" : "bg-[#1E1E1E] border-white/10"}`}
            >
              <View className="flex-row items-center">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${isAnonymous ? "bg-white" : "bg-gray-700"}`}
                >
                  <Ionicons
                    name={isAnonymous ? "eye-off" : "eye"}
                    size={16}
                    color={isAnonymous ? "black" : "white"}
                  />
                </View>
                <View>
                  <Text className="text-white font-bold">Post Anonymously</Text>
                  <Text className="text-gray-500 text-xs">
                    Hide your identity on the board
                  </Text>
                </View>
              </View>
              <View
                className={`w-6 h-6 rounded-full border items-center justify-center ${isAnonymous ? "bg-white border-white" : "border-gray-600"}`}
              >
                {isAnonymous && (
                  <Ionicons name="checkmark" size={14} color="black" />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCreateQuest}
              disabled={screenLoading || !isValid} // Disabled if invalid
              className={`flex-row justify-center bg-orange-600 rounded-xl py-4 items-center mb-10 shadow-lg shadow-orange-600/20 ${screenLoading || !isValid ? "opacity-50" : "opacity-100"}`}
            >
              {screenLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white text-base font-black tracking-wide">
                    POST QUEST
                  </Text>
                  {/* Only show reward amount if valid */}
                  {Number(newQuestReward) > 0 && (
                    <View className="flex-row items-center">
                      <Text className="text-white text-base font-black tracking-wide">
                        {" "}
                        • {newQuestReward}
                      </Text>
                      <Ionicons name="diamond" size={20} color="#ffffff" />
                    </View>
                  )}
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default SideQuestBoard;
