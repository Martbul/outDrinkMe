import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { Header } from "@/components/header"; // Assuming you have a Header component

const { width, height } = Dimensions.get("window");

// --- Dummy Data for Inventory Items ---
// In a real app, these would come from your user's inventory
interface InventoryItem {
  id: string;
  type: "achievement" | "text" | "social" | "image" | "level" | "connect";
  label: string;
  icon?: string; // MaterialCommunityIcons or FontAwesome5 icon name
  rarity?: "Legendary" | "Epic" | "Rare" | "Common" | "Uncommon";
  value?: string; // For text items, social links, levels
  imageUrl?: string; // For image items
}

const dummyInventory: InventoryItem[] = [
  { id: "1", type: "achievement", label: "Achievemary", icon: "medal" },
  { id: "2", type: "text", label: "Hctileria Text", value: "Custom Text" },
  { id: "3", type: "level", label: "Legendary", rarity: "Legendary" },
  { id: "4", type: "level", label: "Epic", rarity: "Epic" },
  { id: "5", type: "social", label: "Rare", rarity: "Rare" },
  { id: "6", type: "connect", label: "Conne+8" },
  { id: "7", type: "social", label: "Social Link" },
  { id: "8", type: "level", label: "Common", rarity: "Common" },
  { id: "9", type: "level", label: "Level 7 / 10", rarity: "Uncommon" },
  { id: "10", type: "level", label: "Level 7 / 10", rarity: "Uncommon" },
];

// --- Rarity Colors (from your example) ---
const getRarityColor = (rarity?: InventoryItem["rarity"]) => {
  switch (rarity) {
    case "Legendary":
      return "#FFD700"; // Gold
    case "Epic":
      return "#8A2BE2"; // BlueViolet
    case "Rare":
      return "#00BFFF"; // DeepSkyBlue
    case "Uncommon":
      return "#90EE90"; // LightGreen
    case "Common":
      return "#A9A9A9"; // DarkGray
    default:
      return "#FFFFFF"; // Default white
  }
};

interface PlacedItem extends InventoryItem {
  x: number;
  y: number;
}

