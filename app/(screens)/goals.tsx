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
import Svg, { Path } from "react-native-svg";
import NestedScreenHeader from "@/components/nestedScreenHeader";

const { width } = Dimensions.get("window");

export default function GoalSettingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // --- STATE ---
  const [maxDrinks, setMaxDrinks] = useState(5);
  const [drunkDaysGoal, setDrunkDaysGoal] = useState(45);
  const [blackoutGoal, setBlackoutGoal] = useState(0);
  const [streakGoal, setStreakGoal] = useState(14);
  
  // Toggles
  const [waterReminders, setWaterReminders] = useState(true);
  const [strictMode, setStrictMode] = useState(false);

  // Success Rate (Mock data for speedometer)
  const successPercentage = 84;

  const handleSave = () => {
    Alert.alert("Goals Updated", "Your annual targets have been locked.", [
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  // --- SPEEDOMETER COMPONENT ---
  const Speedometer = ({ percentage }: { percentage: number }) => {
    const radius = 70;
    const strokeWidth = 10;
    const circumference = Math.PI * radius; // Half circle
    const progress = (percentage / 100) * circumference;

    return (
      <View className="items-center justify-center py-4">
        <Svg height="100" width="180" viewBox="0 0 180 100">
          {/* Background Track */}
          <Path
            d="M 20 90 A 70 70 0 0 1 160 90"
            fill="none"
            stroke="#ffffff10"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress Path */}
          <Path
            d="M 20 90 A 70 70 0 0 1 160 90"
            fill="none"
            stroke="#EA580C"
            strokeWidth={strokeWidth}
            strokeDasharray={`${progress}, ${circumference}`}
            strokeLinecap="round"
          />
        </Svg>
        <View className="absolute bottom-2 items-center">
          <Text className="text-white text-3xl font-black">{percentage}%</Text>
          <Text className="text-orange-600 text-[10px] font-bold tracking-widest uppercase">
            YEARLY SUCCESS
          </Text>
        </View>
      </View>
    );
  };

  // --- CUSTOM COUNTER COMPONENT ---
  const CounterRow = ({ 
    label, 
    subLabel, 
    value, 
    onAdd, 
    onRemove, 
    icon 
  }: any) => (
    <View className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] mb-3 flex-row justify-between items-center">
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-orange-600/10 rounded-xl items-center justify-center mr-3">
          {icon}
        </View>
        <View>
          <Text className="text-white font-black text-base">{label}</Text>
          <Text className="text-white/40 text-[10px] font-bold uppercase tracking-tight">{subLabel}</Text>
        </View>
      </View>
      <View className="flex-row items-center bg-black/40 rounded-xl border border-white/[0.05] p-1">
        <TouchableOpacity onPress={onRemove} className="w-8 h-8 items-center justify-center">
          <Ionicons name="remove" size={20} color="#EA580C" />
        </TouchableOpacity>
        <View className="px-3 min-w-[40px] items-center">
          <Text className="text-white font-black text-lg">{value}</Text>
        </View>
        <TouchableOpacity onPress={onAdd} className="w-8 h-8 items-center justify-center">
          <Ionicons name="add" size={20} color="#EA580C" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-black">
      <NestedScreenHeader heading="Goals" secondaryHeading="ACCOUNTABILITY" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        className="px-4 pt-4"
      >
        {/* --- SECTION 1: SPEEDOMETER --- */}
        <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-6">
          <View className="flex-row justify-between items-start mb-2">
            <View>
              <Text className="text-orange-600 text-[11px] font-bold tracking-widest uppercase">
                Performance
              </Text>
              <Text className="text-white text-2xl font-black">2024 Track</Text>
            </View>
            <View className="bg-orange-600/20 px-3 py-1 rounded-lg">
              <Text className="text-orange-600 font-black text-xs">ELITE</Text>
            </View>
          </View>
          
          <Speedometer percentage={successPercentage} />
          
          <View className="flex-row justify-between mt-4 pt-4 border-t border-white/[0.05]">
            <View className="items-center flex-1">
              <Text className="text-white font-black">284</Text>
              <Text className="text-white/40 text-[9px] font-bold uppercase">Safe Days</Text>
            </View>
            <View className="items-center flex-1 border-x border-white/[0.05]">
              <Text className="text-orange-600 font-black">12</Text>
              <Text className="text-white/40 text-[9px] font-bold uppercase">Streaks</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-white font-black">0</Text>
              <Text className="text-white/40 text-[9px] font-bold uppercase">Lapses</Text>
            </View>
          </View>
        </View>

        {/* --- SECTION 2: ANNUAL TARGETS --- */}
        <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-3 uppercase px-1">
          Annual Limits
        </Text>

        <CounterRow
          label="Drunk Days"
          subLabel="Max allowed per year"
          value={drunkDaysGoal}
          onAdd={() => setDrunkDaysGoal(prev => prev + 1)}
          onRemove={() => setDrunkDaysGoal(prev => Math.max(0, prev - 1))}
          icon={<FontAwesome5 name="beer" size={16} color="#EA580C" />}
        />

        <CounterRow
          label="Blackout Goal"
          subLabel="Zero is the hero"
          value={blackoutGoal}
          onAdd={() => setBlackoutGoal(prev => prev + 1)}
          onRemove={() => setBlackoutGoal(prev => Math.max(0, prev - 1))}
          icon={<MaterialCommunityIcons name="skull" size={20} color="#EA580C" />}
        />

        <CounterRow
          label="Dry Streak"
          subLabel="Longest consecutive days"
          value={streakGoal}
          onAdd={() => setStreakGoal(prev => prev + 1)}
          onRemove={() => setStreakGoal(prev => Math.max(0, prev - 1))}
          icon={<Ionicons name="flame" size={20} color="#EA580C" />}
        />

        {/* --- SECTION 3: SESSION LIMITS --- */}
        <View className="mt-4">
          <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-3 uppercase px-1">
            Session Controls
          </Text>

          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-4">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-white font-black text-lg">Daily Limit</Text>
                <Text className="text-white/40 text-[10px] font-bold uppercase">Max drinks per night</Text>
              </View>
              <View className="bg-orange-600 px-3 py-1 rounded-lg">
                <Text className="text-black font-black text-xl">{maxDrinks}</Text>
              </View>
            </View>

            <View className="h-1.5 bg-white/[0.05] rounded-full w-full overflow-hidden mb-6">
              <View
                className="h-full bg-orange-600"
                style={{ width: `${(maxDrinks / 15) * 100}%` }}
              />
            </View>

            <View className="flex-row justify-between gap-4">
              <TouchableOpacity
                onPress={() => setMaxDrinks(Math.max(1, maxDrinks - 1))}
                className="flex-1 bg-white/[0.05] py-4 rounded-xl items-center border border-white/[0.08]"
              >
                <Ionicons name="remove" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setMaxDrinks(Math.min(15, maxDrinks + 1))}
                className="flex-1 bg-orange-600 py-4 rounded-xl items-center"
              >
                <Ionicons name="add" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* --- SECTION 4: TOGGLES --- */}
        <View className="bg-white/[0.03] rounded-2xl border border-white/[0.08] overflow-hidden">
            <View className="p-4 flex-row items-center justify-between border-b border-white/[0.05]">
                <View className="flex-1">
                    <Text className="text-white font-black text-base">Hydro Homie</Text>
                    <Text className="text-white/40 text-[10px] font-bold uppercase">Water reminders</Text>
                </View>
                <Switch
                    trackColor={{ false: "#333", true: "#EA580C" }}
                    thumbColor="white"
                    onValueChange={setWaterReminders}
                    value={waterReminders}
                />
            </View>
            <View className="p-4 flex-row items-center justify-between">
                <View className="flex-1">
                    <Text className="text-white font-black text-base">Strict Mode</Text>
                    <Text className="text-white/40 text-[10px] font-bold uppercase">Lock app at limit</Text>
                </View>
                <Switch
                    trackColor={{ false: "#333", true: "#EA580C" }}
                    thumbColor="white"
                    onValueChange={setStrictMode}
                    value={strictMode}
                />
            </View>
        </View>
      </ScrollView>

      {/* --- SAVE BUTTON --- */}
      <View
        className="absolute bottom-0 w-full px-6 pt-4 bg-black border-t border-white/5"
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        <TouchableOpacity onPress={handleSave}>
          <View className="bg-orange-600 py-4 rounded-2xl items-center shadow-lg">
            <Text className="text-black font-black text-base tracking-widest">
              SAVE GOALS
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}