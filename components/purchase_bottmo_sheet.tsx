import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image, // Imported from react-native
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SwipeableSheet } from "./swipeable_sheet";

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

interface PurchaseBottomSheetProps {
  visible: boolean;
  isPending: boolean;
  itemType: "gem" | "store";
  gemItem?: GemPurchaseItem | null;
  storeItem?: StoreItem | null;
  currentGems: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

export default function PurchaseBottomSheet({
  visible,
  isPending,
  itemType,
  gemItem,
  storeItem,
  currentGems,
  onConfirm,
  onCancel,
}: PurchaseBottomSheetProps) {
  const isStoreItem = itemType === "store";

  // --- Logic Configuration ---
  const config = useMemo(() => {
    if (isStoreItem && storeItem) {
      const canAfford = currentGems >= storeItem.base_price;
      return {
        title: storeItem.name,
        subtitle: storeItem.item_type?.toUpperCase() || "ITEM",
        costValue: storeItem.base_price,
        costString: `${storeItem.base_price}`,
        isCurrency: false,
        canAfford,
        image: { uri: storeItem.image_url },
        balanceChange: -storeItem.base_price,
        btnText: canAfford ? "CONFIRM REDEMPTION" : "NOT ENOUGH GEMS",
      };
    } else if (gemItem) {
      return {
        title: `${gemItem.baseAmount} Gems`,
        subtitle: "CURRENCY PACK",
        costValue: 0,
        costString: gemItem.price,
        isCurrency: true,
        canAfford: true,
        image: require("@/assets/images/flags/beer_flag.jpg"), 
        balanceChange: gemItem.finalAmount,
        btnText: `PURCHASE FOR ${gemItem.price}`,
      };
    }
    return null;
  }, [itemType, storeItem, gemItem, currentGems]);

  if (!config) return null;

  const newBalance = currentGems + config.balanceChange;

  return (
    <SwipeableSheet
      visible={visible}
      onClose={onCancel}
      coverImage={undefined} // We are building a custom hero below
      fullScreen={true}
    >
      <View className="-mx-5 -mt-16 mb-8 relative bg-white/[0.03] items-center justify-center">
        <View style={{ height: SCREEN_HEIGHT * 0.45, width: SCREEN_WIDTH }}>
          <Image
            source={config.image}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain" 
          />
          
          <LinearGradient
            colors={["transparent", "#000000"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
            }}
          />
        </View>

        <View className="absolute bottom-4 left-5 flex-row items-center">
             <View className="bg-orange-600 px-3 py-1.5 rounded-lg mr-2 shadow-sm shadow-black">
                <Text className="text-black text-[10px] font-black tracking-widest uppercase">
                  {config.subtitle}
                </Text>
             </View>
             {config.balanceChange > 0 && gemItem?.bonus ? (
                <View className="bg-yellow-500 px-2 py-1.5 rounded-lg shadow-sm shadow-black">
                    <Text className="text-black text-[10px] font-black uppercase">
                      +{gemItem.bonus} Bonus
                    </Text>
                </View>
             ) : null}
        </View>
      </View>

      <View>
        <Text className="text-white text-4xl font-black mb-6 uppercase leading-9">
          {config.title}
        </Text>

        <View className="bg-white/[0.05] rounded-2xl p-5 border border-white/[0.1] mb-8">
          <Text className="text-white/40 text-[10px] font-bold tracking-widest mb-4 uppercase">
            Transaction Summary
          </Text>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white/70 font-bold text-base">Current Balance</Text>
            <View className="flex-row items-center">
              <Text className="text-white/70 font-bold text-base mr-1">{currentGems}</Text>
              <Ionicons name="diamond" size={14} color="#ffffff80" />
            </View>
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <Text className={isStoreItem ? "text-red-400 font-bold text-base" : "text-green-400 font-bold text-base"}>
              {isStoreItem ? "Cost" : "Receive"}
            </Text>
            <View className="flex-row items-center">
              <Text className={isStoreItem ? "text-red-400 font-bold text-base mr-1" : "text-green-400 font-bold text-base mr-1"}>
                {isStoreItem ? "-" : "+"}{isStoreItem ? config.costValue : gemItem?.finalAmount}
              </Text>
              <Ionicons 
                name="diamond" 
                size={14} 
                color={isStoreItem ? "#F87171" : "#4ADE80"} 
              />
            </View>
          </View>

          <View className="h-[1px] bg-white/[0.1] mb-3 w-full" />

          <View className="flex-row justify-between items-center">
            <Text className="text-white font-black text-lg">New Balance</Text>
            <View className="flex-row items-center">
               <Text className={`font-black text-xl mr-1 ${config.canAfford ? 'text-orange-500' : 'text-red-500'}`}>
                {newBalance < 0 ? 0 : newBalance}
               </Text>
               <Ionicons name="diamond" size={18} color={config.canAfford ? "#F97316" : "#EF4444"} />
            </View>
          </View>
        </View>

        {/* Real Money Price Label (Only for Gems) */}
        {!isStoreItem && (
            <View className="items-center mb-6">
                 <Text className="text-white/50 text-xs font-semibold mb-1">Total to Pay</Text>
                 <Text className="text-white text-3xl font-black">{config.costString}</Text>
            </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          onPress={onConfirm}
          disabled={!config.canAfford || isPending}
          activeOpacity={0.8}
          className={`w-full py-4 rounded-2xl flex-row justify-center items-center shadow-lg mb-8 ${
            config.canAfford 
                ? "bg-orange-600 shadow-orange-900/20" 
                : "bg-white/10 border border-white/5"
          }`}
        >
          {isPending ? (
            <ActivityIndicator color={config.canAfford ? "black" : "white"} />
          ) : (
            <>
              {!config.canAfford && (
                <Ionicons name="lock-closed" size={20} color="white" style={{ marginRight: 8, opacity: 0.5 }} />
              )}
              <Text 
                className={`text-lg font-black tracking-wide ${
                    config.canAfford ? "text-black" : "text-white/30"
                }`}
              >
                {config.btnText}
              </Text>
              {config.canAfford && (
                  <Ionicons name="arrow-forward-circle" size={24} color="black" style={{ marginLeft: 8 }} />
              )}
            </>
          )}
        </TouchableOpacity>

        {/* Footer Warning */}
        {!config.canAfford && isStoreItem && (
             <Text className="text-red-400/80 text-center text-xs -mt-4 mb-8 font-semibold">
                You need {Math.abs(newBalance)} more gems to purchase this item.
             </Text>
        )}
      </View>
    </SwipeableSheet>
  );
}