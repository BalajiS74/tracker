import { useEffect, useState, useRef, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  FlatList,
  TouchableOpacity,
  Easing,
  Dimensions,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import {
  useBusTracker,
  useETA,
  useArrivalNotification,
} from "../hooks/useBusTracker";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Speech from "expo-speech";
import * as Location from "expo-location";
import axios from "axios";

const getRouteData = (busID) => {
  try {
    const files = {
      BUS123: require("../routedata/BUS123.json"),
      BUS456: require("../routedata/BUS456.json"),
      BUS789: require("../routedata/BUS789.json"),
      BUS1011: require("../routedata/BUS1011.json"),
    };
    return files[busID];
  } catch (e) {
    return null;
  }
};

const { width, height } = Dimensions.get("window");
const scale = width / 375; // base iPhone width

function normalize(size) {
  return Math.round(scale * size);
}

// stop card
const MemoStopItem = memo(
  ({ item, index, currentStopIdx, routeData, blinkAnim, pulseAnim }) => {
    const isCurrent = index === currentStopIdx;
    return (
      <View style={[styles.stopRow, isCurrent && styles.activeStopRow]}>
        <View style={styles.dotContainer}>
          {isCurrent ? (
            <Animated.View
              style={[
                styles.dot,
                styles.currentDot,
                {
                  opacity: blinkAnim,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
          ) : (
            <View
              style={[
                styles.dot,
                index < currentStopIdx ? styles.pastDot : styles.upcomingDot,
              ]}
            />
          )}
          {index !== routeData.stops.length - 1 && (
            <View
              style={[
                styles.line,
                index < currentStopIdx ? styles.pastLine : styles.upcomingLine,
              ]}
            />
          )}
        </View>
        <View style={styles.stopInfo}>
          <Text style={[styles.stopName, isCurrent && styles.activeStopName]}>
            {item.name}
          </Text>
        </View>
        {isCurrent && (
          <View style={styles.currentStopBadge}>
            <Text style={styles.currentStopBadgeText}>NOW</Text>
          </View>
        )}
      </View>
    );
  }
);

const BusDetails = ({ route }) => {
  const { busID } = route.params;
  const [routeData, setRouteData] = useState(null);
  const [busInfo, setBusInfo] = useState(null);
  const [isOnline, setBusOnlineStatus] = useState(false);
  const [currentStopIdx, setCurrentStopIdx] = useState(-1);
  const [lastConfirmedStopIdx, setLastConfirmedStopIdx] = useState(-1);
  const [upcommingStop, setUpcommingStop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("route");
  const [userLocation, setUserLocation] = useState(null);
  const [nearestUserStop, setNearestUserStop] = useState(null);
  const [notified, setNotified] = useState(false);

  const blinkAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animation effects
  useEffect(() => {
    if (activeTab !== "route") return;

    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.4,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    blink.start();
    pulse.start();

    return () => {
      blink.stop();
      pulse.stop();
    };
  }, [activeTab, blinkAnim, pulseAnim]);

  // Load route data
  useEffect(() => {
    const data = getRouteData(busID);
    setRouteData(data);
  }, [busID]);

  // Bus location tracking
  const fetchCurrentLocation = useCallback(async () => {
    if (!routeData || !busID) return;

    const firebaseURL = `https://bus-tracking-school-92dd9-default-rtdb.asia-southeast1.firebasedatabase.app/gps/${busID}.json`;

    try {
      const response = await axios.get(firebaseURL);
      const data = response.data;
      setBusInfo(data);

      const now = Date.now();
      const lastSeen = data?.lastSeen ? data.lastSeen * 1000 : 0;
      const isRecent = now - lastSeen <= 30000;
      const isBusOnline = data?.status === true && isRecent;

      setBusOnlineStatus(isBusOnline);
      if (!data?.latitude || !data?.longitude || !isBusOnline) {
        setCurrentStopIdx(-1);
        setLoading(false);
        return;
      }

      let minDist = Infinity;
      let nearestIdx = -1;

      routeData.stops.forEach((stop, idx) => {
        const d = calculateDistance(
          data.latitude,
          data.longitude,
          stop.lat,
          stop.lng
        );
        if (d < minDist) {
          minDist = d;
          nearestIdx = idx;
        }
      });

      if (minDist < 300 && nearestIdx > lastConfirmedStopIdx) {
        setLastConfirmedStopIdx(nearestIdx);
      }

      setCurrentStopIdx(lastConfirmedStopIdx);

      const currentStop = routeData.stops[lastConfirmedStopIdx];
      const next = currentStop?.nextStop || null;
      setUpcommingStop(next);

      setLoading(false);
    } catch (e) {
      console.error("Error fetching location:", e.message);
      setCurrentStopIdx(-1);
      setLoading(false);
    }
  }, [routeData, busID, lastConfirmedStopIdx]);

  // Bus status check
  const checkStatus = async (busId) => {
    try {
      const response = await axios.get(`your-api-endpoint/${busId}`);
      return response.data.status;
    } catch (error) {
      console.error("Error checking status:", error);
      return false;
    }
  };

  // Start location tracking
  useEffect(() => {
    fetchCurrentLocation();
    const interval = setInterval(fetchCurrentLocation, 5000);
    return () => clearInterval(interval);
  }, [fetchCurrentLocation]);

  // Get user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setUserLocation(null);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    })();
  }, []);

  // Check bus status periodically
  useEffect(() => {
    const checkBusStatus = async () => {
      if (!busID) return;
      try {
        const status = await checkStatus(busID);
        setBusOnlineStatus(status);
      } catch (error) {
        console.error("Error checking bus status:", error);
      }
    };

    checkBusStatus();
    const interval = setInterval(checkBusStatus, 10000);
    return () => clearInterval(interval);
  }, [busID]);

  // Speech announcement for stops
  useEffect(() => {
    if (!routeData || lastConfirmedStopIdx < 0) return;

    const stop = routeData.stops[lastConfirmedStopIdx];
    if (!stop) return;

    if (status !== "Parked") {
      Speech.speak(`Next stop is ${stop.name}`);
    } else {
      Speech.stop();
    }
  }, [lastConfirmedStopIdx, status]);

  // Distance calculation
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Tab handlers
  const handleTabRoute = useCallback(() => {
    setActiveTab("route");
    fetchCurrentLocation();
  }, [fetchCurrentLocation]);

  const handleTabDetails = useCallback(() => setActiveTab("details"), []);

  // Stop item renderer
  const renderStopItem = useCallback(
    ({ item, index }) => (
      <MemoStopItem
        item={item}
        index={index}
        currentStopIdx={currentStopIdx}
        routeData={routeData}
        blinkAnim={blinkAnim}
        pulseAnim={pulseAnim}
      />
    ),
    [currentStopIdx, routeData, blinkAnim, pulseAnim]
  );

  // Loading state
  if (!routeData || loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading route data...</Text>
      </SafeAreaView>
    );
  }

  const computedSpeed = isOnline ? busInfo?.speed ?? 0 : 0.0;
  const status = !isOnline
    ? "Parked"
    : computedSpeed <= 2
    ? "Stopped"
    : "Moving";

  // Calculate distance between user and bus
  let userBusDistance = null;
  if (busInfo?.latitude && busInfo?.longitude && userLocation) {
    userBusDistance = calculateDistance(
      busInfo.latitude,
      busInfo.longitude,
      userLocation.latitude,
      userLocation.longitude
    );
  }

  // Set nearest user stop
  useEffect(() => {
    if (userBusDistance !== null && userBusDistance < 30) {
      setNearestUserStop({
        name: "You are near the bus",
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      });
    } else if (nearestUserStop) {
      setNearestUserStop({
        name: nearestUserStop.name,
        lat: nearestUserStop.lat,
        lng: nearestUserStop.lng,
      });
    }
  }, [userBusDistance, userLocation]);

  // Notifications
  useArrivalNotification({
    busInfo,
    nearestUserStop,
    notified,
    setNotified,
    calculateDistance,
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{busInfo?.busNumber || busID}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={handleTabRoute}
          style={[styles.tabButton, activeTab === "route" && styles.activeTab]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "route" && styles.activeTabText,
            ]}
          >
            Route
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleTabDetails}
          style={[
            styles.tabButton,
            activeTab === "details" && styles.activeTab,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "details" && styles.activeTabText,
            ]}
          >
            Details
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {activeTab === "route" ? (
          <FlatList
            data={routeData.stops}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={renderStopItem}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.detailsContainer}>
            <View style={styles.detailCard}>
              <Text style={styles.detailCardTitle}>Location Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Speed:</Text>
                <Text style={styles.detailValue}>
                  {computedSpeed.toFixed(1)} km/h
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {userBusDistance !== null && userBusDistance < 30
                    ? "Distance to Next Stop:"
                    : "Distance to You:"}
                </Text>
                <Text style={styles.detailValue}>
                  {userBusDistance !== null && userBusDistance < 30
                    ? (() => {
                        if (
                          currentStopIdx + 1 < routeData.stops.length &&
                          busInfo?.latitude &&
                          busInfo?.longitude
                        ) {
                          const nextStop = routeData.stops[currentStopIdx + 1];
                          const dist = calculateDistance(
                            busInfo.latitude,
                            busInfo.longitude,
                            nextStop.lat,
                            nextStop.lng
                          );
                          return `${(dist / 1000).toFixed(2)} km`;
                        }
                        return "--";
                      })()
                    : userBusDistance !== null
                    ? `${(userBusDistance / 1000).toFixed(2)} km`
                    : "--"}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};
// styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e4e7ebff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: normalize(8),
  },
  loadingText: {
    marginTop: normalize(16),
    color: "#4f46e5",
    fontSize: normalize(16),
    fontWeight: "500",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    padding: normalize(16),
    backgroundColor: "#fbfbfbff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: normalize(20),
    fontWeight: "bold",
    color: "#1e293b",
  },
  statusBadge: {
    backgroundColor: "#e0e7ff",
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(20),
  },
  statusText: {
    color: "#4f46e5",
    fontWeight: "600",
    fontSize: normalize(14),
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    paddingVertical: normalize(16),
    paddingHorizontal: normalize(32),
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#4f46e5",
  },
  tabText: {
    fontWeight: "600",
    color: "#64748b",
    fontSize: normalize(16),
  },
  activeTabText: {
    color: "#4f46e5",
  },
  contentContainer: {
    flex: 1,
    padding: normalize(16),
  },
  listContainer: {
    paddingBottom: normalize(20),
  },
  stopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: normalize(12),
    padding: normalize(16),
    borderRadius: normalize(12),
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  activeStopRow: {
    backgroundColor: "#f5f3ff",
    borderLeftWidth: 4,
    borderLeftColor: "#4f46e5",
  },
  dotContainer: {
    width: normalize(36),
    alignItems: "center",
    marginRight: normalize(12),
  },
  dot: {
    width: normalize(20),
    height: normalize(20),
    borderRadius: normalize(10),
    borderWidth: 3,
    zIndex: 2,
  },
  currentDot: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },
  pastDot: {
    backgroundColor: "#a5b4fc",
    borderColor: "#818cf8",
  },
  upcomingDot: {
    backgroundColor: "#ffffff",
    borderColor: "#c7d2fe",
  },
  line: {
    width: normalize(2),
    flex: 1,
    marginTop: normalize(4),
    marginBottom: -normalize(20),
  },
  pastLine: {
    backgroundColor: "#a5b4fc",
  },
  upcomingLine: {
    backgroundColor: "#c7d2fe",
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: normalize(16),
    fontWeight: "600",
    color: "#334155",
    marginBottom: normalize(4),
    padding: normalize(4),
    lineHeight: normalize(13),
  },
  activeStopName: {
    color: "#4f46e5",
    fontWeight: "700",
  },
  currentStopBadge: {
    backgroundColor: "#4f46e5",
    borderRadius: normalize(12),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
  },
  currentStopBadgeText: {
    color: "white",
    fontSize: normalize(12),
    fontWeight: "bold",
  },
  detailsContainer: {
    flex: 1,
  },
  detailCard: {
    backgroundColor: "#ffffff",
    borderRadius: normalize(16),
    padding: normalize(20),
    marginBottom: normalize(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  detailCardTitle: {
    color: "#4f46e5",
    fontWeight: "bold",
    fontSize: normalize(18),
    marginBottom: normalize(16),
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: normalize(5),
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  detailLabel: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: normalize(15),
  },
  detailValue: {
    color: "#1e293b",
    fontWeight: "500",
    fontSize: normalize(15),
    paddingVertical: "10",
    paddingHorizontal: "10",
  },
  movingStatus: {
    color: "#10b981",
    fontWeight: "600",
    paddingVertical: "5",
    paddingHorizontal: "10",
  },
  stoppedStatus: {
    color: "#f59e0b",
    fontWeight: "600",
    paddingVertical: "5",
    paddingHorizontal: "10",
  },
  parkedStatus: {
    color: "#64748b",
    fontWeight: "600",
    paddingVertical: "5",
    paddingHorizontal: "10",
  },
  nextStop: {
    color: "#4f46e5",
    fontWeight: "600",
    paddingVertical: "5",
    paddingHorizontal: "10",
  },
});

export default BusDetails;
