import React, { useState, useRef } from "react";
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
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageSourcePropType,
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
import Header from "@/components/header"; // Assuming you have this, or remove if not

// --- Constants ---
const PRIMARY_ORANGE = "#EA580C";

// ============================================================================
// REUSABLE COMPONENTS (Move these to separate files in /components)
// ============================================================================

// 1. SwipeableSheet (Handles the drag-down gesture)
interface SwipeableSheetProps {
  visible: boolean;
  onClose: () => void;
  coverImage?: string;
  children: React.ReactNode;
}
const SwipeableSheet = ({
  visible,
  onClose,
  coverImage,
  children,
}: SwipeableSheetProps) => {
  const panY = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          gestureState.dy > 5 &&
          Math.abs(gestureState.dx) < Math.abs(gestureState.dy) &&
          scrollY.current <= 0
        );
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

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = event.nativeEvent.contentOffset.y;
  };

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
          {/* Drag Handle */}
          <View className="absolute top-2 left-0 right-0 items-center z-50">
            <View className="w-12 h-1.5 bg-white/30 rounded-full" />
          </View>

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 left-4 z-50 w-10 h-10 bg-black/60 backdrop-blur-md rounded-full items-center justify-center border border-white/10"
          >
            <Ionicons name="chevron-down" size={24} color="white" />
          </TouchableOpacity>

          <ScrollView
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {coverImage && (
              <View className="h-72 w-full relative">
                <Image
                  source={{ uri: coverImage }}
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
            <View className={coverImage ? "px-5 -mt-4" : "px-5 pt-16"}>
              {children}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

// 2. GlanceCard (The main list item)
interface GlanceCardProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  onPress: () => void;
  footerContent?: React.ReactNode;
}
const GlanceCard = ({
  title,
  subtitle,
  imageUrl,
  rating,
  reviewCount,
  onPress,
  footerContent,
}: GlanceCardProps) => (
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={onPress}
    className="mb-6 bg-[#121212] rounded-3xl overflow-hidden border border-white/[0.08]"
  >
    <View className="relative w-full h-56 bg-gray-900">
      <Image
        source={{ uri: imageUrl }}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.6)", "transparent"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80 }}
      />
      <TouchableOpacity className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full items-center justify-center border border-white/10">
        <Feather name="bookmark" size={18} color="white" />
      </TouchableOpacity>
      {/* Mini Map Visual Mock */}
      <View className="absolute bottom-4 right-4 w-16 h-16 rounded-xl border border-white/10 overflow-hidden bg-black/80 items-center justify-center">
        <Image
          source={{
            uri: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Helsinki_City_Map.png",
          }}
          style={{ width: "100%", height: "100%", opacity: 0.4 }}
        />
        <View className="absolute inset-0 items-center justify-center">
          <View className="w-3 h-3 rounded-full bg-orange-600 shadow-lg shadow-orange-600" />
        </View>
      </View>
    </View>
    <View className="p-4">
      <Text className="text-xl font-black text-white leading-6 mb-1">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">
          {subtitle}
        </Text>
      )}
      <View className="flex-row items-center space-x-2">
        {rating && (
          <View className="flex-row items-center bg-white/[0.05] px-2 py-1 rounded-md border border-white/[0.05] mr-2">
            <Ionicons name="star" size={12} color={PRIMARY_ORANGE} />
            <Text className="text-xs font-bold text-white ml-1">{rating}</Text>
            {reviewCount && (
              <Text className="text-xs text-white/50 ml-1">
                ({reviewCount})
              </Text>
            )}
          </View>
        )}
        {footerContent}
      </View>
    </View>
  </TouchableOpacity>
);

