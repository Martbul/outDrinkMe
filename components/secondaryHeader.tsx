import { Text, TouchableOpacity, View } from "react-native";
import BackArrow from "./backArrows";

export default function SecondaryHeader(props: {
  title: string;
  secondActionTitle?: string;
  secondOnPressAction?: () => void;
}) {
  return (
    <View className="relative flex-row items-center p-4 py-6  border-b border-lightNeutralGray">
      <BackArrow />
      <Text className="flex-1 text-center text-lightBlackText font-bold text-2xl">
        {props.title}
      </Text>

      {props.secondActionTitle && (
        <TouchableOpacity
          onPress={props.secondOnPressAction}
          className="absolute right-4"
          style={{ zIndex: 10 }}
        >
          <Text className="text-lightPrimaryAccent font-bold text-lg">
            {props.secondActionTitle}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
