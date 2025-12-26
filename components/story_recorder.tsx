import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
  CameraType,
} from "expo-camera";
import { useVideoPlayer, VideoView } from "expo-video";
import { useApp } from "@/providers/AppProvider";
import { QuickFeedback } from "./quickFeedback";

export function StoryRecorder({ onClose }: { onClose: () => void }) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();

  const cameraRef = useRef<CameraView>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>("back");

  // Metadata state
  const [videoMeta, setVideoMeta] = useState<{
    width: number;
    height: number;
    duration: number;
  } | null>(null);
  
  const [taggedBuddies, setTaggedBuddies] = useState(""); // Kept if you add an input for this later
  
  // const [feedback, setFeedback] = useState<{
  //   visible: boolean;
  //   message: string;
  //   type: "success" | "xp" | "level";
  // }>({
  //   visible: false,
  //   message: "",
  //   type: "success",
  // });

  // We no longer need useAuth here, the Context handles the token during background upload
  const { createStory } = useApp();

  // --- Timer Logic ---
  useEffect(() => {
    let interval: number;
    if (isRecording) {
      setRecordingDuration(0);
      interval = setInterval(
        () => setRecordingDuration((prev) => prev + 1),
        1000
      );
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // --- Video Player Logic ---
  const player = useVideoPlayer(videoUri, (p) => {
    p.loop = true;
    p.play();
  });

  // Extract metadata when player loads
  useEffect(() => {
    if (videoUri && player) {
      const timer = setTimeout(() => {
        // In a real app, you might want to get actual dimensions from the file or player event
        // For vertical video on mobile, 1080x1920 is a safe assumption for aspect ratio
        setVideoMeta({
          width: 1080, 
          height: 1920,
          duration: player.duration || 0,
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [videoUri, player]);

  // const showFeedback = (message: string, type: any = "success") => {
  //   setFeedback({ visible: true, message, type });
  // };

  // --- Camera Actions ---
  const handleRecordPress = () =>
    isRecording ? stopRecording() : startRecording();

  const startRecording = async () => {
    if (cameraRef.current) {
      setIsRecording(true);
      try {
        const video = await cameraRef.current.recordAsync({ maxDuration: 60 });
        if (video) setVideoUri(video.uri);
      } catch (e) {
        Alert.alert("Error", "Could not record video.");
      } finally {
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (isRecording && cameraRef.current) cameraRef.current.stopRecording();
  };

  // --- Hand off to Background Queue ---
  const handlePostStory = async () => {
    if (!videoUri) return;

    try {
      const tags = taggedBuddies
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // We pass the LOCAL videoUri. 
      // The AppProvider will handle uploading to Cloudinary in the background.
      await createStory({
        videoUrl: videoUri, 
        width: videoMeta?.width || 1080,
        height: videoMeta?.height || 1920,
        duration: videoMeta?.duration || 0,
        taggedBuddies: tags,
      });

      // Immediate Feedback to user
      // showFeedback("Posting in background... +10 XP", "xp");
      
      // Close the screen after a brief delay to show the feedback
      setTimeout(onClose, 1200);

    } catch (error: any) {
      Alert.alert("Error", "Failed to queue story.");
    }
  };

  if (!cameraPermission?.granted || !microphonePermission?.granted) {
    return (
      <View className="flex-1 bg-black justify-center items-center px-6">
        <TouchableOpacity
          onPress={() => {
            requestCameraPermission();
            requestMicrophonePermission();
          }}
          className="bg-orange-600 px-8 py-3 rounded-full"
        >
          <Text className="text-black font-black uppercase">
            Grant Permissions
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* <QuickFeedback
        visible={feedback.visible}
        message={feedback.message}
        type={feedback.type}
        onHide={() => setFeedback((f) => ({ ...f, visible: false }))}
      /> */}

      {videoUri ? (
        // --- PREVIEW MODE ---
        <View className="flex-1 bg-black">
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
          />
          <View className="flex-1 justify-between pt-12 pb-10 px-4 bg-black/20">
            <TouchableOpacity
              onPress={() => setVideoUri(null)}
              className="w-10 h-10 rounded-full bg-black/40 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handlePostStory}
              className="bg-orange-600 w-full py-4 rounded-full flex-row justify-center items-center"
            >
              <Text className="text-black font-black text-lg mr-2">
                POST STORY
              </Text>
              <Ionicons name="send" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // --- CAMERA MODE ---
        <CameraView
          style={{ flex: 1 }}
          facing={cameraType}
          mode="video"
          ref={cameraRef}
        >
          <View className="flex-1 justify-between pt-12 pb-10 px-4">
            {/* Top Bar */}
            <View className="flex-row justify-between items-center">
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 rounded-full bg-black/40 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              {isRecording && (
                <View className="bg-red-600 px-3 py-1.5 rounded-full flex-row items-center border border-white/20">
                  <View className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  <Text className="text-white font-mono font-bold">
                    {formatTime(recordingDuration)}
                  </Text>
                </View>
              )}
            </View>

            {/* Bottom Controls */}
            <View className="flex-row justify-around items-center">
              <TouchableOpacity
                onPress={() =>
                  setCameraType((c) => (c === "back" ? "front" : "back"))
                }
                className="w-12 h-12 rounded-full bg-black/40 items-center justify-center border border-white/20"
              >
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleRecordPress}
                className={`w-20 h-20 rounded-full border-4 items-center justify-center ${
                  isRecording ? "border-red-500 bg-red-500/20" : "border-white"
                }`}
              >
                <View
                  className={
                    isRecording
                      ? "w-8 h-8 bg-red-500 rounded-sm"
                      : "w-16 h-16 bg-white rounded-full"
                  }
                />
              </TouchableOpacity>
              
              {/* Spacer to balance layout */}
              <View className="w-12 h-12" />
            </View>
          </View>
        </CameraView>
      )}
    </View>
  );
}