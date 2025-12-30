import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
  runOnJS,
  withTiming,
  SharedValue,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import { useAuth } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as Haptics from "expo-haptics";
import Svg, {
  Path as SvgPath,
  Defs,
  Pattern,
  Circle,
  Rect as SvgRect,
} from "react-native-svg";
import { CanvasItem } from "@/types/api.types";
import { apiService } from "@/api";

const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Light) => {
  Haptics.impactAsync(style);
};

const TEXT_COLORS = ["#000000", "#FFFFFF", "#FF4500", "#32CD32", "#1E90FF"];
const GRID_SIZE = 40;

type DrawingStroke = {
  d: string;
  color: string;
  width: number;
};

export default function MemoryCanvas() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const { postId } = useLocalSearchParams();
  const {
    yourMixData,
    userData,
    storeItems,
    userInventory,
    refreshUserInventory,
  } = useApp();
  const { getToken } = useAuth();

  // --- PERMISSIONS ---
  const { canEdit, foundPost } = useMemo(() => {
    const currentPostId = Array.isArray(postId) ? postId[0] : postId;
    const post = yourMixData.find((p) => p.id === currentPostId);

    if (!post || !userData) return { canEdit: false, foundPost: post };

    const isOwner = post.user_id === userData.id;
    const isTagged = post.mentioned_buddies?.some(
      (buddy) => buddy.id === userData.id
    );

    return { canEdit: isOwner || isTagged, foundPost: post };
  }, [yourMixData, postId, userData]);

  const [optimisticUsage, setOptimisticUsage] = useState<
    Record<string, number>
  >({});

  const [items, setItems] = useState<CanvasItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUiHidden, setIsUiHidden] = useState(false);

  const [savedModalVisible, setSavedModalVisible] = useState(false);

  const [history, setHistory] = useState<CanvasItem[][]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [reactions, setReactions] = useState<CanvasItem[]>([]);

  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const [textModalVisible, setTextModalVisible] = useState(false);
  const [inputText, setInputText] = useState("");
  const [selectedTextColor, setSelectedTextColor] = useState("#000000");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [stickerModalVisible, setStickerModalVisible] = useState(false);

  const [itemOptionsVisible, setItemOptionsVisible] = useState(false);
  const [selectedItemForOptions, setSelectedItemForOptions] = useState<
    string | null
  >(null);

  // Drawing
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<string>("");
  const [completedStrokes, setCompletedStrokes] = useState<DrawingStroke[]>([]);
  const [drawingColor, setDrawingColor] = useState("#FF4500");
  const drawBounds = useRef({
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
  });
  const currentPath = useSharedValue("");

  // Camera
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const contextX = useSharedValue(0);
  const contextY = useSharedValue(0);
  const contextScale = useSharedValue(0);
  const isDraggingItem = useSharedValue(false);

  // --- HISTORY MANAGEMENT ---
  const addToHistory = useCallback(
    (newItems: CanvasItem[]) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyStep + 1);
        newHistory.push(newItems);
        if (newHistory.length > 50) newHistory.shift();
        return newHistory;
      });
      setHistoryStep((prev) => prev + 1);
    },
    [historyStep]
  );

  const updateItems = (newItems: CanvasItem[]) => {
    setItems(newItems);
    addToHistory(newItems);
  };

  const handleClose = () => {
    router.replace("/(tabs)/mix");
  };

  const handleGoToStore = () => {
    router.push("/(screens)/store");
  };

  // const availableStickers = useMemo(() => {
  //   if (!userInventory || !storeItems) return [];
  //   const stickers: any[] = [];
  //   ["smoking", "energy", "flag"].forEach((cat) => {
  //     const inventoryItems = userInventory[cat] || [];
  //     const storeCategory = storeItems[cat] || [];
  //     inventoryItems.forEach((invItem: any) => {
  //       if (invItem.quantity > 0) {
  //         const storeDef = storeCategory.find(
  //           (s: any) => s.id === invItem.item_id
  //         );
  //         if (storeDef?.image_url) {
  //           stickers.push({
  //             ...storeDef,
  //             quantity: invItem.quantity,
  //             id: storeDef.id,
  //           });
  //         }
  //       }
  //     });
  //   });
  //   return stickers;
  // }, [userInventory, storeItems]);

  const availableStickers = useMemo(() => {
    if (!userInventory || !storeItems) return [];
    const stickers: any[] = [];
    ["smoking", "energy", "flag"].forEach((cat) => {
      const inventoryItems = userInventory[cat] || [];
      const storeCategory = storeItems[cat] || [];
      inventoryItems.forEach((invItem: any) => {
        // Calculate the real quantity by subtracting local usage
        const usedAmount = optimisticUsage[invItem.item_id] || 0;
        const currentQuantity = invItem.quantity - usedAmount;

        // Check if there are any left optimistically
        if (currentQuantity > 0) {
          const storeDef = storeCategory.find(
            (s: any) => s.id === invItem.item_id
          );
          if (storeDef?.image_url) {
            stickers.push({
              ...storeDef,
              quantity: currentQuantity, // Use the calculated quantity
              id: storeDef.id,
            });
          }
        }
      });
    });
    return stickers;
  }, [userInventory, storeItems, optimisticUsage]); // Add optimisticUsage to dependency array

  // --- CLOUDINARY UPLOAD HELPER ---
  const uploadToCloudinary = async (
    localUri: string
  ): Promise<string | null> => {
    try {
      const manipulatedResult = await ImageManipulator.manipulateAsync(
        localUri,
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const uriToUpload = manipulatedResult.uri;
      const CLOUDINARY_CLOUD_NAME =
        process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const CLOUDINARY_UPLOAD_PRESET =
        process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error("Cloudinary credentials are not configured.");
      }

      const formData = new FormData();
      formData.append("file", {
        uri: uriToUpload,
        type: "image/jpeg",
        name: `canvas_${Date.now()}.jpg`,
      } as any);

      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", "canvas-images");

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
        return data.secure_url;
      }
      return null;
    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert("Upload Error", "Failed to upload image. Please try again.");
      return null;
    }
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    const initializeCanvas = async () => {
      setIsLoading(true);
      try {
        const currentPostId = Array.isArray(postId) ? postId[0] : postId;
        if (!currentPostId || !getToken) return;
        const token = await getToken();
        if (!token) return;

        const savedItems = await apiService.getMemoryWall(currentPostId, token);

        let initialItems: CanvasItem[] = [];

        if (savedItems && savedItems.length > 0) {
          initialItems = savedItems;
        } else if (foundPost) {
          const TARGET_WIDTH = Math.min(SCREEN_WIDTH * 0.75, 400);
          const TARGET_HEIGHT = TARGET_WIDTH * (4 / 3);

          initialItems = [
            {
              id: "main-anchor",
              daily_drinking_id: currentPostId,
              added_by_user_id: foundPost.user_id,
              item_type: "image",
              content: foundPost.image_url || "https://picsum.photos/600/800",
              pos_x: -TARGET_WIDTH / 2,
              pos_y: -TARGET_HEIGHT / 2,
              width: TARGET_WIDTH,
              height: TARGET_HEIGHT,
              rotation: 0,
              scale: 1,
              z_index: 1,
              created_at: new Date().toISOString(),
              author_name: foundPost.username || "You",
              extra_data: { locked: true },
            },
          ];
        }

        setItems(initialItems);
        setHistory([initialItems]);
        setHistoryStep(0);
      } catch (error) {
        console.error("Failed to load memory wall:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCanvas();
  }, [postId, SCREEN_WIDTH, foundPost]);

  // --- ACTIONS ---
  const handleUpdateItem = useCallback(
    (id: string, updates: Partial<CanvasItem>) => {
      // Try updating standard items
      setItems((prev) => {
        const exists = prev.some((i) => i.id === id);
        if (exists) {
          return prev.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          );
        }
        return prev;
      });

      // Try updating reactions
      setReactions((prev) => {
        const exists = prev.some((r) => r.id === id);
        if (exists) {
          return prev.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          );
        }
        return prev;
      });
    },
    []
  );

  const onGestureEndAction = useCallback(() => {
    setItems((currentItems) => {
      addToHistory(currentItems);
      return currentItems;
    });
  }, [addToHistory]);

  const handleAddReaction = (id: string, imageUrl: string) => {
    setOptimisticUsage((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));

    const { x, y } = getCenterPosition();
    const allItems = [...items, ...reactions];
    const maxZ =
      allItems.length > 0
        ? Math.max(...allItems.map((i) => i.z_index || 0))
        : 0;

    const newReaction: CanvasItem = {
      id: Math.random().toString(),
      daily_drinking_id: postId as string,
      added_by_user_id: userData?.id || "",
      item_type: "reaction",
      content: imageUrl,
      pos_x: x - 50,
      pos_y: y - 50,
      width: 120,
      height: 120,
      rotation: (Math.random() - 0.5) * 20,
      scale: 1,
      z_index: maxZ + 1,
      created_at: new Date().toISOString(),
      extra_data: { inventory_item_id: id, is_reaction: true },
    };

    setReactions((prev) => [...prev, newReaction]);
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveCanvas = async () => {
    if (items.length === 0 && reactions.length === 0) return;

    setIsSaving(true);
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const token = await getToken();
      const currentPostId = Array.isArray(postId) ? postId[0] : postId;

      console.log("items");
      console.log(items);
      console.log("reactions");
      console.log(reactions);
      await apiService.saveMemoryWall(currentPostId!, items, reactions, token!);

      await refreshUserInventory();

      setOptimisticUsage({});

      setSavedModalVisible(true);
      setTimeout(() => setSavedModalVisible(false), 1500);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getCenterPosition = () => {
    const x = -translateX.value / scale.value;
    const y = -translateY.value / scale.value;
    const randomOffset = () => (Math.random() - 0.5) * 40;
    return { x: x + randomOffset(), y: y + randomOffset() };
  };

  const handleStartEdit = useCallback(
    (id: string, content: string, color?: string) => {
      triggerHaptic();
      setEditingItemId(id);
      setInputText(content);
      setSelectedTextColor(color || "#000000");
      setTextModalVisible(true);
    },
    []
  );

  const handleOpenItemOptions = useCallback((id: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedItemForOptions(id);
    setItemOptionsVisible(true);
  }, []);

  const toggleLockItem = () => {
    if (!selectedItemForOptions) return;
    setItems((prev) => {
      const newItems = prev.map((item) => {
        if (item.id === selectedItemForOptions) {
          const isLocked = item.extra_data?.locked || false;
          return {
            ...item,
            extra_data: { ...item.extra_data, locked: !isLocked },
          };
        }
        return item;
      });
      addToHistory(newItems);
      return newItems;
    });
    setItemOptionsVisible(false);
  };

  const handleDeleteSelectedItem = () => {
    if (!selectedItemForOptions) return;
    const newItems = items.filter((i) => i.id !== selectedItemForOptions);
    updateItems(newItems);
    setItemOptionsVisible(false);
  };

  const handleBringToFront = useCallback((id: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx === -1) return prev;
      const maxZ =
        prev.length > 0 ? Math.max(...prev.map((i) => i.z_index || 0)) : 0;
      const newItems = [...prev];
      const [item] = newItems.splice(idx, 1);
      item.z_index = maxZ + 1;
      newItems.push(item);
      return newItems;
    });
  }, []);

  const handleAddPhoto = async () => {
    if (isUploading) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);
        const uploadedUrl = await uploadToCloudinary(result.assets[0].uri);
        if (!uploadedUrl) {
          setIsUploading(false);
          return;
        }

        const { x, y } = getCenterPosition();
        const maxZ =
          items.length > 0 ? Math.max(...items.map((i) => i.z_index || 0)) : 0;

        const newItem: CanvasItem = {
          id: Math.random().toString(),
          daily_drinking_id: postId as string,
          added_by_user_id: userData?.id || "",
          item_type: "image",
          content: uploadedUrl,
          pos_x: x - 100,
          pos_y: y - 100,
          width: 200,
          height: 200,
          rotation: (Math.random() - 0.5) * 20,
          scale: 1,
          z_index: maxZ + 1,
          created_at: new Date().toISOString(),
          author_name: userData?.firstName || "Me",
        };
        updateItems([...items, newItem]);
      }
    } catch (e) {
      console.log("Error adding photo", e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveText = () => {
    if (!inputText.trim()) {
      if (editingItemId)
        updateItems(items.filter((i) => i.id !== editingItemId));
      setTextModalVisible(false);
      setEditingItemId(null);
      return;
    }
    let newItems = [...items];
    if (editingItemId) {
      newItems = newItems.map((i) =>
        i.id === editingItemId
          ? {
              ...i,
              content: inputText,
              extra_data: { ...i.extra_data, color: selectedTextColor },
            }
          : i
      );
    } else {
      const { x, y } = getCenterPosition();
      const maxZ =
        items.length > 0 ? Math.max(...items.map((i) => i.z_index || 0)) : 0;

      newItems.push({
        id: Math.random().toString(),
        daily_drinking_id: postId as string,
        added_by_user_id: userData?.id || "",
        item_type: "text",
        content: inputText,
        pos_x: x,
        pos_y: y,
        width: Math.min(inputText.length * 20, 300),
        height: 100,
        rotation: 0,
        scale: 1,
        z_index: maxZ + 1,
        created_at: new Date().toISOString(),
        extra_data: { color: selectedTextColor },
      });
    }
    updateItems(newItems);
    setTextModalVisible(false);
  };

  const handleAddSticker = (id: string, imageUrl: string) => {
    setOptimisticUsage((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));

    const { x, y } = getCenterPosition();
    const maxZ =
      items.length > 0 ? Math.max(...items.map((i) => i.z_index || 0)) : 0;

    const newItem: CanvasItem = {
      id: Math.random().toString(),
      daily_drinking_id: postId as string,
      added_by_user_id: userData?.id || "",
      item_type: "sticker",
      content: imageUrl,
      pos_x: x - 50,
      pos_y: y - 50,
      width: 120,
      height: 120,
      rotation: (Math.random() - 0.5) * 20,
      scale: 1,
      z_index: maxZ + 1,
      created_at: new Date().toISOString(),
      extra_data: { inventory_item_id: id },
    };
    updateItems([...items, newItem]);
    setStickerModalVisible(false);
  };

  const updateDrawState = useCallback((x: number, y: number, path: string) => {
    drawBounds.current.minX = Math.min(drawBounds.current.minX, x);
    drawBounds.current.maxX = Math.max(drawBounds.current.maxX, x);
    drawBounds.current.minY = Math.min(drawBounds.current.minY, y);
    drawBounds.current.maxY = Math.max(drawBounds.current.maxY, y);
    setCurrentStroke(path);
  }, []);

  const endDrawState = useCallback(
    (finalPath: string) => {
      if (!finalPath) return;
      setCompletedStrokes((prev) => [
        ...prev,
        { d: finalPath, color: drawingColor, width: 4 },
      ]);
      setCurrentStroke("");
    },
    [drawingColor]
  );

  const saveDrawing = () => {
    if (completedStrokes.length === 0) {
      setIsDrawingMode(false);
      return;
    }
    const { minX, maxX, minY, maxY } = drawBounds.current;
    const padding = 20;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;
    const worldX =
      (minX + (maxX - minX) / 2 - SCREEN_WIDTH / 2 - translateX.value) /
      scale.value;
    const worldY =
      (minY + (maxY - minY) / 2 - SCREEN_HEIGHT / 2 - translateY.value) /
      scale.value;
    const viewBox = `${minX - padding} ${minY - padding} ${width} ${height}`;
    const maxZ =
      items.length > 0 ? Math.max(...items.map((i) => i.z_index || 0)) : 0;

    updateItems([
      ...items,
      {
        id: Math.random().toString(),
        daily_drinking_id: postId as string,
        added_by_user_id: userData?.id || "",
        item_type: "drawing",
        content: JSON.stringify({ strokes: completedStrokes, viewBox }),
        pos_x: worldX,
        pos_y: worldY,
        width: width / scale.value,
        height: height / scale.value,
        rotation: 0,
        scale: 1,
        z_index: maxZ + 1,
        created_at: new Date().toISOString(),
      },
    ]);
    setIsDrawingMode(false);
  };

  const startDrawing = () => {
    setIsDrawingMode(true);
    setCompletedStrokes([]);
    setCurrentStroke("");
    currentPath.value = "";
    drawBounds.current = {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    };
  };

  const drawingPan = Gesture.Pan()
    .minDistance(1)
    .onStart((g) => {
      currentPath.value = `M ${g.x} ${g.y}`;
      runOnJS(updateDrawState)(g.x, g.y, currentPath.value);
    })
    .onUpdate((g) => {
      currentPath.value = `${currentPath.value} L ${g.x} ${g.y}`;
      runOnJS(updateDrawState)(g.x, g.y, currentPath.value);
    })
    .onEnd(() => {
      runOnJS(endDrawState)(currentPath.value);
    });

  // --- CAMERA GESTURES ---
  const panGesture = Gesture.Pan()
    .enabled(!isDrawingMode)
    .onStart(() => {
      contextX.value = translateX.value;
      contextY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = contextX.value + e.translationX;
      translateY.value = contextY.value + e.translationY;
    })
    .onEnd((e) => {
      translateX.value = withDecay({
        velocity: e.velocityX,
        deceleration: 0.998,
      });
      translateY.value = withDecay({
        velocity: e.velocityY,
        deceleration: 0.998,
      });
    });

  const pinchGesture = Gesture.Pinch()
    .enabled(!isDrawingMode)
    .onStart(() => {
      contextScale.value = scale.value;
    })
    .onUpdate((e) => {
      const s = contextScale.value * e.scale;
      if (s > 0.1 && s < 10) scale.value = s;
    });

  const composedCameraGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedCanvasStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));
  const trashStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(isDraggingItem.value ? 0 : 150) }],
    opacity: withTiming(isDraggingItem.value ? 1 : 0),
  }));
  const bottomControlsStyle = useAnimatedStyle(() => ({
    opacity: withTiming(
      isDraggingItem.value || isDrawingMode || isUiHidden ? 0 : 1
    ),
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />

      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#f5f5f5" }]} />

      {showGrid && !isUiHidden && (
        <View
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
          className="opacity-10"
        >
          <Svg height="100%" width="100%">
            <Defs>
              <Pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <Circle cx="2" cy="2" r="1.5" fill="gray" />
              </Pattern>
            </Defs>
            <SvgRect width="100%" height="100%" fill="url(#grid)" />
          </Svg>
        </View>
      )}

      {/* Main Canvas */}
      <View style={{ flex: 1, overflow: "hidden" }}>
        <GestureDetector gesture={composedCameraGesture}>
          <Animated.View className="flex-1 bg-transparent">
            <Animated.View
              style={[
                { flex: 1, justifyContent: "center", alignItems: "center" },
                animatedCanvasStyle,
              ]}
            >
              <View style={{ width: 0, height: 0, overflow: "visible" }}>
                {[...items, ...reactions].map((item) => (
                  <DraggableItem
                    key={item.id}
                    item={item}
                    screenHeight={SCREEN_HEIGHT}
                    currentUserId={userData?.id}
                    canEdit={Boolean(canEdit)}
                    onUpdate={handleUpdateItem}
                    onGestureEnd={onGestureEndAction}
                    onBringToFront={() => runOnJS(handleBringToFront)(item.id)}
                    onDelete={(id) => {
                      setItems((prev) => {
                        if (prev.find((i) => i.id === id)) {
                          const n = prev.filter((i) => i.id !== id);
                          updateItems(n);
                          return n;
                        }
                        return prev;
                      });

                      setReactions((prev) => {
                        if (prev.find((r) => r.id === id)) {
                          return prev.filter((r) => r.id !== id);
                        }
                        return prev;
                      });
                    }}
                    onEdit={handleStartEdit}
                    onLongPress={handleOpenItemOptions}
                    isDraggingShared={isDraggingItem}
                    isDrawingMode={isDrawingMode || isUiHidden}
                    snapToGrid={snapToGrid}
                  />
                ))}
              </View>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Loading Overlay */}
      {(isLoading || isUploading) && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              justifyContent: "center",
              alignItems: "center",
              zIndex: 100,
              backgroundColor: "rgba(245, 245, 245, 0.5)",
            },
          ]}
        >
          <ActivityIndicator size="large" color="black" />
        </View>
      )}

      {/* DRAWING OVERLAY */}
      {isDrawingMode && canEdit && (
        <View className="absolute inset-0 z-50 bg-black/5">
          <GestureDetector gesture={drawingPan}>
            <View className="flex-1">
              <Svg style={{ flex: 1 }}>
                {completedStrokes.map((s, i) => (
                  <SvgPath
                    key={i}
                    d={s.d}
                    stroke={s.color}
                    strokeWidth={s.width}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
                {currentStroke ? (
                  <SvgPath
                    d={currentStroke}
                    stroke={drawingColor}
                    strokeWidth={4}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : null}
              </Svg>
            </View>
          </GestureDetector>
          <View className="absolute top-10 left-0 right-0 flex-row justify-between px-6 items-start">
            <View className="bg-black/80 rounded-full p-2 gap-2">
              {TEXT_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setDrawingColor(c)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    drawingColor === c ? "border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </View>
            <View className="gap-4">
              <TouchableOpacity
                onPress={saveDrawing}
                className="bg-orange-600 px-6 py-3 rounded-full shadow-lg items-center"
              >
                <Text className="text-white font-black">DONE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsDrawingMode(false)}
                className="bg-white px-6 py-3 rounded-full shadow-lg"
              >
                <Text className="text-black font-bold">CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* HEADER */}
      <View
        className="absolute top-0 left-0 right-0 flex-row justify-between items-center px-4"
        style={{ paddingTop: insets.top + 10 }}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          onPress={handleClose}
          className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm border border-black/5"
        >
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => {
              translateX.value = withSpring(0);
              translateY.value = withSpring(0);
              scale.value = withSpring(0.9);
              triggerHaptic();
            }}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-lg border border-black/10"
          >
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={20}
              color="#333"
            />
          </TouchableOpacity>
          {canEdit && (
            <TouchableOpacity
              onPress={() => {
                setIsUiHidden(!isUiHidden);
                triggerHaptic();
              }}
              className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm border border-black/5"
            >
              <Ionicons
                name={isUiHidden ? "eye-off" : "eye"}
                size={20}
                color={isUiHidden ? "#ff8c00" : "black"}
              />
            </TouchableOpacity>
          )}
          {canEdit && !isUiHidden && (
            <TouchableOpacity
              onPress={() => setSettingsModalVisible(true)}
              className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm border border-black/5"
            >
              <Ionicons name="settings-outline" size={20} color="black" />
            </TouchableOpacity>
          )}

          {!isUiHidden && (
            <TouchableOpacity
              onPress={handleSaveCanvas}
              disabled={isSaving}
              className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm border border-black/5"
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="black" />
              ) : (
                <Feather name="check" size={24} color="black" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* {!canEdit && (
        <Animated.View
          className="absolute left-0 right-0 bg-black/80 rounded-t-3xl shadow-2xl z-50"
          style={[
            { bottom: 0, paddingBottom: insets.bottom + 10, height: 160 },
            bottomControlsStyle,
          ]}
        >
          <Text className="text-white/50 text-[11px] font-bold tracking-widest text-center uppercase my-3">
            Inventory
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {availableStickers.map((sticker, idx) => (
              <View key={idx} className="relative m-2 overflow-visible">
                <TouchableOpacity
                  onPress={() =>
                    handleAddReaction(sticker.id, sticker.image_url)
                  } 
                  className="w-20 h-20 bg-white/10 rounded-xl items-center justify-center border border-white/10 overflow-visible"
                >
                  <Image
                    source={{ uri: sticker.image_url }}
                    className="w-[80%] h-[80%]"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <View
                  className="absolute -top-2 -right-2 bg-orange-600 rounded-full w-6 h-6 items-center justify-center border-2 border-black shadow-lg"
                  style={{ zIndex: 50, elevation: 8 }}
                >
                  <Text className="text-white text-[10px] font-bold">
                    {sticker.quantity}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      )} */}

      {!isUiHidden && (
        <Animated.View
          className="absolute bottom-10 left-0 right-0 items-center justify-center z-50 pointer-events-none"
          style={trashStyle}
        >
          <View className="w-16 h-16 bg-red-500/90 rounded-full items-center justify-center shadow-2xl border-2 border-white">
            <Ionicons name="trash" size={28} color="white" />
          </View>
          <Text className="text-red-500 font-bold mt-2 text-xs uppercase tracking-widest bg-white/50 px-2 rounded">
            Drag here to remove
          </Text>
        </Animated.View>
      )}

      {!isUiHidden && !isDrawingMode && (
        <>
          {canEdit ? (
            <Animated.View
              className="absolute left-6 right-6 bg-black rounded-full h-16 flex-row items-center justify-evenly shadow-2xl border border-white/10 z-50 px-2"
              style={[{ bottom: insets.bottom + 20 }, bottomControlsStyle]}
            >
              <View className="flex-row gap-4 items-center">
                <ToolIcon
                  name="image"
                  onPress={handleAddPhoto}
                  color="white"
                  loading={isUploading}
                />
                <ToolIcon
                  name="text"
                  onPress={() => {
                    setEditingItemId(null);
                    setInputText("");
                    setTextModalVisible(true);
                  }}
                  color="white"
                />
                <ToolIcon name="pencil" onPress={startDrawing} color="white" />
                <ToolIcon
                  name="cube-outline"
                  onPress={() => setStickerModalVisible(true)}
                  color="white"
                />
              </View>
            </Animated.View>
          ) : (
            <Animated.View
              className="absolute left-0 right-0 bg-black/80 rounded-t-3xl shadow-2xl border-t border-white/10 z-50"
              style={[
                { bottom: 0, paddingBottom: insets.bottom + 10, height: 160 },
                bottomControlsStyle,
              ]}
            >
              <Text className="text-white/50 text-[11px] font-bold tracking-widest text-center uppercase my-3">
                Inventory
              </Text>

              {availableStickers.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 20,
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  {availableStickers.map((sticker, idx) => (
                    <View key={idx} className="relative m-2 overflow-visible">
                      <TouchableOpacity
                        onPress={() =>
                          handleAddReaction(sticker.id, sticker.image_url)
                        }
                        className="w-20 h-20 bg-white/10 rounded-xl items-center justify-center border border-white/10"
                      >
                        <Image
                          source={{ uri: sticker.image_url }}
                          className="w-[80%] h-[80%]"
                          resizeMode="contain"
                        />
                      </TouchableOpacity>

                      <View
                        className="absolute top-1 right-1 bg-orange-600 rounded-full w-6 h-6 items-center justify-center border border-black"
                        style={{ zIndex: 10, elevation: 6 }}
                      >
                        <Text className="text-white text-[10px] font-bold">
                          {sticker.quantity}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View className="flex-1 items-center justify-center gap-3">
                  <Text className="text-white/70 font-bold">
                    No stickers in inventory
                  </Text>
                  <TouchableOpacity
                    onPress={handleGoToStore}
                    className="bg-orange-600 px-6 py-2 rounded-full"
                  >
                    <Text className="text-white font-bold text-sm">
                      Get Items from Store
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          )}
        </>
      )}

      {/* SETTINGS MODAL */}
      <Modal visible={settingsModalVisible} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setSettingsModalVisible(false)}
          className="flex-1 bg-black/50 justify-center items-center px-6"
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              backgroundColor: "white",
              width: "100%",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <Text className="text-xl font-black text-center mb-6">
              SETTINGS
            </Text>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="font-bold text-base">Show Grid</Text>
              <Switch
                value={showGrid}
                onValueChange={setShowGrid}
                trackColor={{ false: "#eee", true: "#ff8c00" }}
              />
            </View>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="font-bold text-base">Snap to Grid</Text>
              <Switch
                value={snapToGrid}
                onValueChange={setSnapToGrid}
                trackColor={{ false: "#eee", true: "#ff8c00" }}
              />
            </View>
            <TouchableOpacity
              onPress={() => setSettingsModalVisible(false)}
              className="bg-black py-4 rounded-xl"
            >
              <Text className="text-white text-center font-bold">Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ITEM OPTIONS MODAL */}
      <Modal visible={itemOptionsVisible} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setItemOptionsVisible(false)}
          className="flex-1 bg-black/50 justify-center items-center px-6"
        >
          <View className="bg-white w-2/3 rounded-2xl p-4 shadow-xl gap-4">
            <Text className="text-center font-bold text-gray-400 text-xs tracking-widest uppercase mb-2">
              Item Options
            </Text>
            {canEdit && (
              <TouchableOpacity
                onPress={toggleLockItem}
                className="flex-row items-center gap-4 p-3 bg-gray-50 rounded-xl"
              >
                <Ionicons
                  name={
                    items.find((i) => i.id === selectedItemForOptions)
                      ?.extra_data?.locked
                      ? "lock-open"
                      : "lock-closed"
                  }
                  size={20}
                  color="black"
                />
                <Text className="font-bold text-base">
                  {items.find((i) => i.id === selectedItemForOptions)
                    ?.extra_data?.locked
                    ? "Unlock Item"
                    : "Lock Item"}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleDeleteSelectedItem}
              className="flex-row items-center gap-4 p-3 bg-red-50 rounded-xl"
            >
              <Ionicons name="trash" size={20} color="red" />
              <Text className="font-bold text-base text-red-600">Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* TEXT MODAL */}
      <Modal visible={textModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/80 justify-center items-center px-4"
        >
          <View className="w-full items-center space-y-6">
            <TextInput
              autoFocus
              value={inputText}
              onChangeText={setInputText}
              style={{ color: selectedTextColor }}
              className="w-full text-center font-black text-3xl p-4 border-b border-white/30"
              placeholder="Type..."
              onSubmitEditing={handleSaveText}
            />
            <View className="flex-row gap-4">
              {TEXT_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedTextColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedTextColor === color
                      ? "border-white scale-125"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </View>
            <View className="flex-row gap-4 mt-4">
              <TouchableOpacity
                onPress={() => setTextModalVisible(false)}
                className="px-6 py-2 rounded-full bg-white/10"
              >
                <Text className="text-white font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveText}
                className="px-6 py-2 rounded-full bg-orange-600"
              >
                <Text className="text-white font-bold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={stickerModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end">
          <TouchableOpacity
            className="flex-1"
            onPress={() => setStickerModalVisible(false)}
          />
          <View className="bg-[#1a1a1a] rounded-t-3xl p-6 h-[60%] border-t border-white/10">
            <Text className="text-white/50 text-sm font-bold tracking-widest mb-6 text-center uppercase">
              Inventory
            </Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40, paddingTop: 12 }}
            >
              <View className="flex-row flex-wrap justify-between">
                {availableStickers.map((sticker, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() =>
                      handleAddSticker(sticker.id, sticker.image_url)
                    }
                    style={{ overflow: "visible" }}
                    className="w-[30%] aspect-square bg-white/5 rounded-2xl items-center justify-center border border-white/10 mb-4 relative shadow-sm"
                  >
                    <Image
                      source={{ uri: sticker.image_url }}
                      className="w-[70%] h-[70%]"
                      resizeMode="contain"
                    />
                    <View
                      style={{ zIndex: 10 }}
                      className="absolute -top-2 -right-2 bg-orange-600 rounded-full min-w-[22px] h-[22px] items-center justify-center border border-[#1a1a1a] shadow"
                    >
                      <Text className="text-white text-[10px] font-bold">
                        {sticker.quantity}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                <View className="w-[30%]" />
                <View className="w-[30%]" />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={savedModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSavedModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSavedModalVisible(false)}
            className="flex-1 bg-black/80 justify-end"
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              className="bg-black/95 rounded-t-3xl border-t-2 border-orange-600/30"
              style={{
                paddingBottom: insets.bottom + 20,
              }}
            >
              <View className="px-4 py-12 items-center">
                <View className="w-20 h-20 rounded-full bg-orange-600/20 items-center justify-center mb-5">
                  <Ionicons name="checkmark-circle" size={48} color="#EA580C" />
                </View>
                <Text className="text-white text-3xl font-black mb-3 text-center">
                  Saved
                </Text>
                <Text className="text-white/60 text-center text-base mb-8 px-4">
                  {canEdit
                    ? "Your memory has been successfully updated"
                    : "Your reaction has been sent"}
                </Text>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </GestureHandlerRootView>
  );
}

const ToolIcon = ({
  name,
  onPress,
  color = "black",
  loading = false,
}: {
  name: any;
  onPress: () => void;
  color?: string;
  loading?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    className="items-center justify-center w-10 h-10 active:scale-90 transition-transform"
  >
    {loading ? (
      <ActivityIndicator size="small" color={color} />
    ) : (
      <Ionicons name={name} size={24} color={color} />
    )}
  </TouchableOpacity>
);

interface DraggableItemProps {
  item: CanvasItem;
  screenHeight: number;
  currentUserId?: string;
  canEdit: boolean;
  onUpdate: (id: string, updates: Partial<CanvasItem>) => void;
  onGestureEnd: () => void;
  onBringToFront: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string, color?: string) => void;
  onLongPress: (id: string) => void;
  isDraggingShared: SharedValue<boolean>;
  isDrawingMode: boolean;
  snapToGrid: boolean;
}

const DraggableItem = ({
  item,
  screenHeight,
  currentUserId,
  canEdit,
  onUpdate,
  onGestureEnd,
  onBringToFront,
  onDelete,
  onEdit,
  onLongPress,
  isDraggingShared,
  isDrawingMode,
  snapToGrid,
}: DraggableItemProps) => {
  const translateX = useSharedValue(item.pos_x);
  const translateY = useSharedValue(item.pos_y);
  const scale = useSharedValue(item.scale);
  const rotation = useSharedValue(item.rotation);
  const isActive = useSharedValue(false);
  const isOverTrash = useSharedValue(false);
  const context = useSharedValue({ x: 0, y: 0, scale: 1, rotation: 0 });

  const isLocked = !!item.extra_data?.locked;

  const isMine = !!currentUserId && item.added_by_user_id === currentUserId;
  const canInteract = Boolean(
    !isDrawingMode && !isLocked && (canEdit || isMine)
  );

  const tap = Gesture.Tap()
    .numberOfTaps(2)
    .enabled(canInteract)
    .onStart(() => {
      if (item.item_type === "text")
        runOnJS(onEdit)(item.id, item.content, item.extra_data?.color);
    });

  const longPress = Gesture.LongPress()
    .minDuration(500)
    .enabled(!isDrawingMode && (canEdit || isMine))
    .onStart(() => {
      runOnJS(onLongPress)(item.id);
    });

  const pan = Gesture.Pan()
    .enabled(canInteract)
    .onStart(() => {
      isActive.value = true;
      isDraggingShared.value = true;
      runOnJS(onBringToFront)(item.id);
      runOnJS(triggerHaptic)();
      context.value = {
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
        rotation: rotation.value,
      };
    })
    .onUpdate((e) => {
      let newX = context.value.x + e.translationX;
      let newY = context.value.y + e.translationY;

      if (snapToGrid) {
        newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
        newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
      }

      translateX.value = newX;
      translateY.value = newY;

      if (e.absoluteY > screenHeight - 120) {
        if (!isOverTrash.value) {
          isOverTrash.value = true;
          runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Medium);
        }
      } else if (isOverTrash.value) isOverTrash.value = false;
    })
    .onEnd(() => {
      isActive.value = false;
      isDraggingShared.value = false;
      if (isOverTrash.value) {
        scale.value = withTiming(0, {}, () => {
          runOnJS(onDelete)(item.id);
        });
      } else {
        runOnJS(onUpdate)(item.id, {
          pos_x: translateX.value,
          pos_y: translateY.value,
        });
        runOnJS(onGestureEnd)();
      }
      isOverTrash.value = false;
    });

  const pinch = Gesture.Pinch()
    .enabled(canInteract)
    .onStart(() => {
      context.value.scale = scale.value;
    })
    .onUpdate((e) => {
      const s = context.value.scale * e.scale;
      if (s > 0.1 && s < 10) scale.value = s;
    })
    .onEnd(() => {
      runOnJS(onUpdate)(item.id, { scale: scale.value });
      runOnJS(onGestureEnd)();
    });

  const rotate = Gesture.Rotation()
    .enabled(canInteract)
    .onStart(() => {
      context.value.rotation = rotation.value;
    })
    .onUpdate((e) => {
      rotation.value = context.value.rotation + (e.rotation * 180) / Math.PI;
    })
    .onEnd(() => {
      runOnJS(onUpdate)(item.id, { rotation: rotation.value });
      runOnJS(onGestureEnd)();
    });

  const gesture = Gesture.Race(
    longPress,
    tap,
    Gesture.Simultaneous(pan, pinch, rotate)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value * (isOverTrash.value ? 0.7 : 1) },
      { rotate: `${rotation.value}deg` },
    ],
    zIndex: isActive.value ? 9999 : item.z_index,
    opacity: isOverTrash.value ? 0.6 : 1,
  }));

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: isOverTrash.value
      ? "red"
      : isActive.value
      ? "#ff8c00"
      : "transparent",
    borderWidth: isActive.value || isOverTrash.value ? 2 : 0,
  }));

  const drawingData = useMemo(() => {
    if (item.item_type !== "drawing") return null;
    try {
      return JSON.parse(item.content);
    } catch {
      return null;
    }
  }, [item.content]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          { position: "absolute", width: item.width, height: item.height },
          animatedStyle,
        ]}
      >
        <Animated.View style={[{ flex: 1 }, borderStyle]}>
          {canEdit && isLocked && (
            <View
              style={{
                position: "absolute",
                top: -10,
                right: -10,
                zIndex: 100,
                backgroundColor: "white",
                padding: 4,
                borderRadius: 10,
                shadowColor: "black",
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Ionicons name="lock-closed" size={12} color="#666" />
            </View>
          )}

          {item.item_type === "image" && (
            <View
              className="bg-white shadow-xl border border-black/5"
              style={{
                flex: 1,
                padding: item.width * 0.02,
              }}
            >
              <Image
                source={{ uri: item.content }}
                className="w-full h-full bg-zinc-100"
                resizeMode="cover"
              />
            </View>
          )}
          {(item.item_type === "sticker" || item.item_type === "reaction") && (
            <Image
              source={{ uri: item.content }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          )}
          {item.item_type === "text" && (
            <Text
              className="font-black text-center"
              style={{
                fontSize: item.width / 4,
                width: item.width,
                color: item.extra_data?.color || "#000000",
              }}
            >
              {item.content}
            </Text>
          )}
          {item.item_type === "drawing" && drawingData && (
            <Svg style={{ flex: 1 }} viewBox={drawingData.viewBox}>
              {drawingData.strokes.map((s: any, i: number) => (
                <SvgPath
                  key={i}
                  d={s.d}
                  stroke={s.color}
                  strokeWidth={s.width}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </Svg>
          )}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};
