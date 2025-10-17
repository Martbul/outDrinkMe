// // import React, { useState } from "react";
// // import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
// // import { Ionicons, AntDesign, Feather } from "@expo/vector-icons";
// // import { SafeAreaView } from "react-native-safe-area-context";
// // import {
// //   BodyText,
// //   Card,
// //   CardTitle,
// //   IconContainer,
// //   MutedText,
// //   PageContainer,
// //   PageTitle,
// //   RowLayout,
// // } from "@/components/custom";

// // const CalendarDay = ({ day, data, onPress, isToday, isSelected }) => {
// //   const hasData =
// //     data && (data.steps > 0 || data.streetsVisited > 0 || data.timeActive > 0);

// //   return (
// //     <TouchableOpacity
// //       onPress={() => onPress(day, data)}
// //       className={`
// //         w-12 h-12 rounded-xl flex items-center justify-center m-1
// //         ${isSelected ? "bg-blue-500" : isToday ? "bg-orange-400" : hasData ? "bg-green-100" : "bg-gray-50"}
// //         ${hasData ? "border border-green-200" : "border border-gray-100"}
// //       `}
// //     >
// //       <Text
// //         className={`
// //         text-sm font-semibold
// //         ${isSelected ? "text-white" : isToday ? "text-white" : hasData ? "text-green-700" : "text-gray-600"}
// //       `}
// //       >
// //         {day}
// //       </Text>
// //     </TouchableOpacity>
// //   );
// // };

// // const DayDetailModal = ({ visible, onClose, dayData, selectedDay }) => {
// //   if (!dayData) return null;

// //   return (
// //     <Modal
// //       visible={visible}
// //       animationType="slide"
// //       presentationStyle="pageSheet"
// //       onRequestClose={onClose}
// //     >
// //       <SafeAreaView className="flex-1 bg-containerBg">
// //         <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
// //           <PageTitle className="mb-0">Day {selectedDay}</PageTitle>
// //           <TouchableOpacity onPress={onClose}>
// //             <AntDesign name="close" size={24} color="#6B7280" />
// //           </TouchableOpacity>
// //         </View>

// //         <ScrollView className="flex-1 p-4">
// //           <View className="space-y-4">
// //             {/* Activity Summary */}
// //             <Card>
// //               <CardTitle className="mb-4">Activity Summary</CardTitle>
// //               <View className="space-y-3">
// //                 <RowLayout className="justify-between">
// //                   <RowLayout>
// //                     <IconContainer size="small" color="green">
// //                       <Feather name="activity" size={16} color="#10B981" />
// //                     </IconContainer>
// //                     <BodyText className="ml-3">Steps</BodyText>
// //                   </RowLayout>
// //                   <BodyText className="font-bold">
// //                     {dayData.steps.toLocaleString()}
// //                   </BodyText>
// //                 </RowLayout>

// //                 <RowLayout className="justify-between">
// //                   <RowLayout>
// //                     <IconContainer size="small" color="blue">
// //                       <Ionicons name="map" size={16} color="#3B82F6" />
// //                     </IconContainer>
// //                     <BodyText className="ml-3">Streets Visited</BodyText>
// //                   </RowLayout>
// //                   <BodyText className="font-bold">
// //                     {dayData.streetsVisited}
// //                   </BodyText>
// //                 </RowLayout>

// //                 <RowLayout className="justify-between">
// //                   <RowLayout>
// //                     <IconContainer size="small" color="accent">
// //                       <Ionicons name="time" size={16} color="#F59E0B" />
// //                     </IconContainer>
// //                     <BodyText className="ml-3">Active Time</BodyText>
// //                   </RowLayout>
// //                   <BodyText className="font-bold">
// //                     {dayData.timeActive} min
// //                   </BodyText>
// //                 </RowLayout>
// //               </View>
// //             </Card>

// //             {/* Distance & Exploration */}
// //             <Card>
// //               <CardTitle className="mb-4">Distance & Exploration</CardTitle>
// //               <View className="space-y-3">
// //                 <RowLayout className="justify-between">
// //                   <BodyText>Distance Traveled</BodyText>
// //                   <BodyText className="font-bold">
// //                     {dayData.distance} km
// //                   </BodyText>
// //                 </RowLayout>

