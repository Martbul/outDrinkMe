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
  BackHandler,
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
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";

import { useFunc } from "@/providers/FunctionProvider";
import { DeleteModal } from "@/components/delete_modal"; 

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const GRID_SPACING = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_SPACING * 3) / 2;

export default function FuncScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // --- MODAL STATE ---
  const [showQrModal, setShowQrModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // NEW: Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);

  // --- SUCCESS TOAST STATE ---
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Saved to Gallery");

  // --- SELECTION & DOWNLOAD STATE ---
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // For Lightbox
  const [isDownloading, setIsDownloading] = useState(false);

  // --- MULTI-SELECT STATE ---
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string[]>([]);

  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const {
    funcImagesIds,
    funcMetaData,
    refreshFuncData,
    isFuncLoading,
    addImages,
    leaveFunc,
    deleteImages,
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

  // Handle Hardware Back Button
  useEffect(() => {
    const backAction = () => {
      if (isSelectMode) {
        setIsSelectMode(false);
        setSelectedBatch([]);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [isSelectMode]);

  const handleShareOrCopy = async () => {
    if (!funcMetaData?.inviteCode) return;

    const joinLink = `outdrinkme://join/${funcMetaData.inviteCode}`;

    try {
      await Share.share({
        message: `Join the function on OutDrinkMe!\n\nInvite Code: ${funcMetaData.inviteCode}\n\nLink: ${joinLink}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

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

  const handleLeaveSession = async () => {
    setShowLeaveModal(false);
    await leaveFunc();
    router.replace("/(tabs)/home");
  };

  // --- SELECTION LOGIC ---
  const handleLongPress = (url: string) => {
    if (!isSelectMode) {
      setIsSelectMode(true);
      setSelectedBatch([url]);
    }
  };

  const handlePressImage = (url: string) => {
    if (isSelectMode) {
      if (selectedBatch.includes(url)) {
        const newBatch = selectedBatch.filter((item) => item !== url);
        setSelectedBatch(newBatch);
        if (newBatch.length === 0) setIsSelectMode(false);
      } else {
        setSelectedBatch([...selectedBatch, url]);
      }
    } else {
      setSelectedImage(url);
    }
  };

  // --- DELETE LOGIC ---
  const handleDeleteImages = (urlsToDelete: string[]) => {
    setItemsToDelete(urlsToDelete);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    // Start Loading Spinner in Modal
    setIsDeletingPhoto(true);
    
    try {
      if (deleteImages) {
        await deleteImages(itemsToDelete);
        
        // Success Actions
        setToastMessage("Photos Deleted");
        setShowSuccessToast(true);
        setSelectedImage(null);
        setIsSelectMode(false);
        setSelectedBatch([]);
        setItemsToDelete([]);
        setTimeout(() => setShowSuccessToast(false), 2000);
        refreshFuncData();
      } else {
        Alert.alert("Error", "Delete function not connected.");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      Alert.alert(
        "Error",
        "Could not delete photos. You might not be the owner."
      );
    } finally {
      // Stop Loading and Close Modal
      setIsDeletingPhoto(false);
      setShowDeleteModal(false);
    }
  };

  // --- BATCH DOWNLOAD LOGIC ---
  const downloadAndSave = async (urls: string[]) => {
    try {
      setIsDownloading(true);

      if (permissionResponse?.status !== "granted") {
        const { status } = await requestPermission();
        if (status !== "granted") {
          Alert.alert("Permission Required", "We need access to save photos.");
          setIsDownloading(false);
          return;
        }
      }

      const assets: MediaLibrary.Asset[] = [];
      for (const url of urls) {
        const filename = `func_${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}.jpg`;
        const fileUri = FileSystem.cacheDirectory + filename;
        const { uri } = await FileSystem.downloadAsync(url, fileUri);
        const asset = await MediaLibrary.createAssetAsync(uri);
        assets.push(asset);
      }

      if (assets.length > 0) {
        const albumName = "Downloads";
        const album = await MediaLibrary.getAlbumAsync(albumName);

        if (album == null) {
          await MediaLibrary.createAlbumAsync(albumName, assets[0], false);
          if (assets.length > 1) {
            await MediaLibrary.addAssetsToAlbumAsync(
              assets.slice(1),
              album,
              false
            );
          }
        } else {
          await MediaLibrary.addAssetsToAlbumAsync(assets, album, false);
        }
      }

      setIsDownloading(false);
      setToastMessage(
        urls.length > 1 ? `Saved ${urls.length} photos` : "Saved to Gallery"
      );
      setShowSuccessToast(true);

      if (isSelectMode) {
        setIsSelectMode(false);
        setSelectedBatch([]);
      }
      setTimeout(() => setShowSuccessToast(false), 2000);
    } catch (error) {
      console.error("Batch save error:", error);
      setIsDownloading(false);
      Alert.alert("Error", "Could not save photos.");
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* --- UPLOAD BAR --- */}
      {uploadStats?.active && (
        <View
          style={{ paddingBottom: insets.bottom }}
          className="bg-orange-600 absolute bottom-0 left-0 right-0 z-[100] shadow-xl border-t border-black/10"
        >
          <View className="px-4 py-3 flex-row items-center justify-between">
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

      <View
        style={{ paddingTop: insets.top + 10 }}
        className="px-4 pb-4 flex-row items-center justify-between border-b border-white/5 bg-black"
      >
        {isSelectMode ? (
          <View className="flex-row items-center justify-between w-full">
            <TouchableOpacity
              onPress={() => {
                setIsSelectMode(false);
                setSelectedBatch([]);
              }}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white font-black text-lg">
              {selectedBatch.length} Selected
            </Text>
            <TouchableOpacity
              disabled={selectedBatch.length === 0}
              onPress={() => handleDeleteImages(selectedBatch)}
              className="w-10 h-10 items-center justify-center rounded-full bg-red-500/10"
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>

            <Text className="text-white font-black text-lg">
              {funcMetaData?.hostUsername
                ? `${funcMetaData.hostUsername}'s Function`
                : "Function"}
            </Text>

            <TouchableOpacity
              onPress={() => setShowLeaveModal(true)}
              className="w-10 h-10 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20"
            >
              <MaterialIcons name="exit-to-app" size={20} color="#ef4444" />
            </TouchableOpacity>
          </>
        )}
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
            progressBackgroundColor="#000000"
          />
        }
      >
        {!isSelectMode && (
          <View className="mt-4 bg-[#111] rounded-[32px] p-6 border border-white/5 shadow-sm">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-orange-600 font-bold tracking-[2px] text-[10px] uppercase mb-1">
                  Active
                </Text>
                <Text
                  className="text-white text-2xl font-black"
                  numberOfLines={1}
                >
                  The Photos
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowQrModal(true)}
                className="bg-orange-600 px-4 py-2 rounded-full flex-row items-center"
              >
                <Ionicons name="qr-code" size={16} color="black" />
                <Text className="text-black font-black ml-2 text-xs">
                  INVITE
                </Text>
              </TouchableOpacity>
            </View>

            {/* --- NEW: HOST INFO --- */}
            <View className="flex-row items-center mb-6 bg-white/5 self-start pr-4 pl-1 py-1 rounded-full border border-white/5">
              {funcMetaData?.hostImageUrl ? (
                <Image
                  source={{ uri: funcMetaData.hostImageUrl }}
                  style={{ width: 28, height: 28, borderRadius: 100 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View className="w-7 h-7 bg-white/10 rounded-full items-center justify-center">
                  <Ionicons name="person" size={14} color="white" />
                </View>
              )}
              <View className="ml-2.5">
                <Text className="text-orange-500 text-[8px] font-black uppercase tracking-wider leading-3">
                  Hosted By
                </Text>
                <Text className="text-white font-bold text-xs leading-4">
                  {funcMetaData?.hostUsername || "Unknown"}
                </Text>
              </View>
            </View>

            {/* STATS ROW */}
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
        )}

        {!isSelectMode && (
          <TouchableOpacity
            onPress={handlePickAndUpload}
            className="mt-4 bg-white py-5 rounded-2xl flex-row justify-center items-center shadow-lg active:opacity-90"
          >
            <FontAwesome5 name="camera" size={18} color="black" />
            <Text className="text-black font-black ml-3 tracking-widest">
              ADD IMAGES
            </Text>
          </TouchableOpacity>
        )}

        {/* --- GRID --- */}
        <View className="flex-row flex-wrap justify-between mt-6">
          {funcImagesIds.map((url, index) => {
            const isSelected = selectedBatch.includes(url);
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onLongPress={() => handleLongPress(url)}
                onPress={() => handlePressImage(url)}
                style={{ width: ITEM_WIDTH, marginBottom: GRID_SPACING }}
                className={`rounded-2xl overflow-hidden bg-white/5 border relative ${
                  isSelected ? "border-orange-500 border-2" : "border-white/10"
                }`}
              >
                <Image
                  source={{ uri: url }}
                  style={{
                    width: "100%",
                    aspectRatio: 0.75,
                    opacity: isSelected ? 0.7 : 1,
                  }}
                  contentFit="cover"
                  cachePolicy="disk"
                  transition={200}
                />
                {isSelectMode ? (
                  <View className="absolute top-2 right-2">
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        isSelected
                          ? "bg-orange-500 border-orange-500"
                          : "border-white bg-black/30"
                      }`}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="black" />
                      )}
                    </View>
                  </View>
                ) : (
                  <View className="absolute bottom-2 right-2 bg-black/50 p-1.5 rounded-full backdrop-blur-md">
                    <Ionicons name="expand" color="white" size={12} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* --- SELECT MODE BOTTOM BAR --- */}
      {isSelectMode && (
        <View
          style={{ paddingBottom: insets.bottom + 20 }}
          className="absolute bottom-0 left-0 right-0 bg-[#121212] border-t border-white/10 px-6 pt-4 flex-row justify-between items-center"
        >
          <Text className="text-white/50 text-xs font-bold uppercase">
            {selectedBatch.length} items
          </Text>

          <View className="flex-row gap-3">
            <TouchableOpacity
              disabled={selectedBatch.length === 0 || isDownloading}
              onPress={() => downloadAndSave(selectedBatch)}
              className={`px-6 py-3 rounded-full flex-row items-center ${
                selectedBatch.length > 0 ? "bg-white" : "bg-white/20"
              }`}
            >
              {isDownloading ? (
                <ActivityIndicator color="black" size="small" />
              ) : (
                <>
                  <Feather name="download" size={18} color="black" />
                  <Text className="text-black font-black ml-2 uppercase">
                    Save
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* --- SUCCESS TOAST OVERLAY --- */}
      {showSuccessToast && (
        <View className="absolute top-1/2 left-0 right-0 items-center z-50">
          <View className="bg-white/95 px-6 py-4 rounded-3xl flex-row items-center shadow-2xl backdrop-blur-xl">
            <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
            <Text className="text-black font-bold ml-2 text-base">
              {toastMessage}
            </Text>
          </View>
        </View>
      )}

      {/* --- LIGHTBOX MODAL --- */}
      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View className="flex-1 bg-black/95 justify-center items-center relative">
          <View
            style={{ top: insets.top + 20 }}
            className="absolute w-full px-5 flex-row justify-between z-50"
          >
            <TouchableOpacity
              onPress={() =>
                selectedImage && handleDeleteImages([selectedImage])
              }
              className="w-12 h-12 bg-red-500/20 rounded-full items-center justify-center border border-red-500/30"
            >
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedImage(null)}
              className="w-12 h-12 bg-white/10 rounded-full items-center justify-center border border-white/10"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

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
              onPress={() => selectedImage && downloadAndSave([selectedImage])}
              className="bg-white px-8 py-4 rounded-full flex-row items-center shadow-lg active:opacity-90"
            >
              {isDownloading ? (
                <ActivityIndicator color="black" size="small" />
              ) : (
                <>
                  <Feather name="download" size={20} color="black" />
                  <Text className="text-black font-black ml-3 tracking-wider">
                    SAVE
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- STANDARDIZED DELETE MODAL --- */}
      <DeleteModal
        visible={showDeleteModal}
        onClose={() => {
          if (!isDeletingPhoto) setShowDeleteModal(false);
        }}
        onConfirm={confirmDelete}
        title={`Delete ${itemsToDelete.length} Photo${itemsToDelete.length > 1 ? "s" : ""}?`}
        message="This action cannot be undone. Only photos you uploaded can be deleted."
        isDeleting={isDeletingPhoto}
      />

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
              You will lose access to this photo dump immediately.
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