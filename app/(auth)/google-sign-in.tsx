import * as React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

// This is required for the OAuth flow to work properly
WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignInScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  // useOAuth hook for Google
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onGoogleSignIn = React.useCallback(async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      // Start the OAuth flow
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow({
          redirectUrl: Linking.createURL("/oauth-native-callback", {
            scheme: "outdrinkme",
          }),
        });

      // If sign in was successful, set the active session
      if (createdSessionId) {
        await setActive!({ session: createdSessionId });

        // Navigate to home or onboarding
        router.replace("/(tabs)/home");
      } else {
        // Handle user cancellation or incomplete OAuth
        console.log("OAuth flow not completed");
      }
    } catch (err: any) {
      console.error("OAuth error:", JSON.stringify(err, null, 2));

      // Handle specific error cases
      if (err.errors && err.errors.length > 0) {
        Alert.alert(
          "Sign In Error",
          err.errors[0]?.longMessage ||
            err.errors[0]?.message ||
            "Failed to sign in with Google"
        );
      } else if (err.message) {
        Alert.alert("Sign In Error", err.message);
      } else {
        Alert.alert(
          "Sign In Error",
          "An unexpected error occurred. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, startOAuthFlow, router]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* App Logo/Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Google Sign In Button */}
        <TouchableOpacity
          style={[styles.googleButton, isLoading && styles.buttonDisabled]}
          onPress={onGoogleSignIn}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              {/* Google Icon */}
              <View style={styles.googleIcon}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.buttonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Optional: Terms and Privacy */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{" "}
            <Text style={styles.link}>Terms of Service</Text> and{" "}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    width: 24,
    height: 24,
    backgroundColor: "#fff",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  googleIconText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4285F4",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
  },
  link: {
    color: "#4285F4",
    fontWeight: "600",
  },
});
