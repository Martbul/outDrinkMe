import { PRIMARY_ORANGE } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { Linking, Modal, Platform, Text, TouchableOpacity, View } from "react-native";

const ANDROID_PACKAGE_NAME = "com.martbul.outDrinkMe"; 
const APPLE_STORE_ID = "123456789"; 

interface RateModalProps {
  visible: boolean;
  onClose: () => void;
}

export const RateAppModal = ({ visible, onClose }: RateModalProps) => {
  const handleRatePress = async () => {
    let url = "";
    
    if (Platform.OS === "android") {
      url = `market://details?id=${ANDROID_PACKAGE_NAME}`;
    } else {
      url = `itms-apps://itunes.apple.com/app/id${APPLE_STORE_ID}?action=write-review`;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(
          `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`
        );
      }
    } catch (err) {
      console.error("An error occurred", err);
    } finally {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80 justify-center items-center px-6">
        <View className="w-full max-w-[340px] bg-[#121212] rounded-3xl border border-white/10 p-6 items-center shadow-2xl">
          
          <View className="w-20 h-20 bg-orange-600/10 rounded-full items-center justify-center mb-6 border border-orange-600/20">
            <Ionicons name="star" size={40} color={PRIMARY_ORANGE} />
          </View>

          <Text className="text-white text-2xl font-black text-center mb-2">
            Enjoying the App?
          </Text>
          <Text className="text-white/50 text-center text-sm mb-8 leading-5 font-medium">
            Your support means the world to us! Please take a moment to rate us on the Play Store.
          </Text>

          <TouchableOpacity
            onPress={handleRatePress}
            activeOpacity={0.8}
            className="w-full bg-orange-600 py-4 rounded-xl items-center shadow-lg shadow-orange-600/20 mb-3"
          >
            <Text className="text-black font-black text-base uppercase tracking-wider">
              Rate on Google Play
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            className="w-full py-3 items-center"
          >
            <Text className="text-white/40 font-bold text-sm">
              No, thanks
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};