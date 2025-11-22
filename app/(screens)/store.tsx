import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAds } from "@/providers/AdProvider";
import { handleEarnGems } from "@/utils/adsReward";
import { useApp } from "@/providers/AppProvider";
import PurchaseConfirmationModal, {
  StoreItem,
  GemPurchaseItem,
} from "@/components/purchaseModal";
import { apiService } from "@/api";
import { useAuth } from "@clerk/clerk-expo";
import {
  ColorTheme,
  Deal,
  Flag,
  GemPack,
  ProDeal,
  Smoking,
} from "@/types/api.types";
import { usePostHog } from "posthog-react-native";
import NestedScreenHeader from "@/components/nestedScreenHeader";

export default function StoreScreen() {
  const posthog = usePostHog();

  const { getToken } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const { isAdLoaded, showRewardedAd } = useAds();
  const {
    userData,
    storeItems,
    updateUserProfile,
    refreshStore,
    refreshUserInventory,
    refreshUserData,
  } = useApp();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseType, setPurchaseType] = useState<"gem" | "store">("store");
  const [selectedStoreItem, setSelectedStoreItem] = useState<StoreItem | null>(
    null
  );
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [successfulPurchaseModalVisible, setSuccessfulPurchaseModalVisible] =
    useState(false);

  const [pendingTransaction, setPendingTransaction] = useState(false);
  const [selectedGemItem, setSelectedGemItem] =
    useState<GemPurchaseItem | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const getMoreGemsSectionRef = useRef<View>(null);
  useEffect(() => {
    posthog?.capture("store_viewed", {
      user_gem_balance: userData?.gems || 0,
    });
  }, [userData?.gems]);

  const handleGetMorePress = () => {
    // Track intent to buy gems
    posthog?.capture("store_scroll_to_gems");

    getMoreGemsSectionRef.current?.measureLayout(
      scrollViewRef.current as any,
      (x, y, width, height) => {
        scrollViewRef.current?.scrollTo({ y, animated: true });
      }
    );
  };

  const closeSuccessfulPurchaseModal = () => {
    setShowReferralModal(false);
  };

  // Handle store item purchase
  const handleStoreItemPress = (item: StoreItem) => {
    // 4. Track Item Selection (Intent)
    posthog?.capture("store_item_selected", {
      item_id: item.id,
      item_name: item.name,
      item_price: item.base_price,
      item_category: item.item_type || "unknown",
    });

    setSelectedStoreItem(item);
    setSelectedGemItem(null);
    setPurchaseType("store");
    setShowPurchaseModal(true);
  };
  // Handle gem pack purchase
  const handleGemPackPress = (pack: GemPack) => {
    // 5. Track Gem Pack Selection
    posthog?.capture("store_gem_pack_selected", {
      pack_id: pack.id,
      gem_amount: pack.amount,
      price_string: pack.price,
    });

    let finalAmount;
    if (pack.bonus) {
      finalAmount = pack.amount + pack.bonus;
    } else {
      finalAmount = pack.amount;
    }
    const gemItem: GemPurchaseItem = {
      id: `gem-${pack.id}`,
      finalAmount: finalAmount,
      baseAmount: pack.amount,
      price: pack.price,
      bonus: pack.bonus,
    };
    setSelectedGemItem(gemItem);
    setSelectedStoreItem(null);
    setPurchaseType("gem");
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = async () => {
    setPendingTransaction(true);

    // 6. Track transaction start
    posthog?.capture("purchase_initiated", {
      type: purchaseType,
      item_id:
        purchaseType === "store" ? selectedStoreItem?.id : selectedGemItem?.id,
    });

    try {
      const token = await getToken();
      if (!token) {
        console.error("No authentication token available");
        setPendingTransaction(false);
        return;
      }

      if (purchaseType === "gem" && selectedGemItem) {
        // Handle gem purchase logic here
        console.log("Purchasing gems:", selectedGemItem);
        // TODO: Implement actual gem purchase API call
      } else if (purchaseType === "store" && selectedStoreItem) {
        console.log("Purchasing store item:", selectedStoreItem);

        await apiService.purchaseStoreItem(selectedStoreItem.id, token);

        // 7. Track Successful Purchase (The most important revenue metric)
        posthog?.capture("purchase_completed", {
          type: "store_item",
          item_id: selectedStoreItem.id,
          item_name: selectedStoreItem.name,
          cost_gems: selectedStoreItem.base_price,
          user_balance_after:
            (userData?.gems || 0) - selectedStoreItem.base_price,
        });

        await Promise.all([refreshUserData(), refreshUserInventory()]);

        console.log("Purchase completed successfully");
      }

      setShowPurchaseModal(false);
      setSelectedStoreItem(null);
      setSelectedGemItem(null);
      setSuccessfulPurchaseModalVisible(true);

      setTimeout(() => {
        setSuccessfulPurchaseModalVisible(false);
      }, 1600);
    } catch (error: any) {
      console.error("Purchase failed:", error);

      // 8. Track Failed Purchase (Critical for debugging lost revenue)
      posthog?.capture("purchase_failed", {
        type: purchaseType,
        error_message: error.message,
        item_id:
          purchaseType === "store"
            ? selectedStoreItem?.id
            : selectedGemItem?.id,
      });

      alert("Purchase failed. Please try again.");
    } finally {
      setPendingTransaction(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshStore();
    setRefreshing(false);
  };

  const flags: Flag[] = (storeItems?.flag || []).map(
    (item: any, index: number) => ({
      id: index + 1,
      title: item.name,
      price: item.base_price,
      image: { uri: item.image_url },
      storeItem: item,
    })
  );

  const smokingDevices: Smoking[] = (storeItems?.smoking || []).map(
    (device: any, index: number) => ({
      id: index + 1,
      title: device.name,
      price: device.base_price,
      image: { uri: device.image_url },
      storeItem: device,
    })
  );

  const gemPacks: GemPack[] = [
    {
      id: 1,
      amount: 3,
      price: "3,69 лв.",
      image: require("@/assets/images/flags/beer_flag.jpg"),
    },
    {
      id: 2,
      amount: 10,
      price: "9,99 лв.",
      image: require("@/assets/images/flags/beer_flag.jpg"),
    },
    {
      id: 3,
      amount: 15,
      price: "15,99 лв.",
      image: require("@/assets/images/flags/beer_flag.jpg"),
      bonus: 3,
    },
    {
      id: 4,
      amount: 20,
      price: "20,99 лв.",
      image: require("@/assets/images/flags/beer_flag.jpg"),
      bonus: 5,
    },
    {
      id: 5,
      amount: 50,
      price: "40,99 лв.",
      image: require("@/assets/images/flags/beer_flag.jpg"),
      bonus: 10,
    },
  ];

  // const ReferralModal = () = {

  // }

  const SmokingCard = ({ device }: { device: any }) => (
    <TouchableOpacity
      className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] items-center mr-3"
      style={{ width: 140 }}
      activeOpacity={0.7}
      onPress={() => device.storeItem && handleStoreItemPress(device.storeItem)}
    >
      <Text className="text-white text-sm font-bold mb-1" numberOfLines={1}>
        {device.title}
      </Text>
      <View className="bg-black/20 rounded-xl p-3 w-full items-center mb-3">
        <Image
          source={device.image}
          style={{ width: 50, height: 50 }}
          resizeMode="contain"
        />
      </View>

      <View className="bg-orange-600/20 rounded-xl py-2 px-3 flex-row items-center justify-center border border-orange-600/40 w-full">
        <Ionicons name="diamond" size={18} color="#EA580C" />

        <Text className="text-orange-600 text-lg font-black ml-1">
          {device.price}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const FlagCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] mr-3"
      style={{ width: 160 }}
      activeOpacity={0.7}
      onPress={() => item.storeItem && handleStoreItemPress(item.storeItem)}
    >
      <Text className="text-white text-sm font-bold mb-1" numberOfLines={1}>
        {item.title}
      </Text>
      <View className="items-center py-4 bg-black/20 rounded-xl">
        <Image
          source={item.image}
          style={{ width: 170, height: 70 }}
          resizeMode="contain"
        />
      </View>
      <View className="bg-orange-600/20 rounded-xl py-2 px-3 flex-row items-center justify-center border border-orange-600/40 mt-3">
        <Ionicons name="diamond" size={18} color="#EA580C" />

        <Text className="text-orange-600 text-lg font-black ml-1">
          {item.price}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const ColorThemeCard = ({ theme }: { theme: ColorTheme }) => (
    <TouchableOpacity
      className={`${theme.bgColor} rounded-2xl p-4 border ${theme.borderColor} mr-3`}
      style={{ width: 160 }}
      activeOpacity={0.7}
    >
      <View
        className={`w-16 h-16 rounded-2xl ${theme.color} mb-3 items-center justify-center`}
      >
        <View className={`w-12 h-12 rounded-xl ${theme.color} opacity-60`} />
      </View>
      <Text className="text-white font-bold mb-1" numberOfLines={1}>
        {theme.name}
      </Text>
      <Text
        className={`text-xs font-semibold mb-3`}
        style={{ color: theme.color.replace("bg-", "#") }}
      >
        Theme Color
      </Text>
      <View className="bg-orange-600/20 rounded-xl py-2 px-3 flex-row items-center justify-center border border-orange-600/40">
        <Ionicons name="diamond" size={18} color="#EA580C" />

        <Text className="text-orange-600 text-base font-black ml-1">
          {theme.price}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const GemPackCard = ({ pack }: { pack: GemPack }) => (
    <TouchableOpacity
      className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] items-center mr-3 relative"
      style={{ width: 140 }}
      activeOpacity={0.7}
      onPress={() => handleGemPackPress(pack)}
    >
      {pack.bonus && (
        <View className="absolute -top-2 -right-2 bg-[#ff8c00] px-2 py-1 rounded-lg border-2 border-black z-10">
          <Text className="text-black text-[9px] font-black">
            +{pack.bonus}
          </Text>
        </View>
      )}
      <View className="bg-orange-600/20 rounded-2xl w-20 h-20 items-center justify-center mb-3 border border-orange-600/40">
        <Ionicons name="diamond" size={48} color="#EA580C" />
      </View>
      <View className="bg-orange-600/20 rounded-xl py-2 px-3 flex-row items-center justify-center border border-orange-600/40 w-full mb-2">
        <Text className="text-orange-600 text-xl font-black">
          {pack.amount}
        </Text>
        {pack.bonus && (
          <Text className="text-[#ff8c00] text-sm font-black ml-1">
            +{pack.bonus}
          </Text>
        )}
      </View>
      <Text className="text-white/50 text-sm font-bold">{pack.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <NestedScreenHeader heading="Store" secondaryHeading="DRUNK" />

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff8c00"
            colors={["#ff8c00"]}
          />
        }
      >
        <View className="mx-4 mt-4 ">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
                  YOUR BALANCE
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="diamond" size={32} color="#EA580C" />
                  <Text className="text-white text-3xl font-black ml-2">
                    {userData?.gems || 0}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                className="bg-orange-600 px-5 py-3 rounded-xl"
                onPress={handleGetMorePress}
              >
                <Text className="text-black text-sm font-black">GET MORE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* 
        <View className="mx-4 mt-4">
          <TouchableOpacity
            className="bg-orange-600/10 rounded-2xl p-5 border-2 border-orange-600/50"
            activeOpacity={0.8}
            onPress={() => setShowReferralModal(true)}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <View className="bg-[#ff8c00] px-2 py-1 rounded-lg mr-2">
                    <Text className="text-black text-[10px] font-black">
                      REFERRAL BONUS
                    </Text>
                  </View>
                  <Text className="text-[#ff8c00] text-[11px] font-bold tracking-widest">
                    UNLIMITED
                  </Text>
                </View>
                <Text className="text-white text-xl font-black mb-1">
                  Invite Friends
                </Text>
                <Text className="text-white/70 text-sm font-semibold mb-3">
                  You and your friend BOTH get 15 gems!
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="diamond" size={22} color="#EA580C" />
                  <Text className="text-[#ff8c00] text-2xl font-black ml-1">
                    +15
                  </Text>
                  <Text className="text-white/50 text-sm font-semibold ml-2">
                    per friend
                  </Text>
                </View>
              </View>
              <View className="items-center ml-3">
                <View className="bg-[#ff8c00] w-16 h-16 rounded-2xl items-center justify-center mb-2">
                  <Ionicons name="people" size={32} color="white" />
                </View>
                <View className="bg-[#ff8c00] px-4 py-2 rounded-xl">
                  <Text className="text-white text-xs font-black">INVITE</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View> */}

        <View className="mt-6">
          <View className="mx-4 mb-4 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
              BOOST YOUR HEALTH
            </Text>
            <Text className="text-white text-2xl font-black">Smoking</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {smokingDevices.map((device) => (
              <SmokingCard key={device.id} device={device} />
            ))}
          </ScrollView>
        </View>

        {/* Flags Section */}
        <View className="mt-6">
          <View className="mx-4 mb-4 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
              SEXUALITY
            </Text>
            <Text className="text-white text-2xl font-black">Flags</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {flags.map((item) => (
              <FlagCard key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>

        {/* Watch Ad Section */}
        {isAdLoaded && (
          <View className="mx-4 mt-4">
            <TouchableOpacity
              className="bg-orange-600/10 rounded-2xl p-5 border-2 border-orange-600/50"
              activeOpacity={0.8}
              onPress={() =>
                handleEarnGems(
                  1,
                  showRewardedAd,
                  userData?.gems || 0,
                  updateUserProfile
                )
              }
            >
              <View
                className="flex-row items-center justify-between"
                ref={getMoreGemsSectionRef}
              >
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <View className="bg-[#ff8c00] px-2 py-1 rounded-lg mr-2">
                      <Text className="text-black text-[10px] font-black">
                        FREE GEMS
                      </Text>
                    </View>
                    <Text className="text-[#ff8c00] text-[11px] font-bold tracking-widest">
                      NO PURCHASE
                    </Text>
                  </View>
                  <Text className="text-white text-xl font-black mb-1">
                    Watch & Earn
                  </Text>
                  <Text className="text-white/70 text-sm font-semibold mb-3">
                    Watch a short ad to get 1 gem instantly!
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="diamond" size={22} color="#EA580C" />

                    <Text className="text-[#ff8c00] text-2xl font-black ml-1">
                      +1
                    </Text>
                    <Text className="text-white/50 text-sm font-semibold ml-2">
                      per ad
                    </Text>
                  </View>
                </View>
                <View className="items-center ml-3">
                  <View className="bg-[#ff8c00] w-16 h-16 rounded-2xl items-center justify-center mb-2">
                    <Ionicons name="play-circle" size={32} color="white" />
                  </View>
                  <View className="bg-[#ff8c00] px-4 py-2 rounded-xl">
                    <Text className="text-white text-xs font-black">
                      WATCH AD
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Get More Gems Section */}
        {/* <View className="mt-6 mb-6" ref={getMoreGemsSectionRef}>
          <View className="mx-4 mb-4 bg-gradient-to-r from-orange-600/20 to-yellow-600/20 rounded-2xl p-5 border border-orange-600/40">
            <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
              SPECIAL OFFER
            </Text>
            <Text className="text-white text-2xl font-black">
              Get More Gems!
            </Text>
            <Text className="text-white/50 text-xs font-semibold mt-1">
              Best value bundles with bonus gems
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {gemPacks.map((pack) => (
              <GemPackCard key={pack.id} pack={pack} />
            ))}
          </ScrollView>
        </View> */}
      </ScrollView>
      <PurchaseConfirmationModal
        visible={showPurchaseModal}
        isPending={pendingTransaction}
        itemType={purchaseType}
        gemItem={selectedGemItem}
        storeItem={selectedStoreItem}
        currentGems={userData?.gems || 0}
        onConfirm={handleConfirmPurchase}
        onCancel={() => {
          setPendingTransaction(false);
          setShowPurchaseModal(false);
          setSelectedStoreItem(null);
          setSelectedGemItem(null);
        }}
      />
      {/* <ReferralModal
        visible={showReferralModal}
        onClose={() => setShowReferralModal(false)}
      /> */}

      <Modal
        visible={successfulPurchaseModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeSuccessfulPurchaseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={closeSuccessfulPurchaseModal}
            className="flex-1 bg-black/80 justify-end"
          >
            <TouchableOpacity
              activeOpacity={1}
              className="bg-black/95 rounded-t-3xl border-t-2 border-orange-600/30"
              style={{
                paddingBottom: insets.bottom + 20,
              }}
            >
              <View className="px-6 py-16 items-center">
                <View className="w-20 h-20 rounded-full bg-orange-600/20 items-center justify-center mb-4">
                  <Ionicons name="checkmark-circle" size={48} color="#EA580C" />
                </View>
                <Text className="text-white text-2xl font-black mb-2">
                  Successful Purchase!
                </Text>
                <Text className="text-white/60 text-center text-sm">
                  Check your profile inventory to see the item
                </Text>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
