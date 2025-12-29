import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  Alert,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
  Feather,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient"; // Ensure you have this or remove visual gradient

// --- Types ---
interface Bar {
  id: string;
  name: string;
  image_url: string;
  location: string;
  discount: number;
  description: string;
  coordinates: { lat: number; lng: number };
}

interface UserPoints {
  total: number;
  byBar: Record<string, number>; // BarID -> Points
}

// --- Mock Data ---
const MOCK_BARS: Bar[] = [
  {
    id: "1",
    name: "The Rusty Nail",
    image_url: "https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=600",
    location: "Downtown, 5th Ave",
    discount: 15,
    description: "Industrial-chic spot known for craft cocktails and a secret whiskey menu.",
    coordinates: { lat: 40.7128, lng: -74.006 },
  },
  {
    id: "2",
    name: "Neon Nights",
    image_url: "https://images.unsplash.com/photo-1566417713204-6d4123f26ef9?q=80&w=600",
    location: "West End District",
    discount: 25,
    description: "Cyberpunk aesthetic with molecular gastronomy drinks.",
    coordinates: { lat: 40.7200, lng: -74.010 },
  },
  {
    id: "3",
    name: "Hops & Dreams",
    image_url: "https://images.unsplash.com/photo-1584225064785-c62a8b43d148?q=80&w=600",
    location: "Brewer's Alley",
    discount: 10,
    description: "Local microbrewery featuring 40 taps and live jazz.",
    coordinates: { lat: 40.7300, lng: -73.995 },
  },
  {
    id: "4",
    name: "Velvet Lounge",
    image_url: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=600",
    location: "SoHo",
    discount: 20,
    description: "Upscale wine bar with a strict dress code and rare vintages.",
    coordinates: { lat: 40.7150, lng: -74.002 },
  },
];

// --- Helper: Mock Stripe Payment ---
const mockStripePayment = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true); // Simulate success after 2 seconds
    }, 2000);
  });
};

