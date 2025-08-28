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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { AuthContext } from "../context/AuthContext";

const { width } = Dimensions.get("window");

// ------------------------ Static Data ------------------------
const busList = [
  { id: "BUS123", name: "Scad to TVL" },
  { id: "BUS456", name: "Scad to Kavalkinaru" },
  { id: "BUS789", name: "Scad to Alangulam" },
  { id: "BUS1011", name: "Scad to KTC Nagar" },
];

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

// ------------------------ Main Component ------------------------
const ReportScreen = () => {
  const { user, apiRequest, accessToken, isLoading } = useContext(AuthContext);
  // console.log(user);

  const [reportType, setReportType] = useState("general");
  const [description, setDescription] = useState("");
  const [selectedBus, setSelectedBus] = useState("");
  const [selectedStop, setSelectedStop] = useState("");
  const [stopList, setStopList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState("new");
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [replyTexts, setReplyTexts] = useState({});

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [hiddenReports, setHiddenReports] = useState({});
  
  // ------------------------ Effects ------------------------
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

  useEffect(() => {
    if (!isLoading && activeTab === "history") {
      if (user?.role === "admin") fetchAllReports();
      else fetchHistory();
    }
  }, [activeTab, user, isLoading]);

  // ------------------------ Handlers ------------------------
  const fetchHistory = async () => {
    if (!user || !accessToken) return;

    setIsLoadingHistory(true);
    try {
      const data = await apiRequest(`/api/reports/user/${user.id}`);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch history error:", err.response?.data || err);
      setHistory([]);
      Alert.alert(
        "Error",
        err.response?.status === 403
          ? "You are not authorized to view report history."
          : "Failed to fetch report history."
      );
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchAllReports = async () => {
    if (!accessToken || user?.role !== "admin") return;

    setIsLoadingHistory(true);
    try {
      const data = await apiRequest("/api/reports/all"); // Admin sees all reports
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch all reports error:", err.response?.data || err);
      Alert.alert(
        "Error",
        err.response?.status === 403
          ? "You are not authorized to view all reports."
          : "Failed to fetch reports."
      );
      setHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSelectBus = (busID) => {
    setSelectedBus(busID);
    setSelectedStop("");
    setStopList(getRouteData(busID));
  };

  const handleSubmit = async () => {
    if (!accessToken) {
      Alert.alert("Error", "You are not logged in.");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Error", "Please provide a description.");
      return;
    }

    if ((reportType === "bus" || reportType === "driver") && !selectedBus) {
      Alert.alert("Error", "Please select a bus.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get selected bus name
      const busName = selectedBus
        ? busList.find((bus) => bus.id === selectedBus)?.name || selectedBus
        : null;

      await apiRequest("/api/reports", {
        method: "POST",
        data: {
          reportType,
          description,
          busID: selectedBus || null, // keep ID if backend needs it
          busName: busName, // send bus name too
          stopName: selectedStop || null,
        },
      });

      setIsSuccessModalVisible(true);
      setDescription("");
      setSelectedBus("");
      setSelectedStop("");
      setStopList([]);
    } catch (err) {
      console.error("Submit report error:", err.response?.data || err);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyChange = (reportId, text) => {
    setReplyTexts((prev) => ({ ...prev, [reportId]: text }));
  };

  const replyToReport = async (reportId) => {
    const text = replyTexts[reportId];
    if (!text?.trim()) {
      Alert.alert("Error", "Response cannot be empty.");
      return;
    }

    try {
      await apiRequest(`/api/reports/respond/${reportId}`, {
        method: "PUT",
        data: { response: text, status: "resolved" },
      });
      Alert.alert("Success", "Response sent!");
      setReplyTexts((prev) => ({ ...prev, [reportId]: "" }));
      fetchAllReports();
    } catch (err) {
      console.error("Reply error:", err.response?.data || err);
      Alert.alert("Error", "Failed to send response.");
    }
  };

  const handleDeleteReport = async (reportId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this report?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiRequest(`/api/reports/delete/${reportId}`, {
                method: "DELETE",
              });
              Alert.alert("Success", "Report deleted successfully!");
              fetchHistory(); // or fetchAllReports() depending on context
            } catch (err) {
              console.error("Delete error:", err.response?.data || err);
              Alert.alert("Error", "Failed to delete report.");
            }
          },
        },
      ]
    );
  };

  // ------------------------ Helpers ------------------------
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "#4CAF50";
      case "in progress":
        return "#FF9800";
      case "closed":
        return "#9E9E9E";
      default:
        return "#2196F3";
    }
  };

  const getReportTypeIcon = (type) => {
    switch (type) {
      case "general":
        return "chatbubble-outline";
      case "bus":
        return "bus-outline";
      case "safety":
        return "shield-checkmark-outline";
      case "driver":
        return "person-outline";
      default:
        return "document-text-outline";
    }
  };

  // ------------------------ Render ------------------------
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
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
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View
            style={[
              styles.animatedContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* New Report Form */}
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

                {/* Bus Selection */}
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
                          <Picker.Item
                            key={bus.id}
                            label={bus.name}
                            value={bus.id}
                          />
                        ))}
                      </Picker>
                    </View>
                  </>
                )}

                {/* Stop Selection */}
                {stopList.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>
                      Select Stop (Optional)
                    </Text>
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
                    maxLength={500}
                  />
                  <View style={styles.charCount}>
                    <Text style={styles.charCountText}>
                      {description.length}/500
                    </Text>
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    isSubmitting && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={isSubmitting} 
                >
                  <View style={styles.solidButton}>
                    <View style={{ width: wp("6%"), alignItems: "center" }}>
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Ionicons
                          name="paper-plane-outline"
                          size={wp("5%")}
                          color="#fff"
                        />
                      )}
                    </View>
                    <Text style={styles.submitButtonText}>
                      {isSubmitting ? "Submitting..." : "Submit Report"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              /* History Tab */
              <View style={styles.historyContainer}>
                {isLoadingHistory ? (
                  <ActivityIndicator
                    size="large"
                    color="#6C63FF"
                    style={{ marginTop: hp("10%") }}
                  />
                ) : history.length === 0 ? (
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
                            {report.reportType.charAt(0).toUpperCase() +
                              report.reportType.slice(1)}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                getStatusColor(report.status) + "20",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              { color: getStatusColor(report.status) },
                            ]}
                          >
                            {report.status || "Submitted"}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.reportDescription}>
                        <Text style={styles.reportDescriptionLabel}>
                          Complaint:{" "}
                        </Text>
                        {report.description}
                      </Text>

                      {/* Bus and Stop info */}
                      {report.busName && (
                        <Text style={styles.reportBus}>
                          <Text style={styles.reportBusLabel}>Bus Route: </Text>
                          {report.busName}
                        </Text>
                      )}

                      {report.stopName && (
                        <Text style={styles.reportStop}>
                          <Text style={styles.reportStopLabel}>
                            Stop Name:{" "}
                          </Text>
                          {report.stopName}
                        </Text>
                      )}

                      <Text style={styles.reportDate}>
                        {new Date(report.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </Text>

                      {report.response && (
                        <View style={styles.responseContainer}>
                          <View style={styles.responseHeader}>
                            <Ionicons
                              name="checkmark-done-circle"
                              size={wp("4%")}
                              color="#4CAF50"
                            />
                            <Text style={styles.responseTitle}>
                              Admin Response:
                            </Text>
                          </View>
                          <Text style={styles.responseText}>
                            {report.response}
                          </Text>
                        </View>
                      )}

                      {/* Admin reply input */}
                      {user?.role === "admin" && !report.response && (
                        <View style={{ marginTop: hp("1%") }}>
                          <TextInput
                            placeholder="Write your response..."
                            value={replyTexts[report._id] || ""}
                            onChangeText={(text) =>
                              handleReplyChange(report._id, text)
                            }
                            style={styles.descriptionInput}
                          />
                          <TouchableOpacity
                            style={styles.submitButton}
                            onPress={() => replyToReport(report._id)}
                          >
                            <Text style={styles.submitButtonText}>
                              Send Response
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* User delete button */}
                      {/* User delete button */}
                      {user?.id === report.userId && (
                        <TouchableOpacity
                          style={[
                            styles.deleteButton,
                            { backgroundColor: "#FF4D4D", marginTop: hp("1%") },
                          ]}
                          onPress={() => handleDeleteReport(report._id)}
                        >
                          <Text style={styles.deleteButtonText}>
                            Delete Report
                          </Text>
                        </TouchableOpacity>
                      )}

                      {user?.role === "admin" && user?.role != "student" && (
                        <TouchableOpacity
                          style={[
                            styles.deleteButton,
                            { backgroundColor: "#999", marginTop: hp("1%") },
                          ]}
                          onPress={() =>
                            setHiddenReports((prev) => ({
                              ...prev,
                              [report._id]: true,
                            }))
                          }
                        >
                          <Text style={styles.deleteButtonText}>
                            Hide Report
                          </Text>
                        </TouchableOpacity>
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
              Thank you for your feedback! We'll review your report and take
              appropriate action.
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

// ------------------------ Styles ------------------------
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
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
  headerSubtitle: { fontSize: wp("4%"), color: "rgba(255, 255, 255, 0.8)" },
  keyboardAvoid: { flex: 1 },
  animatedContainer: { flex: 1 },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: wp("4%"),
    marginTop: hp("-2%"),
    borderRadius: wp("3%"),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: hp("1.8%"),
    alignItems: "center",
    justifyContent: "center",
    gap: wp("2%"),
  },
  activeTab: { backgroundColor: "#6C63FF" },
  tabText: { fontSize: wp("3.8%"), color: "#666", fontWeight: "600" },
  activeTabText: { color: "#fff" },
  scrollContent: { flexGrow: 1, paddingBottom: hp("4%") },
  formContainer: { paddingHorizontal: wp("5%"), paddingTop: hp("3%") },
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
  },
  picker: { width: "100%", color: "#333" },
  inputContainer: { position: "relative" },
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
  },
  charCount: { position: "absolute", bottom: hp("3%"), right: wp("4%") },
  charCountText: { fontSize: wp("3.5%"), color: "#999" },
  submitButton: {
    borderRadius: wp("2.5%"),
    overflow: "hidden",
    marginTop: hp("2%"),
  },
  solidButton: {
    flexDirection: "row",
    padding: wp("4%"),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6C63FF",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff", // make it visible on purple background
    fontSize: wp("4.2%"),
    fontWeight: "600",
    marginLeft: wp("2%"), // spacing from icon/spinner
  },

  historyContainer: { paddingHorizontal: wp("4%"), paddingTop: hp("2%") },
  reportCard: {
    backgroundColor: "#fff",
    borderRadius: wp("3%"),
    padding: wp("4%"),
    marginBottom: hp("2%"),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,

    elevation: 12,
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
  reportType: { fontSize: wp("4%"), fontWeight: "600", color: "#333" },
  statusBadge: {
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.6%"),
    borderRadius: wp("2%"),
  },
  statusText: { fontSize: wp("3.2%"), fontWeight: "600" },
  reportDate: { fontSize: wp("3.5%"), color: "#888", marginBottom: hp("1.5%") },
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
    marginBottom: hp("0.5%"),
  },
  responseTitle: { fontSize: wp("3.8%"), fontWeight: "600", color: "#4CAF50" },
  responseText: { fontSize: wp("3.8%"), color: "#555" },
  emptyHistory: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp("10%"),
  },
  emptyHistoryText: {
    fontSize: wp("4.5%"),
    fontWeight: "600",
    marginTop: hp("2%"),
    color: "#999",
  },
  emptyHistorySubtext: {
    fontSize: wp("3.8%"),
    color: "#bbb",
    marginTop: hp("0.5%"),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: wp("80%"),
    backgroundColor: "#fff",
    borderRadius: wp("3%"),
    padding: wp("5%"),
    alignItems: "center",
  },
  modalIconContainer: { marginBottom: hp("2%") },
  modalTitle: {
    fontSize: wp("5%"),
    fontWeight: "700",
    marginBottom: hp("1%"),
    color: "#333",
  },
  modalText: {
    fontSize: wp("4%"),
    textAlign: "center",
    color: "#555",
    marginBottom: hp("3%"),
  },
  modalButton: {
    backgroundColor: "#6C63FF",
    borderRadius: wp("2%"),
    paddingHorizontal: wp("6%"),
    paddingVertical: hp("1.5%"),
  },
  modalButtonText: { color: "#fff", fontWeight: "600", fontSize: wp("4%") },
  deleteButton: {
    borderRadius: wp("2.5%"),
    overflow: "hidden",
    paddingVertical: wp("3%"),
    alignItems: "center",
    justifyContent: "center",
    width: wp("30%"),
    marginLeft: wp("50%"),
  },
  deleteButtonText: { color: "#fff", fontWeight: "600", fontSize: wp("4%") },
  reportBus: {
    fontSize: wp("3.5%"),
    color: "#555",
  },
  reportStop: {
    fontSize: wp("3.5%"),
    color: "#555",
    marginBottom: hp("0.5%"),
  },
  reportBusLabel: {
    fontSize: wp("4%"),
    fontWeight: "500",
    color: "#333",
    marginTop: hp("1%"),
  },
  reportStopLabel: {
    fontSize: wp("4%"),
    fontWeight: "500",
    color: "#333",
    marginTop: hp("1%"),
  },
  reportDescriptionLabel: {
    fontSize: wp("4%"),
    fontWeight: "500",
    color: "#333",
    marginTop: hp("1%"),
  },
});

export default ReportScreen;
