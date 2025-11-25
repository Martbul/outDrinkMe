import React, { useState, useRef, useEffect, useCallback } from "react";
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
  LayoutAnimation,
  ScrollView,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router"; 
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import Entypo from "@expo/vector-icons/Entypo";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import type { UserData } from "@/types/api.types";
import { ImagePickerModal } from "@/components/imagePickerModal";
import { usePostHog } from "posthog-react-native";
import * as ImageManipulator from 'expo-image-manipulator'; 

export default function AddDrinks() {
  const posthog = usePostHog();
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

  const [viewState, setViewState] = useState<"logging" | "details" | "done">(
    "logging"
  );

  // Details View State
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [mentionedBuddies, setMentionedBuddies] = useState<UserData[]>([]);
  const [locationText, setLocationText] = useState("");

  // Modals
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [isAfterDrinkLoggedModalVisible, setAfterDrinkLoggedModal] =
    useState(false);

  // Thoughts State
  const [thoughtInput, setThoughtInput] = useState("");
  const [isSubmittingDrunkThought, setIsSubmittingDrunkThought] =
    useState(false);
  const [isSubmittingThought, setIsSubmittingThought] = useState(false);

  const hasCompletedRef = useRef(false);

  const alreadyLogged = userStats?.today_status || false;

  useFocusEffect(
    useCallback(() => {
      setViewState("logging");

      setImageUri(null);
      setMentionedBuddies([]);
      setLocationText("");

    }, [])
  );

  useEffect(() => {
    if (drunkThought) {
      setThoughtInput(drunkThought);
    }
  }, [drunkThought]);



const uploadToCloudinary = async (localUri: string): Promise<string | null> => {
  try {
    posthog?.capture("image_upload_started");

    // 1. OPTIMIZE IMAGE BEFORE UPLOAD
    // Resize to max width 1080px, compress to 80% quality
    // This turns a 10MB file into ~300KB without visible quality loss on phone screens
    const manipulatedResult = await ImageManipulator.manipulateAsync(
      localUri,
      [{ resize: { width: 1080 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    const uriToUpload = manipulatedResult.uri;

    const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const CLOUDINARY_UPLOAD_PRESET =
      process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error("Cloudinary credentials are not configured.");
    }

    const formData = new FormData();
    formData.append("file", {
      uri: uriToUpload, // Use the optimized URI
      type: "image/jpeg",
      name: `drank_${Date.now()}.jpg`,
    } as any);

    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "drank-images");

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
      posthog?.capture("image_upload_success");
      return data.secure_url;
    }

    return null;
  } catch (error: any) {
    console.error("Upload error:", error);
    posthog?.capture("image_upload_failed", { error: error.message });
    Alert.alert("Upload Error", "Failed to upload image. Please try again.");
    return null;
  }
};



  // const uploadToCloudinary = async (
  //   localUri: string
  // ): Promise<string | null> => {
  //   try {
  //     posthog?.capture("image_upload_started");

  //     const CLOUDINARY_CLOUD_NAME =
  //       process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  //     const CLOUDINARY_UPLOAD_PRESET =
  //       process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  //     if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
  //       throw new Error(
  //         "Cloudinary credentials are not configured. Please check your .env file."
  //       );
  //     }

  //     const formData = new FormData();
  //     formData.append("file", {
  //       uri: localUri,
  //       type: "image/jpeg",
  //       name: `drank_${Date.now()}.jpg`,
  //     } as any);

  //     formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  //     formData.append("folder", "drank-images");

  //     const response = await fetch(
  //       `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
  //       {
  //         method: "POST",
  //         body: formData,
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );

  //     const data = await response.json();

  //     if (data.secure_url) {
  //       posthog?.capture("image_upload_success");
  //       return data.secure_url;
  //     }

  //     return null;
  //   } catch (error: any) {
  //     console.error("Upload error:", error);
  //     posthog?.capture("image_upload_failed", { error: error.message });
  //     Alert.alert("Upload Error", "Failed to upload image. Please try again.");
  //     return null;
  //   }
  // };
const handleImageSelection = async (source: "camera" | "library") => {
  setImagePickerVisible(false);
  posthog?.capture("image_picker_opened", { source });

  try {
    let result;

    // --- ENABLE NATIVE CROPPER ---
    const pickerOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // <--- CHANGED TO TRUE: Enables the crop/edit screen
      quality: 0.8,
      // aspect: [4, 3],   // Keep this commented out if you want freeform cropping (Android)
      // or default cropping (iOS)
    };

    if (source === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Camera access is required");
        return;
      }
      result = await ImagePicker.launchCameraAsync(pickerOptions);
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Gallery access is required");
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
    }

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  } catch (error) {
    Alert.alert("Error", "Failed to pick image");
  }
};

  const toggleBuddy = (buddy: UserData) => {
    setMentionedBuddies((prev) => {
      const exists = prev.find((b) => b.id === buddy.id);
      if (exists) return prev.filter((b) => b.id !== buddy.id);
      return [...prev, buddy];
    });
  };


  const startHold = () => {
    if (viewState !== "logging" || alreadyLogged) return;
    setIsHolding(true);
    hasCompletedRef.current = false;
    let progress = 0;

    progressIntervalRef.current = setInterval(() => {
      progress += 1.4;
      setHoldProgress(progress);

      if (progress >= 100) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        hasCompletedRef.current = true;
        setIsHolding(false);
        setHoldProgress(0);

        // Transition to Details View
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setViewState("details");

        posthog.capture("drink_button_hold_complete");
      }
    }, 16);
  };

  const cancelHold = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (!hasCompletedRef.current) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      setHoldProgress(0);
      setIsHolding(false);
    }
  };


  const handleFinalSubmit = async (skipDetails = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let finalImageUri = imageUri;

      if (
        !skipDetails &&
        imageUri &&
        !imageUri.includes("cloudinary") &&
        !imageUri.includes("http")
      ) {
        finalImageUri = await uploadToCloudinary(imageUri);
      }

      await addDrinking(
        true,
        skipDetails ? null : finalImageUri,
        skipDetails ? "" : locationText,
        skipDetails ? [] : mentionedBuddies
      );

      posthog.capture("drink_logged", {
        has_image: !!finalImageUri,
        buddy_count: mentionedBuddies.length,
        is_skipped: skipDetails,
      });

      // --- KEY CHANGE: DO NOT NAVIGATE BACK ---
      // Instead, we clear the local form state and reset viewState to "logging".
      // Since addDrinking updated userStats.today_status to true,
      // the render logic (alreadyLogged && viewState === "logging") will display the success screen.

      setImageUri(null);
      setMentionedBuddies([]);
      setViewState("logging");

      // router.back(); // Removed
    } catch (error: any) {
      Alert.alert("Error", "Failed to log drink.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const renderHeader = () => (
    <View
      className="flex-row items-center justify-between mb-6"
      style={{ paddingTop: insets.top + 10}}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        className="w-10 h-10 rounded-full bg-white/[0.05] items-center justify-center border border-white/[0.1]"
      >
        <Ionicons name="close" size={20} color="white" />
      </TouchableOpacity>
      <View className="items-center">
        <Text className="text-white text-base font-bold">New Entry</Text>
      </View>
      <View className="w-10" />
    </View>
  );
const renderAlreadyLogged = () => {
  const handleSubmitThought = async () => {
    if (!thoughtInput.trim()) return;

    setIsSubmittingDrunkThought(true);
    try {
      await addDrunkThought(thoughtInput.trim());
      posthog?.capture("drunk_thought_shared", {
        char_length: thoughtInput.length,
        is_update: !!drunkThought,
      });
    } catch (error: any) {
      Alert.alert("Error", "Failed to save your thought. Try again!");
    } finally {
      setIsSubmittingDrunkThought(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-1">
      <View className="items-center justify-center mb-8 mt-6">
        <View className="relative justify-center items-center mb-6">
          <View className="absolute w-56 h-56 bg-[#EA580C]/20 rounded-full blur-2xl" />
          <View className="w-48 h-48 rounded-full bg-[#0d0d0d] border-4 border-[#EA580C] items-center justify-center shadow-xl shadow-[#EA580C]/20">
            <View className="w-36 h-36 rounded-full border-2 border-[#EA580C]/20 items-center justify-center bg-[#EA580C]/5">
              <Ionicons name="checkmark-sharp" size={60} color="#EA580C" />
            </View>
          </View>

          <View className="absolute -bottom-3 bg-[#EA580C] px-4 py-1 rounded-full border-4 border-black">
            <Text className="text-black text-[10px] font-black tracking-[0.2em] uppercase">
              SUCCESSFULLY
            </Text>
          </View>
        </View>

        <View className="items-center space-y-2 px-4">
          <Text className="text-white text-4xl font-black text-center tracking-tight uppercase  transform -rotate-1">
            DRUNK
          </Text>

          <Text className="text-white/40 text-sm font-semibold text-center mt-2">
            You are my alcoholic pride!
          </Text>
        </View>
      </View>
      <View className="flex-row items-center bg-white/[0.04] rounded-2xl p-5 mb-8 border border-white/[0.08] mx-2">
        <View className="w-16 h-16 rounded-full bg-orange-500/10 items-center justify-center mr-4">
          <MaterialCommunityIcons name="fire" size={44} color="#EA580C" />
        </View>
        <View className="flex-1">
          <Text className="text-white/40 text-[10px] font-black tracking-widest uppercase mb-1">
            Current Streak
          </Text>
          <Text className="text-white text-3xl font-black">
            {userStats?.current_streak || 0}{" "}
            <Text className="text-base text-white/30 font-bold">days</Text>
          </Text>
        </View>
      </View>

      {drunkThought ? (
        <View className="bg-orange-600/10 rounded-3xl p-6 mb-6 mx-2 border border-orange-600/20 relative overflow-hidden">
          <Entypo
            name="quote"
            size={40}
            color="#ff8c00"
            style={{ opacity: 0.2, position: "absolute", top: 10, left: 10 }}
          />
          <Text className="text-orange-500 text-[10px] font-black tracking-widest uppercase mb-3 text-center opacity-80">
            Your Drunk Wisdom
          </Text>
          <Text className="text-white text-xl font-bold text-center leading-7 italic">
            "{drunkThought}"
          </Text>
        </View>
      ) : (
        // --- Input Mode (Card Style) ---
        <View className="bg-[#1A1A1A] rounded-3xl p-5 mb-6 mx-2 border border-white/[0.1]">
          <View className="flex-row items-center mb-4 ml-1">
            <Feather name="edit-3" size={14} color="#ff8c00" />
            <Text className="text-white/60 text-xs font-bold ml-2">
              Share a drunk thought
            </Text>
          </View>

          <TextInput
            value={thoughtInput}
            onChangeText={setThoughtInput}
            placeholder="What's going through your head?"
            placeholderTextColor="#525252"
            multiline
            maxLength={280}
            className="text-white text-lg font-medium min-h-[80px] mb-4"
            style={{ textAlignVertical: "top" }}
            editable={!isSubmittingDrunkThought}
          />

          <TouchableOpacity
            onPress={handleSubmitThought}
            disabled={!thoughtInput.trim() || isSubmittingDrunkThought}
            className={`flex-row items-center justify-center py-4 rounded-xl ${
              !thoughtInput.trim() || isSubmittingDrunkThought
                ? "bg-white/5"
                : "bg-orange-600"
            }`}
          >
            {isSubmittingDrunkThought ? (
              <ActivityIndicator
                color={!thoughtInput.trim() ? "gray" : "black"}
              />
            ) : (
              <>
                <Text
                  className={`font-bold text-sm mr-2 ${!thoughtInput.trim() ? "text-white/20" : "text-black"}`}
                >
                  POST TO BUDDIES
                </Text>
                {!!thoughtInput.trim() && (
                  <Ionicons name="send" size={16} color="black" />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

  const renderLoggingView = () => {
    const potentialStreak = (userStats?.current_streak || 0) + 1;

    return (
      <View className="flex-1 justify-center">
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

        <View className="mb-6">
          <TouchableOpacity
            onPressIn={startHold}
            onPressOut={cancelHold}
            disabled={isSubmitting}
            activeOpacity={0.9}
            className="bg-white/[0.05] rounded-3xl border-2 border-white/[0.08] overflow-hidden relative items-center justify-center"
            style={{ height: 170 }}
          >
            <View className="flex-1 items-center justify-center">
              <Text className="text-black text-3xl font-black mb-2">
                <View className="z-10 items-center">
                  <Ionicons
                    color={isHolding ? "#000" : "#EA580C"}
                    name={isHolding ? "beer" : "finger-print"}
                    size={48}
                    style={{ marginBottom: 16 }}
                  />
                  <Text
                    className={`text-2xl font-black tracking-widest ${
                      holdProgress > 50 ? "text-black" : "text-white"
                    }`}
                  >
                    {isHolding ? "HOLDING..." : "HOLD TO LOG"}
                  </Text>
                </View>
              </Text>
              <Text className="text-white/30 text-xs text-center font-semibold">
                Keep pressing to confirm
              </Text>
            </View>
            <View
              className="absolute bottom-0 left-0 right-0 bg-orange-600"
              style={{ height: `${holdProgress}%` }}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.back()} className="py-4 mb-8">
          <Text className="text-white/40 text-sm font-bold text-center">
            Not now
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDetailsView = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <View className="items-center mb-8 mt-4">
        <Text className="text-orange-500 text-sm font-black tracking-widest mb-2">
          STREAK SECURED
        </Text>
        <Text className="text-white text-3xl font-black text-center">
          Make it memorable
        </Text>
      </View>

      {/* --- Image Picker Card --- */}
      <TouchableOpacity
        onPress={() => setImagePickerVisible(true)}
        className="w-full aspect-video bg-white/[0.03] rounded-3xl border-2 border-dashed border-white/[0.1] mb-6 overflow-hidden"
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <View className="w-16 h-16 rounded-full bg-white/[0.05] items-center justify-center mb-3">
              <Feather name="camera" size={24} color="#EA580C" />
            </View>
            <Text className="text-white/60 font-bold">Snap a picture</Text>
          </View>
        )}
        {imageUri && (
          <View className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">Tap to change</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* --- Buddies Section --- */}
      <View className="mb-8">
        <View className="flex-row items-center mb-3 ml-1">
          <Ionicons
            name="people"
            size={16}
            color="#ffffff60"
            style={{ marginRight: 6 }}
          />
          <Text className="text-white/40 text-xs font-black tracking-widest">
            WITH WHO?
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {friends.map((friend) => {
            const isSelected = mentionedBuddies.some((b) => b.id === friend.id);
            return (
              <TouchableOpacity
                key={friend.id}
                onPress={() => toggleBuddy(friend)}
                className={`mr-3 items-center justify-center px-4 py-3 rounded-2xl border ${
                  isSelected
                    ? "bg-orange-600 border-orange-600"
                    : "bg-white/[0.03] border-white/[0.08]"
                }`}
              >
                <Text
                  className={`font-bold ${isSelected ? "text-black" : "text-white"}`}
                >
                  {friend.username}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* --- Action Buttons --- */}
      <View className="gap-3 mb-10">
        <TouchableOpacity
          onPress={() => handleFinalSubmit(false)}
          disabled={isSubmitting}
          className="w-full py-5 bg-[#EA580C] rounded-2xl items-center flex-row justify-center"
        >
          {isSubmitting ? (
            <ActivityIndicator color="black" />
          ) : (
            <>
              <Text className="text-black text-base font-black tracking-wider mr-2">
                SAVE MEMORY
              </Text>
              <Ionicons name="arrow-forward" size={20} color="black" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleFinalSubmit(true)}
          disabled={isSubmitting}
          className="w-full py-4 items-center"
        >
          <Text className="text-white/40 font-bold text-sm">Skip details</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // --- MAIN RENDER ---
  return (
    <View
      className="flex-1 bg-black px-3"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {alreadyLogged && viewState === "logging" ? (
        <>
          {renderAlreadyLogged()}
        </>
      ) : viewState === "details" ? (
        <>
          {renderHeader()}
          {renderDetailsView()}
        </>
      ) : (
        renderLoggingView()
      )}

      {/* Helper Modal */}
      <ImagePickerModal
        visible={imagePickerVisible}
        onClose={() => setImagePickerVisible(false)}
        onSelectCamera={() => handleImageSelection("camera")}
        onSelectLibrary={() => handleImageSelection("library")}
      />

      <AdditionalInfoModal
        friends={friends}
        visible={isAfterDrinkLoggedModalVisible}
        isLoading={isLoading}
        handleUpload={async (today, uri, loc, buddies) => {
          await addDrinking(today, uri, loc, buddies);
        }}
        onClose={() => setAfterDrinkLoggedModal(false)}
      />
    </View>
  );
}

// --- SUB COMPONENTS ---

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
  const posthog = usePostHog();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [locationText, setLocationText] = useState("");
  const [mentionedBuddies, setMentionedBuddies] = useState<UserData[] | []>([]);
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

  const uploadToCloudinary = async (
    localUri: string
  ): Promise<string | null> => {
    try {
      setIsUploadingImage(true);
      posthog?.capture("image_upload_started");

      const CLOUDINARY_CLOUD_NAME =
        process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const CLOUDINARY_UPLOAD_PRESET =
        process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error("Cloudinary credentials are not configured.");
      }

      const formData = new FormData();
      formData.append("file", {
        uri: localUri,
        type: "image/jpeg",
        name: `drank_${Date.now()}.jpg`,
      } as any);

      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", "drank-images");

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
        posthog?.capture("image_upload_success");
        return data.secure_url;
      }
      return null;
    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert("Upload Error", "Failed to upload image.");
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const pickImageFromSource = async (source: "camera" | "library") => {
    setImagePickerModalVisible(false);
    posthog?.capture("image_picker_opened", { source });

    try {
      let result;

      // --- ENABLE NATIVE CROPPER ---
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // <--- CHANGED TO TRUE: Enables the crop/edit screen
        quality: 0.8,
      };

      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission needed", "Camera access is required");
          return;
        }
        result = await ImagePicker.launchCameraAsync(pickerOptions);
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission needed", "Gallery access is required");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      }

      if (!result.canceled && result.assets[0]) {
        const localUri = result.assets[0].uri;
        setImageUri(localUri);

        // Upload the CROPPED image
        const cloudinaryUrl = await uploadToCloudinary(localUri);

        if (cloudinaryUrl) {
          setImageUri(cloudinaryUrl);
        } else {
          setImageUri(null);
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSkip = async () => {
    setImageUri(null);
    setLocationText("");
    setMentionedBuddies([]);
    await handleUpload(true);
    onClose();
  };

  const handleDone = async () => {
    if (isUploadingImage) {
      Alert.alert("Please wait", "Image is still uploading...");
      return;
    }
    // imageUri now contains the Cloudinary public URL
    await handleUpload(true, imageUri, locationText, mentionedBuddies);
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
              {/* Image Upload Area */}
              <TouchableOpacity
                onPress={() => setImagePickerModalVisible(true)}
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
              </View>

              {isFriendsListVisible && friends && (
                <FlatList
                  data={friends}
                  keyExtractor={(item) =>
                    item.id || item.username || Math.random().toString()
                  }
                  renderItem={renderFriendItem}
                  ListEmptyComponent={renderEmptyFriendComponent}
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: 200 }}
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
