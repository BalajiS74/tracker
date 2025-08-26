import { useEffect, useState, useRef, useCallback, memo, useMemo } from "react";
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
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import * as Location from "expo-location";
import axios from "axios";
import { useBus } from "../context/BusContext";
import UnavailableBusScreen from "../components/UnavailableBusScreen";

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

const { width } = Dimensions.get("window");
const scale = width / 375;
function normalize(size) {
  return Math.round(scale * size);
}

// ---------- Helpers ----------
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (d) => (d * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // meters
}

function isEveningNow() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  // After 3:55 PM OR before 5:00 AM
  if (h > 15 || (h === 15 && m >= 55)) return true;
  if (h < 5) return true;
  return false;
}

// Rebuild distances + nextStop for reversed list
function reverseRouteWithDistances(stops) {
  const reversed = [...stops].reverse();

  let cumulative = 0;
  const newStops = reversed.map((stop, idx) => {
    let distanceToNext = 0;
    let nextStopName = null;

    if (idx < reversed.length - 1) {
      const next = reversed[idx + 1];
      distanceToNext = calculateDistance(stop.lat, stop.lng, next.lat, next.lng);
      nextStopName = next.name;
    }

    cumulative += distanceToNext;

    return {
      ...stop,
      nextStop: nextStopName,
      to_next_distance_km: (distanceToNext / 1000).toFixed(3),
      cumulative_km_to_next: (cumulative / 1000).toFixed(3),
    };
  });

  return newStops;
}

