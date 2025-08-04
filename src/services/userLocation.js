import * as Location from "expo-location";
import * as SMS from "expo-sms";
import { Alert, Linking, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const handleShareLiveLocation = async () => {
  const {user} = useContext(AuthContext)
  try {
    // Step 1: Request location permissions
    let { status } = await Location.getForegroundPermissionsAsync();

    if (status !== "granted") {
      const { status: newStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (newStatus !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please enable location access in app settings to use this feature.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                if (Platform.OS === "ios") {
                  Linking.openURL("app-settings:");
                } else {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
        return;
      }
    }

    // Step 2: Get contact numbers
    const parentPhone = await AsyncStorage.getItem("parentPhone");
    const emergencyPhone = await AsyncStorage.getItem("emergencyPhone");
    const role = await AsyncStorage.getItem("role");

    const fallbackNumbers = [
      "9342721886", // AO
      "9597483659", // Principal
      "9442077569", // Class Staff 1
      "9342496269", // Class Staff 2
    ];

    const emergencyNumbers = [];

    if (role === "student") {
      if (parentPhone) emergencyNumbers.push(parentPhone);
      emergencyNumbers.push(...fallbackNumbers);
    } else if (role === "staff") {
      if (emergencyPhone) {
        emergencyNumbers.push(emergencyPhone);
      } else {
        emergencyNumbers.push(...fallbackNumbers);
      }
    } else {
      emergencyNumbers.push(...fallbackNumbers);
    }

    // Step 3: Confirm sharing
    Alert.alert(
      "Share Live Location",
      "Your live location will be shared with your emergency contacts.",
      [
        {
          text: "Share Now",
          onPress: async () => {
            try {
              const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
              });
              const { latitude: lat, longitude: lng } = location.coords;
              const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
              const message = `i"m ${user.name} I’m in danger but can’t call or text.🚨 Emergency! My current location is: ${mapsLink}`;

              const isAvailable = await SMS.isAvailableAsync();
              if (!isAvailable) {
                Alert.alert("Error", "SMS is not available on this device");
                return;
              }

              const { result } = await SMS.sendSMSAsync(emergencyNumbers, message);

              if (result === "sent") {
                Alert.alert("Success", "Location shared successfully!");
              } else {
                Alert.alert("Notice", "SMS was not sent");
              }
            } catch (error) {
              console.error("SMS error:", error);
              Alert.alert("Error", "Could not share location.");
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  } catch (err) {
    console.error("Permission error:", err);
    Alert.alert("Error", "An unexpected error occurred.");
  }
};

export const handleEmergency = (setEmergencyMode) => {
  setEmergencyMode(true);
  Alert.alert(
    "Emergency Alert",
    "Help is on the way! Your location is being shared with campus security and trusted contacts.",
    [
      { text: "Call Security", onPress: () => Linking.openURL(`tel:${112}`) },
      {
        text: "Cancel Alert",
        onPress: () => setEmergencyMode(false),
        style: "cancel",
      },
    ],
    { cancelable: false }
  );
};