// //                 <RowLayout className="justify-between">
// //                   <BodyText>New Areas</BodyText>
// //                   <BodyText className="font-bold">{dayData.newAreas}</BodyText>
// //                 </RowLayout>

// //                 <RowLayout className="justify-between">
// //                   <BodyText>Exploration Score</BodyText>
// //                   <BodyText className="font-bold text-green-600">
// //                     {dayData.explorationScore}/100
// //                   </BodyText>
// //                 </RowLayout>
// //               </View>
// //             </Card>

// //             {/* Weather & Mood */}
// //             <Card>
// //               <CardTitle className="mb-4">Conditions</CardTitle>
// //               <View className="space-y-3">
// //                 <RowLayout className="justify-between">
// //                   <BodyText>Weather</BodyText>
// //                   <RowLayout>
// //                     <Text className="text-2xl mr-2">
// //                       {dayData.weather.icon}
// //                     </Text>
// //                     <BodyText className="font-bold">
// //                       {dayData.weather.condition}
// //                     </BodyText>
// //                   </RowLayout>
// //                 </RowLayout>

// //                 <RowLayout className="justify-between">
// //                   <BodyText>Temperature</BodyText>
// //                   <BodyText className="font-bold">
// //                     {dayData.weather.temp}°C
// //                   </BodyText>
// //                 </RowLayout>

// //                 <RowLayout className="justify-between">
// //                   <BodyText>Energy Level</BodyText>
// //                   <View className="flex-row">
// //                     {[1, 2, 3, 4, 5].map((star) => (
// //                       <Ionicons
// //                         key={star}
// //                         name="star"
// //                         size={16}
// //                         color={
// //                           star <= dayData.energyLevel ? "#F59E0B" : "#E5E7EB"
// //                         }
// //                       />
// //                     ))}
// //                   </View>
// //                 </RowLayout>
// //               </View>
// //             </Card>

// //             {/* Notes */}
// //             {dayData.notes && (
// //               <Card>
// //                 <CardTitle className="mb-3">Notes</CardTitle>
// //                 <BodyText className="text-gray-700 leading-6">
// //                   {dayData.notes}
// //                 </BodyText>
// //               </Card>
// //             )}
// //           </View>
// //         </ScrollView>
// //       </SafeAreaView>
// //     </Modal>
// //   );
// // };

// // // Main Calendar Screen Component
// // const CalendarScreen = () => {
// //   const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
// //   const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
// //   const [selectedDay, setSelectedDay] = useState(null);
// //   const [modalVisible, setModalVisible] = useState(false);

// //   // Sample data for demonstration
// //   const generateSampleData = (day) => ({
// //     steps: Math.floor(Math.random() * 8000) + 2000,
// //     streetsVisited: Math.floor(Math.random() * 12) + 1,
// //     timeActive: Math.floor(Math.random() * 90) + 30,
// //     distance: (Math.random() * 8 + 1).toFixed(1),
// //     newAreas: Math.floor(Math.random() * 3),
// //     explorationScore: Math.floor(Math.random() * 40) + 60,
// //     weather: {
// //       icon: ["☀️", "⛅", "🌧️", "❄️"][Math.floor(Math.random() * 4)],
// //       condition: ["Sunny", "Cloudy", "Rainy", "Snowy"][
// //         Math.floor(Math.random() * 4)
// //       ],
// //       temp: Math.floor(Math.random() * 25) + 5,
// //     },
// //     energyLevel: Math.floor(Math.random() * 5) + 1,
// //     notes:
// //       Math.random() > 0.7
// //         ? "Had a great exploration session today! Discovered some new interesting streets in the downtown area."
// //         : null,
// //   });

// //   const monthNames = [
// //     "January",
// //     "February",
// //     "March",
// //     "April",
// //     "May",
// //     "June",
// //     "July",
// //     "August",
// //     "September",
// //     "October",
// //     "November",
// //     "December",
// //   ];

// //   const getDaysInMonth = (month, year) => {
// //     return new Date(year, month + 1, 0).getDate();
// //   };

// //   const getFirstDayOfMonth = (month, year) => {
// //     return new Date(year, month, 1).getDay();
// //   };