// 3. PremiumLock (Overlay logic)
interface PremiumLockProps {
  isLocked: boolean;
  onUnlock: () => void;
  isProcessing?: boolean;
  children: React.ReactNode;
}
const PremiumLock = ({
  isLocked,
  onUnlock,
  isProcessing,
  children,
}: PremiumLockProps) => (
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

// 4. SearchBar
const SearchBar = ({ placeholder = "Search..." }) => (
  <View className="flex-row items-center bg-[#1A1A1A] border border-white/10 rounded-full px-4 h-12 mb-4">
    <Ionicons name="search" size={20} color="#666" />
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#666"
      className="flex-1 ml-3 text-base font-bold text-white"
    />
    <View className="bg-white/10 rounded-full p-1.5">
      <Ionicons name="options-outline" size={18} color="white" />
    </View>
  </View>
);

// 5. FilterPills
const FilterPills = ({
  items,
  selected,
  onSelect,
}: {
  items: { id: string; label: string; icon?: any }[];
  selected: string;
  onSelect: (id: string) => void;
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    className="mb-2 overflow-visible pb-2"
  >
    {items.map((item) => (
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


interface Bar {
  id: string;
  name: string;
  image_url: string;
  location: string;
  distance: string;
  rating: number;
  reviewCount: number;
  difficulty: "Cheap" | "Moderate" | "Expensive";
  time: string;
  description: string;
}

const MOCK_BARS: Bar[] = [
  {
    id: "1",
    name: "Hemlock Falls Alehouse",
    image_url:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800",
    location: "Millburn, NJ",
    distance: "5.80 mi",
    rating: 4.5,
    reviewCount: 128,
    difficulty: "Moderate",
    time: "Happy Hour: 4-7 PM",
    description:
      "A rustic spot featuring a waterfall patio and an extensive craft beer list.",
  },
  {
    id: "2",
    name: "Neon Nights Lounge",
    image_url:
      "https://images.unsplash.com/photo-1575444758702-4a6b9222336e?q=80&w=800",
    location: "Rahway, NJ",
    distance: "2.3 mi",
    rating: 4.8,
    reviewCount: 342,
    difficulty: "Expensive",
    time: "Open late",
    description:
      "Upscale cocktail lounge with a strict dress code and molecular mixology.",
  },
  {
    id: "3",
    name: "The Rusty Nail",
    image_url:
      "https://images.unsplash.com/photo-1538488881038-e252a86e6f10?q=80&w=800",
    location: "Maplewood, NJ",
    distance: "0.5 mi",
    rating: 4.2,
    reviewCount: 89,
    difficulty: "Cheap",
    time: "Live Music 8 PM",
    description:
      "Local dive with great burgers, cheap pitchers, and live local bands.",
  },
];

export default function BarHuntScreen() {
  const insets = useSafeAreaInsets();
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  const [filterId, setFilterId] = useState("nearby");
  const [isPremium, setIsPremium] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
        <View className="px-4 py-2 z-10">
          <SearchBar placeholder="Find bars, pubs, clubs" />

          <FilterPills
            selected={filterId}
            onSelect={setFilterId}
            items={[
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

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {MOCK_BARS.map((bar) => (
            <GlanceCard
              key={bar.id}
              title={bar.name}
              subtitle={bar.location}
              imageUrl={bar.image_url}
              rating={bar.rating}
              reviewCount={bar.reviewCount}
              onPress={() => setSelectedBar(bar)}
              footerContent={
                <>
                  <Text className="text-white/20 text-xs">•</Text>
                  <Text className="text-xs font-bold text-white/70">
                    {bar.difficulty}
                  </Text>
                  <Text className="text-white/20 text-xs">•</Text>
                  <Text className="text-xs font-bold text-orange-600">
                    {bar.time}
                  </Text>
                </>
              }
            />
          ))}
        </ScrollView>

        {/* Floating Map Button */}
        <View className="absolute bottom-6 self-center z-20">
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center bg-orange-600 px-6 py-4 rounded-full shadow-lg shadow-orange-600/40"
          >
            <Feather name="map" size={18} color="black" />
            <Text className="text-black font-black ml-2 tracking-wide">
              MAP VIEW
            </Text>
          </TouchableOpacity>
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

      {/* DETAIL MODAL */}
      <SwipeableSheet
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
              {selectedBar.location} • {selectedBar.difficulty}
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
                  50 POINTS
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
      </SwipeableSheet>
    </View>
  );
}
