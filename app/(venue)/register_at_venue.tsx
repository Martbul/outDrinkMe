import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useApp } from "@/providers/AppProvider"; // Assuming you have venues here
import Header from "@/components/header";

const PRIMARY_ORANGE = "#EA580C";

// Dummy API call for registration
const registerEmployee = async (venueId: string, accessCode: string) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Mock validation: Code must be "1234"
            if (accessCode === "1234") resolve(true);
            else reject(new Error("Invalid Access Code"));
        }, 1500);
    });
};

export default function RegisterAtVenue() {
  const insets = useSafeAreaInsets();
  const { venues } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [accessCode, setAccessCode] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Simple search filter
  const filteredVenues = useMemo(() => {
    if (!searchQuery) return venues;
    return venues.filter(v => 
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        v.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [venues, searchQuery]);

  const handleJoinPress = async () => {
    if (!accessCode) {
        Alert.alert("Required", "Please enter the staff access code provided by your manager.");
        return;
    }
    
    setIsRegistering(true);
    try {
        await registerEmployee(selectedVenue.id, accessCode);
        Alert.alert("Success", `You are now registered as staff at ${selectedVenue.name}`);
        setSelectedVenue(null);
        setAccessCode("");
        // Navigate to Employee Dashboard here
    } catch (err) {
        Alert.alert("Registration Failed", "Invalid Access Code. Please ask your manager.");
    } finally {
        setIsRegistering(false);
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
        onPress={() => setSelectedVenue(item)}
        className="flex-row items-center bg-[#1A1A1A] p-3 rounded-2xl mb-3 border border-white/5"
    >
        <Image 
            source={{ uri: item.image_url }} 
            style={{ width: 60, height: 60, borderRadius: 12 }} 
            contentFit="cover" 
        />
        <View className="flex-1 ml-4">
            <Text className="text-white font-bold text-lg">{item.name}</Text>
            <Text className="text-white/40 text-xs">{item.location}</Text>
        </View>
        <View className="bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Text className="text-white font-bold text-xs">JOIN</Text>
        </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-black">
      <Header />
      
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <View className="px-4 mb-4">
            <Text className="text-white/60 mb-6">Search for your workplace to begin scanning member passports.</Text>
            
            {/* Search Input */}
            <View className="flex-row items-center bg-[#1A1A1A] border border-white/10 rounded-xl px-4 h-12 mb-2">
                <Ionicons name="search" size={20} color="#666" />
                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search venue name..."
                    placeholderTextColor="#666"
                    className="flex-1 ml-3 text-base font-bold text-white"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Ionicons name="close-circle" size={20} color="#666" />
                    </TouchableOpacity>
                )}
            </View>
        </View>

        {/* Venue List */}
        <View className="flex-1 px-4">
            <FlashList
                data={filteredVenues}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 50 }}
                ListEmptyComponent={() => (
                    <View className="mt-10 items-center">
                        <Text className="text-white/30">No venues found</Text>
                    </View>
                )}
            />
        </View>
      </View>

      {/* Verification Modal */}
      <Modal visible={!!selectedVenue} transparent animationType="fade">
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-black/80 justify-end"
        >
            <TouchableWithoutFeedback onPress={() => setSelectedVenue(null)}>
                <View className="flex-1" />
            </TouchableWithoutFeedback>
            
            <View className="bg-[#121212] border-t border-white/10 rounded-t-3xl p-6 pb-10">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-white font-black text-xl">Verify Employment</Text>
                        <Text className="text-orange-600 text-sm font-bold">{selectedVenue?.name}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedVenue(null)} className="p-2 bg-white/5 rounded-full">
                        <Ionicons name="close" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <Text className="text-white/60 mb-4">
                    Enter the 4-digit manager access code to register as staff for this venue.
                </Text>

                <View className="flex-row items-center bg-[#1A1A1A] border border-white/10 rounded-xl px-4 h-14 mb-6">
                    <MaterialCommunityIcons name="lock" size={20} color={PRIMARY_ORANGE} />
                    <TextInput
                        value={accessCode}
                        onChangeText={setAccessCode}
                        placeholder="Manager Code"
                        placeholderTextColor="#444"
                        secureTextEntry
                        keyboardType="number-pad"
                        maxLength={6}
                        autoFocus
                        className="flex-1 ml-3 text-lg font-bold text-white tracking-widest"
                    />
                </View>

                <TouchableOpacity 
                    onPress={handleJoinPress}
                    disabled={isRegistering}
                    className="w-full bg-orange-600 h-14 rounded-full flex-row items-center justify-center shadow-lg shadow-orange-600/20"
                >
                    {isRegistering ? (
                        <ActivityIndicator color="black" />
                    ) : (
                        <>
                            <Text className="text-black font-black text-lg mr-2">CONFIRM & JOIN</Text>
                            <Ionicons name="arrow-forward" size={20} color="black" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}