// //   const handleDayPress = (day, data) => {
// //     setSelectedDay(day);
// //     setModalVisible(true);
// //   };

// //   const navigateMonth = (direction) => {
// //     if (direction === "next") {
// //       if (currentMonth === 11) {
// //         setCurrentMonth(0);
// //         setCurrentYear(currentYear + 1);
// //       } else {
// //         setCurrentMonth(currentMonth + 1);
// //       }
// //     } else {
// //       if (currentMonth === 0) {
// //         setCurrentMonth(11);
// //         setCurrentYear(currentYear - 1);
// //       } else {
// //         setCurrentMonth(currentMonth - 1);
// //       }
// //     }
// //   };

// //   const renderCalendar = () => {
// //     const daysInMonth = getDaysInMonth(currentMonth, currentYear);
// //     const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
// //     const today = new Date().getDate();
// //     const isCurrentMonth =
// //       currentMonth === new Date().getMonth() &&
// //       currentYear === new Date().getFullYear();

// //     const days = [];

// //     // Empty cells for days before month starts
// //     for (let i = 0; i < firstDay; i++) {
// //       days.push(<View key={`empty-${i}`} className="w-12 h-12 m-1" />);
// //     }

// //     // Days of the month
// //     for (let day = 1; day <= daysInMonth; day++) {
// //       const dayData = generateSampleData(day);
// //       const isToday = isCurrentMonth && day === today;

// //       days.push(
// //         <CalendarDay
// //           key={day}
// //           day={day}
// //           data={dayData}
// //           onPress={handleDayPress}
// //           isToday={isToday}
// //           isSelected={selectedDay === day}
// //         />
// //       );
// //     }

// //     return days;
// //   };

// //   return (
// //     <PageContainer>
// //       {/* <Header title="Settings" /> */}

// //       <ScrollView className="flex-1 px-4">
// //         {/* Month Navigation */}
// //         <Card className="mt-6">
// //           <RowLayout className="justify-between mb-4">
// //             <TouchableOpacity onPress={() => navigateMonth("prev")}>
// //               <AntDesign name="left" size={24} color="#6B7280" />
// //             </TouchableOpacity>

// //             <CardTitle>
// //               {monthNames[currentMonth]} {currentYear}
// //             </CardTitle>

// //             <TouchableOpacity onPress={() => navigateMonth("next")}>
// //               <AntDesign name="right" size={24} color="#6B7280" />
// //             </TouchableOpacity>
// //           </RowLayout>

// //           {/* Day Labels */}
// //           <View className="flex-row justify-around mb-2">
// //             {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
// //               <Text
// //                 key={index}
// //                 className="w-12 text-center text-gray-500 font-semibold text-sm"
// //               >
// //                 {day}
// //               </Text>
// //             ))}
// //           </View>

// //           {/* Calendar Grid */}
// //           <View className="flex-row flex-wrap">{renderCalendar()}</View>

// //           {/* Legend */}
// //           <View className="mt-4 pt-4 border-t border-gray-100">
// //             <View className="flex-row justify-around">
// //               <RowLayout>
// //                 <View className="w-4 h-4 rounded bg-orange-400 mr-2" />
// //                 <MutedText>Today</MutedText>
// //               </RowLayout>
// //               <RowLayout>
// //                 <View className="w-4 h-4 rounded bg-green-100 border border-green-200 mr-2" />
// //                 <MutedText>Active Day</MutedText>
// //               </RowLayout>
// //               <RowLayout>
// //                 <View className="w-4 h-4 rounded bg-gray-50 border border-gray-100 mr-2" />
// //                 <MutedText>No Data</MutedText>
// //               </RowLayout>
// //             </View>
// //           </View>
// //         </Card>

// //         {/* Monthly Stats */}
// //         <Card className="mt-4 mb-6">
// //           <CardTitle className="mb-4">This Month</CardTitle>
// //           <View className="space-y-3">
// //             <RowLayout className="justify-between">
// //               <BodyText>Total Steps</BodyText>
// //               <BodyText className="font-bold">142,350</BodyText>
// //             </RowLayout>
// //             <RowLayout className="justify-between">
// //               <BodyText>Streets Explored</BodyText>
// //               <BodyText className="font-bold">287</BodyText>
// //             </RowLayout>
// //             <RowLayout className="justify-between">
// //               <BodyText>Active Days</BodyText>
// //               <BodyText className="font-bold">23/31</BodyText>
// //             </RowLayout>
// //           </View>
// //         </Card>
// //       </ScrollView>

