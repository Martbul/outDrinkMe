import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

export interface StoreItem {
  id: string;
  category_id?: string;
  name: string;
  description?: string;
  item_type: string;
  image_url?: string;
  base_price: number;
  is_active: boolean;
  stock_quantity?: number;
  created_at: string;
  updated_at: string;
}

export interface GemPurchaseItem {
  id: string;
  finalAmount: number;
  baseAmount: number;
  price: string;
  bonus?: number;
}

interface PurchaseConfirmationModalProps {
  visible: boolean;
  isPending: boolean;
  itemType: "gem" | "store";
  gemItem?: GemPurchaseItem | null;
  storeItem?: StoreItem | null;
  currentGems: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function PurchaseConfirmationModal({
  visible,
  isPending,
  itemType,
  gemItem,
  storeItem,
  currentGems,
  onConfirm,
  onCancel,
}: PurchaseConfirmationModalProps) {
  const sparkleRotation = useSharedValue(0);
  const sparkleScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      sparkleRotation.value = withRepeat(
        withTiming(100, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
      sparkleScale.value = withRepeat(
        withSequence(
          withTiming(0.7, {
            duration: 100,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.5, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [visible]);

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${sparkleRotation.value}deg` },
      { scale: sparkleScale.value },
    ],
  }));

  if (itemType === "gem" && gemItem) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onCancel}
      >
        <View className="flex-1 bg-black/90 justify-center items-center px-6">
          <Animated.View
            entering={ZoomIn.duration(50).easing(Easing.out(Easing.cubic))}
            className="bg-[#1a1a1a] rounded-3xl w-full max-w-sm border border-orange-600/30 overflow-hidden"
            style={{
              shadowColor: "#ea580c",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
            }}
          >
            <Animated.View
              entering={FadeIn.delay(200).duration(200)}
              className="absolute top-3 right-3 z-20"
            >
              <TouchableOpacity
                onPress={onCancel}
                className="bg-white/10 rounded-full p-1.5"
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color="white" />
              </TouchableOpacity>
            </Animated.View>

            <View className="p-6">
              <Animated.View entering={FadeInDown.delay(100).duration(200)}>
                <Text className="text-orange-600 text-[10px] font-bold tracking-widest mb-1">
                  PURCHASE GEMS
                </Text>
                <Text className="text-white text-xl font-black mb-4">
                  Confirm Your Order
                </Text>
              </Animated.View>

              <Animated.View
                entering={ZoomIn.delay(100).duration(300).springify()}
                className="bg-gradient-to-br from-orange-600/10 to-yellow-600/10 rounded-2xl p-5 items-center mb-4 border border-orange-600/20"
              >
                <Animated.View
                  style={sparkleStyle}
                  className="bg-orange-600/20 rounded-full w-20 h-20 items-center justify-center mb-3 border border-orange-600/40"
                >
                  <Ionicons name="diamond" size={44} color="#EA580C" />
                </Animated.View>
                <View className="flex-row items-center bg-black/40 rounded-xl py-2 px-4 border border-orange-600/30">
                  <Text className="text-orange-600 text-2xl font-black">
                    {gemItem.baseAmount}
                  </Text>
                  {gemItem.bonus && (
                    <Text className="text-yellow-500 text-lg font-black ml-2">
                      +{gemItem.bonus}
                    </Text>
                  )}
                  <Text className="text-white/50 text-xs font-bold ml-2">
                    GEMS
                  </Text>
                </View>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(300).duration(400)}
                className="bg-white/5 rounded-xl p-3 mb-5 border border-white/10"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-white/60 text-sm font-semibold">
                    Total Price
                  </Text>
                  <Text className="text-white text-xl font-black">
                    {gemItem.price}
                  </Text>
                </View>
              </Animated.View>

              <View className="flex-row gap-3">
                <AnimatedTouchable
                  entering={FadeInDown.delay(350).duration(400)}
                  onPress={onCancel}
                  className="flex-1 bg-white/5 rounded-xl py-3 border border-white/10"
                  activeOpacity={0.7}
                >
                  <Text className="text-white text-center text-sm font-bold">
                    Cancel
                  </Text>
                </AnimatedTouchable>
                <AnimatedTouchable
                  entering={FadeInDown.delay(400).duration(400)}
                  onPress={onConfirm}
                  className="flex-1 rounded-xl py-3 bg-gradient-to-r from-orange-600 to-orange-500"
                  activeOpacity={0.7}
                  style={{
                    shadowColor: "#ea580c",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                  }}
                >
                  <Text className="text-center text-sm font-black text-white">
                    Buy Now
                  </Text>
                </AnimatedTouchable>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  // Render for Store Item Purchase
  if (itemType === "store" && storeItem) {
    const hasEnoughGems = currentGems >= storeItem.base_price;
    const remainingGems = currentGems - storeItem.base_price;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onCancel}
      >
        <View className="flex-1 bg-black/90 justify-center items-center px-6">
          <Animated.View
            entering={ZoomIn.duration(250).easing(Easing.out(Easing.cubic))}
            className="bg-black rounded-3xl w-full max-w-sm border border-orange-600/30 overflow-hidden"
            style={{
              shadowColor: "#ea580c",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
            }}
          >
            {/* Close Button */}
            <Animated.View
              entering={FadeIn.delay(200).duration(300)}
              className="absolute top-3 right-3 z-20"
            >
              <TouchableOpacity
                onPress={onCancel}
                className="bg-white/10 rounded-full p-1.5"
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color="white" />
              </TouchableOpacity>
            </Animated.View>

            {/* Content */}
            <View className="p-6">
              {/* Title */}
              <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                <Text className="text-orange-600 text-[10px] font-bold tracking-widest mb-1">
                  PURCHASE ITEM
                </Text>
                <Text className="text-white text-xl font-black mb-4">
                  {storeItem.name}
                </Text>
              </Animated.View>

              {/* Item Display */}
              <Animated.View
                entering={ZoomIn.delay(200).duration(400).springify()}
                className="bg-gradient-to-br from-orange-600/10 to-yellow-600/10 rounded-2xl p-4 items-center mb-4 border border-orange-600/20"
              >
                <Image
                  source={{ uri: storeItem.image_url }}
                  style={{
                    width: storeItem.item_type === "flag" ? 100 : 70,
                    height: 70,
                  }}
                  resizeMode="contain"
                />
              </Animated.View>

              {/* Price Info */}
              <Animated.View
                entering={FadeInDown.delay(300).duration(400)}
                className="bg-white/5 rounded-xl p-3 mb-4 border border-white/10"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-white/60 text-xs font-semibold">
                    Price
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="diamond" size={18} color="#EA580C" />

                    <Text className="text-orange-600 text-lg font-black ml-1">
                      {storeItem.base_price}
                    </Text>
                  </View>
                </View>

                <View className="h-px bg-white/10 mb-2" />

                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-white/60 text-xs font-semibold">
                    Your Balance
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="diamond" size={16} color="#EA580C" />

                    <Text className="text-white text-sm font-bold ml-1">
                      {currentGems}
                    </Text>
                  </View>
                </View>

                {/* {hasEnoughGems && (
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white/60 text-xs font-semibold">
                      After Purchase
                    </Text>
                    <View className="flex-row items-center">
                                                          <Ionicons name="diamond" size={16} color="#EA580C" />

                      <Text className="text-white text-sm font-bold ml-1">
                        {remainingGems}
                      </Text>
                    </View>
                  </View>
                )} */}
              </Animated.View>

              {/* Warning if not enough gems */}
              {!hasEnoughGems && (
                <Animated.View
                  entering={FadeInDown.delay(350).duration(400)}
                  className="bg-red-500/10 rounded-xl p-3 mb-4 border border-red-500/30"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="warning" size={16} color="#EF4444" />
                    <Text className="text-red-400 text-xs font-semibold ml-2 flex-1">
                      Need {storeItem.base_price - currentGems} more gems
                    </Text>
                  </View>
                </Animated.View>
              )}

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <AnimatedTouchable
                  entering={FadeInDown.delay(400).duration(400)}
                  onPress={onCancel}
                  className="flex-1 bg-white/5 rounded-xl py-3 border border-white/10"
                  activeOpacity={0.7}
                >
                  <Text className="text-white text-center text-sm font-bold">
                    Cancel
                  </Text>
                </AnimatedTouchable>

                <AnimatedTouchable
                  entering={FadeInDown.delay(450).duration(400)}
                  onPress={onConfirm}
                  disabled={!hasEnoughGems || isPending}
                  className={`flex-1 rounded-xl py-3 ${
                    hasEnoughGems ? "bg-orange-600" : "bg-white/10"
                  }`}
                  activeOpacity={0.7}
                  style={
                    hasEnoughGems
                      ? {
                          shadowColor: "#ea580c",
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                        }
                      : {}
                  }
                >
                  {isPending ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text
                      className={`text-center text-sm font-black ${
                        hasEnoughGems ? "text-white" : "text-white/30"
                      }`}
                    >
                      Confirm
                    </Text>
                  )}
                </AnimatedTouchable>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  return null;
}
