import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { View } from "react-native";
import Spinner from "@/components/spinner";

export default function IndexScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isLoaded || !isReady) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Spinner variant="orbital" size="lg" />
      </View>
    );
  }

  // Redirect based on authentication status
  if (isSignedIn) {
    return <Redirect href="/(tabs)/home" />;
  } else {
    return <Redirect href="/(auth)/google-sign-in" />;
  }
}
