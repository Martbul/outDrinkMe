import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import Header from "@/components/header";

interface BeverageItem {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  image: string | null;
  alcoholPercentage: string;
  category: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  pointsEarned: number;
  isCustom?: boolean;
}

interface CustomBeverage {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  alcoholPercentage: string;
  imageUrl: string | null;
}

export default function Collection() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentScreen, setCurrentScreen] = useState("collection"); // 'collection' or 'manual'
  const [customBeverages, setCustomBeverages] = useState<CustomBeverage[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<
    "All" |"Beer" | "Whiskey" | "Wine" | "Vodka" | "Liqueur" | "Rum" | "Tequila"
  >("All");
  const [collection, setCollection] = useState<BeverageItem[]>([
    {
      id: "1",
      barcode: "123",
      name: "Heineken Lager",
      brand: "Heineken",
      image: null,
      alcoholPercentage: "5.0",
      category: "Beer",
      rarity: "common",
      pointsEarned: 10,
    },
    {
      id: "2",
      barcode: "456",
      name: "Jack Daniel's No. 7",
      brand: "Jack Daniel's",
      image: null,
      alcoholPercentage: "40",
      category: "Whiskey",
      rarity: "epic",
      pointsEarned: 10,
    },
  ]);

  // Form state for adding custom beverages
  const [formData, setFormData] = useState({
    barcode: "",
    name: "",
    brand: "",
    alcoholPercentage: "",
    imageUrl: "",
  });

  const categories = ["Beer", "Whiskey", "Wine", "Vodka", "Rum", "Tequila"];
  const totalSlots = 2547;
  const collectedCount = collection.length;
  const completionPercentage = (collectedCount / totalSlots) * 100;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "#FFD700";
      case "epic":
        return "#A855F7";
      case "rare":
        return "#3B82F6";
      default:
        return "#9CA3AF";
    }
  };

  const determineRarity = (
    alcoholPercentage: string
  ): BeverageItem["rarity"] => {
    const abv = parseFloat(alcoholPercentage);
    if (isNaN(abv)) return "common";
    if (abv >= 40) return "legendary";
    if (abv >= 20) return "epic";
    if (abv >= 10) return "rare";
    return "common";
  };

  const fetchProductInfo = async (barcode: string) => {
    try {
      setLoading(true);

      // First check custom database
      const customProduct = customBeverages.find(
        (item) => item.barcode === barcode
      );
      if (customProduct) {
        return {
          found: true,
          name: customProduct.name,
          brand: customProduct.brand,
          image: customProduct.imageUrl || null,
          category: "Custom Entry",
          alcoholPercentage: customProduct.alcoholPercentage,
          isCustom: true,
        };
      }

      // If not in custom DB, check Open Food Facts API
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
          category: product.categories || "Beverage",
          alcoholPercentage: product.alcohol_volume || "N/A",
          isCustom: false,
        };
      } else {
        return { found: false };
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      return { found: false };
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);

    // Check if already collected
    const alreadyCollected = collection.some((item) => item.barcode === data);

    if (alreadyCollected) {
      Alert.alert(
        "Already Collected!",
        "You've already scanned this beverage.",
        [{ text: "OK", onPress: () => setScanned(false) }]
      );
      return;
    }

    // Fetch product information
    const productInfo = await fetchProductInfo(data);

    if (!productInfo.found) {
      Alert.alert(
        "Product Not Found",
        `Barcode: ${data}\n\nThis product is not in our database.`,
        [
          {
            text: "Add Manually",
            onPress: () => {
              setScanning(false);
              setCurrentScreen("manual");
              setFormData({ ...formData, barcode: data });
            },
          },
          {
            text: "Collect Anyway",
            onPress: () => addToCollection(data, null),
          },
          {
            text: "Cancel",
            onPress: () => setScanned(false),
          },
        ]
      );
      return;
    }

    // Add to collection with product info
    addToCollection(data, productInfo);
  };

  const addToCollection = (barcode: string, productInfo: any) => {
    const newItem: BeverageItem = {
      id: Date.now().toString(),
      barcode: barcode,
      name: productInfo?.name || "Unknown Product",
      brand: productInfo?.brand || "Unknown Brand",
      image: productInfo?.image || null,
      category: productInfo?.category || "Beverage",
      alcoholPercentage: productInfo?.alcoholPercentage || "N/A",
      rarity: determineRarity(productInfo?.alcoholPercentage || "0"),
      pointsEarned: 10,
      isCustom: productInfo?.isCustom || false,
    };

    setCollection((prev) => [newItem, ...prev]);
    setScanned(false);
    setScanning(false);

    Alert.alert(
      "Success! 🎉",
      `${newItem.brand}\n${newItem.name}\n\n+10 points collected!`,
      [{ text: "Done" }]
    );
  };

  const handleAddCustomBeverage = () => {
    if (!formData.barcode || !formData.name || !formData.brand) {
      Alert.alert(
        "Missing Information",
        "Please fill in barcode, name, and brand at minimum."
      );
      return;
    }

    // Check if barcode already exists in custom DB
    const exists = customBeverages.some(
      (item) => item.barcode === formData.barcode
    );
    if (exists) {
      Alert.alert(
        "Duplicate",
        "This barcode already exists in your custom database."
      );
      return;
    }

    // Add to custom database
    const newCustomBeverage: CustomBeverage = {
      id: Date.now().toString(),
      barcode: formData.barcode,
      name: formData.name,
      brand: formData.brand,
      alcoholPercentage: formData.alcoholPercentage || "N/A",
      imageUrl: formData.imageUrl || null,
    };

    setCustomBeverages((prev) => [...prev, newCustomBeverage]);

    Alert.alert(
      "Added Successfully!",
      `${formData.brand} - ${formData.name} has been added to your custom database.`,
      [
        {
          text: "Add Another",
          onPress: () =>
            setFormData({
              barcode: "",
              name: "",
              brand: "",
              alcoholPercentage: "",
              imageUrl: "",
            }),
        },
        {
          text: "Go to Collection",
          onPress: () => {
            setFormData({
              barcode: "",
              name: "",
              brand: "",
              alcoholPercentage: "",
              imageUrl: "",
            });
            setCurrentScreen("collection");
          },
        },
      ]
    );
  };

  const handleScanForManual = async () => {
    const permissionResult = await requestPermission();
    if (!permissionResult?.granted) {
      Alert.alert(
        "Permission needed",
        "Camera permission is required to scan barcodes"
      );
      return;
    }

    setScanning(true);
    setScanned(false);
  };

  const handleManualBarcodeScan = ({ data }: { data: string }) => {
    setFormData({ ...formData, barcode: data });
    setScanning(false);
    setScanned(false);
    Alert.alert("Barcode Scanned", `Barcode: ${data}`);
  };

  const handleScanPress = async () => {
    const permissionResult = await requestPermission();
    if (!permissionResult?.granted) {
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

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-base mb-4">No access to camera</Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-orange-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-black font-black">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Manual Entry Screen
  if (currentScreen === "manual" && !scanning) {
    return (
      <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
        <Header />
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 700 }}
        >
          <View className="px-4 pt-6 pb-4">
            <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
              <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
                ADD CUSTOM BEVERAGE
              </Text>
              <Text className="text-white text-[28px] font-black">
                Build Your Database
              </Text>
            </View>
          </View>

          <View className="px-4">
            <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-4">
              <Text className="text-white/50 text-xs font-bold tracking-wide mb-3">
                BARCODE *
              </Text>
              <View className="flex-row items-center mb-4">
                <TextInput
                  className="flex-1 bg-white/[0.05] text-white px-4 py-3 rounded-xl border border-white/[0.08] font-semibold mr-3"
                  placeholder="Enter barcode number"
                  placeholderTextColor="#666"
                  value={formData.barcode}
                  onChangeText={(text) =>
                    setFormData({ ...formData, barcode: text })
                  }
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  onPress={handleScanForManual}
                  className="bg-orange-600 px-5 py-3 rounded-xl"
                >
                  <Text className="text-black font-black">SCAN</Text>
                </TouchableOpacity>
              </View>

              <Text className="text-white/50 text-xs font-bold tracking-wide mb-2">
                BRAND NAME *
              </Text>
              <TextInput
                className="bg-white/[0.05] text-white px-4 py-3 rounded-xl border border-white/[0.08] font-semibold mb-4"
                placeholder="e.g., Heineken, Jack Daniel's"
                placeholderTextColor="#666"
                value={formData.brand}
                onChangeText={(text) =>
                  setFormData({ ...formData, brand: text })
                }
              />

              <Text className="text-white/50 text-xs font-bold tracking-wide mb-2">
                PRODUCT NAME *
              </Text>
              <TextInput
                className="bg-white/[0.05] text-white px-4 py-3 rounded-xl border border-white/[0.08] font-semibold mb-4"
                placeholder="e.g., Lager Beer, Tennessee Whiskey"
                placeholderTextColor="#666"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />

              <Text className="text-white/50 text-xs font-bold tracking-wide mb-2">
                ALCOHOL PERCENTAGE (ABV)
              </Text>
              <TextInput
                className="bg-white/[0.05] text-white px-4 py-3 rounded-xl border border-white/[0.08] font-semibold mb-4"
                placeholder="e.g., 5.0, 40"
                placeholderTextColor="#666"
                value={formData.alcoholPercentage}
                onChangeText={(text) =>
                  setFormData({ ...formData, alcoholPercentage: text })
                }
                keyboardType="decimal-pad"
              />

              <Text className="text-white/50 text-xs font-bold tracking-wide mb-2">
                IMAGE URL (OPTIONAL)
              </Text>
              <TextInput
                className="bg-white/[0.05] text-white px-4 py-3 rounded-xl border border-white/[0.08] font-semibold mb-4"
                placeholder="https://example.com/image.jpg"
                placeholderTextColor="#666"
                value={formData.imageUrl}
                onChangeText={(text) =>
                  setFormData({ ...formData, imageUrl: text })
                }
                autoCapitalize="none"
              />

              <TouchableOpacity
                onPress={handleAddCustomBeverage}
                className="bg-orange-600 py-4 rounded-xl items-center mb-3"
              >
                <Text className="text-black text-base font-black tracking-widest">
                  ADD TO DATABASE
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setCurrentScreen("collection")}
                className="bg-white/[0.03] py-4 rounded-xl items-center border border-white/[0.08]"
              >
                <Text className="text-white text-base font-black tracking-widest">
                  BACK TO COLLECTION
                </Text>
              </TouchableOpacity>
            </View>

            {/* Custom Database List */}
            {customBeverages.length > 0 && (
              <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-4">
                <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-3">
                  CUSTOM DATABASE ({customBeverages.length})
                </Text>
                {customBeverages.map((item) => (
                  <View
                    key={item.id}
                    className="bg-white/[0.05] rounded-xl p-3 mb-2"
                  >
                    <Text className="text-orange-600 text-xs font-bold">
                      {item.brand.toUpperCase()}
                    </Text>
                    <Text className="text-white text-sm font-black">
                      {item.name}
                    </Text>
                    <Text className="text-white/50 text-xs">
                      Barcode: {item.barcode}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // Scanner Screen
  if (scanning) {
    return (
      <View className="flex-1 bg-black">
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: [
              "aztec",
              "ean13",
              "ean8",
              "qr",
              "pdf417",
              "upc_e",
              "datamatrix",
              "code39",
              "code93",
              "itf14",
              "codabar",
              "code128",
              "upc_a",
            ],
          }}
          onBarcodeScanned={
            scanned
              ? undefined
              : currentScreen === "manual"
                ? handleManualBarcodeScan
                : handleBarCodeScanned
          }
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
              {currentScreen === "manual"
                ? "Scan barcode for manual entry"
                : "Point camera at barcode"}
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

  // Collection Screen (Main)
  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <Header />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Album Header */}
        <View className="px-4 pt-1 pb-4">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
                  COLLECTION ALBUM
                </Text>
                <Text className="text-white text-[28px] font-black">
                  My Beverages
                </Text>
              </View>
              <View className="bg-orange-600/20 px-4 py-2 rounded-xl">
                <Text className="text-orange-600 text-2xl font-black">
                  {collectedCount}
                </Text>
                <Text className="text-orange-600/70 text-[10px] font-bold">
                  CARDS
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="mt-3">
              <View className="flex-row justify-between mb-2">
                <Text className="text-white/50 text-xs font-semibold">
                  Album Progress
                </Text>
                <Text className="text-orange-600 text-xs font-bold">
                  {completionPercentage.toFixed(1)}%
                </Text>
              </View>
              <View className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <View
                  className="h-full bg-orange-600 rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                />
              </View>
              <Text className="text-white/40 text-[10px] font-semibold mt-1">
                {collectedCount} / {totalSlots} collected
              </Text>
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
              key={category}
              className="bg-white/[0.03] px-5 py-3 rounded-xl mr-3 border border-white/[0.08]"
            >
              <Text className="text-white text-sm font-bold">{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trading Cards Grid */}
        <View className="px-4">
          <Text className="text-white text-lg font-black mb-3">
            Your Collection Cards
          </Text>

          <View className="flex-row flex-wrap">
            {collection.map((item) => (
              <View key={item.id} className="w-1/2 p-2">
                <TouchableOpacity
                  className="bg-white/[0.03] rounded-2xl overflow-hidden border-2"
                  style={{ borderColor: getRarityColor(item.rarity) }}
                >
                  {/* Card Header with Rarity */}
                  <View
                    className="px-3 py-2"
                    style={{
                      backgroundColor: `${getRarityColor(item.rarity)}20`,
                    }}
                  >
                    <Text
                      className="text-xs font-black tracking-wide"
                      style={{ color: getRarityColor(item.rarity) }}
                    >
                      {item.rarity.toUpperCase()}
                      {item.isCustom && " (CUSTOM)"}
                    </Text>
                  </View>

                  {/* Card Image */}
                  <View className="aspect-square bg-white/[0.05] items-center justify-center">
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Text className="text-6xl">🍺</Text>
                    )}
                  </View>

                  {/* Card Info */}
                  <View className="p-3">
                    <Text className="text-white/50 text-[10px] font-bold tracking-wide mb-1">
                      {item.brand.toUpperCase()}
                    </Text>
                    <Text
                      className="text-white text-sm font-black"
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>
                    <View className="flex-row justify-between items-center mt-2">
                      <Text className="text-white/50 text-[11px] font-semibold">
                        {item.alcoholPercentage}% ABV
                      </Text>
                      <View className="bg-orange-600/20 px-2 py-1 rounded">
                        <Text className="text-orange-600 text-[10px] font-black">
                          +{item.pointsEarned}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}

            {/* Empty Card Slots */}
            {[...Array(6)].map((_, index) => (
              <View key={`empty-${index}`} className="w-1/2 p-2">
                <View className="bg-white/[0.03] rounded-2xl border border-dashed border-white/[0.08] aspect-square items-center justify-center">
                  <Text className="text-5xl opacity-20">🔒</Text>
                  <Text className="text-white/20 text-xs font-bold mt-2">
                    Empty Slot
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Stats Section */}
        <View className="px-4 mt-6">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-3">
              COLLECTION STATS
            </Text>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-white text-2xl font-black">
                  {collection.filter((i) => i.rarity === "legendary").length}
                </Text>
                <Text className="text-white/50 text-[10px] font-bold mt-1">
                  LEGENDARY
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-purple-500 text-2xl font-black">
                  {collection.filter((i) => i.rarity === "epic").length}
                </Text>
                <Text className="text-white/50 text-[10px] font-bold mt-1">
                  EPIC
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-blue-500 text-2xl font-black">
                  {collection.filter((i) => i.rarity === "rare").length}
                </Text>
                <Text className="text-white/50 text-[10px] font-bold mt-1">
                  RARE
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-gray-400 text-2xl font-black">
                  {collection.filter((i) => i.rarity === "common").length}
                </Text>
                <Text className="text-white/50 text-[10px] font-bold mt-1">
                  COMMON
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View
        className="absolute left-32 right-32 flex-row gap-3 mb-20"
        style={{ bottom: insets.bottom + 20 }}
      >
        <TouchableOpacity
          onPress={handleScanPress}
          className="flex-1 bg-orange-600 py-5 rounded-2xl items-center shadow-lg"
        >
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="barcode-scan"
              size={24}
              color="black"
            />{" "}
            <Text className="text-black text-sm font-black tracking-widest ml-2">
              SCAN
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
