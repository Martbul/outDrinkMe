import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { Header } from "@/components/header";
import { useApp } from "@/providers/AppProvider";
import { Image } from "expo-image";
import SecondaryHeader from "@/components/secondaryHeader";
import { useRouter } from "expo-router";

// Types for inventory items
interface InventoryItem {
  id: string;
  type: "theme" | "avatar_frame" | "badge" | "emoji_pack" | "background";
  name: string;
  description: string;
  image_url?: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  equipped: boolean;
  purchased_at: string;
}

export default function InventoryScreen() {
   const router = useRouter()
  const insets = useSafeAreaInsets();
  const { userData, refreshAll } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "theme" | "avatar_frame" | "badge" | "emoji_pack" | "background"
  >("all");
  const [refreshing, setRefreshing] = useState(false);

  // Mock inventory data - replace with actual API data
  const inventoryItems: InventoryItem[] = [
    {
      id: "1",
      type: "theme",
      name: "Dark Ocean",
      description: "Deep blue ocean theme with wave animations",
      image_url:
        "https://via.placeholder.com/150/1e40af/ffffff?text=Dark+Ocean",
      rarity: "Epic",
      equipped: true,
      purchased_at: "2024-01-15",
    },
    {
      id: "2",
      type: "avatar_frame",
      name: "Golden Crown",
      description: "Legendary golden frame for true champions",
      image_url: "https://via.placeholder.com/150/d97706/ffffff?text=Crown",
      rarity: "Legendary",
      equipped: true,
      purchased_at: "2024-01-10",
    },
    {
      id: "3",
      type: "badge",
      name: "Party Animal",
      description: "Show everyone you know how to party",
      image_url: "https://via.placeholder.com/150/7c3aed/ffffff?text=Badge",
      rarity: "Rare",
      equipped: false,
      purchased_at: "2024-01-08",
    },
    {
      id: "4",
      type: "emoji_pack",
      name: "Drink Emojis",
      description: "15 exclusive drinking emojis",
      image_url: "https://via.placeholder.com/150/ea580c/ffffff?text=Emojis",
      rarity: "Common",
      equipped: false,
      purchased_at: "2024-01-05",
    },
    {
      id: "5",
      type: "background",
      name: "Neon Nights",
      description: "Vibrant neon city background",
      image_url: "https://via.placeholder.com/150/ec4899/ffffff?text=Neon",
      rarity: "Epic",
      equipped: false,
      purchased_at: "2024-01-03",
    },
  ];

  const categories = [
    { key: "all", label: "All", icon: "grid" },
    { key: "theme", label: "Themes", icon: "color-palette" },
    { key: "avatar_frame", label: "Frames", icon: "person-circle" },
    { key: "badge", label: "Badges", icon: "ribbon" },
    { key: "emoji_pack", label: "Emojis", icon: "happy" },
    { key: "background", label: "Backgrounds", icon: "image" },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return "#d08700";
      case "Epic":
        return "#6e11b0";
      case "Rare":
        return "#193cb8";
      default:
        return "#9CA3AF";
    }
  };

  const getFilteredItems = () => {
    if (selectedCategory === "all") {
      return inventoryItems;
    }
    return inventoryItems.filter((item) => item.type === selectedCategory);
  };

  const filteredItems = getFilteredItems();
  const equippedCount = inventoryItems.filter((item) => item.equipped).length;
  const totalValue = inventoryItems.length * 100; // Mock value calculation

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
    <SecondaryHeader title="Inventory"/>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
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
        {/* Header Section */}
        <View className="px-4 pt-1 pb-4">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
                  YOUR INVENTORY
                </Text>
                <Text className="text-white text-[28px] font-black">
                  My Items
                </Text>
              </View>

              <View className="bg-orange-600/20 px-4 py-2 rounded-xl">
                <Text className="text-orange-600 text-2xl font-black">
                  {inventoryItems.length}
                </Text>
                <Text className="text-orange-600/70 text-[10px] font-bold">
                  ITEMS
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View className="flex-row gap-3 mt-3">
              <View className="flex-1 bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-white/50 text-[10px] font-bold">
                      EQUIPPED
                    </Text>
                    <Text className="text-white text-xl font-black">
                      {equippedCount}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color="#EA580C"
                  />
                </View>
              </View>

              <View className="flex-1 bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-white/50 text-[10px] font-bold">
                      VALUE
                    </Text>
                    <Text className="text-white text-xl font-black">
                      {totalValue}
                    </Text>
                  </View>
                  <FontAwesome5 name="gem" size={20} color="#d08700" />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mb-4"
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              onPress={() => setSelectedCategory(category.key as any)}
              className={`${
                selectedCategory === category.key
                  ? "bg-orange-600"
                  : "bg-white/[0.03]"
              } px-5 py-3 rounded-xl mr-3 border ${
                selectedCategory === category.key
                  ? "border-orange-600"
                  : "border-white/[0.08]"
              } flex-row items-center`}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={selectedCategory === category.key ? "black" : "white"}
                style={{ marginRight: 6 }}
              />
              <Text
                className={`${
                  selectedCategory === category.key
                    ? "text-black"
                    : "text-white"
                } text-sm font-bold`}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Inventory Grid */}
        <View className="px-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white text-lg font-black">
              {selectedCategory === "all"
                ? "All Items"
                : categories.find((c) => c.key === selectedCategory)?.label}
            </Text>
            <Text className="text-white/50 text-sm font-bold">
              {filteredItems.length} items
            </Text>
          </View>

          {filteredItems.length === 0 ? (
            <View className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center">
              <FontAwesome5
                name="box-open"
                size={64}
                color="#666"
                className="mb-6"
              />
              <Text className="text-white text-lg font-black mb-1">
                No items yet
              </Text>
              <Text className="text-white/50 text-sm text-center">
                Visit the store to purchase items!
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap -mx-2">
              {filteredItems.map((item) => (
                <View key={item.id} className="w-1/2 px-2 mb-4">
                  <TouchableOpacity
                    className="bg-white/[0.03] rounded-2xl overflow-hidden border-2"
                    style={{ borderColor: getRarityColor(item.rarity) }}
                  >
                    {/* Rarity Header */}
                    <View
                      className="px-3 py-2 flex-row justify-between items-center"
                      style={{
                        backgroundColor: `${getRarityColor(item.rarity)}20`,
                      }}
                    >
                      <Text
                        className="text-xs font-black tracking-wide"
                        style={{ color: getRarityColor(item.rarity) }}
                      >
                        {item.rarity.toUpperCase()}
                      </Text>
                      {item.equipped && (
                        <View className="bg-orange-600 px-2 py-0.5 rounded-full">
                          <Text className="text-black text-[9px] font-black">
                            EQUIPPED
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Item Image */}
                    <View className="aspect-square bg-white/[0.05] items-center justify-center">
                      {item.image_url ? (
                        <Image
                          source={{ uri: item.image_url }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                          transition={200}
                        />
                      ) : (
                        <FontAwesome5 name="box" size={48} color="#666" />
                      )}
                    </View>

                    {/* Item Details */}
                    <View className="p-3">
                      <View className="flex-row items-center mb-1">
                        {item.type === "theme" && (
                          <Ionicons
                            name="color-palette"
                            size={12}
                            color="#EA580C"
                          />
                        )}
                        {item.type === "avatar_frame" && (
                          <Ionicons
                            name="person-circle"
                            size={12}
                            color="#EA580C"
                          />
                        )}
                        {item.type === "badge" && (
                          <Ionicons name="ribbon" size={12} color="#EA580C" />
                        )}
                        {item.type === "emoji_pack" && (
                          <Ionicons name="happy" size={12} color="#EA580C" />
                        )}
                        {item.type === "background" && (
                          <Ionicons name="image" size={12} color="#EA580C" />
                        )}
                        <Text className="text-white/50 text-[10px] font-bold tracking-wide ml-1">
                          {item.type.replace("_", " ").toUpperCase()}
                        </Text>
                      </View>
                      <Text
                        className="text-white text-sm font-black mb-1"
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text
                        className="text-white/50 text-xs font-semibold"
                        numberOfLines={2}
                      >
                        {item.description}
                      </Text>
                    </View>

                    {/* Action Button */}
                    <View className="px-3 pb-3">
                      <TouchableOpacity
                        className={`${
                          item.equipped
                            ? "bg-white/[0.05] border border-white/[0.08]"
                            : "bg-orange-600"
                        } py-2 rounded-lg items-center`}
                      >
                        <Text
                          className={`${
                            item.equipped ? "text-white" : "text-black"
                          } text-xs font-black tracking-widest`}
                        >
                          {item.equipped ? "UNEQUIP" : "EQUIP"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Quick Stats Section */}
        <View className="px-4 mt-4 mb-8">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-4">
              INVENTORY BREAKDOWN
            </Text>

            {categories.slice(1).map((category, index) => {
              const count = inventoryItems.filter(
                (item) => item.type === category.key
              ).length;
              const percentage =
                inventoryItems.length > 0
                  ? (count / inventoryItems.length) * 100
                  : 0;

              return (
                <View
                  key={category.key}
                  className={index < categories.length - 2 ? "mb-4" : ""}
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                      <Ionicons
                        name={category.icon as any}
                        size={14}
                        color="#EA580C"
                      />
                      <Text className="text-white text-sm font-bold ml-2">
                        {category.label}
                      </Text>
                    </View>
                    <Text className="text-white/70 text-sm font-bold">
                      {count} ({percentage.toFixed(0)}%)
                    </Text>
                  </View>
                  <View className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <View
                      className="h-full bg-orange-600 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View className="px-4 mb-8">
          <TouchableOpacity className="bg-gradient-to-br from-orange-600/30 to-orange-600/10 rounded-2xl p-5 border-2 border-orange-600/50" onPress={() => router.push("/(screens)/store")}>
            <View className="flex-row items-center">
              <View className="bg-orange-600 w-12 h-12 rounded-full items-center justify-center mr-3">
                <FontAwesome5 name="shopping-bag" size={24} color="black" />
              </View>
              <View className="flex-1">
                <Text className="text-orange-600 text-xs font-bold tracking-widest">
                  VISIT STORE
                </Text>
                <Text className="text-white text-xl font-black">
                  Get More Items
                </Text>
                <Text className="text-white/70 text-xs font-semibold mt-1">
                  You have {userData?.gems || 0} gems
                </Text>
              </View>
              <FontAwesome5 name="chevron-right" size={20} color="#EA580C" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
