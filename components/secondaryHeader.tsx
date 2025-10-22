import { Text, TouchableOpacity, View } from "react-native";
import BackArrow from "./backArrows";
import Spinner from "./spinner";

export default function SecondaryHeader(props: {
  title: string;
  secondActionTitle?: string;
  secondOnPressAction?: () => void;
  isLoading?: boolean;
}) {
  return (
    <View className="relative flex-row items-center px-4 py-6 border-b border-white/[0.08] bg-black">
      <BackArrow />
      <Text className="flex-1 text-center text-white font-black text-2xl">
        {props.title}
      </Text>

      {/* Right side action area - fixed width to prevent layout shift */}
      <View className="absolute right-4 w-16 items-end" style={{ zIndex: 10 }}>
        {props.isLoading ? (
          <Spinner size="sm" variant="dots" />
        ) : props.secondActionTitle ? (
          <TouchableOpacity onPress={props.secondOnPressAction}>
            <Text className="text-[#ff8c00] font-black text-base uppercase tracking-widest">
              {props.secondActionTitle}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