// ---------- Stop row (memoized) ----------
const MemoStopItem = memo(
  ({ item, index, currentStopIdx, stopsLength, blinkAnim, pulseAnim }) => {
    const isCurrent = index === currentStopIdx;
    return (
      <View style={[styles.stopRow, isCurrent && styles.activeStopRow]}>
        <View style={styles.dotContainer}>
          {isCurrent ? (
            <Animated.View
              style={[
                styles.dot,
                styles.currentDot,
                blinkAnim && { opacity: blinkAnim },
                pulseAnim && { transform: [{ scale: pulseAnim }] },
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
          {index !== stopsLength - 1 && (
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
          <Text style={styles.stopDistance}>
            {`${item?.cumulative_km_to_next ?? "--"} km`}
          </Text>
        </View>

        {isCurrent && (
          <View style={styles.currentStopBadge}>
            <Ionicons name="location" size={12} color="#fff" />
            <Text style={styles.currentStopBadgeText}>NOW</Text>
          </View>
        )}
      </View>
    );
  }
);

// ---------- Main ----------
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

  const [etaToNextStop, setEtaToNextStop] = useState("--");
  const [countdown, setCountdown] = useState("--");
  const [nearestUserStop, setNearestUserStop] = useState(null);
  const [notified, setNotified] = useState(false);

  const blinkAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { buses } = useBus();
  const busData = buses.find((bus) => bus.busid === busID);

  // Load static route data
  useEffect(() => {
    const data = getRouteData(busID);
    setRouteData(data);
  }, [busID]);

  // Build the EXACT list we render (forward or reversed)
  const displayedStops = useMemo(() => {
    if (!routeData?.stops) return [];
    return isEveningNow()
      ? reverseRouteWithDistances(routeData.stops)
      : routeData.stops;
  }, [routeData]);

  // Animations (don’t restart on every index change)
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

  // Compute status before any effect that uses it
  const computedSpeed = isOnline ? busInfo?.speed ?? 0 : 0.0;
  const status = !isOnline ? "Parked" : computedSpeed <= 2 ? "Stopped" : "Moving";

  // Fetch current bus location — use displayedStops (render order!)
  const fetchCurrentLocation = useCallback(async () => {
    if (!busID || displayedStops.length === 0) return;

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

      // Find nearest in the SAME order as rendered
      let minDist = Infinity;
      let nearestIdx = -1;

      displayedStops.forEach((stop, idx) => {
        const d = calculateDistance(data.latitude, data.longitude, stop.lat, stop.lng);
        if (d < minDist) {
          minDist = d;
          nearestIdx = idx;
        }
      });

      // Update indices consistently
      if (minDist < 300 && nearestIdx > lastConfirmedStopIdx) {
        setLastConfirmedStopIdx(nearestIdx);
        setCurrentStopIdx(nearestIdx);
      } else {
        setCurrentStopIdx(nearestIdx);
      }

      // Set next stop (in displayed order)
      const currentStop = displayedStops[nearestIdx];
      const next = displayedStops[nearestIdx + 1] ?? null;
      setUpcommingStop(next?.name ?? null);

      setLoading(false);
    } catch (e) {
      console.error("❌ Axios error fetching location:", e.message);
      setCurrentStopIdx(-1);
      setLoading(false);
    }
  }, [busID, displayedStops, lastConfirmedStopIdx]);

  useEffect(() => {
    fetchCurrentLocation();
    const interval = setInterval(fetchCurrentLocation, 5000);
    return () => clearInterval(interval);
  }, [fetchCurrentLocation]);

  // user location
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

  // Speak next stop (use displayed order)
  useEffect(() => {
    if (currentStopIdx < 0 || displayedStops.length === 0) return;
    const stop = displayedStops[currentStopIdx];
    if (!stop) return;

    if (status !== "Parked") {
      Speech.speak(`Next stop is ${stop.name}`);
    } else {
      Speech.stop();
    }
  }, [currentStopIdx, status, displayedStops]);

  // ETA + countdown (use displayed order)
  useEffect(() => {
    if (
      busInfo?.speed > 0 &&
      currentStopIdx + 1 < displayedStops.length &&
      busInfo?.latitude &&
      busInfo?.longitude
    ) {
      const nextStop = displayedStops[currentStopIdx + 1];
      const dist = calculateDistance(
        busInfo.latitude,
        busInfo.longitude,
        nextStop.lat,
        nextStop.lng
      );
      const speedMS = (busInfo.speed * 1000) / 3600;
      const etaSec = speedMS > 0 ? dist / speedMS : null;
      if (etaSec) {
        setEtaToNextStop(
          `${Math.floor(etaSec / 60)} min ${Math.floor(etaSec % 60)} sec`
        );
        setCountdown(`${Math.max(0, Math.floor(etaSec))} sec`);
      } else {
        setEtaToNextStop("--");
        setCountdown("--");
      }
    } else {
      setEtaToNextStop("--");
      setCountdown("--");
    }
  }, [busInfo, currentStopIdx, displayedStops]);

  // Notifications near user stop (optional logic placeholder)
  useEffect(() => {
    if (!notified && nearestUserStop && busInfo?.latitude && busInfo?.longitude) {
      const dist = calculateDistance(
        busInfo.latitude,
        busInfo.longitude,
        nearestUserStop.lat,
        nearestUserStop.lng
      );
      if (dist < 100) {
        Alert.alert("Bus Alert", ` Bus is arriving at your nearest stop: ${nearestUserStop.name}`);
        setNotified(true);
      }
    }
  }, [busInfo, nearestUserStop, notified]);

  // Tabs
  const handleTabRoute = useCallback(() => {
    setActiveTab("route");
    fetchCurrentLocation();
  }, [fetchCurrentLocation]);
  const handleTabDetails = useCallback(() => setActiveTab("details"), []);

  // Render stop row
  const renderStopItem = useCallback(
    ({ item, index }) => (
      <MemoStopItem
        item={item}
        index={index}
        currentStopIdx={currentStopIdx}
        stopsLength={displayedStops.length}
        blinkAnim={index === currentStopIdx ? blinkAnim : null}
        pulseAnim={index === currentStopIdx ? pulseAnim : null}
      />
    ),
    [currentStopIdx, displayedStops.length, blinkAnim, pulseAnim]
  );

  if (!routeData || loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading route data...</Text>
      </SafeAreaView>
    );
  }

  if (busData?.isNotAvailable) {
    return <UnavailableBusScreen busData={busData} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <LinearGradient colors={["#6C63FF", "#4A43C9"]} style={styles.headerGradient}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="bus" size={24} color="#fff" />
            <Text style={styles.headerTitle}>{busID}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              status === "Parked"
                ? styles.statusParked
                : status === "Stopped"
                ? styles.statusStopped
                : styles.statusMoving,
            ]}
          >
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={handleTabRoute}
          style={[styles.tabButton, activeTab === "route" && styles.activeTab]}
        >
          <Ionicons
            name="map-outline"
            size={20}
            color={activeTab === "route" ? "#6C63FF" : "#94A3B8"}
          />
          <Text style={[styles.tabText, activeTab === "route" && styles.activeTabText]}>
            Route
          </Text>
        </TouchableOpacity>

        <View style={styles.tabDivider} />

        <TouchableOpacity
          onPress={handleTabDetails}
          style={[styles.tabButton, activeTab === "details" && styles.activeTab]}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={activeTab === "details" ? "#6C63FF" : "#94A3B8"}
          />
          <Text style={[styles.tabText, activeTab === "details" && styles.activeTabText]}>
            Details
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {activeTab === "route" ? (
          <FlatList
            data={displayedStops}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={renderStopItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.detailCard}>
              <View style={styles.detailCardHeader}>
                <Ionicons name="location" size={20} color="#6C63FF" />
                <Text style={styles.detailCardTitle}>Location Details</Text>
              </View>

              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="speedometer" size={18} color="#6C63FF" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Current Speed</Text>
                    <Text style={styles.detailValue}>{(computedSpeed || 0).toFixed(1)} km/h</Text>
                  </View>
                </View>

                <View className="detailItem" style={styles.detailItem}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="navigate" size={18} color="#6C63FF" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>
                      {/* heuristic label unchanged */}
                      To Next Stop
                    </Text>
                    <Text style={styles.detailValue}>
                      {currentStopIdx + 1 < displayedStops.length && busInfo?.latitude && busInfo?.longitude
                        ? (() => {
                            const nextStop = displayedStops[currentStopIdx + 1];
                            const dist = calculateDistance(
                              busInfo.latitude,
                              busInfo.longitude,
                              nextStop.lat,
                              nextStop.lng
                            );
                            return `${(dist / 1000).toFixed(2)} km`;
                          })()
                        : "--"}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="time" size={18} color="#6C63FF" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Estimated Arrival</Text>
                    <Text style={styles.detailValue}>{etaToNextStop}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="timer" size={18} color="#6C63FF" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Countdown</Text>
                    <Text style={styles.detailValue}>{countdown}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Ionicons name="information-circle" size={20} color="#6C63FF" />
                <Text style={styles.infoCardTitle}>Bus Information</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoText}>• Real-time tracking updates every 30 seconds</Text>
                <Text style={styles.infoText}>
                  • ETA is calculated based on current speed and traffic conditions
                </Text>
                <Text style={styles.infoText}>• Distance measurements are approximate</Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
  },
  loadingText: {
    marginTop: 16,
    color: "#6C63FF",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  headerGradient: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusMoving: {
    backgroundColor: "#22C55E",
  },
  statusStopped: {
    backgroundColor: "#F59E0B",
  },
  statusParked: {
    backgroundColor: "#EF4444",
  },
  statusText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -8,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    backgroundColor: "#F0E6FF",
  },
  tabDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  tabText: {
    fontWeight: "600",
    color: "#94A3B8",
    fontSize: 16,
  },
  activeTabText: {
    color: "#6C63FF",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  stopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeStopRow: {
    backgroundColor: "#F0E6FF",
    borderLeftWidth: 4,
    borderLeftColor: "#6C63FF",
  },
  dotContainer: {
    width: 36,
    alignItems: "center",
    marginRight: 12,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    zIndex: 2,
  },
  currentDot: {
    backgroundColor: "#6C63FF",
    borderColor: "#6C63FF",
  },
  pastDot: {
    backgroundColor: "#A5B4FC",
    borderColor: "#818CF8",
  },
  upcomingDot: {
    backgroundColor: "#fff",
    borderColor: "#C7D2FE",
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: -20,
  },
  pastLine: {
    backgroundColor: "#A5B4FC",
  },
  upcomingLine: {
    backgroundColor: "#C7D2FE",
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
  },
  stopDistance: {
    fontSize: 14,
    color: "#64748B",
  },
  activeStopName: {
    color: "#6C63FF",
    fontWeight: "700",
  },
  currentStopBadge: {
    backgroundColor: "#6C63FF",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  currentStopBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  detailsContainer: {
    flex: 1,
  },
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  detailCardTitle: {
    color: "#6C63FF",
    fontWeight: "bold",
    fontSize: 18,
  },
  detailGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0E6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    color: "#64748B",
    fontWeight: "500",
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    color: "#1E293B",
    fontWeight: "600",
    fontSize: 16,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  infoCardTitle: {
    color: "#6C63FF",
    fontWeight: "600",
    fontSize: 16,
  },
  infoContent: {
    gap: 8,
  },
  infoText: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
  },
});

export default BusDetails;
