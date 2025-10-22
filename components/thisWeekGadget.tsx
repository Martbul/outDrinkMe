import { useApp } from "@/providers/AppProvider";
import { Text, View } from "react-native";

export default function ThisWeekGadget() {
  const { weeklyStats } = useApp();
  const weekProgress = weeklyStats
    ? (weeklyStats.days_drank / weeklyStats.total_days) * 100
    : 0;

  const getWeekDays = () => {
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    const daysLogged = weeklyStats?.days_drank || 0;

    return days.map((day, index) => ({
      day,
      active: index < daysLogged,
    }));
  };

  const weekDays = getWeekDays();

  return (
    <View className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/[0.08]">
      <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-2">
        THIS WEEK
      </Text>

      <View className="mt-2">
        <View className="flex-row justify-between items-end mb-3">
          <Text className="text-white text-[28px] font-black">
            {weeklyStats?.days_drank || 0}/{weeklyStats?.total_days || 7}
          </Text>
          <Text className="text-white/50 text-[13px] font-semibold">
            Drunk Days
          </Text>
        </View>
        <View className="w-full h-2 bg-white/[0.08] rounded overflow-hidden">
          <View
            className="h-full bg-orange-600 rounded"
            style={{ width: `${weekProgress}%` }}
          />
        </View>
      </View>

      <View className="flex-row justify-between mt-5">
        {weekDays.map((item, index) => (
          <View key={index} className="items-center">
            <View
              className={`w-9 h-9 rounded-lg justify-center items-center mb-1.5 ${
                item.active ? "bg-orange-600" : "bg-white/[0.05]"
              }`}
            >
              {item.active && (
                <Text className="text-black text-sm font-black">✓</Text>
              )}
            </View>
            <Text className="text-white/50 text-[11px] font-bold">
              {item.day}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
