import React from "react";
import { View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackArrow from "./backArrows";

interface BackHeaderProps {
  className?: string;
  style?: ViewStyle | ViewStyle[];
}

export default function BackHeader({ className = "", style }: BackHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    // no default top-12 here — caller provides top via className or style
    <View
      className={`absolute left-0 right-0 z-50 px-4 ${className}`}
      style={[{ paddingTop: insets.top }, style]}
    >
      <BackArrow />
    </View>
  );
}
