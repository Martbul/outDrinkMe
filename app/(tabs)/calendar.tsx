import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { useApp } from "@/providers/AppProvider";
import { AddDrinkingRequest, UserStats } from "@/types/api.types";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "@/components/header";
import { AntDesign, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { apiService } from "@/api";
import { useAuth } from "@clerk/clerk-expo";
import CustomModal, {
  ModalPrimaryButton,
  ModalSecondaryButton,
} from "@/components/customModal";
import { usePostHog } from "posthog-react-native";

interface CalendarDayProps {
  day: number;
  drank: boolean;
  onPress: (day: number, drank: boolean) => void;
  isToday: boolean;
  isSelected: boolean;
}

export interface DayData {
  date: string;
  drank_today: boolean;
}

interface DayDetailModalProps {
  visible: boolean;
  onClose: () => void;
  dayData: DayData | null;
  selectedDay: number | null;
  userStats: UserStats | null;
  drunkThought: string | null;
  isLoadingThought: boolean;
}


const CalendarDay = ({ day, drank, onPress, isToday }: CalendarDayProps) => {
  return (
    <View style={{ width: "14.28%" }} className="aspect-square p-[2px]">
      <TouchableOpacity
        onPress={() => onPress(day, drank)}
        className={`
          flex-1 items-center justify-center rounded-lg
          ${
            isToday && drank
              ? "bg-orange-600/30 border-2 border-orange-600"
              : isToday
                ? "bg-white/[0.12] border-2 border-orange-600"
                : drank
                  ? "bg-orange-600/30"
                  : "bg-white/[0.03]"
          }
          border ${drank && !isToday ? "border-orange-600/50" : isToday ? "border-orange-600" : "border-white/[0.08]"}
        `}
      >
        <Text
          className={`
          text-xs sm:text-sm font-bold
          ${
            isToday ? "text-white" : drank ? "text-orange-500" : "text-white/30"
          }
        `}
        >
          {day}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const DayDetailModal = ({
  visible,
  onClose,
  dayData,
  selectedDay,
  userStats,
  drunkThought,
  isLoadingThought,
}: DayDetailModalProps) => {
  const posthog = usePostHog();
  const { getToken } = useAuth();
  const { refreshCalendar, refreshUserData, refreshAll } = useApp();
  const insets = useSafeAreaInsets();
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!dayData || !selectedDay) return null;

  const handleForgotDrink = async () => {
    setIsSubmitting(true);
    try {
      const dateStr = dayData.date.split("T")[0];
      const token = await getToken();
      if (token) {
        const drinkingData: AddDrinkingRequest = { drank_today: true };
        await apiService.addDrinking(drinkingData, token, dateStr);
        posthog?.capture("retroactive_log_added", { date: dateStr });
      }
      setShowForgotModal(false);
      onClose();
      refreshCalendar();
      refreshUserData();
    } catch (error: any) {
      console.error("Failed to log missed day:", error);
      posthog?.capture("retroactive_log_error", { error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveDrinking = async () => {
    setIsSubmitting(true);
    try {
      const dateStr = dayData.date.split("T")[0];
      const token = await getToken();
      if (token) {
        await apiService.removeDrinking(token, dateStr);
        posthog?.capture("retroactive_log_removed", { date: dateStr });
      }
      setShowRemoveModal(false);
      onClose();
      refreshAll();
    } catch (error: any) {
      console.error("Failed to remove drinking log:", error);
      posthog?.capture("retroactive_remove_error", { error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
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
            contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          >
            <View className="bg-white/[0.03] rounded-2xl p-6 mb-4 border border-white/[0.08]">
              <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase mb-3">
                Status
              </Text>
              <View className="flex-row items-center">
                <View
                  className={`w-14 h-14 rounded-xl ${dayData.drank_today ? "bg-orange-600/20" : "bg-white/[0.05]"} items-center justify-center mr-4`}
                >
                  <Text className="text-4xl">
                    {dayData.drank_today ? (
                      <AntDesign name="check" size={30} color="#ff8c00" />
                    ) : (
                      <AntDesign name="close" size={30} color="#ff8c00" />
                    )}
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

            {dayData.drank_today && (
              <View className="bg-white/[0.03] rounded-2xl p-6 mb-4 border border-white/[0.08]">
                <Text className="text-white/50 text-[11px] font-bold tracking-widest uppercase mb-3">
                  Drunk Thought
                </Text>
                {isLoadingThought ? (
                  <View className="py-4 items-center">
                    <ActivityIndicator size="small" color="#ff8c00" />
                    <Text className="text-white/50 text-sm mt-2">
                      Loading thought...
                    </Text>
                  </View>
                ) : drunkThought && drunkThought.trim().length > 0 ? (
                  <View className="bg-white/[0.05] rounded-xl p-4 border border-white/[0.08]">
                    <Text className="text-white text-base leading-relaxed">
                      "{drunkThought}"
                    </Text>
                  </View>
                ) : (
                  <View className="bg-white/[0.05] rounded-xl p-4 border border-white/[0.08] items-center">
                    <Feather name="message-circle" size={32} color="#666666" />
                    <Text className="text-white/50 text-sm mt-2 text-center">
                      No drunk thought recorded for this day
                    </Text>
                  </View>
                )}
              </View>
            )}

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
                  {userStats.current_streak > 0 && (
                    <View className="bg-orange-600/20 px-3.5 py-1.5 rounded-lg">
                      <View className="flex-row items-center">
                        <MaterialCommunityIcons
                          name="fire"
                          size={22}
                          color="#EA580C"
                        />
                        <Text className="text-orange-600 text-[11px] font-black tracking-wider">
                          ACTIVE
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          {(() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDate = new Date(dayData.date);
            selectedDate.setHours(0, 0, 0, 0);
            const isPastDate = selectedDate < today;

            const showForgotButton = !dayData.drank_today && isPastDate;
            const showRemoveButton = dayData.drank_today;

            if (!showForgotButton && !showRemoveButton) return null;

            return (
              <View
                className="absolute bottom-0 left-0 right-0 px-4 bg-black border-t border-white/[0.08]"
                style={{ paddingBottom: insets.bottom + 16, paddingTop: 16 }}
              >
                {showForgotButton && (
                  <TouchableOpacity
                    onPress={() => setShowForgotModal(true)}
                    className="bg-white/[0.03] rounded-2xl py-4 items-center border border-orange-600/30"
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-center gap-2">
                      <Feather name="calendar" size={20} color="#ff8c00" />
                      <Text className="text-orange-600 text-base font-black tracking-wide">
                        Forgot to add Drinking?
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                {showRemoveButton && (
                  <TouchableOpacity
                    onPress={() => setShowRemoveModal(true)}
                    className="bg-white/[0.03] rounded-2xl py-4 items-center border border-red-600/30"
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-center gap-2">
                      <Feather name="x-circle" size={20} color="#dc2626" />
                      <Text className="text-red-600 text-base font-black tracking-wide">
                        Haven't Drank?
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            );
          })()}
        </View>
      </Modal>

      <CustomModal
        visible={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Forgot to Log?"
        footer={
          <View className="gap-3">
            <ModalPrimaryButton
              onPress={handleForgotDrink}
              title="Yes, I Drank"
              loading={isSubmitting}
            />
            <ModalSecondaryButton
              onPress={() => setShowForgotModal(false)}
              title="Cancel"
            />
          </View>
        }
      >
        <View className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.08]">
          <View className="items-center mb-4">
            <View className="w-20 h-20 rounded-full bg-orange-600/20 items-center justify-center mb-4">
              <Text className="text-5xl">🍺</Text>
            </View>
            <Text className="text-white text-xl font-black text-center mb-2">
              Log Past Drinking?
            </Text>
          </View>
          <View className="bg-white/[0.05] rounded-xl p-4 mb-4 border border-white/[0.08]">
            <Text className="text-white/50 text-xs font-semibold text-center mb-1">
              LOGGING FOR
            </Text>
            <Text className="text-white text-lg font-bold text-center">
              {new Date(dayData.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>
      </CustomModal>

      <CustomModal
        visible={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        title="Remove Log?"
        footer={
          <View className="gap-3">
            <ModalPrimaryButton
              onPress={handleRemoveDrinking}
              title="Yes, Remove Log"
              loading={isSubmitting}
            />
            <ModalSecondaryButton
              onPress={() => setShowRemoveModal(false)}
              title="Cancel"
            />
          </View>
        }
      >
        <View className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.08]">
          <View className="items-center mb-4">
            <View className="w-20 h-20 rounded-full bg-red-600/20 items-center justify-center mb-4">
              <Feather name="x-circle" size={48} color="#dc2626" />
            </View>
            <Text className="text-white text-xl font-black text-center mb-2">
              Remove Drinking Log?
            </Text>
          </View>
          <View className="bg-white/[0.05] rounded-xl p-4 mb-4 border border-white/[0.08]">
            <Text className="text-white/50 text-xs font-semibold text-center mb-1">
              REMOVING FOR
            </Text>
            <Text className="text-white text-lg font-bold text-center">
              {new Date(dayData.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>
      </CustomModal>
    </>
  );
};

const CalendarScreen = () => {
  const { getToken } = useAuth();
  const posthog = usePostHog();

  const { userStats, calendar, isLoading, refreshCalendar } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedDayData, setSelectedDayData] = useState<DayData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [dayDrunkThought, setDayDrunkThought] = useState<string | null>(null);
  const [isLoadingThought, setIsLoadingThought] = useState(false);

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
    posthog?.capture("calendar_month_viewed", {
      month: currentMonth,
      year: currentYear,
    });
  }, [currentMonth, currentYear]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const handleDayPress = async (day: number, dayData: DayData | null) => {
    posthog?.capture("calendar_day_pressed", {
      day,
      has_data: !!dayData,
      was_logged: dayData?.drank_today ?? null,
    });
    setSelectedDay(day);
    setSelectedDayData(dayData);
    setModalVisible(true);
    setDayDrunkThought(null);

    if (dayData && dayData.drank_today) {
      setIsLoadingThought(true);
      try {
        const dateStr = dayData.date.split("T")[0];
        const token = await getToken();
        if (token) {
          const response = await apiService.getDrunkThought(token, dateStr);
          setDayDrunkThought(response);
        }
      } catch (error) {
        console.error("Failed to fetch drunk thought for date:", error);
        setDayDrunkThought(null);
      } finally {
        setIsLoadingThought(false);
      }
    }
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

  const getDayData = (day: number): DayData | null => {
    if (!calendar?.days) return null;

    return (
      calendar.days.find((d) => {
        const dayDate = new Date(d.date).getDate();
        return dayDate === day;
      }) || null
    );
  };

  const isTodayInCalendar = (day: number): boolean => {
    if (!calendar?.days) return false;
    const dayData = calendar.days.find((d) => {
      const dayDate = new Date(d.date).getDate();
      return dayDate === day;
    });
    return dayData?.is_today || false;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View
          key={`empty-${i}`}
          style={{ width: "14.28%" }}
          className="aspect-square p-[2px]"
        />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = getDayData(day);
      const isToday = isTodayInCalendar(day);
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

  const insets = useSafeAreaInsets();
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
    <View
      className="flex-1 bg-black"
      style={{ paddingBottom: insets.bottom + 40 }}
    >
      <Header />
      <ScrollView className="flex-1 px-4 pt-6">
        <View className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/[0.08]">
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-2">
                YOUR DRUNK
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

        <View className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/[0.08]">
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity
              onPress={() => navigateMonth("prev")}
              className="w-10 h-10 rounded-lg bg-white/[0.05] items-center justify-center border border-white/[0.08]"
            >
              <Feather name="arrow-left" size={24} color="#999999" />
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
              <Feather name="arrow-right" size={24} color="#999999" />
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap mb-2">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <View
                key={index}
                style={{ width: "14.28%" }}
                className="items-center justify-center"
              >
                <Text className="text-white/30 font-bold text-xs uppercase">
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {isLoading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="small" color="#EA580C" />
            </View>
          ) : (
            <View className="flex-row flex-wrap">{renderCalendar()}</View>
          )}

          <View className="mt-4 pt-4 border-t border-white/5">
            <View className="flex-row justify-around">
              <View className="flex-row items-center">
                <View className="w-5 h-5 rounded bg-orange-600/30 border border-orange-600/50 mr-2" />
                <Text className="text-white/50 text-xs font-bold">Logged</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-5 h-5 rounded bg-white/[0.12] border-2 border-orange-600 mr-2" />
                <Text className="text-white/50 text-xs font-bold">Today</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-5 h-5 rounded bg-white/[0.03] border border-white/[0.08] mr-2" />
                <Text className="text-white/50 text-xs font-bold">None</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Section */}
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

        <View className="bg-white/[0.03] rounded-2xl p-5 mb-24 border border-white/[0.08]">
          <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-2">
            YOUR STATS
          </Text>
          {/* ... stats rows ... */}
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

      <DayDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        dayData={selectedDayData}
        selectedDay={selectedDay}
        userStats={userStats}
        drunkThought={dayDrunkThought}
        isLoadingThought={isLoadingThought}
      />
    </View>
  );
};

export default CalendarScreen;