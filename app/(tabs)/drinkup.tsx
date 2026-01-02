import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  TextInput,
  Dimensions,
  StatusBar,
  Animated,
  PanResponder,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import MapboxGL from "@rnmapbox/maps";
import { FlashList } from "@shopify/flash-list";

import Header from "@/components/header";
import DigitalPassport from "@/components/digital_passport";
import { PaywallModal } from "@/components/paywall_modal";

const PRIMARY_ORANGE = "#EA580C";
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN_PUBLIC || "";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAP = 16;
const SCREEN_PADDING = 16;
const COLUMN_WIDTH = SCREEN_WIDTH - SCREEN_PADDING * 2;

if (MAPBOX_TOKEN) {
  MapboxGL.setAccessToken(MAPBOX_TOKEN);
}

// --- INTERFACES ---
interface Cocktail {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
}

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
  specials: Cocktail[];
}

const MOCK_BARS: Bar[] = [
  {
    id: "1",
    name: "Club Oblak",
    image_url: require("../../assets/images/oblk_club.jpg"),
    image_width: 1080,
    image_height: 1350,
    location: "Bul. Tsar Osvoboditel 10, Sofia",
    distance: 0.1,
    distanceStr: "0.1 km",
    rating: 4.8,
    reviewCount: 320,
    difficulty: "Expensive",
    time: "Live DJ 10 PM",
    description:
      "Exclusive nightlife experience in the heart of Sofia. Premium cocktails and top-tier DJ sets.",
    coordinates: { lat: 42.6951828, lng: 23.3289099 },
    tags: ["cocktails", "happy_hour"],
    discount: 10,
    specials: [
      {
        id: "c1",
        name: "Midnight Mist",
        price: "$14.00",
        description: "Gin, Violet liqueur, Lemon, Maraschino",
        image:
          "https://images.unsplash.com/photo-1514362545857-3bc16549766b?w=400&q=80",
      },
      {
        id: "c2",
        name: "Neon Sour",
        price: "$12.50",
        description: "Whiskey, Lemon, Egg white, Blue Curaçao syrup",
        image:
          "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80",
      },
    ],
  },
  {
    id: "2",
    name: "Keva Bar",
    image_url: require("../../assets/images/keva_bar.jpg"),
    image_width: 800,
    image_height: 600,
    location: "Rakovski St 114, Sofia",
    distance: 0.8,
    distanceStr: "0.8 km",
    rating: 4.6,
    reviewCount: 540,
    difficulty: "Moderate",
    time: "Garden Open",
    description:
      "A hidden gem in the theater academy courtyard. Known for its relaxed bohemian atmosphere and lush greenery.",
    coordinates: { lat: 42.6936, lng: 23.3283 },
    tags: ["dog_friendly", "happy_hour"],
    discount: 15,
    specials: [
      {
        id: "c3",
        name: "Garden Spritz",
        price: "$9.00",
        description: "Prosecco, Elderflower, Mint, Lime",
        image:
          "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80",
      },
      {
        id: "c4",
        name: "Bohemian Rhapsody",
        price: "$11.00",
        description: "Rum, Pineapple, Coconut cream, Nutmeg",
        image:
          "https://images.unsplash.com/photo-1599021406450-4d5716df1bd6?w=400&q=80",
      },
    ],
  },
  {
    id: "3",
    name: "Bar Petuk",
    image_url:
      "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=800",
    image_width: 800,
    image_height: 1200,
    location: "Gen. Gurko 21, Sofia",
    distance: 1.2,
    distanceStr: "1.2 km",
    rating: 4.7,
    reviewCount: 1200,
    difficulty: "Moderate",
    time: "Always Friday",
    description:
      "The legendary 'Bar Friday' where the party never stops. Crowded, loud, and full of energy.",
    coordinates: { lat: 42.6922, lng: 23.3265 },
    tags: ["cocktails", "dog_friendly"],
    discount: 25,
    specials: [
      {
        id: "c5",
        name: "Friday Punch",
        price: "$10.00",
        description: "Secret house blend of rums and tropical juices",
        image:
          "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&q=80",
      },
    ],
  },
];

const getImageSource = (img: any) => {
  return typeof img === "string" ? { uri: img } : img;
};

// --- COMPONENTS ---

interface SwipeableSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const SwipeableSheet = ({
  visible,
  onClose,
  children,
}: SwipeableSheetProps) => {
  // Use React Native Animated for gestures
  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 0,
      onPanResponderGrant: () => {
        panY.setOffset(0);
        panY.setValue(0);
      },
      onPanResponderMove: Animated.event([null, { dy: panY }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        panY.flattenOffset();
        if (gestureState.dy > 120) {
          onClose();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      panY.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        <Animated.View
          style={{ flex: 1, transform: [{ translateY: panY }] }}
          {...panResponder.panHandlers}
        >
          <View className="absolute top-2 left-0 right-0 z-50 items-center justify-center">
            <View className="w-12 h-1.5 bg-white/30 rounded-full" />
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 left-4 z-[60] w-10 h-10 bg-black/60 backdrop-blur-md rounded-full items-center justify-center border border-white/10"
          >
            <Ionicons name="chevron-down" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1 pt-16">{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
};

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
      </View>
    </TouchableOpacity>
  );
};

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
                Unlock
              </Text>
              <Ionicons name="arrow-forward" color="black" size={18} />
            </>
          )}
        </TouchableOpacity>
      </View>
    )}
  </View>
);

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
    return { center: [-74.006, 40.7128], zoom: 12 };
  }, [bars]);

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <MapboxGL.MapView
        ref={mapRef}
        style={{ flex: 1 }}
        styleURL={MapboxGL.StyleURL.Dark}
        logoEnabled={false}
        scaleBarEnabled={false}
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

