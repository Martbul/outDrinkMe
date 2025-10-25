import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface InfoTooltipProps {
  title: string;
  description: string;
  iconSize?: number;
  iconColor?: string;
  position?: "top" | "bottom" | "left" | "right";
}

export default function InfoTooltip({
  title,
  description,
  iconSize = 18,
  iconColor = "#666666",
  position = "bottom",
}: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const buttonRef = useRef<View>(null);

  const handleOpen = () => {
    buttonRef.current?.measure((fx, fy, width, height, px, py) => {
      setButtonLayout({ x: px, y: py, width, height });
      setVisible(true);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    });
  };

  const handleClose = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const getTooltipPosition = () => {
    const { x, y, width, height } = buttonLayout;
    const tooltipWidth = 280;
    const tooltipOffset = 8;

    switch (position) {
      case "top":
        return {
          left: x + width / 2 - tooltipWidth / 2,
          bottom: y - tooltipOffset,
          transform: [{ translateY: 0 }],
        };
      case "bottom":
        return {
          left: x + width / 2 - tooltipWidth / 2,
          top: y + height + tooltipOffset,
        };
      case "left":
        return {
          right: x - tooltipOffset,
          top: y + height / 2,
          transform: [{ translateY: -50 }],
        };
      case "right":
        return {
          left: x + width + tooltipOffset,
          top: y + height / 2,
          transform: [{ translateY: -50 }],
        };
      default:
        return {
          left: x + width / 2 - tooltipWidth / 2,
          top: y + height + tooltipOffset,
        };
    }
  };

  const getArrowPosition = () => {
    const tooltipWidth = 280;
    const arrowSize = 8;

    switch (position) {
      case "top":
        return {
          bottom: -arrowSize,
          left: tooltipWidth / 2 - arrowSize,
          borderLeftWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderTopWidth: arrowSize,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: "#1a1a1a",
        } as const;
      case "bottom":
        return {
          top: -arrowSize,
          left: tooltipWidth / 2 - arrowSize,
          borderLeftWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: "#1a1a1a",
        } as const;
      case "left":
        return {
          right: -arrowSize,
          top: 0,
          borderTopWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderLeftWidth: arrowSize,
          borderTopColor: "transparent",
          borderBottomColor: "transparent",
          borderLeftColor: "#1a1a1a",
        } as const;
      case "right":
        return {
          left: -arrowSize,
          top: 0,
          borderTopWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderTopColor: "transparent",
          borderBottomColor: "transparent",
          borderRightColor: "#1a1a1a",
        } as const;
    }
  };

  return (
    <>
      {/* Info Icon Button */}
      <TouchableOpacity
        ref={buttonRef}
        onPress={handleOpen}
        className="w-6 h-6 rounded-full bg-white/[0.05] border border-white/[0.08] items-center justify-center"
        style={{ width: iconSize + 8, height: iconSize + 8 }}
      >
        <Feather name="help-circle" size={iconSize} color={iconColor} />
      </TouchableOpacity>

      {/* Tooltip Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <Pressable
          className="flex-1"
          onPress={handleClose}
        >
          <Animated.View
            style={[
              {
                position: "absolute",
                width: 280,
                ...getTooltipPosition(),
                transform: [
                  { scale: scaleAnim },
                  ...(getTooltipPosition().transform || []),
                ],
              },
            ]}
          >
            <Pressable>
              <View className="bg-[#1a1a1a] rounded-2xl p-4 border-2 border-orange-600/30 shadow-2xl">
                {/* Arrow */}
                <View
                  style={[
                    {
                      position: "absolute",
                      width: 0,
                      height: 0,
                    },
                    getArrowPosition(),
                  ]}
                />

                {/* Content */}
                <View className="flex-row items-start mb-2">
                  <View className="w-8 h-8 rounded-full bg-orange-600/20 items-center justify-center mr-3">
                    <Feather name="info" size={16} color="#ff8c00" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-base font-black mb-1">
                      {title}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleClose} className="ml-2">
                    <Feather name="x" size={18} color="#666666" />
                  </TouchableOpacity>
                </View>

                <Text className="text-white/70 text-sm leading-5 pl-11">
                  {description}
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

// Preset variants for common use cases
export const XPInfoTooltip = () => (
  <InfoTooltip
    title="XP & Levels"
    description="Earn XP by maintaining streaks and completing challenges. Level up to unlock exclusive badges and climb the leaderboard!"
    position="bottom"
  />
);

export const StreakInfoTooltip = () => (
  <InfoTooltip
    title="Current Streak"
    description="Track consecutive days of drinking. Keep your streak alive to earn bonus XP and unlock special achievements!"
    position="bottom"
  />
);

export const CoefInfoTooltip = () => (
  <InfoTooltip
    title="Coefficient"
    description="Your drinking consistency score calculated from your weekly performance. Higher coefficient means better consistency!"
    position="bottom"
  />
);

export const RankInfoTooltip = () => (
  <InfoTooltip
    title="World Rank"
    description="Your position among all users globally. Compete with friends and climb to the top of the leaderboard!"
    position="bottom"
  />
);