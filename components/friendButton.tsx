import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text } from "react-native";

interface FriendButtonProps {
  initialIsFriend: boolean;
  onToggle: (newState: boolean) => Promise<void>;
  disabled?: boolean;
}

export const FriendButton: React.FC<FriendButtonProps> = ({
  initialIsFriend,
  onToggle,
  disabled = false,
}) => {
  const [isFriend, setIsFriend] = useState(initialIsFriend);

  // Sync with external changes
  useEffect(() => {
    setIsFriend(initialIsFriend);
  }, [initialIsFriend]);

  const handlePress = async () => {
    if (disabled) return;

    // Optimistic update - instant UI change
    const newState = !isFriend;
    setIsFriend(newState);

    try {
      await onToggle(newState);
    } catch (error) {
      // Revert on error
      setIsFriend(!newState);
      console.error("Failed to update friend status:", error);
    }
  };

  return (
    <TouchableOpacity
      className={`px-8 py-3 rounded-xl ${
        isFriend
          ? "bg-white/[0.03] border border-white/[0.08]"
          : "bg-orange-600"
      }`}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text
        className={`font-black uppercase tracking-widest text-sm ${
          isFriend ? "text-white" : "text-black"
        }`}
      >
        {isFriend ? "Remove Friend" : "Add Friend"}
      </Text>
    </TouchableOpacity>
  );
};