// //       {/* Day Detail Modal */}
// //       <DayDetailModal
// //         visible={modalVisible}
// //         onClose={() => setModalVisible(false)}
// //         dayData={selectedDay ? generateSampleData(selectedDay) : null}
// //         selectedDay={selectedDay}
// //       />
// //     </PageContainer>
// //   );
// // };

// // export default CalendarScreen;

// import { useApp } from "@/providers/AppProvider";
// import React, { useState } from "react";
// import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// const CalendarDay = ({ day, drank, onPress, isToday, isSelected }) => {

//   return (
//     <TouchableOpacity
//       onPress={() => onPress(day, drank)}
//       className={`
//         w-11 h-11 rounded-lg flex items-center justify-center m-0.5
//         ${
//           isSelected
//             ? "bg-orange-600"
//             : isToday
//               ? "bg-gray-700 border-2 border-orange-600"
//               : drank
//                 ? "bg-orange-600/30"
//                 : "bg-gray-900"
//         }
//         border ${drank && !isSelected && !isToday ? "border-orange-600/50" : "border-gray-800"}
//       `}
//     >
//       <Text
//         className={`
//         text-sm font-bold
//         ${
//           isSelected || isToday
//             ? "text-white"
//             : drank
//               ? "text-orange-500"
//               : "text-gray-600"
//         }
//       `}
//       >
//         {day}
//       </Text>
//     </TouchableOpacity>
//   );
// };

// const DayDetailModal = ({ visible, onClose, dayData, selectedDay }) => {
//   if (!dayData) return null;

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       presentationStyle="pageSheet"
//       onRequestClose={onClose}
//     >
//       <SafeAreaView className="flex-1 bg-black">
//         {/* Header */}
//         <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-900">
//           <View>
//             <Text className="text-white text-2xl font-black">
//               Day {selectedDay}
//             </Text>
//             <Text className="text-gray-500 text-sm mt-1">Details</Text>
//           </View>
//           <TouchableOpacity
//             onPress={onClose}
//             className="w-10 h-10 rounded-xl bg-gray-900 items-center justify-center"
//           >
//             <Text className="text-gray-400 text-xl">✕</Text>
//           </TouchableOpacity>
//         </View>

//         <ScrollView className="flex-1 px-4 pt-6">
//           {/* Status */}
//           <View className="bg-gray-900 rounded-2xl p-6 mb-4 border border-gray-800">
//             <Text className="text-gray-400 text-xs uppercase tracking-wider mb-3">
//               Status
//             </Text>
//             <View className="flex-row items-center">
//               <View
//                 className={`w-14 h-14 rounded-xl ${dayData.drank ? "bg-orange-600/20" : "bg-gray-800"} items-center justify-center mr-4`}
//               >
//                 <Text className="text-4xl">{dayData.drank ? "✅" : "❌"}</Text>
//               </View>
//               <View className="flex-1">
//                 <Text className="text-white text-xl font-bold mb-1">
//                   {dayData.drank ? "Logged" : "Not Logged"}
//                 </Text>
//                 <Text className="text-gray-500 text-sm">
//                   {dayData.drank ? "You drank this day" : "No drinking logged"}
//                 </Text>
//               </View>
//             </View>
//           </View>

//           {/* Streak Info */}
//           {dayData.drank && (
//             <View className="bg-gray-900 rounded-2xl p-6 mb-4 border border-gray-800">
//               <Text className="text-gray-400 text-xs uppercase tracking-wider mb-3">
//                 Streak
//               </Text>
//               <View className="flex-row items-center justify-between">
//                 <View>
//                   <Text className="text-white text-3xl font-black mb-1">
//                     {dayData.streakOnDay} Days
//                   </Text>
//                   <Text className="text-gray-500 text-sm">
//                     Active streak on this day
//                   </Text>
//                 </View>
//                 <View className="bg-orange-600/20 px-4 py-2 rounded-lg">
//                   <Text className="text-orange-500 text-sm font-bold">
//                     🔥 Active
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           )}

