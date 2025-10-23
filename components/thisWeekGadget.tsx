import { useApp } from "@/providers/AppProvider";
import { Text, View } from "react-native";

export default function ThisWeekGadget() {
  const { weeklyStats, calendar } = useApp();

  const weekProgress = weeklyStats
    ? (weeklyStats.days_drank / weeklyStats.total_days) * 100
    : 0;

  const getWeekDays = () => {
    const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

    if (!calendar?.days) {
      return dayLabels.map((day) => ({ day, active: false, isToday: false }));
    }

    // Find today in the calendar
    const todayEntry = calendar.days.find((d) => d.is_today);
    if (!todayEntry) {
      return dayLabels.map((day) => ({ day, active: false, isToday: false }));
    }

    // Parse today's date
    const todayDate = new Date(todayEntry.date);
    const todayDayOfWeek = todayDate.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate how many days back to Monday
    const daysBackToMonday = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;

    // Get Monday's date
    const mondayDate = new Date(todayDate);
    mondayDate.setUTCDate(todayDate.getUTCDate() - daysBackToMonday);
    mondayDate.setUTCHours(0, 0, 0, 0);

    // Create array of this week's dates (Monday to Sunday)
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(mondayDate);
      date.setUTCDate(mondayDate.getUTCDate() + i);
      return date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    });

    console.log("This week dates:", weekDates);

    // Map to day objects with drinking status from calendar
    return dayLabels.map((day, index) => {
      const targetDateString = weekDates[index];

      // Find matching day in calendar data
      const calendarDay = calendar.days.find((d) => {
        const calDateString = d.date.split("T")[0]; // Extract YYYY-MM-DD from UTC string
        return calDateString === targetDateString;
      });

      console.log(`${day} (${targetDateString}):`, {
        found: !!calendarDay,
        drankToday: calendarDay?.drank_today,
        isToday: calendarDay?.is_today,
      });

      return {
        day,
        active: calendarDay?.drank_today || false,
        isToday: calendarDay?.is_today || false,
      };
    });
  };

  const weekDays = getWeekDays();

  console.log("weeklyStats", weeklyStats);
  console.log("Final weekDays:", weekDays);

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
                item.active
                  ? "bg-orange-600"
                  : item.isToday
                    ? "bg-white/[0.12] border border-white/[0.2]"
                    : "bg-white/[0.05]"
              }`}
            >
              {item.active && (
                <Text className="text-black text-sm font-black">✓</Text>
              )}
            </View>
            <Text
              className={`text-[11px] font-bold ${
                item.isToday ? "text-white" : "text-white/50"
              }`}
            >
              {item.day}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
