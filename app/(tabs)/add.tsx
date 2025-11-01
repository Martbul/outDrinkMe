import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  Modal,
  Pressable,
  Image,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import Entypo from "@expo/vector-icons/Entypo";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { UserData } from "@/types/api.types";

export default function AddDrinksScreenV3() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userStats, friends, isLoading, addDrinking } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const [isAfterDrinkLoggedModalVisible, setAfterDrinkLoggedModal] =
    useState(false);

  const hasCompletedRef = useRef(false);

  // Check if user has already logged today
  const alreadyLogged = userStats?.today_status || false;
  const levelInfoDescr = "You are big drinker";

  const handleUpload = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      //TODO! Add data not only true value
      await addDrinking(true);
    } catch (error) {
      Alert.alert("Error", "Failed to log. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startHold = () => {
    setIsHolding(true);
    hasCompletedRef.current = false;
    let progress = 0;

    progressIntervalRef.current = setInterval(() => {
      progress += 2;
      setHoldProgress(progress);

      if (progress >= 100) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        hasCompletedRef.current = true;
        setIsHolding(false);
        setHoldProgress(0);
        setAfterDrinkLoggedModal(true);
      }
    }, 30);
  };

  const cancelHold = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Only reset if the hold wasn't completed
    if (!hasCompletedRef.current) {
      setHoldProgress(0);
      setIsHolding(false);
    }
  };

  const potentialStreak = (userStats?.current_streak || 0) + 1;

  if (alreadyLogged) {
    return (
      <View
        className="flex-1 bg-black px-4 justify-center"
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 40,
        }}
      >
        {/* Success Header */}
        <View className="mb-12 items-center">
          <View className="w-32 h-32 rounded-full bg-orange-600/20 items-center justify-center mb-6 border-4 border-orange-600/50">
            <Entypo name="check" size={84} color="#ff8c00" />
          </View>
          <Text className="text-white text-4xl font-black text-center leading-tight mb-3">
            Already Logged!
          </Text>
          <Text className="text-white/50 text-base text-center font-semibold">
            You are my alcoholic pride!{"\n"}Drink again tomorrow and keep your
            steak!
          </Text>
        </View>

        {/* Current Streak Display */}
        <View className="bg-white/[0.03] rounded-2xl p-6 mb-8 border border-white/[0.08]">
          <View className="items-center">
            <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-2">
              CURRENT STREAK
            </Text>
            <Text className="text-orange-600 text-6xl font-black mb-2">
              {userStats?.current_streak || 0}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/home")}
          className="bg-orange-600 rounded-2xl py-5"
        >
          <Text className="text-black text-base font-black text-center tracking-widest uppercase">
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-black px-4 justify-center"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 40,
      }}
    >
      <View className="mb-12">
        <View className="flex-row items-center justify-center mb-6">
          <View className="w-2 h-2 bg-orange-600 rounded-full mr-3" />
          <Text className="text-orange-600 text-xs font-black tracking-widest uppercase">
            Quick Log
          </Text>
        </View>
        <Text className="text-white text-5xl font-black text-center leading-tight">
          Did you{"\n"}drink today?
        </Text>
      </View>

      <View className="bg-white/[0.03] rounded-2xl p-6 mb-12 border border-white/[0.08]">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-1">
              CURRENT STREAK
            </Text>
            <Text className="text-white text-4xl font-black">
              {userStats?.current_streak || 0}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-orange-600 text-[11px] font-bold tracking-widest mb-1">
              NEXT
            </Text>
            <Text className="text-orange-600 text-3xl font-black">
              {potentialStreak}
            </Text>
          </View>
        </View>
      </View>

      <AdditionalInfoModal
        friends={friends}
        visible={isAfterDrinkLoggedModalVisible}
        isLoading={isLoading}
        handleUpload={handleUpload}
        onClose={() => setAfterDrinkLoggedModal(false)}
      />

      <View className="mb-6">
        <TouchableOpacity
          onPressIn={startHold}
          onPressOut={cancelHold}
          disabled={isSubmitting}
          activeOpacity={0.9}
          className="bg-orange-600 rounded-3xl overflow-hidden"
          style={{ height: 140 }}
        >
          <View className="flex-1 items-center justify-center">
            <Text className="text-black text-3xl font-black mb-2">
              {isHolding ? "HOLD..." : "DRINK"}
            </Text>
            <Text className="text-black/60 text-sm font-bold">
              Press and hold to confirm
            </Text>
          </View>
          {holdProgress > 0 && (
            <View
              className="absolute bottom-0 left-0 right-0 bg-black/30"
              style={{ height: `${holdProgress}%` }}
            />
          )}
        </TouchableOpacity>

        <Text className="text-white/50 text-xs text-center mt-3 font-semibold">
          Hold the button for 2 seconds to log
        </Text>
      </View>

      <TouchableOpacity onPress={() => router.back()} className="py-4 mb-8">
        <Text className="text-white/40 text-sm font-bold text-center">
          Not now
        </Text>
      </TouchableOpacity>
    </View>
  );
}

