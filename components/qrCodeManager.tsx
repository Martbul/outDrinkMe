import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { apiService } from "@/api";
import { AlertModal } from "./alert_modal";
import { useFunc } from "@/providers/FunctionProvider"; // <--- IMPORT THIS

interface QrSessionManagerProps {
  onClose: () => void;
}

function QrSessionManager({ onClose }: QrSessionManagerProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const { joinFunc } = useFunc(); // <--- GET JOIN FUNCTION

  const [activeTab, setActiveTab] = useState<"create" | "scan">("scan");
  const [isLoading, setIsLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [scannedInviteCode, setScannedInviteCode] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false); // <--- Local loading state

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
    // If scanning a URL like outdrinkme://... extract the code
    // If scanning just the UUID, use it directly
    const token = data.includes("=") ? data.split("=").pop() : data.split("/").pop();

    setScanned(true);
    setScannedInviteCode(token || "");
    setJoinModalVisible(true);
  };

  const handleConfirmJoin = async () => {
    if (!scannedInviteCode) return;

    setIsJoining(true); // Start loading
    try {
      // ACTUAL API CALL
      const success = await joinFunc(scannedInviteCode);

      setJoinModalVisible(false);

      if (success) {
        onClose();
        // Just push to screen, the Provider now has the data
        router.push("/func_screen");
      } else {
        Alert.alert("Error", "Could not join. The party might be expired.");
        setScanned(false);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to join session.");
      setScanned(false);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCancelJoin = () => {
    setJoinModalVisible(false);
    setScannedInviteCode(null);
    setTimeout(() => setScanned(false), 1000);
  };

  const renderCameraContent = () => {
    if (!permission)
      return (
        <View className="flex-1 items-center justify-center bg-black">
          <ActivityIndicator color="#EA580C" size="large" />
        </View>
      );

    if (!permission.granted) {
      return (
        <View className="bg-black flex-1 items-center justify-center p-6 ">
          <Ionicons name="camera-outline" size={48} color="#EA580C" />
          <Text className="text-white text-center mt-4 mb-6 font-medium">
            Camera permission is required to join via QR code.
          </Text>
          <TouchableOpacity onPress={requestPermission} className="bg-orange-600 px-8 py-3 rounded-2xl">
            <Text className="text-black font-bold">Grant Access</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="flex-1 relative bg-black">
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        />
        <View className="flex-1 items-center justify-center">
          <View className="w-64 h-64 border-2 border-orange-500/50 rounded-3xl bg-transparent">
            {/* Corners */}
            <View className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-orange-500 rounded-tl-xl" />
            <View className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-orange-500 rounded-tr-xl" />
            <View className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-orange-500 rounded-bl-xl" />
            <View className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-orange-500 rounded-br-xl" />
          </View>
          <Text className="text-white/70 mt-6 font-bold tracking-widest">SCAN QR</Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 p-6 bg-black">
      {/* Pass isJoining to modal to show spinner on the button */}
      <AlertModal
        visible={joinModalVisible}
        title="Join Function?"
        message="Do you want to enter this group and view the gallery?"
        confirmText={isJoining ? "JOINING..." : "JOIN"}
        cancelText="CANCEL"
        icon="enter-outline"
        onConfirm={handleConfirmJoin}
        onClose={handleCancelJoin}
      />

      <View className="w-12 h-1.5 bg-orange-600/40 rounded-full self-center mb-8" />

      {/* Tabs */}
      <View className="flex-row bg-white/[0.03] p-1.5 rounded-2xl mb-10 border border-white/[0.1]">
        <TouchableOpacity
          onPress={() => {
            setActiveTab("scan");
            setScanned(false);
          }}
          className={`flex-1 py-4 rounded-xl items-center flex-row justify-center gap-2 ${
            activeTab === "scan" ? "bg-orange-600/80" : ""
          }`}
        >
          <Ionicons name="qr-code" size={18} color={activeTab === "scan" ? "black" : "rgba(255,255,255,0.3)"} />
          <Text className={`font-bold ${activeTab === "scan" ? "text-black" : "text-white/30"}`}>Join Func</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("create")}
          className={`flex-1 py-4 rounded-xl items-center flex-row justify-center gap-2 ${
            activeTab === "create" ? "bg-orange-600/80" : ""
          }`}
        >
          <FontAwesome
            name="plus-square-o"
            size={22}
            color={activeTab === "create" ? "black" : "rgba(255,255,255,0.3)"}
          />
          <Text className={`font-bold ${activeTab === "create" ? "text-black" : "text-white/30"}`}>New Func</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "create" ? (
        <View className="flex-1 items-center justify-center px-4">
          <View className="bg-orange-600/10 p-8 rounded-full mb-6">
            <Ionicons name="images-outline" size={54} color="#EA580C" />
          </View>

          <Text className="text-white text-3xl font-black mb-3 text-center">Function</Text>

          <Text className="text-white/40 text-center mb-14 leading-6">
            Share the after party images with friends{"\n"}
            Everything is <Text className="text-orange-500 font-bold">automatically wiped</Text> after 72 hours.
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
                <Text className="text-black font-black text-lg tracking-[2px]">CREATE</Text>
                <Ionicons name="arrow-forward" size={20} color="black" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} className="mt-4">
            <Text className="text-white/30 font-bold">CANCEL</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1 rounded-[40px] overflow-hidden bg-black border-4 border-white/[0.05] shadow-2xl">
          {renderCameraContent()}
        </View>
      )}
    </View>
  );
}

export default QrSessionManager;
