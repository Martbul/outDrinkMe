
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";

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

export default function DNAHelixCollection() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [collection, setCollection] = useState<BeverageItem[]>([]);
  const [points, setPoints] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Pulse animation for DNA nodes
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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
      alert("Already collected this beverage!");
      setScanned(false);
      return;
    }

    const productInfo = await fetchProductInfo(data);

    if (!productInfo.found) {
      alert("Product not found in database");
      setScanned(false);
      setScanning(false);
      return;
    }

    const newItem: BeverageItem = {
      id: Date.now().toString(),
      barcode: data,
      name: productInfo.name,
      brand: productInfo.brand,
      image: productInfo.image,
      alcoholPercentage: productInfo.alcoholPercentage,
      timestamp: new Date().toLocaleString(),
      pointsEarned: 10,
    };

    setCollection((prev) => [newItem, ...prev]);
    setPoints((prev) => prev + 10);
    setScanned(false);
    setScanning(false);
  };

  const handleScanPress = async () => {
    const permissionResult = await requestPermission();
    if (!permissionResult.granted) {
      alert("Camera permission is required");
      return;
    }
    setScanning(true);
    setScanned(false);
  };

  if (!permission) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#00d4ff" />
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
              <ActivityIndicator size="large" color="#00d4ff" />
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

  const progressPercentage = (collection.length / 2547) * 100;

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <View className="px-4 pb-4">
        <View className="bg-white/[0.03] rounded-2xl p-5 border border-[#00d4ff]/30">
          <Text className="text-[#00d4ff] text-[11px] font-bold tracking-widest mb-2">
            YOUR DRINK DNA
          </Text>
          <Text className="text-white text-[32px] font-black mb-1">
            Beverage Timeline
          </Text>
          <Text className="text-white/50 text-sm font-semibold">
            Every drink tells your story
          </Text>
        </View>
      </View>

      {/* Sticky Progress Bar */}

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 mb-4">
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-[#00d4ff]/30">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white/50 text-sm font-bold tracking-wide">
                Collection Progress
              </Text>
              <Text className="text-[#00d4ff] text-xl font-black">
                {collection.length} / 2,547
              </Text>
            </View>
            <View className="h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
              <View
                className="h-full bg-gradient-to-r from-[#00d4ff] to-[#7b2ff7] rounded-full"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </View>
            <Text className="text-white/40 text-xs font-semibold mt-2">
              {progressPercentage.toFixed(1)}% Complete
            </Text>
          </View>
        </View>
        {/* DNA Timeline */}
        {collection.length === 0 ? (
          <View className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center mb-4">
            <View className="w-24 h-24 rounded-2xl bg-[#00d4ff]/20 items-center justify-center mb-4">
              <Text className="text-5xl">🧬</Text>
            </View>
            <Text className="text-white text-xl font-black mb-2">
              Start Your Journey
            </Text>
            <Text className="text-white/50 text-sm text-center font-semibold">
              Scan your first beverage to begin building your drinking DNA
              timeline
            </Text>
          </View>
        ) : (
          <View className="relative">
            {/* DNA Strand Line */}
            <View className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#00d4ff]/30 via-[#00d4ff]/50 to-transparent -ml-px" />

            {collection.map((item, index) => {
              const isLeft = index % 2 === 0;
              return (
                <View key={item.id} className="mb-12 relative">
                  {/* DNA Node */}
                  <View className="absolute left-1/2 -ml-2.5 z-10">
                    <Animated.View
                      style={{
                        transform: [{ scale: pulseAnim }],
                      }}
                    >
                      <View className="w-5 h-5 bg-[#00d4ff] rounded-full shadow-lg shadow-[#00d4ff]/50" />
                    </Animated.View>
                  </View>

                  {/* Card */}
                  <View
                    className={`${isLeft ? "pr-8" : "pl-8"} ${
                      isLeft ? "items-start" : "items-end"
                    }`}
                    style={{
                      width: "50%",
                      alignSelf: isLeft ? "flex-start" : "flex-end",
                    }}
                  >
                    <TouchableOpacity
                      className="bg-[#00d4ff]/[0.05] border border-[#00d4ff]/30 rounded-2xl p-4 w-full"
                      activeOpacity={0.7}
                    >
                      {item.image && (
                        <Image
                          source={{ uri: item.image }}
                          className="w-full h-32 rounded-xl mb-3"
                          resizeMode="cover"
                        />
                      )}
                      <View className="flex-row items-center mb-1">
                        <Text className="text-4xl mr-2">
                          {item.image ? "🍺" : "🥃"}
                        </Text>
                        <View className="flex-1">
                          <Text className="text-white text-base font-black">
                            {item.name}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-white/70 text-sm font-semibold mb-2">
                        {item.brand}
                      </Text>
                      <Text className="text-white/50 text-xs font-semibold mb-2">
                        {item.alcoholPercentage !== "N/A"
                          ? `${item.alcoholPercentage}% ABV`
                          : "Alcohol %: N/A"}
                      </Text>
                      <View className="flex-row justify-between items-center pt-2 border-t border-white/[0.05]">
                        <Text className="text-[#00d4ff] text-xs font-semibold">
                          ⏱ {item.timestamp.split(",")[0]}
                        </Text>
                        <Text className="text-[#00d4ff] text-xs font-black">
                          +{item.pointsEarned} pts
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Info Card */}
        <View className="bg-[#00d4ff]/[0.05] rounded-2xl p-5 mb-4 border border-[#00d4ff]/30">
          <Text className="text-white text-sm text-center font-semibold opacity-80">
            🧬 Your drinking DNA is being sequenced...
          </Text>
          <Text className="text-white/50 text-xs text-center font-semibold mt-2">
            Keep collecting to unlock your taste profile
          </Text>
        </View>
      </ScrollView>

      {/* Floating Scan Button */}
      <View
        className="absolute left-4 right-4"
        style={{ bottom: insets.bottom + 20 }}
      >
        <TouchableOpacity
          onPress={handleScanPress}
          className="bg-gradient-to-r from-[#00d4ff] to-[#7b2ff7] py-5 rounded-2xl items-center shadow-lg"
          style={{
            shadowColor: "#00d4ff",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <View className="flex-row items-center">
            <Feather name="camera" size={24} color="#000" />
            <Text className="text-black text-base font-black tracking-widest ml-2">
              SCAN BEVERAGE
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
// import { useState } from "react";
// import {
//   Text,
//   View,
//   StyleSheet,
//   Button,
//   Alert,
//   FlatList,
//   Image,
//   ActivityIndicator,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import { CameraView, useCameraPermissions } from "expo-camera";

// export default function BeverageCollector() {
//   const [permission, requestPermission] = useCameraPermissions();
//   const [scanned, setScanned] = useState(false);
//   const [scanning, setScanning] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [collection, setCollection] = useState([]);
//   const [points, setPoints] = useState(0);
//   const [currentScreen, setCurrentScreen] = useState("collection"); // 'collection' or 'manual'
//   const [customBeverages, setCustomBeverages] = useState([]); // Local database

//   // Form state for adding custom beverages
//   const [formData, setFormData] = useState({
//     barcode: "",
//     name: "",
//     brand: "",
//     alcoholPercentage: "",
//     imageUrl: "",
//   });

//   const fetchProductInfo = async (barcode) => {
//     try {
//       setLoading(true);

//       // First check custom database
//       const customProduct = customBeverages.find(
//         (item) => item.barcode === barcode
//       );
//       if (customProduct) {
//         return {
//           found: true,
//           name: customProduct.name,
//           brand: customProduct.brand,
//           image: customProduct.imageUrl || null,
//           category: "Custom Entry",
//           alcoholPercentage: customProduct.alcoholPercentage,
//           isCustom: true,
//         };
//       }

//       // If not in custom DB, check Open Food Facts API
//       const response = await fetch(
//         `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
//       );
//       const data = await response.json();

//       if (data.status === 1 && data.product) {
//         const product = data.product;
//         return {
//           found: true,
//           name: product.product_name || "Unknown Product",
//           brand: product.brands || "Unknown Brand",
//           image: product.image_url || null,
//           category: product.categories || "Beverage",
//           alcoholPercentage: product.alcohol_volume || "N/A",
//           isCustom: false,
//         };
//       } else {
//         return { found: false };
//       }
//     } catch (error) {
//       console.error("Error fetching product:", error);
//       return { found: false };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBarCodeScanned = async ({ type, data }) => {
//     setScanned(true);

//     // Check if already collected
//     const alreadyCollected = collection.some((item) => item.barcode === data);

//     if (alreadyCollected) {
//       Alert.alert(
//         "Already Collected!",
//         "You've already scanned this beverage.",
//         [{ text: "OK", onPress: () => setScanned(false) }]
//       );
//       return;
//     }

//     // Fetch product information
//     const productInfo = await fetchProductInfo(data);

//     if (!productInfo.found) {
//       Alert.alert(
//         "Product Not Found",
//         `Barcode: ${data}\n\nThis product is not in our database.`,
//         [
//           {
//             text: "Add Manually",
//             onPress: () => {
//               setScanning(false);
//               setCurrentScreen("manual");
//               setFormData({ ...formData, barcode: data });
//             },
//           },
//           {
//             text: "Collect Anyway",
//             onPress: () => addToCollection(data, type, null),
//           },
//           {
//             text: "Cancel",
//             onPress: () => setScanned(false),
//           },
//         ]
//       );
//       return;
//     }

//     // Add to collection with product info
//     addToCollection(data, type, productInfo);
//   };

//   const addToCollection = (barcode, type, productInfo) => {
//     const newItem = {
//       id: Date.now().toString(),
//       barcode: barcode,
//       type: type,
//       timestamp: new Date().toLocaleString(),
//       pointsEarned: 10,
//       name: productInfo?.name || "Unknown Product",
//       brand: productInfo?.brand || "Unknown Brand",
//       image: productInfo?.image || null,
//       category: productInfo?.category || "Beverage",
//       alcoholPercentage: productInfo?.alcoholPercentage || "N/A",
//       isCustom: productInfo?.isCustom || false,
//     };

//     setCollection((prev) => [newItem, ...prev]);
//     setPoints((prev) => prev + 10);

//     Alert.alert(
//       "Success! 🎉",
//       `${newItem.brand}\n${newItem.name}\n\n+10 points collected!`,
//       [
//         {
//           text: "Scan Another",
//           onPress: () => setScanned(false),
//         },
//         {
//           text: "Done",
//           onPress: () => setScanning(false),
//         },
//       ]
//     );
//   };

//   const handleAddCustomBeverage = () => {
//     if (!formData.barcode || !formData.name || !formData.brand) {
//       Alert.alert(
//         "Missing Information",
//         "Please fill in barcode, name, and brand at minimum."
//       );
//       return;
//     }

//     // Check if barcode already exists in custom DB
//     const exists = customBeverages.some(
//       (item) => item.barcode === formData.barcode
//     );
//     if (exists) {
//       Alert.alert(
//         "Duplicate",
//         "This barcode already exists in your custom database."
//       );
//       return;
//     }

//     // Add to custom database
//     const newCustomBeverage = {
//       id: Date.now().toString(),
//       barcode: formData.barcode,
//       name: formData.name,
//       brand: formData.brand,
//       alcoholPercentage: formData.alcoholPercentage || "N/A",
//       imageUrl: formData.imageUrl || null,
//     };

//     setCustomBeverages((prev) => [...prev, newCustomBeverage]);

//     Alert.alert(
//       "Added Successfully!",
//       `${formData.brand} - ${formData.name} has been added to your custom database.`,
//       [
//         {
//           text: "Add Another",
//           onPress: () =>
//             setFormData({
//               barcode: "",
//               name: "",
//               brand: "",
//               alcoholPercentage: "",
//               imageUrl: "",
//             }),
//         },
//         {
//           text: "Go to Collection",
//           onPress: () => {
//             setFormData({
//               barcode: "",
//               name: "",
//               brand: "",
//               alcoholPercentage: "",
//               imageUrl: "",
//             });
//             setCurrentScreen("collection");
//           },
//         },
//       ]
//     );
//   };

//   const handleScanForManual = async () => {
//     const permissionResult = await requestPermission();
//     if (!permissionResult.granted) {
//       Alert.alert(
//         "Permission needed",
//         "Camera permission is required to scan barcodes"
//       );
//       return;
//     }

//     setScanning(true);
//     setScanned(false);
//   };

//   const handleManualBarcodeScan = ({ type, data }) => {
//     setFormData({ ...formData, barcode: data });
//     setScanning(false);
//     setScanned(false);
//     Alert.alert("Barcode Scanned", `Barcode: ${data}`);
//   };

//   if (!permission) {
//     return (
//       <View style={styles.container}>
//         <Text>Requesting camera permission...</Text>
//       </View>
//     );
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.text}>No access to camera</Text>
//         <Button title="Grant Permission" onPress={requestPermission} />
//       </View>
//     );
//   }

//   // Manual Entry Screen
//   if (currentScreen === "manual" && !scanning) {
//     return (
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <Text style={styles.title}>Add Custom Beverage</Text>
//           <Text style={styles.subtitle}>Build your own database</Text>
//         </View>

//         <ScrollView style={styles.content}>
//           <View style={styles.formContainer}>
//             <Text style={styles.label}>Barcode *</Text>
//             <View style={styles.barcodeInputContainer}>
//               <TextInput
//                 style={[styles.input, { flex: 1 }]}
//                 placeholder="Enter barcode number"
//                 value={formData.barcode}
//                 onChangeText={(text) =>
//                   setFormData({ ...formData, barcode: text })
//                 }
//                 keyboardType="numeric"
//               />
//               <TouchableOpacity
//                 style={styles.scanButton}
//                 onPress={handleScanForManual}
//               >
//                 <Text style={styles.scanButtonText}>Scan</Text>
//               </TouchableOpacity>
//             </View>

//             <Text style={styles.label}>Brand Name *</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="e.g., Heineken, Jack Daniel's"
//               value={formData.brand}
//               onChangeText={(text) => setFormData({ ...formData, brand: text })}
//             />

//             <Text style={styles.label}>Product Name *</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="e.g., Lager Beer, Tennessee Whiskey"
//               value={formData.name}
//               onChangeText={(text) => setFormData({ ...formData, name: text })}
//             />

//             <Text style={styles.label}>Alcohol Percentage (ABV)</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="e.g., 5.0, 40"
//               value={formData.alcoholPercentage}
//               onChangeText={(text) =>
//                 setFormData({ ...formData, alcoholPercentage: text })
//               }
//               keyboardType="decimal-pad"
//             />

//             <Text style={styles.label}>Image URL (optional)</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="https://example.com/image.jpg"
//               value={formData.imageUrl}
//               onChangeText={(text) =>
//                 setFormData({ ...formData, imageUrl: text })
//               }
//               autoCapitalize="none"
//             />

//             <TouchableOpacity
//               style={styles.addButton}
//               onPress={handleAddCustomBeverage}
//             >
//               <Text style={styles.addButtonText}>Add to Database</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.secondaryButton}
//               onPress={() => setCurrentScreen("collection")}
//             >
//               <Text style={styles.secondaryButtonText}>Back to Collection</Text>
//             </TouchableOpacity>

//             <View style={styles.customDbSection}>
//               <Text style={styles.sectionTitle}>
//                 Custom Database ({customBeverages.length} beverages)
//               </Text>
//               {customBeverages.length === 0 ? (
//                 <Text style={styles.emptyText}>No custom beverages yet</Text>
//               ) : (
//                 customBeverages.map((item) => (
//                   <View key={item.id} style={styles.customItem}>
//                     <Text style={styles.customItemBrand}>{item.brand}</Text>
//                     <Text style={styles.customItemName}>{item.name}</Text>
//                     <Text style={styles.customItemBarcode}>
//                       Barcode: {item.barcode}
//                     </Text>
//                   </View>
//                 ))
//               )}
//             </View>
//           </View>
//         </ScrollView>
//       </View>
//     );
//   }

//   // Scanner Screen (for both collection scanning and manual entry scanning)
//   if (scanning) {
//     return (
//       <View style={styles.container}>
//         <CameraView
//           style={styles.camera}
//           facing="back"
//           barcodeScannerSettings={{
//             barcodeTypes: [
//               "aztec",
//               "ean13",
//               "ean8",
//               "qr",
//               "pdf417",
//               "upc_e",
//               "datamatrix",
//               "code39",
//               "code93",
//               "itf14",
//               "codabar",
//               "code128",
//               "upc_a",
//             ],
//           }}
//           onBarcodeScanned={
//             scanned
//               ? undefined
//               : currentScreen === "manual"
//                 ? handleManualBarcodeScan
//                 : handleBarCodeScanned
//           }
//         >
//           {loading && (
//             <View style={styles.loadingOverlay}>
//               <ActivityIndicator size="large" color="#fff" />
//               <Text style={styles.loadingText}>Looking up product...</Text>
//             </View>
//           )}
//           <View style={styles.scannerOverlay}>
//             <View style={styles.scanArea} />
//             <Text style={styles.scanInstruction}>
//               {currentScreen === "manual"
//                 ? "Scan barcode for manual entry"
//                 : "Point camera at barcode"}
//             </Text>
//           </View>
//           <View style={styles.buttonContainer}>
//             <Button
//               title="Cancel"
//               onPress={() => {
//                 setScanning(false);
//                 setScanned(false);
//               }}
//             />
//           </View>
//         </CameraView>
//       </View>
//     );
//   }

//   // Collection Screen (default)
//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Beverage Collector</Text>
//         <Text style={styles.points}>Points: {points}</Text>
//         <Text style={styles.collectionCount}>
//           Collection: {collection.length} beverages
//         </Text>
//       </View>

//       <View style={styles.content}>
//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={[styles.mainButton, { marginRight: 10 }]}
//             onPress={() => {
//               setScanning(true);
//               setScanned(false);
//             }}
//           >
//             <Text style={styles.mainButtonText}>Scan Barcode</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.mainButton, styles.secondaryMainButton]}
//             onPress={() => setCurrentScreen("manual")}
//           >
//             <Text style={styles.mainButtonText}>Add Manual</Text>
//           </TouchableOpacity>
//         </View>

//         <Text style={styles.listTitle}>Your Collection:</Text>
//         {collection.length === 0 ? (
//           <Text style={styles.emptyText}>
//             No beverages collected yet. Start scanning!
//           </Text>
//         ) : (
//           <FlatList
//             data={collection}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <View style={styles.collectionItem}>
//                 <View style={styles.itemContent}>
//                   {item.image && (
//                     <Image
//                       source={{ uri: item.image }}
//                       style={styles.productImage}
//                     />
//                   )}
//                   <View style={styles.itemDetails}>
//                     <Text style={styles.itemBrand}>
//                       {item.brand}
//                       {item.isCustom && (
//                         <Text style={styles.customBadge}> (Custom)</Text>
//                       )}
//                     </Text>
//                     <Text style={styles.itemName}>{item.name}</Text>
//                     <Text style={styles.itemInfo}>
//                       {item.alcoholPercentage !== "N/A"
//                         ? `${item.alcoholPercentage}% ABV`
//                         : "Alcohol %: N/A"}
//                     </Text>
//                     <Text style={styles.itemTime}>{item.timestamp}</Text>
//                     <Text style={styles.itemPoints}>
//                       +{item.pointsEarned} points
//                     </Text>
//                   </View>
//                 </View>
//               </View>
//             )}
//           />
//         )}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   camera: {
//     flex: 1,
//   },
//   header: {
//     padding: 20,
//     backgroundColor: "#6200ee",
//     alignItems: "center",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#fff",
//     marginTop: 20,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: "#e0d0ff",
//     marginTop: 5,
//   },
//   points: {
//     fontSize: 32,
//     fontWeight: "bold",
//     color: "#ffd700",
//     marginTop: 10,
//   },
//   collectionCount: {
//     fontSize: 16,
//     color: "#fff",
//     marginTop: 5,
//   },
//   content: {
//     flex: 1,
//     padding: 20,
//   },
//   buttonRow: {
//     flexDirection: "row",
//     marginBottom: 20,
//   },
//   mainButton: {
//     flex: 1,
//     backgroundColor: "#6200ee",
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   secondaryMainButton: {
//     backgroundColor: "#03dac6",
//   },
//   mainButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   loadingOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0,0,0,0.7)",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 10,
//   },
//   loadingText: {
//     color: "#fff",
//     marginTop: 10,
//     fontSize: 16,
//   },
//   scannerOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   scanArea: {
//     width: 250,
//     height: 250,
//     borderWidth: 2,
//     borderColor: "#fff",
//     backgroundColor: "transparent",
//   },
//   scanInstruction: {
//     marginTop: 20,
//     color: "#fff",
//     fontSize: 16,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     padding: 10,
//     borderRadius: 5,
//   },
//   buttonContainer: {
//     position: "absolute",
//     bottom: 40,
//     left: 20,
//     right: 20,
//   },
//   listTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   emptyText: {
//     textAlign: "center",
//     color: "#666",
//     marginTop: 20,
//     fontSize: 16,
//   },
//   collectionItem: {
//     backgroundColor: "#f5f5f5",
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   itemContent: {
//     flexDirection: "row",
//   },
//   productImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 8,
//     marginRight: 15,
//   },
//   itemDetails: {
//     flex: 1,
//     justifyContent: "center",
//   },
//   itemBrand: {
//     fontSize: 14,
//     color: "#6200ee",
//     fontWeight: "bold",
//     textTransform: "uppercase",
//   },
//   customBadge: {
//     fontSize: 12,
//     color: "#03dac6",
//   },
//   itemName: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginTop: 2,
//   },
//   itemInfo: {
//     fontSize: 12,
//     color: "#666",
//     marginTop: 4,
//   },
//   itemTime: {
//     fontSize: 12,
//     color: "#999",
//     marginTop: 4,
//   },
//   itemPoints: {
//     fontSize: 14,
//     color: "#6200ee",
//     fontWeight: "bold",
//     marginTop: 5,
//   },
//   text: {
//     fontSize: 16,
//     marginBottom: 10,
//   },
//   formContainer: {
//     padding: 5,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//     marginTop: 15,
//     marginBottom: 5,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     backgroundColor: "#fff",
//   },
//   barcodeInputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   scanButton: {
//     backgroundColor: "#6200ee",
//     padding: 12,
//     borderRadius: 8,
//     marginLeft: 10,
//   },
//   scanButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   addButton: {
//     backgroundColor: "#6200ee",
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 25,
//   },
//   addButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   secondaryButton: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 10,
//     borderWidth: 1,
//     borderColor: "#6200ee",
//   },
//   secondaryButtonText: {
//     color: "#6200ee",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   customDbSection: {
//     marginTop: 30,
//     paddingTop: 20,
//     borderTopWidth: 1,
//     borderTopColor: "#ddd",
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 15,
//   },
//   customItem: {
//     backgroundColor: "#f5f5f5",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   customItemBrand: {
//     fontSize: 14,
//     color: "#03dac6",
//     fontWeight: "bold",
//     textTransform: "uppercase",
//   },
//   customItemName: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginTop: 2,
//   },
//   customItemBarcode: {
//     fontSize: 12,
//     color: "#666",
//     marginTop: 4,
//   },
// });
