import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  TextInput,
  Dimensions,
  StatusBar,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  Feather,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import MapboxGL from "@rnmapbox/maps";
import { FlashList } from "@shopify/flash-list";

import Header from "@/components/header";
import DigitalPassport from "@/components/digital_passport";

const PRIMARY_ORANGE = "#EA580C";
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN_PUBLIC || "";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAP = 16;
const SCREEN_PADDING = 16;

const COLUMN_WIDTH = SCREEN_WIDTH - SCREEN_PADDING * 2;

if (MAPBOX_TOKEN) {
  MapboxGL.setAccessToken(MAPBOX_TOKEN);
}

// ============================================================================
// DATA TYPES
// ============================================================================

interface Bar {
  id: string;
  name: string;
  image_url: any;
  image_width: number;
  image_height: number;
  location: string;
  distance: number;
  distanceStr: string;
  rating: number;
  reviewCount: number;
  difficulty: "Cheap" | "Moderate" | "Expensive";
  time: string;
  description: string;
  coordinates: { lat: number; lng: number };
  tags: string[];
  discount: number;
}

const MOCK_BARS: Bar[] = [
  {
    id: "1",
    name: "Club Oblak",
    image_url: require("../../assets/images/oblk_club.jpg"),
    image_width: 1080,
    image_height: 1350, // Portrait
    location: "Bul. Tsar Osvoboditel 10, Sofia",
    distance: 0.1,
    distanceStr: "0.1 km",
    rating: 4.8,
    reviewCount: 320,
    difficulty: "Expensive",
    time: "Live DJ 10 PM",
    description:
      "Exclusive nightlife experience in the heart of Sofia. Premium cocktails and top-tier DJ sets.",
    // Coordinates near Tsar Osvoboditel 10
    coordinates: { lat: 42.6951828, lng: 23.3289099 },
    tags: ["cocktails", "happy_hour"],
    discount: 10,
  },
  {
    id: "2",
    name: "Keva Bar",
    // Bohemian/Garden vibe image
    image_url:
      "https://images.unsplash.com/photo-1576014131795-d440191a8e8b?q=80&w=800",
    image_width: 800,
    image_height: 600, // Landscape
    location: "Rakovski St 114, Sofia",
    distance: 0.8,
    distanceStr: "0.8 km",
    rating: 4.6,
    reviewCount: 540,
    difficulty: "Moderate",
    time: "Garden Open",
    description:
      "A hidden gem in the theater academy courtyard. Known for its relaxed bohemian atmosphere and lush greenery.",
    // Coordinates for Rakovski 114
    coordinates: { lat: 42.6936, lng: 23.3283 },
    tags: ["dog_friendly", "happy_hour"],
    discount: 15,
  },
  {
    id: "3",
    name: "Bar Petuk",
    // Busy night/street vibe image
    image_url:
      "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=800",
    image_width: 800,
    image_height: 1200, // Tall Portrait
    location: "Gen. Gurko 21, Sofia",
    distance: 1.2,
    distanceStr: "1.2 km",
    rating: 4.7,
    reviewCount: 1200,
    difficulty: "Moderate",
    time: "Always Friday",
    description:
      "The legendary 'Bar Friday' where the party never stops. Crowded, loud, and full of energy.",
    // Coordinates for Gurko 21
    coordinates: { lat: 42.6922, lng: 23.3265 },
    tags: ["cocktails", "dog_friendly"],
    discount: 25,
  },
];

// ============================================================================
// HELPERS
// ============================================================================

const getImageSource = (img: any) => {
  return typeof img === "string" ? { uri: img } : img;
};

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

// 1. DetailModal
interface DetailModalProps {
  visible: boolean;
  onClose: () => void;
  coverImage?: any;
  children: React.ReactNode;
}

const DetailModal = ({
  visible,
  onClose,
  coverImage,
  children,
}: DetailModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black relative">
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-4 left-4 z-50 w-10 h-10 bg-black/60 backdrop-blur-md rounded-full items-center justify-center border border-white/10"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={true}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {coverImage && (
            <View className="h-72 w-full relative">
              <Image
                source={getImageSource(coverImage)}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
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
          )}

          <View className={coverImage ? "px-5 -mt-4" : "px-5 pt-20"}>
            {children}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

