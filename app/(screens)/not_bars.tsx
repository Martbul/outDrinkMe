import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  Keyboard,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { AlertModal } from "@/components/alert_modal";
import { NestedScreenHeader } from "@/components/nestedScreenHeader";
import { useAuth } from "@clerk/clerk-expo";
import { apiService } from "@/api";
import { useApp } from "@/providers/AppProvider";
import { NotBarsPlace } from "@/types/api.types";



export default function NotBarsScreen() {
  const { notBarPlaces, setNotBarPlaces, isLoading } = useApp();
  const { getToken } = useAuth();

  const [inputText, setInputText] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);

  const visitedCount = notBarPlaces.filter((p: NotBarsPlace) => p.visited).length;
  const progress = notBarPlaces.length > 0 ? Math.round((visitedCount / notBarPlaces.length) * 100) : 0;


  const handleAddPress = () => {
    if (inputText.trim().length === 0) return;
    Keyboard.dismiss();
    setShowConfirmModal(true);
  };

  const finalizeAddPlace = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = await getToken();
      if (!token) return;

      const safeText = inputText.trim();

      // Call API to create custom place
      const newPlace = await apiService.addNotBarPlace(safeText, token);

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setNotBarPlaces([...notBarPlaces, newPlace]);
      setInputText("");
      setShowConfirmModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert("Error", "Could not add place: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleVisit = async (id: string) => {
    const oldPlaces = [...notBarPlaces];
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setNotBarPlaces(notBarPlaces.map((p: NotBarsPlace) => (p.id === id ? { ...p, visited: !p.visited } : p)));
    Haptics.selectionAsync();

    try {
      const token = await getToken();
      if (!token) return;
      await apiService.toggleNotBarPlaceVisit(id, token);
    } catch (error) {
      setNotBarPlaces(oldPlaces);
      Alert.alert("Error", "Could not update status");
    }
  };

  const updateRating = async (id: string, rating: number) => {
    const oldPlaces = [...notBarPlaces];
    // Optimistic update
    setNotBarPlaces(notBarPlaces.map((p: NotBarsPlace) => (p.id === id ? { ...p, rating } : p)));
    Haptics.selectionAsync();

    try {
      const token = await getToken();
      if (!token) return;
      await apiService.rateNotBarPlace(id, rating, token);
    } catch (error) {
      setNotBarPlaces(oldPlaces);
      Alert.alert("Error", "Could not update rating");
    }
  };

  const moveItem = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === notBarPlaces.length - 1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newPlaces = [...notBarPlaces];

    // Swap
    [newPlaces[index], newPlaces[newIndex]] = [newPlaces[newIndex], newPlaces[index]];

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNotBarPlaces(newPlaces);
    Haptics.selectionAsync();

    // Debounced API call would go here to save order
    try {
      const token = await getToken();
      if (!token) return;
      // Sending the new array order to server
      await apiService.updateNotBarPlacesOrder(
        newPlaces.map((p: NotBarsPlace) => p.id),
        token
      );
    } catch (error) {
      console.error("Failed to save order");
    }
  };

  // Sort notBarPlaces based on current order (assuming array index = order)
  const sortedPlaces = notBarPlaces; // or notBarPlaces.sort((a, b) => a.order - b.order) if using explicit order field

  return (
    <View className="flex-1 bg-black">
      <NestedScreenHeader title="Not Bars" eyebrow="TOUCHING GRASS" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#EA580C" />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 24,
              paddingBottom: 100,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* PROGRESS CARD */}
            <View className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 mb-8">
              <View className="flex-row justify-between items-end mb-4">
                <View>
                  <Text className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">EXPLORED</Text>
                  <Text className="text-white text-3xl font-black">{progress}%</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setIsEditMode(!isEditMode);
                    Haptics.selectionAsync();
                  }}
                  className={`items-end px-3 py-1 rounded-lg border ${
                    isEditMode ? "bg-orange-600/20 border-orange-600" : "border-transparent"
                  }`}
                >
                  <Ionicons
                    name={isEditMode ? "checkmark" : "pencil"}
                    size={16}
                    color={isEditMode ? "#EA580C" : "rgba(255,255,255,0.3)"}
                  />
                  <Text className="text-white/20 text-[10px] font-bold uppercase mt-1">
                    {isEditMode ? "Done" : "Edit Order"}
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="h-2 bg-white/10 rounded-full overflow-hidden">
                <View className="h-full bg-orange-600 rounded-full" style={{ width: `${progress}%` }} />
              </View>
            </View>


              <View className="mb-8">
              <View className="flex-row gap-3">
                <TextInput
                  placeholder="Add a custom spot (Museum, Park...)"
                  placeholderTextColor="#666"
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleAddPress}
                  returnKeyType="done"
                  className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-white font-semibold text-base"
                />
                <TouchableOpacity
                  onPress={handleAddPress}
                  disabled={inputText.length === 0}
                  className={`w-14 items-center justify-center rounded-xl ${
                    inputText.length === 0 ? "bg-white/[0.03] border border-white/10" : "bg-orange-600"
                  }`}
                >
                  <Ionicons name="add" size={30} color={inputText.length === 0 ? "#EA580C" : "#000000"} />
                </TouchableOpacity>
              </View>
            </View>

            <View className="gap-3">
              {sortedPlaces.map((item: NotBarsPlace, index: number) => (
                <View
                  key={item.id}
                  className={`flex-col p-4 rounded-2xl border ${
                    item.visited ? "bg-orange-600/10 border-orange-600/30" : "bg-white/[0.03] border-white/[0.08]"
                  }`}
                >
                  {/* Top Row: Checkbox & Name */}
                  <View className="flex-row items-center mb-3">
                    <TouchableOpacity
                      onPress={() => toggleVisit(item.id)}
                      activeOpacity={0.7}
                      className={`w-6 h-6 rounded-md items-center justify-center border mr-4 ${
                        item.visited ? "bg-orange-600 border-orange-600" : "border-white/20"
                      }`}
                    >
                      {item.visited && <Ionicons name="checkmark" size={16} color="white" />}
                    </TouchableOpacity>

                    <Text
                      className={`flex-1 text-base font-semibold ${
                        item.visited ? "text-white/30 line-through" : "text-white"
                      }`}
                    >
                      {item.name}
                    </Text>

                    {/* Badge for Custom notBarPlaces */}
                    {/* {item.isCustom && (
                      <View className="bg-white/10 px-2 py-1 rounded text-[10px] mr-2">
                        <Ionicons name="person" size={10} color="rgba(255,255,255,0.5)" />
                      </View>
                    )} */}

                    {/* Reordering Controls (Only visible in Edit Mode) */}
                    {isEditMode && (
                      <View className="flex-row ml-2 bg-black/20 rounded-lg p-1">
                        <TouchableOpacity
                          onPress={() => moveItem(index, "up")}
                          disabled={index === 0}
                          className="p-1 opacity-80"
                        >
                          <Ionicons name="chevron-up" size={18} color={index === 0 ? "#333" : "#fff"} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => moveItem(index, "down")}
                          disabled={index === notBarPlaces.length - 1}
                          className="p-1 opacity-80"
                        >
                          <Ionicons
                            name="chevron-down"
                            size={18}
                            color={index === notBarPlaces.length - 1 ? "#333" : "#fff"}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  <View className="flex-row items-center justify-between pl-10">
                    <Text className="text-white/20 text-xs font-bold uppercase tracking-wider">Rating</Text>
                    <View className="flex-row gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                          key={star}
                          onPress={() => updateRating(item.id, star)}
                          hitSlop={{ top: 10, bottom: 10, left: 2, right: 2 }}
                        >
                          <Ionicons
                            name={star <= item.rating ? "star" : "star-outline"}
                            size={16}
                            color={star <= item.rating ? "#EA580C" : "rgba(255,255,255,0.2)"}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              ))}

              {notBarPlaces.length === 0 && (
                <View className="items-center py-10 opacity-70">
                  <Ionicons name="map" size={64} color="#EA580C" />
                  <Text className="text-white mt-4 font-bold text-xl">No notBarPlaces found</Text>
                  <Text className="text-white/40 text-sm mt-2">Go find some culture.</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      <AlertModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={finalizeAddPlace}
        title="ADD PLACE?"
        message="Is this place actually cool or just another tourist trap?"
        cancelText="CANCEL"
        confirmText={isSubmitting ? "ADDING..." : "ADD IT"}
        isLoading={isSubmitting}
        icon="location"
      />
    </View>
  );
}
