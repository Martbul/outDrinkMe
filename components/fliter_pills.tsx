import React from "react";
import { ScrollView, TouchableOpacity, Text, View } from "react-native";

interface FilterItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface FilterPillsProps {
  items: FilterItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const FilterPills = ({
  items,
  selectedId,
  onSelect,
}: FilterPillsProps) => {
  return (
    <View className="mb-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="overflow-visible pb-2"
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {items.map((item) => {
          const isActive = selectedId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onSelect(item.id)}
              className={`flex-row items-center border rounded-full px-4 py-2 mr-2 ${
                isActive
                  ? "bg-orange-600 border-orange-600"
                  : "bg-white/[0.03] border-white/[0.08]"
              }`}
            >
              {item.icon && <View className="mr-2">{item.icon}</View>}
              <Text
                className={`font-bold text-sm ${
                  isActive ? "text-black" : "text-white"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
