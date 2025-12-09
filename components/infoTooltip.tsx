// import React, { useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Modal,
//   Pressable,
//   Animated,
// } from "react-native";
// import { Feather } from "@expo/vector-icons";

// interface InfoTooltipProps {
//   visible: boolean;
//   title: string;
//   description: string;
//   iconSize?: number;
//   position?: "top" | "bottom" | "left" | "right";
//   onClose: () => void;
// }

// export default function InfoTooltip({
//   visible = false,
//   title,
//   description,
//   iconSize = 18,
//   position = "bottom",
//   onClose,
// }: InfoTooltipProps) {
//   const [buttonLayout, setButtonLayout] = useState({
//     x: 0,
//     y: 0,
//     width: 0,
//     height: 0,
//   });
//   const scaleAnim = useRef(new Animated.Value(0)).current;
//   const buttonRef = useRef<View>(null);

//   useEffect(() => {
//     if (visible) {
//       buttonRef.current?.measure((fx, fy, width, height, px, py) => {
//         setButtonLayout({ x: px, y: py, width, height });
//         Animated.spring(scaleAnim, {
//           toValue: 1,
//           useNativeDriver: true,
//           tension: 100,
//           friction: 8,
//         }).start();
//       });
//     } else {
//       Animated.timing(scaleAnim, {
//         toValue: 0,
//         duration: 200,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [visible]);

//   const handleClose = () => {
//     onClose();
//   };

//   const getTooltipPosition = () => {
//     const { x, y, width, height } = buttonLayout;
//     const tooltipWidth = 280;
//     const tooltipOffset = 8;

//     switch (position) {
//       case "top":
//         return {
//           left: x + width / 2 - tooltipWidth / 2,
//           bottom: y - tooltipOffset,
//           transform: [{ translateY: 0 }],
//         };
//       case "bottom":
//         return {
//           left: x + width / 2 - tooltipWidth / 2,
//           top: y + height + tooltipOffset,
//         };
//       case "left":
//         return {
//           right: x - tooltipOffset,
//           top: y + height / 2,
//           transform: [{ translateY: -50 }],
//         };
//       case "right":
//         return {
//           left: x + width + tooltipOffset,
//           top: y + height / 2,
//           transform: [{ translateY: -50 }],
//         };
//       default:
//         return {
//           left: x + width / 2 - tooltipWidth / 2,
//           top: y + height + tooltipOffset,
//         };
//     }
//   };

//   const getArrowPosition = () => {
//     const tooltipWidth = 280;
//     const arrowSize = 8;

//     switch (position) {
//       case "top":
//         return {
//           bottom: -arrowSize,
//           left: tooltipWidth / 2 - arrowSize,
//           borderLeftWidth: arrowSize,
//           borderRightWidth: arrowSize,
//           borderTopWidth: arrowSize,
//           borderLeftColor: "transparent",
//           borderRightColor: "transparent",
//           borderTopColor: "#1a1a1a",
//         } as const;
//       case "bottom":
//         return {
//           top: -arrowSize,
//           left: tooltipWidth / 2 - arrowSize,
//           borderLeftWidth: arrowSize,
//           borderRightWidth: arrowSize,
//           borderBottomWidth: arrowSize,
//           borderLeftColor: "transparent",
//           borderRightColor: "transparent",
//           borderBottomColor: "#1a1a1a",
//         } as const;
//       case "left":
//         return {
//           right: -arrowSize,
//           top: 0,
//           borderTopWidth: arrowSize,
//           borderBottomWidth: arrowSize,
//           borderLeftWidth: arrowSize,
//           borderTopColor: "transparent",
//           borderBottomColor: "transparent",
//           borderLeftColor: "#1a1a1a",
//         } as const;
//       case "right":
//         return {
//           left: -arrowSize,
//           top: 0,
//           borderTopWidth: arrowSize,
//           borderBottomWidth: arrowSize,
//           borderRightWidth: arrowSize,
//           borderTopColor: "transparent",
//           borderBottomColor: "transparent",
//           borderRightColor: "#1a1a1a",
//         } as const;
//     }
//   };

//   return (
//     <>
//       {/* Info Icon Button */}
//       <TouchableOpacity
//         ref={buttonRef}
//         className=" items-center justify-center"
//       ></TouchableOpacity>

//       {/* Tooltip Modal */}
//       <Modal
//         visible={visible}
//         transparent
//         animationType="none"
//         onRequestClose={handleClose}
//       >
//         <Pressable className="flex-1" onPress={handleClose}>
//           <Animated.View
//             style={[
//               {
//                 position: "absolute",
//                 width: 280,
//                 ...getTooltipPosition(),
//                 transform: [
//                   { scale: scaleAnim },
//                   ...(getTooltipPosition().transform || []),
//                 ],
//               },
//             ]}
//           >
//             <Pressable>
//               <View className="bg-[#1a1a1a] rounded-2xl p-4 border-2 border-orange-600/30 shadow-2xl">
//                 {/* Arrow */}
//                 <View
//                   style={[
//                     {
//                       position: "absolute",
//                       width: 0,
//                       height: 0,
//                     },
//                     getArrowPosition(),
//                   ]}
//                 />

