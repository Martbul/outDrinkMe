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
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import NestedScreenHeader from "@/components/nestedScreenHeader";

const { width } = Dimensions.get("window");

export default function GoalSettingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // --- STATE ---
  const [maxDrinks, setMaxDrinks] = useState(5);
  
  // Annual Targets
  const [drunkDaysGoal, setDrunkDaysGoal] = useState(45);
  const [currentDrunkDays, setCurrentDrunkDays] = useState(12); // Mock current progress

  const [blackoutGoal, setBlackoutGoal] = useState(0);
  const [currentBlackouts, setCurrentBlackouts] = useState(0);

  const [streakGoal, setStreakGoal] = useState(30);
  const [currentStreak, setCurrentStreak] = useState(14);

  // Toggles
  const [waterReminders, setWaterReminders] = useState(true);
  const [strictMode, setStrictMode] = useState(false);

  // Modal State for "Big Number" Input
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<{ title: string; val: number; setVal: (n: number) => void } | null>(null);
  const [tempInputValue, setTempInputValue] = useState("");

  // Success Rate (Mock data for speedometer)
  const successPercentage = 84;

  const handleSave = () => {
    Alert.alert("Goals Updated", "Your annual targets have been locked.", [
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  const openEditModal = (title: string, val: number, setVal: (n: number) => void) => {
    setEditingGoal({ title, val, setVal });
    setTempInputValue(val.toString());
    setModalVisible(true);
  };

  const saveModalValue = () => {
    if (editingGoal) {
      const num = parseInt(tempInputValue, 10);
      if (!isNaN(num) && num >= 0) {
        editingGoal.setVal(num);
      }
    }
    setModalVisible(false);
  };

  // --- COMPONENT: SPEEDOMETER ---
  const Speedometer = ({ percentage }: { percentage: number }) => {
    const radius = 70;
    const strokeWidth = 10;
    const circumference = Math.PI * radius; 
    const progress = (percentage / 100) * circumference;

    return (
      <View className="items-center justify-center py-4">
        <Svg height="100" width="180" viewBox="0 0 180 100">
          <Path
            d="M 20 90 A 70 70 0 0 1 160 90"
            fill="none"
            stroke="#ffffff10"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
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

  // --- COMPONENT: ENHANCED GOAL CARD (Percentage + Input) ---
  const EnhancedGoalCard = ({ 
    label, 
    subLabel, 
    target, 
    current, 
    onPressEdit, 
    icon,
    isLimit = true // true implies "don't exceed", false implies "reach this"
  }: any) => {
    // Calculate percentage
    const percent = Math.min(100, Math.max(0, (current / (target || 1)) * 100));
    const progressColor = isLimit 
      ? (percent > 80 ? "bg-red-500" : "bg-orange-600") 
      : "bg-green-500";

    return (
      <TouchableOpacity 
        onPress={onPressEdit}
        className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] mb-3"
      >
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-orange-600/10 rounded-xl items-center justify-center mr-3">
              {icon}
            </View>
            <View>
              <Text className="text-white font-black text-base">{label}</Text>
              <Text className="text-white/40 text-[10px] font-bold uppercase tracking-tight">{subLabel}</Text>
            </View>
          </View>
          
          <View className="items-end">
            <View className="flex-row items-baseline">
                <Text className="text-white font-black text-2xl">{target}</Text>
                <Text className="text-white/40 text-xs font-bold ml-1">GOAL</Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="w-full">
            <View className="flex-row justify-between mb-1">
                <Text className="text-white/40 text-[10px] font-bold uppercase">
                    {current} Current
                </Text>
                <Text className="text-white/40 text-[10px] font-bold uppercase">
                    {Math.round(percent)}%
                </Text>
            </View>
            <View className="h-2 bg-white/10 rounded-full overflow-hidden">
                <View 
                    className={`h-full rounded-full ${progressColor}`} 
                    style={{ width: `${percent}%` }}
                />
            </View>
        </View>
      </TouchableOpacity>
    );
  };

  // --- COMPONENT: BUDDY CHALLENGE (Dual Goals) ---
  const BuddyChallengeCard = () => (
    <View className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-0 border border-orange-600/30 mb-6 overflow-hidden relative">
        {/* Decorative Background */}
        <View className="absolute right-0 top-0 opacity-20">
            <Ionicons name="trophy" size={120} color="#EA580C" />
        </View>

        <View className="p-5">
            <View className="flex-row justify-between items-center mb-4">
                <View>
                    <Text className="text-orange-500 font-bold text-[10px] tracking-widest uppercase">Social Accountability</Text>
                    <Text className="text-white font-black text-lg">Buddy Challenge</Text>
                </View>
                <View className="bg-orange-600/20 px-2 py-1 rounded border border-orange-600/50">
                    <Text className="text-orange-500 font-black text-[10px] uppercase">Active Bet</Text>
                </View>
            </View>

            {/* Duel Rows */}
            <View className="space-y-4">
                {/* User */}
                <View>
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-white font-bold text-xs">You</Text>
                        <Text className="text-white font-bold text-xs">14 Days</Text>
                    </View>
                    <View className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <View className="h-full bg-orange-500 w-[45%]" />
                    </View>
                </View>

                {/* Buddy */}
                <View>
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-white/60 font-bold text-xs">Mike (Buddy)</Text>
                        <Text className="text-white/60 font-bold text-xs">18 Days</Text>
                    </View>
                    <View className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <View className="h-full bg-blue-500 w-[60%]" />
                    </View>
                </View>
            </View>

            <TouchableOpacity className="mt-4 flex-row items-center justify-center bg-white/5 py-3 rounded-xl border border-white/10">
                <MaterialCommunityIcons name="handshake" size={18} color="white" />
                <Text className="text-white font-bold ml-2 text-xs uppercase">View Bet Details</Text>
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
              <Text className="text-white text-2xl font-black">2025 Track</Text>
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

        {/* --- SECTION 2: BUDDY CHALLENGE (NEW) --- */}
        <BuddyChallengeCard />

        {/* --- SECTION 3: ANNUAL TARGETS (ENHANCED) --- */}
        <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-3 uppercase px-1">
          Annual Limits
        </Text>

        <EnhancedGoalCard
          label="Drunk Days"
          subLabel="Yearly Limit"
          target={drunkDaysGoal}
          current={currentDrunkDays}
          onPressEdit={() => openEditModal("Max Drunk Days", drunkDaysGoal, setDrunkDaysGoal)}
          icon={<FontAwesome5 name="beer" size={16} color="#EA580C" />}
        />

        <EnhancedGoalCard
          label="Blackout Goal"
          subLabel="Absolute Zero"
          target={blackoutGoal}
          current={currentBlackouts}
          onPressEdit={() => openEditModal("Allowed Blackouts", blackoutGoal, setBlackoutGoal)}
          icon={<MaterialCommunityIcons name="skull" size={20} color="#EA580C" />}
        />

        <EnhancedGoalCard
          label="Dry Streak"
          subLabel="Record Target"
          target={streakGoal}
          current={currentStreak}
          isLimit={false}
          onPressEdit={() => openEditModal("Streak Goal", streakGoal, setStreakGoal)}
          icon={<Ionicons name="flame" size={20} color="#EA580C" />}
        />

        {/* --- SECTION 4: SESSION LIMITS --- */}
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

        {/* --- SECTION 5: TOGGLES --- */}
        <View className="bg-white/[0.03] rounded-2xl border border-white/[0.08] overflow-hidden mb-6">
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

      {/* --- BIG NUMBER INPUT MODAL --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 items-center justify-center bg-black/90 px-6"
        >
            <View className="bg-[#1A1A1A] w-full p-6 rounded-3xl border border-white/10">
                <Text className="text-orange-600 text-xs font-bold tracking-widest uppercase mb-2">
                    Edit Goal
                </Text>
                <Text className="text-white text-2xl font-black mb-6">
                    {editingGoal?.title}
                </Text>

                <View className="flex-row items-center bg-black rounded-xl border border-white/20 px-4 py-4 mb-6">
                    <TextInput 
                        className="flex-1 text-white text-3xl font-black text-center"
                        keyboardType="number-pad"
                        value={tempInputValue}
                        onChangeText={setTempInputValue}
                        placeholderTextColor="#444"
                        autoFocus
                    />
                </View>

                <View className="flex-row gap-3">
                    <TouchableOpacity 
                        onPress={() => setModalVisible(false)}
                        className="flex-1 bg-white/10 py-4 rounded-xl items-center"
                    >
                        <Text className="text-white font-bold">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={saveModalValue}
                        className="flex-1 bg-orange-600 py-4 rounded-xl items-center"
                    >
                        <Text className="text-black font-black">Save Value</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

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