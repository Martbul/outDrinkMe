import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import NestedScreenHeader from "@/components/nestedScreenHeader";
import { onBackPress } from "@/utils/navigation";

// Types based on your Go backend
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
}

// Mock Data
const MOCK_FRIENDS_QUESTS: SideQuest[] = [
  {
    id: "1",
    issuerId: "user1",
    issuerName: "Alex Johnson",
    issuerImage: "https://i.pravatar.cc/150?img=1",
    title: "Find me a phone charger",
    description:
      "I'm at the library and my phone is dying. Need a USB-C charger ASAP!",
    rewardAmount: 50,
    isLocked: true,
    isPublic: false,
    isAnonymous: false,
    status: "OPEN",
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    createdAt: new Date().toISOString(),
    submissionCount: 0,
  },
  {
    id: "2",
    issuerId: "user2",
    issuerName: "Mystery Friend",
    title: "Buy me coffee from Starbucks",
    description:
      "Venti iced latte with oat milk. I'll Venmo you back + reward!",
    rewardAmount: 100,
    isLocked: true,
    isPublic: false,
    isAnonymous: true,
    status: "OPEN",
    expiresAt: new Date(Date.now() + 7200000).toISOString(),
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    submissionCount: 2,
  },
];

const MOCK_PUBLIC_QUESTS: SideQuest[] = [
  {
    id: "3",
    issuerId: "user3",
    issuerName: "Random User",
    issuerImage: "https://i.pravatar.cc/150?img=3",
    title: "Take a photo with the campus mascot",
    description: "Extra gems if you do a funny pose!",
    rewardAmount: 75,
    isLocked: true,
    isPublic: true,
    isAnonymous: false,
    status: "OPEN",
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    submissionCount: 5,
  },
];

const MOCK_MY_QUESTS: SideQuest[] = [
  {
    id: "4",
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
    submissionCount: 3,
  },
];

