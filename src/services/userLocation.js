import * as Location from "expo-location";
import * as SMS from "expo-sms";
import { Alert, Linking, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Share live location with emergency contacts
 * @param {Object} user - The logged-in user object (from AuthContext)
 */
export const handleShareLiveLocation = async (user) => {
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

    // Step 2: Get stored contacts and role
    const parentPhone = await AsyncStorage.getItem("parentPhone");
    const emergencyPhone = await AsyncStorage.getItem("emergencyPhone");
    const role = await AsyncStorage.getItem("role");

    const fallbackNumbers = [
      "9342721886", // Rasukutti sir
      "9597483659", // AO sir
      "9442077569", // Principal sir
      "9342496269", // Ponvishnu
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
              // Get current location
              const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
              });

              const { latitude: lat, longitude: lng } = location.coords;
              const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
              const message = `I'm ${
                user?.name || "Unknown"
              } — I’m in danger but can’t call or text. 🚨 Emergency! My current location is: ${mapsLink}`;

              // Check SMS availability
              const isAvailable = await SMS.isAvailableAsync();
              if (!isAvailable) {
                Alert.alert("Error", "SMS is not available on this device");
                return;
              }

              // Send SMS
              const { result } = await SMS.sendSMSAsync(
                emergencyNumbers,
                message
              );

              // Handle result for all cases
              if (result === "sent" || result === "unknown") {
                Alert.alert("Success", "Location shared with your parents");
              } else if (result === "cancelled") {
                Alert.alert("Notice", "You cancelled the SMS.");
              } else {
                Alert.alert("Notice", `SMS status: ${result}`);
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

/**
 * Trigger emergency mode
 * @param {Function} setEmergencyMode - State setter for emergency mode
 */
export const handleEmergency = (setEmergencyMode) => {
  setEmergencyMode(true);
  Alert.alert(
    "Emergency Alert",
    "Help is on the way! Your location is being shared with campus security and trusted contacts.",
    [
      {
        text: "Call Security",
        onPress: () => Linking.openURL(`tel:${9342721886}`),
      },
      {
        text: "Cancel Alert",
        onPress: () => setEmergencyMode(false),
        style: "cancel",
      },
    ],
    { cancelable: false }
  );
};
