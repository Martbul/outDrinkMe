import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { UserData } from "@/types/api.types";
import { AntDesign } from "@expo/vector-icons";

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
      className="bg-white/[0.03] rounded-2xl p-4 border border-gray-800 flex-row items-center mb-3"
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

      {/* User Info */}
      <View className="flex-1">
        <Text className="text-white text-lg font-bold mb-1">
          {user.username || "Unknown User"}
        </Text>
        {(user.firstName || user.lastName) && (
          <Text className="text-gray-500 text-sm">
            {[user.firstName, user.lastName].filter(Boolean).join(" ")}
          </Text>
        )}
        {user.username && (
          <Text className="text-gray-600 text-xs mt-0.5">{user.username}</Text>
        )}
      </View>

      {/* Right Action */}
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
            >
              <AntDesign name="user-add" size={24} color="#ff8c00" />
            </TouchableOpacity>
          ) : (
            <AntDesign name="right" size={20} color="#6B7280" />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
