// components/MandatoryUpdateModal.tsx
import React from 'react';
import { Modal, View, Text, Button, StyleSheet, Platform, Alert, Linking } from 'react-native';
import { useApp } from '@/providers/AppProvider'; // Adjust path as needed
import * as Application from 'expo-application';

const MandatoryUpdateModal = () => {
  const { showMandatoryUpdateModal, updateMessage } = useApp();

  const handleUpdatePress = () => {
    let url = "";
    if (Platform.OS === "android") {
      const packageName = Application.applicationId;
      if (packageName) {
        url = `market://details?id=${packageName}`;
      } else {
        // Fallback if Application.applicationId somehow fails.
        // You MUST replace 'YOUR_ANDROID_PACKAGE_NAME' with your actual package name (e.g., com.yourcompany.yourapp)
        url = `https://play.google.com/store/apps/details?id=YOUR_ANDROID_PACKAGE_NAME`;
        console.warn("Could not get Android package name via Application.applicationId, using fallback Play Store URL. Please set EXPO_PUBLIC_ANDROID_PACKAGE_NAME env variable or replace 'YOUR_ANDROID_PACKAGE_NAME' manually.");
      }
    } else if (Platform.OS === "ios") {
      // For iOS, you typically link to the App Store using your app's Apple ID (a numeric ID).
      // You MUST replace 'YOUR_APPLE_APP_ID' with your actual Apple App ID from App Store Connect.
      url = `itms-apps://itunes.apple.com/app/idYOUR_APPLE_APP_ID`;
      console.warn("Please replace 'YOUR_APPLE_APP_ID' with your actual Apple App Store ID for iOS updates.");
    }

    if (url) {
      Linking.openURL(url).catch(err => {
        console.error("Failed to open app store link:", err);
        Alert.alert("Error", "Could not open the app store. Please try updating manually.");
      });
    } else {
      Alert.alert("Error", "Could not determine the app store URL for your platform. Please update manually.");
    }
  };

  if (!showMandatoryUpdateModal) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showMandatoryUpdateModal}
      // onRequestClose is for Android back button. If update is mandatory, prevent closing.
      onRequestClose={() => {
        Alert.alert("Update Required", "You must update the app to continue.");
        // Optionally, you might want to `BackHandler.exitApp()` here for a truly forced exit,
        // but generally, forcing a modal to stay is better for user experience.
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Update Required!</Text>
          <Text style={styles.modalText}>{updateMessage}</Text>
          <Button title="Update Now" onPress={handleUpdatePress} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.7)', // Dark semi-transparent overlay
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%', // Make modal a bit narrower
    maxWidth: 400, // Max width for larger screens
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
    color: '#555',
  }
});

export default MandatoryUpdateModal;