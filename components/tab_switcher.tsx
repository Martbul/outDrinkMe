import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"; // Import both icon sets

// 1. Define the shape of a single tab item
export interface SegmentItem<T> {
  value: T;
  label: string;
  icon?: {
    name: keyof typeof Ionicons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap; // Icon name from either library
    library: "Ionicons" | "MaterialCommunityIcons"; // Specify which library to use
  };
}

// 2. Define the props for the control
interface TabSwitcherProps<T> {
  items: SegmentItem<T>[];
  selected: T;
  onSelect: (value: T) => void;
  containerStyle?: string; // Optional: to override margins/width
}

// 3. The Generic Component
export const TabSwitcher = <T extends string | number>({
  items,
  selected,
  onSelect,
  containerStyle = "mx-16 mb-3 mt-2", // Default to your original margins
}: TabSwitcherProps<T>) => {
  return (
    <View
      className={`${containerStyle} h-10 bg-[#1A1A1A] rounded-full border border-white/[0.1] p-1 flex-row relative`}
    >
      {items.map((item) => {
        const isActive = selected === item.value;
        const iconColor = isActive ? "black" : "#666";
        const textColor = isActive ? "text-black" : "text-white/40";
        const backgroundColor = isActive ? "bg-orange-600" : "bg-transparent";

        return (
          <TouchableOpacity
            key={String(item.value)}
            onPress={() => onSelect(item.value)}
            className={`flex-1 items-center justify-center rounded-full ${backgroundColor}`}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center space-x-1">
              {item.icon && (
                <>
                  {item.icon.library === "Ionicons" && (
                    <Ionicons
                      name={item.icon.name as keyof typeof Ionicons.glyphMap} 
                      size={18}
                      color={iconColor}
                      style={{ marginRight: 4 }}
                    />
                  )}
                  {item.icon.library === "MaterialCommunityIcons" && (
                    <MaterialCommunityIcons
                      name={item.icon.name as keyof typeof MaterialCommunityIcons.glyphMap}
                      size={18}
                      color={iconColor}
                      style={{ marginRight: 4 }}
                    />
                  )}
                </>
              )}
              <Text className={`text-[11px] font-black tracking-wide ${textColor}`}>{item.label}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
