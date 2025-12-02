import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { CameraView, useCameraPermissions } from "expo-camera";

function QrSessionManager({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"create" | "scan">("scan");

  // Create State
  const [sessionName, setSessionName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Scan State
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // 1. Simulate Server Call
  const handleCreateSession = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const serverGeneratedCode =
        "EXP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      setSessionName(serverGeneratedCode);
    } catch (error) {
      Alert.alert("Error", "Failed to create session");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Barcode Scanning
  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    Alert.alert("Scanned!", `Joined session: ${data}`, [
      {
        text: "OK",
        onPress: () => {
          setScanned(false);
          onClose();
        },
      },
    ]);
  };

  // Helper to render the specific state of the Camera View
  const renderCameraContent = () => {
    if (!permission) {
      // Permission is loading
      return (
        <View className="flex-1 items-center justify-center bg-[#1A1A1A]">
          <ActivityIndicator color="orange" size="large" />
        </View>
      );
    }

    if (!permission.granted) {
      // Permission denied - Show button INSIDE the box
      return (
        <View className="flex-1 items-center justify-center bg-[#1A1A1A] p-6">
          <Ionicons name="camera-off-outline" size={48} color="#666" />
          <Text className="text-white text-center mt-4 mb-6 font-medium">
            Camera access is required to scan QR codes.
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            className="bg-orange-600 px-6 py-3 rounded-xl flex-row items-center gap-2"
          >
            <Ionicons name="camera" size={20} color="white" />
            <Text className="text-white font-bold">Allow Camera</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Permission Granted - Show Camera
    return (
      <View className="flex-1 relative">
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />

        {/* Overlay UI */}
        <View className="flex-1 items-center justify-center">
          <View className="w-64 h-64 border-2 border-white/50 rounded-3xl bg-transparent relative">
            {/* Corner Markers */}
            <View className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-orange-500 rounded-tl-xl" />
            <View className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-orange-500 rounded-tr-xl" />
            <View className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-orange-500 rounded-bl-xl" />
            <View className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-orange-500 rounded-br-xl" />
          </View>

          {scanned && (
            <TouchableOpacity
              onPress={() => setScanned(false)}
              className="absolute bottom-10 bg-white px-6 py-3 rounded-full shadow-xl"
            >
              <Text className="font-bold text-black">Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 p-6 bg-[#121212]">
      {/* Handle Bar (Always Visible) */}
      <View className="w-12 h-1 bg-white/10 rounded-full self-center mb-6" />

      {/* Toggle Tabs (Always Visible) */}
      <View className="flex-row bg-[#1A1A1A] p-1 rounded-2xl mb-8 border border-white/5">
        <TouchableOpacity
          onPress={() => setActiveTab("scan")}
          className={`flex-1 py-3 rounded-xl items-center flex-row justify-center gap-2 ${activeTab === "scan" ? "bg-[#333]" : ""}`}
        >
          <Ionicons
            name="scan-outline"
            size={18}
            color={activeTab === "scan" ? "white" : "gray"}
          />
          <Text
            className={`font-bold ${activeTab === "scan" ? "text-white" : "text-gray-500"}`}
          >
            Join Function
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("create")}
          className={`flex-1 py-3 rounded-xl items-center flex-row justify-center gap-2 ${activeTab === "create" ? "bg-[#333]" : ""}`}
        >
          <Ionicons
            name="qr-code-outline"
            size={18}
            color={activeTab === "create" ? "white" : "gray"}
          />
          <Text
            className={`font-bold ${activeTab === "create" ? "text-white" : "text-gray-500"}`}
          >
            Create Function
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      {activeTab === "create" ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="items-center">
            <Text className="text-white text-2xl font-black mb-2 text-center">
              Start an Function
            </Text>
            <Text className="text-gray-400 text-center mb-8 px-4">
              Generate a code so friends can scan and join.
            </Text>

            {/* QR Container */}
            {sessionName ? (
              <View className="items-center w-full">
                <View className="bg-white p-4 rounded-3xl mb-8 shadow-2xl shadow-orange-500/20">
                  <QRCode
                    value={sessionName}
                    size={220}
                    color="black"
                    backgroundColor="white"
                  />
                  <View className="absolute -bottom-4 -right-4 bg-orange-600 w-12 h-12 rounded-full items-center justify-center border-4 border-[#121212]">
                    <Ionicons name="flash" size={20} color="white" />
                  </View>
                </View>
                <Text className="text-white font-bold text-xl tracking-widest mb-2">
                  {sessionName}
                </Text>
                <TouchableOpacity
                  onPress={() => setSessionName("")}
                  className="mt-4"
                >
                  <Text className="text-gray-500 underline">
                    Generate New Code
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleCreateSession}
                disabled={isLoading}
                className="w-full bg-orange-600 py-4 rounded-2xl items-center flex-row justify-center gap-2 shadow-lg shadow-orange-500/30"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="server-outline" size={20} color="white" />
                    <Text className="text-white font-bold text-lg">
                      Generate Session Code
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      ) : (
        // SCAN / JOIN TAB
        // The container is always here, the content changes based on permission
        <View className="flex-1 rounded-3xl overflow-hidden bg-[#1A1A1A] border border-white/10">
          {renderCameraContent()}
        </View>
      )}
    </View>
  );
}

export default QrSessionManager;
