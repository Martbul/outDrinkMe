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

const TIERS = [
  { id: "S", label: "LEGENDARY", color: "#FF7F7F", description: "Life ruining but hilarious" },
  { id: "A", label: "MAJOR OOPS", color: "#FFBF7F", description: "Cost a lot of money/dignity" },
  { id: "B", label: "SOLID", color: "#FFFF7F", description: "Standard drunk chaos" },
  { id: "C", label: "MID", color: "#7FFFFF", description: "Just messy" },
  { id: "D", label: "MEH", color: "#7F7FFF", description: "Barely counts" },
  { id: "F", label: "WEAK", color: "#FF7FFF", description: "Went home early" },
];

export default function WallOfShameScreen() {
  const { shameList, setShameList, isLoading } = useApp();
  const { getToken } = useAuth();

  const [inputText, setInputText] = useState("");
  const [selectedTier, setSelectedTier] = useState("S"); // Default to S tier
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // -- SAFEGUARD: Ensure we have an array to work with --
  const safeShameList = shameList || [];

  const handleAddPress = () => {
    if (inputText.trim().length === 0) return;
    Keyboard.dismiss();
    setShowConfirmModal(true);
  };

  const finalizeAddShame = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = await getToken();
      if (!token) return;

      const safeText = inputText.trim();

      // Mock API call structure
      const newItem = await apiService.addShameItem(safeText, selectedTier, token);

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      // Use the safe list here too
      setShameList([...safeShameList, newItem]);
      setInputText("");
      setShowConfirmModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert("Error", "Could not archive shame: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteItem = async (id: string) => {
    Alert.alert("Delete Memory?", "Are you trying to erase history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const oldList = [...safeShameList];
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setShameList(safeShameList.filter((item) => item.id !== id));

          try {
            const token = await getToken();
            if (token) await apiService.deleteShameItem(id, token);
          } catch (e) {
            setShameList(oldList);
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-black">
      <NestedScreenHeader title="Wall of Shame" eyebrow="BLACKOUT ARCHIVES" />
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
            {/* INPUT SECTION */}
            <View className="mb-8">
              {/* Tier Selector */}
              <View className="flex-row justify-between mb-3 px-1">
                {TIERS.map((tier) => {
                  const isSelected = selectedTier === tier.id;
                  return (
                    <TouchableOpacity
                      key={tier.id}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedTier(tier.id);
                      }}
                      style={{
                        backgroundColor: isSelected ? tier.color : "#1A1A1A",
                        borderColor: isSelected ? tier.color : "rgba(255,255,255,0.1)",
                        borderWidth: 1,
                      }}
                      className={`w-10 h-10 rounded-lg items-center justify-center`}
                    >
                      <Text className={`font-black text-lg ${isSelected ? "text-black" : "text-white/40"}`}>
                        {tier.id}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Text Input */}
              <View className="flex-row gap-3">
                <TextInput
                  placeholder={`Add to ${selectedTier} Tier...`}
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
                  <Ionicons name="arrow-up" size={24} color={inputText.length === 0 ? "#EA580C" : "#000000"} />
                </TouchableOpacity>
              </View>
            </View>

            {/* THE TIER LIST */}
            <View className="gap-4">
              {TIERS.map((tier) => {
                // FIXED: Use safeShameList here to prevent crash on .filter
                const itemsInTier = safeShameList.filter((i) => i.tier === tier.id);

                return (
                  <View
                    key={tier.id}
                    className="flex-row rounded-xl overflow-hidden min-h-[80px] border border-white/10 bg-white/[0.02]"
                  >
                    {/* Left Column: The Tier Label */}
                    <View
                      style={{ backgroundColor: tier.color }}
                      className="w-16 items-center justify-center p-2 border-r border-black/20"
                    >
                      <Text className="text-black font-black text-3xl">{tier.id}</Text>
                      <Text className="text-black/60 font-bold text-[8px] text-center mt-1 leading-tight">
                        {tier.label}
                      </Text>
                    </View>

                    {/* Right Column: The Items */}
                    <View className="flex-1 p-2 flex-row flex-wrap gap-2 content-start">
                      {itemsInTier.length > 0 ? (
                        itemsInTier.map((item) => (
                          <TouchableOpacity
                            key={item.id}
                            onLongPress={() => deleteItem(item.id)}
                            activeOpacity={0.8}
                            className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 max-w-full"
                          >
                            <Text className="text-white text-xs font-medium leading-5">{item.text}</Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        // Empty state placeholder
                        <View className="flex-1 justify-center pl-2 opacity-10">
                          <Text className="text-white italic text-xs">{tier.description}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            <View className="mt-8 items-center">
              <Text className="text-white/20 text-xs text-center">
                Long press an item to delete it from history.{"\n"}(It still happened though)
              </Text>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      <AlertModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={finalizeAddShame}
        title={`RANK: ${selectedTier} TIER`}
        message="Are you sure you want to admit this happened?"
        cancelText="NEVERMIND"
        confirmText={isSubmitting ? "SAVING..." : "CONFESS"}
        isLoading={isSubmitting}
        icon="skull"
      />
    </View>
  );
} 
