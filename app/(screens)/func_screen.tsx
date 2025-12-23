import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Dimensions,
  Share,
  Alert,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Ionicons,
  FontAwesome5,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

// --- REQUIRED IMPORTS ---
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
// Note: We use standard FileSystem here for downloadAsync,
// which is distinct from the 'legacy' upload task used in the Provider.

import { useFunc } from "@/providers/FunctionProvider";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const GRID_SPACING = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_SPACING * 3) / 2;

export default function FuncScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // --- MODAL STATE ---
  const [showQrModal, setShowQrModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // --- DOWNLOAD STATE ---
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const {
    funcImagesIds,
    funcMetaData,
    refreshFuncData,
    isFuncLoading,
    addImages,
    leaveFunc,
    uploadQueue,
  } = useFunc();

  // --- STATS & TIMERS ---
  const uploadStats = useMemo(() => {
    if (!uploadQueue || uploadQueue.length === 0) return null;
    const total = uploadQueue.length;
    const completed = uploadQueue.filter(
      (j) => j.status === "completed"
    ).length;
    const active = uploadQueue.some(
      (j) => j.status === "uploading" || j.status === "pending"
    );
    const progress = completed / total;
    return { total, completed, active, progress };
  }, [uploadQueue]);

  const timeRemaining = useMemo(() => {
    if (!funcMetaData?.expiresAt) return "72h";
    const expiry = new Date(funcMetaData.expiresAt).getTime();
    const now = new Date().getTime();
    const diff = expiry - now;
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  }, [funcMetaData?.expiresAt]);

  useEffect(() => {
    refreshFuncData();
  }, []);

  const handlePickAndUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 100,
      quality: 1,
      exif: false,
    });

    if (!result.canceled) {
      const urls = result.assets.map((a) => a.uri);
      await addImages(urls);
    }
  };

  const handleShareOrCopy = async () => {
    if (!funcMetaData?.inviteCode) return;
    const joinLink = `outdrinkme://func/session/join/${funcMetaData.inviteCode}`;
    try {
      await Share.share({
        message: `Join my drinking group on OutDrinkMe!\n\nInvite Code: ${funcMetaData.inviteCode}\n\nLink: ${joinLink}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleLeaveSession = async () => {
    setShowLeaveModal(false);
    await leaveFunc();
    router.replace("/(tabs)/home");
  };

  // --- SAVE TO GALLERY LOGIC ---
  const handleSaveToGallery = async () => {
    if (!selectedImage) return;

    try {
      setIsDownloading(true);

      // 1. Check/Request Permissions
      if (permissionResponse?.status !== "granted") {
        const { status } = await requestPermission();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "We need access to your gallery to save this photo."
          );
          setIsDownloading(false);
          return;
        }
      }

      // 2. Download remote URL to local file system
      // MediaLibrary cannot save remote URLs directly on Android, must be local.
      const filename = `func_${Date.now()}.jpg`;
      const fileUri = FileSystem.cacheDirectory + filename;

      const { uri } = await FileSystem.downloadAsync(selectedImage, fileUri);

      // 3. Save to System Gallery
      await MediaLibrary.saveToLibraryAsync(uri);

      Alert.alert("Saved!", "Photo saved to your gallery.");
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Could not save photo.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* --- UPLOAD BAR --- */}
      {uploadStats?.active && (
        <View
          style={{ paddingTop: insets.top }}
          className="bg-orange-600 absolute top-0 left-0 right-0 z-[100] shadow-xl"
        >
          <View className="px-4 py-2 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-black font-black text-[10px] uppercase tracking-tighter">
                Uploading {uploadStats.completed + 1} of {uploadStats.total}
              </Text>
              <View className="h-1 bg-black/20 w-full mt-1 rounded-full overflow-hidden">
                <View
                  style={{ width: `${uploadStats.progress * 100}%` }}
                  className="h-full bg-black"
                />
              </View>
            </View>
            <ActivityIndicator color="black" size="small" className="ml-4" />
          </View>
        </View>
      )}

      {/* --- NAVBAR --- */}
      <View
        style={{ paddingTop: insets.top + 10 }}
        className="px-4 pb-4 flex-row items-center justify-between border-b border-white/5 bg-black"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        <Text className="text-white font-black text-lg">
          {funcMetaData?.hostUsername
            ? `${funcMetaData.hostUsername}'s Func`
            : "Function"}
        </Text>

        <TouchableOpacity
          onPress={() => setShowLeaveModal(true)}
          className="w-10 h-10 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20"
        >
          <MaterialIcons name="exit-to-app" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: GRID_SPACING,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isFuncLoading}
            onRefresh={refreshFuncData}
            tintColor="#EA580C"
          />
        }
      >
        {/* --- SESSION CARD --- */}
        <View className="mt-4 bg-[#111] rounded-[32px] p-6 border border-white/5 shadow-sm">
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-1">
              <Text className="text-orange-600 font-bold tracking-[2px] text-[10px] uppercase mb-1">
                Active Session
              </Text>
              <Text
                className="text-white text-2xl font-black"
                numberOfLines={1}
              >
                The Photo Dump
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowQrModal(true)}
              className="bg-orange-600 px-4 py-2 rounded-full flex-row items-center"
            >
              <Ionicons name="qr-code" size={16} color="black" />
              <Text className="text-black font-black ml-2 text-xs">INVITE</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
              <Ionicons name="time-outline" size={16} color="#EA580C" />
              <Text className="text-white font-black text-lg mt-1">
                {timeRemaining}
              </Text>
              <Text className="text-white/40 text-[10px] font-bold uppercase">
                Time Left
              </Text>
            </View>
            <View className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
              <Ionicons name="images-outline" size={16} color="#EA580C" />
              <Text className="text-white font-black text-lg mt-1">
                {funcImagesIds.length}
              </Text>
              <Text className="text-white/40 text-[10px] font-bold uppercase">
                Photos
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handlePickAndUpload}
          className="mt-4 bg-white py-5 rounded-2xl flex-row justify-center items-center shadow-lg active:opacity-90"
        >
          <FontAwesome5 name="camera" size={18} color="black" />
          <Text className="text-black font-black ml-3 tracking-widest">
            POST TO DISK
          </Text>
        </TouchableOpacity>

        {/* --- GRID --- */}
        <View className="flex-row flex-wrap justify-between mt-6">
          {funcImagesIds.map((url, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              onPress={() => setSelectedImage(url)}
              style={{ width: ITEM_WIDTH, marginBottom: GRID_SPACING }}
              className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative"
            >
              <Image
                source={{ uri: url }}
                style={{ width: "100%", aspectRatio: 0.75 }}
                contentFit="cover"
                cachePolicy="disk"
                transition={200}
              />
              <View className="absolute bottom-2 right-2 bg-black/50 p-1.5 rounded-full backdrop-blur-md">
                <Ionicons name="expand" color="white" size={12} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* --- LIGHTBOX MODAL --- */}
      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View className="flex-1 bg-black/95 justify-center items-center relative">
          <TouchableOpacity
            onPress={() => setSelectedImage(null)}
            style={{ top: insets.top + 20 }}
            className="absolute right-5 z-50 w-12 h-12 bg-white/10 rounded-full items-center justify-center border border-white/10"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.8 }}
              contentFit="contain"
              transition={200}
            />
          )}

          <View
            style={{ bottom: insets.bottom + 30 }}
            className="absolute w-full px-8 items-center"
          >
            <TouchableOpacity
              disabled={isDownloading}
              onPress={handleSaveToGallery}
              className="bg-white px-8 py-4 rounded-full flex-row items-center shadow-lg active:opacity-90"
            >
              {isDownloading ? (
                <ActivityIndicator color="black" size="small" />
              ) : (
                <>
                  <Feather name="download" size={20} color="black" />
                  <Text className="text-black font-black ml-3 tracking-wider">
                    SAVE TO GALLERY
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- LEAVE MODAL --- */}
      <Modal visible={showLeaveModal} transparent animationType="fade">
        <View className="flex-1 bg-black/80 justify-center items-center px-6">
          <View className="bg-[#1A1A1A] w-full rounded-[40px] p-8 border border-white/10 items-center">
            <View className="w-16 h-16 bg-red-500/10 rounded-full items-center justify-center mb-6 border border-red-500/20">
              <MaterialIcons name="warning" size={32} color="#ef4444" />
            </View>

            <Text className="text-white text-2xl font-black mb-2 text-center">
              Leaving so soon?
            </Text>
            <Text className="text-white/50 text-center mb-8 px-4 leading-5">
              You will lose access to this photo dump immediately. You'll need a
              new invite code to join again.
            </Text>

            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                onPress={() => setShowLeaveModal(false)}
                className="flex-1 bg-white/10 py-4 rounded-2xl items-center"
              >
                <Text className="text-white font-black">CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLeaveSession}
                className="flex-1 bg-red-600 py-4 rounded-2xl items-center shadow-lg shadow-red-600/20"
              >
                <Text className="text-white font-black">LEAVE FUNC</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- QR MODAL --- */}
      <Modal visible={showQrModal} transparent animationType="slide">
        <View className="flex-1 bg-black/95 justify-end">
          <TouchableOpacity
            className="flex-1"
            onPress={() => setShowQrModal(false)}
          />

          <View
            style={{ paddingBottom: insets.bottom + 20 }}
            className="bg-[#121212] rounded-t-[40px] border-t border-white/10 px-6 pt-8 items-center"
          >
            <View className="w-12 h-1.5 bg-white/10 rounded-full mb-8" />

            <Text className="text-white text-2xl font-black mb-2">
              Share the Vibe
            </Text>
            <Text className="text-white/40 text-center text-sm mb-6">
              Friends can scan the QR or use the code below
            </Text>

            <View className="bg-white p-5 rounded-[32px] mb-8">
              {funcMetaData?.qrCodeBase64 ? (
                <Image
                  source={{
                    uri: `data:image/png;base64,${funcMetaData.qrCodeBase64}`,
                  }}
                  style={{
                    width: SCREEN_WIDTH * 0.55,
                    height: SCREEN_WIDTH * 0.55,
                  }}
                />
              ) : (
                <ActivityIndicator color="black" />
              )}
            </View>

            <View className="w-full flex-row gap-3 mb-4">
              <TouchableOpacity
                onPress={handleShareOrCopy}
                className="flex-1 bg-white/10 py-5 rounded-2xl flex-row items-center justify-center border border-white/5"
              >
                <Ionicons name="share-outline" size={20} color="white" />
                <Text className="text-white font-black ml-2 uppercase tracking-tight">
                  Share
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowQrModal(false)}
                className="flex-1 bg-orange-600 py-5 rounded-2xl items-center justify-center"
              >
                <Text className="text-black font-black uppercase tracking-tight">
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