interface InfoTooltipProps {
  friends: UserData[];
  visible: boolean;
  isLoading: boolean;
  handleUpload: () => Promise<void>;
  onClose: () => void;
}

function AdditionalInfoModal({
  friends,
  visible,
  isLoading,
  handleUpload,
  onClose,
}: InfoTooltipProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [locationText, setLocationText] = useState("");
  const [mentionedBuddies, setMentionedBuddies] = useState<UserData[] | []>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isFriendsListVisible, setFriendsListVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const toggleFriendSelection = (friend: UserData) => {
    setMentionedBuddies((prev) => {
      const isAlreadySelected = prev.some((f) => f.id === friend.id);

      if (isAlreadySelected) {
        // Remove from selection
        return prev.filter((f) => f.id !== friend.id);
      } else {
        // Add to selection
        return [...prev, friend];
      }
    });
  };

  const isFriendSelected = (friendId: string) => {
    return mentionedBuddies.some((f) => f.id === friendId);
  };

  const handleImageUpload = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access your photos"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
      console.error(error);
    }
  };

  const handleLocationSelect = async () => {
    try {
      setIsLoadingLocation(true);

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access your location"
        );
        setIsLoadingLocation(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const formattedLocation = [
          address.street,
          address.city,
          address.region,
          address.country,
        ]
          .filter(Boolean)
          .join(", ");

        setLocationText(formattedLocation || "Location selected");
      } else {
        setLocationText(
          `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to get location");
      console.error(error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSkip = () => {
    // Reset state and close
    setImageUri(null);
    setLocationText("");
    onClose();
  };

  const renderEmptyFriendComponent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <ActivityIndicator size="large" color="#ff8c00" />
          <Text className="text-white/50 mt-4 text-sm font-semibold">
            Loading friends...
          </Text>
        </View>
      );
    }

    if (friends.length === 0) {
      return (
        <View className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center">
          <View className="w-24 h-24 rounded-2xl bg-orange-600/20 items-center justify-center mb-4">
            <Ionicons name="people-outline" size={48} color="#ff8c00" />
          </View>
          <Text className="text-white text-xl font-black mb-2">
            No Friends Yet
          </Text>
          <Text className="text-white/50 text-sm text-center font-semibold px-4">
            Who's the one who can bring you back to drinking?
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderFriendItem = ({ item }: { item: UserData }) => {
    const isSelected = isFriendSelected(item.id);

    return (
      <TouchableOpacity
        onPress={() => toggleFriendSelection(item)}
        className={`flex-1 rounded-2xl p-2 flex-row items-center mb-3 ${
          isSelected
            ? "bg-orange-600/30 border-2 border-orange-600"
            : "bg-white/[0.03] border border-white/[0.08]"
        }`}
      >
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
            isSelected ? "bg-orange-600" : "bg-orange-600/50"
          }`}
        >
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              className="w-full h-full rounded-full"
            />
          ) : (
            <Text className="text-black text-2xl font-black">
              {item.username?.[0]?.toUpperCase() || "?"}
            </Text>
          )}
        </View>
        <View className="flex-1">
          <Text
            className={`text-lg font-bold mb-1 ${
              isSelected ? "text-orange-400" : "text-white"
            }`}
          >
            {item.username || "Unknown User"}
          </Text>
          {(item.firstName || item.lastName) && (
            <Text
              className={`text-sm font-semibold ${
                isSelected ? "text-orange-300/70" : "text-white/50"
              }`}
            >
              {[item.firstName, item.lastName].filter(Boolean).join(" ")}
            </Text>
          )}
        </View>

        {isSelected && (
          <View className="ml-2">
            <Ionicons name="checkmark-circle" size={24} color="#ff8c00" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/80"
        onPress={onClose}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Pressable>
            <View className="bg-[#1a1a1a] rounded-2xl p-4 border-2 border-orange-600/30 shadow-2xl w-80">
              <TouchableOpacity
                onPress={handleImageUpload}
                className="bg-[#2a2a2a] border-2 border-dashed border-orange-600/40 rounded-xl h-40 items-center justify-center mb-4 overflow-hidden"
              >
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="items-center">
                    <Feather name="upload" size={32} color="#ff8c00" />
                    <Text className="text-white/70 text-sm mt-2">
                      Tap to upload image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <View className="flex-row mb-3 gap-3">
                <TouchableOpacity
                  onPress={() => {
                    setFriendsListVisible(!isFriendsListVisible);
                  }}
                  className="flex-1 bg-orange-600/20 border-2 border-orange-600/40 rounded-xl py-3 px-2 flex-row items-center justify-center"
                >
                  <Ionicons name="people-outline" size={20} color="#ff8c00" />
                  <Text className="text-orange-500 font-semibold ml-2">
                    Buddies
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleLocationSelect}
                  disabled={isLoadingLocation}
                  className="flex-1 bg-orange-600/20 border-2 border-orange-600/40 rounded-xl py-3 px-2 flex-row items-center justify-center"
                >
                  {isLoadingLocation ? (
                    <ActivityIndicator size="small" color="#ff8c00" />
                  ) : (
                    <>
                      <Feather name="map-pin" size={18} color="#ff8c00" />
                      <Text className="text-orange-500 font-semibold ml-2">
                        Location
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Location Display */}
              {locationText ? (
                <View className="bg-[#2a2a2a] rounded-xl p-3 mb-3 border border-orange-600/20">
                  <View className="flex-row items-start">
                    <Feather name="map-pin" size={16} color="#ff8c00" />
                    <Text className="text-white/80 text-xs ml-2 flex-1">
                      {locationText}
                    </Text>
                  </View>
                </View>
              ) : null}

              {isFriendsListVisible && friends && (
                <FlatList
                  data={friends}
                  keyExtractor={(item) =>
                    item.id || item.username || Math.random().toString()
                  }
                  renderItem={renderFriendItem}
                  ListEmptyComponent={renderEmptyFriendComponent}
                  showsVerticalScrollIndicator={false}
                />
              )}

              {(imageUri || locationText || mentionedBuddies.length > 0) && (
                <TouchableOpacity
                  onPress={handleUpload(true, imageUri, mentionedBuddies)}
                  className="bg-orange-600/20 border-2 border-orange-600/40 rounded-xl py-3 px-4 flex-row items-center justify-center mb-2"
                >
                  <Ionicons name="checkmark-circle" size={20} color="#ff8c00" />
                  <Text className="text-orange-500 font-semibold ml-2">
                    Done
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleSkip}
                className="items-center py-2"
              >
                <Text className="text-orange-500 text-sm font-semibold">
                  Skip
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
