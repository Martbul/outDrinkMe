import { Alert } from "react-native";

export const handleEarnGems = async (
  gemAmount: number,
  showRewardedAd: () => Promise<boolean>,
  currentGems: number,
  updateUserProfile: (data: any) => Promise<void>
) => {
  const rewardEarned = await showRewardedAd();

  if (rewardEarned) {
    try {
      const newGemCount = currentGems + gemAmount;
      await updateUserProfile({ gems: newGemCount });
    } catch (error) {
      console.error("Failed to update gems:", error);
      Alert.alert("Error", "Failed to award gems. Please try again.");
    }
  }
};
