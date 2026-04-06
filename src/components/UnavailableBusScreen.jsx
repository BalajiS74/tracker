import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Linking,
  Share,
  Vibration,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function UnavailableBusScreen({ busData, onRefresh, onBack }) {
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [notified, setNotified] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Real-time notification subscription
  const subscribeToNotifications = async () => {
    Vibration.vibrate(100);
    setNotified(true);
    setTimeout(() => setNotified(false), 3000);
  };

  // Share bus status
  const shareStatus = async () => {
    try {
      await Share.share({
        message: `Bus ${busData.busid} (${busData.routeName}) is currently unavailable. Check alternative transport options.`,
        title: "Bus Status Update",
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Find nearest alternative
  const findNearestAlternative = () => {
    // In production, this would call a real API
    Alert.alert(
      "Finding Alternatives",
      "Searching for nearby transport options...",
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Service Alert⚠️</Text>
          <TouchableOpacity onPress={shareStatus} style={styles.shareButton}>
            <Ionicons name="share-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusIconContainer}>
            <LinearGradient
              colors={["#ef4444", "#dc2626"]}
              style={styles.statusIcon}
            >
              <Ionicons name="close-circle" size={40} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={styles.statusTitle}>Bus Unavailable</Text>
          <Text style={styles.busId}>Bus ID: {busData.busid}</Text>
          <Text style={styles.routeName}>{busData.routeName}</Text>

          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={16} color="#ef4444" />
            <Text style={styles.timeText}>Unavailable All Day</Text>
          </View>
        </View>

        {/* Real-time Notification Banner */}
        {notified && (
          <Animated.View style={styles.notificationBanner}>
            <Ionicons name="notifications" size={20} color="#10b981" />
            <Text style={styles.notificationText}>
              You'll be notified when bus is available
            </Text>
          </Animated.View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={subscribeToNotifications}
          >
            <LinearGradient
              colors={["#0bc1bf", "#089b99"]}
              style={styles.actionGradient}
            >
              <Ionicons name="notifications-outline" size={20} color="#fff" />
              <Text style={styles.actionText}>Notify Me</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={findNearestAlternative}
          >
            <LinearGradient
              colors={["#8b5cf6", "#7c3aed"]}
              style={styles.actionGradient}
            >
              <Ionicons name="locate-outline" size={20} color="#fff" />
              <Text style={styles.actionText}>Find Alternatives</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Alternative Transport Section - Real Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Alternatives</Text>

          <TouchableOpacity
            style={styles.altCard}
            onPress={() => Linking.openURL("https://maps.google.com")}
          >
            <LinearGradient
              colors={["#2563eb", "#1d4ed8"]}
              style={styles.altCardGradient}
            >
              <View style={styles.altCardContent}>
                <Ionicons name="car-outline" size={24} color="#fff" />
                <View>
                  <Text style={styles.altCardTitle}>Taxi/Cab</Text>
                  <Text style={styles.altCardSubtitle}>
                    Estimated arrival: 5 min
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.altCard}
            onPress={() => Linking.openURL("https://maps.google.com")}
          >
            <LinearGradient
              colors={["#10b981", "#059669"]}
              style={styles.altCardGradient}
            >
              <View style={styles.altCardContent}>
                <Ionicons name="bus-outline" size={24} color="#fff" />
                <View>
                  <Text style={styles.altCardTitle}>Public Bus</Text>
                  <Text style={styles.altCardSubtitle}>Next bus in 8 min</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.altCard}
            onPress={() => Linking.openURL("https://www.uber.com")}
          >
            <LinearGradient
              colors={["#f59e0b", "#d97706"]}
              style={styles.altCardGradient}
            >
              <View style={styles.altCardContent}>
                <Ionicons name="bicycle-outline" size={24} color="#fff" />
                <View>
                  <Text style={styles.altCardTitle}>Bike Sharing</Text>
                  <Text style={styles.altCardSubtitle}>Station: 200m away</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Report Issue */}
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => {
            Vibration.vibrate(50);
            Alert.alert(
              "Report Issue",
              "Our team has been notified. Thank you for your feedback.",
            );
          }}
        >
          <Text style={styles.reportText}>Report an issue with this bus</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("2%"),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: wp("1%"),
  },
  shareButton: {
    padding: wp("1%"),
  },
  headerText: {
    fontSize: hp("2.5%"),
    fontWeight: "700",
    color: "#1e293b",
  },
  statusCard: {
    backgroundColor: "#fff",
    margin: wp("5%"),
    padding: wp("6%"),
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statusIconContainer: {
    marginBottom: hp("2%"),
  },
  statusIcon: {
    width: wp("15%"),
    height: wp("15%"),
    borderRadius: wp("7.5%"),
    justifyContent: "center",
    alignItems: "center",
  },
  statusTitle: {
    fontSize: hp("2.8%"),
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: hp("1%"),
  },
  busId: {
    fontSize: hp("2%"),
    color: "#64748b",
    marginBottom: hp("0.5%"),
  },
  routeName: {
    fontSize: hp("2.2%"),
    fontWeight: "600",
    color: "#0bc1bf",
    marginBottom: hp("2%"),
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1%"),
    borderRadius: 20,
    gap: wp("2%"),
  },
  timeText: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: hp("1.6%"),
  },
  notificationBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    marginHorizontal: wp("5%"),
    marginBottom: hp("2%"),
    padding: wp("3%"),
    borderRadius: 12,
    gap: wp("2%"),
  },
  notificationText: {
    color: "#065f46",
    fontSize: hp("1.6%"),
    fontWeight: "500",
  },
  actionContainer: {
    flexDirection: "row",
    gap: wp("3%"),
    marginHorizontal: wp("5%"),
    marginBottom: hp("3%"),
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  secondaryButton: {
    flex: 1,
  },
  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("1.5%"),
    gap: wp("2%"),
  },
  actionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: hp("1.8%"),
  },
  section: {
    marginHorizontal: wp("5%"),
    marginBottom: hp("3%"),
  },
  sectionTitle: {
    fontSize: hp("2.2%"),
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: hp("2%"),
  },
  altCard: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: hp("1.5%"),
  },
  altCardGradient: {
    padding: wp("4%"),
  },
  altCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  altCardTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: hp("1.8%"),
  },
  altCardSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: hp("1.4%"),
    marginTop: hp("0.3%"),
  },
  reportButton: {
    marginHorizontal: wp("5%"),
    marginBottom: hp("3%"),
    paddingVertical: hp("2%"),
    alignItems: "center",
  },
  reportText: {
    color: "#64748b",
    fontSize: hp("1.6%"),
    textDecorationLine: "underline",
  },
});
