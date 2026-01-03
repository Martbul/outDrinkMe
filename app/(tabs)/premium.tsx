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
  StyleSheet,
  TouchableWithoutFeedback,
  ImageSourcePropType,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import MapboxGL from "@rnmapbox/maps";
import { FlashList } from "@shopify/flash-list";

import Header from "@/components/header";
import DigitalPassport from "@/components/digital_passport";
import { SegmentItem, TabSwitcher } from "@/components/tab_switcher";
import { PaywallModal } from "@/components/paywall_modal";
import { useApp } from "@/providers/AppProvider";
import { Venue, VenueSpecial } from "@/types/api.types";

const PRIMARY_ORANGE = "#EA580C";
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN_PUBLIC || "";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAP = 16;
const SCREEN_PADDING = 16;
const COLUMN_WIDTH = SCREEN_WIDTH - SCREEN_PADDING * 2;

if (MAPBOX_TOKEN) {
  MapboxGL.setAccessToken(MAPBOX_TOKEN);
}

const getImageSource = (img: any) => {
  return typeof img === "string" ? { uri: img } : img;
};

interface SwipeableSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const SwipeableSheet = ({ visible, onClose, children }: SwipeableSheetProps) => {
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
  }, [visible, panY]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        <Animated.View style={{ flex: 1, transform: [{ translateY: panY }] }} {...panResponder.panHandlers}>
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
  coverImage?: string | ImageSourcePropType;
  children: React.ReactNode;
  fullScreen?: boolean;
}

