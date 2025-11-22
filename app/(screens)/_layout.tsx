import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function ScreensLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/(auth)/google-sign-in" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;

}
