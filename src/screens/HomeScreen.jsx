// HomeScreen.js
import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  memo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  RefreshControl,
  FlatList,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AuthContext } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as Location from "expo-location";
import * as SMS from "expo-sms";
import DefaultProfileImage from "../images/default-profile-image.png";
const BusCard = memo(({ route, nextStop, time, onPress }) => (
  <TouchableOpacity style={styles.busCard} onPress={onPress}>
    <View style={styles.busCardIconContainer}>
      <Ionicons name="bus" size={wp("6%")} color="#4b0082" />
    </View>
    <View style={styles.busCardDetails}>
      <Text style={styles.busCardRoute}>{route}</Text>
      <Text style={styles.busCardStop}>Next: {nextStop}</Text>
    </View>
    <View style={styles.busCardTimeContainer}>
      <Text style={styles.busCardTime}>{time}</Text>
      <Ionicons name="chevron-forward" size={wp("4%")} color="#999" />
    </View>
  </TouchableOpacity>
));

const EmergencyButton = ({ onPress }) => (
  <TouchableOpacity style={styles.emergencyButton} onPress={onPress}>
    <Ionicons name="alert-circle" size={wp("7%")} color="#fff" />
    <Text style={styles.emergencyButtonText}>Emergency</Text>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [busList, setBusList] = useState([]);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const fetchBusData = useCallback(async () => {
    try {
      const response = await fetch(
        "https://bus-tracking-school-92dd9-default-rtdb.asia-southeast1.firebasedatabase.app/gps.json"
      );
      const data = await response.json();
      if (data && typeof data === "object") {
        const list = Object.entries(data).map(([busID, busData]) => ({
          id: busID,
          route: busData.route || `Bus ${busID}`,
          nextStop: busData.nextStop || "Unknown Stop",
          time: busData.updatedTime || "N/A",
          isWomenOnly: busData.isWomenOnly || false,
        }));
        setBusList(list.slice(0, 3));
      } else {
        setBusList([]);
      }
    } catch (error) {
      console.error("Failed to fetch bus data:", error);
    }
  }, []);

  useEffect(() => {
    const loadAvatar = async () => {
      const stored = await AsyncStorage.getItem("profilePhoto");
      if (stored) {
        setProfilePhoto(stored);
      } else if (user?.avatar) {
        setProfilePhoto(user.avatar);
      } else {
        setProfilePhoto("https://randomuser.me/api/portraits/men/1.jpg");
      }
    };

    loadAvatar();
  }, [user]); // rerun when user updates

  useEffect(() => {
    fetchBusData();
    const interval = setInterval(fetchBusData, 30000);
    return () => clearInterval(interval);
  }, [fetchBusData]);

  const handleEmergency = () => {
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

  const handleShareLiveLocation = async () => {
    try {
      // Step 1: Check existing permission
      let { status } = await Location.getForegroundPermissionsAsync();

      if (status !== "granted") {
        // Request again
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

      // Step 2: Get parent number
      const parentNumber = await AsyncStorage.getItem("parentPhone");
      const staffNumber = ["9342721886", "9597483659"];
      if (!parentNumber && !staffNumber) {
        Alert.alert(
          "Missing Number",
          "No parent number found. Please complete profile setup."
        );
        return;
      }

      // Step 3: Confirm user wants to share
      Alert.alert(
        "Share Live Location",
        "Your live location will be shared with your emergency contact.",
        [
          {
            text: "Share Now",
            onPress: async () => {
              try {
                const location = await Location.getCurrentPositionAsync({
                  accuracy: Location.Accuracy.High,
                });
                const { latitude, longitude } = location.coords;
                const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
                const message = `🚨 Emergency! My current location is: ${mapsLink}`;

                const isAvailable = await SMS.isAvailableAsync();
                if (!isAvailable) {
                  Alert.alert("Error", "SMS is not available on this device");
                  return;
                }

                const { result } = await SMS.sendSMSAsync(
                  [parentNumber || staffNumber],
                  message
                );

                if (result === "sent") {
                  Alert.alert("Success", "Location shared successfully!");
                } else {
                  Alert.alert("Notice", "SMS was not sent");
                }
              } catch (error) {
                console.error("Error sending SMS:", error);
                Alert.alert(
                  "Error",
                  "Could not share location. Please try again."
                );
              }
            },
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } catch (err) {
      console.error("Permission error:", err);
      Alert.alert(
        "Error",
        "An unexpected error occurred while requesting permissions."
      );
    }
  };

  const handleBusPress = useCallback(
    (busID) => navigation.navigate("BusDetails", { busID }),
    [navigation]
  );

  // Combine all header content into a header component
  const renderHeader = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Campus Transit</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Image
            source={profilePhoto ? { uri: profilePhoto } : DefaultProfileImage}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>
      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || "Guest"}</Text>
        </View>
        <View style={styles.notificationBadge}>
          <Ionicons name="notifications" size={wp("5%")} color="#fff" />
        </View>
      </View>
      {/* Safety Buttons */}
      <View style={styles.safetySection}>
        <Text style={styles.sectionTitle}>Safety Features</Text>
        <View style={styles.safetyButtons}>
          <TouchableOpacity
            style={styles.safetyButton}
            onPress={handleEmergency}
          >
            <Ionicons name="alert-circle" size={wp("6%")} color="#ff4444" />
            <Text style={styles.safetyButtonText}>Emergency</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.safetyButton}
            onPress={handleShareLiveLocation}
          >
            <Ionicons name="location" size={wp("6%")} color="#4b0082" />
            <Text style={styles.safetyButtonText}>Share Location</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.safetyButton}
            onPress={() => navigation.navigate("SafetyTips")}
          >
            <Ionicons name="shield-checkmark" size={wp("6%")} color="#4b0082" />
            <Text style={styles.safetyButtonText}>Safety Tips</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Promo */}
      <TouchableOpacity style={styles.promoBanner}>
        <Image
          source={require("../images/scadpoly.jpg")}
          style={styles.promoImage}
          resizeMode="cover"
        />

        <View style={styles.promoOverlay}>
          <Text style={styles.promoTitle}>Never Miss Your Bus!</Text>
          <Text style={styles.promoSubtitle}>
            Real-time tracking for all routes
          </Text>
        </View>
      </TouchableOpacity>
      {/* Recent Search Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.searchTitle}>Recent Search</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Track")}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.container,
        emergencyMode && styles.emergencyMode,
        { backgroundColor: "transparent" },
      ]}
    >
      <StatusBar
        barStyle={emergencyMode ? "light-content" : "dark-content"}
        backgroundColor={emergencyMode ? "#ff4444" : "transparent"}
        translucent
      />

      <FlatList
        data={busList}
        keyExtractor={(bus) => bus.id}
        renderItem={({ item }) => (
          <BusCard
            route={`${item.route} ${item.isWomenOnly ? "👩‍🎓" : ""}`}
            nextStop={item.nextStop}
            time={item.time}
            onPress={() => handleBusPress(item.id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={
          <View
            style={[
              styles.alertBox,
              {
                backgroundColor: "#fff3cd",
                borderLeftColor: "#ffa500",
                borderLeftWidth: 5,
              },
            ]}
          >
            <Text style={styles.alertText}>
              ⚠️ <Text style={{ fontWeight: "bold" }}>Alert:</Text> Tapping the{" "}
              <Text style={{ fontWeight: "bold" }}>Emergency</Text> button will
              instantly notify your{" "}
              <Text style={{ fontWeight: "bold" }}>parents</Text>,{" "}
              <Text style={{ fontWeight: "bold" }}>AO</Text>, and{" "}
              <Text style={{ fontWeight: "bold" }}>staffs</Text> with your live
              location.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.noBusText}>No bus data available.</Text>
        }
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchBusData} />
        }
      />

      {!emergencyMode && <EmergencyButton onPress={handleEmergency} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emergencyMode: {},
  scrollContent: {
    paddingBottom: hp("1%"),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp("6%"),
    paddingTop: hp("2%"),
    paddingBottom: hp("1%"),
  },
  title: {
    fontSize: wp("7%"),
    fontWeight: "800",
    color: "#4b0082",
  },
  profileImage: {
    width: wp("15%"),
    height: wp("15%"),
    borderRadius: wp("10%"),
    borderWidth: 2,
    borderColor: "#4b0082",
  },
  welcomeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: wp("4%"),
    marginHorizontal: wp("6%"),
    marginVertical: hp("2%"),
    padding: wp("6%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeText: {
    fontSize: wp("4%"),
    color: "#666",
  },
  userName: {
    fontSize: wp("6%"),
    fontWeight: "700",
    color: "#333",
    marginTop: hp("0.5%"),
  },
  notificationBadge: {
    backgroundColor: "#4b0082",
    width: wp("10%"),
    height: wp("10%"),
    borderRadius: wp("5%"),
    justifyContent: "center",
    alignItems: "center",
  },
  safetySection: {
    paddingHorizontal: wp("6%"),
    marginBottom: hp("2%"),
  },
  safetyButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp("1%"),
  },
  safetyButton: {
    backgroundColor: "#fff",
    borderRadius: wp("3%"),
    padding: wp("3%"),
    alignItems: "center",
    width: wp("28%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  safetyButtonText: {
    fontSize: wp("3.5%"),
    color: "#333",
    marginTop: hp("0.5%"),
    fontWeight: "500",
  },
  promoBanner: {
    height: hp("25%"),
    borderRadius: wp("4%"),
    marginHorizontal: wp("6%"),
    marginBottom: hp("2%"),
    overflow: "hidden",
  },
  promoImage: {
    width: "100%",
    height: "100%",
  },
  promoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: wp("5%"),
    backgroundColor: "rgba(75, 0, 130, 0.8)",
  },
  promoTitle: {
    fontSize: wp("5%"),
    fontWeight: "700",
    color: "#fff",
    marginBottom: hp("0.5%"),
  },
  promoSubtitle: {
    fontSize: wp("3.5%"),
    color: "rgba(255,255,255,0.8)",
  },
  section: {
    paddingHorizontal: wp("6%"),
    marginBottom: hp("2%"),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("2%"),
    marginHorizontal: wp("6%"),
    paddingHorizontal: wp("4%"),
  },
  sectionTitle: {
    fontSize: wp("5%"),
    fontWeight: "700",
    color: "#333",
    padding: 5,
  },
  searchTitle: {
    fontSize: wp("5%"),
    fontWeight: "700",
    color: "#333",
    width: wp("40%"),
    padding: 5,
  },
  seeAllText: {
    fontSize: wp("4%"),
    color: "#4b0082",
    fontWeight: "500",
  },
  busCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: wp("3%"),
    padding: wp("4%"),
    marginBottom: hp("1.5%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: wp("6%"),
    borderLeftWidth: 5,
    borderLeftColor: "#4b0082",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  busCardIconContainer: {
    width: wp("12%"),
    height: wp("12%"),
    borderRadius: wp("6%"),
    backgroundColor: "rgba(75, 0, 130, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("4%"),
  },
  busCardDetails: {
    flex: 1,
  },
  busCardRoute: {
    fontSize: wp("4.2%"),
    fontWeight: "600",
    color: "#333",
    marginBottom: hp("0.3%"),
  },
  busCardStop: {
    fontSize: wp("3.5%"),
    color: "#666",
  },
  busCardTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  busCardTime: {
    fontSize: wp("3.5%"),
    color: "#4b0082",
    fontWeight: "600",
    marginRight: wp("2%"),
  },
  emergencyButton: {
    position: "absolute",
    bottom: hp("2%"),
    right: wp("6%"),
    backgroundColor: "#ff4444",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("4%"),
    borderRadius: wp("10%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  emergencyButtonText: {
    color: "#fff",
    fontSize: wp("4%"),
    fontWeight: "600",
    marginLeft: wp("2%"),
  },
  noBusText: {
    color: "#888",
    fontStyle: "italic",
    padding: 10,
    textAlign: "center",
  },
  alertBox: {
    paddingHorizontal: wp("6%"),
    marginBottom: hp("10%"),
    borderRadius: wp("3%"),
    marginHorizontal: wp("6%"),
    paddingVertical: hp("2%"),
  },
});
