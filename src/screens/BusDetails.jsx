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
          <Text style={styles.stopDistance}>{`${item.cumulative_km_to_next} km`}</Text>
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

  // Estimated Arrival Time (to next stop)
  const [etaToNextStop, setEtaToNextStop] = useState("--");
  // Stop ETA Countdown
  const [countdown, setCountdown] = useState("--");
  // User's Nearest Stop
  const [nearestUserStop, setNearestUserStop] = useState(null);
  // Notifications
  const [notified, setNotified] = useState(false);

  const blinkAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { buses } = useBus(); // ✅ access buses from context

  const busData = buses.find((bus) => bus.busid === busID);
  
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
  }, [activeTab, blinkAnim, pulseAnim, currentStopIdx]);

  useEffect(() => {
    const data = getRouteData(busID);
    setRouteData(data);
  }, [busID]);

  // 1. Wrap the fetch function with useCallback
  const fetchCurrentLocation = useCallback(async () => {
    if (!routeData || !busID ) return;

    const firebaseURL = ` https://bus-tracking-school-92dd9-default-rtdb.asia-southeast1.firebasedatabase.app/gps/${busID}.json`;

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

      // ✅ Set next stop using nextStop field from current stop
      const currentStop = routeData.stops[lastConfirmedStopIdx];
      const next = currentStop?.nextStop || null;
      setUpcommingStop(next);

      setLoading(false);
    } catch (e) {
      console.error("❌ Axios error fetching location:", e.message);
      setCurrentStopIdx(-1);
      setLoading(false);
    }
  }, [routeData, busID, lastConfirmedStopIdx]);

  useEffect(() => {
    fetchCurrentLocation(); // call once
    const interval = setInterval(fetchCurrentLocation, 5000); // every 5s
    return () => clearInterval(interval);
  }, [fetchCurrentLocation]); // ✅ correct dependency

  // get the user location and ask the permmission
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

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // speak the bus stop name
  useEffect(() => {
    if (!routeData || lastConfirmedStopIdx < 0) return;

    const stop = routeData.stops[lastConfirmedStopIdx];
    if (!stop) return;

    // Only announce if bus is NOT parked
    if (status !== "Parked") {
      Speech.speak(`Next stop is  ${stop.name}`);
    } else {
      Speech.stop(); // Optional: stop any ongoing speech if parked
    }
  }, [lastConfirmedStopIdx, status]);

  // Calculate ETA and Countdown for next stop
  useEffect(() => {
    if (
      busInfo?.speed > 0 &&
      currentStopIdx + 1 < routeData?.stops?.length &&
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
      const speedMS = (busInfo.speed * 1000) / 3600; // km/h to m/s
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
  }, [busInfo, currentStopIdx, routeData]);

  // Notifications: Alert when bus is near user's nearest stop
  useEffect(() => {
    if (
      !notified &&
      nearestUserStop &&
      busInfo?.latitude &&
      busInfo?.longitude
    ) {
      const dist = calculateDistance(
        busInfo.latitude,
        busInfo.longitude,
        nearestUserStop.lat,
        nearestUserStop.lng
      );
      if (dist < 100) {
        Alert.alert(
          "Bus Alert",
          ` Bus is arriving at your nearest stop: ${nearestUserStop.name}`
        );
        setNotified(true);
      }
    }
  }, [busInfo, nearestUserStop, notified]);

  // handel route tap
  const handleTabRoute = useCallback(() => {
    setActiveTab("route");
    fetchCurrentLocation(); // ✅ this works now
  }, [fetchCurrentLocation]);
  const handleTabDetails = useCallback(() => setActiveTab("details"), []);

  // stop card render
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

  if (!routeData || loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
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
  
  function reverseRouteWithDistances(stops) {
    const reversed = [...stops].reverse();

    let cumulative = 0;
    const newStops = reversed.map((stop, idx) => {
      let distanceToNext = 0;

      if (idx < reversed.length - 1) {
        distanceToNext = calculateDistance(
          stop.lat,
          stop.lng,
          reversed[idx + 1].lat,
          reversed[idx + 1].lng
        );
      }

      cumulative += distanceToNext;

      return {
        ...stop,
        cumulative_km_to_next: (cumulative / 1000).toFixed(2), // in km
      };
    });

    return newStops;
  }
  
  function isEvening() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // After 3:55 PM and before 5:00 AM next day → Evening/Return Route
    if (hours > 15 || (hours === 15 && minutes >= 55)) {
      return true;
    }

    // From midnight until 4:59 AM → still Evening/Return Route
    if (hours < 5) {
      return true;
    }

    // Otherwise → Morning/Forward Route
    return false;
  }

  const processedStops = isEvening()
    ? reverseRouteWithDistances(routeData.stops) // evening or before 5am
    : routeData.stops; // morning 5am onwards

  if (busData?.isNotAvailable) {
    return <UnavailableBusScreen busData={busData} />;
  }

  return (
    <View style={styles.container} edges={["top", "left", "right"]}>
      {/* Header with gradient background */}
      <LinearGradient
        colors={["#6C63FF", "#4A43C9"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="bus" size={24} color="#fff" />
            <Text style={styles.headerTitle}>{busID}</Text>
          </View>
          <View style={[styles.statusBadge, 
            status === 'Parked' ? styles.statusParked : 
            status === 'Stopped' ? styles.statusStopped : 
            styles.statusMoving
          ]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
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
          <Text
            style={[
              styles.tabText,
              activeTab === "route" && styles.activeTabText,
            ]}
          >
            Route
          </Text>
        </TouchableOpacity>
        
        <View style={styles.tabDivider} />
        
        <TouchableOpacity
          onPress={handleTabDetails}
          style={[
            styles.tabButton,
            activeTab === "details" && styles.activeTab,
          ]}
        >
          <Ionicons 
            name="information-circle-outline" 
            size={20} 
            color={activeTab === "details" ? "#6C63FF" : "#94A3B8"} 
          />
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
            data={processedStops}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={renderStopItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <ScrollView 
            style={styles.detailsContainer}
            showsVerticalScrollIndicator={false}
          >
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
                    <Text style={styles.detailValue}>
                      {computedSpeed.toFixed(1)} km/h
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="navigate" size={18} color="#6C63FF" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>
                      {userBusDistance !== null && userBusDistance < 30
                        ? "To Next Stop"
                        : "To Your Location"}
                    </Text>
                    <Text style={styles.detailValue}>
                      {userBusDistance !== null && userBusDistance < 30
                        ? (() => {
                            if (currentStopIdx + 1 < routeData.stops.length && busInfo?.latitude && busInfo?.longitude) {
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

            {/* Additional Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Ionicons name="information-circle" size={20} color="#6C63FF" />
                <Text style={styles.infoCardTitle}>Bus Information</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoText}>
                  • Real-time tracking updates every 30 seconds
                </Text>
                <Text style={styles.infoText}>
                  • ETA is calculated based on current speed and traffic conditions
                </Text>
                <Text style={styles.infoText}>
                  • Distance measurements are approximate
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

// Updated Styles
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