export default function ProfileBuilderScreen() {
  const insets = useSafeAreaInsets();
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [username, setUsername] = useState("CREATOR_X"); // Placeholder

  const filteredInventory = dummyInventory.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Placeholder for Drag & Drop functionality ---
  // In a real implementation, you'd use a library like react-native-reanimated
  // and react-native-gesture-handler to make items draggable from the inventory
  // and droppable onto the canvas.
  const handleDragStart = (item: InventoryItem) => {
    console.log("Drag started for:", item.label);
    // Logic to store the item being dragged
  };

  const handleDrop = (x: number, y: number, item: InventoryItem) => {
    console.log("Item dropped at:", x, y, item.label);
    // Logic to add the item to placedItems state with its new coordinates
    // For now, we'll just simulate adding a new item
    const newItem: PlacedItem = {
      ...item,
      id: `${item.id}-${Date.now()}`, // Ensure unique ID for placed items
      x: x, // These would be actual drop coordinates
      y: y,
    };
    setPlacedItems((prev) => [...prev, newItem]);
  };

  const handleSaveProfile = () => {
    console.log("Profile Saved:", placedItems);
    // API call to save user profile layout
  };

  const handleShareDraft = () => {
    console.log("Share Draft:", placedItems);
    // Logic to generate a shareable link or image
  };

  const handleResetProfile = () => {
    setPlacedItems([]);
    console.log("Profile Reset");
  };

  // --- Draggable Inventory Item Component ---
  // This would be wrapped with PanGestureHandler and Animated.View
  const InventoryDraggableItem: React.FC<{ item: InventoryItem }> = ({
    item,
  }) => (
    <TouchableOpacity
      style={[
        styles.inventoryItemContainer,
        { borderColor: getRarityColor(item.rarity) },
      ]}
      onLongPress={() => handleDragStart(item)} // Simulate drag start
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.inventoryItemIconBg,
          { backgroundColor: `${getRarityColor(item.rarity)}20` },
        ]}
      >
        {item.icon === "medal" && (
          <FontAwesome5 name="medal" size={24} color="#EA580C" />
        )}
        {item.icon === "comment-text" && (
          <MaterialCommunityIcons
            name="comment-text"
            size={24}
            color="#EA580C"
          />
        )}
        {item.icon === "share-variant" && (
          <MaterialCommunityIcons
            name="share-variant"
            size={24}
            color="#EA580C"
          />
        )}
        {!item.icon && item.type === "level" && (
          <Text
            style={[
              styles.inventoryItemIconText,
              { color: getRarityColor(item.rarity) },
            ]}
          >
            {item.label.charAt(0)}
          </Text>
        )}
        {!item.icon && item.type === "connect" && (
          <MaterialCommunityIcons name="link-plus" size={24} color="#EA580C" />
        )}
        {!item.icon && item.type === "social" && (
          <FontAwesome5 name="link" size={24} color="#EA580C" />
        )}
        {/* Add more icons based on item.type */}
      </View>
      <Text style={styles.inventoryItemLabel} numberOfLines={1}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  // --- Placed Canvas Item Component ---
  // These would also be draggable/resizable on the canvas
  const CanvasPlacedItem: React.FC<{ item: PlacedItem }> = ({ item }) => (
    <View
      style={[
        styles.canvasItemContainer,
        {
          left: item.x,
          top: item.y,
          borderColor: getRarityColor(item.rarity),
        },
      ]}
    >
      <View
        style={[
          styles.canvasItemHeader,
          { backgroundColor: `${getRarityColor(item.rarity)}20` },
        ]}
      >
        <Text
          style={[
            styles.canvasItemLabel,
            { color: getRarityColor(item.rarity) },
          ]}
        >
          {item.label}
        </Text>
      </View>
      {/* Render item content based on type */}
      {item.type === "text" && (
        <Text style={styles.canvasItemContentText}>{item.value}</Text>
      )}
      {item.type === "achievement" && (
        <FontAwesome5
          name="medal"
          size={30}
          color="#EA580C"
          style={styles.canvasItemIcon}
        />
      )}
      {item.type === "connect" && (
        <MaterialCommunityIcons
          name="link-plus"
          size={30}
          color="#EA580C"
          style={styles.canvasItemIcon}
        />
      )}
      {/* ... more item type renderings */}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header component */}
      <Header />

      <View style={styles.contentArea}>
        {/* Side Menu */}
        <View style={styles.sideMenu}>
          {/* User Avatar & Username */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.addAvatarButton}>
              <FontAwesome5 name="plus" size={24} color="#EA580C" />
            </TouchableOpacity>
            <Text style={styles.addAvatarText}>ADD AVATAR</Text>
            <Text style={styles.usernameText}>
              USERNAME: {username.toUpperCase()}
            </Text>
          </View>

          {/* Search Inventory */}
          <View style={styles.searchContainer}>
            <FontAwesome5
              name="search"
              size={16}
              color="rgba(255,255,255,0.5)"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="SEARCH INVENTORY"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          {/* Inventory Items */}
          <ScrollView
            style={styles.inventoryScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.inventoryGrid}>
              {filteredInventory.map((item) => (
                <InventoryDraggableItem key={item.id} item={item} />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Main Canvas Area */}
        <View style={styles.canvasArea}>
          <View style={styles.canvasHeaderContainer}>
            <Text style={styles.canvasHeaderText}>BUILD YOUR REALITY</Text>
            <Text style={styles.canvasSubHeaderText}>
              DRAG & DROP ITEMS TO CUSTOMIZE
            </Text>
          </View>

          {/* This is the main canvas where items are dropped */}
          <TouchableOpacity
            style={styles.profileCanvas}
            activeOpacity={1}
            onPress={(event) => {
              // Simulate a drop at the touch location
              // In a real app, this would be part of a drop zone
              const { locationX, locationY } = event.nativeEvent;
              // For demonstration, let's assume dropping a generic item
              // You'd pass the actual dragged item here
              const genericItem: InventoryItem = {
                id: `generic-${Date.now()}`,
                type: "text",
                label: "LOREM IPSUM",
                value: "LOREM IPSUM",
              };
              handleDrop(locationX - 50, locationY - 20, genericItem); // Adjust for item size
            }}
          >
            {placedItems.map((item) => (
              <CanvasPlacedItem key={item.id} item={item} />
            ))}

            {/* Placeholder for "MY AWESOME PROFILE" */}
            <View style={styles.profileNamePlaceholder}>
              <Text style={styles.profileNameText}>MY AWESOME PROFILE</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleSaveProfile}
        >
          <Text style={styles.actionButtonText}>SAVE PROFILE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShareDraft}
        >
          <Text style={styles.actionButtonText}>SHARE DRAFT</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleResetProfile}
        >
          <Text style={styles.actionButtonText}>RESET</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  contentArea: {
    flex: 1,
    flexDirection: "row",
  },
  sideMenu: {
    width: width * 0.35, // Approximately 35% of screen width
    backgroundColor: "#1a1a1a", // Darker background for side menu
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 15,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  addAvatarButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(234, 88, 12, 0.2)", // Orange-600 with transparency
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#EA580C",
  },
  addAvatarText: {
    color: "#EA580C",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 5,
  },
  usernameText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "white",
    fontSize: 13,
    paddingVertical: 10,
    fontFamily: "System", // Or your custom font if available
  },
  inventoryScroll: {
    flex: 1,
  },
  inventoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  inventoryItemContainer: {
    width: "48%", // Two items per row with some spacing
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  inventoryItemIconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  inventoryItemIconText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  inventoryItemLabel: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  canvasArea: {
    flex: 1,
    backgroundColor: "black",
    padding: 15,
  },
  canvasHeaderContainer: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 15,
  },
  canvasHeaderText: {
    color: "#EA580C",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 3,
  },
  canvasSubHeaderText: {
    color: "white",
    fontSize: 24,
    fontWeight: "900", // Extra bold
  },
  profileCanvas: {
    flex: 1,
    backgroundColor: "black", // The "black canvas"
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "rgba(234, 88, 12, 0.5)", // Orange border
    overflow: "hidden", // Ensures items don't go outside
    position: "relative", // For absolutely positioned placed items
  },
  profileNamePlaceholder: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#EA580C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  profileNameText: {
    color: "black",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
  },
  canvasItemContainer: {
    position: "absolute", // Allows dragging anywhere on the canvas
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    borderWidth: 1,
    paddingBottom: 5,
    minWidth: 100,
    minHeight: 80,
    overflow: "hidden",
  },
  canvasItemHeader: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  canvasItemLabel: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  canvasItemContentText: {
    color: "white",
    fontSize: 12,
    padding: 10,
  },
  canvasItemIcon: {
    alignSelf: "center",
    paddingVertical: 10,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    backgroundColor: "#1a1a1a", // Darker background for button bar
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  actionButton: {
    backgroundColor: "#EA580C",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  actionButtonText: {
    color: "black",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