//           {/* Week Context */}
//           <View className="bg-gray-900 rounded-2xl p-6 mb-4 border border-gray-800">
//             <Text className="text-gray-400 text-xs uppercase tracking-wider mb-4">
//               Week Overview
//             </Text>
//             <View className="flex-row justify-between mb-3">
//               {["M", "T", "W", "T", "F", "S", "S"].map((dayName, index) => (
//                 <View key={index} className="items-center">
//                   <View
//                     className={`w-10 h-10 rounded-lg ${index <= 4 ? "bg-orange-600/30 border border-orange-600/50" : "bg-gray-800"} items-center justify-center mb-1`}
//                   >
//                     <Text
//                       className={`text-xs font-bold ${index <= 4 ? "text-orange-500" : "text-gray-600"}`}
//                     >
//                       {index <= 4 ? "✓" : ""}
//                     </Text>
//                   </View>
//                   <Text className="text-gray-600 text-xs font-semibold">
//                     {dayName}
//                   </Text>
//                 </View>
//               ))}
//             </View>
//             <View className="flex-row justify-between pt-4 border-t border-gray-800">
//               <Text className="text-gray-500 text-sm">This week</Text>
//               <Text className="text-white font-bold">5/7 days</Text>
//             </View>
//           </View>

//           {/* Additional Stats */}
//           <View className="bg-gray-900 rounded-2xl p-6 mb-24 border border-gray-800">
//             <Text className="text-gray-400 text-xs uppercase tracking-wider mb-4">
//               Stats
//             </Text>

//             <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-800">
//               <Text className="text-gray-400 text-sm">Rank on this day</Text>
//               <Text className="text-white font-bold">#2</Text>
//             </View>

//             <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-800">
//               <Text className="text-gray-400 text-sm">Friends active</Text>
//               <Text className="text-white font-bold">8/12</Text>
//             </View>

//             <View className="flex-row justify-between">
//               <Text className="text-gray-400 text-sm">Time logged</Text>
//               <Text className="text-white font-bold">9:32 PM</Text>
//             </View>
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </Modal>
//   );
// };

// // Main Calendar Screen Component
// const CalendarScreen = () => {
//     const { userData, userStats, calendar, isLoading, error } = useApp();

//   const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
//   const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
//   const [selectedDay, setSelectedDay] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);

//   // Sample data for demonstration
//   const generateSampleData = (day) => ({
//     drank: day % 3 !== 0, // Random pattern for demo
//     streakOnDay: day % 3 !== 0 ? Math.min(day, 7) : 0,
//   });

//   const monthNames = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   const getDaysInMonth = (month, year) => {
//     return new Date(year, month + 1, 0).getDate();
//   };

//   const getFirstDayOfMonth = (month, year) => {
//     return new Date(year, month, 1).getDay();
//   };

//   const handleDayPress = (day, drank) => {
//     setSelectedDay(day);
//     setModalVisible(true);
//   };

//   const navigateMonth = (direction) => {
//     if (direction === "next") {
//       if (currentMonth === 11) {
//         setCurrentMonth(0);
//         setCurrentYear(currentYear + 1);
//       } else {
//         setCurrentMonth(currentMonth + 1);
//       }
//     } else {
//       if (currentMonth === 0) {
//         setCurrentMonth(11);
//         setCurrentYear(currentYear - 1);
//       } else {
//         setCurrentMonth(currentMonth - 1);
//       }
//     }
//   };

//   const renderCalendar = () => {
//     const daysInMonth = getDaysInMonth(currentMonth, currentYear);
//     const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
//     const today = new Date().getDate();
//     const isCurrentMonth =
//       currentMonth === new Date().getMonth() &&
//       currentYear === new Date().getFullYear();

//     const days = [];

//     // Empty cells for days before month starts
//     for (let i = 0; i < firstDay; i++) {
//       days.push(<View key={`empty-${i}`} className="w-11 h-11 m-0.5" />);
//     }

//     // Days of the month
//     for (let day = 1; day <= daysInMonth; day++) {
//       const dayData = generateSampleData(day);
//       const isToday = isCurrentMonth && day === today;

