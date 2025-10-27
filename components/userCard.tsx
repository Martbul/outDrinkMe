import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { UserData } from "@/types/api.types";
import { AntDesign, Ionicons } from "@expo/vector-icons";

interface UserCardProps {
  user: UserData;
  onPress: () => void;
  rightAction?: {
    loading?: boolean;
    onAction: () => void;
    icon?: "add" | "arrow";
  };
}

export function UserCard({ user, onPress, rightAction }: UserCardProps) {
  return (

    <TouchableOpacity
      onPress={onPress}
      className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] flex-row items-center mb-3"
    >
      <View className="w-14 h-14 rounded-full bg-orange-600 items-center justify-center mr-4">
        {user.imageUrl ? (
          <Image
            source={{ uri: user.imageUrl }}
            className="w-full h-full rounded-full"
          />
        ) : (
          <Text className="text-black text-2xl font-black">
            {user.username?.[0]?.toUpperCase() || "?"}
          </Text>
        )}
      </View>
      <View className="flex-1">
        <Text className="text-white text-lg font-bold mb-1">
          {user.username || "Unknown User"}
        </Text>
        {(user.firstName || user.lastName) && (
          <Text className="text-white/50 text-sm font-semibold">
            {[user.firstName, user.lastName].filter(Boolean).join(" ")}
          </Text>
        )}
      </View>

      {rightAction && (
        <>
          {rightAction.loading ? (
            <ActivityIndicator size="small" color="#f97316" />
          ) : rightAction.icon === "add" ? (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                rightAction.onAction();
              }}
              className="w-10 h-10 rounded-xl bg-orange-600/20 items-center justify-center border border-orange-600/50"
            >
              <Ionicons name="person-add" size={20} color="#ff8c00" />
            </TouchableOpacity>
          ) : (
            <AntDesign name="right" size={20} color="#6B7280" />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
