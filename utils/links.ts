import { Linking } from "react-native";

export const openTerms = () =>
  Linking.openURL(
    "https://outdrinkmeapi.onrender.com/api/v1/terms-of-services"
  );

export const openPrivacy = () =>
  Linking.openURL("https://outdrinkmeapi.onrender.com/api/v1/privacy-policy");
