import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  FlatList,
  TouchableOpacity,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Speech from "expo-speech";

const getRouteData = (busID) => {
  try {
    const files = {
      BUS123: require("../routedata/BUS123.json"),
      BUS456: require("../routedata/BUS456.json"),
      BUS789: require("../routedata/BUS789.json"),
    };
    return files[busID];
  } catch (e) {
    return null;
  }
};

const BusDetails = ({ route }) => {
  const { busID } = route.params;
  const [routeData, setRouteData] = useState(null);
  const [currentStopIdx, setCurrentStopIdx] = useState(-1);
  const [lastConfirmedStopIdx, setLastConfirmedStopIdx] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [busInfo, setBusInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("route");

  // Blinking animation setup
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Blinking animation (opacity)
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

    // Pulsing animation (scale)
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
  }, []);

  useEffect(() => {
    const data = getRouteData(busID);
    setRouteData(data);
  }, [busID]);

  useEffect(() => {
    if (!routeData) return;
    const firebaseURL = `https://bus-tracking-school-92dd9-default-rtdb.asia-southeast1.firebasedatabase.app/gps/${busID}.json`;

    const fetchCurrentLocation = async () => {
      try {
        const res = await fetch(firebaseURL);
        const data = await res.json();
        setBusInfo(data);

        if (!data || !data.latitude || !data.longitude) {
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

        if (
          minDist < 300 &&
          nearestIdx > lastConfirmedStopIdx &&
          nearestIdx - lastConfirmedStopIdx === 1
        ) {
          setLastConfirmedStopIdx(nearestIdx);
        }

        setCurrentStopIdx(lastConfirmedStopIdx);
        setLoading(false);
      } catch (e) {
        setCurrentStopIdx(-1);
        setLoading(false);
      }
    };

    fetchCurrentLocation();
    const interval = setInterval(fetchCurrentLocation, 5000);
    return () => clearInterval(interval);
  }, [routeData, busID, lastConfirmedStopIdx]);

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

  useEffect(() => {
    if (
      lastConfirmedStopIdx >= 0 &&
      routeData &&
      routeData.stops &&
      routeData.stops[lastConfirmedStopIdx]
    ) {
      const stopName = routeData.stops[lastConfirmedStopIdx].name;
      Speech.speak(`Next stop is ${stopName}`);
    }
  }, [lastConfirmedStopIdx]);

  const renderStopItem = ({ item, index }) => {
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
                }
              ]} 
            />
          ) : (
            <View 
              style={[
                styles.dot,
                index < currentStopIdx ? styles.pastDot : styles.upcomingDot
              ]} 
            />
          )}
          {index !== routeData.stops.length - 1 && (
            <View style={[
              styles.line, 
              index < currentStopIdx ? styles.pastLine : styles.upcomingLine
            ]} />
          )}
        </View>
        <View style={styles.stopInfo}>
          <Text style={[styles.stopName, isCurrent && styles.activeStopName]}>
            {item.name}
          </Text>
          <Text style={styles.coordinates}>
            Lat: {item.lat.toFixed(5)}, Lng: {item.lng.toFixed(5)}
          </Text>
        </View>
      </View>
    );
  };

  if (!routeData || loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Loading route data...</Text>
      </SafeAreaView>
    );
  }

  const status = busInfo?.speed < 1
    ? busInfo?.ignition === false || busInfo?.ignition === 0
      ? "Parked"
      : "Stopped"
    : "Moving";

  const nextStop =
    currentStopIdx >= 0 && currentStopIdx < routeData.stops.length
      ? routeData.stops[currentStopIdx].name
      : "--";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          onPress={() => setActiveTab("route")} 
          style={[styles.tabButton, activeTab === "route" && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === "route" && styles.activeTabText]}>
            Route
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab("details")} 
          style={[styles.tabButton, activeTab === "details" && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === "details" && styles.activeTabText]}>
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
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[styles.detailValue, status === "Moving" && styles.movingStatus]}>
                {status}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>
                {busInfo?.latitude?.toFixed(5)}, {busInfo?.longitude?.toFixed(5)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Speed:</Text>
              <Text style={styles.detailValue}>
                {busInfo?.speed?.toFixed(1)} km/h
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Heading:</Text>
              <Text style={styles.detailValue}>
                {busInfo?.heading}°
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Next Stop:</Text>
              <Text style={[styles.detailValue, styles.nextStop]}>
                {nextStop}
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f9ff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f9ff",
  },
  loadingText: {
    marginTop: 16,
    color: "#4a90e2",
    fontSize: 16,
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#4a90e2",
  },
  tabText: {
    fontWeight: "600",
    color: "#888",
    fontSize: 16,
  },
  activeTabText: {
    color: "#4a90e2",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
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
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  activeStopRow: {
    backgroundColor: "#f0f7ff",
    borderLeftWidth: 4,
    borderLeftColor: "#4a90e2",
    shadowColor: "#4a90e2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: "#4a90e2",
    borderColor: "#2a70c2",
  },
  pastDot: {
    backgroundColor: "#d1d1d1",
    borderColor: "#a1a1a1",
  },
  upcomingDot: {
    backgroundColor: "#ffffff",
    borderColor: "#d1e3ff",
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: -20,
  },
  pastLine: {
    backgroundColor: "#d1d1d1",
  },
  upcomingLine: {
    backgroundColor: "#d1e3ff",
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  activeStopName: {
    color: "#2a70c2",
    fontWeight: "700",
  },
  coordinates: {
    fontSize: 13,
    color: "#777",
    fontFamily: 'monospace',
  },
  detailsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    color: "#666",
    fontWeight: "600",
    fontSize: 15,
  },
  detailValue: {
    color: "#333",
    fontWeight: "500",
    fontSize: 15,
  },
  movingStatus: {
    color: "#2ecc71",
    fontWeight: "600",
  },
  nextStop: {
    color: "#4a90e2",
    fontWeight: "600",
  },
});

export default BusDetails;