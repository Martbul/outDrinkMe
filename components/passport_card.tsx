import React, { useEffect, useRef, useState, useMemo, memo } from "react";
import { View, Text, Dimensions, Animated, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import QRCode from "react-native-qrcode-svg";
import { useApp } from "@/providers/AppProvider";
import { useAuth } from "@clerk/clerk-expo";
import { apiService } from "@/api";
import { generateFakeDrinkId } from "@/utils/generateFakeDrinkId";
import { formatDateToDayMonthYear } from "@/utils/format_date";
import { useSecureQR } from "@/hooks/use_secure_qr";

const { width } = Dimensions.get("window");
const CARD_RATIO = 1.586;
const CARD_WIDTH = width - 48;
const CARD_HEIGHT = CARD_WIDTH / CARD_RATIO;

// --- 1. MEMOIZE STATIC ASSETS (Prevents BG flickering) ---

const SmartChip = memo(() => (
  <View className="w-12 h-10 rounded-lg overflow-hidden border border-yellow-600/50 bg-yellow-500/10 relative mr-4">
    <LinearGradient
      colors={["#D4AF37", "#F7EF8A", "#D4AF37"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: "100%", height: "100%", opacity: 0.8 }}
    />
    <View className="absolute inset-0 border-t border-b border-black/20 top-3 bottom-3" />
    <View className="absolute inset-0 border-l border-r border-black/20 left-4 right-4" />
    <View className="absolute w-2 h-2 rounded-full border border-black/10 top-1 left-1" />
  </View>
));

const HolographicOverlay = memo(() => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(animatedValue, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-CARD_WIDTH, CARD_WIDTH],
  });
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" className="overflow-hidden rounded-3xl">
      <Animated.View
        style={{ width: "30%", height: "200%", transform: [{ translateX }, { rotate: "25deg" }, { translateY: -100 }] }}
      >
        <LinearGradient
          colors={[
            "rgba(255,255,255,0)",
            "rgba(255,255,255,0.05)",
            "rgba(234, 88, 12, 0.1)",
            "rgba(255,255,255,0.05)",
            "rgba(255,255,255,0)",
          ]}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
});

const GuillochePattern = memo(() => (
  <View style={StyleSheet.absoluteFill} className="opacity-[0.03]">
    <Svg height="100%" width="100%">
      <Rect x="0" y="0" width="100%" height="100%" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4,4" />
      <Circle cx="0" cy={CARD_HEIGHT} r={CARD_WIDTH} stroke="white" strokeWidth="1" fill="none" />
      <Circle cx={CARD_WIDTH} cy="0" r={CARD_WIDTH / 1.5} stroke="white" strokeWidth="1" fill="none" />
      <Path
        d={`M0 ${CARD_HEIGHT / 2} Q ${CARD_WIDTH / 2} 0 ${CARD_WIDTH} ${CARD_HEIGHT / 2}`}
        stroke="white"
        strokeWidth="1"
        fill="none"
      />
    </Svg>
  </View>
));

// --- 2. MEMOIZE QR GENERATOR (Prevents QR Redraw on Timer Tick) ---

const MemoizedQR = memo(
  ({ value, size = 90 }: { value: string; size?: number }) => {
    return <QRCode value={value} size={size} backgroundColor="white" color="black" />;
  },
  (prev, next) => prev.value === next.value
);

// --- 3. MEMOIZE CARD BASE (Prevents Layout Thrashing) ---

const CardFaceBase = memo(({ children, style }: { children: React.ReactNode; style: any }) => (
  <Animated.View
    style={[
      {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backfaceVisibility: "hidden",
        position: "absolute",
        borderRadius: 24,
        backgroundColor: "#121212",
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
      },
      style,
    ]}
  >
    <LinearGradient colors={["#1a1a1a", "#050505"]} style={StyleSheet.absoluteFill} />
    <GuillochePattern />
    {children}
    <HolographicOverlay />
  </Animated.View>
));

const FrontFace = memo(({ data, isPremium }: { data: any; isPremium: boolean }) => {
  return (
    <>
      <View className="absolute top-0 right-10 w-32 h-full bg-orange-600/5 -skew-x-12 border-l border-r border-orange-600/10" />
      <View className="flex-row justify-between items-center p-5 pb-2">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="card-account-details-star" size={28} color="#EA580C" />
          <View className="ml-3">
            <Text className="text-white/40 text-[8px] font-black tracking-[3px] uppercase">OFFICIAL MEMBER</Text>
            <Text className="text-white text-lg font-black tracking-tighter">
              DRINKUP<Text className="text-orange-600">ID</Text>
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-orange-600 font-bold text-[10px]">CLASS A</Text>
          <Text className="text-white/50 text-[8px] font-mono">VERIFIED</Text>
        </View>
      </View>

      <View className="flex-1 flex-row px-5 pt-2">
        <View className="w-[35%] items-start">
          <View className="w-24 h-24 rounded-full border-2 border-orange-600/30 p-1 bg-black/50 relative mb-3">
            <Image
              source={data.imageUrl ? { uri: data.imageUrl } : require("@/assets/images/icon.png")}
              style={{ width: "100%", height: "100%", borderRadius: 100, opacity: isPremium ? 1 : 0.6 }}
              contentFit="cover"
              transition={200}
            />
          </View>
          <Text className="text-white/30 text-[8px] text-center w-24 font-mono">
            REF: {data.fakeDrinkId.split("-")[1]}
          </Text>
        </View>

        <View className="flex-1 pl-2 pt-1">
          <View className="flex-row items-start justify-between mb-4">
            <SmartChip />
            <MaterialCommunityIcons name="nfc" size={28} color="rgba(255,255,255,0.3)" />
          </View>
          <View>
            <Text className="text-orange-600 text-[8px] font-bold uppercase tracking-widest">
              SURNAME / GIVEN NAMES
            </Text>
            <Text className="text-white text-lg font-black uppercase leading-5">{data.name}</Text>
          </View>
        </View>
      </View>
    </>
  );
});

