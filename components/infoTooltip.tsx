import React, { useState, useRef, useEffect } from "react";
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
  visible: boolean;
  title: string;
  description: string;
  iconSize?: number;
  position?: "top" | "bottom" | "left" | "right";
  onClose: () => void; 
}

export default function InfoTooltip({
  visible = false,
  title,
  description,
  iconSize = 18,
  position = "bottom",
  onClose,
}: InfoTooltipProps) {
  const [buttonLayout, setButtonLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const buttonRef = useRef<View>(null);

  useEffect(() => {
    if (visible) {
      buttonRef.current?.measure((fx, fy, width, height, px, py) => {
        setButtonLayout({ x: px, y: py, width, height });
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      });
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    onClose();
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
        className=" items-center justify-center"
      ></TouchableOpacity>

      {/* Tooltip Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <Pressable className="flex-1" onPress={handleClose}>
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
                <View className="flex-row items-start">
                  <View className="w-8 h-8 rounded-full bg-orange-600/20 items-center justify-center mr-3">
                    <Feather name="help-circle" size={18} color="#ff8c00" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-base font-black mb-1">
                      {title}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleClose} className="ml-2">
                    <Feather name="x" size={18} color="#ff8c00" />
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
