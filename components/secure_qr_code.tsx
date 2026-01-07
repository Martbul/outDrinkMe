import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import QRCode from "react-native-qrcode-svg";
// Make sure the path matches where you saved the hook
import { useSecureQR } from "@/hooks/use_secure_qr";

interface SecureQRCodeProps {
  size?: number;
}

export const SecureQRCode = ({ size = 200 }: SecureQRCodeProps) => {
  // We pass 'true' because if this component is mounted, we want to fetch the QR.
  // The hook handles the throttling (15s cooldown) and auto-refresh logic.
  const { qrData, timeLeft } = useSecureQR(true);

  // If we don't have data yet, show loading state
  if (!qrData) {
    return (
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="black" size="large" />
        <Text style={{ marginTop: 10, color: "gray", fontSize: 10 }}>Generating secure code...</Text>
      </View>
    );
  }

  return (
    <View style={{ alignItems: "center" }}>
      <QRCode value={qrData} size={size} backgroundColor="white" color="black" />
      <Text style={{ marginTop: 12, color: "gray", fontSize: 10, fontFamily: "monospace" }}>
        Refreshes in {timeLeft}s
      </Text>
    </View>
  );
};
