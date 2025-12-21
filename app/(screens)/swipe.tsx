import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import Swiper from "react-native-deck-swiper";
import Header from "@/components/header";
import { useApp } from "@/providers/AppProvider";
import { getRarityColor } from "@/utils/rarity";
import { AlcoholDbItem } from "@/types/api.types";
import { usePostHog } from "posthog-react-native";
import { LinearGradient } from "expo-linear-gradient";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function Swipe() {
  const posthog = usePostHog();
  const insets = useSafeAreaInsets();
  const { alcoholCollection } = useApp();
  const swiperRef = useRef<Swiper<AlcoholDbItem>>(null);

  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<AlcoholDbItem[]>([]);
  const [cardIndex, setCardIndex] = useState(0);

  // Mocking discovery data from your existing collection for the demo
  useEffect(() => {
    if (alcoholCollection) {
      const allItems = Object.values(alcoholCollection).flat() as AlcoholDbItem[];
      // Shuffle items for discovery
      setCards([...allItems].sort(() => Math.random() - 0.5));
    }
  }, [alcoholCollection]);

  const handleSwipedRight = (index: number) => {
    const item = cards[index];
    posthog?.capture("discovery_swiped_right", { item_name: item.name });
    // Add logic here to add to collection or wishlist
  };

  const handleSwipedLeft = (index: number) => {
    const item = cards[index];
    posthog?.capture("discovery_swiped_left", { item_name: item.name });
  };

  const renderCard = (card: AlcoholDbItem) => {
    if (!card) return null;

    return (
      <View 
        className="bg-[#1a1a1a] rounded-3xl overflow-hidden border-2 shadow-2xl"
        style={{ 
          borderColor: getRarityColor(card.rarity),
          height: SCREEN_HEIGHT * 0.6 
        }}
      >
        {/* Rarity Header */}
        <View 
          className="absolute top-0 left-0 right-0 z-10 px-4 py-3 flex-row justify-between items-center"
          style={{ backgroundColor: `${getRarityColor(card.rarity)}30` }}
        >
          <Text className="font-black tracking-widest text-xs" style={{ color: getRarityColor(card.rarity) }}>
            {card.rarity.toUpperCase()}
          </Text>
          <View className="bg-black/40 px-2 py-1 rounded-md">
            <Text className="text-white text-[10px] font-bold">{card.abv}% ABV</Text>
          </View>
        </View>

        {/* Main Image */}
        <View className="flex-1 bg-[#111]">
          {card.image_url ? (
            <Image
              source={{ uri: card.image_url }}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
              transition={300}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
               <MaterialCommunityIcons name="bottle-wine-outline" size={80} color="#333" />
            </View>
          )}
        </View>

        {/* Info Overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          className="absolute bottom-0 left-0 right-0 p-6 pt-12"
        >
          <Text className="text-orange-600 text-xs font-black tracking-widest mb-1">
            {card.type?.toUpperCase()}
          </Text>
          <Text className="text-white text-3xl font-black leading-tight">
            {card.name}
          </Text>
        </LinearGradient>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#EA580C" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      
      {/* Screen Title */}
      <View className="px-6 pt-4">
        <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
          DISCOVER
        </Text>
        <Text className="text-white text-[28px] font-black">
          Daily Picks
        </Text>
      </View>

      <View className="flex-1 -mt-8">
        {cards.length > 0 && cardIndex < cards.length ? (
          <Swiper
            ref={swiperRef}
            cards={cards}
            renderCard={renderCard}
            onSwipedLeft={handleSwipedLeft}
            onSwipedRight={handleSwipedRight}
            onSwipedAll={() => setCardIndex(cards.length)}
            cardIndex={cardIndex}
            backgroundColor={"transparent"}
            stackSize={3}
            stackSeparation={15}
            disableBottomSwipe
            disableTopSwipe
            overlayLabels={{
              left: {
                title: 'PASS',
                style: {
                  label: { backgroundColor: '#dc2626', color: 'white', fontSize: 24, fontWeight: '900', borderRadius: 10, overflow: 'hidden', padding: 10 },
                  wrapper: { flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', marginTop: 30, marginLeft: -30 }
                }
              },
              right: {
                title: 'WANT',
                style: {
                  label: { backgroundColor: '#ea580c', color: 'black', fontSize: 24, fontWeight: '900', borderRadius: 10, overflow: 'hidden', padding: 10 },
                  wrapper: { flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', marginTop: 30, marginLeft: 30 }
                }
              }
            }}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-10">
            <View className="w-24 h-24 rounded-full bg-white/[0.03] items-center justify-center mb-6 border border-white/[0.08]">
               <MaterialCommunityIcons name="refresh" size={40} color="#EA580C" />
            </View>
            <Text className="text-white text-xl font-black mb-2 text-center">No more picks!</Text>
            <Text className="text-white/50 text-center font-medium">Check back later or search manually to find more beverages.</Text>
            <TouchableOpacity 
               onPress={() => setCardIndex(0)}
               className="mt-8 bg-orange-600 px-8 py-4 rounded-2xl"
            >
                <Text className="text-black font-black tracking-widest">RELOAD DECK</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Control Buttons */}
      <View className="flex-row justify-center items-center gap-8 mb-12">
        <TouchableOpacity 
          onPress={() => swiperRef.current?.swipeLeft()}
          className="w-16 h-16 rounded-full bg-white/[0.05] items-center justify-center border border-white/[0.1]"
        >
          <MaterialCommunityIcons name="close" size={32} color="#ff4444" />
        </TouchableOpacity>

        <TouchableOpacity 
          className="w-20 h-20 rounded-full bg-orange-600 items-center justify-center shadow-lg shadow-orange-600/50"
          onPress={() => swiperRef.current?.swipeRight()}
        >
          <MaterialCommunityIcons name="heart" size={40} color="black" />
        </TouchableOpacity>

        <TouchableOpacity 
          className="w-16 h-16 rounded-full bg-white/[0.05] items-center justify-center border border-white/[0.1]"
          onPress={() => {/* Super like or info logic */}}
        >
          <MaterialCommunityIcons name="star" size={32} color="#fbbf24" />
        </TouchableOpacity>
      </View>
    </View>
  );
}