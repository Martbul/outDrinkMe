import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AlcoholismChart from "@/components/charts/lineChart";
import DrunkThought from "@/components/drunkThought";
import Header from "@/components/header";
import InfoTooltip from "@/components/infoTooltip";
import DrinkingMap from "@/components/map";
import QrSessionManager from "@/components/qrCodeManager";
import StoryDrawer from "@/components/story_drawer";
import ThisWeekGadget from "@/components/thisWeekGadget";
import { useApp } from "@/providers/AppProvider";
import { useFunc } from "@/providers/FunctionProvider";
import { getCoefInfo } from "@/utils/levels";
import { AntDesign, Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SwipeableSheet } from "@/components/swipeable_sheet";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPartOfActiveFunc, funcMetaData } = useFunc();

  const { userStats, userData, friends, friendsDrunkThoughts, isLoading, leaderboard, refreshAll } = useApp();

  const displayedThoughts = useMemo(() => {
    if (!friendsDrunkThoughts || friendsDrunkThoughts.length === 0) {
      return [];
    }

    const count = Math.min(Math.floor(Math.random() * 2) + 1, friendsDrunkThoughts.length);

    const result = [];
    const usedIndices = new Set<number>();

    while (result.length < count) {
      const randomIndex = Math.floor(Math.random() * friendsDrunkThoughts.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        result.push(friendsDrunkThoughts[randomIndex]);
      }
    }

    return result;
  }, [friendsDrunkThoughts]);

  const [isCoefTooltipVisible, setIsCoefTooltipVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(Dimensions.get("window").height)).current;

  const handleFunctionPress = () => {
    if (isPartOfActiveFunc && funcMetaData?.sessionID) {
      router.push({
        pathname: "/(screens)/func_screen",
        params: {
          funcId: funcMetaData.sessionID,
          inviteCode: funcMetaData.qrToken || funcMetaData.inviteCode,
          qrBase64: funcMetaData.qrCodeBase64,
        },
      });
    } else {
      openModal();
    }
  };

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

  const coefInfo = getCoefInfo(userData?.alcoholism_coefficient);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  if (isLoading && !userStats) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#EA580C" />
        <Text className="text-white/50 text-sm mt-4">Loading your stats...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Header />
      <StoryDrawer />

      {displayedThoughts.map((thought) => (
        <DrunkThought key={thought.id} thought={thought.thought} userImageUrl={thought.user_image_url} />
      ))}

      <ScrollView
        className="flex-1 bg-black"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 100 + insets.bottom,
          backgroundColor: "black",
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EA580C"
            colors={["#EA580C"]}
            progressBackgroundColor="#000000"
          />
        }
      >
        <View className="items-center mb-6">
          <View className="flex flex-row items-center gap-8">
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
              <Text className="text-orange-600 text-5xl font-black">{coefInfo.coef}</Text>

              <TouchableOpacity
                onPress={() => setIsCoefTooltipVisible(!isCoefTooltipVisible)}
                className="absolute  w-8 h-8 rounded-full  items-center justify-center"
                style={{ zIndex: 10, right: -14, bottom: -10 }}
              >
                <Feather name="help-circle" size={24} color="#666666" />
              </TouchableOpacity>

              {isCoefTooltipVisible && (
                <InfoTooltip
                  visible={isCoefTooltipVisible}
                  title="Points"
                  description="Your drinking point calculated on your streak, mix posts and overall drunk days"
                  onClose={() => setIsCoefTooltipVisible(false)}
                ></InfoTooltip>
              )}
            </TouchableOpacity>
            <View className="rounded-full bg-orange-600/15 border-orange-600">
              <TouchableOpacity
                onPress={handleFunctionPress}
                className=" w-16 h-16 rounded-full  items-center justify-center"
              >
                <Ionicons name="images-outline" size={24} color="#EA580C" />
              </TouchableOpacity>
            </View>
          </View>

          <Text className="text-white text-[22px] font-black tracking-wide">{coefInfo.title}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}
          className="mb-4"
        >
          <TouchableOpacity
            onPress={() => router.push("/(screens)/collection")}
            className="w-40 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]"
          >
            <View className="w-12 h-12 rounded-xl bg-orange-600/20 items-center justify-center mb-3">
              <MaterialCommunityIcons name="bottle-tonic-skull" size={24} color="#EA580C" />
            </View>
            <Text className="text-white text-base font-bold">Collection</Text>
            <Text className="text-white/40 text-xs font-semibold mt-1">View your history</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(screens)/mixTimeline")}
            className="w-40 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]"
          >
            <View className="w-12 h-12 rounded-xl bg-orange-600/20 items-center justify-center mb-3">
              <AntDesign name="align-center" size={24} color="#EA580C" />
            </View>
            <Text className="text-white text-base font-bold">Mix Timeline</Text>
            <Text className="text-white/40 text-xs font-semibold mt-1">View your history</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(screens)/stats")}
            className="w-40 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]"
          >
            <View className="w-12 h-12 rounded-xl bg-orange-600/20 items-center justify-center mb-3">
              <MaterialIcons name="query-stats" size={24} color="#EA580C" />
            </View>
            <Text className="text-white text-base font-bold">Stats</Text>
            <Text className="text-white/40 text-xs font-semibold mt-1">Detailed insights</Text>
          </TouchableOpacity>
        </ScrollView>

        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            className="flex-1 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]"
            onPress={() => router.push("/(screens)/buddies&discoverScreen")}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white text-2xl font-black">Buddies</Text>
                <Text className="text-white/40 text-xs font-semibold mt-1">{friends.length || 0} friends</Text>
              </View>
              <View className="w-12 h-12 rounded-xl bg-orange-600/20 items-center justify-center">
                <Ionicons name="people" size={24} color="#EA580C" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-3 mb-4">
         
            <DrinkingMap />
        </View>
        <ThisWeekGadget />
        <AlcoholismChart />

        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            onPress={() => router.push("/(screens)/ranking")}
            className="flex-1 bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08]"
          >
            <View className="w-10 h-10 rounded-xl bg-orange-600/20 items-center justify-center mb-2">
              <MaterialIcons name="leaderboard" size={20} color="#EA580C" />
            </View>
            <Text className="text-white/40 text-[10px] font-bold tracking-widest mb-0.5">GLOBAL RANK</Text>
            <Text className="text-white text-2xl font-black">#{leaderboard?.global?.user_position?.rank}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/calendar")}
            className="flex-1 bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08]"
          >
            <View className="w-10 h-10 rounded-xl bg-orange-600/20 items-center justify-center mb-2">
              <Ionicons name="calendar" size={20} color="#EA580C" />
            </View>
            <Text className="text-white/40 text-[10px] font-bold tracking-widest mb-0.5">TOTAL DAYS DRUNK</Text>
            <Text className="text-white text-2xl font-black">{userStats?.total_days_drank || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(screens)/stats")}
            className="flex-1 bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08]"
          >
            <View className="w-10 h-10 rounded-xl bg-orange-600/20 items-center justify-center mb-2">
              <MaterialCommunityIcons name="fire" size={26} color="#EA580C" />
            </View>
            <Text className="text-white/40 text-[10px] font-bold tracking-widest mb-0.5">LONGEST STREAK</Text>
            <Text className="text-white text-2xl font-black">{userStats?.longest_streak || 0}</Text>
          </TouchableOpacity>
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
            <ActivityIndicator color={userStats?.today_status ? "#EA580C" : "#000000"} />
          ) : (
            <View className="items-center">
              {userStats?.today_status ? (
                <>
                  <Ionicons name="checkmark-circle" size={32} color="#EA580C" />
                  <Text className="text-white text-base font-black tracking-wider mt-2">LOGGED TODAY</Text>
                  <Text className="text-white/40 text-xs font-semibold mt-1">Great job, my alcoholic!</Text>
                </>
              ) : (
                <>
                  <Ionicons name="add-circle" size={32} color="#000000" />
                  <Text className="text-black text-lg font-black tracking-wider mt-2">LOG TODAY&apos;S DRINKING</Text>
                  <Text className="text-black/60 text-xs font-semibold mt-1">Keep your streak alive</Text>
                </>
              )}
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

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

      {/* <SwipeableSheet visible={isMapVisible} onClose={() => setIsMapVisible(false)}>
        <View style={{ height: 550, width: "100%", backgroundColor: "#121212" }}>
          <DrinkingMap variant="full" />
        </View>
      </SwipeableSheet> */}
    </View>
  );
}