//       days.push(
//         <CalendarDay
//           key={day}
//           day={day}
//           drank={dayData.drank}
//           onPress={handleDayPress}
//           isToday={isToday}
//           isSelected={selectedDay === day}
//         />
//       );
//     }

//     return days;
//   };

//   // Calculate stats
//   const daysInMonth = getDaysInMonth(currentMonth, currentYear);
//   const activeDays = Math.floor(daysInMonth * 0.7); // 70% for demo
//   const currentStreak = 7;
//   const longestStreak = 12;

//   return (
//     <View className="flex-1 bg-black">
//       <ScrollView className="flex-1 px-4 pt-6">
//         {/* Header */}
//         <View className="mb-6">
//           <Text className="text-white text-2xl font-black mb-1">Calendar</Text>
//           <Text className="text-gray-500 text-sm">Your drinking history</Text>
//         </View>

//         {/* Current Stats */}
//         <View className="flex-row gap-3 mb-6">
//           <View className="flex-1 bg-gray-900 rounded-xl p-4 border border-gray-800">
//             <Text className="text-gray-500 text-xs uppercase tracking-wider mb-1">
//               Streak
//             </Text>
//             <Text className="text-white text-2xl font-black">
//               {currentStreak}
//             </Text>
//             <Text className="text-gray-600 text-xs mt-1">days 🔥</Text>
//           </View>
//           <View className="flex-1 bg-gray-900 rounded-xl p-4 border border-gray-800">
//             <Text className="text-gray-500 text-xs uppercase tracking-wider mb-1">
//               Best
//             </Text>
//             <Text className="text-white text-2xl font-black">
//               {longestStreak}
//             </Text>
//             <Text className="text-gray-600 text-xs mt-1">days max</Text>
//           </View>
//         </View>

//         {/* Month Navigation */}
//         <View className="bg-gray-900 rounded-2xl p-4 mb-4 border border-gray-800">
//           <View className="flex-row justify-between items-center mb-4">
//             <TouchableOpacity
//               onPress={() => navigateMonth("prev")}
//               className="w-10 h-10 rounded-lg bg-gray-800 items-center justify-center"
//             >
//               <Text className="text-gray-400 text-lg font-bold">←</Text>
//             </TouchableOpacity>

//             <View className="items-center">
//               <Text className="text-white text-xl font-black">
//                 {monthNames[currentMonth]}
//               </Text>
//               <Text className="text-gray-500 text-sm">{currentYear}</Text>
//             </View>

//             <TouchableOpacity
//               onPress={() => navigateMonth("next")}
//               className="w-10 h-10 rounded-lg bg-gray-800 items-center justify-center"
//             >
//               <Text className="text-gray-400 text-lg font-bold">→</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Day Labels */}
//           <View className="flex-row justify-around mb-2">
//             {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
//               <Text
//                 key={index}
//                 className="w-11 text-center text-gray-600 font-bold text-xs uppercase"
//               >
//                 {day}
//               </Text>
//             ))}
//           </View>

//           {/* Calendar Grid */}
//           <View className="flex-row flex-wrap">{renderCalendar()}</View>

//           {/* Legend */}
//           <View className="mt-4 pt-4 border-t border-gray-800">
//             <View className="flex-row justify-around">
//               <View className="flex-row items-center">
//                 <View className="w-5 h-5 rounded bg-orange-600/30 border border-orange-600/50 mr-2" />
//                 <Text className="text-gray-500 text-xs font-semibold">
//                   Logged
//                 </Text>
//               </View>
//               <View className="flex-row items-center">
//                 <View className="w-5 h-5 rounded bg-gray-700 border-2 border-orange-600 mr-2" />
//                 <Text className="text-gray-500 text-xs font-semibold">
//                   Today
//                 </Text>
//               </View>
//               <View className="flex-row items-center">
//                 <View className="w-5 h-5 rounded bg-gray-900 border border-gray-800 mr-2" />
//                 <Text className="text-gray-500 text-xs font-semibold">
//                   None
//                 </Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Monthly Stats */}
//         <View className="bg-gray-900 rounded-2xl p-6 mb-24 border border-gray-800">
//           <Text className="text-gray-400 text-xs uppercase tracking-wider mb-4">
//             This Month
//           </Text>

