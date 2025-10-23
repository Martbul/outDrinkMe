import { Link, Stack } from "expo-router";
import { Image } from "react-native";
import { View, Text, TouchableOpacity } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center p-5 bg-black">
        {/* 404 Icon */}
        <View className="mb-8">
          <Image
            source={require("../assets/images/icon.png")}
            className="w-56 h-56 rounded-full border-3 border-white"
          />
        </View>

        {/* Title */}
        <Text className="text-white text-3xl font-black text-center mb-4">
          404
        </Text>

        {/* Message */}
        <Text className="text-white/70 text-lg text-center mb-2">
          This screen does not exist.
        </Text>

        <Text className="text-white/50 text-sm text-center mb-8">
          Looks like you've had one too many! 🥴
        </Text>

        {/* Go Home Button */}
        <Link href="/" asChild>
          <TouchableOpacity className="bg-orange-600 rounded-2xl py-4 px-8 mt-4">
            <Text className="text-black text-base font-black tracking-wider">
              GO TO HOME
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}
