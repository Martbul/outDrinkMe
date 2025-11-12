import { useApp } from "@/providers/AppProvider";
import type { UserData, YourMixPostData } from "@/types/api.types";
import {
  FontAwesome6,
  Ionicons,
  Feather,
  MaterialIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import React, {
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import Header from "@/components/header";
import { RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { Camera, CameraType, CameraView } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import MixVideo from "@/components/mixVideo";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Mock video data - replace with your actual API data
interface VideoPost {
  id: string;
  videoUrl: string;
  userId: string;
  username: string;
  userImageUrl?: string;
  caption?: string;
  likes: number;
  comments: number;
  duration: number; // in seconds
  createdAt: string;
}

const mockVideos: VideoPost[] = [
  {
    id: "1",
    videoUrl: "https://example.com/video1.mp4",
    userId: "user1",
    username: "john_doe",
    userImageUrl: "https://i.pravatar.cc/150?img=1",
    caption: "First video post! 🎉",
    likes: 42,
    comments: 8,
    duration: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    videoUrl: "https://example.com/video2.mp4",
    userId: "user2",
    username: "jane_smith",
    userImageUrl: "https://i.pravatar.cc/150?img=2",
    caption: "Check this out!",
    likes: 128,
    comments: 23,
    duration: 30,
    createdAt: new Date().toISOString(),
  },
];

const FriendsScreen = () => {
  const { userData, yourMixData, isLoading, error, refreshYourMixData } =
    useApp();

  const [activeTab, setActiveTab] = useState(0); // 0: yourmix, 1: video feed
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const [videos, setVideos] = useState<VideoPost[]>(mockVideos);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRefs = useRef<{ [key: string]: Video }>({});

  // Recording states
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const audioPermission = await Camera.requestMicrophonePermissionsAsync();
      setHasPermission(
        cameraPermission.status === "granted" &&
          audioPermission.status === "granted"
      );
    })();
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup: stop recording and clear timer when component unmounts
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      if (cameraRef.current && isRecording) {
        cameraRef.current.stopRecording();
      }
    };
  }, [isRecording]);


  const screens = [
    { key: "yourmix", title: "YOUR MIX" },
    { key: "videos", title: "VIDEO FEED" },
  ];

  const YourMixCard = ({ item }: { item: YourMixPostData }) => {
    const [flipState, setFlipState] = useState(0); // 0: image, 1: buddies, 2: map
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const [isAnimating, setIsAnimating] = useState(false);
    const [rotationCount, setRotationCount] = useState(0);

    const hasBuddies =
      item.mentionedBuddies && item.mentionedBuddies.length > 0;
    const hasLocation = !!item.locationText;

    const handlePress = () => {
      if (isAnimating) return;

      setIsAnimating(true);

      const calculateNextState = (current: number) => {
        if (current === 0) {
          return hasBuddies ? 1 : hasLocation ? 2 : 0;
        } else if (current === 1) {
          return hasLocation ? 2 : 0;
        } else {
          return 0;
        }
      };

      const newState = calculateNextState(flipState);
      const nextRotation = rotationCount + 1;

      // First half: rotate to edge (fast start, ease out)
      Animated.timing(rotateAnim, {
        toValue: nextRotation + 0.5,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setFlipState(newState);

        // Second half: complete the flip (fast start, ease out)
        Animated.timing(rotateAnim, {
          toValue: nextRotation + 1,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start(() => {
          setRotationCount(nextRotation + 1);
          setIsAnimating(false);
        });
      });
    };

    const rotateInterpolate = rotateAnim.interpolate({
      inputRange: [0, 1, 2, 3, 4],
      outputRange: ["0deg", "180deg", "360deg", "540deg", "720deg"],
    });

    const animatedStyle = {
      transform: [{ rotateY: rotateInterpolate }],
    };

    const renderContent = () => {
      if (flipState === 0) {
        // State 0: Image with overlay text
        return (
          <>
            <Image
              source={{ uri: item.imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
            {/* Gradient overlay */}
            <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Date badge - top right */}
            <View className="absolute top-3 right-3">
              <View className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/[0.08]">
                <Text className="text-orange-600 text-xs font-bold tracking-wide">
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>

            {/* User avatar - top left */}
            <TouchableOpacity
              className="absolute top-3 left-3"
              onPress={() =>
                router.push(`/(screens)/userInfo?userId=${item.userId}`)
              }
            >
              {item.userImageUrl && (
                <View className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm border-2 border-white/[0.15] overflow-hidden">
                  <Image
                    source={{ uri: item.userImageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              )}
            </TouchableOpacity>
          </>
        );
      } else if (flipState === 1) {
        // State 1: Mentioned buddies
        return (
          <View className="w-full h-full bg-black items-center justify-center p-6">
            {/* Header */}
            <View className="items-center mb-5">
              <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-2">
                DRINKING BUDDIES
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-orange-600 text-2xl font-black">
                  {item.mentionedBuddies.length}
                </Text>
              </View>
            </View>

            {/* Buddies grid */}
            <View className="flex-row flex-wrap gap-4 justify-center mb-5">
              {item.mentionedBuddies.map((buddy, index) => (
                <View
                  key={buddy.id || index}
                  className="items-center"
                  style={{ width: 75 }}
                >
                  <TouchableOpacity className="w-16 h-16 rounded-full bg-orange-600/20 border-2 border-orange-600/40 items-center justify-center mb-2 overflow-hidden">
                    {buddy.imageUrl ? (
                      <Image
                        source={{ uri: buddy.imageUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Text className="text-orange-600 text-2xl font-black">
                        {buddy.firstName?.charAt(0).toUpperCase() ||
                          buddy.username?.charAt(0).toUpperCase() ||
                          "?"}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <Text
                    className="text-white text-xs text-center font-semibold"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {buddy.firstName && buddy.lastName
                      ? `${buddy.firstName} ${buddy.lastName}`
                      : buddy.username || "Unknown"}
                  </Text>
                </View>
              ))}
            </View>

            {/* Timestamp */}
            <View className="pt-4 border-t border-white/[0.05]">
              <Text className="text-white/40 text-xs text-center font-semibold">
                {new Date(item.loggedAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        );
      } else {
        // State 2: Map with location
        return (
          <View className="w-full h-full bg-black items-center justify-center p-6">
            <View className="bg-white/[0.03] rounded-2xl p-6 w-full border border-white/[0.08]">
              {/* Header */}
              <View className="items-center mb-5">
                <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-2">
                  LOCATION
                </Text>
                <Text className="text-white text-xl font-black text-center mb-4">
                  {item.locationText}
                </Text>
              </View>

              {/* Map placeholder */}
              <View className="bg-white/[0.03] rounded-xl p-8 items-center justify-center border border-white/[0.08] mb-5">
                <Text className="text-orange-600 text-sm text-center font-semibold">
                  Map integration coming soon
                </Text>
              </View>

              {/* Timestamp */}
              <View className="pt-4 border-t border-white/[0.05]">
                <Text className="text-white/40 text-xs text-center font-semibold">
                  {new Date(item.loggedAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          </View>
        );
      }
    };

    return (
      <TouchableOpacity
        onPress={handlePress}
        className="bg-white/[0.03] rounded-2xl overflow-hidden border border-white/[0.08] mb-4"
        activeOpacity={0.8}
        disabled={isAnimating}
      >
        <Animated.View
          style={animatedStyle}
          className="relative w-full aspect-[4/3]"
        >
          {renderContent()}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderYourMixItem = ({ item }: { item: YourMixPostData }) => {
    return <YourMixCard item={item} />;
  };

  const renderEmptyYourMixComponent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <ActivityIndicator size="large" color="#ff8c00" />
          <Text className="text-white/50 mt-4 text-sm font-semibold">
            Loading ...
          </Text>
        </View>
      );
    }

    if (yourMixData.length === 0) {
      return (
        <View className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center">
          <View className="w-24 h-24 rounded-2xl bg-orange-600/20 items-center justify-center mb-4">
            <Ionicons name="people-outline" size={48} color="#ff8c00" />
          </View>
          <Text className="text-white text-xl font-black mb-2">
            No Mixes Ready Yet
          </Text>
          <Text className="text-white/50 text-sm text-center font-semibold px-4">
            Who's the one who can bring you back to drinking?
          </Text>
        </View>
      );
    }

    return null;
  };

//   const handleRecordVideo = () => {
//     if (hasPermission === false) {
//       Alert.alert(
//         "Permission Required",
//         "Please grant camera and microphone permissions to record videos."
//       );
//       return;
//     }
//     setShowRecordModal(true);
//   };

// const startRecording = async () => {
//   if (!cameraRef.current) return;

//   try {
//     setIsRecording(true);
//     setRecordingDuration(0);

//     // Start recording - this promise will resolve when stopRecording is called
//     const videoPromise = cameraRef.current.recordAsync({
//       maxDuration: 60,
//     });

//     // Wait a bit before starting the timer to ensure recording has actually started
//     await new Promise((resolve) => setTimeout(resolve, 100));

//     // Start duration counter AFTER recording has begun
//     recordingTimer.current = setInterval(() => {
//       setRecordingDuration((prev) => {
//         const newDuration = prev + 1;
//         // Auto-stop at 59 seconds
//         if (newDuration >= 60) {
//           stopRecording();
//           return 59;
//         }
//         return newDuration;
//       });
//     }, 1000);

//     // Wait for recording to complete
//     const video = await videoPromise;

//     // Clear the timer when recording finishes
//     if (recordingTimer.current) {
//       clearInterval(recordingTimer.current);
//       recordingTimer.current = null;
//     }

//     // Set the recorded video
//     if (video && video.uri) {
//       setRecordedVideo(video.uri);
//       setIsRecording(false);
//     }
//   } catch (error: any) {
//     console.error("Error recording video:", error);

//     // Clear timer on error
//     if (recordingTimer.current) {
//       clearInterval(recordingTimer.current);
//       recordingTimer.current = null;
//     }

//     setIsRecording(false);

//     // Better error detection
//     const errorMessage = error.message || "";
//     const isStoppedEarly =
//       errorMessage.includes("stopped") ||
//       errorMessage.includes("data could be produced");

//     // Only show alert for real errors, not when user stops quickly
//     if (!isStoppedEarly) {
//       Alert.alert("Error", "Failed to record video. Please try again.");
//     }
//   }
// };

// const stopRecording = async () => {
//   if (!cameraRef.current || !isRecording) return;

//   try {
//     // Stop the recording - this will cause the recordAsync promise to resolve
//     await cameraRef.current.stopRecording();

//     // Clear the timer
//     if (recordingTimer.current) {
//       clearInterval(recordingTimer.current);
//       recordingTimer.current = null;
//     }
//   } catch (error) {
//     console.error("Error stopping recording:", error);

//     // Clean up state even if stop fails
//     if (recordingTimer.current) {
//       clearInterval(recordingTimer.current);
//       recordingTimer.current = null;
//     }
//     setIsRecording(false);
//   }
// };

// const discardVideo = () => {
//   // Clear timer if exists
//   if (recordingTimer.current) {
//     clearInterval(recordingTimer.current);
//     recordingTimer.current = null;
//   }

//   setRecordedVideo(null);
//   setCaption("");
//   setRecordingDuration(0);
//   setIsRecording(false);
// };

//   const toggleCameraType = () => {
//     setCameraType((current) => (current === "back" ? "front" : "back"));
//   };

//   const pickVideoFromGallery = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Videos,
//         allowsEditing: true,
//         quality: 1,
//         videoMaxDuration: 60,
//       });

//       if (!result.canceled && result.assets[0]) {
//         setRecordedVideo(result.assets[0].uri);
//       }
//     } catch (error) {
//       console.error("Error picking video:", error);
//       Alert.alert("Error", "Failed to pick video from gallery.");
//     }
//   };

 const uploadVideo = async () => {
   if (!recordedVideo || !userData) return;

   setIsUploading(true);

   try {
     // Step 1: Upload video to Cloudinary
     const cloudinaryFormData = new FormData();

     // Create the file object for Cloudinary
     const videoFile = {
       uri: recordedVideo,
       type: "video/mp4",
       name: `video_${Date.now()}.mp4`,
     };

     const CLOUDINARY_CLOUD_NAME =
       process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
     const CLOUDINARY_VIDEO_UPLOAD_PRESET =
       process.env.EXPO_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_PRESET;

     // Validate credentials
     if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_VIDEO_UPLOAD_PRESET) {
       throw new Error(
         "Cloudinary credentials are not configured. Please check your .env file."
       );
     }

     cloudinaryFormData.append("file", videoFile as any);
     cloudinaryFormData.append("upload_preset", CLOUDINARY_VIDEO_UPLOAD_PRESET);
     cloudinaryFormData.append("resource_type", "video");

     // Optional: Add folder organization
     cloudinaryFormData.append("folder", "user_videos");

     // Optional: Add tags for better organization
     cloudinaryFormData.append("tags", `user_${userData.id},video_post`);

     console.log("Uploading video to Cloudinary...");

     const cloudinaryResponse = await fetch(
       `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
       {
         method: "POST",
         body: cloudinaryFormData,
         headers: {
           Accept: "application/json",
         },
       }
     );

     if (!cloudinaryResponse.ok) {
       const errorData = await cloudinaryResponse.json();
       throw new Error(
         `Cloudinary upload failed: ${errorData.error?.message || "Unknown error"}`
       );
     }

     const cloudinaryData = await cloudinaryResponse.json();

     console.log("Cloudinary upload successful:", {
       url: cloudinaryData.secure_url,
       publicId: cloudinaryData.public_id,
       duration: cloudinaryData.duration,
     });

     // Step 2: Save video metadata to your backend
     const videoMetadata = {
       videoUrl: cloudinaryData.secure_url, // Cloudinary URL
       thumbnailUrl: cloudinaryData.secure_url.replace(
         "/upload/",
         "/upload/so_0/"
       ), // Generate thumbnail
       publicId: cloudinaryData.public_id, // For deletion later
       userId: userData.id,
       username: userData.username,
       caption: caption,
       duration: Math.round(cloudinaryData.duration || recordingDuration),
       width: cloudinaryData.width,
       height: cloudinaryData.height,
       format: cloudinaryData.format,
       createdAt: new Date().toISOString(),
     };

     // Replace with your actual API endpoint
    //  const response = await fetch("YOUR_API_ENDPOINT/videos", {
    //    method: "POST",
    //    headers: {
    //      "Content-Type": "application/json",
    //      // Add your auth headers here
    //      // 'Authorization': `Bearer ${yourAuthToken}`,
    //    },
    //    body: JSON.stringify(videoMetadata),
    //  });

    //  if (!response.ok) {
    //    throw new Error("Failed to save video metadata to backend");
    //  }

    //  const savedVideo = await response.json();

     // Step 3: Add new video to the local feed
     setVideos((prev) => [
       {
         id: savedVideo.id || Date.now().toString(),
         videoUrl: cloudinaryData.secure_url,
         userId: userData.id,
         username: userData.username || "You",
         userImageUrl: userData.imageUrl,
         caption: caption,
         likes: 0,
         comments: 0,
         duration: Math.round(cloudinaryData.duration || recordingDuration),
         createdAt: new Date().toISOString(),
       },
       ...prev,
     ]);

     // Reset states and close modal
     setRecordedVideo(null);
     setCaption("");
     setRecordingDuration(0);
     setShowRecordModal(false);

     Alert.alert("Success", "Video posted successfully!");
   } catch (error) {
     console.error("Error uploading video:", error);
     Alert.alert(
       "Upload Failed",
       error instanceof Error
         ? error.message
         : "Failed to upload video. Please try again."
     );
   } finally {
     setIsUploading(false);
   }
 };
  const closeRecordModal = async () => {
    if (isRecording) {
      await stopRecording();
    }
    discardVideo();
    setShowRecordModal(false);
  };

  const VideoFeedCard = ({
    item,
    index,
  }: {
    item: VideoPost;
    index: number;
  }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    return (
      <View
        style={{
          width: SCREEN_WIDTH - 32,
          height: SCREEN_HEIGHT * 0.7,
        }}
        className="bg-white/[0.03] rounded-2xl overflow-hidden border border-white/[0.08] mb-4 relative"
      >
        {/* Video Player */}
        <View className="w-full h-full bg-black">
          {/* Replace with actual video component */}
          <View className="w-full h-full items-center justify-center bg-zinc-900">
            <Ionicons
              name="play-circle"
              size={80}
              color="#ff8c00"
              opacity={0.5}
            />
            <Text className="text-white/50 mt-4 text-sm font-semibold">
              Video Player ({item.duration}s)
            </Text>
          </View>
        </View>

        {/* User Info Overlay - Top */}
        <View className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() =>
              router.push(`/(screens)/userInfo?userId=${item.userId}`)
            }
          >
            {item.userImageUrl && (
              <Image
                source={{ uri: item.userImageUrl }}
                className="w-10 h-10 rounded-full border-2 border-white/20"
                resizeMode="cover"
              />
            )}
            <View className="ml-3">
              <Text className="text-white font-bold text-base">
                {item.username}
              </Text>
              <Text className="text-white/60 text-xs">
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Action Buttons - Right Side */}
        <View className="absolute right-4 bottom-20 items-center space-y-6">
          {/* Like Button */}
          <TouchableOpacity
            className="items-center"
            onPress={() => setIsLiked(!isLiked)}
          >
            <View className="w-12 h-12 rounded-full bg-black/40 items-center justify-center border border-white/10">
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={28}
                color={isLiked ? "#ff8c00" : "white"}
              />
            </View>
            <Text className="text-white text-xs font-bold mt-1">
              {item.likes + (isLiked ? 1 : 0)}
            </Text>
          </TouchableOpacity>

          {/* Comment Button */}
          <TouchableOpacity className="items-center">
            <View className="w-12 h-12 rounded-full bg-black/40 items-center justify-center border border-white/10">
              <Ionicons name="chatbubble-outline" size={24} color="white" />
            </View>
            <Text className="text-white text-xs font-bold mt-1">
              {item.comments}
            </Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity className="items-center">
            <View className="w-12 h-12 rounded-full bg-black/40 items-center justify-center border border-white/10">
              <Ionicons name="paper-plane-outline" size={24} color="white" />
            </View>
            <Text className="text-white text-xs font-bold mt-1">Share</Text>
          </TouchableOpacity>
        </View>

        {/* Caption - Bottom */}
        {item.caption && (
          <View className="absolute bottom-0 left-0 right-0 p-4 pr-20 bg-gradient-to-t from-black/80 to-transparent">
            <Text
              className="text-white text-sm font-semibold"
              numberOfLines={2}
            >
              {item.caption}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderVideoFeedItem = ({
    item,
    index,
  }: {
    item: VideoPost;
    index: number;
  }) => {
    return <VideoFeedCard item={item} index={index} />;
  };

  const renderEmptyVideoComponent = () => {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <View className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.08] items-center w-full">
          <View className="w-24 h-24 rounded-2xl bg-orange-600/20 items-center justify-center mb-4">
            <Ionicons name="videocam-outline" size={48} color="#ff8c00" />
          </View>
          <Text className="text-white text-xl font-black mb-2">
            No Videos Yet
          </Text>
          <Text className="text-white/50 text-sm text-center font-semibold px-4">
            Be the first to share a moment! Tap the camera button to record.
          </Text>
        </View>
      </View>
    );
  };

  const onVideoViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentVideoIndex(viewableItems[0].index || 0);
    }
  }).current;
  const handleYourMixRefresh = async () => {
    if (userData?.id) {
      refreshYourMixData();
    }
  };

  const videoViewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  // const renderYourMixScreen = () => (
  //   <View style={{ width: SCREEN_WIDTH }}>
  //     <FlatList
  //       data={yourMixData}
  //       keyExtractor={(item) => item.id || Math.random().toString()}
  //       contentContainerStyle={{
  //         paddingHorizontal: 16,
  //         paddingTop: 0,
  //         paddingBottom: 48,
  //       }}
  //       renderItem={renderYourMixItem}
  //       ListEmptyComponent={renderEmptyYourMixComponent}
  //       refreshing={isLoading}
  //       onRefresh={handleYourMixRefresh}
  //       showsVerticalScrollIndicator={false}
  //       refreshControl={
  //         <RefreshControl
  //           refreshing={isLoading}
  //           onRefresh={handleYourMixRefresh}
  //           tintColor="#ff8c00"
  //           colors={["#ff8c00"]}
  //           progressBackgroundColor="black"
  //         />
  //       }
  //     />
  //   </View>
  // );

  // const renderVideoFeedScreen = () => (
  //   <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
  //     <FlatList
  //       data={videos}
  //       keyExtractor={(item) => item.id}
  //       contentContainerStyle={{
  //         paddingHorizontal: 16,
  //         paddingTop: 8,
  //         paddingBottom: 100,
  //       }}
  //       renderItem={renderVideoFeedItem}
  //       ListEmptyComponent={renderEmptyVideoComponent}
  //       showsVerticalScrollIndicator={false}
  //       snapToInterval={SCREEN_HEIGHT * 0.7 + 16}
  //       snapToAlignment="start"
  //       decelerationRate="fast"
  //       onViewableItemsChanged={onVideoViewableItemsChanged}
  //       viewabilityConfig={videoViewabilityConfig}
  //     />
  //   </View>
  // );

  const renderYourMixScreen = () => (
    <View style={{ width: SCREEN_WIDTH }}>
      <FlatList
        data={yourMixData}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 0,
          paddingBottom: 48,
        }}
        renderItem={renderYourMixItem}
        ListEmptyComponent={renderEmptyYourMixComponent}
        refreshing={isLoading}
        onRefresh={handleYourMixRefresh}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleYourMixRefresh}
            tintColor="#ff8c00"
            colors={["#ff8c00"]}
            progressBackgroundColor="black"
          />
        }
      />
    </View>
  );

 

  const renderPageItem = ({ item }: { item: (typeof screens)[0] }) => {
    if (item.key === "yourmix") {
      return renderYourMixScreen();
    } else if (item.key === "videos") {
      return MixVideo();
   
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveTab(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View
      className="flex-1 bg-black"
      style={{ paddingBottom: insets.bottom + 40 }}
    >
      <Header />

      {/* Page indicator dots */}
      <View className="flex-row justify-center items-center py-3">
        {screens.map((_, index) => (
          <View
            key={index}
            className={`h-1.5 rounded-full mx-1 ${
              activeTab === index ? "w-6 bg-orange-600" : "w-1.5 bg-white/20"
            }`}
          />
        ))}
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={screens}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        renderItem={renderPageItem}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="center"
      />

      {/* Floating Record Button - Only visible on video feed */}
      {activeTab === 1 && (
        <TouchableOpacity
          onPress={handleRecordVideo}
          className="absolute bottom-24 right-6 w-16 h-16 rounded-full bg-orange-600 items-center justify-center shadow-lg"
          style={{
            shadowColor: "#ff8c00",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons name="videocam" size={28} color="white" />
        </TouchableOpacity>
      )}

      {/* Recording Modal */}
      <Modal
        visible={showRecordModal}
        animationType="slide"
        transparent={false}
        onRequestClose={closeRecordModal}
      >
        <View className="flex-1 bg-black">
          {!recordedVideo ? (
            // Camera View
            <>
              {hasPermission === null ? (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator size="large" color="#ff8c00" />
                </View>
              ) : hasPermission === false ? (
                <View className="flex-1 items-center justify-center px-8">
                  <Text className="text-white text-lg text-center mb-4">
                    Camera permission is required to record videos
                  </Text>
                  <TouchableOpacity
                    onPress={closeRecordModal}
                    className="bg-orange-600 px-6 py-3 rounded-xl"
                  >
                    <Text className="text-white font-bold">Close</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <CameraView
                    ref={cameraRef}
                    style={{ flex: 1 }}
                    facing={cameraType}
                  >
                    {/* Close Button */}
                    <View className="absolute top-12 left-4 right-4 flex-row justify-between items-center">
                      <TouchableOpacity
                        onPress={closeRecordModal}
                        className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
                      >
                        <Ionicons name="close" size={24} color="white" />
                      </TouchableOpacity>

                      {/* Recording Duration */}
                      {isRecording && (
                        <View className="bg-red-600 px-4 py-2 rounded-full flex-row items-center">
                          <View className="w-3 h-3 rounded-full bg-white mr-2" />
                          <Text className="text-white font-bold">
                            {Math.floor(recordingDuration / 60)}:
                            {(recordingDuration % 60)
                              .toString()
                              .padStart(2, "0")}
                          </Text>
                        </View>
                      )}

                      {/* Flip Camera */}
                      <TouchableOpacity
                        onPress={toggleCameraType}
                        className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
                        disabled={isRecording}
                      >
                        <Ionicons
                          name="camera-reverse"
                          size={24}
                          color="white"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Bottom Controls */}
                    <View className="absolute bottom-8 left-0 right-0 items-center">
                      <View className="flex-row items-center justify-center space-x-8 px-8">
                        {/* Gallery Button */}
                        <TouchableOpacity
                          onPress={pickVideoFromGallery}
                          className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center"
                          disabled={isRecording}
                        >
                          <Ionicons name="images" size={24} color="white" />
                        </TouchableOpacity>

                        {/* Record Button */}
                        <TouchableOpacity
                          onPress={isRecording ? stopRecording : startRecording}
                          className={`w-20 h-20 rounded-full items-center justify-center ${
                            isRecording ? "bg-red-600" : "bg-white"
                          }`}
                        >
                          {isRecording ? (
                            <View className="w-8 h-8 bg-white rounded-sm" />
                          ) : (
                            <View className="w-16 h-16 rounded-full bg-red-600" />
                          )}
                        </TouchableOpacity>

                        {/* Placeholder for symmetry */}
                        <View className="w-12 h-12" />
                      </View>

                      <Text className="text-white/60 text-xs mt-4">
                        {isRecording
                          ? "Tap to stop"
                          : "Tap to record (max 60s)"}
                      </Text>
                    </View>
                  </CameraView>
                </>
              )}
            </>
          ) : (
            // Preview and Post Screen
            <View className="flex-1">
              {/* Video Preview */}
              <View className="flex-1">
                <Video
                  source={{ uri: recordedVideo }}
                  style={{ flex: 1 }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                  shouldPlay
                />
              </View>

              {/* Post Options */}
              <View
                className="bg-zinc-900 p-6"
                style={{ paddingBottom: insets.bottom + 24 }}
              >
                {/* Caption Input */}
                <View className="mb-4">
                  <Text className="text-white text-sm font-bold mb-2">
                    Add a caption
                  </Text>
                  <TextInput
                    value={caption}
                    onChangeText={setCaption}
                    placeholder="What's happening?"
                    placeholderTextColor="#666"
                    className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-white"
                    multiline
                    maxLength={200}
                  />
                  <Text className="text-white/40 text-xs mt-1 text-right">
                    {caption.length}/200
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="flex-row space-x-3">
                  <TouchableOpacity
                    onPress={discardVideo}
                    className="flex-1 bg-white/[0.05] py-4 rounded-xl items-center border border-white/[0.08]"
                    disabled={isUploading}
                  >
                    <Text className="text-white font-bold">Discard</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={uploadVideo}
                    className="flex-1 bg-orange-600 py-4 rounded-xl items-center"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-bold">Post Video</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default FriendsScreen;
