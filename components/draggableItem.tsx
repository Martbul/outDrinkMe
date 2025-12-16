import React from "react";
import { View, Image, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import { CanvasItem } from "@/types/api.types";

interface DraggableItemProps {
  item: CanvasItem;
  onUpdate: (id: string, updates: Partial<CanvasItem>) => void;
}

export const DraggableItem = ({ item, onUpdate }: DraggableItemProps) => {
  const translateX = useSharedValue(item.pos_x);
  const translateY = useSharedValue(item.pos_y);
  const scale = useSharedValue(item.scale);
  const rotation = useSharedValue(item.rotation);
  const isActive = useSharedValue(false);

  const context = useSharedValue({ x: 0, y: 0, scale: 1, rotation: 0 });

  const pan = Gesture.Pan()
    .onStart(() => {
      isActive.value = true;
      context.value = {
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
        rotation: rotation.value,
      };
    })
    .onUpdate((e) => {
      translateX.value = context.value.x + e.translationX;
      translateY.value = context.value.y + e.translationY;
    })
    .onEnd(() => {
      isActive.value = false;
      runOnJS(onUpdate)(item.id, {
        pos_x: translateX.value,
        pos_y: translateY.value,
      });
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
      context.value = { ...context.value, scale: scale.value };
    })
    .onUpdate((e) => {
      scale.value = context.value.scale * e.scale;
    })
    .onEnd(() => {
      runOnJS(onUpdate)(item.id, { scale: scale.value });
    });

  const rotate = Gesture.Rotation()
    .onStart(() => {
      context.value = { ...context.value, rotation: rotation.value };
    })
    .onUpdate((e) => {
      const degChange = (e.rotation * 180) / Math.PI;
      rotation.value = context.value.rotation + degChange;
    })
    .onEnd(() => {
      runOnJS(onUpdate)(item.id, { rotation: rotation.value });
    });

  const gesture = Gesture.Simultaneous(pan, pinch, rotate);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    zIndex: isActive.value ? 999 : item.z_index,
    shadowOpacity: isActive.value ? 0.3 : 0,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  }));

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: isActive.value ? "#ff8c00" : "transparent",
    borderWidth: isActive.value ? 2 : 0,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          { position: "absolute", width: item.width, height: item.height },
          animatedStyle,
        ]}
      >
        <Animated.View style={[{ flex: 1 }, borderStyle]}>
          {item.item_type === "image" && (
            <View
              className="bg-white shadow-xl border border-black/5"
              style={{
                flex: 1,
                padding: item.width * 0.03,
                paddingBottom: item.width * 0.15,
              }}
            >
              <Image
                source={{ uri: item.content }}
                className="w-full h-full bg-zinc-100"
                resizeMode="cover"
              />
              <Text
                className="absolute left-3 text-gray-400 font-bold uppercase tracking-widest"
                style={{
                  bottom: item.width * 0.04,
                  fontSize: item.width * 0.035,
                }}
              >
                {item.author_name}
              </Text>
            </View>
          )}

          {item.item_type === "sticker" && (
            <Text
              style={{ fontSize: item.width, textAlign: "center" }}
              className="shadow-sm"
            >
              {item.content}
            </Text>
          )}

          {item.item_type === "text" && (
            <Text
              className="text-black font-black text-center"
              style={{ fontSize: item.width / 4, width: item.width }}
            >
              {item.content}
            </Text>
          )}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};
