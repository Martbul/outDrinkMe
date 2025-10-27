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

interface DrinkingSuccessProps {
  visible: boolean;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
  onClose: () => void;
  style?: any;
}

export default function DrinkingSuccess({
  visible = false,
  title,
  description,
  position = "bottom",
  onClose,
  style,
}: DrinkingSuccessProps) {
  const [layout, setLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const triggerRef = useRef<View>(null);

  useEffect(() => {
    if (visible) {
      triggerRef.current?.measure((fx, fy, width, height, px, py) => {
        setLayout({ x: px, y: py, width, height });
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      });
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const getTooltipPosition = () => {
    const tooltipW = 320;
    const offset = 10;
    const { x, y, width, height } = layout;

    switch (position) {
      case "top":
        return {
          left: x + width / 2 - tooltipW / 2,
          bottom: y - offset,
        };
      case "left":
        return {
          right: x - offset,
          top: y + height / 2 - 60,
        };
      case "right":
        return {
          left: x + width + offset,
          top: y + height / 2 - 60,
        };
      default:
        return {
          left: x + width / 2 - tooltipW / 2,
          top: y + height + offset,
        };
    }
  };

  return (
    <>
      {/* Invisible reference point */}
      <View ref={triggerRef} />

      <Modal visible={visible} transparent animationType="none">
        {/* Tap background to close */}
        <Pressable className="flex-1" onPress={onClose}>
          <Animated.View
            style={[
              {
                position: "absolute",
                width: 320,
                ...getTooltipPosition(),
                transform: [{ scale: scaleAnim }],
              },
              style,
            ]}
          >
            {/* Prevent background tap through */}
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View className="bg-[#1a1a1a] rounded-3xl p-6 border-2 border-orange-500/80 shadow-2xl">
                <View className="flex-row items-center mb-3">
                    <Feather name="check" size={22} color="#ff8c00" />
                  <Text className="text-white text-xl font-extrabold">
                     {" "} Congratulations! 
                  </Text>
                  <TouchableOpacity onPress={onClose} className="ml-auto">
                    <Feather name="x" size={22} color="#ff8c00" />
                  </TouchableOpacity>
                </View>

                <Text className="text-white/80 text-base leading-6 mt-1">
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
