import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView,
  Animated,
  Easing,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { AuthContext } from "../context/AuthContext";

const { width, height } = Dimensions.get("window");

// Example bus list
const busList = [
  { id: "BUS123", name: "Scad to tvl" },
  { id: "BUS456", name: "Scad to kavalkinaru" },
  { id: "BUS789", name: "Scad to alangulam" },
  { id: "BUS1011", name: "Scad to KTC nagar" },
];

// Helper to load bus stops
const getRouteData = (busID) => {
  try {
    const files = {
      BUS123: require("../routedata/BUS123.json"),
      BUS456: require("../routedata/BUS456.json"),
      BUS789: require("../routedata/BUS789.json"),
      BUS1011: require("../routedata/BUS1011.json"),
    };
    return files[busID]?.stops || [];
  } catch {
    return [];
  }
};

const ReportScreen = () => {
  const { user, userToken } = useContext(AuthContext);
  const [reportType, setReportType] = useState("general");
  const [description, setDescription] = useState("");
  const [selectedBus, setSelectedBus] = useState("");
  const [selectedStop, setSelectedStop] = useState("");
  const [stopList, setStopList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("new");
  const [history, setHistory] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Animation for tab switch
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab]);

  // Replace localhost with your LAN IP if testing on device
  const BASE_URL = "https://trakerbackend.onrender.com"; // <-- Change to your PC's IP

  // Fetch user's reports safely
  const fetchHistory = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${BASE_URL}/api/reports/user/${user.id}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setHistory([]);
    }
  };

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
  }, [activeTab, user]);

  const handleSelectBus = (busID) => {
    setSelectedBus(busID);
    setSelectedStop("");
    setStopList(getRouteData(busID));
  };

  const handleSubmit = async () => {
    if (!description || !user) {
      Alert.alert("Error", "Please provide a description");
      return;
    }
    
    setIsSubmitting(true);

    try {
      await fetch(`${BASE_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          userId: user._id,
          reportType,
          description,
          busID: selectedBus || null,
          stopName: selectedStop || null,
        }),
      });
      setIsSuccessModalVisible(true);
      setDescription("");
      setSelectedBus("");
      setSelectedStop("");
      setStopList([]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved": return "#4CAF50";
      case "in progress": return "#FF9800";
      case "closed": return "#9E9E9E";
      default: return "#2196F3";
    }
  };

  const getReportTypeIcon = (type) => {
    switch (type) {
      case "general": return "chatbubble-outline";
      case "bus": return "bus-outline";
      case "safety": return "shield-checkmark-outline";
      case "driver": return "person-outline";
      default: return "document-text-outline";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Report an Issue</Text>
        <Text style={styles.headerSubtitle}>
          {activeTab === "new" 
            ? "Help us improve our service" 
            : "Your report history"}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["new", "history"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons 
              name={tab === "new" ? "add-circle-outline" : "time-outline"} 
              size={wp("5%")} 
              color={activeTab === tab ? "#fff" : "#6C63FF"} 
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab === "new" ? "New Report" : "History"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View 
            style={[
              styles.animatedContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            {activeTab === "new" ? (
              <View style={styles.formContainer}>
                {/* Report Type */}
                <Text style={styles.sectionTitle}>Report Type</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={reportType}
                    onValueChange={setReportType}
                    style={styles.picker}
                    dropdownIconColor="#6C63FF"
                  >
                    <Picker.Item label="General Feedback" value="general" />
                    <Picker.Item label="Bus Issue" value="bus" />
                    <Picker.Item label="Safety Concern" value="safety" />
                    <Picker.Item label="Driver Feedback" value="driver" />
                  </Picker>
                </View>

                {/* Bus Selector */}
                {(reportType === "bus" || reportType === "driver") && (
                  <>
                    <Text style={styles.sectionTitle}>Select Bus</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={selectedBus}
                        onValueChange={handleSelectBus}
                        style={styles.picker}
                        dropdownIconColor="#6C63FF"
                      >
                        <Picker.Item label="Select a bus" value="" />
                        {busList.map((bus) => (
                          <Picker.Item key={bus.id} label={bus.name} value={bus.id} />
                        ))}
                      </Picker>
                    </View>
                  </>
                )}

                {/* Stop Selector */}
                {stopList.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Select Stop (Optional)</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={selectedStop}
                        onValueChange={setSelectedStop}
                        style={styles.picker}
                        dropdownIconColor="#6C63FF"
                      >
                        <Picker.Item label="Select a stop" value="" />
                        {stopList.map((stop) => (
                          <Picker.Item
                            key={stop.name}
                            label={stop.name}
                            value={stop.name}
                          />
                        ))}
                      </Picker>
                    </View>
                  </>
                )}

                {/* Description */}
                <Text style={styles.sectionTitle}>Description</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.descriptionInput}
                    multiline
                    numberOfLines={5}
                    placeholder="Please provide details..."
                    value={description}
                    onChangeText={setDescription}
                    placeholderTextColor="#999"
                  />
                  <View style={styles.charCount}>
                    <Text style={styles.charCountText}>{description.length}/500</Text>
                  </View>
                </View>

                {/* Submit */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    isSubmitting && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <View style={styles.solidButton}>
                    {isSubmitting ? (
                      <Ionicons name="ios-hourglass" size={wp("5%")} color="#fff" />
                    ) : (
                      <Ionicons name="paper-plane-outline" size={wp("5%")} color="#fff" />
                    )}
                    <Text style={styles.submitButtonText}>
                      {isSubmitting ? "Submitting..." : "Submit Report"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.historyContainer}>
                {history.length === 0 ? (
                  <View style={styles.emptyHistory}>
                    <Ionicons
                      name="document-text-outline"
                      size={wp("20%")}
                      color="#e0e0e0"
                    />
                    <Text style={styles.emptyHistoryText}>
                      No report history yet
                    </Text>
                    <Text style={styles.emptyHistorySubtext}>
                      Submit your first report to see it here
                    </Text>
                  </View>
                ) : (
                  history.map((report) => (
                    <View key={report._id} style={styles.reportCard}>
                      <View style={styles.reportHeader}>
                        <View style={styles.reportTypeContainer}>
                          <Ionicons 
                            name={getReportTypeIcon(report.reportType)} 
                            size={wp("5%")} 
                            color="#6C63FF" 
                          />
                          <Text style={styles.reportType}>
                            {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)}
                          </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
                          <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                            {report.status || "Submitted"}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.reportDescription}>
                        {report.description}
                      </Text>
                      <Text style={styles.reportDate}>
                        {new Date(report.submittedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                      {report.response && (
                        <View style={styles.responseContainer}>
                          <View style={styles.responseHeader}>
                            <Ionicons name="checkmark-done-circle" size={wp("4%")} color="#4CAF50" />
                            <Text style={styles.responseTitle}>Admin Response:</Text>
                          </View>
                          <Text style={styles.responseText}>{report.response}</Text>
                        </View>
                      )}
                    </View>
                  ))
                )}
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal visible={isSuccessModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <Ionicons
                name="checkmark-circle"
                size={wp("20%")}
                color="#4CAF50"
              />
            </View>
            <Text style={styles.modalTitle}>Report Submitted</Text>
            <Text style={styles.modalText}>
              Thank you for your feedback! We'll review your report and take appropriate action.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setIsSuccessModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#6C63FF",
    paddingHorizontal: wp("5%"),
    paddingTop: hp("10%"),
    paddingBottom: hp("4%"),
    borderBottomLeftRadius: wp("5%"),
    borderBottomRightRadius: wp("5%"),
  },
  headerTitle: {
    fontSize: wp("6%"),
    fontWeight: "700",
    color: "#fff",
    marginBottom: hp("0.5%"),
  },
  headerSubtitle: {
    fontSize: wp("4%"),
    color: "rgba(255, 255, 255, 0.8)",
  },
  keyboardAvoid: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: wp("4%"),
    marginTop: hp("-2%"), // Positioned slightly over the header
    borderRadius: wp("3%"),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10, // Ensure it appears above other content
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: hp("1.8%"),
    alignItems: "center",
    justifyContent: "center",
    gap: wp("2%"),
  },
  activeTab: {
    backgroundColor: "#6C63FF",
  },
  tabText: {
    fontSize: wp("3.8%"),
    color: "#666",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp("4%"),
  },
  formContainer: {
    paddingHorizontal: wp("5%"),
    paddingTop: hp("3%"),
  },
  sectionTitle: {
    fontSize: wp("4.2%"),
    fontWeight: "600",
    color: "#6C63FF",
    marginBottom: hp("1.5%"),
    marginTop: hp("2%"),
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: wp("2.5%"),
    overflow: "hidden",
    backgroundColor: "#fff",
    marginBottom: hp("1%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    width: "100%",
    color: "#333",
  },
  inputContainer: {
    position: "relative",
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: wp("2.5%"),
    padding: wp("4%"),
    textAlignVertical: "top",
    backgroundColor: "#fff",
    fontSize: wp("4%"),
    color: "#333",
    minHeight: hp("15%"),
    marginBottom: hp("2%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  charCount: {
    position: "absolute",
    bottom: hp("3%"),
    right: wp("4%"),
  },
  charCountText: {
    fontSize: wp("3.5%"),
    color: "#999",
  },
  submitButton: {
    borderRadius: wp("2.5%"),
    overflow: "hidden",
    marginTop: hp("2%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  solidButton: {
    flexDirection: "row",
    padding: wp("4%"),
    alignItems: "center",
    justifyContent: "center",
    gap: wp("2%"),
    backgroundColor: "#6C63FF",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: wp("4.2%"),
    fontWeight: "600",
  },
  historyContainer: {
    paddingHorizontal: wp("4%"),
    paddingTop: hp("2%"),
  },
  reportCard: {
    backgroundColor: "#fff",
    borderRadius: wp("3%"),
    padding: wp("4%"),
    marginBottom: hp("2%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("1.5%"),
  },
  reportTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("2%"),
  },
  reportType: {
    fontSize: wp("4%"),
    fontWeight: "600",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.6%"),
    borderRadius: wp("2%"),
  },
  statusText: {
    fontSize: wp("3.2%"),
    fontWeight: "600",
  },
  reportDescription: {
    fontSize: wp("4%"),
    color: "#555",
    marginBottom: hp("1%"),
    lineHeight: hp("2.8%"),
  },
  reportDate: {
    fontSize: wp("3.5%"),
    color: "#888",
    marginBottom: hp("1.5%"),
  },
  responseContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: hp("1.5%"),
    marginTop: hp("1%"),
  },
  responseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("2%"),
    marginBottom: hp("1%"),
  },
  responseTitle: {
    fontSize: wp("3.8%"),
    fontWeight: "600",
    color: "#4CAF50",
  },
  responseText: {
    fontSize: wp("3.8%"),
    color: "#555",
    lineHeight: hp("2.8%"),
  },
  emptyHistory: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("15%"),
  },
  emptyHistoryText: {
    fontSize: wp("4.5%"),
    color: "#999",
    marginTop: hp("2%"),
    fontWeight: "600",
  },
  emptyHistorySubtext: {
    fontSize: wp("4%"),
    color: "#bbb",
    marginTop: hp("1%"),
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: wp("5%"),
    padding: wp("6%"),
    width: wp("85%"),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalIconContainer: {
    marginBottom: hp("2%"),
  },
  modalTitle: {
    fontSize: wp("5.5%"),
    fontWeight: "700",
    color: "#333",
    marginBottom: hp("1.5%"),
    textAlign: "center",
  },
  modalText: {
    fontSize: wp("4%"),
    color: "#666",
    textAlign: "center",
    marginBottom: hp("3%"),
    lineHeight: hp("3%"),
  },
  modalButton: {
    backgroundColor: "#6C63FF",
    paddingHorizontal: wp("8%"),
    paddingVertical: hp("1.8%"),
    borderRadius: wp("2.5%"),
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: wp("4.2%"),
    fontWeight: "600",
  },
});

export default ReportScreen;