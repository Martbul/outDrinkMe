import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import NestedScreenHeader from "@/components/nestedScreenHeader";

const ORANGE = "#EA580C";

export default function GoalSettingScreen() {
  const insets = useSafeAreaInsets();

  const [goals, setGoals] = useState({
    annual: { drunk: 45, blackouts: 0, streak: 30 },
    weekly: { weekStreaks: 10 },
  });

  const [toggles, setToggles] = useState({
    hitAllMonths: true,
    dontMissAWeek: true,
  });

  // Mock Progress Data (In production, this comes from your useApp() provider)
  const progress = {
    annualDrunk: 12,
    annualBlackouts: 1,
    annualStreak: 14,
    currentWeekStreak: 4,
    monthsMissed: 0, 
    weeksMissed: 1, 
    yearlyEfficiency: 84
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<{ section: string; key: string; label: string; val: string } | null>(null);

  // --- AUTO-SAVE LOGIC ---
  const stateRef = useRef({ goals, toggles });
  useEffect(() => { stateRef.current = { goals, toggles }; }, [goals, toggles]);

  useEffect(() => {
    return () => {
      // Logic to sync stateRef.current with DB
      console.log("Auto-saving to Database...", stateRef.current);
    };
  }, []);

  const openEditModal = (section: string, key: string, label: string, currentVal: number) => {
    setEditing({ section, key, label, val: currentVal.toString() });
    setModalVisible(true);
  };

  const saveModalValue = () => {
    if (editing) {
      const num = parseInt(editing.val, 10) || 0;
      setGoals((prev) => ({
        ...prev,
        [editing.section]: { ...prev[editing.section as keyof typeof goals], [editing.key]: num },
      }));
    }
    setModalVisible(false);
  };

  // --- UI COMPONENTS ---

  const Speedometer = ({ percentage }: { percentage: number }) => {
    const radius = 75;
    const strokeWidth = 12;
    const circumference = Math.PI * radius;
    const progressArc = (percentage / 100) * circumference;

    return (
      <View className="items-center justify-center py-4">
        <Svg height="110" width="200" viewBox="0 0 200 110">
          <Path
            d="M 25 100 A 75 75 0 0 1 175 100"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <Path
            d="M 25 100 A 75 75 0 0 1 175 100"
            fill="none"
            stroke={ORANGE}
            strokeWidth={strokeWidth}
            strokeDasharray={`${progressArc}, ${circumference}`}
            strokeLinecap="round"
          />
        </Svg>
        <View className="absolute bottom-2 items-center">
          <Text className="text-white text-4xl font-black">{percentage}%</Text>
          <Text className="text-orange-600 text-[10px] font-bold tracking-[2px] uppercase">
            EFFICIENCY
          </Text>
        </View>
      </View>
    );
  };

  const StatusBadge = ({ isSuccess, label }: { isSuccess: boolean, label?: string }) => (
    <View className={`px-2 py-0.5 rounded border ${isSuccess ? 'bg-orange-600/20 border-orange-600' : 'bg-white/5 border-white/20'}`}>
      <Text className={`text-[8px] font-black uppercase ${isSuccess ? 'text-orange-600' : 'text-white/40'}`}>
        {label || (isSuccess ? "ON TRACK" : "FAILED")}
      </Text>
    </View>
  );

  const GoalCard = ({ section, goalKey, label, subLabel, target, current, icon, isLimit = true }: any) => {
    const isSuccess = isLimit ? current <= target : current >= target;
    const percent = Math.min(100, Math.max(0, (current / (target || 1)) * 100));

    return (
      <TouchableOpacity
        onPress={() => openEditModal(section, goalKey, label, target)}
        className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-3"
      >
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 bg-orange-600/10 rounded-xl items-center justify-center mr-3 border border-orange-600/20">
              {icon}
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-white font-black text-base">{label}</Text>
                <StatusBadge isSuccess={isSuccess} />
              </View>
              <Text className="text-white/40 text-[10px] font-bold uppercase tracking-tight">{subLabel}</Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-white font-black text-2xl">{target}</Text>
            <Text className="text-orange-600 text-[9px] font-bold uppercase">GOAL</Text>
          </View>
        </View>
        <View className="h-1 bg-white/10 rounded-full overflow-hidden">
          <View className="h-full bg-orange-600" style={{ width: `${percent}%` }} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-black">
      <NestedScreenHeader heading="Goals" secondaryHeading="ACCOUNTABILITY" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        className="px-4 pt-4"
      >
        {/* SPEEDOMETER SECTION */}
        <View className="bg-white/[0.03] rounded-3xl p-6 border border-white/[0.08] mb-8">
          <View className="flex-row justify-between items-start mb-2">
            <View>
              <Text className="text-orange-600 text-[11px] font-bold tracking-widest uppercase">Performance</Text>
              <Text className="text-white text-3xl font-black italic">2025 TRACK</Text>
            </View>
            <View className="bg-orange-600/20 px-3 py-1 rounded-lg border border-orange-600/30">
              <Text className="text-orange-600 font-black text-xs">ELITE</Text>
            </View>
          </View>
          <Speedometer percentage={progress.yearlyEfficiency} />
        </View>

        {/* ANNUAL SECTION */}
        <Text className="text-orange-600 text-[11px] font-black tracking-[3px] mb-4 uppercase px-1 italic">— Annual</Text>
        <GoalCard
          section="annual" goalKey="drunk" label="Drunk Days" subLabel="Drink more"
          target={goals.annual.drunk} current={progress.annualDrunk}
          icon={<FontAwesome5 name="beer" size={16} color={ORANGE} />}
        />
        <GoalCard
          section="annual" goalKey="blackouts" label="Blackouts" subLabel="Obliterate yourself"
          target={goals.annual.blackouts} current={progress.annualBlackouts}
          icon={<MaterialCommunityIcons name="skull" size={20} color={ORANGE} />}
        />
        <GoalCard
          section="annual" goalKey="streak" label="Longest Streak" subLabel="Days without a gap"
          target={goals.annual.streak} current={progress.annualStreak} isLimit={false}
          icon={<Ionicons name="flame" size={20} color={ORANGE} />}
        />

        {/* MONTHLY SECTION */}
        <View className="mt-8">
          <Text className="text-orange-600 text-[11px] font-black tracking-[3px] mb-4 uppercase px-1 italic">— Monthly</Text>
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white font-black text-base">Hit All Months</Text>
              <Switch 
                value={toggles.hitAllMonths} 
                onValueChange={(v) => setToggles({...toggles, hitAllMonths: v})}
                trackColor={{ false: "#333", true: ORANGE }}
                thumbColor="#fff"
              />
            </View>
            <Text className="text-white/40 text-xs mb-4">Drink in every single month of the year</Text>
            {toggles.hitAllMonths && (
                <View className="pt-4 border-t border-white/5 flex-row justify-between items-center">
                    <Text className="text-white/60 text-[10px] font-bold uppercase">Current Status</Text>
                    <StatusBadge isSuccess={progress.monthsMissed === 0} label={progress.monthsMissed === 0 ? "PERFECT" : "GAP FOUND"} />
                </View>
            )}
          </View>
        </View>

        {/* WEEKLY SECTION */}
        <View className="mt-8">
          <Text className="text-orange-600 text-[11px] font-black tracking-[3px] mb-4 uppercase px-1 italic">— Weekly</Text>
          <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white font-black text-base">Don&apos;t Miss a Week</Text>
              <Switch 
                value={toggles.dontMissAWeek} 
                onValueChange={(v) => setToggles({...toggles, dontMissAWeek: v})}
                trackColor={{ false: "#333", true: ORANGE }}
                thumbColor="#fff"
              />
            </View>
            <Text className="text-white/40 text-xs mb-4">Ensure you log at least one drink every week of the year</Text>
            {toggles.dontMissAWeek && (
                <View className="pt-4 border-t border-white/5 flex-row justify-between items-center">
                    <Text className="text-white/60 text-[10px] font-bold uppercase">Current Status</Text>
                    <StatusBadge isSuccess={progress.weeksMissed === 0} label={progress.weeksMissed === 0 ? "STREAKING" : "MISSED WEEK"} />
                </View>
            )}
          </View>
          <GoalCard
            section="weekly" goalKey="weekStreaks" label="Week Streaks" subLabel="Consecutive active weeks"
            target={goals.weekly.weekStreaks} current={progress.currentWeekStreak} isLimit={false}
            icon={<MaterialCommunityIcons name="calendar-check" size={20} color={ORANGE} />}
          />
        </View>

        <Text className="text-white/20 text-[10px] font-bold text-center mt-10 uppercase tracking-[2px]">
          Goals update automatically on exit
        </Text>
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 items-center justify-center bg-black/95 px-6">
          <View className="bg-[#121212] w-full p-8 rounded-[40px] border border-orange-600/30">
            <Text className="text-orange-600 text-[10px] font-black tracking-[3px] uppercase mb-2 text-center">Adjusting</Text>
            <Text className="text-white text-2xl font-black mb-8 text-center">{editing?.label}</Text>
            <TextInput
              className="text-white text-7xl font-black text-center mb-10"
              keyboardType="number-pad"
              value={editing?.val}
              onChangeText={(t) => setEditing(prev => prev ? {...prev, val: t} : null)}
              autoFocus
              selectionColor={ORANGE}
            />
            <View className="flex-row gap-4">
              <TouchableOpacity onPress={() => setModalVisible(false)} className="flex-1 py-4 items-center">
                <Text className="text-white/40 font-bold uppercase tracking-widest">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveModalValue} className="flex-1 bg-orange-600 py-4 rounded-2xl items-center shadow-lg shadow-orange-600/20">
                <Text className="text-black font-black uppercase tracking-widest">Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}