export default function BarHuntScreen() {
  const insets = useSafeAreaInsets();
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  const [filterId, setFilterId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMapMode, setIsMapMode] = useState(false);
  const [detailTab, setDetailTab] = useState<"overview" | "specials">(
    "overview"
  );
  const [showPassport, setShowPassport] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (selectedBar) {
      setDetailTab("overview");
    }
  }, [selectedBar]);

  const filteredBars = useMemo(() => {
    return MOCK_BARS.filter((bar) => {
      if (
        searchQuery &&
        !bar.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (filterId === "nearby") return bar.distance < 1.0;
      if (filterId === "happy_hour") return bar.tags.includes("happy_hour");
      return true;
    });
  }, [filterId, searchQuery]);

  const handleUnlockPress = () => {
    setShowPaywall(true);
  };

  const handlePurchase = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsPremium(true);
      setIsProcessing(false);
      setShowPaywall(false);
      Alert.alert("Welcome to Pro!", "You have unlocked all features.");
    }, 2000);
  };

  return (
    <View className="flex-1 bg-black relative">
      <StatusBar barStyle="light-content" />
      <Header />

      <View className="flex-1" style={{ paddingTop: insets.top }}>
        <View className="px-4 pt-2 z-10 bg-black">
          <View className="flex-row items-center space-x-3 mb-4 gap-2">
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
            ]}
          />
        </View>

        <View className="flex-1 relative">
          {isMapMode ? (
            <BarHuntMap bars={filteredBars} onSelectBar={setSelectedBar} />
          ) : (
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

          <View className="absolute bottom-6 self-center z-20">
            <TouchableOpacity
              onPress={() => setIsMapMode(!isMapMode)}
              activeOpacity={0.8}
              className="flex-row items-center bg-orange-600 px-6 py-4 rounded-full shadow-lg shadow-orange-600/40"
            >
              <Feather
                name={isMapMode ? "grid" : "map"}
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
          <Ionicons name="search" size={24} color={PRIMARY_ORANGE} />
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
      </View>

      {/* --- DETAIL MODAL --- */}
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

            {/* TAB SWITCHER */}
            <View className="flex-row gap-3 mb-8 border-b border-white/[0.08] pb-6">
              <TouchableOpacity
                onPress={() => setDetailTab("overview")}
                className={`flex-1 py-4 rounded-xl items-center border ${
                  detailTab === "overview"
                    ? "bg-orange-600 border-orange-600 shadow-lg shadow-orange-600/20"
                    : "bg-white/[0.05] border-white/[0.1]"
                }`}
              >
                <Text
                  className={`${
                    detailTab === "overview" ? "text-black" : "text-white"
                  } font-black tracking-widest`}
                >
                  OVERVIEW
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setDetailTab("specials")}
                className={`flex-1 py-4 rounded-xl items-center border ${
                  detailTab === "specials"
                    ? "bg-orange-600 border-orange-600 shadow-lg shadow-orange-600/20"
                    : "bg-white/[0.05] border-white/[0.1]"
                }`}
              >
                <Text
                  className={`${
                    detailTab === "specials" ? "text-black" : "text-white"
                  } font-black tracking-widest`}
                >
                  SPECIALS
                </Text>
              </TouchableOpacity>
            </View>

            {/* TAB CONTENT (Safe View usage) */}
            {detailTab === "overview" ? (
              <View>
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
                  onUnlock={handleUnlockPress}
                  isProcessing={false}
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
                      </View>
                    </View>
                    <Text className="text-center font-mono font-bold mt-4 tracking-widest text-lg text-white">
                      MEMBER-8821
                    </Text>
                  </View>
                </PremiumLock>
              </View>
            ) : (
              <View>
                <Text className="text-white text-lg font-black mb-4">
                  Signature Cocktails
                </Text>
                {selectedBar.specials && selectedBar.specials.length > 0 ? (
                  selectedBar.specials.map((special) => (
                    <View
                      key={special.id}
                      className="bg-[#1A1A1A] rounded-2xl p-3 mb-4 flex-row items-center border border-white/[0.08]"
                    >
                      <Image
                        source={{ uri: special.image }}
                        style={{ width: 80, height: 80, borderRadius: 12 }}
                        contentFit="cover"
                      />
                      <View className="flex-1 ml-4 justify-center">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="text-white font-bold text-lg flex-1 mr-2">
                            {special.name}
                          </Text>
                          <Text className="text-orange-500 font-black text-lg">
                            {special.price}
                          </Text>
                        </View>
                        <Text className="text-white/40 text-xs leading-4">
                          {special.description}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text className="text-white/30 text-center py-10">
                    No specials listed currently.
                  </Text>
                )}
              </View>
            )}
          </>
        )}
      </DetailModal>

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchase={handlePurchase}
      />

      <SwipeableSheet
        visible={showPassport}
        onClose={() => setShowPassport(false)}
        children={
          <View className="items-center py-6">
            <View className="items-center mb-8">
              <Text className="text-orange-600 text-center text-[10px] font-black tracking-[4px] mb-2 uppercase">
                Official Member
              </Text>
              <Text className="text-white text-center text-3xl font-black">
                DRINKING PASSPORT
              </Text>
            </View>
            <DigitalPassport />
            <Text className="text-white/40 text-center text-xs mt-8 px-10 leading-5">
              Scan this ID at partner venues to collect points and redeem
              discounts.
            </Text>
          </View>
        }
      />
    </View>
  );
}
