import { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";

import useBusStore from "../store/useBusStore";
import useAuthStore from "../store/useAuthStore";
import { getRouteData } from "../services/getdata";
import { calculateDistance, getBusStatus } from "../helpers/calculations";
import { isEveningNow, formatTime } from "../helpers/timeHelpers";
import {
  reverseRouteWithDistances,
  fetchDriverDetails,
} from "../services/busTrackingService";
import { useBusTracking } from "../hooks/useBusTracking";

import HeaderSection from "../components/BusDetails/HeaderSection";
import RouteTab from "../components/BusDetails/RouteTab";
import DetailsTab from "../components/BusDetails/DetailsTab";
import LoadingComponent from "../components/LoadingComponent";
import UnavailableBusScreen from "../components/UnavailableBusScreen";

const BusDetails = ({ route }) => {
  const { busID } = route.params;
  const [routeData, setRouteData] = useState(null);
  const [activeTab, setActiveTab] = useState("route");
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [driver, setDriver] = useState(null);

  const blinkAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lastConfirmedStopRef = useRef(-1);

  const { buses } = useBusStore();
  const { refreshToken } = useAuthStore();
  const busData = buses.find((bus) => bus.busid === busID);

  // Get displayed stops (forward or reversed based on time)
  const displayedStops = (() => {
    if (!routeData?.stops) return [];
    if (isEveningNow()) {
      return reverseRouteWithDistances(routeData.stops, calculateDistance);
    }
    return routeData.stops;
  })();

  // Use custom tracking hook
  const {
    busInfo,
    isOnline,
    currentStopIdx,
    nextStop,
    eta,
    loading: trackingLoading,
    distanceToNext,
  } = useBusTracking(busID, displayedStops, refreshToken, lastConfirmedStopRef);

  // Load static route data
  useEffect(() => {
    const loadRoute = async () => {
      const data = await getRouteData(busID);
      setRouteData(data);
    };
    loadRoute();
  }, [busID]);

  // Load driver details
  useEffect(() => {
    const loadDriver = async () => {
      const driverData = await fetchDriverDetails(busID);
      setDriver(driverData);
    };
    loadDriver();
  }, [busID]);

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
      ]),
    );

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
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
      ]),
    );

    blink.start();
    pulse.start();

    return () => {
      blink.stop();
      pulse.stop();
    };
  }, [activeTab, blinkAnim, pulseAnim]);

  // Speak next stop announcement
  useEffect(() => {
    if (currentStopIdx < 0 || displayedStops.length === 0) return;
    const stop = displayedStops[currentStopIdx];
    if (!stop) return;

    const status = getBusStatus(busInfo?.speed || 0, isOnline);
    if (status.text !== "Parked") {
      Speech.speak(`Next stop is ${stop.name}`);
    }
  }, [currentStopIdx, busInfo?.speed, isOnline, displayedStops]);

  // Check if bus is unavailable
  useEffect(() => {
    if (busData?.isNotAvailable) {
      setShowUnavailable(true);
    } else {
      setShowUnavailable(false);
    }
  }, [busData]);

  // Loading state
  if (!routeData || trackingLoading) {
    return (
      <View style={{ flex: 1 }}>
        <LoadingComponent />
      </View>
    );
  }

  // Unavailable state
  if (showUnavailable) {
    return <UnavailableBusScreen busData={busData} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <HeaderSection
        busId={busID}
        routeName={routeData?.routeName}
        busInfo={busInfo}
        isOnline={isOnline}
      />

      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab("route")}
          style={[styles.tabButton, activeTab === "route" && styles.activeTab]}
        >
          <Ionicons
            name="map-outline"
            size={20}
            color={activeTab === "route" ? "#0bc1bf" : "#94A3B8"}
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
          onPress={() => setActiveTab("details")}
          style={[
            styles.tabButton,
            activeTab === "details" && styles.activeTab,
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={activeTab === "details" ? "#0bc1bf" : "#94A3B8"}
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

      {/* Content */}
      <View style={styles.contentContainer}>
        {activeTab === "route" ? (
          <RouteTab
            stops={displayedStops}
            currentStopIdx={currentStopIdx}
            blinkAnim={blinkAnim}
            pulseAnim={pulseAnim}
          />
        ) : (
          <DetailsTab
            busInfo={busInfo}
            isOnline={isOnline}
            eta={eta}
            distanceToNext={distanceToNext}
            currentStopIdx={currentStopIdx}
            nextStop={nextStop}
            driver={driver}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    backgroundColor: "#f0fdfa",
  },
  tabDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  tabText: {
    fontWeight: "600",
    color: "#94A3B8",
    fontSize: 14,
  },
  activeTabText: {
    color: "#0bc1bf",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
});

export default BusDetails;
