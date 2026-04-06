import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuthStore from "../store/useAuthStore";

const AboutAppScreen = ({ navigation }) => {
  const { user, logout, accessToken, role } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const features = [
    "Real-time bus tracking",
    "Next stop detection",
    "Estimated Time of Arrival (ETA)",
    "Emergency alerts with biometric confirmation",
    "Full route view",
    "Smart AM/PM route direction handling",
    "Voice alerts for upcoming stops (Text-to-Speech)",
  ];

  // Optimized logout function

  const handleLogout = useCallback(() => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  }, [logout, navigation]);

  // Get user role display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case "student":
        return "Student";
      case "parent":
        return "Parent/Guardian";
      case "driver":
        return "Bus Driver";
      case "admin":
        return "Administrator";
      default:
        return "User";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="#0bc1bf"
      />

      {/* Gradient Header */}
      <LinearGradient colors={["#0bc1bf", "#089b99"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={wp("7%")} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>About App</Text>
          <Text style={styles.headerSubtitle}>Learn more about SCAD Bus</Text>
        </View>
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient
            colors={["#ef4444", "#dc2626"]}
            style={styles.logoutGradient}
          >
            <Ionicons name="log-out-outline" size={wp("5%")} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* User Info Section */}
        {user && (
          <View style={styles.userCard}>
            <LinearGradient
              colors={["#f0fdf4", "#dcfce7"]}
              style={styles.userCardGradient}
            >
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={["#0bc1bf", "#089b99"]}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {user.name?.charAt(0)?.toUpperCase() ||
                      user.fullName?.charAt(0)?.toUpperCase() ||
                      user.email?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </Text>
                </LinearGradient>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {user.name || user.fullName || "User"}
                </Text>
                <Text style={styles.userEmail}>{user.email || "No email"}</Text>
                <View style={styles.userBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                  <Text style={styles.userBadgeText}>
                    {getRoleDisplayName(role)} • Logged In
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* App Overview Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="information-circle"
              size={wp("6%")}
              color="#0bc1bf"
            />
          </View>
          <Text style={styles.sectionTitle}>App Overview</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.paragraph}>
            SCAD Bus is designed to provide real-time bus tracking and important
            features for students, parents, and guardians. Track live bus
            locations, get accurate ETAs, and stay updated with smart alerts.
            Your daily commute, made safer and more convenient.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.headerIcon}>
            <Ionicons name="star" size={wp("6%")} color="#0bc1bf" />
          </View>
          <Text style={styles.sectionTitle}>Key Features</Text>
        </View>

        <View style={styles.card}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={wp("4%")} color="#fff" />
              </View>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Credits Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.headerIcon}>
            <Ionicons name="heart" size={wp("6%")} color="#dc2626" />
          </View>
          <Text style={styles.sectionTitle}>Credits</Text>
        </View>

        <View style={styles.creditCard}>
          <Text style={styles.creditText}>Made with ❤️ by</Text>
          <Text style={styles.creatorName}>Ziotix</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("2%"),
    paddingTop: hp("5%"),
  },
  backButton: {
    width: wp("10%"),
    height: wp("10%"),
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: wp("6%"),
    fontWeight: "800",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: wp("3.5%"),
    color: "rgba(255,255,255,0.85)",
    marginTop: hp("0.5%"),
  },
  logoutButton: {
    borderRadius: wp("4%"),
    overflow: "hidden",
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("1%"),
    gap: wp("1.5%"),
  },
  logoutText: {
    color: "#fff",
    fontSize: wp("3.5%"),
    fontWeight: "700",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    paddingHorizontal: wp("5%"),
    paddingTop: hp("2.5%"),
    paddingBottom: hp("4%"),
  },
  userCard: {
    marginBottom: hp("2%"),
    borderRadius: 16,
    overflow: "hidden",
  },
  userCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp("4%"),
    gap: wp("4%"),
  },
  avatarContainer: {
    shadowColor: "#0bc1bf",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  avatar: {
    width: wp("15%"),
    height: wp("15%"),
    borderRadius: wp("7.5%"),
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: wp("7%"),
    fontWeight: "800",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: wp("4.5%"),
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: hp("0.3%"),
  },
  userEmail: {
    fontSize: wp("3.5%"),
    color: "#64748b",
    marginBottom: hp("0.5%"),
  },
  userBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("1%"),
  },
  userBadgeText: {
    fontSize: wp("3%"),
    color: "#10b981",
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp("2.5%"),
    marginBottom: hp("1.5%"),
  },
  headerIcon: {
    width: wp("10%"),
    height: wp("10%"),
    borderRadius: wp("5%"),
    backgroundColor: "#e0f2f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("3%"),
  },
  sectionTitle: {
    fontSize: wp("5%"),
    fontWeight: "700",
    color: "#1e293b",
  },
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: wp("4%"),
    marginBottom: hp("1.5%"),
    borderLeftWidth: 4,
    borderLeftColor: "#0bc1bf",
  },
  paragraph: {
    fontSize: wp("3.8%"),
    lineHeight: wp("5.5%"),
    color: "#475569",
    fontWeight: "500",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: hp("1.2%"),
  },
  checkmark: {
    width: wp("7%"),
    height: wp("7%"),
    borderRadius: wp("3.5%"),
    backgroundColor: "#0bc1bf",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("3%"),
    marginTop: hp("0.3%"),
  },
  featureText: {
    fontSize: wp("3.8%"),
    color: "#334155",
    flex: 1,
    fontWeight: "500",
    lineHeight: wp("5%"),
  },
  creditCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: wp("6%"),
    alignItems: "center",
    marginBottom: hp("3%"),
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  creditText: {
    fontSize: wp("3.8%"),
    color: "#64748b",
    marginBottom: hp("0.5%"),
  },
  creatorName: {
    fontSize: wp("5.5%"),
    fontWeight: "800",
    color: "#0bc1bf",
    marginBottom: hp("1%"),
  },
  versionText: {
    fontSize: wp("3.5%"),
    color: "#94a3b8",
    fontWeight: "600",
  },
});

export default AboutAppScreen;
