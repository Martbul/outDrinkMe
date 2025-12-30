import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  Animated,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path, Circle, Rect } from "react-native-svg"; // Ensure react-native-svg is installed

const { width } = Dimensions.get("window");
const CARD_RATIO = 1.586; // Standard Credit Card / ID Ratio
const CARD_WIDTH = width - 32;
const CARD_HEIGHT = CARD_WIDTH / CARD_RATIO;

// --- MOCK DATA (Replace with User Data) ---
const PASSPORT_DATA = {
  name: "ALEXANDER DRINKER",
  id: "DRK-8821-X99",
  joined: "21 JAN 2024",
  rank: "MALT MASTER",
  nationality: "DRINKUP CITIZEN",
  dob: "12 AUG 1995",
  stats: {
    level: 42,
    liters: 108.5,
    streak: 14,
  },
  avatar:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400",
};

// --- SUB-COMPONENTS ---

// 1. The Gold Smart Chip
const SmartChip = () => (
  <View className="w-12 h-10 rounded-lg overflow-hidden border border-yellow-600/50 bg-yellow-500/10 relative mr-4">
    <LinearGradient
      colors={["#D4AF37", "#F7EF8A", "#D4AF37"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: "100%", height: "100%", opacity: 0.8 }}
    />
    {/* Chip Lines */}
    <View className="absolute inset-0 border-t border-b border-black/20 top-3 bottom-3" />
    <View className="absolute inset-0 border-l border-r border-black/20 left-4 right-4" />
    <View className="absolute w-2 h-2 rounded-full border border-black/10 top-1 left-1" />
  </View>
);

// 2. Holographic Overlay Effect
const HolographicOverlay = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 0, // Reset instantly
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-CARD_WIDTH, CARD_WIDTH],
  });

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      className="overflow-hidden rounded-3xl"
    >
      <Animated.View
        style={{
          width: "30%",
          height: "200%",
          transform: [
            { translateX },
            { rotate: "25deg" },
            { translateY: -100 },
          ],
        }}
      >
        <LinearGradient
          colors={[
            "rgba(255,255,255,0)",
            "rgba(255,255,255,0.05)",
            "rgba(234, 88, 12, 0.1)", // Orange tint
            "rgba(255,255,255,0.05)",
            "rgba(255,255,255,0)",
          ]}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};

// 3. Guilloche Pattern (Background Lines)
const GuillochePattern = () => (
  <View style={StyleSheet.absoluteFill} className="opacity-[0.03]">
    <Svg height="100%" width="100%">
      <Rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="none"
        stroke="white"
        strokeWidth="0.5"
        strokeDasharray="4,4"
      />
      <Circle
        cx="0"
        cy={CARD_HEIGHT}
        r={CARD_WIDTH}
        stroke="white"
        strokeWidth="1"
        fill="none"
      />
      <Circle
        cx={CARD_WIDTH}
        cy="0"
        r={CARD_WIDTH / 1.5}
        stroke="white"
        strokeWidth="1"
        fill="none"
      />
      <Path
        d={`M0 ${CARD_HEIGHT / 2} Q ${CARD_WIDTH / 2} 0 ${CARD_WIDTH} ${
          CARD_HEIGHT / 2
        }`}
        stroke="white"
        strokeWidth="1"
        fill="none"
      />
    </Svg>
  </View>
);

// --- MAIN COMPONENT ---

