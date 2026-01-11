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
  FlatList,
  StyleSheet,
} from "react-native";
import AlcoholismChart from "@/components/charts/lineChart";
import DrunkThought from "@/components/drunkThought";
import Header from "@/components/header";
import DrinkingMap from "@/components/map";
import QrSessionManager from "@/components/qrCodeManager";
import StoryDrawer from "@/components/story_drawer";
import ThisWeekGadget from "@/components/thisWeekGadget";
import { useApp } from "@/providers/AppProvider";
import { useFunc } from "@/providers/FunctionProvider";
import { getCoefInfo } from "@/utils/levels";
import { AntDesign, FontAwesome6, Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeHeadliner from "@/components/home_headliner";

const { width } = Dimensions.get("window"); 

const HORIZONTAL_PADDING = 16;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPartOfActiveFunc, funcMetaData } = useFunc();

  const { userStats, userData, friends, friendsDrunkThoughts, isLoading, refreshAll } = useApp();

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





  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const headlinerCardsData = [
    {
      id: "main_stats",
      coefInfo: coefInfo,
      handleFunctionPress: () => router.push("/(screens)/coeffInfo"),
      isCoefTooltipVisible: isCoefTooltipVisible,
      setIsCoefTooltipVisible: setIsCoefTooltipVisible,
      showTooltip: true,

      leftButton: {
        iconName: "dice-outline",
        iconFamily: "Ionicons",
        iconSize: 32,
        onPress: () => router.push("/(screens)/drinkingGames"),
      },
      rightButton: {
        iconName: "images-outline",
        iconFamily: "Ionicons",
        iconSize: 28,
        onPress: handleFunctionPress,
      },
      units: "PTS",
    },
    {
      id: "drunk_days",
      coefInfo: { coef: userStats?.total_days_drank || 0, title: "DRUNK" },
      handleFunctionPress: () => router.push("/(screens)/stats"),
      isCoefTooltipVisible: false,
      setIsCoefTooltipVisible: () => {},
      showTooltip: false,

      leftButton: {
        iconName: "target",
        iconFamily: "MaterialCommunityIcons",
        iconSize: 32,
        onPress: () => router.push("/(screens)/wish_list"),
      },
      // rightButton: {
      //   iconName: "trophy",
      //   iconFamily: "AntDesign",
      //   iconSize: 30,
      //   onPress: () => router.push("/(screens)/collection"),
      // },
      units: "DAYS",
    },
    {
      id: "longest_streak",
      coefInfo: { coef: userStats?.longest_streak || 0, title: "LONGEST STREAK" },
      handleFunctionPress: () => router.push("/(tabs)/calendar"),
      isCoefTooltipVisible: false,
      setIsCoefTooltipVisible: () => {},
      showTooltip: false,

      // leftButton: {
      //   iconName: "calendar",
      //   iconFamily: "Feather",
      //   iconSize: 28,
      //   onPress: () => router.push("/(tabs)/calendar"),
      // },
      // rightButton: {
      //   iconName: "map-search-outline",
      //   iconFamily: "MaterialCommunityIcons",
      //   iconSize: 30, // Adjust specific Material icon
      //   onPress: () => router.push("/(screens)/map_screen"),
      // },
      units: "DAYS",
    },
  ];

const renderHeadlinerCard = ({ item }: { item: (typeof headlinerCardsData)[0] }) => (
    <View style={{ width: width }} className="justify-center items-center">
      <HomeHeadliner
        coefInfo={item.coefInfo}
        isCoefTooltipVisible={item.isCoefTooltipVisible}
        setIsCoefTooltipVisible={item.setIsCoefTooltipVisible}
        handleFunctionPress={item.handleFunctionPress}
        showTooltip={item.showTooltip}
        leftButton={item.leftButton}
        rightButton={item.rightButton}
        units={item.units}
      />
    </View>
  ); 

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
          paddingHorizontal: HORIZONTAL_PADDING, 
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
        <FlatList
          ref={flatListRef}
          data={headlinerCardsData}
          renderItem={renderHeadlinerCard}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
          className="mb-2"
          style={{
            marginHorizontal: -HORIZONTAL_PADDING,
            width: width, 
          }}
        />

        <View className="flex-row justify-center mt-2 mb-4">
          {headlinerCardsData.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 20, 10],
              extrapolate: "clamp",
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={i.toString()}
                style={[styles.dot, { width: dotWidth, opacity, backgroundColor: "#EA580C" }]}
                className="bg-gray-400 mx-1 rounded-full"
              />
            );
          })}
        </View>
     
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}
          className="mb-4"
        >
          <TouchableOpacity
            onPress={() => router.push("/(screens)/ranking")}
            className="w-40 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]"
          >
            <View className="w-12 h-12 rounded-xl bg-orange-600/20 items-center justify-center mb-3">
              <FontAwesome6 name="ranking-star" size={24} color="#EA580C" />
            </View>
            <Text className="text-white text-base font-bold">Ranking</Text>
            <Text className="text-white/40 text-xs font-semibold mt-1">Prove yourself</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(screens)/collection")}
            className="w-40 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]"
          >
            <View className="w-12 h-12 rounded-xl bg-orange-600/20 items-center justify-center mb-3">
              <MaterialCommunityIcons name="bottle-tonic-skull" size={32} color="#EA580C" />
            </View>
            <Text className="text-white text-base font-bold">Collection</Text>
            <Text className="text-white/40 text-xs font-semibold mt-1">Build a legacy</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
});