const BackFace = ({
  data,
  qrCode,
  timeLeft,
  isPremium,
}: {
  data: any;
  qrCode: string | null;
  timeLeft: number;
  isPremium: boolean;
}) => {
  return (
    <View className="flex-1 p-6 justify-between">
      <View className="flex-row items-start">
        <View className="items-center mr-6">
          <View className="bg-white p-2 rounded-lg items-center justify-center min-w-[90px] min-h-[90px]">
            {/* UPDATED: Use MemoizedQR to prevent redraw on timer tick */}
            {qrCode ? (
              <MemoizedQR value={qrCode} size={90} />
            ) : isPremium ? (
              <ActivityIndicator color="#000" />
            ) : (
              <MemoizedQR value="LOCKED" size={90} />
            )}
          </View>

          {isPremium ? (
            <View className="flex-row items-center mt-2">
              <MaterialCommunityIcons name="refresh" size={10} color="rgba(255,255,255,0.4)" />
              {/* Only this text node will update every second now */}
              <Text className="text-white/40 text-[8px] font-mono ml-1">{timeLeft}s</Text>
            </View>
          ) : (
            <Text className="text-white/40 text-[8px] font-mono mt-2 tracking-widest">{data.fakeDrinkId}</Text>
          )}
        </View>

        <View className="flex-1 justify-between h-24">
          <View>
            <Text className="text-white/30 text-[8px] font-bold uppercase mb-1">AUTHORIZED SIGNATURE</Text>
            <View className="h-8 bg-white/10 rounded border border-white/20 justify-center px-2">
              <Text className="font-black text-white/50 text-xs italic">{data.signature}</Text>
            </View>
          </View>
          <View className="flex-row items-center mt-2">
            <MaterialCommunityIcons name="shield-crown" size={16} color="white" />
            <Text className="text-white font-bold text-xs ml-2">United Drinkers</Text>
          </View>
        </View>
      </View>
      <View className="w-full bg-white/5 border border-white/10 rounded-xl p-3 mt-1 flex-row justify-between items-center">
        <Stat label="VALID DUE" value={data.validDue} color="text-orange-500" />
        <Stat label="VISITED VENUES" value={data.barsVisited} />
      </View>
    </View>
  );
};

const Stat = ({ label, value, color = "text-white" }: { label: string; value: any; color?: string }) => (
  <View className="items-center flex-1">
    <Text className="text-[7px] text-white/40 font-bold uppercase mb-0.5">{label}</Text>
    <Text className={`${color} font-black text-sm`}>{value}</Text>
  </View>
);

const EXAMPLE_USER_DATA = {
  name: "EXAMPLE PASSPORT",
  signature: "ExampleUser",
  fakeDrinkId: "000-0000-000",
  joined: "01 JAN 2024",
  imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400",
  moneySaved: 1250.0,
  barsVisited: 42,
  validDue: "12/99",
};

export const PassportCard = () => {
  const { userData, premium } = useApp();
  const isPremium = !!premium;

  const { qrData, timeLeft } = useSecureQR(isPremium);

  const DATA = useMemo(() => {
    if (!premium) return EXAMPLE_USER_DATA;

      return {
        name: `${userData?.firstName} ${userData?.lastName}`,
        signature: userData?.username || "Unknown",
        fakeDrinkId: `DRK-${generateFakeDrinkId(4, "")}-${generateFakeDrinkId(3, "")}`,
        joined: formatDateToDayMonthYear(userData?.created_at),
        imageUrl: userData?.imageUrl,
        barsVisited: premium.venuesVisited,
        validDue: formatDateToDayMonthYear(premium.validUntil),
      };
  }, [premium, userData]);

  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handleFlip = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ["0deg", "180deg"] });
  const backInterpolate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ["180deg", "360deg"] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [89, 90], outputRange: [1, 0] });
  const backOpacity = flipAnim.interpolate({ inputRange: [89, 90], outputRange: [0, 1] });

  return (
    <Pressable onPress={handleFlip} style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
      <CardFaceBase
        style={{ transform: [{ rotateY: frontInterpolate }], opacity: frontOpacity, zIndex: isFlipped ? 0 : 1 }}
      >
        <FrontFace data={DATA} isPremium={isPremium} />
      </CardFaceBase>

      <CardFaceBase
        style={{ transform: [{ rotateY: backInterpolate }], opacity: backOpacity, zIndex: isFlipped ? 1 : 0 }}
      >
        <BackFace data={DATA} qrCode={qrData} timeLeft={timeLeft} isPremium={isPremium} />
      </CardFaceBase>
    </Pressable>
  );
};
