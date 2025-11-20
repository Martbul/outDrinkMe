import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Header } from "@/components/header";
import { apiService } from "@/api";
import { useAuth } from "@clerk/clerk-expo";
import InfoTooltip from "@/components/infoTooltip";
import { AlcoholDbItem } from "@/types/api.types";
import { useApp } from "@/providers/AppProvider";
import { categories, totalSlots } from "@/utils/collection";
import { getRarityColor } from "@/utils/rarity";
import { usePostHog } from "posthog-react-native";

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
  const posthog = usePostHog();

  const { getToken } = useAuth();
  const { alcoholCollection, refreshUserAlcoholCollection } = useApp();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<"collection" | "manual">(
    "collection"
  );
  const [selectedFilter, setSelectedFilter] = useState<
    | "all"
    | "beer"
    | "whiskey"
    | "wine"
    | "vodka"
    | "gin"
    | "liqueur"
    | "rum"
    | "tequila"
    | "rakiya"
  >("all");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    posthog?.capture("collection_refreshed"); //? dublicate with the provider refresh???
    setRefreshing(true);
    await refreshUserAlcoholCollection();
    setRefreshing(false);
  };

  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    title: "",
    description: "",
    buttons: [],
  });

  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    refreshUserAlcoholCollection();
    // 4. Track Collection View (High level stats)
    // Since alcoholCollection might not be loaded yet, we depend on it
    if (alcoholCollection) {
      const totalItems = Object.values(alcoholCollection).flat().length;
      posthog?.capture("collection_viewed", {
        total_items_collected: totalItems,
        completion_percentage: (totalItems / totalSlots) * 100,
      });
    }
  }, []);

  const getFilteredCollection = (): AlcoholDbItem[] => {
    if (!alcoholCollection) return [];

    if (selectedFilter === "all") {
      return Object.values(alcoholCollection).flat() as AlcoholDbItem[];
    }

    return alcoholCollection[selectedFilter] || [];
  };

  const filteredCollection = getFilteredCollection();
  const collectedCount = alcoholCollection
    ? Object.values(alcoholCollection).flat().length
    : 0;
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

  const handleRemoveItem = async (item: AlcoholDbItem) => {
    const token = await getToken();
    if (!token) return;

    setLoading(true);
    try {
      // Call your API to remove the item
      await apiService.removeFromAlcoholCollection(item.id, token);
      await refreshUserAlcoholCollection();

      posthog?.capture("collection_item_removed", {
        item_name: item.name,
        item_type: item.type,
        item_rarity: item.rarity,
      });

      showModal(
        "Removed from Collection",
        `${item.name} has been removed from your collection.`,
        [
          {
            text: "OK",
            onPress: closeModal,
            style: "primary",
          },
        ]
      );
    } catch (error) {
      console.error("Error removing item:", error);
      showModal(
        "Error",
        "Something went wrong while removing the item. Please try again.",
        [
          {
            text: "OK",
            onPress: closeModal,
            style: "primary",
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLongPress = (item: AlcoholDbItem) => {
    showModal(
      "Remove from Collection?",
      `Are you sure you want to remove ${item.name} from your collection?\n\nType: ${item.type}\nRarity: ${item.rarity}\nABV: ${item.abv}%`,
      [
        {
          text: "Remove",
          onPress: () => {
            closeModal();
            handleRemoveItem(item);
          },
          style: "danger",
        },
        {
          text: "Cancel",
          onPress: closeModal,
          style: "secondary",
        },
      ]
    );
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
    setLoading(true);
    posthog?.capture("barcode_scan_attempted", { barcode: data });

    try {
      const productInfo = await fetchProductName(data);

      if (!productInfo.found) {
        posthog?.capture("barcode_lookup_failed", { barcode: data });

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

      const result = await apiService.searchDbAlcoholCollection(
        productInfo.name,
        token
      );

      if (!result) {
        posthog?.capture("barcode_found_but_missing_in_db", {
          product_name: productInfo.name,
        });
        showModal("Not Found", "This beverage is not in our database yet.", [
          {
            text: "Add Manually",
            onPress: () => {
              closeModal();
              setScanning(false);
              setCurrentScreen("manual");
              setFormData({ name: productInfo.name });
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
        ]);
        return;
      }

      const { item, isNewlyAdded } = result;

      if (isNewlyAdded) {
        await refreshUserAlcoholCollection();

        posthog?.capture("collection_item_added", {
          method: "scan",
          item_name: item.name,
          item_rarity: item.rarity,
          item_type: item.type,
        });

        showModal(
          "Added to Collection!",
          `${item.name} has been added to your collection!\n\nType: ${item.type}\nRarity: ${item.rarity}\nABV: ${item.abv}%`,
          [
            {
              text: "View Collection",
              onPress: () => {
                closeModal();
                setScanning(false);
                setScanned(false);
              },
              style: "primary",
            },
            {
              text: "Scan Another",
              onPress: () => {
                closeModal();
                setScanned(false);
              },
              style: "secondary",
            },
          ]
        );
      } else {
        posthog?.capture("collection_item_already_owned", {
          method: "scan",
          item_name: item.name,
        });
        showModal(
          "Already in Collection",
          `You already have ${item.name} in your collection!\n\nType: ${item.type}\nRarity: ${item.rarity}\nABV: ${item.abv}%`,
          [
            {
              text: "OK",
              onPress: () => {
                closeModal();
                setScanned(false);
                setScanning(false);
              },
              style: "secondary",
            },
            {
              text: "Scan Another",
              onPress: () => {
                closeModal();
                setScanned(false);
              },
              style: "primary",
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error scanning barcode:", error);
      showModal(
        "Error",
        "Something went wrong while processing the barcode. Please try again.",
        [
          {
            text: "Try Again",
            onPress: () => {
              closeModal();
              setScanned(false);
            },
            style: "primary",
          },
          {
            text: "Cancel",
            onPress: () => {
              closeModal();
              setScanning(false);
              setScanned(false);
            },
            style: "secondary",
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomBeverage = async () => {
    const token = await getToken();
    if (!token) return;

    if (!formData.name.trim()) {
      showModal("Missing Information", "Please fill in name of the alcohol.", [
        {
          text: "OK",
          onPress: closeModal,
          style: "primary",
        },
      ]);
      return;
    }

    setLoading(true);

    try {
      const result = await apiService.searchDbAlcoholCollection(
        formData.name.trim(),
        token
      );

      if (!result) {
        posthog?.capture("manual_add_not_found", {
          search_term: formData.name,
        });

        showModal("Not Found", "This beverage is not in our database yet.", [
          {
            text: "OK",
            onPress: closeModal,
            style: "secondary",
          },
        ]);
        return;
      }

      const { item, isNewlyAdded } = result;

      console.log("------------------------------------------------");
      console.log(item);
      console.log(isNewlyAdded);

      if (isNewlyAdded) {
        await refreshUserAlcoholCollection();
        posthog?.capture("collection_item_added", {
          method: "manual_search",
          item_name: item.name,
          item_rarity: item.rarity,
          item_type: item.type,
        });
        showModal(
          "Added to Collection!",
          `${item.name} has been added to your collection!\n\nType: ${item.type}\nRarity: ${item.rarity}\nABV: ${item.abv}%`,
          [
            {
              text: "View Collection",
              onPress: () => {
                closeModal();
                setCurrentScreen("collection");
                setFormData({ name: "" });
              },
              style: "primary",
            },
            {
              text: "Add Another",
              onPress: () => {
                closeModal();
                setFormData({ name: "" });
              },
              style: "secondary",
            },
          ]
        );
      } else {
        showModal(
          "Already in Collection",
          `You already have ${item.name} in your collection!\n\nType: ${item.type}\nRarity: ${item.rarity}\nABV: ${item.abv}%`,
          [
            {
              text: "View Collection",
              onPress: () => {
                closeModal();
                setCurrentScreen("collection");
                setFormData({ name: "" });
              },
              style: "primary",
            },
            {
              text: "Try Another",
              onPress: () => {
                closeModal();
                setFormData({ name: "" });
              },
              style: "secondary",
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error adding beverage:", error);
      showModal(
        "Error",
        "Something went wrong while adding the beverage. Please try again.",
        [
          {
            text: "Try Again",
            onPress: closeModal,
            style: "primary",
          },
          {
            text: "Cancel",
            onPress: () => {
              closeModal();
              setCurrentScreen("collection");
              setFormData({ name: "" });
            },
            style: "secondary",
          },
        ]
      );
    } finally {
      setLoading(false);
    }
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
    posthog?.capture("manual_form_barcode_filled", { barcode: data });

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
    posthog?.capture("scan_button_clicked");

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

  const getRarityCounts = () => {
    if (!alcoholCollection) {
      return { legendary: 0, epic: 0, rare: 0, common: 0 };
    }

    const allItems = Object.values(alcoholCollection).flat() as AlcoholDbItem[];
    console.log(allItems);
    return {
      legendary: allItems.filter((i) => i.rarity === "Legendary").length,
      epic: allItems.filter((i) => i.rarity === "Epic").length,
      rare: allItems.filter((i) => i.rarity === "Rare").length,
      common: allItems.filter((i) => i.rarity === "Common").length,
    };
  };

  const rarityCounts = getRarityCounts();

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
                ADD
              </Text>
              <Text className="text-white text-[28px] font-black">
                Alcohol Manually
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
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="black" />
                ) : (
                  <Text className="text-black text-base font-black tracking-widest">
                    ADD TO COLLECTION
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setCurrentScreen("collection")}
                className="bg-white/[0.03] py-4 rounded-xl items-center border border-white/[0.08]"
              >
                <Text className="text-white text-base font-black tracking-widest">
                  BACK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {modalState.visible && modalState.buttons && (
          <View
            className="absolute inset-0 bg-black/80 justify-center items-center px-4"
            style={{ zIndex: 9999 }}
          >
            <View className="bg-[#1a1a1a] rounded-2xl p-6 border-2 border-orange-600/30 w-full max-w-sm">
              <Text className="text-white text-xl font-black mb-2">
                {modalState.title}
              </Text>
              <Text className="text-white/70 text-sm leading-5 mb-6">
                {modalState.description}
              </Text>

              <View className="space-y-3 gap-3">
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

        {modalState.visible && modalState.buttons && (
          <View className="absolute inset-0 bg-black/80 justify-center items-center px-4">
            <View className="bg-[#1a1a1a] rounded-2xl p-6 border-2 border-orange-600/30 w-full max-w-sm">
              <Text className="text-white text-xl font-black mb-2">
                {modalState.title}
              </Text>
              <Text className="text-white/70 text-sm leading-5 mb-6">
                {modalState.description}
              </Text>

              <View className="space-y-3 gap-3">
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

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <Header />
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
        <View className="px-4 pt-1 pb-4">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
                  COLLECTION
                </Text>
                <Text className="text-white text-[28px] font-black">
                  Alcohols
                </Text>
              </View>

              <View className="flex-row items-center gap-3">
                <View className="bg-orange-600/20 px-4 py-2 rounded-xl">
                  <View className="flex items-center">
                    <Text className="text-orange-600 text-2xl font-black">
                      {collectedCount}
                    </Text>
                  </View>

                  <Text className="text-orange-600/70 text-[10px] font-bold">
                    BOTTLES
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleScanPress}
                  className="bg-orange-600 p-3 rounded-xl"
                >
                  <MaterialCommunityIcons
                    name="barcode-scan"
                    size={28}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View className="mt-3">
              <View className="flex-row justify-between mb-2">
                <Text className="text-white/50 text-xs font-semibold">
                  Progress
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mb-4"
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              onPress={() => setSelectedFilter(category.key as any)}
              className={`${
                selectedFilter === category.key
                  ? "bg-orange-600"
                  : "bg-white/[0.03]"
              } px-5 py-3 rounded-xl mr-3 border ${
                selectedFilter === category.key
                  ? "border-orange-600"
                  : "border-white/[0.08]"
              }`}
            >
              <Text
                className={`${
                  selectedFilter === category.key ? "text-black" : "text-white"
                } text-sm font-bold`}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="px-4">
          <Text className="text-white text-lg font-black mb-3">
            Your Collection
          </Text>

          {filteredCollection.length === 0 ? (
            <View className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center">
              <View className="w-24 h-24 rounded-2xl bg-orange-600/20 items-center justify-center mb-4">
                <MaterialCommunityIcons
                  name="bottle-tonic-skull"
                  size={64}
                  color="#EA580C"
                />
              </View>
              <Text className="text-white text-xl font-black mb-2">
                No items yet
              </Text>
              <Text className="text-white/50 text-sm text-center font-semibold px-4">
                Start drinking more & scan the alcohol to build your collection!
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap">
              {filteredCollection.map((item, index) => (
                <View key={index} className="w-1/2 p-2">
                  <TouchableOpacity
                    onLongPress={() => handleLongPress(item)}
                    delayLongPress={500}
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

                    <View className="aspect-square bg-white/[0.05] items-center justify-center ">
                      {item.image_url ? (
                        <Image
                          source={{ uri: item.image_url }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                          transition={200}
                          onError={(error) =>
                            console.log("Image load error:", error)
                          }
                          onLoad={() =>
                            console.log("Image loaded:", item.image_url)
                          }
                        />
                      ) : (
                        <FontAwesome5
                          name="wine-bottle"
                          size={24}
                          color="black"
                        />
                      )}
                    </View>

                    <View className="p-3">
                      <Text className="text-white/50 text-[10px] font-bold tracking-wide mb-1">
                        {item.type?.toUpperCase() || "BEVERAGE"}
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
            </View>
          )}
        </View>

        <View className="px-4 mt-6">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-3">
              ALL COLLECTION STATS
            </Text>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-yellow-600 text-2xl font-black">
                  {rarityCounts.legendary}
                </Text>
                <Text className="text-white/50 text-[10px] font-bold mt-1">
                  LEGENDARY
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-purple-800 text-2xl font-black">
                  {rarityCounts.epic}
                </Text>
                <Text className="text-white/50 text-[10px] font-bold mt-1">
                  EPIC
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-blue-800 text-2xl font-black">
                  {rarityCounts.rare}
                </Text>
                <Text className="text-white/50 text-[10px] font-bold mt-1">
                  RARE
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-gray-400 text-2xl font-black">
                  {rarityCounts.common}
                </Text>
                <Text className="text-white/50 text-[10px] font-bold mt-1">
                  COMMON
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal with buttons */}
      {modalState.visible &&
        modalState.buttons &&
        modalState.buttons.length > 0 && (
          <View
            className="absolute inset-0 bg-black/80 justify-center items-center px-4"
            style={{ zIndex: 9999 }}
          >
            <View className="bg-[#1a1a1a] rounded-2xl p-6 border-2 border-orange-600/30 w-full max-w-sm">
              <Text className="text-white text-xl font-black mb-2">
                {modalState.title}
              </Text>
              <Text className="text-white/70 text-sm leading-5 mb-6">
                {modalState.description}
              </Text>

              <View className="space-y-3 gap-3">
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

      {/* InfoTooltip for simple modals without buttons */}
      {modalState.visible &&
        (!modalState.buttons || modalState.buttons.length === 0) && (
          <InfoTooltip
            visible={modalState.visible}
            title={modalState.title}
            description={modalState.description}
            onClose={closeModal}
          />
        )}
    </View>
  );
}
