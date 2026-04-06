import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { calculateDistance } from "../helper/Calculations";
import {
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
} from "../services/routeService";

const { width, height } = Dimensions.get("window");
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

// Loading Component
const LoadingSpinner = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#0bc1bf" />
    <Text style={styles.loadingText}>Loading routes...</Text>
  </View>
);

// Individual Route Card Component
const RouteCard = ({ item, index, onView, onEdit, onDelete }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const totalDistance =
    item.stops && item.stops.length > 0
      ? item.stops[item.stops.length - 1]?.cumulative_km_to_next || 0
      : 0;

  return (
    <Animated.View
      style={[
        styles.routeCard,
        {
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <LinearGradient
        colors={["#ffffff", "#f8f9fa"]}
        style={styles.routeCardGradient}
      >
        <View style={styles.routeCardHeader}>
          <View style={styles.routeIconContainer}>
            <LinearGradient
              colors={["#0bc1bf", "#089b99"]}
              style={styles.routeIconGradient}
            >
              <Ionicons name="bus-outline" size={wp(6)} color="#fff" />
            </LinearGradient>
          </View>
          <View style={styles.routeHeaderInfo}>
            <Text style={styles.routeDeviceId}>
              {item.deviceId || item.busID}
            </Text>
            <View style={styles.routeBadge}>
              <Ionicons name="location-outline" size={12} color="#0bc1bf" />
              <Text style={styles.routeStopsCount}>
                {item.stops?.length || 0} stops
              </Text>
            </View>
          </View>
          <View style={styles.routeDistanceBadge}>
            <Text style={styles.routeDistanceText}>
              {totalDistance.toFixed(1)} km
            </Text>
          </View>
        </View>

        <Text style={styles.routeName}>{item.routeName}</Text>

        <View style={styles.routeActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => onView(item)}
          >
            <Ionicons name="eye-outline" size={18} color="#0bc1bf" />
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit(item)}
          >
            <Ionicons name="create-outline" size={18} color="#ff9800" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(item.id || item._id)}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// Route List View Component
function RouteListView({ savedRoutes, onEdit, onDelete, onCreateNew, onView }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0bc1bf", "#089b99"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Route Commander</Text>
          <Text style={styles.headerSubtitle}>Manage your bus routes</Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={onCreateNew}>
          <LinearGradient
            colors={["#ffffff", "#f0f0f0"]}
            style={styles.createButtonGradient}
          >
            <Ionicons name="add-circle-outline" size={20} color="#0bc1bf" />
            <Text style={styles.createButtonText}>New Route</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {savedRoutes.length === 0 ? (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={["#f8f9fa", "#ffffff"]}
              style={styles.emptyStateGradient}
            >
              <Ionicons name="map-outline" size={wp(15)} color="#0bc1bf" />
              <Text style={styles.emptyStateTitle}>No Routes Yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Create your first route to get started
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={onCreateNew}
              >
                <LinearGradient
                  colors={["#0bc1bf", "#089b99"]}
                  style={styles.emptyStateButtonGradient}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.emptyStateButtonText}>Create Route</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : (
          <FlatList
            data={savedRoutes}
            keyExtractor={(item) => (item.id || item._id)?.toString()}
            contentContainerStyle={styles.routeList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <RouteCard
                item={item}
                index={index}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )}
          />
        )}
      </Animated.View>
    </View>
  );
}

// Route Detail View Component
function RouteDetailView({ route, onBack }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const hasStops = route?.stops?.length > 0;
  const [selectedStop, setSelectedStop] = useState(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const coordinates =
    route.stops?.map((stop) => ({
      latitude: stop.lat,
      longitude: stop.lng,
    })) || [];

  return (
    <View style={styles.detailContainer}>
      <MapView
        style={styles.detailMap}
        initialRegion={{
          latitude: hasStops ? route.stops[0].lat : 8.6631,
          longitude: hasStops ? route.stops[0].lng : 77.5691,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {route.stops?.map((stop, index) => (
          <Marker
            key={`marker-${index}`}
            coordinate={{ latitude: stop.lat, longitude: stop.lng }}
            title={stop.name}
            onPress={() => setSelectedStop({ ...stop, index })}
          >
            <LinearGradient
              colors={
                index === 0
                  ? ["#00e0ff", "#00b8d4"]
                  : index === route.stops.length - 1
                    ? ["#ff6b6b", "#ff5252"]
                    : ["#0bc1bf", "#089b99"]
              }
              style={styles.markerContainer}
            >
              <Text style={styles.markerText}>{index + 1}</Text>
            </LinearGradient>
          </Marker>
        ))}
        {coordinates.length > 1 && (
          <Polyline
            coordinates={coordinates}
            strokeColor="#0bc1bf"
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>

      <Animated.View
        style={[
          styles.detailPanel,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={["#ffffff", "#f8f9fa"]}
          style={styles.detailPanelGradient}
        >
          <View style={styles.detailHeader}>
            <TouchableOpacity onPress={onBack} style={styles.detailBackButton}>
              <Ionicons name="arrow-back" size={24} color="#0bc1bf" />
            </TouchableOpacity>
            <Text style={styles.detailTitle}>Route Details</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            <View style={styles.detailInfoCard}>
              <View style={styles.detailInfoRow}>
                <Ionicons
                  name="hardware-chip-outline"
                  size={20}
                  color="#0bc1bf"
                />
                <View style={styles.detailInfoContent}>
                  <Text style={styles.detailInfoLabel}>Device ID</Text>
                  <Text style={styles.detailInfoValue}>
                    {route.deviceId || route.busID}
                  </Text>
                </View>
              </View>

              <View style={styles.detailInfoRow}>
                <Ionicons name="map-outline" size={20} color="#0bc1bf" />
                <View style={styles.detailInfoContent}>
                  <Text style={styles.detailInfoLabel}>Route Name</Text>
                  <Text style={styles.detailInfoValue}>{route.routeName}</Text>
                </View>
              </View>

              <View style={styles.detailInfoRow}>
                <Ionicons name="analytics-outline" size={20} color="#0bc1bf" />
                <View style={styles.detailInfoContent}>
                  <Text style={styles.detailInfoLabel}>Total Distance</Text>
                  <Text style={styles.detailInfoValue}>
                    {route.stops?.[route.stops.length - 1]
                      ?.cumulative_km_to_next || 0}{" "}
                    km
                  </Text>
                </View>
              </View>

              <View style={styles.detailInfoRow}>
                <Ionicons name="pin-outline" size={20} color="#0bc1bf" />
                <View style={styles.detailInfoContent}>
                  <Text style={styles.detailInfoLabel}>Total Stops</Text>
                  <Text style={styles.detailInfoValue}>
                    {route.stops?.length || 0}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.stopsSectionTitle}>
              <Ionicons name="list-outline" size={18} color="#0bc1bf" /> Stop
              List
            </Text>

            {route.stops?.map((stop, index) => (
              <Animated.View key={`stop-${index}`} style={styles.stopCard}>
                <LinearGradient
                  colors={["#ffffff", "#fafafa"]}
                  style={styles.stopCardGradient}
                >
                  <View style={styles.stopNumber}>
                    <LinearGradient
                      colors={["#0bc1bf", "#089b99"]}
                      style={styles.stopNumberGradient}
                    >
                      <Text style={styles.stopNumberText}>{index + 1}</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.stopInfo}>
                    <Text style={styles.stopName}>{stop.name}</Text>
                    <Text style={styles.stopCoordinates}>
                      📍 {stop.lat?.toFixed(4)}, {stop.lng?.toFixed(4)}
                    </Text>
                    {stop.to_next_distance_km > 0 && (
                      <Text style={styles.stopDistance}>
                        ➜ Next stop: {stop.to_next_distance_km} km
                      </Text>
                    )}
                  </View>
                  <Ionicons
                    name="navigate-circle-outline"
                    size={24}
                    color="#0bc1bf"
                  />
                </LinearGradient>
              </Animated.View>
            ))}
          </ScrollView>
        </LinearGradient>
      </Animated.View>

      {/* Stop Details Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={selectedStop !== null}
        onRequestClose={() => setSelectedStop(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedStop(null)}
        >
          <Animated.View style={styles.modalContent}>
            {selectedStop && (
              <>
                <LinearGradient
                  colors={["#0bc1bf", "#089b99"]}
                  style={styles.modalHeader}
                >
                  <Text style={styles.modalTitle}>Stop Details</Text>
                  <TouchableOpacity onPress={() => setSelectedStop(null)}>
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </LinearGradient>
                <View style={styles.modalBody}>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Stop Number</Text>
                    <Text style={styles.modalValue}>
                      {selectedStop.index + 1}
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Stop Name</Text>
                    <Text style={styles.modalValue}>{selectedStop.name}</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Coordinates</Text>
                    <Text style={styles.modalValue}>
                      {selectedStop.lat?.toFixed(6)},{" "}
                      {selectedStop.lng?.toFixed(6)}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Map Route Creation/Edit View
function MapRouteView({ isEditing, onBack, onSave, initialRoute }) {
  const [deviceId, setDeviceId] = useState(
    initialRoute?.deviceId || initialRoute?.busID || "",
  );
  const [routeName, setRouteName] = useState(initialRoute?.routeName || "");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [stops, setStops] = useState(
    initialRoute?.stops
      ? initialRoute.stops.map((stop, idx) => ({
          id: `${Date.now()}-${idx}-${Math.random()}`,
          name: stop.name,
          latitude: stop.lat,
          longitude: stop.lng,
        }))
      : [],
  );
  const [stopName, setStopName] = useState("");
  const [saving, setSaving] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    setStopName(`Stop ${stops.length + 1}`);
  };

  const addStop = () => {
    if (!selectedLocation) return;

    const newStop = {
      id: `${Date.now()}-${Math.random()}`,
      name: stopName || `Stop ${stops.length + 1}`,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
    };

    setStops((prev) => [...prev, newStop]);
    setSelectedLocation(null);
    setStopName("");
  };

  const deleteStop = (id) => {
    Alert.alert("Remove Stop", "Are you sure you want to remove this stop?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        onPress: () =>
          setStops((prev) => prev.filter((stop) => stop.id !== id)),
        style: "destructive",
      },
    ]);
  };

  const clearSelection = () => {
    setSelectedLocation(null);
    setStopName("");
  };

  const moveStop = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= stops.length) return;
    const newStops = [...stops];
    const [moved] = newStops.splice(fromIndex, 1);
    newStops.splice(toIndex, 0, moved);
    setStops(newStops);
  };

  const handleSave = async () => {
    if (!deviceId || !routeName || stops.length === 0) {
      Alert.alert(
        "Missing Information",
        "Please fill in all fields and add at least one stop.",
      );
      return;
    }

    setSaving(true);

    let cumulative = 0;
    const formattedStops = stops.map((stop, index) => {
      const next = stops[index + 1];
      let distance = 0;

      if (next) {
        distance = calculateDistance(
          stop.latitude,
          stop.longitude,
          next.latitude,
          next.longitude,
        );
        distance = Number(distance || 0);
        cumulative += distance;
      }

      return {
        name: stop.name,
        lat: stop.latitude,
        lng: stop.longitude,
        isStartingPoint: index === 0,
        m: index,
        nextStop: next ? next.name : null,
        to_next_distance_km: distance > 0 ? Number(distance.toFixed(3)) : 0,
        cumulative_km_to_next: Number(cumulative.toFixed(3)),
      };
    });

    const finalData = {
      id: initialRoute?.id || initialRoute?._id,
      deviceId,
      routeName,
      stops: formattedStops,
    };

    await onSave(finalData);
    setSaving(false);
  };

  const coordinates = stops.map((stop) => ({
    latitude: stop.latitude,
    longitude: stop.longitude,
  }));

  const isFormValid = deviceId && routeName && stops.length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.mapContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 8.6631,
          longitude: 77.5691,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handleMapPress}
      >
        {selectedLocation && (
          <Marker coordinate={selectedLocation}>
            <LinearGradient
              colors={["#00e0ff", "#00b8d4"]}
              style={styles.selectedMarker}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </LinearGradient>
          </Marker>
        )}
        {stops.map((stop, index) => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
          >
            <LinearGradient
              colors={
                index === 0
                  ? ["#00e0ff", "#00b8d4"]
                  : index === stops.length - 1
                    ? ["#ff6b6b", "#ff5252"]
                    : ["#0bc1bf", "#089b99"]
              }
              style={styles.markerContainer}
            >
              <Text style={styles.markerText}>{index + 1}</Text>
            </LinearGradient>
          </Marker>
        ))}
        {coordinates.length > 1 && (
          <Polyline
            coordinates={coordinates}
            strokeColor="#0bc1bf"
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>

      <Animated.View
        style={[
          styles.mapPanel,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={["#ffffff", "#f8f9fa"]}
          style={styles.mapPanelGradient}
        >
          <View style={styles.mapHeader}>
            <TouchableOpacity onPress={onBack} style={styles.mapBackButton}>
              <Ionicons name="arrow-back" size={24} color="#0bc1bf" />
            </TouchableOpacity>
            <Text style={styles.mapTitle}>
              {isEditing ? "Edit Route" : "Create Route"}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            style={{ maxHeight: hp(50) }}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Device ID</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="hardware-chip-outline"
                  size={20}
                  color="#0bc1bf"
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., BUS101"
                  placeholderTextColor="#999"
                  value={deviceId}
                  onChangeText={setDeviceId}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Route Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="map-outline" size={20} color="#0bc1bf" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., City Express"
                  placeholderTextColor="#999"
                  value={routeName}
                  onChangeText={setRouteName}
                />
              </View>
            </View>

            {selectedLocation ? (
              <View style={styles.selectionCard}>
                <LinearGradient
                  colors={["#e8f4f3", "#ffffff"]}
                  style={styles.selectionCardGradient}
                >
                  <Text style={styles.selectionTitle}>Add New Stop</Text>
                  <Text style={styles.coordinates}>
                    📍 {selectedLocation.latitude.toFixed(5)},{" "}
                    {selectedLocation.longitude.toFixed(5)}
                  </Text>
                  <TextInput
                    style={styles.stopNameInput}
                    value={stopName}
                    onChangeText={setStopName}
                    placeholder="Stop name"
                    placeholderTextColor="#999"
                  />
                  <View style={styles.selectionActions}>
                    <TouchableOpacity
                      style={[styles.selectionButton, styles.cancelButton]}
                      onPress={clearSelection}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.selectionButton, styles.addButton]}
                      onPress={addStop}
                    >
                      <Ionicons name="add" size={20} color="#fff" />
                      <Text style={styles.addButtonText}>Add Stop</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            ) : (
              <View style={styles.hintCard}>
                <Ionicons
                  name="finger-print-outline"
                  size={24}
                  color="#0bc1bf"
                />
                <Text style={styles.hintText}>Tap on the map to add stops</Text>
              </View>
            )}

            <View style={styles.stopsHeader}>
              <Text style={styles.stopsHeaderText}>
                <Ionicons name="layers-outline" size={18} color="#0bc1bf" />{" "}
                Stops ({stops.length})
              </Text>
            </View>

            {stops.map((item, index) => (
              <Animated.View key={item.id} style={styles.editableStopCard}>
                <LinearGradient
                  colors={["#ffffff", "#fafafa"]}
                  style={styles.editableStopGradient}
                >
                  <View style={styles.editableStopNumber}>
                    <LinearGradient
                      colors={["#0bc1bf", "#089b99"]}
                      style={styles.editableStopNumberGradient}
                    >
                      <Text style={styles.editableStopNumberText}>
                        {index + 1}
                      </Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.editableStopInfo}>
                    <Text style={styles.editableStopName}>{item.name}</Text>
                    <Text style={styles.editableStopCoords}>
                      {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                    </Text>
                  </View>
                  <View style={styles.editableStopActions}>
                    {index > 0 && (
                      <TouchableOpacity
                        style={styles.moveUpButton}
                        onPress={() => moveStop(index, index - 1)}
                      >
                        <Ionicons name="arrow-up" size={18} color="#fff" />
                      </TouchableOpacity>
                    )}
                    {index < stops.length - 1 && (
                      <TouchableOpacity
                        style={styles.moveDownButton}
                        onPress={() => moveStop(index, index + 1)}
                      >
                        <Ionicons name="arrow-down" size={18} color="#fff" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.removeStopButton}
                      onPress={() => deleteStop(item.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </Animated.View>
            ))}
            <View style={{ height: hp(8) }} />
          </ScrollView>

          {/* Save Button */}
          <View style={styles.saveButtonContainer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                !isFormValid && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={saving || !isFormValid}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  !isFormValid ? ["#ccc", "#bbb"] : ["#0bc1bf", "#089b99"]
                }
                style={styles.saveButtonGradient}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={22} color="#fff" />
                    <Text style={styles.saveButtonText}>
                      {isEditing ? "UPDATE ROUTE" : "CREATE ROUTE"}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

// Main MapScreen Component
export default function MapScreen() {
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [currentView, setCurrentView] = useState("routeList");
  const [editingRoute, setEditingRoute] = useState(null);
  const [viewingRoute, setViewingRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await getRoutes();
      if (!data) return;

      // Handle both _id and id formats
      const formatted = Array.isArray(data)
        ? data.map((route) => ({
            id: route._id || route.id,
            deviceId: route.busID || route.deviceId,
            routeName: route.routeName,
            stops: route.stops || [],
          }))
        : [];

      setSavedRoutes(formatted);
    } catch (err) {
      console.log("Load routes error:", err);
      Alert.alert(
        "Error",
        "Failed to load routes. Please check your connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingRoute(null);
    setCurrentView("mapRoute");
  };

  const handleEditRoute = (route) => {
    setEditingRoute(route);
    setCurrentView("mapRoute");
  };

  const handleViewRoute = (route) => {
    setViewingRoute(route);
    setCurrentView("routeDetail");
  };

  const handleBackFromMap = () => {
    setCurrentView("routeList");
    setEditingRoute(null);
  };

  const handleBackFromDetail = () => {
    setCurrentView("routeList");
    setViewingRoute(null);
  };

  const handleSaveRoute = async (finalData) => {
    try {
      console.log("=== SAVING ROUTE ===");

      const payload = {
        busID: finalData.deviceId,
        routeName: finalData.routeName,
        stops: finalData.stops,
      };

      if (editingRoute) {
        await updateRoute(editingRoute.id, payload);
        Alert.alert("Success", "Route updated successfully!");
      } else {
        await createRoute(payload);
        Alert.alert("Success", "Route created successfully!");
      }

      await loadRoutes();
      setCurrentView("routeList");
    } catch (err) {
      console.log("Save route error:", err);
      Alert.alert(
        "Error",
        err.message || "Failed to save route. Please try again.",
      );
    }
  };

  const handleDeleteRoute = (routeId) => {
    Alert.alert("Delete Route", "Are you sure you want to delete this route?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await deleteRoute(routeId);
            await loadRoutes();
            Alert.alert("Success", "Route deleted successfully!");
          } catch (err) {
            console.log(err);
            Alert.alert("Error", "Failed to delete route. Please try again.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  if (loading && savedRoutes.length === 0 && currentView === "routeList") {
    return <LoadingSpinner />;
  }

  if (currentView === "mapRoute") {
    return (
      <MapRouteView
        isEditing={!!editingRoute}
        onBack={handleBackFromMap}
        onSave={handleSaveRoute}
        initialRoute={editingRoute}
      />
    );
  }

  if (currentView === "routeDetail") {
    return (
      <RouteDetailView route={viewingRoute} onBack={handleBackFromDetail} />
    );
  }

  return (
    <RouteListView
      savedRoutes={savedRoutes}
      onView={handleViewRoute}
      onEdit={handleEditRoute}
      onDelete={handleDeleteRoute}
      onCreateNew={handleCreateNew}
    />
  );
}
// Styles
const styles = StyleSheet.create({
  // Common
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? hp(5) : hp(8),
    paddingHorizontal: wp(5),
    paddingBottom: hp(3),
    borderBottomLeftRadius: wp(5),
    borderBottomRightRadius: wp(5),
  },
  headerContent: {
    marginBottom: hp(2),
  },
  headerTitle: {
    fontSize: wp(6),
    fontWeight: "800",
    color: "#fff",
    marginBottom: hp(0.5),
  },
  headerSubtitle: {
    fontSize: wp(3.5),
    color: "rgba(255,255,255,0.9)",
  },
  createButton: {
    position: "absolute",
    right: wp(5),
    top: Platform.OS === "ios" ? hp(5) : hp(8),
  },
  createButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: wp(5),
    gap: wp(1.5),
  },
  createButtonText: {
    color: "#0bc1bf",
    fontWeight: "600",
    fontSize: wp(3.5),
  },
  content: {
    flex: 1,
  },
  routeList: {
    padding: wp(4),
  },
  routeCard: {
    marginBottom: hp(2),
    borderRadius: wp(4),
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  routeCardGradient: {
    padding: wp(4),
  },
  routeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.5),
  },
  routeIconContainer: {
    marginRight: wp(3),
  },
  routeIconGradient: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  routeHeaderInfo: {
    flex: 1,
  },
  routeDeviceId: {
    fontSize: wp(4),
    fontWeight: "700",
    color: "#333",
    marginBottom: hp(0.3),
  },
  routeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(1),
  },
  routeStopsCount: {
    fontSize: wp(3),
    color: "#0bc1bf",
    fontWeight: "500",
  },
  routeDistanceBadge: {
    backgroundColor: "#e8f4f3",
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    borderRadius: wp(3),
  },
  routeDistanceText: {
    fontSize: wp(3),
    fontWeight: "600",
    color: "#0bc1bf",
  },
  routeName: {
    fontSize: wp(4),
    color: "#666",
    marginBottom: hp(2),
  },
  routeActions: {
    flexDirection: "row",
    gap: wp(2),
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(1),
    borderRadius: wp(2),
    gap: wp(1.5),
  },
  viewButton: {
    backgroundColor: "#e8f4f3",
  },
  viewButtonText: {
    color: "#0bc1bf",
    fontWeight: "600",
    fontSize: wp(3.2),
  },
  editButton: {
    backgroundColor: "#fff3e0",
  },
  editButtonText: {
    color: "#ff9800",
    fontWeight: "600",
    fontSize: wp(3.2),
  },
  deleteButton: {
    backgroundColor: "#fee",
  },
  deleteButtonText: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: wp(3.2),
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: wp(8),
  },
  emptyStateGradient: {
    alignItems: "center",
    padding: wp(8),
    borderRadius: wp(5),
    width: "100%",
  },
  emptyStateTitle: {
    fontSize: wp(5),
    fontWeight: "700",
    color: "#333",
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  emptyStateSubtitle: {
    fontSize: wp(3.5),
    color: "#666",
    textAlign: "center",
    marginBottom: hp(3),
  },
  emptyStateButton: {
    borderRadius: wp(3),
    overflow: "hidden",
  },
  emptyStateButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    gap: wp(2),
  },
  emptyStateButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: wp(3.5),
  },
  mapContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    flex: 1,
  },
  mapPanel: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    maxHeight: "75%",
    borderTopLeftRadius: wp(6),
    borderTopRightRadius: wp(6),
    overflow: "hidden",
  },
  mapPanelGradient: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(2),
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(2),
  },
  mapBackButton: {
    padding: wp(2),
  },
  mapTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#333",
  },
  inputGroup: {
    marginBottom: hp(2),
  },
  inputLabel: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: "#333",
    marginBottom: hp(0.8),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: wp(3),
    paddingHorizontal: wp(3),
    gap: wp(2),
  },
  input: {
    flex: 1,
    paddingVertical: hp(1.5),
    fontSize: wp(3.8),
    color: "#333",
  },
  selectionCard: {
    marginBottom: hp(2),
    borderRadius: wp(3),
    overflow: "hidden",
  },
  selectionCardGradient: {
    padding: wp(3),
  },
  selectionTitle: {
    fontSize: wp(3.8),
    fontWeight: "600",
    color: "#0bc1bf",
    marginBottom: hp(1),
  },
  coordinates: {
    fontSize: wp(3.2),
    color: "#666",
    marginBottom: hp(1.5),
  },
  stopNameInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: wp(2),
    padding: wp(2.5),
    fontSize: wp(3.5),
    marginBottom: hp(1.5),
  },
  selectionActions: {
    flexDirection: "row",
    gap: wp(2),
  },
  selectionButton: {
    flex: 1,
    paddingVertical: hp(1.2),
    borderRadius: wp(2),
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#0bc1bf",
    flexDirection: "row",
    justifyContent: "center",
    gap: wp(1.5),
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  hintCard: {
    backgroundColor: "#e8f4f3",
    borderRadius: wp(3),
    padding: wp(4),
    alignItems: "center",
    marginBottom: hp(2),
  },
  hintText: {
    fontSize: wp(3.5),
    color: "#0bc1bf",
    marginTop: hp(1),
  },
  stopsHeader: {
    marginBottom: hp(1.5),
  },
  stopsHeaderText: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#333",
  },
  editableStopCard: {
    marginBottom: hp(1.5),
    borderRadius: wp(3),
    overflow: "hidden",
  },
  editableStopGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp(3),
  },
  editableStopNumber: {
    marginRight: wp(3),
  },
  editableStopNumberGradient: {
    width: wp(7),
    height: wp(7),
    borderRadius: wp(3.5),
    justifyContent: "center",
    alignItems: "center",
  },
  editableStopNumberText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: wp(3.5),
  },
  editableStopInfo: {
    flex: 1,
  },
  editableStopName: {
    fontSize: wp(3.8),
    fontWeight: "600",
    color: "#333",
    marginBottom: hp(0.3),
  },
  editableStopCoords: {
    fontSize: wp(3),
    color: "#666",
  },
  editableStopActions: {
    flexDirection: "row",
    gap: wp(1),
  },
  moveUpButton: {
    backgroundColor: "#0bc1bf",
    padding: wp(1.5),
    borderRadius: wp(2),
  },
  moveDownButton: {
    backgroundColor: "#0bc1bf",
    padding: wp(1.5),
    borderRadius: wp(2),
  },
  removeStopButton: {
    backgroundColor: "#ef4444",
    padding: wp(1.5),
    borderRadius: wp(2),
  },
  saveButtonContainer: {
    paddingHorizontal: wp(4),
    paddingTop: hp(1.5),
    paddingBottom: Platform.OS === "ios" ? hp(3) : hp(2),
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  saveButton: {
    borderRadius: wp(3),
    overflow: "hidden",
    shadowColor: "#0bc1bf",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(1.8),
    gap: wp(2),
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: wp(4),
    letterSpacing: 1,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  detailMap: {
    flex: 1,
  },
  markerContainer: {
    width: wp(7),
    height: wp(7),
    borderRadius: wp(3.5),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  markerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: wp(3.5),
  },
  selectedMarker: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  detailPanel: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    maxHeight: "70%",
    borderTopLeftRadius: wp(6),
    borderTopRightRadius: wp(6),
    overflow: "hidden",
  },
  detailPanelGradient: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(2),
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(2),
  },
  detailBackButton: {
    padding: wp(2),
  },
  detailTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#333",
  },
  detailInfoCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(2),
  },
  detailInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
    marginBottom: hp(1.5),
  },
  detailInfoContent: {
    flex: 1,
  },
  detailInfoLabel: {
    fontSize: wp(3),
    color: "#666",
    marginBottom: hp(0.3),
  },
  detailInfoValue: {
    fontSize: wp(3.8),
    fontWeight: "600",
    color: "#333",
  },
  stopsSectionTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#333",
    marginBottom: hp(2),
  },
  stopCard: {
    marginBottom: hp(1.5),
    borderRadius: wp(3),
    overflow: "hidden",
  },
  stopCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp(3),
  },
  stopNumber: {
    marginRight: wp(3),
  },
  stopNumberGradient: {
    width: wp(7),
    height: wp(7),
    borderRadius: wp(3.5),
    justifyContent: "center",
    alignItems: "center",
  },
  stopNumberText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: wp(3.5),
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: wp(3.8),
    fontWeight: "600",
    color: "#333",
    marginBottom: hp(0.3),
  },
  stopCoordinates: {
    fontSize: wp(3),
    color: "#666",
    marginBottom: hp(0.3),
  },
  stopDistance: {
    fontSize: wp(3),
    color: "#0bc1bf",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: wp(85),
    backgroundColor: "#fff",
    borderRadius: wp(4),
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: wp(4),
  },
  modalTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#fff",
  },
  modalBody: {
    padding: wp(4),
  },
  modalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(1.5),
    paddingBottom: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalLabel: {
    fontSize: wp(3.5),
    color: "#666",
    fontWeight: "500",
  },
  modalValue: {
    fontSize: wp(3.8),
    color: "#333",
    fontWeight: "600",
  },
});
