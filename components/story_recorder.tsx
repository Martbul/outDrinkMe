import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions, CameraType } from "expo-camera";
import { Video, ResizeMode } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { useAuth } from "@clerk/clerk-expo";
import { useApp } from "@/providers/AppProvider"; // <--- CHANGED IMPORT

export function StoryRecorder({ onClose }: { onClose: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>("back");

  // Metadata state
  const [videoMeta, setVideoMeta] = useState<{
    width: number;
    height: number;
    duration: number;
  } | null>(null);
  const [taggedBuddies, setTaggedBuddies] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { getToken } = useAuth();
  const { createStory } = useApp(); // <--- USE APP PROVIDER

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white mb-4">Camera permission is required</Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-orange-600 px-6 py-3 rounded-full"
        >
          <Text className="text-black font-bold">Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} className="mt-8">
          <Text className="text-white/50">Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startRecording = async () => {
    if (cameraRef.current) {
      setIsRecording(true);
      try {
        const video = await cameraRef.current.recordAsync({
          maxDuration: 15,
          quality: "1080p",
        });
        if (video) setVideoUri(video.uri);
      } catch (e) {
        console.error(e);
      } finally {
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (isRecording && cameraRef.current) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  const handlePostStory = async () => {
    if (!videoUri || !videoMeta) return;

    try {
      setIsUploading(true);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      // 1. Upload Video to Cloudinary
      const uploadTask = FileSystem.createUploadTask(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
        videoUri,
        {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: "file",
          parameters: {
            upload_preset: PRESET!,
            folder: "stories",
            resource_type: "video",
          },
        }
      );

      const response = await uploadTask.uploadAsync();
      if (!response || response.status !== 200)
        throw new Error("Upload failed");

      const data = JSON.parse(response.body);
      const remoteUrl = data.secure_url;

      const tags = taggedBuddies
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // 2. Call Provider Action
      await createStory({
        videoUrl: remoteUrl,
        width: videoMeta.width,
        height: videoMeta.height,
        duration: videoMeta.duration,
        taggedBuddies: tags,
      });

      Alert.alert("Success", "Your story has been posted!");
      onClose();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to post story");
    } finally {
      setIsUploading(false);
    }
  };

  if (videoUri) {
    return (
      <View className="flex-1 bg-black">
        <Video
          source={{ uri: videoUri }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          onReadyForDisplay={(event) => {
            setVideoMeta({
              width: event.naturalSize.width,
              height: event.naturalSize.height,
              duration: event.status.durationMillis
                ? event.status.durationMillis / 1000
                : 0,
            });
          }}
        />

        <View className="flex-1 justify-between pt-12 pb-10 px-6 bg-black/20">
          <TouchableOpacity
            onPress={() => setVideoUri(null)}
            className="w-10 h-10 rounded-full bg-black/40 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="w-full">
            <View className="bg-black/60 rounded-xl px-4 py-3 mb-4 border border-white/20">
              <Text className="text-orange-500 text-xs font-bold uppercase mb-1">
                Tag Buddies
              </Text>
              <TextInput
                placeholder="@john, @sarah..."
                placeholderTextColor="#999"
                className="text-white text-base font-bold p-0"
                value={taggedBuddies}
                onChangeText={setTaggedBuddies}
              />
            </View>

            <TouchableOpacity
              onPress={handlePostStory}
              disabled={isUploading}
              className="bg-orange-600 w-full py-4 rounded-full flex-row justify-center items-center shadow-lg"
            >
              {isUploading ? (
                <ActivityIndicator color="black" />
              ) : (
                <>
                  <Text className="text-black font-black text-lg tracking-wider mr-2">
                    POST STORY
                  </Text>
                  <Ionicons name="send" size={20} color="black" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        facing={cameraType}
        mode="video"
        ref={cameraRef}
      >
        <View className="flex-1 justify-between pt-12 pb-12 px-6">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={32} color="white" />
            </TouchableOpacity>
            <View className="bg-black/40 px-3 py-1 rounded-full">
              <Text className="text-white font-bold text-xs">STORY</Text>
            </View>
            <View className="w-8" />
          </View>

          <View className="flex-row justify-around items-center">
            <TouchableOpacity
              onPress={() =>
                setCameraType((current) =>
                  current === "back" ? "front" : "back"
                )
              }
              className="w-12 h-12 rounded-full bg-black/40 items-center justify-center border border-white/20"
            >
              <Ionicons name="camera-reverse" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onLongPress={startRecording}
              onPressOut={stopRecording}
              delayLongPress={100}
              className={`w-20 h-20 rounded-full border-4 items-center justify-center ${
                isRecording ? "border-red-500 bg-red-500/20" : "border-white"
              }`}
            >
              <Animated.View
                className={`rounded-full ${isRecording ? "w-8 h-8 bg-red-500" : "w-16 h-16 bg-white"}`}
              />
            </TouchableOpacity>

            <View className="w-12 h-12" />
          </View>
        </View>
      </CameraView>
    </View>
  );
}
