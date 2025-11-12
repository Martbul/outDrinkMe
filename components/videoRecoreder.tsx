// components/videoRecorder.tsx
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Camera, CameraType, CameraView } from "expo-camera";
import { useVideoPlayer, VideoView } from "expo-video";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface VideoRecorderProps {
  visible: boolean;
  onClose: () => void;
  onVideoRecorded: (
    videoUri: string,
    caption: string,
    duration: number
  ) => Promise<void>;
}

export default function VideoRecorder({
  visible,
  onClose,
  onVideoRecorded,
}: VideoRecorderProps) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Video player for preview - always call the hook
  const player = useVideoPlayer(recordedVideo || "", (player) => {
    if (recordedVideo) {
      player.loop = true;
      player.play();
    }
  });

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
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      if (cameraRef.current && isRecording) {
        cameraRef.current.stopRecording();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    if (!cameraRef.current) return;

    try {
      setIsRecording(true);
      setRecordingDuration(0);

      const videoPromise = cameraRef.current.recordAsync({
        maxDuration: 60,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      recordingTimer.current = setInterval(() => {
        setRecordingDuration((prev) => {
          const newDuration = prev + 1;
          if (newDuration >= 60) {
            stopRecording();
            return 59;
          }
          return newDuration;
        });
      }, 1000);

      const video = await videoPromise;

      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      if (video && video.uri) {
        setRecordedVideo(video.uri);
        setIsRecording(false);
      }
    } catch (error: any) {
      console.error("Error recording video:", error);

      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      setIsRecording(false);

      const errorMessage = error.message || "";
      const isStoppedEarly =
        errorMessage.includes("stopped") ||
        errorMessage.includes("data could be produced");

      if (!isStoppedEarly) {
        Alert.alert("Error", "Failed to record video. Please try again.");
      }
    }
  };

  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording) return;

    try {
      await cameraRef.current.stopRecording();

      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
    } catch (error) {
      console.error("Error stopping recording:", error);

      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
      setIsRecording(false);
    }
  };

  const discardVideo = () => {
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }

    setRecordedVideo(null);
    setCaption("");
    setRecordingDuration(0);
    setIsRecording(false);
  };

  const toggleCameraType = () => {
    setCameraType((current) => (current === "back" ? "front" : "back"));
  };

  const pickVideoFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        setRecordedVideo(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking video:", error);
      Alert.alert("Error", "Failed to pick video from gallery.");
    }
  };

  const handleUpload = async () => {
    if (!recordedVideo) return;

    setIsUploading(true);
    try {
      await onVideoRecorded(recordedVideo, caption, recordingDuration);
      handleClose();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }
    discardVideo();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black">
        {!recordedVideo ? (
          <>
            {hasPermission === null ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#ff8c00" />
              </View>
            ) : hasPermission === false ? (
              <View className="flex-1 items-center justify-center px-8">
                <Ionicons name="videocam-off" size={64} color="#666" />
                <Text className="text-white text-lg text-center mb-4 mt-4">
                  Camera permission is required to record videos
                </Text>
                <TouchableOpacity
                  onPress={handleClose}
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
                  {/* Top Controls */}
                  <View className="absolute top-12 left-4 right-4 flex-row justify-between items-center">
                    <TouchableOpacity
                      onPress={handleClose}
                      className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm items-center justify-center"
                    >
                      <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>

                    {isRecording && (
                      <View className="bg-red-600 px-4 py-2 rounded-full flex-row items-center">
                        <View className="w-3 h-3 rounded-full bg-white mr-2" />
                        <Text className="text-white font-bold">
                          {Math.floor(recordingDuration / 60)}:
                          {(recordingDuration % 60).toString().padStart(2, "0")}
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={toggleCameraType}
                      className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm items-center justify-center"
                      disabled={isRecording}
                    >
                      <Ionicons name="camera-reverse" size={24} color="white" />
                    </TouchableOpacity>
                  </View>

                  {/* Bottom Controls */}
                  <View className="absolute bottom-8 left-0 right-0 items-center">
                    <View className="flex-row items-center justify-center space-x-8 px-8">
                      <TouchableOpacity
                        onPress={pickVideoFromGallery}
                        className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm items-center justify-center"
                        disabled={isRecording}
                      >
                        <Ionicons name="images" size={24} color="white" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={isRecording ? stopRecording : startRecording}
                        className={`w-20 h-20 rounded-full items-center justify-center ${
                          isRecording ? "bg-red-600" : "bg-white"
                        }`}
                        disabled={isRecording && recordingDuration < 1}
                      >
                        {isRecording ? (
                          <View className="w-8 h-8 bg-white rounded-sm" />
                        ) : (
                          <View className="w-16 h-16 rounded-full bg-red-600" />
                        )}
                      </TouchableOpacity>

                      <View className="w-12 h-12" />
                    </View>

                    <Text className="text-white/60 text-xs mt-4">
                      {isRecording
                        ? recordingDuration < 1
                          ? "Recording started..."
                          : "Tap to stop"
                        : "Tap to record (max 60s)"}
                    </Text>
                  </View>
                </CameraView>
              </>
            )}
          </>
        ) : (
          <View className="flex-1">
            {/* Video Preview */}
            <View className="flex-1 bg-black">
              {recordedVideo && (
                <VideoView
                  player={player}
                  style={{ flex: 1 }}
                  contentFit="contain"
                  nativeControls={true}
                />
              )}
            </View>

            {/* Post Options */}
            <View
              className="bg-zinc-900 p-6"
              style={{ paddingBottom: insets.bottom + 24 }}
            >
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

              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={discardVideo}
                  className="flex-1 bg-white/[0.05] py-4 rounded-xl items-center border border-white/[0.08]"
                  disabled={isUploading}
                >
                  <Text className="text-white font-bold">Discard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleUpload}
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
  );
}
