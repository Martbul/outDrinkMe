import Header from "@/components/header";
import { useApp } from "@/providers/AppProvider";
import { UserStats } from "@/types/api.types";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CalendarDay = ({ day, drank, onPress, isToday, isSelected }) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(day, drank)}
      className={`
        w-11 h-11 rounded-lg flex items-center justify-center m-0.5
        ${
          isSelected
            ? "bg-orange-600"
            : isToday
              ? "bg-white/[0.08] border-2 border-orange-600"
              : drank
                ? "bg-orange-600/30"
                : "bg-white/[0.03]"
        }
        border ${drank && !isSelected && !isToday ? "border-orange-600/50" : "border-white/[0.08]"}
      `}
    >
      <Text
        className={`
        text-sm font-bold
        ${
          isSelected || isToday
            ? "text-white"
            : drank
              ? "text-orange-500"
              : "text-white/30"
        }
      `}
      >
        {day}
      </Text>
    </TouchableOpacity>
  );
};

const DayDetailModal = ({
  visible,
  onClose,
  dayData,
  selectedDay,
  userStats,
}: {
  visible: boolean;
  onClose: () => {};
  selectedDay:number;
  userStats: UserStats;
}) => {
  
  console.log("dayData: ", dayData);
 
  const insets = useSafeAreaInsets();

  if (!dayData) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-4 border-b border-white/[0.08]">
          <View>
            <Text className="text-white text-2xl font-black">
              Day {selectedDay}
            </Text>
            <Text className="text-white/50 text-sm mt-1">
              {new Date(dayData.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 rounded-xl bg-white/[0.03] items-center justify-center border border-white/[0.08]"
          >
            <Text className="text-white/40 text-xl">✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-4 pt-6"
          style={{ paddingBottom: insets.bottom }}
        >
          {/* Status */}
          <View className="bg-white/[0.03] rounded-2xl p-6 mb-4 border border-white/[0.08]">
            <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase mb-3">
              Status
            </Text>
            <View className="flex-row items-center">
              <View
                className={`w-14 h-14 rounded-xl ${dayData.drank_today ? "bg-orange-600/20" : "bg-white/[0.05]"} items-center justify-center mr-4`}
              >
                <Text className="text-4xl">
                  {dayData.drank_today ? "✅" : "❌"}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white text-xl font-black mb-1">
                  {dayData.drank_today ? "Logged" : "Not Logged"}
                </Text>
                <Text className="text-white/50 text-sm font-semibold">
                  {dayData.drank_today
                    ? "You drank this day"
                    : "No drinking logged"}
                </Text>
              </View>
            </View>
          </View>

          {/* Current Stats Context */}
          {dayData.drank_today && userStats && (
            <View className="bg-white/[0.03] rounded-2xl p-6 mb-4 border border-white/[0.08]">
              <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase mb-3">
                Your Stats
              </Text>
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white text-[32px] font-black mb-1">
                    {userStats.current_streak} Days
                  </Text>
                  <Text className="text-white/50 text-[13px] font-semibold">
                    Current streak
                  </Text>
                </View>
                <View className="bg-orange-600/20 px-3.5 py-1.5 rounded-lg">
                  <Text className="text-orange-600 text-[11px] font-black tracking-wider">
                    🔥 ACTIVE
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Additional Stats */}
          {userStats && (
            <View className="bg-white/[0.03] rounded-2xl p-6 mb-24 border border-white/[0.08]">
              <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase mb-4">
                Overall Stats
              </Text>

              <View className="flex-row justify-between mb-4 pb-4 border-b border-white/5">
                <Text className="text-white/50 text-[13px] font-semibold">
                  Total days drank
                </Text>
                <Text className="text-white text-[15px] font-bold">
                  {userStats.total_days_drank}
                </Text>
              </View>

              <View className="flex-row justify-between mb-4 pb-4 border-b border-white/5">
                <Text className="text-white/50 text-[13px] font-semibold">
                  Longest streak
                </Text>
                <Text className="text-white text-[15px] font-bold">
                  {userStats.longest_streak} days
                </Text>
              </View>

              <View className="flex-row justify-between mb-4 pb-4 border-b border-white/5">
                <Text className="text-white/50 text-[13px] font-semibold">
                  This month
                </Text>
                <Text className="text-white text-[15px] font-bold">
                  {userStats.days_this_month} days
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-white/50 text-[13px] font-semibold">
                  This week
                </Text>
                <Text className="text-white text-[15px] font-bold">
                  {userStats.days_this_week} days
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

// Main Calendar Screen Component
const CalendarScreen = () => {
  const { userStats, calendar, isLoading, refreshCalendar } = useApp();

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    refreshCalendar(currentYear, currentMonth);
  }, [currentMonth, currentYear]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const handleDayPress = (day:number, dayData) => {
        console.log("DDD:",typeof dayData)

    setSelectedDay(day);
    setSelectedDayData(dayData);
    setModalVisible(true);
  };

  const navigateMonth = (direction: string) => {
    if (direction === "next") {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  const getDayData = (day: number) => {
    if (!calendar?.days) return null;
    return calendar.days.find((d) => {
      const dayDate = new Date(d.date).getDate();
      return dayDate === day;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const today = new Date();
    const isCurrentMonth =
      currentMonth === today.getMonth() + 1 &&
      currentYear === today.getFullYear();

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} className="w-11 h-11 m-0.5" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = getDayData(day);
      const isToday = isCurrentMonth && day === today.getDate();
      const drank = dayData?.drank_today || false;

      days.push(
        <CalendarDay
          key={day}
          day={day}
          drank={drank}
          onPress={() => handleDayPress(day, dayData)}
          isToday={isToday}
          isSelected={selectedDay === day}
        />
      );
    }

    return days;
  };

  const activeDays = calendar?.days?.filter((d) => d.drank_today).length || 0;
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const completionRate =
    daysInMonth > 0 ? Math.round((activeDays / daysInMonth) * 100) : 0;

  if (isLoading && !calendar) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#EA580C" />
        <Text className="text-white/50 mt-4 text-sm">Loading calendar...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Header />
      <ScrollView className="flex-1 px-4 pt-6">
        {/* Header - Matching Home Style */}
        <View className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/[0.08]">
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-2">
                YOUR JOURNEY
              </Text>
              <Text className="text-white text-[32px] font-black">
                Calendar
              </Text>
            </View>
            <View className="bg-orange-600/20 px-3.5 py-1.5 rounded-lg">
              <Text className="text-orange-600 text-[11px] font-black tracking-wider">
                {completionRate}% DONE
              </Text>
            </View>
          </View>
        </View>

        {/* Current Stats */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-white/[0.03] rounded-xl p-4 border border-white/[0.08]">
            <Text className="text-white/50 text-[10px] font-bold tracking-widest mb-1.5">
              STREAK
            </Text>
            <Text className="text-white text-2xl font-black">
              {userStats?.current_streak || 0}
            </Text>
            <Text className="text-white/40 text-[11px] font-semibold mt-0.5">
              days 🔥
            </Text>
          </View>
          <View className="flex-1 bg-white/[0.03] rounded-xl p-4 border border-white/[0.08]">
            <Text className="text-white/50 text-[10px] font-bold tracking-widest mb-1.5">
              BEST
            </Text>
            <Text className="text-white text-2xl font-black">
              {userStats?.longest_streak || 0}
            </Text>
            <Text className="text-white/40 text-[11px] font-semibold mt-0.5">
              days max
            </Text>
          </View>
        </View>

        {/* Month Navigation */}
        <View className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/[0.08]">
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity
              onPress={() => navigateMonth("prev")}
              className="w-10 h-10 rounded-lg bg-white/[0.05] items-center justify-center border border-white/[0.08]"
            >
              <Text className="text-white/60 text-lg font-bold">←</Text>
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-white text-xl font-black">
                {monthNames[currentMonth - 1]}
              </Text>
              <Text className="text-white/50 text-sm font-semibold">
                {currentYear}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigateMonth("next")}
              className="w-10 h-10 rounded-lg bg-white/[0.05] items-center justify-center border border-white/[0.08]"
            >
              <Text className="text-white/60 text-lg font-bold">→</Text>
            </TouchableOpacity>
          </View>

          {/* Day Labels */}
          <View className="flex-row justify-around mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <Text
                key={index}
                className="w-11 text-center text-white/30 font-bold text-xs uppercase"
              >
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          {isLoading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="small" color="#EA580C" />
            </View>
          ) : (
            <View className="flex-row flex-wrap">{renderCalendar()}</View>
          )}

          {/* Legend */}
          <View className="mt-4 pt-4 border-t border-white/5">
            <View className="flex-row justify-around">
              <View className="flex-row items-center">
                <View className="w-5 h-5 rounded bg-orange-600/30 border border-orange-600/50 mr-2" />
                <Text className="text-white/50 text-xs font-bold">Logged</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-5 h-5 rounded bg-white/[0.08] border-2 border-orange-600 mr-2" />
                <Text className="text-white/50 text-xs font-bold">Today</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-5 h-5 rounded bg-white/[0.03] border border-white/[0.08] mr-2" />
                <Text className="text-white/50 text-xs font-bold">None</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Monthly Stats - Matching Home Style */}
        <View className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/[0.08]">
          <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-2">
            THIS MONTH
          </Text>

          <View className="mt-2">
            <View className="flex-row justify-between items-end mb-3">
              <Text className="text-white text-[28px] font-black">
                {activeDays}/{daysInMonth}
              </Text>
              <Text className="text-white/50 text-[13px] font-semibold">
                Days Logged
              </Text>
            </View>
            <View className="w-full h-2 bg-white/[0.08] rounded overflow-hidden">
              <View
                className="h-full bg-orange-600 rounded"
                style={{ width: `${completionRate}%` }}
              />
            </View>
          </View>
        </View>

        {/* Additional Monthly Stats */}
        <View className="bg-white/[0.03] rounded-2xl p-5 mb-24 border border-white/[0.08]">
          <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-2">
            YOUR STATS
          </Text>

          <View className="flex-row justify-between items-center py-3 border-b border-white/5">
            <Text className="text-white/50 text-[13px] font-semibold">
              Total This Year
            </Text>
            <Text className="text-white text-[15px] font-bold">
              {userStats?.days_this_year || 0} days
            </Text>
          </View>

          <View className="flex-row justify-between items-center py-3 border-b border-white/5">
            <Text className="text-white/50 text-[13px] font-semibold">
              This Month
            </Text>
            <Text className="text-white text-[15px] font-bold">
              {userStats?.days_this_month || 0} days
            </Text>
          </View>

          <View className="flex-row justify-between items-center py-3 border-b border-white/5">
            <Text className="text-white/50 text-[13px] font-semibold">
              Completion Rate
            </Text>
            <Text className="text-white text-[15px] font-bold">
              {completionRate}%
            </Text>
          </View>

          <View className="flex-row justify-between items-center py-3">
            <Text className="text-white/50 text-[13px] font-semibold">
              Current Rank
            </Text>
            <Text className="text-white text-[15px] font-bold">
              #{userStats?.rank || 0}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Day Detail Modal */}
      <DayDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        dayData={selectedDayData}
        selectedDay={selectedDay}
        userStats={userStats}
      />
    </View>
  );
};

export default CalendarScreen;
