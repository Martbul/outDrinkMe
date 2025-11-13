import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";

interface BeverageItem {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  image: string | null;
  alcoholPercentage: string;
  timestamp: string;
  pointsEarned: number;
  isCustom?: boolean;
}

interface MilestoneItem {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
  requirement: number;
}

export default function BadgeGridCollection() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [collection, setCollection] = useState<BeverageItem[]>([]);
  const [points, setPoints] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  const milestones: MilestoneItem[] = [
    {
      id: "1",
      title: "First Drink",
      icon: "🏆",
      unlocked: collection.length >= 1,
      requirement: 1,
    },
    {
      id: "2",
      title: "10 Collected",
      icon: "⭐",
      unlocked: collection.length >= 10,
      requirement: 10,
    },
    {
      id: "3",
      title: "50 Drinks",
      icon: "💎",
      unlocked: collection.length >= 50,
      requirement: 50,
    },
    {
      id: "4",
      title: "Legend",
      icon: "👑",
      unlocked: collection.length >= 100,
      requirement: 100,
    },
  ];

  const fetchProductInfo = async (barcode: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        return {
          found: true,
          name: product.product_name || "Unknown Product",
          brand: product.brands || "Unknown Brand",
          image: product.image_url || null,
          alcoholPercentage: product.alcohol_volume || "N/A",
        };
      }
      return { found: false };
    } catch (error) {
      console.error("Error fetching product:", error);
      return { found: false };
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);

    const alreadyCollected = collection.some((item) => item.barcode === data);
    if (alreadyCollected) {
      Alert.alert(
        "Already Collected!",
        "You've already scanned this beverage.",
        [{ text: "OK", onPress: () => setScanned(false) }]
      );
      return;
    }

    const productInfo = await fetchProductInfo(data);

    if (!productInfo.found) {
      Alert.alert(
        "Product Not Found",
        `Barcode: ${data}\n\nThis product is not in our database.`,
        [
          {
            text: "Collect Anyway",
            onPress: () => addToCollection(data, productInfo),
          },
          { text: "Cancel", onPress: () => setScanned(false) },
        ]
      );
      return;
    }

    addToCollection(data, productInfo);
  };

  const addToCollection = (barcode: string, productInfo: any) => {
    const newItem: BeverageItem = {
      id: Date.now().toString(),
      barcode: barcode,
      name: productInfo?.name || "Unknown Product",
      brand: productInfo?.brand || "Unknown Brand",
      image: productInfo?.image || null,
      alcoholPercentage: productInfo?.alcoholPercentage || "N/A",
      timestamp: new Date().toLocaleString(),
      pointsEarned: 10,
    };

    setCollection((prev) => [newItem, ...prev]);
    setPoints((prev) => prev + 10);
    setScanned(false);
    setScanning(false);

    Alert.alert(
      "Success! 🎉",
      `${newItem.brand}\n${newItem.name}\n\n+10 points collected!`,
      [{ text: "Done" }]
    );
  };

  const handleScanPress = async () => {
    const permissionResult = await requestPermission();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission needed",
        "Camera permission is required to scan barcodes"
      );
      return;
    }
    setScanning(true);
    setScanned(false);
  };

  if (!permission) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#EA580C" />
      </View>
    );
  }

  if (scanning) {
    return (
      <View className="flex-1 bg-black">
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "ean13", "ean8", "code128", "upc_a", "upc_e"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          {loading && (
            <View className="absolute inset-0 bg-black/70 justify-center items-center">
              <ActivityIndicator size="large" color="#EA580C" />
              <Text className="text-white mt-4 text-base font-semibold">
                Looking up product...
              </Text>
            </View>
          )}

          <View className="flex-1 justify-center items-center">
            <View className="w-64 h-64 border-2 border-white rounded-lg" />
            <Text className="mt-5 text-white text-base font-semibold bg-black/50 px-4 py-2 rounded-lg">
              Point camera at barcode
            </Text>
          </View>

          <View className="absolute bottom-12 left-4 right-4">
            <TouchableOpacity
              onPress={() => {
                setScanning(false);
                setScanned(false);
              }}
              className="bg-white/10 py-4 rounded-2xl items-center border border-white/20"
            >
              <Text className="text-white text-base font-black tracking-widest">
                CANCEL
              </Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-4 pt-6 pb-4">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-2">
              MY COLLECTION
            </Text>
            <Text className="text-white text-[32px] font-black">
              Badge Collection
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="px-4 mb-4">
          <View className="bg-orange-600/20 rounded-2xl p-5 border border-orange-600/30">
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-white text-[32px] font-black">
                  {points}
                </Text>
                <Text className="text-white/70 text-[11px] font-bold tracking-widest">
                  POINTS
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-[32px] font-black">
                  {collection.length}
                </Text>
                <Text className="text-white/70 text-[11px] font-bold tracking-widest">
                  COLLECTED
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-[32px] font-black">
                  {currentStreak}
                </Text>
                <Text className="text-white/70 text-[11px] font-bold tracking-widest">
                  STREAK
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recently Collected */}
        <View className="px-4 mb-4">
          <Text className="text-white text-xl font-black mb-3">
            Recently Collected
          </Text>

          {collection.length === 0 ? (
            <View className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center">
              <View className="w-24 h-24 rounded-2xl bg-orange-600/20 items-center justify-center mb-4">
                <Ionicons name="beer" size={48} color="#EA580C" />
              </View>
              <Text className="text-white text-xl font-black mb-2">
                Start Your Collection
              </Text>
              <Text className="text-white/50 text-sm text-center font-semibold">
                Scan your first beverage to begin collecting badges!
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap">
              {collection.slice(0, 6).map((item, index) => (
                <View key={item.id} className="w-1/3 p-1.5">
                  <TouchableOpacity
                    className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] items-center aspect-square justify-center"
                    activeOpacity={0.7}
                  >
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        className="w-12 h-12 rounded-lg mb-2"
                        resizeMode="contain"
                      />
                    ) : (
                      <Text className="text-4xl mb-2">🍺</Text>
                    )}
                    <Text
                      className="text-white text-xs font-bold text-center"
                      numberOfLines={1}
                    >
                      {item.brand}
                    </Text>
                    <Text
                      className="text-white/50 text-[10px] font-semibold text-center"
                      numberOfLines={1}
                    >
                      {item.alcoholPercentage !== "N/A"
                        ? `${item.alcoholPercentage}% ABV`
                        : "N/A"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Locked badges to fill grid */}
              {[...Array(Math.max(0, 6 - collection.length))].map(
                (_, index) => (
                  <View key={`locked-${index}`} className="w-1/3 p-1.5">
                    <View className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] border-dashed items-center aspect-square justify-center">
                      <Text className="text-4xl mb-2 opacity-30">🔒</Text>
                      <Text className="text-white/30 text-xs font-bold">
                        Locked
                      </Text>
                    </View>
                  </View>
                )
              )}
            </View>
          )}
        </View>

        {/* View All Button */}
        <View className="px-4 mb-6">
          <TouchableOpacity
            className="bg-orange-600 rounded-2xl py-5 items-center"
            activeOpacity={0.8}
          >
            <Text className="text-black text-base font-black tracking-widest">
              VIEW ALL BEVERAGES (2,547 TOTAL)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Milestones */}
        <View className="px-4 mb-4">
          <Text className="text-white text-xl font-black mb-3">Milestones</Text>

          <View className="flex-row flex-wrap">
            {milestones.map((milestone) => (
              <View key={milestone.id} className="w-1/4 p-1.5">
                <TouchableOpacity
                  className={`rounded-2xl p-4 border items-center aspect-square justify-center ${
                    milestone.unlocked
                      ? "bg-orange-600/20 border-orange-600/30"
                      : "bg-white/[0.03] border-white/[0.08] border-dashed"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-4xl mb-2 ${!milestone.unlocked && "opacity-30"}`}
                  >
                    {milestone.unlocked ? milestone.icon : "🔒"}
                  </Text>
                  <Text
                    className={`text-xs font-bold text-center ${
                      milestone.unlocked ? "text-orange-600" : "text-white/30"
                    }`}
                    numberOfLines={2}
                  >
                    {milestone.title}
                  </Text>
                  {!milestone.unlocked && (
                    <Text className="text-white/20 text-[10px] font-semibold mt-1">
                      {milestone.requirement}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Full Collection List */}
        {collection.length > 0 && (
          <View className="px-4 mb-4">
            <Text className="text-white text-xl font-black mb-3">
              Full Collection ({collection.length})
            </Text>

            {collection.map((item, index) => (
              <View key={item.id}>
                <TouchableOpacity
                  className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] mb-3"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        className="w-20 h-20 rounded-xl mr-4"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-20 h-20 rounded-xl bg-white/[0.05] items-center justify-center mr-4">
                        <Text className="text-4xl">🍺</Text>
                      </View>
                    )}

                    <View className="flex-1">
                      <Text className="text-orange-600 text-xs font-bold tracking-wide mb-1">
                        {item.brand.toUpperCase()}
                      </Text>
                      <Text className="text-white text-base font-black mb-1">
                        {item.name}
                      </Text>
                      <Text className="text-white/50 text-xs font-semibold mb-2">
                        {item.alcoholPercentage !== "N/A"
                          ? `${item.alcoholPercentage}% ABV`
                          : "Alcohol %: N/A"}
                      </Text>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-white/40 text-[11px] font-semibold">
                          {item.timestamp.split(",")[0]}
                        </Text>
                        <Text className="text-orange-600 text-sm font-black">
                          +{item.pointsEarned} pts
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Scan Button */}
      <View
        className="absolute left-4 right-4"
        style={{ bottom: insets.bottom + 20 }}
      >
        <TouchableOpacity
          onPress={handleScanPress}
          className="bg-orange-600 py-5 rounded-2xl items-center shadow-lg shadow-orange-600/30"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <Feather name="camera" size={24} color="#000" />
            <Text className="text-black text-base font-black tracking-widest ml-2">
              SCAN BARCODE
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
