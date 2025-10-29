import { Linking } from "react-native";

export const openTerms = () =>
  Linking.openURL(
    "https://https://outdrinkmeapi.fly.dev/api/v1/terms-of-services"
  );

export const openPrivacy = () =>
  Linking.openURL("https://outdrinkmeapi.fly.dev/api/v1/privacy-policy");
