import {
  useContext,
  useEffect,
  useState,
  useCallback,
  memo,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  AppState,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AuthContext } from "../context/AuthContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  handleShareLiveLocation,
  handleEmergency,
} from "../services/userLocation.js";

const { width } = Dimensions.get("window");

const BusCard = memo(({ route, nextStop, time, onPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        style={styles.busCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.busCardIconContainer}>
          <Ionicons name="bus" size={wp("6%")} color="#fff" />
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
    </Animated.View>
  );
});

const EmergencyButton = ({ onPress }) => (
  <TouchableOpacity
    style={styles.emergencyButton}
    onPress={onPress}
    activeOpacity={0.9}
  >
    <View style={styles.emergencyButtonInner}>
      <Ionicons name="alert-circle" size={wp("6%")} color="#fff" />
      <Text style={styles.emergencyButtonText}>Emergency</Text>
    </View>
  </TouchableOpacity>
);

const SafetyButton = ({ icon, text, onPress, color }) => (
  <TouchableOpacity
    style={[styles.safetyButton, { backgroundColor: color }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.safetyButtonIcon}>
      <Ionicons name={icon} size={wp("6.5%")} color="#fff" />
    </View>
    <Text style={styles.safetyButtonText}>{text}</Text>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [busList, setBusList] = useState([]);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const appState = useRef(AppState.currentState);
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: "clamp",
  });

  const getRouteData = (busID) => {
    const files = {
      BUS123: require("../routedata/BUS123.json"),
      BUS456: require("../routedata/BUS456.json"),
      BUS789: require("../routedata/BUS789.json"),
      BUS1011: require("../routedata/BUS1011.json"),
    };
    return files[busID] || null;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const fetchBusData = useCallback(async () => {
    try {
      const res = await fetch(
        "https://bus-tracking-school-92dd9-default-rtdb.asia-southeast1.firebasedatabase.app/gps.json"
      );
      const allBuses = await res.json();

      const stats = [];

      Object.entries(allBuses).forEach(([busID, busData]) => {
        const routeData = getRouteData(busID);
        if (!routeData || !busData.latitude || !busData.longitude) return;

        let minDist = Infinity;
        let nearestIdx = -1;

        routeData.stops.forEach((stop, idx) => {
          const d = calculateDistance(
            busData.latitude,
            busData.longitude,
            stop.lat,
            stop.lng
          );
          if (d < minDist) {
            minDist = d;
            nearestIdx = idx;
          }
        });

        const currentStop = routeData.stops[nearestIdx];
        const nextStop = currentStop?.nextStop || "End of Route";

        stats.push({
          id: busID,
          route: routeData.routeName || `Bus ${busID}`,
          nextStop,
          time: busData?.updatedTime || "Just now",
        });
      });

      setBusList(stats);
    } catch (error) {
      console.error("❌ Failed to fetch bus stats", error);
    }
  }, []);

  useEffect(() => {
    fetchBusData();
    const interval = setInterval(fetchBusData, 30000);
    return () => clearInterval(interval);
  }, [fetchBusData]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        setEmergencyMode(false); // reset emergency mode when app comes back
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleBusPress = useCallback(
    (busID) => navigation.navigate("BusDetails", { busID }),
    [navigation]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBusData().then(() => setRefreshing(false));
  }, []);

  // Combine all header content into a header component
  const renderHeader = () => (
    <View>
      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || "Guest"}</Text>
        </View>
        <TouchableOpacity style={styles.notificationBadge} activeOpacity={0.7}>
          <Ionicons
            name="notifications-outline"
            size={wp("5.5%")}
            color="#6C63FF"
          />
          <View style={styles.notificationDot}></View>
        </TouchableOpacity>
      </View>

      {/* Safety Buttons */}
      <View style={styles.safetySection}>
        <Text style={styles.sectionTitle}>Safety Features</Text>
        <View style={styles.safetyButtons}>
          <SafetyButton
            icon="alert-circle"
            text="Emergency"
            onPress={() => handleEmergency(setEmergencyMode)}
            color="#FF6B6B"
          />
          <SafetyButton
            icon="location"
            text="Share Location"
            onPress={() => handleShareLiveLocation(user)}
            color="#6C63FF"
          />
          <SafetyButton
            icon="shield-checkmark"
            text="Safety Tips"
            onPress={() => navigation.navigate("Safetytips")}
            color="#4ECDC4"
          />
        </View>
      </View>

      {/* Promo */}
      <TouchableOpacity style={styles.promoBanner} activeOpacity={0.9}>
        <Image
          source={require("../images/scadpoly.jpg")}
          style={styles.promoImage}
          resizeMode="cover"
        />
        <View style={styles.promoOverlay} />
        <View style={styles.promoContent}>
          <Text style={styles.promoTitle}>Never Miss Your Bus!</Text>
          <Text style={styles.promoSubtitle}>
            Real-time tracking for all routes
          </Text>
          <View style={styles.promoButton}>
            <Text style={styles.promoButtonText}>Track Now</Text>
            <Ionicons name="arrow-forward" size={wp("4%")} color="#6C63FF" />
          </View>
        </View>
      </TouchableOpacity>

      {/* Recent Search Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.searchTitle}>Available Buses</Text>
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={() => navigation.navigate("Track")}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={wp("3.5%")} color="#6C63FF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, emergencyMode && styles.emergencyMode]}
    >
      <StatusBar
        barStyle={emergencyMode ? "light-content" : "dark-content"}
        backgroundColor={emergencyMode ? "#ff4444" : "#6C63FF"}
        translucent
      />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <View style={styles.headerTextContainer}>
          {/* College Logo */}
          <Image
            source={{
              uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKRD768wIKEzDuDJz-uksCX5QQvOlzkKDMJQ&s",
            }} // replace with your logo
            style={styles.logo}
            resizeMode="contain"
          />

          {/* College Name */}
          <Text style={styles.title}>SCAD Polytechnic College</Text>

          {/* Subtitle / Tagline */}
          <Text style={styles.subtitle}>
            Empowering Students for a Brighter Future
          </Text>
        </View>
      </Animated.View>

      <Animated.FlatList
        data={busList}
        keyExtractor={(bus) => bus.id}
        renderItem={({ item }) => (
          <BusCard
            route={`${item.route}`}
            nextStop={item.nextStop}
            time={item.time}
            onPress={() => handleBusPress(item.id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={
          <View style={styles.alertBox}>
            <Ionicons name="warning" size={wp("5%")} color="#FFA500" />
            <Text style={styles.alertText}>
              Tapping <Text style={styles.alertBold}>Share Location</Text> will
              instantly notify your contacts with your live location.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="bus-outline" size={wp("20%")} color="#E5E5E5" />
            <Text style={styles.emptyStateText}>No buses available</Text>
            <Text style={styles.emptyStateSubtext}>
              Check back later or refresh to see active routes
            </Text>
          </View>
        }
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6C63FF"]}
            tintColor="#6C63FF"
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      />

      {!emergencyMode && (
        <EmergencyButton onPress={() => handleEmergency(setEmergencyMode)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp("5%"),
    paddingTop: hp("5%"),
    paddingBottom: hp("2%"),
    backgroundColor: "#6C63FF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: wp("5.5%"),
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    paddingHorizontal:5
  },
  subtitle: {
    fontSize: wp("4.5%"),
    color: "rgba(255,255,255,0.85)",
    marginTop: hp("0.5%"),
    textAlign: "center",
  },
  headerTextContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 5,
  },
  collegeName: {
    fontSize: wp("4%"),
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  scrollContent: {
    paddingTop: hp("12%"),
    paddingBottom: hp("2%"),
    paddingHorizontal: wp("4%"),
  },
  welcomeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: wp("5%"),
    marginBottom: hp("2%"),
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: wp("4%"),
    color: "#64748B",
    marginBottom: 4,
  },
  userName: {
    fontSize: wp("5%"),
    fontWeight: "700",
    color: "#1E293B",
  },
  notificationBadge: {
    width: wp("12%"),
    height: wp("12%"),
    borderRadius: wp("6%"),
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: wp("2.5%"),
    right: wp("2.5%"),
    width: wp("2.5%"),
    height: wp("2.5%"),
    borderRadius: wp("1.25%"),
    backgroundColor: "#FF6B6B",
  },
  safetySection: {
    marginBottom: hp("2%"),
  },
  sectionTitle: {
    fontSize: wp("4.5%"),
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: hp("1.5%"),
  },
  safetyButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: wp("2%"),
  },
  safetyButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("2%"),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  safetyButtonIcon: {
    width: wp("12%"),
    height: wp("12%"),
    borderRadius: wp("6%"),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp("1%"),
  },
  safetyButtonText: {
    color: "#fff",
    fontSize: wp("3.2%"),
    fontWeight: "600",
    textAlign: "center",
  },
  promoBanner: {
    height: hp("30%"),
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: hp("2%"),
    position: "relative",
  },
  promoImage: {
    width: "100%",
    height: "100%",
  },

  promoContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(64, 155, 74, 0.2)",
    padding: wp("5%"),
  },
  promoTitle: {
    fontSize: wp("5%"),
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: wp("3.8%"),
    color: "rgba(255,255,255,0.8)",
    marginBottom: hp("1.5%"),
  },
  promoButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("4%"),
    borderRadius: 20,
  },
  promoButtonText: {
    color: "#6C63FF",
    fontSize: wp("3.8%"),
    fontWeight: "600",
    marginRight: wp("1%"),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("1.5%"),
  },
  searchTitle: {
    fontSize: wp("4.5%"),
    fontWeight: "600",
    color: "#1E293B",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    color: "#6C63FF",
    fontSize: wp("3.8%"),
    fontWeight: "500",
    marginRight: 4,
  },
  busCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: wp("4%"),
    marginBottom: hp("1.5%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#6C63FF",
  },
  busCardIconContainer: {
    width: wp("12%"),
    height: wp("12%"),
    borderRadius: wp("6%"),
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("3%"),
  },
  busCardDetails: {
    flex: 1,
  },
  busCardRoute: {
    fontSize: wp("4.2%"),
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  busCardStop: {
    fontSize: wp("3.5%"),
    color: "#64748B",
  },
  busCardTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  busCardTime: {
    fontSize: wp("3.5%"),
    color: "#64748B",
    marginRight: wp("1%"),
  },
  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: wp("4%"),
    marginTop: hp("2%"),
    marginBottom: hp("10%"),
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  alertText: {
    flex: 1,
    fontSize: wp("3.5%"),
    color: "#92400E",
    marginLeft: wp("2%"),
  },
  alertBold: {
    fontWeight: "700",
  },
  emergencyButton: {
    position: "absolute",
    bottom: hp("3%"),
    right: wp("5%"),
    backgroundColor: "#DC2626",
    borderRadius: 30,
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("4%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emergencyButtonInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  emergencyButtonText: {
    color: "#fff",
    fontSize: wp("4%"),
    fontWeight: "600",
    marginLeft: wp("2%"),
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("10%"),
  },
  emptyStateText: {
    fontSize: wp("4.5%"),
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: hp("2%"),
  },
  emptyStateSubtext: {
    fontSize: wp("3.8%"),
    color: "#CBD5E1",
    textAlign: "center",
    marginTop: hp("1%"),
    paddingHorizontal: wp("10%"),
  },
  emergencyMode: {
    backgroundColor: "#ff4444",
  },
});
