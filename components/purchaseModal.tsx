import React from "react";
import { View, Text, TouchableOpacity, Modal, Image } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

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
  itemType: "gem" | "store";
  gemItem?: GemPurchaseItem | null;
  storeItem?: StoreItem | null;
  currentGems: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PurchaseConfirmationModal({
  visible,
  itemType,
  gemItem,
  storeItem,
  currentGems,
  onConfirm,
  onCancel,
}: PurchaseConfirmationModalProps) {
  if (itemType === "gem" && gemItem) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onCancel}
      >
        <View className="flex-1 bg-black/80 justify-center items-center px-4">
          <View className="bg-[#1a1a1a] rounded-3xl w-full max-w-md border-2 border-white/10 overflow-hidden">
            {/* Header */}
            <View className="bg-gradient-to-r from-orange-600/20 to-yellow-600/20 p-6 border-b border-white/10">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-orange-600 text-xs font-bold tracking-widest">
                  CONFIRM PURCHASE
                </Text>
                <TouchableOpacity
                  onPress={onCancel}
                  className="bg-white/10 rounded-full p-1"
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
              <Text className="text-white text-2xl font-black">Buy Gems</Text>
            </View>

            {/* Gem Display */}
            <View className="p-6">
              <View className="bg-black/40 rounded-2xl p-6 items-center mb-4 border border-white/5">
                <View className="items-center">
                  <View className="bg-orange-600/20 rounded-3xl w-24 h-24 items-center justify-center mb-4 border-2 border-orange-600/40">
                    <MaterialCommunityIcons
                      name="diamond-stone"
                      size={56}
                      color="#EA580C"
                    />
                  </View>
                  <View className="flex-row items-center bg-orange-600/20 rounded-xl py-3 px-6 border border-orange-600/40">
                    <Text className="text-orange-600 text-3xl font-black">
                      {gemItem.baseAmount}
                    </Text>
                    {gemItem.bonus && (
                      <Text className="text-[#ff8c00] text-xl font-black ml-2">
                        +{gemItem.bonus}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Price Display */}
              <View className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/10">
                <View className="flex-row items-center justify-between">
                  <Text className="text-white/70 text-sm font-semibold">
                    Price:
                  </Text>
                  <Text className="text-white text-lg font-black">
                    {gemItem.price}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={onCancel}
                  className="flex-1 bg-white/5 rounded-xl py-4 border border-white/10"
                  activeOpacity={0.7}
                >
                  <Text className="text-white text-center text-base font-bold">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onConfirm}
                  className="flex-1 rounded-xl py-4 bg-orange-600"
                  activeOpacity={0.7}
                >
                  <Text className="text-center text-base font-black text-white">
                    Buy Now
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
        <View className="flex-1 bg-black/80 justify-center items-center px-4">
          <View className="bg-[#1a1a1a] rounded-3xl w-full max-w-md border-2 border-white/10 overflow-hidden">
            {/* Header */}
            <View className="bg-gradient-to-r from-orange-600/20 to-yellow-600/20 p-6 border-b border-white/10">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-orange-600 text-xs font-bold tracking-widest">
                  CONFIRM PURCHASE
                </Text>
                <TouchableOpacity
                  onPress={onCancel}
                  className="bg-white/10 rounded-full p-1"
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
              <Text className="text-white text-2xl font-black">
                {storeItem.name}
              </Text>
            </View>

            {/* Item Display */}
            <View className="p-6">
              <View className="bg-black/40 rounded-2xl p-6 items-center mb-4 border border-white/5">
                <View className="items-center">
                  <Image
                    source={{ uri: storeItem.image_url }}
                    style={{
                      width: storeItem.item_type === "flag" ? 120 : 80,
                      height: 80,
                    }}
                    resizeMode="contain"
                  />
                  <Text className="text-white text-lg font-bold mt-3">
                    {storeItem.name}
                  </Text>
                </View>
              </View>

              {/* Price Display */}
              <View className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/10">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-white/70 text-sm font-semibold">
                    Price:
                  </Text>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="diamond-stone"
                      size={20}
                      color="#EA580C"
                    />
                    <Text className="text-orange-600 text-xl font-black ml-1">
                      {storeItem.base_price}
                    </Text>
                  </View>
                </View>

                <View className="h-px bg-white/10 mb-3" />

                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-white/70 text-sm font-semibold">
                    Current Balance:
                  </Text>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="diamond-stone"
                      size={18}
                      color="#EA580C"
                    />
                    <Text className="text-white text-base font-bold ml-1">
                      {currentGems}
                    </Text>
                  </View>
                </View>

                {hasEnoughGems && (
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white/70 text-sm font-semibold">
                      After Purchase:
                    </Text>
                    <View className="flex-row items-center">
                      <MaterialCommunityIcons
                        name="diamond-stone"
                        size={18}
                        color={hasEnoughGems ? "#EA580C" : "#EF4444"}
                      />
                      <Text
                        className={`text-base font-bold ml-1 ${
                          hasEnoughGems ? "text-white" : "text-red-500"
                        }`}
                      >
                        {hasEnoughGems ? remainingGems : "Not enough"}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Warning if not enough gems */}
              {!hasEnoughGems && (
                <View className="bg-red-500/10 rounded-xl p-4 mb-4 border border-red-500/30">
                  <View className="flex-row items-center">
                    <Ionicons name="warning" size={20} color="#EF4444" />
                    <Text className="text-red-500 text-sm font-bold ml-2 flex-1">
                      You need {storeItem.base_price - currentGems} more gems to
                      make this purchase
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={onCancel}
                  className="flex-1 bg-white/5 rounded-xl py-4 border border-white/10"
                  activeOpacity={0.7}
                >
                  <Text className="text-white text-center text-base font-bold">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onConfirm}
                  disabled={!hasEnoughGems}
                  className={`flex-1 rounded-xl py-4 ${
                    hasEnoughGems ? "bg-orange-600" : "bg-white/10"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-center text-base font-black ${
                      hasEnoughGems ? "text-white" : "text-white/30"
                    }`}
                  >
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return null;
}
