import React from "react";
import { View, Text, ScrollView } from "react-native";

export default function BattleScreen() {
  return (
    <ScrollView className="flex-1 bg-black px-5 pt-5">
      <View className="items-center mb-8">
        <Text className="text-3xl font-black text-orange-600 uppercase mb-2">
          ⚔️ BATTLE MODE ⚔️
        </Text>
        <Text className="text-orange-400 text-xs uppercase tracking-widest">
          Live Competition
        </Text>
      </View>

      {/* Battle Arena */}
      <View className="bg-orange-600/15 rounded-3xl p-10 mb-8 border-4 border-orange-600/50 relative">
        <View className="absolute top-3 right-3 bg-orange-600 rounded-full px-4 py-2">
          <Text className="text-black text-xs font-black uppercase tracking-wide">
            🏆 WINNING
          </Text>
        </View>

        {/* Fighter 1 */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white text-lg font-bold">
              🔥 Mike (Leader)
            </Text>
            <Text className="text-orange-400 text-2xl font-black">6/7</Text>
          </View>
          <View className="w-full h-5 bg-black/50 rounded-full overflow-hidden border-2 border-orange-600/30">
            <View
              className="h-full bg-orange-600 rounded-full"
              style={{ width: "86%" }}
            />
          </View>
        </View>

        {/* Fighter 2 */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white text-lg font-bold">💪 You</Text>
            <Text className="text-orange-400 text-2xl font-black">5/7</Text>
          </View>
          <View className="w-full h-5 bg-black/50 rounded-full overflow-hidden border-2 border-orange-600/30">
            <View
              className="h-full bg-orange-600 rounded-full"
              style={{ width: "71%" }}
            />
          </View>
        </View>

        {/* Fighter 3 */}
        <View>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white text-lg font-bold">Sarah</Text>
            <Text className="text-orange-400 text-2xl font-black">4/7</Text>
          </View>
          <View className="w-full h-5 bg-black/50 rounded-full overflow-hidden border-2 border-orange-600/30">
            <View
              className="h-full bg-orange-600 rounded-full"
              style={{ width: "57%" }}
            />
          </View>
        </View>
      </View>

      {/* Opponent Cards */}
      <View className="gap-4 mb-24">
        <View className="bg-orange-600/10 rounded-2xl p-5 border-2 border-orange-600/30 flex-row items-center gap-4">
          <View className="w-16 h-16 rounded-full bg-orange-600 items-center justify-center">
            <Text className="text-white text-3xl font-black">M</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white text-lg font-bold mb-1">Mike</Text>
            <Text className="text-gray-600 text-xs">🔥 On fire today!</Text>
          </View>
          <View className="items-end">
            <Text className="text-orange-600 text-2xl font-black">+1</Text>
            <Text className="text-gray-600 text-xs uppercase">Ahead</Text>
          </View>
        </View>

        <View className="bg-orange-600/10 rounded-2xl p-5 border-2 border-orange-600/30 flex-row items-center gap-4">
          <View className="w-16 h-16 rounded-full bg-orange-600 items-center justify-center">
            <Text className="text-white text-3xl font-black">S</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white text-lg font-bold mb-1">Sarah</Text>
            <Text className="text-gray-600 text-xs">Right behind you</Text>
          </View>
          <View className="items-end">
            <Text className="text-orange-600 text-2xl font-black">-1</Text>
            <Text className="text-gray-600 text-xs uppercase">Behind</Text>
          </View>
        </View>

        <View className="bg-orange-600/10 rounded-2xl p-5 border-2 border-orange-600/30 flex-row items-center gap-4">
          <View className="w-16 h-16 rounded-full bg-orange-600 items-center justify-center">
            <Text className="text-white text-3xl font-black">J</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white text-lg font-bold mb-1">Jake</Text>
            <Text className="text-gray-600 text-xs">Catching up fast</Text>
          </View>
          <View className="items-end">
            <Text className="text-orange-600 text-2xl font-black">-2</Text>
            <Text className="text-gray-600 text-xs uppercase">Behind</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
