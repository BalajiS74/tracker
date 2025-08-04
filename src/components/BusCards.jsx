import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect } from "react";
import { checkStatus } from "../services/checkBusStatus"; // Import the checkStatus function
export default function BusCard({ bus = {}, onPress }) {
  const [isOnline, setIsOnline] = useState(true);
  const checkBusStatus = async () => {
    const busID = bus.busID || bus.id; // Ensure busID is defined
    if (!busID) return;

    try {
      const status = await checkStatus(busID); // assumes checkStatus() returns true/false
      setIsOnline(status);
    } catch (error) {
      console.error("Error checking bus status:", error);
    }
  };
  // 🔁 Run every 10s
  useEffect(() => {
     checkBusStatus();

    const interval = setInterval(() => {
      checkBusStatus();
    }, 10000);

    return () => clearInterval(interval); // cleanup
  }, [bus.busID]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.15)"]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Bus Icon Bubble */}
        <View style={styles.iconBubble}>
          <Ionicons name="bus" size={24} color="#fff" />
        </View>

        {/* Bus Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.routeText} numberOfLines={1}>
            {bus.route || "Campus Express Route"}
          </Text>
          <Text style={styles.busNumberText}>#{bus.busNumber || "000"}</Text>
        </View>

        {/* Status Indicator */}
        <View style={styles.statusPill}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isOnline ? "green" : "red" },
            ]}
          />
          <Text style={styles.statusText}>
            {isOnline ? "Online" : "Offline"}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: 20,
    borderRadius: 24,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(120, 90, 230, 0.3)",
    overflow: "hidden",
    position: "relative",
  },
  iconBubble: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(90, 70, 200, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  routeText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  busNumberText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
});
