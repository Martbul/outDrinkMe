import React, { useState, useEffect } from "react";
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface PaddleCheckoutProps {
  plan: "monthly" | "yearly";
  onSuccess: () => void;
  onClose: () => void;
}

export const PaddleCheckout = ({ plan, onSuccess, onClose }: PaddleCheckoutProps) => {
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // REPLACE THESE WITH YOUR ACTUAL CONFIG
  const API_URL = "http://YOUR_LOCAL_IP:8080/create-transaction";
  const CLIENT_TOKEN = "YOUR_CLIENT_SIDE_TOKEN"; // From Paddle Dashboard

  useEffect(() => {
    // Fetch transaction ID based on the selected plan
    const fetchTransaction = async () => {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Send the plan type to your backend to determine the price/product
          body: JSON.stringify({ planType: plan }),
        });

        const data = await response.json();
        setTransactionId(data.transactionId);
      } catch (err) {
        console.error("Error creating transaction:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [plan]);

  const paddleHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script>
        <style>
          body { margin: 0; padding: 0; background-color: transparent; }
          #checkout { width: 100%; }
        </style>
      </head>
      <body>
        <div id="checkout"></div>
        <script>
          Paddle.Environment.set('sandbox'); 
          Paddle.Initialize({ 
            token: '${CLIENT_TOKEN}',
            eventCallback: function(data) {
              window.ReactNativeWebView.postMessage(JSON.stringify(data));
            }
          });
          
          if ('${transactionId}') {
            Paddle.Checkout.open({
              transactionId: '${transactionId}',
              settings: {
                  displayMode: 'inline',
                  frameTarget: 'checkout',
                  frameStyle: 'width: 100%; min-height: 400px; background-color: transparent; border: none;',
                  theme: 'dark' 
              }
            });
          }
        </script>
      </body>
    </html>
  `;

  return (
    <View className="flex-1 h-[500px] w-full relative bg-[#121212]">
      {/* Header / Back Button */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-white/10 mb-2">
        <TouchableOpacity onPress={onClose} className="p-2 -ml-2">
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-sm uppercase tracking-widest">Checkout ({plan})</Text>
        <View className="w-8" />
      </View>

      {/* Content */}
      {loading || !transactionId ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EA580C" />
          <Text className="text-white/50 text-xs mt-4">Preparing Secure Checkout...</Text>
        </View>
      ) : (
        <WebView
          originWhitelist={["*"]}
          source={{ html: paddleHtml }}
          javaScriptEnabled={true}
          style={{ backgroundColor: "transparent" }}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              // Listen for completion event
              if (data.name === "checkout.completed") {
                onSuccess();
              }
            } catch (e) {
              console.log("WebView Message Error", e);
            }
          }}
        />
      )}
    </View>
  );
};
