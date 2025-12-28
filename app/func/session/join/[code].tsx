import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useFunc } from "@/providers/FunctionProvider";

export default function JoinSessionScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { joinFunc } = useFunc(); 

  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    if (!isLoaded) return;

    const performJoin = async () => {
      if (!isSignedIn) {
        Alert.alert(
          "Sign In Required",
          "Please sign in to join this function."
        );
        router.replace("/(auth)/google-sign-in");
        return;
      }

      if (!code) {
        router.replace("/(tabs)/home");
        return;
      }

      setStatus("Joining Session...");

      try {
        const success = await joinFunc(code);

        if (success) {
          router.replace("/(screens)/func_screen");
        } else {
          router.replace("/(tabs)/home");
        }
      } catch (error) {
        console.error("Deep link join error:", error);
        Alert.alert("Error", "Invalid or expired invite code.");
        router.replace("/(tabs)/home");
      }
    };

    performJoin();
  }, [isLoaded, isSignedIn, code]);

  return (
    <View className="flex-1 bg-black justify-center items-center">
      <ActivityIndicator size="large" color="#EA580C" />
      <Text className="text-white mt-4 font-bold">{status}</Text>
    </View>
  );
}
