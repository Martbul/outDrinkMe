import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Dimensions,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function GoalSettingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // --- STATE ---
  const [maxDrinks, setMaxDrinks] = useState(5);
  const [daysOut, setDaysOut] = useState(2);
  const [budget, setBudget] = useState("50");

  // Toggles
  const [waterReminders, setWaterReminders] = useState(true);
  const [strictMode, setStrictMode] = useState(false);
  const [photoQuest, setPhotoQuest] = useState(true);

  // Dynamic Intensity Label
  const getIntensityLabel = () => {
    if (maxDrinks <= 3)
      return { text: "CHILL", color: "text-green-500", bg: "bg-green-500" };
    if (maxDrinks <= 7)
      return { text: "BUZZED", color: "text-orange-500", bg: "bg-orange-500" };
    return { text: "RAGER", color: "text-red-500", bg: "bg-red-500" };
  };

  const intensity = getIntensityLabel();

  const handleSave = () => {
    Alert.alert("Goals Updated", "Your party parameters have been set!", [
      { text: "Let's Go", onPress: () => router.back() },
    ]);
  };

  return (
    <View className="flex-1 bg-black">
      {/* --- HEADER --- */}
      <View
        style={{ paddingTop: insets.top + 10 }}
        className="px-6 pb-6 flex-row items-center justify-between border-b border-white/5 bg-[#0a0a0a]"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-black text-xl tracking-wide">
          YOUR GOALS
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}
        className="pt-6"
      >
        {/* --- SECTION 1: LIMITS --- */}
        <View className="mb-2">
          <Text className="text-white/50 font-bold text-xs uppercase mb-3 tracking-widest">
            Tolerance & Limits
          </Text>

          <View className="bg-[#111] rounded-3xl p-5 border border-white/10 mb-4">
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-orange-500/20 rounded-full items-center justify-center mr-3">
                  <MaterialCommunityIcons
                    name="glass-cocktail"
                    size={20}
                    color="#EA580C"
                  />
                </View>
                <View>
                  <Text className="text-white font-bold text-lg">
                    Daily Limit
                  </Text>
                  <Text className="text-white/40 text-xs">
                    Drinks per night
                  </Text>
                </View>
              </View>
              <Text className={`font-black text-2xl ${intensity.color}`}>
                {maxDrinks}
              </Text>
            </View>

            {/* --- CUSTOM JS "SLIDER" (Visual Bar + Buttons) --- */}
            <View className="mb-4">
              {/* Visual Progress Bar */}
              <View className="h-2 bg-white/10 rounded-full w-full overflow-hidden mb-4">
                <View
                  className={`h-full ${intensity.bg}`}
                  style={{ width: `${(maxDrinks / 15) * 100}%` }}
                />
              </View>

              {/* Control Buttons */}
              <View className="flex-row justify-between items-center bg-black/50 p-2 rounded-2xl border border-white/10">
                <TouchableOpacity
                  onPress={() => setMaxDrinks(Math.max(1, maxDrinks - 1))}
                  className="w-12 h-12 bg-white/10 rounded-xl items-center justify-center active:bg-white/20"
                >
                  <Ionicons name="remove" size={24} color="white" />
                </TouchableOpacity>

                <View className="items-center">
                  <Text
                    className={`font-black text-sm tracking-widest ${intensity.color}`}
                  >
                    {intensity.text}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setMaxDrinks(Math.min(15, maxDrinks + 1))}
                  className="w-12 h-12 bg-white/10 rounded-xl items-center justify-center active:bg-white/20"
                >
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row justify-between px-1">
              <Text className="text-white/30 text-[10px] font-bold">1</Text>
              <Text className="text-white/30 text-[10px] font-bold">15</Text>
            </View>
          </View>

          {/* Days Per Week Counter */}
          <View className="bg-[#111] rounded-3xl p-5 border border-white/10 flex-row justify-between items-center">
            <View>
              <Text className="text-white font-bold text-lg">Frequency</Text>
              <Text className="text-white/40 text-xs">Nights out / week</Text>
            </View>

            <View className="flex-row items-center bg-black rounded-full border border-white/10 p-1">
              <TouchableOpacity
                onPress={() => setDaysOut(Math.max(1, daysOut - 1))}
                className="w-10 h-10 bg-white/5 rounded-full items-center justify-center"
              >
                <Ionicons name="remove" size={20} color="white" />
              </TouchableOpacity>

              <Text className="text-white font-black text-xl w-10 text-center">
                {daysOut}
              </Text>

              <TouchableOpacity
                onPress={() => setDaysOut(Math.min(7, daysOut + 1))}
                className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* --- SECTION 2: SIDE QUESTS --- */}
        <View className="mt-6 mb-2">
          <Text className="text-white/50 font-bold text-xs uppercase mb-3 tracking-widest">
            Social Quests
          </Text>

          <View className="bg-[#111] rounded-3xl overflow-hidden border border-white/10">
            {/* Quest Item 1 */}
            <View className="p-5 flex-row items-center justify-between border-b border-white/5">
              <View className="flex-row items-center flex-1 pr-4">
                <View className="w-10 h-10 bg-purple-500/20 rounded-full items-center justify-center mr-3">
                  <Ionicons name="camera" size={20} color="#a855f7" />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">
                    Paparazzi
                  </Text>
                  <Text className="text-white/40 text-xs">
                    Goal: Post 3+ stories per night
                  </Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: "#333", true: "#a855f7" }}
                thumbColor={photoQuest ? "#fff" : "#f4f3f4"}
                onValueChange={setPhotoQuest}
                value={photoQuest}
              />
            </View>

            {/* Quest Item 2 (Budget) */}
            <View className="p-5 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 pr-4">
                <View className="w-10 h-10 bg-green-500/20 rounded-full items-center justify-center mr-3">
                  <FontAwesome5
                    name="money-bill-wave"
                    size={16}
                    color="#22c55e"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-base">
                    Budget Cap
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Text className="text-white/40 text-xs mr-2">
                      Max spend:
                    </Text>
                    <View className="flex-row items-center border-b border-white/20 pb-0.5 w-16">
                      <Text className="text-green-500 font-bold text-sm">
                        $
                      </Text>
                      <TextInput
                        value={budget}
                        onChangeText={setBudget}
                        keyboardType="numeric"
                        className="text-white font-bold text-sm ml-1 p-0 h-5"
                        placeholder="0"
                        placeholderTextColor="#555"
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* --- SECTION 3: HEALTH & HABITS --- */}
        <View className="mt-6">
          <Text className="text-white/50 font-bold text-xs uppercase mb-3 tracking-widest">
            Health & Safety
          </Text>

          <View className="bg-[#111] rounded-3xl p-5 border border-white/10 space-y-6">
            {/* Water Toggle */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 pr-4">
                <View className="w-10 h-10 bg-blue-500/20 rounded-full items-center justify-center mr-3">
                  <Ionicons name="water" size={20} color="#3b82f6" />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">
                    Hydro Homie
                  </Text>
                  <Text className="text-white/40 text-xs">
                    Hourly water reminders
                  </Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: "#333", true: "#3b82f6" }}
                thumbColor={waterReminders ? "#fff" : "#f4f3f4"}
                onValueChange={setWaterReminders}
                value={waterReminders}
              />
            </View>

            {/* Strict Mode Toggle */}
            <View className="flex-row items-center justify-between mt-4">
              <View className="flex-row items-center flex-1 pr-4">
                <View className="w-10 h-10 bg-red-500/20 rounded-full items-center justify-center mr-3">
                  <Ionicons name="alert-circle" size={22} color="#ef4444" />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">
                    Strict Mode
                  </Text>
                  <Text className="text-white/40 text-xs">
                    Lock app after limit reached
                  </Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: "#333", true: "#ef4444" }}
                thumbColor={strictMode ? "#fff" : "#f4f3f4"}
                onValueChange={setStrictMode}
                value={strictMode}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* --- SAVE BUTTON --- */}
      <View
        className="absolute bottom-0 w-full px-6 pt-4 bg-[#0a0a0a] border-t border-white/5"
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        <TouchableOpacity onPress={handleSave}>
          <LinearGradient
            colors={["#EA580C", "#C2410C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="w-full py-4 rounded-2xl items-center shadow-lg shadow-orange-900/20"
          >
            <Text className="text-white font-black text-base tracking-widest">
              SAVE GOALS
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}
