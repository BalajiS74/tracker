import React, { useEffect, useState, useCallback, useRef, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import useAuthStore from "../store/useAuthStore";
import { globalDataFetcher, getRouteData } from "../services/getdata";
import { calculateDistance } from "../helper/Calculations";
import { handleEmergency } from "../services/userLocation";

// Enhanced BusCard with more info
const BusCard = memo(({ route, nextStop, time, onPress, busNumber, eta }) => {
  return (
    <TouchableOpacity style={styles.busCard} onPress={onPress}>
      {/* Left: Bus Icon with Gradient Background */}
      <LinearGradient
        colors={["#0bc1bf", "#00a8a6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.busIconGradient}
      >
        <Ionicons name="bus" size={wp("7%")} color="#fff" />
      </LinearGradient>

      {/* Middle: Route Info */}
      <View style={styles.busCardContent}>
        <View style={styles.routeHeader}>
          <Text style={styles.routeText}>{route}</Text>
          <View style={styles.busNumberBadge}>
            <Text style={styles.busNumberText}>{busNumber}</Text>
          </View>
        </View>
        <View style={styles.nextStopBox}>
          <Ionicons name="location" size={wp("3.5%")} color="#0bc1bf" />
          <Text style={styles.stopText}>{nextStop}</Text>
        </View>
        {eta && (
          <View style={styles.etaBox}>
            <Ionicons name="time-outline" size={wp("3%")} color="#10b981" />
            <Text style={styles.etaText}>ETA: {eta}</Text>
          </View>
        )}
      </View>

      {/* Right: Time and Status */}
      <View style={styles.busCardMeta}>
        <View style={styles.timeContainer}>
          <Ionicons name="time" size={wp("4%")} color="#0bc1bf" />
          <Text style={styles.timeText}>{time}</Text>
        </View>
        <View style={styles.chevronBox}>
          <Ionicons name="chevron-forward" size={wp("5%")} color="#0bc1bf" />
        </View>
      </View>
    </TouchableOpacity>
  );
});

// Quick Stats Component
const QuickStats = ({ totalBuses, activeBuses, onTime }) => {
  return (
    <View style={styles.statsRow}>
      <View style={styles.statCard}>
        <LinearGradient
          colors={["#0bc1bf", "#089b99"]}
          style={styles.statIconCircle}
        >
          <Ionicons name="bus-outline" size={wp("5%")} color="#fff" />
        </LinearGradient>
        <Text style={styles.statNumber}>{totalBuses}</Text>
        <Text style={styles.statLabel}>Total Buses</Text>
      </View>
      <View style={styles.statCard}>
        <LinearGradient
          colors={["#10b981", "#059669"]}
          style={styles.statIconCircle}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={wp("5%")}
            color="#fff"
          />
        </LinearGradient>
        <Text style={styles.statNumber}>{activeBuses}</Text>
        <Text style={styles.statLabel}>Active</Text>
      </View>
      <View style={styles.statCard}>
        <LinearGradient
          colors={["#8b5cf6", "#7c3aed"]}
          style={styles.statIconCircle}
        >
          <Ionicons name="trending-up-outline" size={wp("5%")} color="#fff" />
        </LinearGradient>
        <Text style={styles.statNumber}>{onTime}%</Text>
        <Text style={styles.statLabel}>On Time</Text>
      </View>
    </View>
  );
};

// Live Alert Banner
const LiveAlertBanner = ({ message, type }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <View
      style={[styles.alertBanner, type === "warning" && styles.warningBanner]}
    >
      <Ionicons
        name={
          type === "warning" ? "warning-outline" : "information-circle-outline"
        }
        size={wp("5%")}
        color={type === "warning" ? "#f59e0b" : "#0bc1bf"}
      />
      <Text style={styles.alertText}>{message}</Text>
      <TouchableOpacity onPress={() => setVisible(false)}>
        <Ionicons name="close-outline" size={wp("5%")} color="#94a3b8" />
      </TouchableOpacity>
    </View>
  );
};

export default function HomeScreen({ navigation }) {
  const { user } = useAuthStore();
  const [busList, setBusList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [greeting, setGreeting] = useState("");
  const slideAnim = useRef(new Animated.Value(hp("100%"))).current;
  const iconRotate = useRef(new Animated.Value(0)).current;

  // Get greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const menuItems = [
    {
      icon: "help-circle-outline",
      text: "Help & Support",
      onPress: () => navigation.navigate("HelpSupport"),
    },
    {
      icon: "document-text-outline",
      text: "Terms & Privacy",
      onPress: () => navigation.navigate("TermsPrivacy"),
    },
    {
      icon: "alert-circle-outline",
      text: "Report a Problem",
      onPress: () => navigation.navigate("ReportScreen"),
    },
    {
      icon: "information-circle-outline",
      text: "About the app",
      onPress: () => navigation.navigate("AboutAppScreen"),
    },
    ...(user?.role === "admin"
      ? [
          {
            icon: "megaphone-outline",
            text: "Announcements",
            onPress: () => navigation.navigate("AnnouncementPage"),
          },
          {
            icon: "map-outline",
            text: "Route Management",
            onPress: () => navigation.navigate("RouteManagement"),
          },
        ]
      : []),
  ];

  const fetchBusData = useCallback(async () => {
    try {
      const URL =
        "https://bus-tracking-school-92dd9-default-rtdb.asia-southeast1.firebasedatabase.app/gps.json";

      const { data } = await globalDataFetcher(URL);

      if (!data) return setBusList([]);

      const stats = [];

      for (const [busID, busData] of Object.entries(data)) {
        const routeData = await getRouteData(busID);
        if (!routeData) continue;

        let minDist = Infinity;
        let nearestIdx = -1;

        routeData.stops.forEach((stop, idx) => {
          const d = calculateDistance(
            busData.latitude,
            busData.longitude,
            stop.lat,
            stop.lng,
          );
          if (d < minDist) {
            minDist = d;
            nearestIdx = idx;
          }
        });

        if (nearestIdx === -1) continue;

        // Calculate approximate ETA
        let eta = null;
        if (busData.speed > 0 && minDist < 5) {
          const etaMinutes = Math.round((minDist / busData.speed) * 60);
          if (etaMinutes <= 30) {
            eta = etaMinutes <= 1 ? "1 min" : `${etaMinutes} min`;
          }
        }

        stats.push({
          id: busID,
          route: routeData.routeName || `Bus ${busID}`,
          busNumber: busID,
          nextStop: routeData.stops[nearestIdx]?.nextStop || "End of Route",
          time: busData.updatedTime || "Just now",
          eta: eta,
        });
      }

      setBusList(stats);
    } catch (error) {
      console.log("Fetch Error:", error);
    }
  }, []);

  useEffect(() => {
    fetchBusData();
    const interval = setInterval(fetchBusData, 30000);
    return () => clearInterval(interval);
  }, [fetchBusData]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: menuOpen ? 0 : hp("100%"),
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(iconRotate, {
        toValue: menuOpen ? 1 : 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [menuOpen, slideAnim, iconRotate]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBusData();
    setRefreshing(false);
  };

  // Calculate statistics
  const totalBuses = busList.length;
  const activeBuses = busList.filter((bus) => bus.time !== "Offline").length;
  const onTimePercentage = 98; // You can calculate this based on actual data

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor={"#0bc1bf"}
      />

      <View style={{ flex: 1 }}>
        {/* 🔷 Gradient Header */}
        <LinearGradient colors={["#0bc1bf", "#089b99"]} style={styles.header}>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
              <Animated.View>
                <Ionicons
                  name={menuOpen ? "close-outline" : "settings"}
                  size={wp("7%")}
                  color="#fff"
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerTitle}>SCAD Bus</Text>
          <Text style={styles.headerSubtitle}>
            {greeting}, {user?.name?.split(" ")[0] || "Student"}
          </Text>
          <View style={styles.headerBadge}>
            <Ionicons name="radio" size={wp("3.5%")} color="#10b981" />
            <Text style={styles.headerBadgeText}>Live Tracking Active</Text>
          </View>
        </LinearGradient>

        {/* ⚪ Main White Section */}
        <View style={styles.mainContainer}>
          <View style={{ marginLeft: 10 }}>
            {/* Quick Stats Row */}
            <QuickStats
              totalBuses={totalBuses}
              activeBuses={activeBuses}
              onTime={onTimePercentage}
            />

            {/* Live Alert Banner */}
            <LiveAlertBanner
              message="All buses are running on schedule today"
              type="info"
            />

            {/* Section Title */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Buses</Text>
              <TouchableOpacity onPress={onRefresh}>
                <Ionicons
                  name="refresh-outline"
                  size={wp("5%")}
                  color="#0bc1bf"
                />
              </TouchableOpacity>
            </View>

            <Animated.FlatList
              data={busList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <BusCard
                  route={item.route}
                  busNumber={item.busNumber}
                  nextStop={item.nextStop}
                  time={item.time}
                  eta={item.eta}
                  onPress={() =>
                    navigation.navigate("BusDetails", {
                      busID: item.id,
                    })
                  }
                />
              )}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#0bc1bf"]}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons
                    name="bus-outline"
                    size={wp("18%")}
                    color="#CBD5E1"
                  />
                  <Text style={styles.emptyText}>No buses available</Text>
                  <Text style={styles.emptySubtext}>
                    Pull down to refresh or check back later
                  </Text>
                </View>
              }
              contentContainerStyle={{
                paddingBottom: hp("10%"),
              }}
            />
          </View>
        </View>
      </View>

      {/* emergency button */}
      <TouchableOpacity
        style={styles.emergencyButton}
        onPress={() => handleEmergency(setEmergencyMode)}
      >
        <LinearGradient
          colors={["#ef4444", "#dc2626"]}
          style={styles.emergencyGradient}
        >
          <Ionicons name="alert-circle" size={wp("6%")} color="#fff" />
          <Text style={styles.emergencyText}>Emergency</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* sliding menu overlay */}
      {menuOpen && (
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuOpen(false)}
        />
      )}

      {/* bottom sheet menu - recent apps style */}
      <Animated.View
        style={[
          styles.menuContainer,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.menuHandle} />
        <View style={styles.menuHeaderSection}>
          <LinearGradient
            colors={["#0bc1bf", "#089b99"]}
            style={styles.menuAvatar}
          >
            <Ionicons name="person" size={wp("8%")} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.menuHeader}>{user?.name || "User"}</Text>
            <Text style={styles.menuSubHeader}>
              {user?.email || "user@scad.edu"}
            </Text>
          </View>
        </View>

        <View style={styles.menuItemsContainer}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                item.onPress();
              }}
            >
              <View style={styles.menuIconBox}>
                <Ionicons name={item.icon} size={wp("5.5%")} color="#0bc1bf" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuText}>{item.text}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={wp("5%")}
                color="#cbd5e1"
              />
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    height: hp("30%"),
    justifyContent: "center",
    paddingHorizontal: wp("6%"),
  },
  headerIcons: {
    position: "absolute",
    top: hp("2%"),
    right: wp("5%"),
    flexDirection: "row",
    gap: wp("5%"),
  },
  headerTitle: {
    fontSize: wp("7%"),
    fontWeight: "800",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: wp("4.5%"),
    color: "rgba(255,255,255,0.9)",
    marginTop: hp("1%"),
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.5%"),
    borderRadius: wp("5%"),
    marginTop: hp("1.5%"),
    gap: wp("1.5%"),
  },
  headerBadgeText: {
    color: "#fff",
    fontSize: wp("3%"),
    fontWeight: "500",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: -hp("8%"),
    borderTopLeftRadius: 70,
    paddingHorizontal: wp("2%"),
    paddingTop: hp("3%"),
    paddingBottom: hp("10%"),
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp("2%"),
    marginBottom: hp("2%"),
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8fafc",
    marginHorizontal: wp("1%"),
    paddingVertical: hp("1.5%"),
    borderRadius: wp("4%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconCircle: {
    width: wp("10%"),
    height: wp("10%"),
    borderRadius: wp("5%"),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp("1%"),
  },
  statNumber: {
    fontSize: wp("5%"),
    fontWeight: "800",
    color: "#1e293b",
  },
  statLabel: {
    fontSize: wp("3%"),
    color: "#64748b",
    marginTop: hp("0.3%"),
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f2f1",
    marginHorizontal: wp("2%"),
    marginBottom: hp("2%"),
    padding: wp("3%"),
    borderRadius: wp("3%"),
    gap: wp("2%"),
  },
  warningBanner: {
    backgroundColor: "#fef3c7",
  },
  alertText: {
    flex: 1,
    fontSize: wp("3.2%"),
    color: "#334155",
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp("2%"),
    marginBottom: hp("1.5%"),
  },
  sectionTitle: {
    fontSize: wp("4.5%"),
    fontWeight: "700",
    color: "#1e293b",
  },
  busCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    width: wp("95%"),
    padding: wp("4%"),
    marginBottom: hp("2%"),
    shadowColor: "#0bc1bf",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  busIconGradient: {
    width: wp("14%"),
    height: wp("14%"),
    borderRadius: wp("7%"),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("3.5%"),
  },
  busCardContent: {
    flex: 1,
    justifyContent: "center",
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp("0.5%"),
  },
  routeText: {
    fontSize: wp("3.8%"),
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,
  },
  busNumberBadge: {
    backgroundColor: "#e0f2f1",
    paddingHorizontal: wp("2%"),
    paddingVertical: hp("0.3%"),
    borderRadius: wp("2%"),
    marginLeft: wp("2%"),
  },
  busNumberText: {
    fontSize: wp("2.8%"),
    color: "#0bc1bf",
    fontWeight: "600",
  },
  nextStopBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("1.5%"),
  },
  stopText: {
    fontSize: wp("3.5%"),
    color: "#64748B",
    fontWeight: "500",
  },
  etaBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("1%"),
    marginTop: hp("0.5%"),
  },
  etaText: {
    fontSize: wp("3%"),
    color: "#10b981",
    fontWeight: "500",
  },
  busCardMeta: {
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: wp("2%"),
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("1%"),
    backgroundColor: "#f0fffe",
    paddingHorizontal: wp("2.5%"),
    paddingVertical: hp("0.7%"),
    borderRadius: 8,
  },
  timeText: {
    fontSize: wp("3.5%"),
    color: "#0bc1bf",
    fontWeight: "600",
  },
  chevronBox: {
    marginTop: hp("0.5%"),
  },
  emergencyButton: {
    position: "absolute",
    bottom: hp("5%"),
    right: wp("5%"),
    borderRadius: 30,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emergencyGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("5%"),
    gap: wp("2%"),
  },
  emergencyText: {
    color: "#fff",
    fontSize: wp("4%"),
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    marginTop: hp("10%"),
  },
  emptyText: {
    marginTop: hp("2%"),
    fontSize: wp("4%"),
    color: "#94A3B8",
    fontWeight: "600",
  },
  emptySubtext: {
    marginTop: hp("1%"),
    fontSize: wp("3.2%"),
    color: "#cbd5e1",
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  menuContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: wp("6%"),
    paddingTop: hp("2%"),
    paddingBottom: hp("5%"),
    elevation: 10,
    zIndex: 100,
    maxHeight: hp("70%"),
  },
  menuHandle: {
    width: wp("10%"),
    height: 4,
    backgroundColor: "#cbd5e1",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: hp("2%"),
  },
  menuHeaderSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("4%"),
    marginBottom: hp("3%"),
    paddingBottom: hp("2%"),
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  menuAvatar: {
    width: wp("12%"),
    height: wp("12%"),
    borderRadius: wp("6%"),
    justifyContent: "center",
    alignItems: "center",
  },
  menuHeader: {
    fontSize: wp("5%"),
    fontWeight: "800",
    color: "#1e293b",
  },
  menuSubHeader: {
    fontSize: wp("3.2%"),
    color: "#64748b",
    marginTop: hp("0.3%"),
  },
  menuItemsContainer: {
    gap: hp("0.5%"),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("3%"),
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
  },
  menuIconBox: {
    width: wp("10%"),
    height: wp("10%"),
    borderRadius: wp("5%"),
    backgroundColor: "#e0f2f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("3%"),
  },
  menuText: {
    fontSize: wp("4%"),
    color: "#334155",
    fontWeight: "600",
  },
});