const MOCK_SUBMISSIONS: SideQuestCompletion[] = [
  {
    id: "s1",
    sideQuestId: "4",
    questTitle: "Bring me lunch from dining hall",
    completerId: "user5",
    completerName: "Sarah Miller",
    completerImage: "https://i.pravatar.cc/150?img=5",
    proofImageUrl:
      "https://via.placeholder.com/400x300/EA580C/FFFFFF?text=Lunch+Proof",
    proofText: "Got your sandwich and fries! At your dorm now.",
    status: "PENDING",
    payoutStatus: "PENDING",
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
];

const MOCK_MY_SUBMISSIONS: SideQuestCompletion[] = [
  {
    id: "s2",
    sideQuestId: "1",
    questTitle: "Find me a phone charger",
    completerId: "currentUser",
    proofImageUrl:
      "https://via.placeholder.com/400x300/EA580C/FFFFFF?text=Charger+Found",
    proofText: "Found a USB-C charger in the computer lab!",
    status: "APPROVED",
    payoutStatus: "SUCCESS",
    paidAt: new Date(Date.now() - 300000).toISOString(),
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
];

export default function SideQuestBoard() {
  const [activeMainTab, setActiveMainTab] = useState<
    "board" | "my-quests" | "submissions"
  >("board");
  const [activeBoardTab, setActiveBoardTab] = useState<"friends" | "public">(
    "friends"
  );
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<SideQuest | null>(null);
  const [selectedSubmission, setSelectedSubmission] =
    useState<SideQuestCompletion | null>(null);

  // Create Quest Form
  const [newQuestTitle, setNewQuestTitle] = useState("");
  const [newQuestDescription, setNewQuestDescription] = useState("");
  const [newQuestReward, setNewQuestReward] = useState("50");
  const [newQuestIsPublic, setNewQuestIsPublic] = useState(false);
  const [newQuestIsAnonymous, setNewQuestIsAnonymous] = useState(false);

  const getTimeRemaining = (expiresAt: string) => {
    const now = Date.now();
    const expires = new Date(expiresAt).getTime();
    const diff = expires - now;

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const QuestCard = ({
    quest,
    onPress,
  }: {
    quest: SideQuest;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] mb-3"
      activeOpacity={0.7}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          {!quest.isAnonymous && quest.issuerImage ? (
            <Image
              source={{ uri: quest.issuerImage }}
              className="w-10 h-10 rounded-full mr-3"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-orange-600/20 items-center justify-center mr-3">
              <Ionicons name="person" size={20} color="#EA580C" />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-white text-sm font-bold">
              {quest.isAnonymous ? "Anonymous" : quest.issuerName}
            </Text>
            <Text className="text-white/50 text-xs">
              {getTimeRemaining(quest.expiresAt)}
            </Text>
          </View>
        </View>

        <View className="bg-orange-600/20 px-3 py-1.5 rounded-lg border border-orange-600/40">
          <View className="flex-row items-center">
            <Ionicons name="diamond" size={14} color="#EA580C" />
            <Text className="text-orange-600 text-sm font-black ml-1">
              {quest.rewardAmount}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <Text className="text-white text-base font-black mb-2">
        {quest.title}
      </Text>
      <Text className="text-white/70 text-sm mb-3" numberOfLines={2}>
        {quest.description}
      </Text>

      {/* Footer */}
      <View className="flex-row items-center justify-between pt-3 border-t border-white/[0.05]">
        <View className="flex-row items-center">
          <Feather name="users" size={14} color="#666" />
          <Text className="text-white/50 text-xs ml-1">
            {quest.submissionCount || 0} attempts
          </Text>
        </View>
        <View className="flex-row items-center">
          <View
            className={`w-2 h-2 rounded-full ${quest.status === "OPEN" ? "bg-green-500" : "bg-gray-500"} mr-1`}
          />
          <Text className="text-white/50 text-xs uppercase">
            {quest.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const SubmissionCard = ({
    submission,
    isReview = false,
  }: {
    submission: SideQuestCompletion;
    isReview?: boolean;
  }) => (
    <TouchableOpacity
      onPress={() => setSelectedSubmission(submission)}
      className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] mb-3"
      activeOpacity={0.7}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center flex-1">
          {submission.completerImage && (
            <Image
              source={{ uri: submission.completerImage }}
              className="w-10 h-10 rounded-full mr-3"
            />
          )}
          <View className="flex-1">
            <Text className="text-white text-sm font-bold">
              {isReview ? submission.completerName : submission.questTitle}
            </Text>
            <Text className="text-white/50 text-xs">
              {new Date(submission.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View
          className={`px-3 py-1 rounded-lg ${
            submission.status === "APPROVED"
              ? "bg-green-600/20 border border-green-600/40"
              : submission.status === "REJECTED"
                ? "bg-red-600/20 border border-red-600/40"
                : "bg-orange-600/20 border border-orange-600/40"
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              submission.status === "APPROVED"
                ? "text-green-500"
                : submission.status === "REJECTED"
                  ? "text-red-500"
                  : "text-orange-500"
            }`}
          >
            {submission.status}
          </Text>
        </View>
      </View>

      <Image
        source={{ uri: submission.proofImageUrl }}
        className="w-full h-40 rounded-xl mb-3"
        resizeMode="cover"
      />

      {submission.proofText && (
        <Text className="text-white/70 text-sm mb-2">
          {submission.proofText}
        </Text>
      )}

      {isReview && submission.status === "PENDING" && (
        <View className="flex-row gap-2 mt-2">
          <TouchableOpacity className="flex-1 bg-green-600 py-2 rounded-lg">
            <Text className="text-white text-center font-bold">Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-red-600 py-2 rounded-lg">
            <Text className="text-white text-center font-bold">Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-black">
      <View className="px-4 pt-6 pb-4 border-b border-white/[0.08]">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row gap-2 items-center">
            <TouchableOpacity
              onPress={onBackPress}
              className="w-10 h-10 rounded-xl bg-white/[0.03] items-center justify-center border border-white/[0.08]"
            >
              <Feather name="arrow-left" size={22} color="#999999" />
            </TouchableOpacity>

            <View>
              <Text className="text-orange-600 text-xs font-bold tracking-widest">
                SIDE QUESTS
              </Text>
              <Text className="text-white text-3xl font-black">
                Quest Board
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setCreateModalVisible(true)}
            className="bg-orange-600 w-12 h-12 rounded-xl items-center justify-center"
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Main Tabs */}
        <View className="flex-row bg-white/[0.03] rounded-xl p-1 border border-white/[0.08]">
          <TouchableOpacity
            onPress={() => setActiveMainTab("board")}
            className={`flex-1 py-2 rounded-lg ${activeMainTab === "board" ? "bg-orange-600" : ""}`}
          >
            <Text
              className={`text-center text-sm font-bold ${activeMainTab === "board" ? "text-white" : "text-white/50"}`}
            >
              Board
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveMainTab("my-quests")}
            className={`flex-1 py-2 rounded-lg ${activeMainTab === "my-quests" ? "bg-orange-600" : ""}`}
          >
            <Text
              className={`text-center text-sm font-bold ${activeMainTab === "my-quests" ? "text-white" : "text-white/50"}`}
            >
              My Quests
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveMainTab("submissions")}
            className={`flex-1 py-2 rounded-lg ${activeMainTab === "submissions" ? "bg-orange-600" : ""}`}
          >
            <Text
              className={`text-center text-sm font-bold ${activeMainTab === "submissions" ? "text-white" : "text-white/50"}`}
            >
              My Tries
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeMainTab === "board" && (
        <View className="flex-1">
          <View className="px-4 py-3 flex-row bg-white/[0.03] rounded-xl m-4 p-1 border border-white/[0.08]">
            <TouchableOpacity
              onPress={() => setActiveBoardTab("friends")}
              className={`flex-1 py-2 rounded-lg ${activeBoardTab === "friends" ? "bg-orange-600" : ""}`}
            >
              <Text
                className={`text-center text-sm font-bold ${activeBoardTab === "friends" ? "text-white" : "text-white/50"}`}
              >
                Friends
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveBoardTab("public")}
              className={`flex-1 py-2 rounded-lg ${activeBoardTab === "public" ? "bg-orange-600" : ""}`}
            >
              <Text
                className={`text-center text-sm font-bold ${activeBoardTab === "public" ? "text-white" : "text-white/50"}`}
              >
                Public
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1 px-4"
            showsVerticalScrollIndicator={false}
          >
            {activeBoardTab === "friends" ? (
              <>
                {MOCK_FRIENDS_QUESTS.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onPress={() => setSelectedQuest(quest)}
                  />
                ))}
              </>
            ) : (
              <>
                {MOCK_PUBLIC_QUESTS.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onPress={() => setSelectedQuest(quest)}
                  />
                ))}
              </>
            )}
            <View className="h-20" />
          </ScrollView>
        </View>
      )}

      {/* My Quests Tab */}
      {activeMainTab === "my-quests" && (
        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/[0.08]">
            <Text className="text-white/50 text-xs font-bold tracking-widest mb-2">
              PENDING REVIEWS
            </Text>
            <Text className="text-orange-600 text-2xl font-black">
              {MOCK_SUBMISSIONS.length}
            </Text>
          </View>

          {MOCK_MY_QUESTS.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onPress={() => setSelectedQuest(quest)}
            />
          ))}

          <View className="mt-6 mb-4">
            <Text className="text-white text-lg font-black mb-3">
              Submissions to Review
            </Text>
            {MOCK_SUBMISSIONS.map((submission) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                isReview
              />
            ))}
          </View>
          <View className="h-20" />
        </ScrollView>
      )}

      {/* My Submissions Tab */}
      {activeMainTab === "submissions" && (
        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/[0.08]">
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-orange-600 text-2xl font-black">
                  {
                    MOCK_MY_SUBMISSIONS.filter((s) => s.status === "APPROVED")
                      .length
                  }
                </Text>
                <Text className="text-white/50 text-xs font-bold">
                  APPROVED
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-black">
                  {
                    MOCK_MY_SUBMISSIONS.filter((s) => s.status === "PENDING")
                      .length
                  }
                </Text>
                <Text className="text-white/50 text-xs font-bold">PENDING</Text>
              </View>
              <View className="items-center">
                <Text className="text-red-500 text-2xl font-black">
                  {
                    MOCK_MY_SUBMISSIONS.filter((s) => s.status === "REJECTED")
                      .length
                  }
                </Text>
                <Text className="text-white/50 text-xs font-bold">
                  REJECTED
                </Text>
              </View>
            </View>
          </View>

          {MOCK_MY_SUBMISSIONS.map((submission) => (
            <SubmissionCard key={submission.id} submission={submission} />
          ))}
          <View className="h-20" />
        </ScrollView>
      )}

      {/* Create Quest Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View className="flex-1 bg-black pt-16">
          <View className="px-4 pb-4 border-b border-white/[0.08]">
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-2xl font-black">
                Create Quest
              </Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={28} color="#EA580C" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-4 pt-6">
            <View className="mb-4">
              <Text className="text-white text-sm font-bold mb-2">Title</Text>
              <TextInput
                value={newQuestTitle}
                onChangeText={setNewQuestTitle}
                placeholder="What do you need?"
                placeholderTextColor="#666"
                className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-white"
              />
            </View>

            <View className="mb-4">
              <Text className="text-white text-sm font-bold mb-2">
                Description
              </Text>
              <TextInput
                value={newQuestDescription}
                onChangeText={setNewQuestDescription}
                placeholder="Provide details..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-white"
                style={{ textAlignVertical: "top" }}
              />
            </View>

            <View className="mb-4">
              <Text className="text-white text-sm font-bold mb-2">
                Reward (Gems)
              </Text>
              <TextInput
                value={newQuestReward}
                onChangeText={setNewQuestReward}
                placeholder="50"
                placeholderTextColor="#666"
                keyboardType="numeric"
                className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-white"
              />
            </View>

            <View className="mb-4">
              <TouchableOpacity
                onPress={() => setNewQuestIsPublic(!newQuestIsPublic)}
                className="flex-row items-center justify-between bg-white/[0.03] border border-white/[0.08] rounded-xl p-4"
              >
                <Text className="text-white font-bold">Public Quest</Text>
                <View
                  className={`w-12 h-6 rounded-full ${newQuestIsPublic ? "bg-orange-600" : "bg-white/[0.08]"}`}
                >
                  <View
                    className={`w-5 h-5 rounded-full bg-white ${newQuestIsPublic ? "self-end" : "self-start"} m-0.5`}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <TouchableOpacity
                onPress={() => setNewQuestIsAnonymous(!newQuestIsAnonymous)}
                className="flex-row items-center justify-between bg-white/[0.03] border border-white/[0.08] rounded-xl p-4"
              >
                <Text className="text-white font-bold">Post Anonymously</Text>
                <View
                  className={`w-12 h-6 rounded-full ${newQuestIsAnonymous ? "bg-orange-600" : "bg-white/[0.08]"}`}
                >
                  <View
                    className={`w-5 h-5 rounded-full bg-white ${newQuestIsAnonymous ? "self-end" : "self-start"} m-0.5`}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-orange-600 rounded-xl py-4 items-center mb-6"
              onPress={() => {
                // Handle quest creation
                setCreateModalVisible(false);
              }}
            >
              <Text className="text-white text-base font-black">
                Post Quest (50 Gems)
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
