import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { Ionicons, AntDesign, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BodyText,
  Card,
  CardTitle,
  IconContainer,
  MutedText,
  PageContainer,
  PageTitle,
  RowLayout,
} from "@/components/custom";

const CalendarDay = ({ day, data, onPress, isToday, isSelected }) => {
  const hasData =
    data && (data.steps > 0 || data.streetsVisited > 0 || data.timeActive > 0);

  return (
    <TouchableOpacity
      onPress={() => onPress(day, data)}
      className={`
        w-12 h-12 rounded-xl flex items-center justify-center m-1
        ${isSelected ? "bg-blue-500" : isToday ? "bg-orange-400" : hasData ? "bg-green-100" : "bg-gray-50"}
        ${hasData ? "border border-green-200" : "border border-gray-100"}
      `}
    >
      <Text
        className={`
        text-sm font-semibold
        ${isSelected ? "text-white" : isToday ? "text-white" : hasData ? "text-green-700" : "text-gray-600"}
      `}
      >
        {day}
      </Text>
    </TouchableOpacity>
  );
};

const DayDetailModal = ({ visible, onClose, dayData, selectedDay }) => {
  if (!dayData) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-containerBg">
        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
          <PageTitle className="mb-0">Day {selectedDay}</PageTitle>
          <TouchableOpacity onPress={onClose}>
            <AntDesign name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          <View className="space-y-4">
            {/* Activity Summary */}
            <Card>
              <CardTitle className="mb-4">Activity Summary</CardTitle>
              <View className="space-y-3">
                <RowLayout className="justify-between">
                  <RowLayout>
                    <IconContainer size="small" color="green">
                      <Feather name="activity" size={16} color="#10B981" />
                    </IconContainer>
                    <BodyText className="ml-3">Steps</BodyText>
                  </RowLayout>
                  <BodyText className="font-bold">
                    {dayData.steps.toLocaleString()}
                  </BodyText>
                </RowLayout>

                <RowLayout className="justify-between">
                  <RowLayout>
                    <IconContainer size="small" color="blue">
                      <Ionicons name="map" size={16} color="#3B82F6" />
                    </IconContainer>
                    <BodyText className="ml-3">Streets Visited</BodyText>
                  </RowLayout>
                  <BodyText className="font-bold">
                    {dayData.streetsVisited}
                  </BodyText>
                </RowLayout>

                <RowLayout className="justify-between">
                  <RowLayout>
                    <IconContainer size="small" color="accent">
                      <Ionicons name="time" size={16} color="#F59E0B" />
                    </IconContainer>
                    <BodyText className="ml-3">Active Time</BodyText>
                  </RowLayout>
                  <BodyText className="font-bold">
                    {dayData.timeActive} min
                  </BodyText>
                </RowLayout>
              </View>
            </Card>

            {/* Distance & Exploration */}
            <Card>
              <CardTitle className="mb-4">Distance & Exploration</CardTitle>
              <View className="space-y-3">
                <RowLayout className="justify-between">
                  <BodyText>Distance Traveled</BodyText>
                  <BodyText className="font-bold">
                    {dayData.distance} km
                  </BodyText>
                </RowLayout>

                <RowLayout className="justify-between">
                  <BodyText>New Areas</BodyText>
                  <BodyText className="font-bold">{dayData.newAreas}</BodyText>
                </RowLayout>

                <RowLayout className="justify-between">
                  <BodyText>Exploration Score</BodyText>
                  <BodyText className="font-bold text-green-600">
                    {dayData.explorationScore}/100
                  </BodyText>
                </RowLayout>
              </View>
            </Card>

            {/* Weather & Mood */}
            <Card>
              <CardTitle className="mb-4">Conditions</CardTitle>
              <View className="space-y-3">
                <RowLayout className="justify-between">
                  <BodyText>Weather</BodyText>
                  <RowLayout>
                    <Text className="text-2xl mr-2">
                      {dayData.weather.icon}
                    </Text>
                    <BodyText className="font-bold">
                      {dayData.weather.condition}
                    </BodyText>
                  </RowLayout>
                </RowLayout>

                <RowLayout className="justify-between">
                  <BodyText>Temperature</BodyText>
                  <BodyText className="font-bold">
                    {dayData.weather.temp}°C
                  </BodyText>
                </RowLayout>

                <RowLayout className="justify-between">
                  <BodyText>Energy Level</BodyText>
                  <View className="flex-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name="star"
                        size={16}
                        color={
                          star <= dayData.energyLevel ? "#F59E0B" : "#E5E7EB"
                        }
                      />
                    ))}
                  </View>
                </RowLayout>
              </View>
            </Card>

            {/* Notes */}
            {dayData.notes && (
              <Card>
                <CardTitle className="mb-3">Notes</CardTitle>
                <BodyText className="text-gray-700 leading-6">
                  {dayData.notes}
                </BodyText>
              </Card>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// Main Calendar Screen Component
const CalendarScreen = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Sample data for demonstration
  const generateSampleData = (day) => ({
    steps: Math.floor(Math.random() * 8000) + 2000,
    streetsVisited: Math.floor(Math.random() * 12) + 1,
    timeActive: Math.floor(Math.random() * 90) + 30,
    distance: (Math.random() * 8 + 1).toFixed(1),
    newAreas: Math.floor(Math.random() * 3),
    explorationScore: Math.floor(Math.random() * 40) + 60,
    weather: {
      icon: ["☀️", "⛅", "🌧️", "❄️"][Math.floor(Math.random() * 4)],
      condition: ["Sunny", "Cloudy", "Rainy", "Snowy"][
        Math.floor(Math.random() * 4)
      ],
      temp: Math.floor(Math.random() * 25) + 5,
    },
    energyLevel: Math.floor(Math.random() * 5) + 1,
    notes:
      Math.random() > 0.7
        ? "Had a great exploration session today! Discovered some new interesting streets in the downtown area."
        : null,
  });

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

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDayPress = (day, data) => {
    setSelectedDay(day);
    setModalVisible(true);
  };

  const navigateMonth = (direction) => {
    if (direction === "next") {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const today = new Date().getDate();
    const isCurrentMonth =
      currentMonth === new Date().getMonth() &&
      currentYear === new Date().getFullYear();

    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} className="w-12 h-12 m-1" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = generateSampleData(day);
      const isToday = isCurrentMonth && day === today;

      days.push(
        <CalendarDay
          key={day}
          day={day}
          data={dayData}
          onPress={handleDayPress}
          isToday={isToday}
          isSelected={selectedDay === day}
        />
      );
    }

    return days;
  };

  return (
    <PageContainer>
      {/* <Header title="Settings" /> */}

      <ScrollView className="flex-1 px-4">
        {/* Month Navigation */}
        <Card className="mt-6">
          <RowLayout className="justify-between mb-4">
            <TouchableOpacity onPress={() => navigateMonth("prev")}>
              <AntDesign name="left" size={24} color="#6B7280" />
            </TouchableOpacity>

            <CardTitle>
              {monthNames[currentMonth]} {currentYear}
            </CardTitle>

            <TouchableOpacity onPress={() => navigateMonth("next")}>
              <AntDesign name="right" size={24} color="#6B7280" />
            </TouchableOpacity>
          </RowLayout>

          {/* Day Labels */}
          <View className="flex-row justify-around mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <Text
                key={index}
                className="w-12 text-center text-gray-500 font-semibold text-sm"
              >
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View className="flex-row flex-wrap">{renderCalendar()}</View>

          {/* Legend */}
          <View className="mt-4 pt-4 border-t border-gray-100">
            <View className="flex-row justify-around">
              <RowLayout>
                <View className="w-4 h-4 rounded bg-orange-400 mr-2" />
                <MutedText>Today</MutedText>
              </RowLayout>
              <RowLayout>
                <View className="w-4 h-4 rounded bg-green-100 border border-green-200 mr-2" />
                <MutedText>Active Day</MutedText>
              </RowLayout>
              <RowLayout>
                <View className="w-4 h-4 rounded bg-gray-50 border border-gray-100 mr-2" />
                <MutedText>No Data</MutedText>
              </RowLayout>
            </View>
          </View>
        </Card>

        {/* Monthly Stats */}
        <Card className="mt-4 mb-6">
          <CardTitle className="mb-4">This Month</CardTitle>
          <View className="space-y-3">
            <RowLayout className="justify-between">
              <BodyText>Total Steps</BodyText>
              <BodyText className="font-bold">142,350</BodyText>
            </RowLayout>
            <RowLayout className="justify-between">
              <BodyText>Streets Explored</BodyText>
              <BodyText className="font-bold">287</BodyText>
            </RowLayout>
            <RowLayout className="justify-between">
              <BodyText>Active Days</BodyText>
              <BodyText className="font-bold">23/31</BodyText>
            </RowLayout>
          </View>
        </Card>
      </ScrollView>

      {/* Day Detail Modal */}
      <DayDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        dayData={selectedDay ? generateSampleData(selectedDay) : null}
        selectedDay={selectedDay}
      />
    </PageContainer>
  );
};

export default CalendarScreen;
