import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import useBusStore from "../store/useBusStore";
import { SafeAreaView } from "react-native-safe-area-context";

// Responsive helpers
const { width, height } = Dimensions.get("window");
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const AnnouncementPage = () => {
  const [busId, setBusId] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const { buses, loadBuses, toggleBus, toggleAllBuses } = useBusStore();

  // Load buses
  useEffect(() => {
    loadBuses();
  }, []);

  // Fade and scale animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Filter buses
  const filteredBuses = buses.filter((bus) => {
    if (filter === "available") return !bus.isNotAvailable;
    if (filter === "unavailable") return bus.isNotAvailable;
    return true;
  });

  const getStats = () => ({
    total: buses.length,
    available: buses.filter((b) => !b.isNotAvailable).length,
    unavailable: buses.filter((b) => b.isNotAvailable).length,
  });

  const stats = getStats();

  const handleMarkBus = (status) => {
    if (!busId.trim()) {
      alert("Please enter a Bus ID");
      return;
    }
    toggleBus(busId.trim(), status);
    setBusId("");
    Keyboard.dismiss();
  };

  const handleBusPress = (bus) => {
    setSelectedBus(bus);
    setModalVisible(true);
  };

  const StatCard = ({ label, value, icon, color }) => (
    <Animated.View
      style={[styles.statCard, { transform: [{ scale: scaleAnim }] }]}
    >
      <LinearGradient
        colors={[color + "15", color + "05"]}
        style={styles.statGradient}
      >
        <View
          style={[styles.statIconContainer, { backgroundColor: color + "20" }]}
        >
          <Ionicons name={icon} size={wp(5)} color={color} />
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </Animated.View>
  );

  const BusItem = ({ item, index }) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          delay: index * 100,
          easing: Easing.out(Easing.ease),
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

    return (
      <Animated.View
        style={[
          styles.busItem,
          {
            transform: [{ translateX: slideAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.busItemContent}
          onPress={() => handleBusPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.busIconContainer}>
            <LinearGradient
              colors={["#0bc1bf", "#0a9e9c"]}
              style={styles.busIconGradient}
            >
              <Ionicons name="bus-outline" size={wp(5)} color="#fff" />
            </LinearGradient>
          </View>
          <View style={styles.busInfo}>
            <Text style={styles.busId}>{item.busid}</Text>
            <View style={styles.routeContainer}>
              <Ionicons name="map-outline" size={wp(3)} color="#666" />
              <Text style={styles.busRoute}>{item.route}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.statusToggle,
              !item.isNotAvailable
                ? styles.availableToggle
                : styles.unavailableToggle,
            ]}
            onPress={() => toggleBus(item.busid, !item.isNotAvailable)}
          >
            <Ionicons
              name={!item.isNotAvailable ? "checkmark" : "close"}
              size={wp(3.5)}
              color="#fff"
            />
            <Text style={styles.toggleText}>
              {!item.isNotAvailable ? "Available" : "Off"}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Modern Header */}
              <LinearGradient
                colors={["#0bc1bf", "#089b99"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
              >
                <View style={styles.headerContent}>
                  <View>
                    <Text style={styles.title}>Bus Commander</Text>
                    <Text style={styles.subtitle}>
                      Real-time fleet management
                    </Text>
                  </View>
                  <View style={styles.headerBadge}>
                    <Ionicons
                      name="cellular-outline"
                      size={wp(5)}
                      color="#fff"
                    />
                    <Text style={styles.headerBadgeText}>Live</Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Stats Section */}
              <View style={styles.statsContainer}>
                <StatCard
                  label="Total Fleet"
                  value={stats.total}
                  icon="bus-outline"
                  color="#0bc1bf"
                />
                <StatCard
                  label="Available"
                  value={stats.available}
                  icon="checkmark-circle-outline"
                  color="#10B981"
                />
                <StatCard
                  label="Unavailable"
                  value={stats.unavailable}
                  icon="close-circle-outline"
                  color="#EF4444"
                />
              </View>

              {/* Quick Actions Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="flash-outline" size={wp(5)} color="#0bc1bf" />
                  <Text style={styles.sectionTitle}>Quick Actions</Text>
                </View>
                <View style={styles.actionGrid}>
                  <TouchableOpacity
                    style={[styles.actionCard, styles.dangerCard]}
                    onPress={() => toggleAllBuses(true)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={["#EF4444", "#dc2626"]}
                      style={styles.actionGradient}
                    >
                      <Ionicons name="close-circle" size={wp(6)} color="#fff" />
                      <Text style={styles.actionCardText}>
                        Mark All Unavailable
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionCard, styles.successCard]}
                    onPress={() => toggleAllBuses(false)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={["#10B981", "#059669"]}
                      style={styles.actionGradient}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={wp(6)}
                        color="#fff"
                      />
                      <Text style={styles.actionCardText}>
                        Mark All Available
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Individual Update Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="construct-outline"
                    size={wp(5)}
                    color="#0bc1bf"
                  />
                  <Text style={styles.sectionTitle}>Update Single Bus</Text>
                </View>
                <View style={styles.inputContainer}>
                  <Ionicons name="search-outline" size={wp(4.5)} color="#999" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Bus ID"
                    placeholderTextColor="#999"
                    value={busId}
                    onChangeText={setBusId}
                  />
                </View>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[styles.updateButton, styles.dangerButton]}
                    onPress={() => handleMarkBus(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="close-outline"
                      size={wp(4.5)}
                      color="#fff"
                    />
                    <Text style={styles.updateButtonText}>Set Unavailable</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.updateButton, styles.successButton]}
                    onPress={() => handleMarkBus(false)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="checkmark-outline"
                      size={wp(4.5)}
                      color="#fff"
                    />
                    <Text style={styles.updateButtonText}>Set Available</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Filter & Bus List Section */}
              <View style={[styles.section, styles.lastSection]}>
                <View style={styles.filterContainer}>
                  <Text style={styles.filterLabel}>Filter by:</Text>
                  <View style={styles.filterButtons}>
                    {[
                      { key: "all", label: "All", icon: "grid-outline" },
                      {
                        key: "available",
                        label: "Available",
                        icon: "checkmark-circle-outline",
                      },
                      {
                        key: "unavailable",
                        label: "Unavailable",
                        icon: "close-circle-outline",
                      },
                    ].map((f) => (
                      <TouchableOpacity
                        key={f.key}
                        style={[
                          styles.filterButton,
                          filter === f.key && styles.activeFilterButton,
                        ]}
                        onPress={() => setFilter(f.key)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={f.icon}
                          size={wp(3.5)}
                          color={filter === f.key ? "#0bc1bf" : "#666"}
                        />
                        <Text
                          style={[
                            styles.filterButtonText,
                            filter === f.key && styles.activeFilterText,
                          ]}
                        >
                          {f.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.busListHeader}>
                  <Ionicons name="list-outline" size={wp(4)} color="#0bc1bf" />
                  <Text style={styles.busListTitle}>Fleet Status</Text>
                  <Text style={styles.busCount}>
                    {filteredBuses.length} buses
                  </Text>
                </View>

                {filteredBuses.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="bus-outline" size={wp(15)} color="#ddd" />
                    <Text style={styles.emptyStateText}>No buses found</Text>
                    <Text style={styles.emptyStateSubtext}>
                      Try changing your filter
                    </Text>
                  </View>
                ) : (
                  filteredBuses.map((bus, index) => (
                    <BusItem key={bus.busid} item={bus} index={index} />
                  ))
                )}
              </View>
            </ScrollView>
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Modal for Bus Details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <Animated.View style={styles.modalContent}>
            {selectedBus && (
              <>
                <View style={styles.modalHeader}>
                  <LinearGradient
                    colors={["#0bc1bf", "#089b99"]}
                    style={styles.modalHeaderGradient}
                  >
                    <Ionicons name="bus" size={wp(8)} color="#fff" />
                    <Text style={styles.modalTitle}>{selectedBus.busid}</Text>
                  </LinearGradient>
                </View>
                <View style={styles.modalBody}>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="map-outline" size={wp(5)} color="#0bc1bf" />
                    <Text style={styles.modalInfoText}>
                      Route: {selectedBus.route}
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Ionicons
                      name={
                        !selectedBus.isNotAvailable
                          ? "checkmark-circle"
                          : "close-circle"
                      }
                      size={wp(5)}
                      color={
                        !selectedBus.isNotAvailable ? "#10B981" : "#EF4444"
                      }
                    />
                    <Text style={styles.modalInfoText}>
                      Status:{" "}
                      {!selectedBus.isNotAvailable
                        ? "Available"
                        : "Unavailable"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      !selectedBus.isNotAvailable
                        ? styles.modalDangerButton
                        : styles.modalSuccessButton,
                    ]}
                    onPress={() => {
                      toggleBus(selectedBus.busid, !selectedBus.isNotAvailable);
                      setModalVisible(false);
                    }}
                  >
                    <Ionicons
                      name={
                        !selectedBus.isNotAvailable
                          ? "close-outline"
                          : "checkmark-outline"
                      }
                      size={wp(5)}
                      color="#fff"
                    />
                    <Text style={styles.modalButtonText}>
                      Set as{" "}
                      {!selectedBus.isNotAvailable
                        ? "Unavailable"
                        : "Available"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    paddingBottom: hp(3),
  },
  header: {
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
    paddingBottom: hp(4),
    borderBottomLeftRadius: wp(5),
    borderBottomRightRadius: wp(5),
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    color: "#fff",
    fontSize: wp(7),
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: wp(3.5),
    marginTop: hp(0.5),
    fontWeight: "500",
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    borderRadius: wp(5),
    gap: wp(1),
  },
  headerBadgeText: {
    color: "#fff",
    fontSize: wp(3),
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    marginTop: hp(-3),
    marginBottom: hp(2),
  },
  statCard: {
    flex: 1,
    marginHorizontal: wp(1),
    borderRadius: wp(3),
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statGradient: {
    padding: wp(3),
    alignItems: "center",
    backgroundColor: "#fff",
  },
  statIconContainer: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(1),
  },
  statValue: {
    fontSize: wp(5.5),
    fontWeight: "800",
    marginBottom: hp(0.3),
  },
  statLabel: {
    fontSize: wp(3),
    color: "#666",
    fontWeight: "500",
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: wp(4),
    marginBottom: hp(2),
    padding: wp(4),
    borderRadius: wp(4),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  lastSection: {
    marginBottom: hp(2),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#000",
  },
  actionGrid: {
    gap: hp(1.5),
  },
  actionCard: {
    borderRadius: wp(3),
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: wp(3.5),
    gap: wp(2),
  },
  actionCardText: {
    color: "#fff",
    fontSize: wp(3.8),
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: wp(3),
    paddingHorizontal: wp(3),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  input: {
    flex: 1,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(2),
    fontSize: wp(3.8),
    color: "#000",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: wp(3),
  },
  updateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
    gap: wp(2),
  },
  dangerButton: {
    backgroundColor: "#EF4444",
  },
  successButton: {
    backgroundColor: "#10B981",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: wp(3.5),
    fontWeight: "600",
  },
  filterContainer: {
    marginBottom: hp(2),
  },
  filterLabel: {
    fontSize: wp(3.5),
    color: "#666",
    marginBottom: hp(1),
    fontWeight: "500",
  },
  filterButtons: {
    flexDirection: "row",
    gap: wp(2),
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(1),
    backgroundColor: "#F8F8F8",
    borderRadius: wp(3),
    gap: wp(1.5),
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  activeFilterButton: {
    backgroundColor: "#0bc1bf10",
    borderColor: "#0bc1bf",
  },
  filterButtonText: {
    fontSize: wp(3.2),
    color: "#666",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#0bc1bf",
  },
  busListHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(2),
    paddingBottom: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  busListTitle: {
    flex: 1,
    fontSize: wp(4),
    fontWeight: "600",
    color: "#000",
    marginLeft: wp(2),
  },
  busCount: {
    fontSize: wp(3.2),
    color: "#666",
    fontWeight: "500",
  },
  busItem: {
    marginBottom: hp(1.5),
  },
  busItemContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    padding: wp(3),
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  busIconContainer: {
    marginRight: wp(3),
  },
  busIconGradient: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: "center",
    alignItems: "center",
  },
  busInfo: {
    flex: 1,
  },
  busId: {
    fontSize: wp(4),
    fontWeight: "700",
    color: "#000",
    marginBottom: hp(0.3),
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(1),
  },
  busRoute: {
    fontSize: wp(3.2),
    color: "#666",
  },
  statusToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    borderRadius: wp(5),
    gap: wp(1.5),
  },
  availableToggle: {
    backgroundColor: "#10B981",
  },
  unavailableToggle: {
    backgroundColor: "#EF4444",
  },
  toggleText: {
    color: "#fff",
    fontSize: wp(3),
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: hp(5),
  },
  emptyStateText: {
    fontSize: wp(4),
    color: "#666",
    fontWeight: "600",
    marginTop: hp(2),
  },
  emptyStateSubtext: {
    fontSize: wp(3.2),
    color: "#999",
    marginTop: hp(0.5),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: wp(5),
    width: wp(85),
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalHeader: {
    overflow: "hidden",
  },
  modalHeaderGradient: {
    alignItems: "center",
    paddingVertical: hp(3),
    gap: hp(1),
  },
  modalTitle: {
    color: "#fff",
    fontSize: wp(6),
    fontWeight: "800",
  },
  modalBody: {
    padding: wp(5),
    gap: hp(2),
  },
  modalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
    paddingVertical: hp(1),
  },
  modalInfoText: {
    fontSize: wp(4),
    color: "#333",
    fontWeight: "500",
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
    gap: wp(2),
    marginTop: hp(1),
  },
  modalSuccessButton: {
    backgroundColor: "#10B981",
  },
  modalDangerButton: {
    backgroundColor: "#EF4444",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: wp(4),
    fontWeight: "600",
  },
});

export default AnnouncementPage;
