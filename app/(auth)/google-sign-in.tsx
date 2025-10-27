import * as React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { openPrivacy, openTerms } from "@/utils/links";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const insets = useSafeAreaInsets();

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onGoogleSignIn = React.useCallback(async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL("/(tabs)/add", {
          scheme: "outdrinkme",
        }),
      });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.replace("/(tabs)/add");
      }
    } catch (err: any) {
      console.error("OAuth error:", err);
      Alert.alert(
        "Sign In Error",
        err.errors?.[0]?.message || "Failed to sign in with Google"
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, startOAuthFlow, router]);

  return (
    <View
      className="flex-1 bg-black px-6 justify-center items-center"
      style={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 20,
      }}
    >
      <View className="items-center mb-12">
        <View className="flex my-12">
          <Text className="text-white text-4xl font-black text-center mb-2">
            OutDrinkMe
          </Text>
          <Text className="text-gray-500 text-base text-center mb-8">
            Sign in to start tracking
          </Text>
        </View>
        <View className="w-32 h-32 rounded-full bg-gray-900 border-2 border-gray-800 items-center justify-center mb-12">
          <Image
            source={require("../../assets/images/icon.png")}
            className="w-56 h-56 rounded-full border-3 border-white"
          />
        </View>
      </View>
      <TouchableOpacity
        onPress={onGoogleSignIn}
        disabled={isLoading}
        activeOpacity={0.6}
        className="bg-[#ff8c00] rounded-2xl py-5 px-8 flex-row items-center justify-center w-full max-w-sm shadow-lg mb-4"
      >
        {isLoading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <>
            <View className="w-8 h-8 rounded items-center justify-center mr-4">
              <Text className="text-2xl">G</Text>
            </View>
            <Text className="text-black text-base font-bold">
              Continue with Google
            </Text>
          </>
        )}
      </TouchableOpacity>
      {/* //!TODO: Make a website and instead of downloads just rediect the user to the page */}
      <View className="mt-12 px-8">
        <Text className="text-gray-600 text-xs text-center leading-5">
          By continuing, you agree to our{" "}
          <Text className="text-orange-500 font-semibold" onPress={openTerms}>
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text className="text-orange-500 font-semibold" onPress={openPrivacy}>
            Privacy Policy
          </Text>
        </Text>
      </View>
    </View>
  );
}