const DetailModal = ({ visible, onClose, coverImage, children, fullScreen = true }: DetailModalProps) => {
  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) panY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          onClose();
          setTimeout(() => panY.setValue(0), 200);
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={fullScreen ? "pageSheet" : "overFullScreen"}
      transparent={!fullScreen}
      onRequestClose={onClose}
    >
      <View className={fullScreen ? "flex-1 bg-black" : "flex-1 bg-black/60 justify-end"}>
        {!fullScreen && (
          <TouchableWithoutFeedback onPress={onClose}>
            <View className="absolute inset-0" />
          </TouchableWithoutFeedback>
        )}

        <Animated.View
          style={[
            { transform: [{ translateY: panY }] },
            !fullScreen && {
              height: "85%",
              backgroundColor: "black",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              overflow: "hidden",
            },
            fullScreen && { flex: 1 },
          ]}
          {...panResponder.panHandlers}
        >
          <View className="absolute top-2 left-0 right-0 items-center z-50">
            <View className="w-12 h-1.5 bg-white/30 rounded-full" />
          </View>

          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 left-4 z-50 w-10 h-10 bg-black/60 backdrop-blur-md rounded-full items-center justify-center border border-white/10"
          >
            <Ionicons name="chevron-down" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-1 w-full">
            {coverImage && (
              <View className="h-72 w-full relative shrink-0">
                <Image
                  source={typeof coverImage === "string" ? { uri: coverImage } : coverImage}
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

            <View className={`flex-1 ${coverImage ? "px-5 -mt-4" : "px-5 pt-16"}`}>{children}</View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const DynamicGlanceCard = ({ item, onPress }: { item: Venue; onPress: () => void }) => {
  const rawHeight = COLUMN_WIDTH * (item.image_height / item.image_width);
  const cardHeight = Math.min(rawHeight, 500);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="bg-[#121212] rounded-3xl overflow-hidden border border-white/[0.08]"
    >
      <View style={{ width: "100%", height: cardHeight }} className="relative bg-gray-900">
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
          <Text className="text-black font-black text-sm">-{item.discount_percentage}%</Text>
        </View>
      </View>

      <View className="p-4">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-white font-black text-xl leading-6 flex-1 mr-2" numberOfLines={2}>
            {item.name}
          </Text>
        </View>
        <Text className="text-white/50 text-xs font-bold uppercase tracking-wide mb-3">
          {item.location} • {item.venue_type}
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
        <View className="w-24 h-24 bg-[#1A1A1A] rounded-full items-center justify-center shadow-lg border border-orange-600/50 mb-4">
          <MaterialCommunityIcons name="card-account-details-star" size={54} color={PRIMARY_ORANGE} />
        </View>
        <Text className="text-xl font-black text-white mb-2">Premium Code</Text>
        <Text className="text-white/60 text-center px-8 mb-6 leading-5">
          Unlock unlimited discounts to all locations
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
              <Text className="text-black font-black text-base mr-2 uppercase tracking-wide">Unlock</Text>
              <Ionicons name="arrow-forward" color="black" size={18} />
            </>
          )}
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const FilterPills = ({ items, selected, onSelect }: any) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2 overflow-visible pb-2">
    {items.map((item: any) => (
      <TouchableOpacity
        key={item.id}
        onPress={() => onSelect(item.id)}
        className={`flex-row items-center border rounded-full px-4 py-2 mr-2 ${
          selected === item.id ? "bg-orange-600 border-orange-600" : "bg-white/[0.03] border-white/[0.08]"
        }`}
      >
        {item.icon}
        <Text className={`font-bold ml-2 text-sm ${selected === item.id ? "text-black" : "text-white"}`}>
          {item.label}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const BarHuntMap = ({ bars, onSelectBar }: { bars: Venue[]; onSelectBar: (bar: Venue) => void }) => {
  const [selectedBarMarker, setSelectedBarMarker] = useState<any | null>(null);
  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const isInteractive = true;
  const [currentZoom, setCurrentZoom] = useState<number>(12);

  const cameraSettings = useMemo(() => {
    if (bars.length > 0) {
      let minLat = 90,
        maxLat = -90,
        minLng = 180,
        maxLng = -180;
      bars.forEach((b) => {
        if (b.latitude < minLat) minLat = b.latitude;
        if (b.latitude > maxLat) maxLat = b.latitude;
        if (b.longitude < minLng) minLng = b.longitude;
        if (b.longitude > maxLng) maxLng = b.longitude;
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

  const handleMarkerSelect = (bar: Venue) => {
    setSelectedBarMarker(bar);
    onSelectBar(bar);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <MapboxGL.MapView
        ref={mapRef}
        style={{ flex: 1 }}
        styleURL={MapboxGL.StyleURL.Dark}
        logoEnabled={false}
        scaleBarEnabled={false}
        attributionEnabled={false}
        onCameraChanged={(state) => setCurrentZoom(state.properties.zoom)}
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
          <BarMarker
            key={bar.id}
            bar={bar}
            isSelected={selectedBarMarker?.id === bar.id}
            isInteractive={isInteractive}
            onSelect={handleMarkerSelect}
            zoomLevel={currentZoom}
          />
        ))}
      </MapboxGL.MapView>
    </View>
  );
};


const BarMarker = React.memo(
  ({
    bar,
    isSelected,
    isInteractive,
    onSelect,
    zoomLevel,
  }: {
    bar: Venue;
    isSelected: boolean;
    isInteractive: boolean;
    onSelect: (bar: Venue) => void;
    zoomLevel: number;
  }) => {
    const annotationRef = useRef<MapboxGL.PointAnnotation>(null);
    const [markerImageLoading, setMarkerImageLoading] = useState(true);

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [isPressed, setIsPressed] = useState(false);

    const handleMarkerImageLoad = () => {
      setMarkerImageLoading(false);
      setTimeout(() => {
        annotationRef.current?.refresh();
      }, 100);
    };

    const scale = Math.min(Math.max(zoomLevel / 16, 0.9), 1.5);

    const pinImageSource = getImageSource(bar.image_url);

    return (
      <MapboxGL.PointAnnotation
        ref={annotationRef}
        id={bar.id}
        coordinate={[bar.longitude, bar.latitude]}
        anchor={{ x: 0.5, y: 1 }}
        onSelected={() => isInteractive && onSelect(bar)}
        style={{ zIndex: isSelected || isPressed ? 100 : 1 }}      >
        <View style={[styles.markerContainer, { transform: [{ scale }] }]}>
          <View style={[styles.pinShadow]}>
            <View style={[styles.pinHead]}>
              <Image
                source={pinImageSource}
                style={styles.markerImage}
                contentFit="cover"
                onLoad={handleMarkerImageLoad}
              />
            </View>
            <View style={[styles.pinPoint]} />
          </View>
        </View>
      </MapboxGL.PointAnnotation>
    );
  }
);

BarMarker.displayName = "BarMarker";

export default function BarHuntScreen() {
  const { venues } = useApp();
  const insets = useSafeAreaInsets();
  const [selectedBar, setSelectedBar] = useState<Venue | null>(null);
  const [filterId, setFilterId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMapMode, setIsMapMode] = useState(false);
  const [detailTab, setDetailTab] = useState<"overview" | "specials">("overview");
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
    return venues.filter((venue) => {
      if (searchQuery && searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        
        const matchesName = venue.name.toLowerCase().includes(query);
        const matchesLocation = venue.location.toLowerCase().includes(query);
        const matchesDiscount = venue.discount_percentage.toString().includes(query);

        if (!matchesName && !matchesLocation && !matchesDiscount) {
          return false;
        }
      }

      if (filterId === "all") return true;
      if (filterId === "nearby") return venue.distance_km < 2.0; // Distance logic
      if (filterId === "happy_hour") return venue.tags && venue.tags.includes("happy_hour");

      return venue.venue_type === filterId;
    });
  }, [venues, filterId, searchQuery]);

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

  type DetailTabType = "overview" | "specials";

  const detailTabs: SegmentItem<DetailTabType>[] = [
    { value: "overview", label: "DISCOUNT", icon: "eye-outline" },
    { value: "specials", label: "SPECIALS", icon: "star-outline" },
  ];

  return (
    <View className="flex-1 bg-black relative">
      <StatusBar barStyle="light-content" />
      <Header />

      <View className="flex-1" style={{ paddingTop: insets.topi }}>
        <View className="px-4 pt-2 z-10 bg-black">
          <View className="flex-row items-center space-x-3 mb-4 gap-2">
            <View className="flex-1 flex-row items-center bg-white/[0.03] border border-white/10 rounded-full px-4 h-12">
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Find bars, location, discount..."
                placeholderTextColor="#666"
                className="flex-1 ml-3 text-base font-bold text-white"
              />
            </View>
            <TouchableOpacity
              onPress={() => setShowPassport(true)}
              className="w-12 h-12 rounded-full bg-orange-600 items-center justify-center shadow-lg shadow-orange-600/30 border border-white/10"
            >
              <MaterialCommunityIcons name="card-account-details-star" size={24} color="black" />
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
                    name="bottle-tonic-skull"
                    size={20}
                    color={filterId === "all" ? "black" : "white"}
                  />
                ),
              },
              {
                id: "Club", // DB Enum
                label: "Club",
                icon: <MaterialCommunityIcons name="disc" size={20} color={filterId === "Club" ? "black" : "white"} />,
              },
              {
                id: "Bar", // DB Enum
                label: "Bar",
                icon: (
                  <MaterialCommunityIcons
                    name="glass-cocktail"
                    size={18}
                    color={filterId === "Bar" ? "black" : "white"}
                  />
                ),
              },
              {
                id: "Chalga Club", // DB Enum
                label: "Chalga",
                icon: (
                  <MaterialIcons name="nightlife" size={20} color={filterId === "Chalga Club" ? "black" : "white"} />
                ),
              },
              {
                id: "Piano Bar", // DB Enum
                label: "Piano Bar",
                icon: (
                  <MaterialCommunityIcons name="piano" size={18} color={filterId === "Piano Bar" ? "black" : "white"} />
                ),
              },
              {
                id: "Pub", // DB Enum
                label: "Pub",
                icon: <Ionicons name="beer" size={18} color={filterId === "Pub" ? "black" : "white"} />,
              },
              {
                id: "Rooftop", // DB Enum
                label: "Rooftop",
                icon: (
                  <MaterialCommunityIcons
                    name="weather-sunset"
                    size={18}
                    color={filterId === "Rooftop" ? "black" : "white"}
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
                  <DynamicGlanceCard item={item} onPress={() => setSelectedBar(item)} />
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
              <Feather name={isMapMode ? "grid" : "map"} size={18} color="black" />
              <Text className="text-black font-black ml-2 tracking-wide">{isMapMode ? "BARS" : "MAP"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="flex-row justify-around items-center bg-black pt-3 pb-8 border-t border-white/[0.08]">
        <View className="items-center">
          <Ionicons name="search" size={24} color={PRIMARY_ORANGE} />
          <Text className="text-[10px] text-orange-600 font-bold mt-1">Explore</Text>
        </View>
        <View className="items-center opacity-40">
          <MaterialCommunityIcons name="account-group-outline" size={26} color="white" />
          <Text className="text-[10px] text-white font-medium mt-1">Community</Text>
        </View>
      </View>

      <DetailModal visible={!!selectedBar} onClose={() => setSelectedBar(null)} coverImage={selectedBar?.image_url}>
        {selectedBar && (
          <>
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-3xl font-black text-white flex-1">{selectedBar.name}</Text>
            </View>

            <Text className="text-white/50 mb-6 font-bold tracking-wide text-xs">
              {selectedBar.location} • {selectedBar.difficulty} • {selectedBar.distance_str}
            </Text>

            <TabSwitcher
              items={detailTabs}
              selected={detailTab}
              onSelect={setDetailTab}
              containerStyle="mx-4 mb-3 border-b border-white/[0.08]"
            />

            {detailTab === "overview" ? (
              <View>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-white text-lg font-black">Premium Discount QR</Text>
                  <View className="bg-orange-600/20 px-2 py-1 rounded border border-orange-600/50">
                    <Text className="text-orange-500 text-[13px] font-bold">
                      -{selectedBar.discount_percentage}% OFF
                    </Text>
                  </View>
                </View>

                <PremiumLock isLocked={!isPremium} onUnlock={handleUnlockPress} isProcessing={false}>
                  <View className="items-center justify-center w-full aspect-square p-8">
                    <View className="w-full h-full bg-white rounded-xl p-3 border-4 border-white">
                      <View className="flex-1 bg-white p-2 flex-row flex-wrap">
                        {[...Array(100)].map((_, i) => (
                          <View
                            key={i}
                            className={`w-[10%] h-[10%] ${Math.random() > 0.45 ? "bg-black" : "bg-white"}`}
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
                <Text className="text-white text-lg font-black mb-4">Signature Cocktails</Text>
                {selectedBar.specials && selectedBar.specials.length > 0 ? (
                  selectedBar.specials.map((special: VenueSpecial) => (
                    <View
                      key={special.id}
                      className="bg-[#1A1A1A] rounded-2xl p-3 mb-4 flex-row items-center border border-white/[0.08]"
                    >
                      <Image
                        source={{ uri: special.image_url }}
                        style={{ width: 80, height: 80, borderRadius: 12 }}
                        contentFit="cover"
                      />
                      <View className="flex-1 ml-4 justify-center">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="text-white font-bold text-lg flex-1 mr-2">{special.name}</Text>
                          <Text className="text-orange-500 font-black text-lg">{special.price}</Text>
                        </View>
                        <Text className="text-white/40 text-xs leading-4">{special.description}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text className="text-white/30 text-center py-10">No specials listed currently.</Text>
                )}
              </View>
            )}
          </>
        )}
      </DetailModal>

      <PaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} onPurchase={handlePurchase} />

      <SwipeableSheet visible={showPassport} onClose={() => setShowPassport(false)}>
        <View className="items-center py-6">
          <View className="items-center mb-8">
            <Text className="text-orange-600 text-center text-[10px] font-black tracking-[4px] mb-2 uppercase">
              Official Member
            </Text>
            <Text className="text-white text-center text-3xl font-black">DRINKING PASSPORT</Text>
          </View>
          <DigitalPassport />
          <Text className="text-white/40 text-center text-xs mt-8 px-10 leading-5">
            Scan this ID at partner venues to collect points and redeem discounts.
          </Text>
        </View>
      </SwipeableSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    width: 64,
    height: 74,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  pinShadow: {
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  selectedPinShadow: {
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 15,
    transform: [{ scale: 1.15 }],
  },
  pinHead: {
    width: 48,
    height: 48,
    borderRadius: 26,
    backgroundColor: "#222",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  selectedPinHead: {
    borderColor: "#EA580C",
    borderWidth: 4,
  },
  pinPoint: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FFFFFF",
    marginTop: -1,
    zIndex: 1,
  },
  selectedPinPoint: {
    borderTopColor: "#EA580C",
  },
  markerImage: {
    width: "100%",
    height: "100%",
  },
});