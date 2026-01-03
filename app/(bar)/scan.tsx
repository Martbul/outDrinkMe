import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  Vibration,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera"; // Updated for modern Expo
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCAN_SIZE = SCREEN_WIDTH * 0.7;
const PRIMARY_ORANGE = "#EA580C";

// Mock API Call structure
const saveScanStats = async (memberId: string, venueId: string) => {
  // SIMULATED NETWORK DELAY
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        member_name: "Alex Petrov",
        member_tier: "Gold",
        saved_amount: 14.50, // Calculated on server based on bill/discount
        total_scans_today: 12,
        venue_name: "Club Oblak",
        timestamp: new Date().toISOString(),
      });
    }, 800);
  });
};

export default function Scan() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flashMode, setFlashMode] = useState<"on" | "off">("off");
  
  // Session Stats State
  const [sessionStats, setSessionStats] = useState({ count: 12, saved: 145.0 });
  
  // Result Modal State
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  const handleBarCodeScanned = async ({ type, data }: any) => {
    if (scanned || loading) return;
    
    setScanned(true);
    setLoading(true);
    Vibration.vibrate();

    try {
      // 1. Parse QR Data (Expect JSON or ID)
      // const memberData = JSON.parse(data); 
      const memberId = data; // Assuming QR is just the ID

      // 2. Server Request
      // Replace with: axios.post('/api/employee/scan', { memberId, venueId: 'current_venue_id' })
      const response: any = await saveScanStats(memberId, "venue_123");

      if (response.success) {
        setResult(response);
        setSessionStats(prev => ({
            count: prev.count + 1,
            saved: prev.saved + response.saved_amount
        }));
      }
    } catch (error) {
      Alert.alert("Error", "Invalid Pass or Network Error");
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setResult(null);
    setScanned(false);
  };

  if (!permission?.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-center mb-4">Camera access is needed to scan member passports.</Text>
        <TouchableOpacity onPress={requestPermission} className="bg-orange-600 px-6 py-3 rounded-full">
            <Text className="text-black font-bold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={flashMode === "on"}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Overlay Mask */}
        <View className="flex-1 bg-black/60">
            <View className="flex-1 items-center justify-center">
                <View className="items-center pb-20">
                    <Text className="text-white font-black text-2xl tracking-wider mb-2">SCAN MEMBER</Text>
                    <Text className="text-white/60 text-sm mb-10">Align QR code within the frame</Text>
                    
                    {/* Scanner Frame */}
                    <View style={{ width: SCAN_SIZE, height: SCAN_SIZE }} className="relative">
                        <View className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-orange-500 rounded-tl-3xl" />
                        <View className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-orange-500 rounded-tr-3xl" />
                        <View className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-orange-500 rounded-bl-3xl" />
                        <View className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-orange-500 rounded-br-3xl" />
                        
                        {/* Scanning Line Animation (Visual only) */}
                        {!scanned && !loading && (
                             <LinearGradient
                             colors={['transparent', 'rgba(234, 88, 12, 0.5)', 'transparent']}
                             style={{ width: '100%', height: 4, marginTop: '50%' }}
                           />
                        )}
                        
                        {loading && (
                            <View className="absolute inset-0 items-center justify-center bg-black/40 backdrop-blur-sm">
                                <ActivityIndicator size="large" color={PRIMARY_ORANGE} />
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </View>

        {/* Top Controls */}
        <View style={{ paddingTop: insets.top + 10 }} className="absolute top-0 left-0 right-0 px-6 flex-row justify-between items-center">
            <TouchableOpacity className="w-10 h-10 bg-black/40 rounded-full items-center justify-center border border-white/10">
                <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => setFlashMode(flashMode === "on" ? "off" : "on")}
                className={`w-10 h-10 rounded-full items-center justify-center border border-white/10 ${flashMode === 'on' ? 'bg-orange-600' : 'bg-black/40'}`}
            >
                <Ionicons name={flashMode === "on" ? "flash" : "flash-off"} size={20} color="white" />
            </TouchableOpacity>
        </View>

        {/* Bottom Stats Panel (Employee Dashboard) */}
        <View className="absolute bottom-0 left-0 right-0 bg-[#121212] rounded-t-3xl border-t border-white/10 px-6 pt-6 pb-10">
            <Text className="text-white/40 font-bold text-xs uppercase tracking-widest mb-4">Tonight's Session</Text>
            <View className="flex-row justify-between">
                <View className="bg-[#1A1A1A] flex-1 mr-2 p-4 rounded-2xl border border-white/5">
                    <View className="flex-row items-center mb-2">
                        <MaterialCommunityIcons name="qrcode-scan" size={20} color={PRIMARY_ORANGE} />
                        <Text className="text-white font-bold ml-2">Scans</Text>
                    </View>
                    <Text className="text-3xl font-black text-white">{sessionStats.count}</Text>
                </View>
                <View className="bg-[#1A1A1A] flex-1 ml-2 p-4 rounded-2xl border border-white/5">
                    <View className="flex-row items-center mb-2">
                        <MaterialCommunityIcons name="cash-multiple" size={20} color="#22c55e" />
                        <Text className="text-white font-bold ml-2">Value</Text>
                    </View>
                    <Text className="text-3xl font-black text-white">${sessionStats.saved}</Text>
                </View>
            </View>
        </View>
      </CameraView>

      {/* SUCCESS RESULT MODAL */}
      <Modal visible={!!result} transparent animationType="slide">
        <View className="flex-1 bg-black/90 items-center justify-center px-6">
            <View className="w-full bg-[#1A1A1A] rounded-3xl p-6 border border-white/10 items-center">
                <View className="w-20 h-20 bg-green-500/20 rounded-full items-center justify-center mb-4 border border-green-500/50">
                    <Feather name="check" size={40} color="#22c55e" />
                </View>
                
                <Text className="text-2xl font-black text-white mb-1">Discount Active</Text>
                <Text className="text-white/60 text-base mb-6">{result?.member_name} • {result?.member_tier}</Text>
                
                <View className="w-full bg-black/40 rounded-xl p-4 mb-6 border border-white/5">
                     <View className="flex-row justify-between mb-2">
                        <Text className="text-white/60">Saved Amount</Text>
                        <Text className="text-green-500 font-bold">${result?.saved_amount.toFixed(2)}</Text>
                     </View>
                     <View className="flex-row justify-between">
                        <Text className="text-white/60">Time</Text>
                        <Text className="text-white font-bold">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                     </View>
                </View>

                <TouchableOpacity 
                    onPress={resetScan}
                    className="w-full bg-orange-600 h-14 rounded-full items-center justify-center shadow-lg shadow-orange-600/20"
                >
                    <Text className="text-black font-black text-lg">Scan Next</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}