import { onBackPress } from "@/utils/navigation";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
type NestedScreenHeaderProps = {
  heading: string;
  secondaryHeading: string;
  buttonHeading?: string;
  buttonAction?: () => void;
};

export default function NestedScreenHeader({
  heading,
  secondaryHeading,
  buttonHeading,
  buttonAction,
}: NestedScreenHeaderProps) {
  return (
          <View className="px-4 pt-4 border-b border-white/[0.08]">

    <View className="flex-row items-center mb-4">
      <TouchableOpacity
        onPress={onBackPress}
        className="w-10 h-10 rounded-xl bg-white/[0.03] items-center justify-center border border-white/[0.08] mr-3"
      >
        <Feather name="arrow-left" size={22} color="#999999" />
      </TouchableOpacity>

      <View className="flex-1">
        <Text className="text-orange-600 text-[11px] font-bold tracking-widest">
          {secondaryHeading}
        </Text>
        <Text className="text-white text-3xl font-black">{heading}</Text>
      </View>

      {buttonHeading && (
        <TouchableOpacity
          onPress={buttonAction}
          className="bg-orange-600/20 px-3 py-2 rounded-xl border border-orange-600/40"
        >
          <Text className="text-orange-600 text-[11px] font-bold">
            {buttonHeading}
          </Text>
        </TouchableOpacity>
      )}
    </View>
    </View>
  );
}