//           <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-800">
//             <Text className="text-gray-400 text-sm">Active Days</Text>
//             <Text className="text-white font-bold">
//               {activeDays}/{daysInMonth}
//             </Text>
//           </View>

//           <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-800">
//             <Text className="text-gray-400 text-sm">Completion Rate</Text>
//             <Text className="text-white font-bold">
//               {Math.round((activeDays / daysInMonth) * 100)}%
//             </Text>
//           </View>

//           <View className="flex-row justify-between">
//             <Text className="text-gray-400 text-sm">Current Rank</Text>
//             <Text className="text-white font-bold">#2</Text>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Day Detail Modal */}
//       <DayDetailModal
//         visible={modalVisible}
//         onClose={() => setModalVisible(false)}
//         dayData={selectedDay ? generateSampleData(selectedDay) : null}
//         selectedDay={selectedDay}
//       />
//     </View>
//   );
// };

// export default CalendarScreen;
import { useApp } from "@/providers/AppProvider";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
              ? "bg-gray-700 border-2 border-orange-600"
              : drank
                ? "bg-orange-600/30"
                : "bg-gray-900"
        }
        border ${drank && !isSelected && !isToday ? "border-orange-600/50" : "border-gray-800"}
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
              : "text-gray-600"
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
}) => {
  if (!dayData) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-black">
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-900">
          <View>
            <Text className="text-white text-2xl font-black">
              Day {selectedDay}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              {new Date(dayData.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 rounded-xl bg-gray-900 items-center justify-center"
          >
            <Text className="text-gray-400 text-xl">✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 pt-6">
          {/* Status */}
          <View className="bg-gray-900 rounded-2xl p-6 mb-4 border border-gray-800">
            <Text className="text-gray-400 text-xs uppercase tracking-wider mb-3">
              Status
            </Text>
            <View className="flex-row items-center">
              <View
                className={`w-14 h-14 rounded-xl ${dayData.drank_today ? "bg-orange-600/20" : "bg-gray-800"} items-center justify-center mr-4`}
              >
                <Text className="text-4xl">
                  {dayData.drank_today ? "✅" : "❌"}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white text-xl font-bold mb-1">
                  {dayData.drank_today ? "Logged" : "Not Logged"}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {dayData.drank_today
                    ? "You drank this day"
                    : "No drinking logged"}
                </Text>
              </View>
            </View>
          </View>

          {/* Current Stats Context */}
          {dayData.drank_today && userStats && (
            <View className="bg-gray-900 rounded-2xl p-6 mb-4 border border-gray-800">
              <Text className="text-gray-400 text-xs uppercase tracking-wider mb-3">
                Your Stats
              </Text>
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white text-3xl font-black mb-1">
                    {userStats.current_streak} Days
                  </Text>
                  <Text className="text-gray-500 text-sm">Current streak</Text>
                </View>
                <View className="bg-orange-600/20 px-4 py-2 rounded-lg">
                  <Text className="text-orange-500 text-sm font-bold">
                    🔥 Active
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Additional Stats */}
          {userStats && (
            <View className="bg-gray-900 rounded-2xl p-6 mb-24 border border-gray-800">
              <Text className="text-gray-400 text-xs uppercase tracking-wider mb-4">
                Overall Stats
              </Text>

              <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-800">
                <Text className="text-gray-400 text-sm">Total days drank</Text>
                <Text className="text-white font-bold">
                  {userStats.total_days_drank}
                </Text>
              </View>

              <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-800">
                <Text className="text-gray-400 text-sm">Longest streak</Text>
                <Text className="text-white font-bold">
                  {userStats.longest_streak} days
                </Text>
              </View>

              <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-800">
                <Text className="text-gray-400 text-sm">This month</Text>
                <Text className="text-white font-bold">
                  {userStats.days_this_month} days
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-400 text-sm">This week</Text>
                <Text className="text-white font-bold">
                  {userStats.days_this_week} days
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// Main Calendar Screen Component
const CalendarScreen = () => {
  const { userStats, calendar, isLoading, refreshCalendar } = useApp();

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-based
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
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

  // Fetch calendar data when month/year changes
  useEffect(() => {
    refreshCalendar(currentYear, currentMonth);
  }, [currentMonth, currentYear]);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const handleDayPress = (day, dayData) => {
    setSelectedDay(day);
    setSelectedDayData(dayData);
    setModalVisible(true);
  };

  const navigateMonth = (direction) => {
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

  // Get day data from calendar
  const getDayData = (day) => {
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

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} className="w-11 h-11 m-0.5" />);
    }

    // Days of the month
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

  // Calculate stats from calendar data
  const activeDays = calendar?.days?.filter((d) => d.drank_today).length || 0;
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const completionRate =
    daysInMonth > 0 ? Math.round((activeDays / daysInMonth) * 100) : 0;

  if (isLoading && !calendar) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#EA580C" />
        <Text className="text-gray-500 mt-4">Loading calendar...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 px-4 pt-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-white text-2xl font-black mb-1">Calendar</Text>
          <Text className="text-gray-500 text-sm">Your drinking history</Text>
        </View>

        {/* Current Stats */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-gray-900 rounded-xl p-4 border border-gray-800">
            <Text className="text-gray-500 text-xs uppercase tracking-wider mb-1">
              Streak
            </Text>
            <Text className="text-white text-2xl font-black">
              {userStats?.current_streak || 0}
            </Text>
            <Text className="text-gray-600 text-xs mt-1">days 🔥</Text>
          </View>
          <View className="flex-1 bg-gray-900 rounded-xl p-4 border border-gray-800">
            <Text className="text-gray-500 text-xs uppercase tracking-wider mb-1">
              Best
            </Text>
            <Text className="text-white text-2xl font-black">
              {userStats?.longest_streak || 0}
            </Text>
            <Text className="text-gray-600 text-xs mt-1">days max</Text>
          </View>
        </View>

        {/* Month Navigation */}
        <View className="bg-gray-900 rounded-2xl p-4 mb-4 border border-gray-800">
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity
              onPress={() => navigateMonth("prev")}
              className="w-10 h-10 rounded-lg bg-gray-800 items-center justify-center"
            >
              <Text className="text-gray-400 text-lg font-bold">←</Text>
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-white text-xl font-black">
                {monthNames[currentMonth - 1]}
              </Text>
              <Text className="text-gray-500 text-sm">{currentYear}</Text>
            </View>

            <TouchableOpacity
              onPress={() => navigateMonth("next")}
              className="w-10 h-10 rounded-lg bg-gray-800 items-center justify-center"
            >
              <Text className="text-gray-400 text-lg font-bold">→</Text>
            </TouchableOpacity>
          </View>

          {/* Day Labels */}
          <View className="flex-row justify-around mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <Text
                key={index}
                className="w-11 text-center text-gray-600 font-bold text-xs uppercase"
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
          <View className="mt-4 pt-4 border-t border-gray-800">
            <View className="flex-row justify-around">
              <View className="flex-row items-center">
                <View className="w-5 h-5 rounded bg-orange-600/30 border border-orange-600/50 mr-2" />
                <Text className="text-gray-500 text-xs font-semibold">
                  Logged
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-5 h-5 rounded bg-gray-700 border-2 border-orange-600 mr-2" />
                <Text className="text-gray-500 text-xs font-semibold">
                  Today
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-5 h-5 rounded bg-gray-900 border border-gray-800 mr-2" />
                <Text className="text-gray-500 text-xs font-semibold">
                  None
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Monthly Stats */}
        <View className="bg-gray-900 rounded-2xl p-6 mb-24 border border-gray-800">
          <Text className="text-gray-400 text-xs uppercase tracking-wider mb-4">
            This Month
          </Text>

          <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-800">
            <Text className="text-gray-400 text-sm">Active Days</Text>
            <Text className="text-white font-bold">
              {activeDays}/{daysInMonth}
            </Text>
          </View>

          <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-800">
            <Text className="text-gray-400 text-sm">Completion Rate</Text>
            <Text className="text-white font-bold">{completionRate}%</Text>
          </View>

          <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-800">
            <Text className="text-gray-400 text-sm">Total This Year</Text>
            <Text className="text-white font-bold">
              {userStats?.days_this_year || 0} days
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-400 text-sm">Current Rank</Text>
            <Text className="text-white font-bold">
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