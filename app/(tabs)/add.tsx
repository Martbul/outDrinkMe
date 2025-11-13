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
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import Entypo from "@expo/vector-icons/Entypo";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import type { UserData } from "@/types/api.types";
import { ImagePickerModal } from "@/components/imagePickerModal";

export default function AddDrinks() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    userStats,
    friends,
    isLoading,
    addDrinking,
    drunkThought,
    addDrunkThought,
  } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const [isAfterDrinkLoggedModalVisible, setAfterDrinkLoggedModal] =
    useState(false);
  const [thoughtInput, setThoughtInput] = useState("");
  const [isSubmittingDrtunkThought, setIsSubmittingDrunkThought] =
    useState(false);

  const hasCompletedRef = useRef(false);
  const alreadyLogged = userStats?.today_status || false;

  // Sync thoughtInput with drunkThought from context
  useEffect(() => {
    if (drunkThought) {
      setThoughtInput(drunkThought);
    }
  }, [drunkThought]);



  const handleUpload = async (
    drinkToday: boolean,
    imageUri?: string | null,
    locationText?: string,
    mentionedBuddies?: UserData[] | []
  ) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDrinking(drinkToday, imageUri, locationText, mentionedBuddies);
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
    const handleSubmitThought = async () => {
      if (!thoughtInput.trim()) return;

      setIsSubmittingDrunkThought(true);
      try {
        await addDrunkThought(thoughtInput.trim());
      } catch (error) {
        console.error("Failed to submit drunk thought:", error);
        Alert.alert("Error", "Failed to save your thought. Try again!");
      } finally {
        setIsSubmittingDrunkThought(false);
      }
    };

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
            streak!
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

        {drunkThought ? (
          <View className="bg-white/[0.03] rounded-2xl p-6 mb-6 border border-white/[0.08]">
            <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-3">
              TODAY&apos;S DRUNK THOUGHT
            </Text>
            <Text className="text-orange-600 text-2xl  font-bold leading-relaxed">
              {drunkThought}
            </Text>
          </View>
        ) : (
          // Show input for new thought
          <View className="mb-6">
            <Text className="text-white/70 text-sm font-bold mb-3 text-center">
              Share your drunk thought of the day
            </Text>
            <TextInput
              value={thoughtInput}
              onChangeText={setThoughtInput}
              placeholder="What's on your mind?"
              placeholderTextColor="#ffffff40"
              multiline
              numberOfLines={3}
              maxLength={280}
              className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-white text-base mb-4"
              style={{ textAlignVertical: "top", minHeight: 100 }}
              editable={!isSubmittingDrtunkThought}
            />
            <TouchableOpacity
              onPress={handleSubmitThought}
              disabled={!thoughtInput.trim() || isSubmittingDrtunkThought}
              className={`rounded-2xl py-5 ${
                !thoughtInput.trim() || isSubmittingDrtunkThought
                  ? "bg-orange-600/30"
                  : "bg-orange-600"
              }`}
            >
              <Text className="text-black text-base font-black text-center tracking-widest uppercase">
                {isSubmittingDrtunkThought ? "Saving..." : "Share Thought"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  handleUpload: (
    drinkToday: boolean,
    imageUri?: string | null,
    locationText?: string,
    mentionedBuddies?: UserData[] | []
  ) => Promise<void>;
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePickerModalVisible, setImagePickerModalVisible] = useState(false);

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
        return prev.filter((f) => f.id !== friend.id);
      } else {
        return [...prev, friend];
      }
    });
  };

  const isFriendSelected = (friendId: string) => {
    return mentionedBuddies.some((f) => f.id === friendId);
  };

  // Upload to Cloudinary using REST API
  const uploadToCloudinary = async (
    localUri: string
  ): Promise<string | null> => {
    try {
      setIsUploadingImage(true);

      // Your Cloudinary credentials
      const CLOUDINARY_CLOUD_NAME =
        process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const CLOUDINARY_UPLOAD_PRESET =
        process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      // Validate credentials
      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error(
          "Cloudinary credentials are not configured. Please check your .env file."
        );
      }

      // Create form data
      const formData = new FormData();

      // Append the file
      formData.append("file", {
        uri: localUri,
        type: "image/jpeg",
        name: `drank_${Date.now()}.jpg`,
      } as any);

      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      // Optional: Add folder organization
      formData.append("folder", "drank-images");

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        console.log("Upload successful:", data.secure_url);
        return data.secure_url; // This is your public URL to save in DB
      }

      throw new Error(data.error?.message || "Upload failed");
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        "Upload Error",
        "Failed to upload image to Cloudinary. Please try again."
      );
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

    const pickImageFromSource = async (source: "camera" | "library") => {
      setImagePickerModalVisible(false);

      try {
        let result;

        if (source === "camera") {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();

          if (status !== "granted") {
            Alert.alert(
              "Permission needed",
              "Please grant permission to access your camera"
            );
            return;
          }

          result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
        } else {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

          if (status !== "granted") {
            Alert.alert(
              "Permission needed",
              "Please grant permission to access your photos"
            );
            return;
          }

          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
        }

        if (!result.canceled && result.assets[0]) {
          const localUri = result.assets[0].uri;
          setImageUri(localUri);

          const cloudinaryUrl = await uploadToCloudinary(localUri);

          if (cloudinaryUrl) {
            setImageUri(cloudinaryUrl);
          } else {
            setImageUri(null);
          }
        }
      } catch (error) {
        Alert.alert("Error", "Failed to pick image");
        console.error(error);
      }
    };



  // const handleImageUpload = async () => {
  //   try {
  //     const { status } =
  //       await ImagePicker.requestMediaLibraryPermissionsAsync();

  //     if (status !== "granted") {
  //       Alert.alert(
  //         "Permission needed",
  //         "Please grant permission to access your photos"
  //       );
  //       return;
  //     }

  //     const result = await ImagePicker.launchCameraAsync({
  //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //       allowsEditing: true,
  //       aspect: [4, 3],
  //       quality: 1,
  //     });

  //     if (!result.canceled && result.assets[0]) {
  //       const localUri = result.assets[0].uri;
  //       setImageUri(localUri); // Show preview immediately with local URI

  //       // Upload to Cloudinary in background
  //       const cloudinaryUrl = await uploadToCloudinary(localUri);

  //       if (cloudinaryUrl) {
  //         // Update with the Cloudinary URL (this is what will be saved to DB)
  //         setImageUri(cloudinaryUrl);
  //       } else {
  //         // If upload failed, clear the image
  //         setImageUri(null);
  //       }
  //     }
  //   } catch (error) {
  //     Alert.alert("Error", "Failed to pick image");
  //     console.error(error);
  //   }
  // };

  // const handleLocationSelect = async () => {
  //   try {
  //     setIsLoadingLocation(true);

  //     const { status } = await Location.requestForegroundPermissionsAsync();

  //     if (status !== "granted") {
  //       Alert.alert(
  //         "Permission needed",
  //         "Please grant permission to access your location"
  //       );
  //       setIsLoadingLocation(false);
  //       return;
  //     }

  //     const location = await Location.getCurrentPositionAsync({
  //       accuracy: Location.Accuracy.Balanced,
  //     });

  //     const [address] = await Location.reverseGeocodeAsync({
  //       latitude: location.coords.latitude,
  //       longitude: location.coords.longitude,
  //     });

  //     if (address) {
  //       const formattedLocation = [
  //         address.street,
  //         address.city,
  //         address.region,
  //         address.country,
  //       ]
  //         .filter(Boolean)
  //         .join(", ");

  //       setLocationText(formattedLocation || "Location selected");
  //     } else {
  //       setLocationText(
  //         `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
  //       );
  //     }
  //   } catch (error) {
  //     Alert.alert("Error", "Failed to get location");
  //     console.error(error);
  //   } finally {
  //     setIsLoadingLocation(false);
  //   }
  // };

  const handleSkip = async () => {
    setImageUri(null);
    setLocationText("");
    setMentionedBuddies([]);
    await handleUpload(true)
    onClose();
  };

  const handleDone = async () => {
    if (isUploadingImage) {
      Alert.alert("Please wait", "Image is still uploading...");
      return;
    }

    // imageUri now contains the Cloudinary public URL
    await handleUpload(true, imageUri, locationText, mentionedBuddies);

    // Reset state after successful upload
    setImageUri(null);
    setLocationText("");
    setMentionedBuddies([]);
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
            Whos the one who can bring you back to drinking?
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
              {/* Image Upload Area - UPDATED */}
              <TouchableOpacity
                onPress={() => setImagePickerModalVisible(true)} // CHANGED THIS LINE
                disabled={isUploadingImage}
                className="bg-[#2a2a2a] border-2 border-dashed border-orange-600/40 rounded-xl h-40 items-center justify-center mb-4 overflow-hidden"
              >
                {isUploadingImage ? (
                  <View className="items-center">
                    <ActivityIndicator size="large" color="#ff8c00" />
                    <Text className="text-white/70 text-sm mt-2 font-semibold">
                      Uploading image...
                    </Text>
                  </View>
                ) : imageUri ? (
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

                {/* <TouchableOpacity
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
                </TouchableOpacity> */}
              </View>

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
                  onPress={handleDone}
                  disabled={isUploadingImage}
                  className={`bg-orange-600/20 border-2 border-orange-600/40 rounded-xl py-3 px-4 flex-row items-center justify-center mb-2 ${
                    isUploadingImage ? "opacity-50" : ""
                  }`}
                >
                  {isUploadingImage ? (
                    <ActivityIndicator size="small" color="#ff8c00" />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#ff8c00"
                      />
                      <Text className="text-orange-500 font-semibold ml-2">
                        Done
                      </Text>
                    </>
                  )}
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
              <ImagePickerModal
                visible={imagePickerModalVisible}
                onClose={() => setImagePickerModalVisible(false)}
                onSelectCamera={() => pickImageFromSource("camera")}
                onSelectLibrary={() => pickImageFromSource("library")}
              />
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
