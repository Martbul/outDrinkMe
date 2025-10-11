import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

export default function IndexScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Add any additional initialization logic here
    setIsReady(true);
  }, []);

  // Show loading while Clerk is loading
  if (!isLoaded || !isReady) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }

  // Redirect based on authentication status
  if (isSignedIn) {
    // User is signed in - go to main app
    return <Redirect href="/(tabs)" />;
  } 
}