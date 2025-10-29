import { Linking } from "react-native";

export const openTerms = () =>
  Linking.openURL("https://martbul.com/api/v1/terms-of-services");

export const openPrivacy = () =>
  Linking.openURL("https://martbul.com/api/v1/privacy-policy");
