import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Header } from "@/components/header";
import { apiService } from "@/api";
import { useAuth } from "@clerk/clerk-expo";
import InfoTooltip from "@/components/infoTooltip";

interface ScanedAlcohol {
  name: string;
}

interface BeverageItem {
  id: string;
  name: string;
  image_url: string | null;
  abv: number;
  type: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  company: string;
}

interface CustomBeverage {
  name: string;
}

interface ModalState {
  visible: boolean;
  title: string;
  description: string;
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: "primary" | "secondary" | "danger";
  }>;
}

export default function Collection() {
  const { getToken } = useAuth();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<"collection" | "manual">(
    "collection"
  );
  const [customBeverages, setCustomBeverages] = useState<CustomBeverage[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<
    | "All"
    | "Beer"
    | "Whiskey"
    | "Wine"
    | "Vodka"
    | "Gin"
    | "Liqueur"
    | "Rum"
    | "Tequila"
  >("All");

  // Modal state
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    title: "",
    description: "",
    buttons: [],
  });

  const [collection, setCollection] = useState<BeverageItem[]>([
    {
      id: "1",
      name: "Heineken Lager",
      company: "Heineken",
      image_url:
        "https://www.heineken.com/media/y0ve1jpq/hnk-original-bottle.png",
      abv: 5.0,
      type: "Beer",
      rarity: "common",
    },
    {
      id: "2",
      name: "Jack Daniel's No. 7",
      company: "Jack Daniel's",
      image_url:
        "https://vida.bg/wp-content/uploads/2022/03/Jack-Daniels-Old-Number-7-1L-1000x1000-1.png",
      abv: 40,
      type: "Whiskey",
      rarity: "epic",
    },
  ]);

  const [formData, setFormData] = useState({ name: "" });

  const categories = [
    "Beer",
    "Whiskey",
    "Wine",
    "Vodka",
    "Gin",
    "Liqueur",
    "Rum",
    "Tequila",
  ];
  const totalSlots = 2547;
  const collectedCount = collection.length;
  const completionPercentage = (collectedCount / totalSlots) * 100;

  const showModal = (
    title: string,
    description: string,
    buttons: ModalState["buttons"] = []
  ) => {
    setModalState({
      visible: true,
      title,
      description,
      buttons,
    });
  };

  const closeModal = () => {
    setModalState({
      visible: false,
      title: "",
      description: "",
      buttons: [],
    });
  };

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

  const fetchProductName = async (barcode: string) => {
    try {
      setLoading(true);

      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();

      if (data.status === 1 && data.product.product_name) {
        const product = data.product;
        return {
          found: true,
          name: product.product_name,
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
    const token = await getToken();
    if (!token) return;
    setScanned(true);

    const productInfo = await fetchProductName(data);

    if (!productInfo.found) {
      showModal(
        "Product Not Found",
        `Barcode: ${data}\n\nThis product is not in our database.`,
        [
          {
            text: "Add Manually",
            onPress: () => {
              closeModal();
              setScanning(false);
              setCurrentScreen("manual");
              setFormData({ ...formData });
            },
            style: "primary",
          },
          {
            text: "Cancel",
            onPress: () => {
              closeModal();
              setScanned(false);
            },
            style: "secondary",
          },
        ]
      );
      return;
    }

    const alcoholItem = await apiService.searchDbAlcoholCollection(
      productInfo.name,
      token
    );

    console.log(alcoholItem);
  };

  const handleAddToCollection = async (productInfo: any) => {
    const newItem: ScanedAlcohol = {
      name: productInfo.name,
    };

    setCollection((prev) => [newItem, ...prev]);
    setScanned(false);
    setScanning(false);

    showModal("Success! 🎉", `${newItem.name}`, [
      {
        text: "Done",
        onPress: closeModal,
        style: "primary",
      },
    ]);
  };

  const handleAddCustomBeverage = () => {
    if (!formData.name) {
      showModal(
        "Missing Information",
        "Please fill in name of the alcohol.",
        [
          {
            text: "OK",
            onPress: closeModal,
            style: "primary",
          },
        ]
      );
      return;
    }

    const newCustomBeverage: CustomBeverage = {
      name: formData.name,
    };

    setCustomBeverages((prev) => [...prev, newCustomBeverage]);
  };

  const handleScanForManual = async () => {
    const permissionResult = await requestPermission();
    if (!permissionResult?.granted) {
      showModal(
        "Permission Needed",
        "Camera permission is required to scan barcodes",
        [
          {
            text: "OK",
            onPress: closeModal,
            style: "primary",
          },
        ]
      );
      return;
    }

    setScanning(true);
    setScanned(false);
  };

  const handleManualBarcodeScan = ({ data }: { data: string }) => {
    setFormData({ ...formData });
    setScanning(false);
    setScanned(false);
    showModal("Barcode Scanned", `Barcode: ${data}`, [
      {
        text: "OK",
        onPress: closeModal,
        style: "primary",
      },
    ]);
  };

  const handleScanPress = async () => {
    const permissionResult = await requestPermission();
    if (!permissionResult?.granted) {
      showModal(
        "Permission Needed",
        "Camera permission is required to scan barcodes",
        [
          {
            text: "Grant Permission",
            onPress: () => {
              closeModal();
              requestPermission();
            },
            style: "primary",
          },
          {
            text: "Cancel",
            onPress: closeModal,
            style: "secondary",
          },
        ]
      );
      return;
    }
    setScanning(true);
    setScanned(false);
  };

  const getButtonStyle = (style?: string) => {
    switch (style) {
      case "primary":
        return "bg-orange-600";
      case "secondary":
        return "bg-white/[0.03] border border-white/[0.08]";
      case "danger":
        return "bg-red-600";
      default:
        return "bg-orange-600";
    }
  };

  const getButtonTextStyle = (style?: string) => {
    switch (style) {
      case "primary":
        return "text-black";
      case "secondary":
        return "text-white";
      case "danger":
        return "text-white";
      default:
        return "text-black";
    }
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
                <TouchableOpacity
                  onPress={handleScanForManual}
                  className="bg-orange-600 px-5 py-3 rounded-xl"
                >
                  <Text className="text-black font-black">SCAN</Text>
                </TouchableOpacity>
              </View>

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
          </View>
        </ScrollView>
        <InfoTooltip
          visible={modalState.visible}
          title={modalState.title}
          description={modalState.description}
          onClose={closeModal}
        />
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
            <View className="w-80 h-40 border-2 border-orange-600 rounded-lg" />
            <Text className="mt-5 text-white text-base font-semibold bg-black/50 px-4 py-2 rounded-lg">
              {currentScreen === "manual"
                ? "Scan barcode for manual entry"
                : "Point camera at barcode"}
            </Text>
          </View>

          <View className="absolute bottom-28 left-4 right-4">
            <TouchableOpacity
              onPress={() => {
                setScanning(false);
                setScanned(false);
              }}
              className="bg-white/10 py-4 rounded-2xl items-center border border-white/50 mx-12"
            >
              <Text className="text-orange-600 text-base font-black tracking-widest">
                CANCEL
              </Text>
            </TouchableOpacity>
          </View>
        </CameraView>

        {/* Custom Modal for Scanner */}
        {modalState.visible && modalState.buttons && (
          <View className="absolute inset-0 bg-black/80 justify-center items-center px-4">
            <View className="bg-[#1a1a1a] rounded-2xl p-6 border-2 border-orange-600/30 w-full max-w-sm">
              <Text className="text-white text-xl font-black mb-2">
                {modalState.title}
              </Text>
              <Text className="text-white/70 text-sm leading-5 mb-6">
                {modalState.description}
              </Text>

              <View className="space-y-3">
                {modalState.buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={button.onPress}
                    className={`${getButtonStyle(button.style)} py-4 rounded-xl items-center`}
                  >
                    <Text
                      className={`${getButtonTextStyle(button.style)} text-base font-black tracking-widest`}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
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
                    </Text>
                  </View>

                  <View className="aspect-square bg-white/[0.05] items-center justify-center">
                    {item.image_url ? (
                      <Image
                        source={{ uri: item.image_url }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Text className="text-6xl">🍺</Text>
                    )}
                  </View>

                  <View className="p-3">
                    <Text className="text-white/50 text-[10px] font-bold tracking-wide mb-1">
                      {item.company.toUpperCase()}
                    </Text>
                    <Text
                      className="text-white text-sm font-black"
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>
                    <View className="flex-row justify-between items-center mt-2">
                      <Text className="text-white/50 text-[11px] font-semibold">
                        {item.abv}% ABV
                      </Text>
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
            />
            <Text className="text-black text-sm font-black tracking-widest ml-2">
              SCAN
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Modal for main screen */}
      <InfoTooltip
        visible={modalState.visible}
        title={modalState.title}
        description={modalState.description}
        onClose={closeModal}
      />
    </View>
  );
}