// --- Component: Paywall ---
const Paywall = ({ onUnlock }: { onUnlock: () => void }) => {
  const [processing, setProcessing] = useState(false);
  const insets = useSafeAreaInsets();

  const handlePay = async () => {
    setProcessing(true);
    try {
      await mockStripePayment();
      Alert.alert("Success", "Welcome to the Club! Enjoy your discounts.");
      onUnlock();
    } catch (e) {
      Alert.alert("Error", "Payment failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View className="flex-1 bg-black absolute inset-0 z-50 justify-between" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1574096079513-d8259312b785?q=80&w=1000" }}
        style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.4 }}
        contentFit="cover"
      />
      
      <View className="flex-1 bg-black/60 px-6 justify-center">
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-orange-600 rounded-full items-center justify-center mb-6 shadow-lg shadow-orange-600/50">
            <MaterialCommunityIcons name="crown" size={40} color="black" />
          </View>
          <Text className="text-white text-4xl font-black text-center mb-2">
            PREMIUM <Text className="text-orange-600">ACCESS</Text>
          </Text>
          <Text className="text-white/70 text-center font-semibold text-base">
            Unlock exclusive bar discounts and start collecting BP today.
          </Text>
        </View>

        <View className="space-y-4 gap-4 mb-10">
          {[
            "Up to 50% OFF drinks",
            "Access to Mapbox Locations",
            "Collect & Redeem Bar Points",
            "Exclusive Member Events"
          ].map((benefit, i) => (
            <View key={i} className="flex-row items-center bg-white/[0.05] p-4 rounded-xl border border-white/10">
              <Ionicons name="checkmark-circle" size={24} color="#EA580C" />
              <Text className="text-white font-bold ml-3 text-lg">{benefit}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={handlePay}
          disabled={processing}
          className="bg-orange-600 py-5 rounded-2xl items-center shadow-lg shadow-orange-600/30"
        >
          {processing ? (
            <ActivityIndicator color="black" />
          ) : (
            <View className="flex-row items-center">
              <Text className="text-black text-lg font-black tracking-widest mr-2">
                UNLOCK FOR $4.99
              </Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="black" />
            </View>
          )}
        </TouchableOpacity>
        
        <Text className="text-white/30 text-xs text-center mt-4">
          Secured by Stripe. Cancel anytime.
        </Text>
      </View>
    </View>
  );
};

// --- Component: Mapbox Mock ---
const MockMapbox = ({ location }: { location: string }) => {
  return (
    <View className="w-full h-48 bg-[#1a1a1a] rounded-xl overflow-hidden relative border border-white/10 mt-4">
      {/* Fake Map Grid */}
      <View className="absolute inset-0 flex-row flex-wrap opacity-20">
        {[...Array(20)].map((_, i) => (
            <View key={i} className="w-1/4 h-1/4 border border-white/10" />
        ))}
      </View>
      
      {/* Map Paths (Artistic) */}
      <View className="absolute top-1/2 left-0 w-full h-2 bg-gray-700 -rotate-6" />
      <View className="absolute top-0 left-1/2 w-2 h-full bg-gray-700 rotate-12" />

      {/* Pin */}
      <View className="absolute top-1/2 left-1/2 -ml-4 -mt-8 items-center justify-center">
        <View className="w-16 h-16 bg-orange-600/30 rounded-full animate-ping absolute" />
        <FontAwesome5 name="map-marker-alt" size={32} color="#EA580C" />
      </View>

      <View className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded border border-white/10">
        <Text className="text-white/50 text-[10px] font-bold">© Mapbox © OpenStreetMap</Text>
      </View>
    </View>
  );
};

// --- Main Screen ---
export default function BarHuntScreen() {
  const insets = useSafeAreaInsets();
  const [isPremium, setIsPremium] = useState(false); // Toggle to true to skip paywall during dev
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  
  // Points State
  const [points, setPoints] = useState<UserPoints>({
    total: 350,
    byBar: {
      "1": 50,
      "2": 120,
    }
  });

  // Mock Scanning Action
  const handleSimulateScan = (barId: string) => {
    Alert.alert("QR Scanned!", `You collected 50 BP at ${selectedBar?.name}!`);
    setPoints(prev => ({
      total: prev.total + 50,
      byBar: {
        ...prev.byBar,
        [barId]: (prev.byBar[barId] || 0) + 50
      }
    }));
  };

  if (!isPremium) {
    return <Paywall onUnlock={() => setIsPremium(true)} />;
  }

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      {/* --- HEADER --- */}
      <View className="px-4 pb-4 flex-row justify-between items-center border-b border-white/[0.05]">
        <View>
          <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
            EXPLORE
          </Text>
          <Text className="text-white text-[28px] font-black">
            Bar Hunt
          </Text>
        </View>
        <View className="bg-orange-600/10 px-4 py-2 rounded-xl border border-orange-600/30">
          <Text className="text-orange-600 text-xs font-bold mb-1">TOTAL BP</Text>
          <Text className="text-white text-xl font-black">{points.total}</Text>
        </View>
      </View>

      {/* --- GRID LIST --- */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text className="text-white/50 text-xs font-bold tracking-widest mb-4">NEARBY PARTNERS</Text>
        
        <View className="flex-row flex-wrap justify-between">
          {MOCK_BARS.map((bar) => (
            <TouchableOpacity
              key={bar.id}
              onPress={() => setSelectedBar(bar)}
              className="w-[48%] mb-4 bg-white/[0.03] rounded-2xl overflow-hidden border border-white/[0.08]"
            >
              <View className="h-32 bg-gray-800 relative">
                <Image
                  source={{ uri: bar.image_url }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
                <View className="absolute top-2 right-2 bg-orange-600 px-2 py-1 rounded-md">
                  <Text className="text-black text-[10px] font-black">
                    -{bar.discount}%
                  </Text>
                </View>
              </View>
              
              <View className="p-3">
                <Text className="text-white font-bold text-sm mb-1" numberOfLines={1}>{bar.name}</Text>
                <View className="flex-row items-center mb-2">
                  <Feather name="map-pin" size={10} color="#666" />
                  <Text className="text-white/40 text-[10px] ml-1 flex-1" numberOfLines={1}>
                    {bar.location}
                  </Text>
                </View>
                
                <View className="bg-white/[0.05] p-2 rounded-lg items-center flex-row justify-center">
                   <MaterialCommunityIcons name="star-four-points" size={12} color="#EA580C" />
                   <Text className="text-white/80 text-[10px] font-bold ml-1">
                     {points.byBar[bar.id] || 0} BP
                   </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* --- BAR DETAIL MODAL --- */}
      <Modal
        visible={!!selectedBar}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedBar(null)}
      >
        <View className="flex-1 bg-[#121212]">
          {selectedBar && (
            <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
               {/* Detail Header Image */}
              <View className="h-64 w-full relative">
                <Image
                  source={{ uri: selectedBar.image_url }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
                <LinearGradient
                  colors={['transparent', '#121212']}
                  style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 }}
                />
                <TouchableOpacity 
                    onPress={() => setSelectedBar(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center"
                >
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <View className="px-5 -mt-8">
                {/* Title & Location */}
                <View className="flex-row justify-between items-end mb-4">
                  <View className="flex-1 mr-4">
                    <Text className="text-white text-3xl font-black leading-tight mb-2">
                      {selectedBar.name}
                    </Text>
                    <View className="flex-row items-center">
                      <Feather name="map-pin" size={14} color="#EA580C" />
                      <Text className="text-orange-600 text-sm font-bold ml-1">
                        {selectedBar.location}
                      </Text>
                    </View>
                  </View>
                  <View className="bg-orange-600 px-3 py-3 rounded-2xl items-center">
                    <Text className="text-black text-xl font-black">-{selectedBar.discount}%</Text>
                    <Text className="text-black/70 text-[10px] font-bold">DISCOUNT</Text>
                  </View>
                </View>

                {/* Points Card */}
                <View className="bg-white/[0.05] border border-white/10 p-4 rounded-xl flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-white/50 text-xs font-bold tracking-wider">YOUR POINTS HERE</Text>
                        <Text className="text-white text-2xl font-black mt-1">
                            {points.byBar[selectedBar.id] || 0} <Text className="text-orange-600 text-lg">BP</Text>
                        </Text>
                    </View>
                    <View className="w-12 h-12 bg-orange-600/20 rounded-full items-center justify-center">
                        <MaterialCommunityIcons name="trophy" size={24} color="#EA580C" />
                    </View>
                </View>

                {/* Description */}
                <Text className="text-white/70 text-base leading-6 font-medium mb-6">
                  {selectedBar.description}
                </Text>

                {/* Mapbox Map */}
                <Text className="text-white font-black text-lg">Location</Text>
                <MockMapbox location={selectedBar.location} />

                {/* QR Code Section */}
                <View className="mt-8 bg-white text-black p-6 rounded-3xl items-center space-y-4">
                    <Text className="text-black text-xl font-black mb-2">Your Member ID</Text>
                    
                    {/* Simulated QR Code Visual */}
                    <View className="w-48 h-48 bg-black p-2 rounded-lg relative overflow-hidden">
                         <View className="flex-1 bg-white p-1 flex-row flex-wrap">
                            {/* Simple noise to look like QR */}
                            {[...Array(64)].map((_, i) => (
                                <View key={i} className={`w-[12.5%] h-[12.5%] ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`} />
                            ))}
                            {/* Corner squares of QR */}
                            <View className="absolute top-2 left-2 w-10 h-10 border-4 border-black bg-white" />
                            <View className="absolute top-2 right-2 w-10 h-10 border-4 border-black bg-white" />
                            <View className="absolute bottom-2 left-2 w-10 h-10 border-4 border-black bg-white" />
                         </View>
                    </View>

                    <Text className="text-gray-500 text-center text-xs mt-2 px-4">
                        Show this code to the bartender to verify your discount and collect points.
                    </Text>

                    {/* Simulation Button for "Scanning" */}
                    <TouchableOpacity 
                        onPress={() => handleSimulateScan(selectedBar.id)}
                        className="w-full bg-orange-600 py-4 rounded-xl items-center mt-4"
                    >
                        <Text className="text-black font-black text-base">
                            [MOCK] SIMULATE SCAN
                        </Text>
                    </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}