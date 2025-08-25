// AnnouncementPage.js - All Content Inside ScrollView
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { useBus } from "../context/BusContext";
import { Ionicons } from "@expo/vector-icons";

// Responsive functions
const { width, height } = Dimensions.get('window');
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const AnnouncementPage = () => {
  const { buses, toggleAllBuses, toggleBus } = useBus();
  const [busId, setBusId] = useState("");
  const [filter, setFilter] = useState("all");
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  // Filter buses
  const filteredBuses = buses.filter((bus) => {
    if (filter === "available") return !bus.isNotAvailable;
    if (filter === "unavailable") return bus.isNotAvailable;
    return true;
  });

  // ✅ Mark bus unavailable
  const handleMarkBus = () => {
    if (!busId.trim()) {
      alert("Please enter a Bus ID");
      return;
    }
    toggleBus(busId.trim(), true);
    setBusId("");
    Keyboard.dismiss();
  };

  // ✅ Mark bus available
  const handleUnmarkBus = () => {
    if (busId.trim()) {
      toggleBus(busId.trim(), false);
      setBusId("");
      Keyboard.dismiss();
    }
  };

  // Bus item component
  const BusItem = ({ item }) => (
    <View key={item.busid} style={styles.busItem}>
      <View style={styles.busInfo}>
        <Text style={[styles.busId, { fontSize: wp(4) }]}>
          {item.busid}
        </Text>
        <Text style={[styles.busRoute, { fontSize: wp(3.5) }]}>
          {item.route}
        </Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          item.isNotAvailable
            ? styles.statusUnavailable
            : styles.statusAvailable,
        ]}
      >
        <Ionicons
          name={item.isNotAvailable ? "close-circle" : "checkmark-circle"}
          size={wp(4)}
          color="#fff"
        />
        <Text
          style={[
            styles.statusText,
            {
              fontSize: wp(3),
            },
          ]}
        >
          {item.isNotAvailable ? "Not Available" : "Available"}
        </Text>
      </View>
    </View>
  );

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search" size={wp(10)} color="#E5E5E5" />
      <Text style={[styles.emptyStateText, { fontSize: wp(4) }]}>
        No buses found
      </Text>
      <Text style={[styles.emptyStateSubtext, { fontSize: wp(3.5) }]}>
        Try changing your filter or check back later
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? hp(10) : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.ScrollView
            style={[styles.scrollView, { opacity: fadeAnim }]}
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header - Now inside ScrollView */}
            <View style={styles.header}>
              <View style={styles.headerGradient}>
                <Text style={[styles.title, { fontSize: wp(6) }]}>
                  Bus Availability
                </Text>
                <Text style={[styles.subtitle, { fontSize: wp(3.5) }]}>
                  Manage bus status in real-time
                </Text>
              </View>
            </View>

            {/* Stats Overview */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { fontSize: wp(5) }]}>{buses.length}</Text>
                <Text style={[styles.statLabel, { fontSize: wp(3) }]}>Total Buses</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, styles.statAvailable, { fontSize: wp(5) }]}>
                  {buses.filter(bus => !bus.isNotAvailable).length}
                </Text>
                <Text style={[styles.statLabel, { fontSize: wp(3) }]}>Available</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, styles.statUnavailable, { fontSize: wp(5) }]}>
                  {buses.filter(bus => bus.isNotAvailable).length}
                </Text>
                <Text style={[styles.statLabel, { fontSize: wp(3) }]}>Unavailable</Text>
              </View>
            </View>

            {/* Bulk Actions */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontSize: wp(4.5) }]}>
                Bulk Actions
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.markAllButton]}
                  onPress={() => toggleAllBuses(true)}
                >
                  <Ionicons
                    name="close-circle"
                    size={wp(5)}
                    color="#fff"
                  />
                  <Text
                    style={[styles.buttonText, { fontSize: wp(3.5) }]}
                  >
                    Mark All Unavailable
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.unmarkAllButton]}
                  onPress={() => toggleAllBuses(false)}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={wp(5)}
                    color="#fff"
                  />
                  <Text
                    style={[styles.buttonText, { fontSize: wp(3.5) }]}
                  >
                    Mark All Available
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Individual Bus */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontSize: wp(4.5) }]}>
                Update Individual Bus
              </Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="bus"
                  size={wp(5)}
                  color="#6C63FF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { fontSize: wp(4) }]}
                  placeholder="Enter Bus ID (e.g. BUS123)"
                  value={busId}
                  onChangeText={setBusId}
                  placeholderTextColor="#94A3B8"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.markButton,
                    !busId && styles.buttonDisabled,
                  ]}
                  onPress={handleMarkBus}
                  disabled={!busId}
                >
                  <Ionicons name="close" size={wp(4.5)} color="#fff" />
                  <Text
                    style={[styles.buttonText, { fontSize: wp(3.5) }]}
                  >
                    Mark Unavailable
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.unmarkButton,
                    !busId && styles.buttonDisabled,
                  ]}
                  onPress={handleUnmarkBus}
                  disabled={!busId}
                >
                  <Ionicons
                    name="checkmark"
                    size={wp(4.5)}
                    color="#fff"
                  />
                  <Text
                    style={[styles.buttonText, { fontSize: wp(3.5) }]}
                  >
                    Mark Available
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Filter & List */}
            <View style={styles.section}>
              <View style={styles.filterHeader}>
                <Text
                  style={[styles.sectionTitle, { fontSize: wp(4.5) }]}
                >
                  Bus List
                </Text>
                <View style={styles.filterRow}>
                  {[
                    { key: "all", label: "All" },
                    { key: "available", label: "Available" },
                    { key: "unavailable", label: "Unavailable" }
                  ].map((f) => (
                    <TouchableOpacity
                      key={f.key}
                      style={[
                        styles.filterButton,
                        filter === f.key && styles.filterButtonActive,
                      ]}
                      onPress={() => setFilter(f.key)}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          { fontSize: wp(3.5) },
                          filter === f.key && styles.filterTextActive,
                        ]}
                      >
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.busListContainer}>
                {filteredBuses.length === 0 ? (
                  <EmptyState />
                ) : (
                  filteredBuses.map((bus) => (
                    <View key={bus.busid}>
                      <BusItem item={bus} />
                      <View style={styles.separator} />
                    </View>
                  ))
                )}
              </View>
            </View>
          </Animated.ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: hp(3),
  },
  header: {
    backgroundColor: '#6C63FF',
    borderBottomLeftRadius: wp(5),
    borderBottomRightRadius: wp(5),
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerGradient: {
    paddingHorizontal: wp(5),
    paddingTop: hp(6), // Increased padding to account for status bar
    paddingBottom: hp(4),
  },
  title: {
    fontWeight: '800',
    color: '#fff',
    marginBottom: hp(0.5),
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: wp(5),
    marginBottom: hp(2.5),
    marginTop: hp(2), // Added margin top since header is now in scrollview
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(3.5),
    alignItems: 'center',
    flex: 1,
    marginHorizontal: wp(1.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontWeight: '700',
    color: '#6C63FF',
    marginBottom: hp(0.5),
  },
  statAvailable: {
    color: '#10B981',
  },
  statUnavailable: {
    color: '#EF4444',
  },
  statLabel: {
    color: '#64748B',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: wp(4),
    padding: wp(5),
    marginHorizontal: wp(5),
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: hp(1.5),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp(2.5),
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3.5),
    borderRadius: wp(2.5),
    gap: wp(2),
  },
  markAllButton: {
    backgroundColor: '#EF4444',
  },
  unmarkAllButton: {
    backgroundColor: '#10B981',
  },
  markButton: {
    backgroundColor: '#EF4444',
  },
  unmarkButton: {
    backgroundColor: '#10B981',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: wp(2.5),
    paddingHorizontal: wp(3.5),
    height: hp(6),
    marginBottom: hp(1.5),
  },
  inputIcon: {
    marginRight: wp(2.5),
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#1E293B',
    fontWeight: '500',
  },
  filterHeader: {
    marginBottom: hp(1.5),
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: wp(2.5),
    padding: wp(1),
    marginTop: hp(1),
  },
  filterButton: {
    flex: 1,
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#6C63FF',
  },
  filterText: {
    color: '#64748B',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  busListContainer: {
    borderRadius: wp(3),
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  busItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(3.5),
    backgroundColor: '#fff',
  },
  busInfo: {
    flex: 1,
  },
  busId: {
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: hp(0.5),
  },
  busRoute: {
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    borderRadius: wp(5),
    gap: wp(1.5),
  },
  statusAvailable: {
    backgroundColor: '#10B981',
  },
  statusUnavailable: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    color: '#fff',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: wp(3.5),
  },
  emptyState: {
    padding: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: '#64748B',
    fontWeight: '600',
    marginTop: hp(2),
    marginBottom: hp(0.5),
  },
  emptyStateSubtext: {
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default AnnouncementPage;