export default function DigitalPassport() {
  return (
    <View className="items-center justify-center my-6">
      {/* 3D Container Effect */}
      <View
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          shadowColor: "#EA580C",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        }}
        className="relative"
      >
        {/* CARD BACKGROUND */}
        <View className="flex-1 bg-[#121212] rounded-3xl overflow-hidden border border-white/10">
          {/* 1. Background Textures */}
          <LinearGradient
            colors={["#1a1a1a", "#050505"]}
            style={StyleSheet.absoluteFill}
          />
          <GuillochePattern />

          {/* Orange Accent Stripe */}
          <View className="absolute top-0 right-10 w-32 h-full bg-orange-600/5 -skew-x-12 border-l border-r border-orange-600/10" />

          {/* 2. HEADER */}
          <View className="flex-row justify-between items-center p-5 pb-2">
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="passport"
                size={24}
                color="#EA580C"
              />
              <View className="ml-3">
                <Text className="text-white/40 text-[8px] font-black tracking-[3px] uppercase">
                  OFFICIAL MEMBER
                </Text>
                <Text className="text-white text-lg font-black tracking-tighter">
                  DRINKUP<Text className="text-orange-600">ID</Text>
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-orange-600 font-bold text-[10px]">
                CLASS A
              </Text>
              <Text className="text-white/50 text-[8px] font-mono">
                VERIFIED
              </Text>
            </View>
          </View>

          {/* 3. MAIN CONTENT GRID */}
          <View className="flex-1 flex-row px-5 pt-2">
            {/* LEFT: Photo & Chip */}
            <View className="w-[35%] items-start">
              {/* Photo Frame */}
              <View className="w-24 h-32 rounded-lg border-2 border-orange-600/30 p-1 bg-black/50 relative mb-3">
                <Image
                  source={{ uri: PASSPORT_DATA.avatar }}
                  style={{ width: "100%", height: "100%", borderRadius: 4 }}
                  contentFit="cover"
                />
                {/* Hologram over photo */}
                <View className="absolute inset-0 bg-orange-600/10 z-10 rounded-sm" />
                <View className="absolute bottom-1 right-1">
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={14}
                    color="#EA580C"
                  />
                </View>
              </View>

              <Text className="text-white/30 text-[8px] text-center w-24 font-mono">
                IMG_REF_882
              </Text>
            </View>

            {/* RIGHT: Data Fields */}
            <View className="flex-1 pl-2 pt-1">
              <View className="flex-row items-start justify-between mb-4">
                <SmartChip />
                <View className="items-end">
                  <MaterialCommunityIcons
                    name="nfc"
                    size={28}
                    color="rgba(255,255,255,0.3)"
                  />
                </View>
              </View>

              {/* Fields */}
              <View className="space-y-3">
                <View>
                  <Text className="text-orange-600 text-[8px] font-bold uppercase tracking-widest">
                    SURNAME / GIVEN NAMES
                  </Text>
                  <Text className="text-white text-lg font-black uppercase leading-5 shadow-black shadow-sm">
                    {PASSPORT_DATA.name}
                  </Text>
                </View>

                <View className="flex-row justify-between pr-4">
                  <View>
                    <Text className="text-white/40 text-[8px] font-bold uppercase">
                      DATE OF JOINING
                    </Text>
                    <Text className="text-white text-xs font-mono font-bold">
                      {PASSPORT_DATA.joined}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-white/40 text-[8px] font-bold uppercase">
                      RANK
                    </Text>
                    <Text className="text-orange-500 text-xs font-mono font-bold">
                      {PASSPORT_DATA.rank}
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-4 mt-1">
                  <View className="bg-white/5 px-2 py-1 rounded border border-white/10 items-center">
                    <Text className="text-[8px] text-white/50 font-bold">
                      LVL
                    </Text>
                    <Text className="text-white font-black text-sm">
                      {PASSPORT_DATA.stats.level}
                    </Text>
                  </View>
                  <View className="bg-white/5 px-2 py-1 rounded border border-white/10 items-center">
                    <Text className="text-[8px] text-white/50 font-bold">
                      LITERS
                    </Text>
                    <Text className="text-white font-black text-sm">
                      {PASSPORT_DATA.stats.liters}
                    </Text>
                  </View>
                  <View className="bg-orange-600/10 px-2 py-1 rounded border border-orange-600/30 items-center">
                    <Text className="text-[8px] text-orange-500 font-bold">
                      STREAK
                    </Text>
                    <Text className="text-white font-black text-sm">
                      {PASSPORT_DATA.stats.streak}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 4. FOOTER: MRZ (Machine Readable Zone) */}
          <View className="bg-black/30 p-4 border-t border-white/10 relative">
            {/* Fake Barcode Lines */}
            <View className="absolute top-0 right-6 w-32 h-full opacity-20 flex-row gap-[2px]">
              {[...Array(30)].map((_, i) => (
                <View
                  key={i}
                  className={`h-full ${
                    Math.random() > 0.5
                      ? "bg-white w-[1px]"
                      : "bg-transparent w-[2px]"
                  }`}
                />
              ))}
            </View>

            <Text className="text-white/60 font-mono text-[10px] tracking-[2px] leading-4">
              P&lt;DRK{PASSPORT_DATA.name.replace(/\s/g, "<")}{" "}
              &lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;{"\n"}
              {PASSPORT_DATA.id}8USA9508128M2401215&lt;&lt;&lt;&lt;&lt;&lt;04
            </Text>
          </View>

          {/* HOLOGRAPHIC SHINE OVERLAY */}
          <HolographicOverlay />
        </View>
      </View>

      {/* Decorative 'Under' Glow */}
      <View className="absolute -z-10 w-[90%] h-[90%] bg-orange-600/20 blur-3xl rounded-full" />
    </View>
  );
}
