import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { apiService } from "@/api";

interface QrSessionManagerProps {
  onClose: () => void;
}

function QrSessionManager({ onClose }: QrSessionManagerProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<"create" | "scan">("scan");
  const [isLoading, setIsLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleCreateFunction = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "You must be logged in");
        return;
      }

      const data = await apiService.createFunction(token);

      if (data.sessionID) {
        onClose(); 

        router.push({
          pathname: "/func_screen",
          params: {
            funcId: data.sessionID,
            inviteCode: data.qrToken,
            qrBase64: data.qrCodeBase64, 
          },
        });
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to create party session");
    } finally {
      setIsLoading(false);
    }
  };

 const handleBarCodeScanned = ({ data }: { data: string }) => {
   setScanned(true);
   const token = data.split("/").pop(); 

   Alert.alert("Join Party?", "Do you want to enter this group?", [
     { text: "Cancel", onPress: () => setScanned(false), style: "cancel" },
     {
       text: "Join",
       onPress: () => {
         onClose();
         router.push({
           pathname: "/func_screen",
           params: { inviteCode: token },
         });
       },
     },
   ]);
 };

  const renderCameraContent = () => {
    if (!permission)
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#EA580C" size="large" />
        </View>
      );

    if (!permission.granted) {
      return (
        <View className="flex-1 items-center justify-center p-6 bg-[#1A1A1A]">
          <Ionicons name="camera-outline" size={48} color="#444" />
          <Text className="text-white text-center mt-4 mb-6 font-medium">
            Camera permission is required to join via QR code.
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            className="bg-orange-600 px-8 py-3 rounded-2xl"
          >
            <Text className="text-white font-bold">Grant Access</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="flex-1 relative">
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        />
        {/* Scanner Overlay UI */}
        <View className="flex-1 items-center justify-center">
          <View className="w-64 h-64 border-2 border-orange-500/50 rounded-3xl bg-transparent">
            <View className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-orange-500 rounded-tl-xl" />
            <View className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-orange-500 rounded-tr-xl" />
            <View className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-orange-500 rounded-bl-xl" />
            <View className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-orange-500 rounded-br-xl" />
          </View>
          <Text className="text-white/70 mt-6 font-bold tracking-widest">
            SCAN INVITE QR
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 p-6 bg-[#121212]">
      <View className="w-12 h-1.5 bg-white/10 rounded-full self-center mb-8" />

      <View className="flex-row bg-[#1A1A1A] p-1.5 rounded-2xl mb-10 border border-white/5">
        <TouchableOpacity
          onPress={() => {
            setActiveTab("scan");
            setScanned(false);
          }}
          className={`flex-1 py-4 rounded-xl items-center flex-row justify-center gap-2 ${activeTab === "scan" ? "bg-[#333]" : ""}`}
        >
          <Ionicons
            name="qr-code"
            size={18}
            color={activeTab === "scan" ? "white" : "#666"}
          />
          <Text
            className={`font-bold ${activeTab === "scan" ? "text-white" : "text-gray-500"}`}
          >
            Join Func
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("create")}
          className={`flex-1 py-4 rounded-xl items-center flex-row justify-center gap-2 ${activeTab === "create" ? "bg-[#333]" : ""}`}
        >
          <Ionicons
            name="add-circle"
            size={18}
            color={activeTab === "create" ? "white" : "#666"}
          />
          <Text
            className={`font-bold ${activeTab === "create" ? "text-white" : "text-gray-500"}`}
          >
            New Func
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "create" ? (
        <View className="flex-1 items-center justify-center px-4">
          <View className="bg-orange-600/10 p-8 rounded-full mb-8">
            <Ionicons name="flash" size={54} color="#EA580C" />
          </View>

          <Text className="text-white text-3xl font-black mb-3 text-center">
            Create a Function
          </Text>

          <Text className="text-gray-400 text-center mb-12 leading-6">
            Share images with friends in real-time. {"\n"}
            Everything is{" "}
            <Text className="text-orange-500 font-bold">
              automatically wiped
            </Text>{" "}
            after 72 hours for privacy.
          </Text>

          <TouchableOpacity
            onPress={handleCreateFunction}
            disabled={isLoading}
            className="w-full bg-orange-600 h-18 py-5 rounded-2xl items-center justify-center shadow-xl shadow-orange-600/20"
          >
            {isLoading ? (
              <ActivityIndicator color="black" />
            ) : (
              <View className="flex-row items-center gap-3">
                <Text className="text-black font-black text-lg tracking-[2px]">
                  START PARTY
                </Text>
                <Ionicons name="arrow-forward" size={20} color="black" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} className="mt-6">
            <Text className="text-white/30 font-bold">CANCEL</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1 rounded-[40px] overflow-hidden bg-[#1A1A1A] border-4 border-white/5 shadow-2xl">
          {renderCameraContent()}
        </View>
      )}
    </View>
  );
}

export default QrSessionManager;
