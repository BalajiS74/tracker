import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  FlatList,
  TouchableOpacity,
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
  const [blinkAnim] = useState(new Animated.Value(1));
  const [busInfo, setBusInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("route");

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
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

  useEffect(() => {
    if (activeTab === "route") {
      blinkAnim.setValue(1);
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [activeTab]);

  if (!routeData || loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0097a7" />
        <Text style={{ marginTop: 16, color: "#0097a7" }}>Loading route data...</Text>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#e0f7fa" }}>
      <View style={{ flexDirection: "row", justifyContent: "center", padding: 8, backgroundColor: "#b2ebf2" }}>
        <TouchableOpacity onPress={() => setActiveTab("route")} style={{ marginHorizontal: 20 }}>
          <Text style={{ fontWeight: "bold", color: activeTab === "route" ? "#0097a7" : "#1976d2" }}>Route</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("details")} style={{ marginHorizontal: 20 }}>
          <Text style={{ fontWeight: "bold", color: activeTab === "details" ? "#0097a7" : "#1976d2" }}>Bus Details</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, padding: 20 }}>
        {activeTab === "route" && (
          <FlatList
            data={routeData.stops}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item, index }) => {
              let dotStyle = styles.dotUpcoming;
              let labelStyle = styles.labelUpcoming;
              let DotComponent = View;
              let dotProps = {};

              if (index < currentStopIdx) {
                dotStyle = styles.dotPast;
                labelStyle = styles.labelPast;
              } else if (index === currentStopIdx) {
                dotStyle = styles.dotCurrent;
                labelStyle = styles.labelCurrent;
                DotComponent = Animated.View;
                dotProps = { style: [styles.timelineDot, dotStyle, { opacity: blinkAnim }] };
              }

              return (
                <View style={styles.timelineRow}>
                  <View style={styles.timelineDotColumn}>
                    <DotComponent {...dotProps} style={[styles.timelineDot, dotStyle]} />
                    {index !== routeData.stops.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.timelineLabelColumn}>
                    <Text style={[styles.timelineLabel, labelStyle]}>{item.name}</Text>
                    <Text style={styles.timelineTime}>Lat: {item.lat}, Lng: {item.lng}</Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {activeTab === "details" && (
          <View>
            <Text>Status: {status}</Text>
            <Text>Location: {busInfo?.latitude?.toFixed(5)}, {busInfo?.longitude?.toFixed(5)}</Text>
            <Text>Speed: {busInfo?.speed?.toFixed(1)} km/h</Text>
            <Text>Heading: {busInfo?.heading}°</Text>
            <Text>Distance: {busInfo?.distance} m</Text>
            <Text>Fuel: {busInfo?.fuel}%</Text>
            <Text>Next Stop: {nextStop}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  timelineDotColumn: {
    width: 32,
    alignItems: "center",
  },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
  },
  dotCurrent: {
    backgroundColor: "#26c6da",
    borderColor: "#0097a7",
  },
  dotUpcoming: {
    backgroundColor: "#e0f7fa",
    borderColor: "#b2ebf2",
  },
  dotPast: {
    backgroundColor: "#b2dfdb",
    borderColor: "#80cbc4",
    opacity: 0.7,
  },
  timelineLine: {
    width: 4,
    flex: 1,
    backgroundColor: "#b2ebf2",
    borderRadius: 2,
    marginTop: 0,
  },
  timelineLabelColumn: {
    marginLeft: 16,
    flex: 1,
    justifyContent: "center",
  },
  timelineLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  labelCurrent: {
    color: "#0097a7",
    fontWeight: "bold",
  },
  labelUpcoming: {
    color: "#555",
  },
  labelPast: {
    color: "#aaa",
  },
  timelineTime: {
    fontSize: 14,
    color: "#1976d2",
    marginTop: 2,
  },
});

export default BusDetails;
