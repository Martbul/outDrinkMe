import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
  FontAwesome6,
  MaterialIcons,
  AntDesign,
  Entypo,
  FontAwesome,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HighPerfCounter } from "./animated_counter";
import InfoTooltip from "./infoTooltip";

const IconSets = {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
  FontAwesome6,
  MaterialIcons,
  AntDesign,
  Entypo,
  FontAwesome,
};

export type IconFamilyType = keyof typeof IconSets;

interface SideButtonConfig {
  iconName: string;
  iconFamily?: IconFamilyType;
  iconSize?: number; 
  onPress: () => void;
}

interface Props {
  coefInfo: {
    title: string;
    coef: number;
  };
  isCoefTooltipVisible: boolean;
  setIsCoefTooltipVisible: (visible: boolean) => void;
  handleFunctionPress: () => void;
  showTooltip?: boolean;
  leftButton?: SideButtonConfig;
  rightButton?: SideButtonConfig;
  units?: string;
}

const HomeHeadliner = ({
  coefInfo,
  isCoefTooltipVisible,
  setIsCoefTooltipVisible,
  handleFunctionPress,
  showTooltip = false,
  leftButton,
  rightButton,
  units = "",
}: Props) => {

  const renderSideButton = (config?: SideButtonConfig) => {
    if (!config) {
      return <View className="w-16 h-16" />;
    }

    const Family = IconSets[config.iconFamily || "Ionicons"];
    const size = config.iconSize || 28;

    return (
      <View className="rounded-full bg-orange-600/15 border-orange-600">
        <TouchableOpacity onPress={config.onPress} className="w-16 h-16 rounded-full items-center justify-center">
          {/* @ts-ignore - Dynamic icon names make TS unhappy */}
          <Family name={config.iconName} size={size} color="#EA580C" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="items-center mb-6">
      <View className="flex flex-row items-center gap-8">
        {renderSideButton(leftButton)}

        <TouchableOpacity
          onPress={handleFunctionPress}
          className="relative w-[120px] h-[120px] rounded-full bg-orange-600/15 border-4 border-orange-600 justify-center items-center mb-3"
          activeOpacity={0.8}
        >
          <HighPerfCounter
            toValue={Number(coefInfo.coef)}
            duration={2500}
            className="text-orange-600 text-5xl font-black text-center"
            style={{ color: "#EA580C" }}
          />

          <View className="absolute bottom-5">
            <Text className="text-orange-500 text-[10px] font-black tracking-[0.25em] uppercase opacity-80">
              {units}
            </Text>
          </View>

          {showTooltip && (
            <TouchableOpacity
              onPress={() => setIsCoefTooltipVisible(!isCoefTooltipVisible)}
              className="absolute w-8 h-8 rounded-full items-center justify-center"
              style={{ zIndex: 10, right: -14, bottom: -10 }}
            >
              <Feather name="help-circle" size={24} color="#666666" />
            </TouchableOpacity>
          )}

          {showTooltip && isCoefTooltipVisible && (
            <InfoTooltip
              visible={isCoefTooltipVisible}
              title="Points"
              description="Your drinking point calculated on your streak, mix posts and overall drunk days"
              onClose={() => setIsCoefTooltipVisible(false)}
            />
          )}
        </TouchableOpacity>

        {/* --- Right Button --- */}
        {renderSideButton(rightButton)}
      </View>

      <Text className="text-white text-[22px] font-black tracking-wide">{coefInfo.title}</Text>
    </View>
  );
};

export default HomeHeadliner;
