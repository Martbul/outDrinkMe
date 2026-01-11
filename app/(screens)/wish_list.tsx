import React, { useState } from "react";
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

export default function WishListScreen() {
  const { wishList, setWishList, isLoading } = useApp();
  const { getToken } = useAuth();

  const [inputText, setInputText] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completedCount = wishList.filter((w) => w.completed).length;
  const progress = wishList.length > 0 ? Math.round((completedCount / wishList.length) * 100) : 0;

  const handleAddPress = () => {
    if (inputText.trim().length === 0) return;
    Keyboard.dismiss();
    if (wishList.length >= 10) return;
    setShowConfirmModal(true);
  };

  const finalizeAddWish = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = await getToken();
      if (!token) return;

      const safeText = inputText.trim();

      const newItem = await apiService.addWish(safeText, token);

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setWishList([...wishList, newItem]);
      setInputText("");
      setShowConfirmModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert("Error", "Could not add wish: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCheck = async (id: string) => {
    const oldWishes = [...wishList];
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setWishList(wishList.map((w) => (w.id === id ? { ...w, completed: !w.completed } : w)));
    Haptics.selectionAsync();

    try {
      const token = await getToken();
      if (!token) return;

      await apiService.toggleWishCheck(id, token);
    } catch (error) {
      setWishList(oldWishes);
      Alert.alert("Error", "Could not update status");
    }
  };

  return (
    <View className="flex-1 bg-black">
      <NestedScreenHeader title="Wishes" eyebrow="SUPER MEGA ULTRA IMPORTANT" />
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
            <View className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 mb-8">
              <View className="flex-row justify-between items-end mb-4">
                <View>
                  <Text className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">PROGRESS</Text>
                  <Text className="text-white text-3xl font-black">{progress}%</Text>
                </View>
                <View className="items-end">
                  <Text className="text-orange-600 font-bold text-lg">{wishList.length}/10</Text>
                  <Text className="text-white/20 text-[10px] font-bold uppercase">Wishes</Text>
                </View>
              </View>
              <View className="h-2 bg-white/10 rounded-full overflow-hidden">
                <View className="h-full bg-orange-600 rounded-full" style={{ width: `${progress}%` }} />
              </View>
            </View>

            {wishList.length < 10 ? (
              <View className="mb-8">
                <View className="flex-row gap-3">
                  <TextInput
                    placeholder="Add a shity goal (Drink fuel instead of coke)"
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
            ) : (
              <View className="mb-8 p-4 bg-orange-600/10 border border-orange-600/20 rounded-xl items-center flex-row justify-center gap-2">
                <Ionicons name="lock-closed" size={16} color="#EA580C" />
                <Text className="text-orange-500 font-bold text-sm">Monthly limit reached (10/10)</Text>
              </View>
            )}

            <View className="gap-3">
              {wishList.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => toggleCheck(item.id)}
                  activeOpacity={0.7}
                  className={`flex-row items-center p-4 rounded-2xl border ${
                    item.completed ? "bg-orange-600/10 border-orange-600/30" : "bg-white/[0.03] border-white/[0.08]"
                  }`}
                >
                  <View
                    className={`w-6 h-6 rounded-md items-center justify-center border mr-4 ${
                      item.completed ? "bg-orange-600 border-orange-600" : "border-white/20"
                    }`}
                  >
                    {item.completed && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>

                  <Text
                    className={`flex-1 text-base font-semibold ${
                      item.completed ? "text-white/30 line-through" : "text-white"
                    }`}
                  >
                    {item.text}
                  </Text>

                  <View className="p-2 opacity-20">
                    <Ionicons name="lock-closed" size={14} color="#fff" />
                  </View>
                </TouchableOpacity>
              ))}

              {wishList.length === 0 && (
                <View className="items-center py-10 opacity-70">
                  <Ionicons name="list" size={64} color="#EA580C" />
                  <Text className="text-white mt-4 font-bold text-xl">List is empty</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      <AlertModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={finalizeAddWish}
        title="COMMIT?"
        message="You cannot remove items from your list until next month. Make sure you really want to do this."
        cancelText="CANCEL"
        confirmText={isSubmitting ? "ADDING..." : "LOCK IN"}
        isLoading={isSubmitting}
        icon="alert-circle"
      />
    </View>
  );
}