//                 {/* Content */}
//                 <View className="flex-row items-start">
//                   <View className="w-8 h-8 rounded-full bg-orange-600/20 items-center justify-center mr-3">
//                     <Feather name="help-circle" size={18} color="#ff8c00" />
//                   </View>
//                   <View className="flex-1">
//                     <Text className="text-white text-base font-black mb-1">
//                       {title}
//                     </Text>
//                   </View>
//                   <TouchableOpacity onPress={handleClose} className="ml-2">
//                     <Feather name="x" size={18} color="#ff8c00" />
//                   </TouchableOpacity>
//                 </View>

//                 <Text className="text-white/70 text-sm leading-5 pl-11">
//                   {description}
//                 </Text>
//               </View>
//             </Pressable>
//           </Animated.View>
//         </Pressable>
//       </Modal>
//     </>
//   );
// }

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface InfoTooltipProps {
  visible: boolean;
  title: string;
  description: string;
  onClose: () => void;
  // Added children so we can wrap the icon to measure it correctly
  children?: React.ReactNode;
}

export default function InfoTooltip({
  visible = false,
  title,
  description,
  onClose,
  children, // The icon/button you want to click
}: InfoTooltipProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [buttonLayout, setButtonLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    px: 0,
    py: 0,
  });

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const buttonRef = useRef<TouchableOpacity>(null);

  // Measure the button position when visible changes
  useEffect(() => {
    if (visible && buttonRef.current) {
      // Use measureInWindow or measure to get absolute coordinates
      buttonRef.current.measure((fx, fy, width, height, px, py) => {
        setButtonLayout({ x: px, y: py, width, height, px, py });

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
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    // Animate out before calling onClose
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  // CONSTANTS
  const MAX_TOOLTIP_WIDTH = 300;
  const SCREEN_PADDING = 16;
  const ARROW_SIZE = 10;

  // Calculate dynamic width based on device
  const tooltipWidth = Math.min(
    MAX_TOOLTIP_WIDTH,
    screenWidth - SCREEN_PADDING * 2
  );

  const getCalculatedPositions = () => {
    const { px, py, width, height } = buttonLayout;

    // 1. Calculate ideal Left position (centered relative to button)
    let left = px + width / 2 - tooltipWidth / 2;

    // 2. Clamp values to keep tooltip on screen
    if (left < SCREEN_PADDING) {
      left = SCREEN_PADDING;
    } else if (left + tooltipWidth > screenWidth - SCREEN_PADDING) {
      left = screenWidth - SCREEN_PADDING - tooltipWidth;
    }

    // 3. Default Top position (Bottom placement)
    let top = py + height + ARROW_SIZE;

    // 4. Check if tooltip goes off bottom of screen, flip to top if needed
    // (Optional logic: if (top + height > screenHeight) top = py - tooltipHeight...)

    // 5. Calculate Arrow X position relative to the Tooltip Box
    // The arrow must point to the center of the button (px + width/2)
    // Relative position = TargetCenter - TooltipLeft - ArrowHalfSize
    const arrowLeftPosition = px + width / 2 - left - ARROW_SIZE;

    return {
      modalStyle: {
        top,
        left,
        width: tooltipWidth,
      },
      arrowStyle: {
        left: arrowLeftPosition,
      },
    };
  };

  const { modalStyle, arrowStyle } = getCalculatedPositions();

  return (
    <>
      {/* 
        The Trigger Element. 
        We render this so we can measure it via ref.
        If children is passed, use that. Otherwise render an empty hit box (legacy support).
      */}
      <TouchableOpacity
        ref={buttonRef}
        onPress={() => {}} // Pass open logic here if needed, or handle in parent
        activeOpacity={1}
      >
        {children || <View style={{ width: 1, height: 1 }} />}
      </TouchableOpacity>

      {/* Tooltip Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
          <Animated.View
            style={[
              {
                position: "absolute",
                ...modalStyle,
                transform: [
                  { scale: scaleAnim },
                  // Adjust origin so it scales from the arrow position
                  { translateY: 0 },
                ],
              },
            ]}
          >
            {/* Prevent closing when clicking inside the tooltip */}
            <Pressable>
              <View className="bg-[#1a1a1a] rounded-2xl p-4 border-2 border-orange-600/30 shadow-2xl">
                {/* Dynamic Arrow */}
                <View style={[styles.arrow, { left: arrowStyle.left }]} />

                {/* Content */}
                <View className="flex-row items-start">
                  <View className="w-8 h-8 rounded-full bg-orange-600/20 items-center justify-center mr-3 shrink-0">
                    <Feather name="help-circle" size={18} color="#ff8c00" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-base font-black mb-1">
                      {title}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleClose} className="ml-2 p-1">
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

// Needed pure styles for the arrow triangle logic
const styles = StyleSheet.create({
  arrow: {
    position: "absolute",
    top: -10, // Negative of borderBottomWidth
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderStyle: "solid",
    backgroundColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#1a1a1a", // Match background color
    zIndex: 10,
  },
});