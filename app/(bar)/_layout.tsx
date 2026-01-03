import { Redirect, Stack } from "expo-router";
import { useApp } from "@/providers/AppProvider";

export default function BarRoutesLayout() {
//   const { registeredAtBar } = useApp();

//   if (registeredAtBar) {
    // return <Redirect href={"/(bar)/scan"} />;
//   }

  return <Stack screenOptions={{ headerShown: false }} />;
}