// 2. DYNAMIC GLANCE CARD
const DynamicGlanceCard = ({
  item,
  onPress,
}: {
  item: Bar;
  onPress: () => void;
}) => {
  const rawHeight = COLUMN_WIDTH * (item.image_height / item.image_width);
  const cardHeight = Math.min(rawHeight, 500);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="bg-[#121212] rounded-3xl overflow-hidden border border-white/[0.08]"
    >
      <View
        style={{ width: "100%", height: cardHeight }}
        className="relative bg-gray-900"
      >
        <Image
          source={getImageSource(item.image_url)}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={200}
        />

        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.6)"]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "60%",
          }}
        />

        <TouchableOpacity className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full items-center justify-center border border-white/10">
          <Feather name="bookmark" size={16} color="white" />
        </TouchableOpacity>

        <View className="absolute bottom-3 right-3 bg-orange-600 rounded-xl px-3 py-1.5 shadow-lg shadow-orange-600/40 items-center justify-center border border-orange-400/50">
          <Text className="text-black font-black text-sm">
            -{item.discount}%
          </Text>
        </View>
      </View>

      <View className="p-4">
        <View className="flex-row justify-between items-start mb-1">
          <Text
            className="text-white font-black text-xl leading-6 flex-1 mr-2"
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <View className="flex-row items-center bg-white/[0.05] px-2 py-1 rounded border border-white/[0.05]">
            <Ionicons name="star" size={12} color={PRIMARY_ORANGE} />
            <Text className="text-xs font-bold text-white ml-1">
              {item.rating}
            </Text>
          </View>
        </View>

        <Text className="text-white/50 text-xs font-bold uppercase tracking-wide mb-3">
          {item.location}
        </Text>

        <View className="flex-row items-center flex-wrap gap-2">
          <View className="bg-white/[0.05] px-2 py-1 rounded border border-white/[0.05]">
            <Text className="text-[10px] font-bold text-white/70">
              {item.difficulty}
            </Text>
          </View>
          <Text className="text-white/20 text-[10px]">•</Text>
          <Text className="text-xs font-bold text-orange-600">{item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// 3. PremiumLock
const PremiumLock = ({ isLocked, onUnlock, isProcessing, children }: any) => (
  <View className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#121212]">
    <View
      style={isLocked ? { opacity: 0.2, filter: "blur(10px)" } : { opacity: 1 }}
      pointerEvents={isLocked ? "none" : "auto"}
    >
      {children}
    </View>
    {isLocked && (
      <View className="absolute inset-0 items-center justify-center bg-black/40 z-20">
        <View className="w-16 h-16 bg-[#1A1A1A] rounded-full items-center justify-center shadow-lg border border-orange-600/50 mb-4">
          <MaterialCommunityIcons
            name="lock"
            size={32}
            color={PRIMARY_ORANGE}
          />
        </View>
        <Text className="text-xl font-black text-white mb-2">
          Member Only Code
        </Text>
        <Text className="text-white/60 text-center px-8 mb-6 leading-5">
          Unlock unlimited discounts and track your points.
        </Text>
        <TouchableOpacity
          onPress={onUnlock}
          disabled={isProcessing}
          className="bg-orange-600 px-8 py-4 rounded-full shadow-lg shadow-orange-600/20 flex-row items-center"
        >
          {isProcessing ? (
            <ActivityIndicator color="black" />
          ) : (
            <>
              <Text className="text-black font-black text-base mr-2 uppercase tracking-wide">
                Unlock for $4.99
              </Text>
              <Ionicons name="arrow-forward" color="black" size={18} />
            </>
          )}
        </TouchableOpacity>
      </View>
    )}
  </View>
);

// 4. FilterPills
const FilterPills = ({ items, selected, onSelect }: any) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    className="mb-2 overflow-visible pb-2"
  >
    {items.map((item: any) => (
      <TouchableOpacity
        key={item.id}
        onPress={() => onSelect(item.id)}
        className={`flex-row items-center border rounded-full px-4 py-2 mr-2 ${
          selected === item.id
            ? "bg-orange-600 border-orange-600"
            : "bg-white/[0.03] border-white/[0.08]"
        }`}
      >
        {item.icon}
        <Text
          className={`font-bold ml-2 text-sm ${
            selected === item.id ? "text-black" : "text-white"
          }`}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// ============================================================================
// MAPBOX MAP COMPONENT
// ============================================================================

const BarHuntMap = ({
  bars,
  onSelectBar,
}: {
  bars: Bar[];
  onSelectBar: (bar: Bar) => void;
}) => {
  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const cameraSettings = useMemo(() => {
    if (bars.length > 0) {
      let minLat = 90,
        maxLat = -90,
        minLng = 180,
        maxLng = -180;
      bars.forEach((b) => {
        if (b.coordinates.lat < minLat) minLat = b.coordinates.lat;
        if (b.coordinates.lat > maxLat) maxLat = b.coordinates.lat;
        if (b.coordinates.lng < minLng) minLng = b.coordinates.lng;
        if (b.coordinates.lng > maxLng) maxLng = b.coordinates.lng;
      });
      const PADDING = 0.02;
      return {
        bounds: {
          ne: [maxLng + PADDING, maxLat + PADDING],
          sw: [minLng - PADDING, minLat - PADDING],
          paddingTop: 50,
          paddingBottom: 50,
          paddingLeft: 20,
          paddingRight: 20,
        },
      };
    }
    // Default to Sofia Center
    return { center: [23.3219, 42.6977], zoom: 12 };
  }, [bars]);

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <MapboxGL.MapView
        ref={mapRef}
        style={{ flex: 1 }}
        styleURL={MapboxGL.StyleURL.Dark}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          bounds={cameraSettings.bounds}
          centerCoordinate={cameraSettings.center}
          zoomLevel={cameraSettings.zoom}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {bars.map((bar) => (
          <MapboxGL.PointAnnotation
            key={bar.id}
            id={bar.id}
            coordinate={[bar.coordinates.lng, bar.coordinates.lat]}
            onSelected={() => onSelectBar(bar)}
          >
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#1E1E1E",
                  borderWidth: 2,
                  borderColor: PRIMARY_ORANGE,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.5,
                  shadowRadius: 4,
                }}
              >
                <Image
                  source={getImageSource(bar.image_url)}
                  style={{ width: 34, height: 34, borderRadius: 17 }}
                />
              </View>
              <View
                style={{
                  width: 0,
                  height: 0,
                  borderLeftWidth: 6,
                  borderRightWidth: 6,
                  borderTopWidth: 8,
                  borderStyle: "solid",
                  backgroundColor: "transparent",
                  borderLeftColor: "transparent",
                  borderRightColor: "transparent",
                  borderTopColor: PRIMARY_ORANGE,
                  marginTop: -1,
                }}
              />
            </View>
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>
    </View>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function BarHuntScreen() {
  const insets = useSafeAreaInsets();

  // State
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  const [filterId, setFilterId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMapMode, setIsMapMode] = useState(false);

  // Passport Modal State
  const [showPassport, setShowPassport] = useState(false);

  // Premium State
  const [isPremium, setIsPremium] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter Logic
  const filteredBars = useMemo(() => {
    return MOCK_BARS.filter((bar) => {
      // 1. Text Search
      if (
        searchQuery &&
        !bar.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // 2. Category Filter
      if (filterId === "nearby") return bar.distance < 1.0;
      if (filterId === "happy_hour") return bar.tags.includes("happy_hour");
      if (filterId === "dog_friendly") return bar.tags.includes("dog_friendly");

      return true; // "all"
    });
  }, [filterId, searchQuery]);

  const handleUnlock = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(() => resolve(true), 1500));
    setIsPremium(true);
    setIsProcessing(false);
    Alert.alert("Premium Unlocked!", "You can now scan QR codes.");
  };

  return (
    <View className="flex-1 bg-black relative">
      <StatusBar barStyle="light-content" />
      <Header />

      <View className="flex-1" style={{ paddingTop: insets.top }}>
        {/* --- HEADER + CONTROLS --- */}
        <View className="px-4 py-2 z-10 bg-black pb-4">
          {/* SEARCH + PASSPORT BUTTON */}
          <View className="flex-row items-center space-x-3 mb-4">
            <View className="flex-1 flex-row items-center bg-[#1A1A1A] border border-white/10 rounded-full px-4 h-12">
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Find bars..."
                placeholderTextColor="#666"
                className="flex-1 ml-3 text-base font-bold text-white"
              />
            </View>

            {/* Passport Button */}
            <TouchableOpacity
              onPress={() => setShowPassport(true)}
              className="w-12 h-12 rounded-full bg-orange-600 items-center justify-center shadow-lg shadow-orange-600/30 border border-white/10"
            >
              <MaterialCommunityIcons
                name="card-account-details-star"
                size={24}
                color="black"
              />
            </TouchableOpacity>
          </View>

          <FilterPills
            selected={filterId}
            onSelect={setFilterId}
            items={[
              {
                id: "all",
                label: "All",
                icon: (
                  <MaterialCommunityIcons
                    name="glass-cocktail"
                    size={16}
                    color={filterId === "all" ? "black" : "white"}
                  />
                ),
              },
              {
                id: "nearby",
                label: "Nearby",
                icon: (
                  <MaterialCommunityIcons
                    name="map-marker-radius-outline"
                    size={18}
                    color={filterId === "nearby" ? "black" : "white"}
                  />
                ),
              },
              {
                id: "happy_hour",
                label: "Happy Hour",
                icon: (
                  <Ionicons
                    name="beer-outline"
                    size={18}
                    color={filterId === "happy_hour" ? "black" : "white"}
                  />
                ),
              },
              {
                id: "dog_friendly",
                label: "Dog-friendly",
                icon: (
                  <FontAwesome5
                    name="dog"
                    size={14}
                    color={filterId === "dog_friendly" ? "black" : "white"}
                  />
                ),
              },
            ]}
          />
        </View>

        {/* --- MAIN CONTENT (List vs Map) --- */}
        <View className="flex-1 relative">
          {isMapMode ? (
            // MAP VIEW
            <BarHuntMap bars={filteredBars} onSelectBar={setSelectedBar} />
          ) : (
            // LIST VIEW (1 Column FlashList)
            <FlashList
              data={filteredBars}
              numColumns={1}
              renderItem={({ item }) => (
                <View style={{ marginBottom: GAP }}>
                  <DynamicGlanceCard
                    item={item}
                    onPress={() => setSelectedBar(item)}
                  />
                </View>
              )}
              contentContainerStyle={{
                paddingHorizontal: SCREEN_PADDING,
                paddingBottom: 100,
              }}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* FLOATING TOGGLE BUTTON */}
          <View className="absolute bottom-6 self-center z-20">
            <TouchableOpacity
              onPress={() => setIsMapMode(!isMapMode)}
              activeOpacity={0.8}
              className="flex-row items-center bg-orange-600 px-6 py-4 rounded-full shadow-lg shadow-orange-600/40"
            >
              <Feather
                name={isMapMode ? "list" : "map"}
                size={18}
                color="black"
              />
              <Text className="text-black font-black ml-2 tracking-wide">
                {isMapMode ? "LIST VIEW" : "MAP VIEW"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Mock Bottom Tab Bar */}
      <View className="flex-row justify-around items-center bg-black pt-3 pb-8 border-t border-white/[0.08]">
        <View className="items-center">
          <View className="w-12 h-8 items-center justify-center">
            <Ionicons name="search" size={24} color={PRIMARY_ORANGE} />
          </View>
          <Text className="text-[10px] text-orange-600 font-bold mt-1">
            Explore
          </Text>
        </View>
        <View className="items-center opacity-40">
          <MaterialCommunityIcons
            name="account-group-outline"
            size={26}
            color="white"
          />
          <Text className="text-[10px] text-white font-medium mt-1">
            Community
          </Text>
        </View>
        <View className="items-center opacity-40">
          <Feather name="navigation" size={24} color="white" />
          <Text className="text-[10px] text-white font-medium mt-1">
            Navigate
          </Text>
        </View>
        <View className="items-center opacity-40">
          <Feather name="bookmark" size={24} color="white" />
          <Text className="text-[10px] text-white font-medium mt-1">Saved</Text>
        </View>
        <View className="items-center opacity-40">
          <Feather name="user" size={24} color="white" />
          <Text className="text-[10px] text-white font-medium mt-1">
            Profile
          </Text>
        </View>
      </View>

      {/* BAR DETAIL MODAL */}
      <DetailModal
        visible={!!selectedBar}
        onClose={() => setSelectedBar(null)}
        coverImage={selectedBar?.image_url}
      >
        {selectedBar && (
          <>
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-3xl font-black text-white flex-1">
                {selectedBar.name}
              </Text>
              <View className="bg-white/[0.08] px-2 py-1 rounded flex-row items-center border border-white/10">
                <Ionicons name="star" size={14} color={PRIMARY_ORANGE} />
                <Text className="ml-1 font-bold text-white">
                  {selectedBar.rating}
                </Text>
              </View>
            </View>

            <Text className="text-white/50 mb-6 font-bold tracking-wide text-xs">
              {selectedBar.location} • {selectedBar.difficulty} •{" "}
              {selectedBar.distanceStr}
            </Text>

            <View className="flex-row gap-3 mb-8 border-b border-white/[0.08] pb-8">
              <TouchableOpacity className="flex-1 bg-orange-600 py-4 rounded-xl items-center shadow-lg shadow-orange-600/20">
                <Text className="text-black font-black tracking-widest">
                  DIRECTIONS
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-white/[0.05] border border-white/[0.1] py-4 rounded-xl items-center">
                <Text className="text-white font-black tracking-widest">
                  MENU
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="text-white text-lg font-black mb-2">
              Description
            </Text>
            <Text className="text-white/60 leading-6 mb-8">
              {selectedBar.description}
            </Text>

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-lg font-black">
                Member Discount QR
              </Text>
              <View className="bg-orange-600/20 px-2 py-1 rounded border border-orange-600/50">
                <Text className="text-orange-500 text-[10px] font-bold">
                  -{selectedBar.discount}% OFF
                </Text>
              </View>
            </View>

            <PremiumLock
              isLocked={!isPremium}
              onUnlock={handleUnlock}
              isProcessing={isProcessing}
            >
              <View className="items-center justify-center w-full aspect-square p-8">
                <View className="w-full h-full bg-white rounded-xl p-3 border-4 border-white">
                  <View className="flex-1 bg-white p-2 flex-row flex-wrap">
                    {[...Array(100)].map((_, i) => (
                      <View
                        key={i}
                        className={`w-[10%] h-[10%] ${
                          Math.random() > 0.45 ? "bg-black" : "bg-white"
                        }`}
                      />
                    ))}
                    <View className="absolute top-2 left-2 w-16 h-16 border-4 border-black bg-white flex items-center justify-center">
                      <View className="w-8 h-8 bg-black" />
                    </View>
                    <View className="absolute top-2 right-2 w-16 h-16 border-4 border-black bg-white flex items-center justify-center">
                      <View className="w-8 h-8 bg-black" />
                    </View>
                    <View className="absolute bottom-2 left-2 w-16 h-16 border-4 border-black bg-white flex items-center justify-center">
                      <View className="w-8 h-8 bg-black" />
                    </View>
                  </View>
                </View>
                <Text className="text-center font-mono font-bold mt-4 tracking-widest text-lg text-white">
                  MEMBER-8821
                </Text>
              </View>
            </PremiumLock>
          </>
        )}
      </DetailModal>

      {/* PASSPORT MODAL */}
      <Modal visible={showPassport} transparent animationType="slide">
        <View className="flex-1 bg-black/95 items-center justify-center p-4">
          <TouchableOpacity
            onPress={() => setShowPassport(false)}
            className="absolute top-12 left-6 z-50 w-10 h-10 bg-white/10 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View>
            <Text className="text-orange-600 text-center text-xs font-black tracking-[4px] mb-2 uppercase">
              Official Member
            </Text>
            <Text className="text-white text-center text-3xl font-black mb-8">
              DRINKING PASSPORT
            </Text>

            <DigitalPassport />

            <Text className="text-white/40 text-center text-xs mt-8 px-10">
              Scan this ID at partner venues to collect points and redeem
              discounts.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
