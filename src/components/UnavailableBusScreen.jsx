import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const UnavailableBusScreen = ({ busData }) => {


  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={{
          uri: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXA2NXA4OHo3b2Jvd3h2bWM3MjZrdm9ubzdvbTB2bG1jZjRka2w3byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/d8nkIKOcxqnVa28bXU/giphy.gif",
        }}
        style={styles.busImage}
        contentFit="contain"
      />

      <View style={styles.messageContainer}>
        <Text style={styles.title}>Bus Service Update</Text>

        <View style={styles.notificationBadge}>
          <Ionicons name="megaphone" size={hp("2%")} color="#fff" />
          <Text style={styles.notificationText}>Important Announcement</Text>
        </View>

        <Text style={styles.message}>
          Hello everyone, just a heads-up that the college bus{" "}
          <Text style={styles.busId}>{busData.busid}</Text> ({busData.routeName}
          ) is not running today.
        </Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={hp("2%")} color="#64748b" />
            <Text style={styles.detailText}>
              Date: {new Date().toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time" size={hp("2%")} color="#64748b" />
            <Text style={styles.detailText}>Status: Not Operational</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="information-circle" size={hp("2%")} color="#64748b" />
            <Text style={styles.detailText}>
              Please make alternative arrangements
            </Text>
          </View>
        </View>

        <View style={styles.suggestionBox}>
          <Text style={styles.suggestionTitle}>Suggested Alternatives:</Text>
          <View style={styles.suggestionItem}>
            <Ionicons name="car" size={hp("2%")} color="#3b82f6" />
            <Text style={styles.suggestionText}>Carpool with classmates</Text>
          </View>
          <View style={styles.suggestionItem}>
            <Ionicons name="bus" size={hp("2%")} color="#3b82f6" />
            <Text style={styles.suggestionText}>Use public transportation</Text>
          </View>
          <View style={styles.suggestionItem}>
            <Ionicons name="bicycle" size={hp("2%")} color="#3b82f6" />
            <Text style={styles.suggestionText}>
              Consider biking if possible
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.waveDecoration} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp("5%"),
    paddingTop: hp("2%"),
  },
  busImage: {
    width: wp("60%"),
    height: hp("25%"),
    marginBottom: hp("3%"),
    borderRadius:20
  },
  messageContainer: {
    backgroundColor: "#fff",
    borderRadius: wp("5%"),
    padding: wp("5%"),
    width: "100%",
    maxWidth: wp("90%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: hp("3%"),
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: hp("2%"),
  },
  notificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc2626",
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("4%"),
    borderRadius: wp("10%"),
    marginBottom: hp("2%"),
    alignSelf: "center",
  },
  notificationText: { color: "#fff", fontWeight: "600", marginLeft: wp("1%") },
  message: {
    fontSize: hp("2%"),
    color: "#3168b4ff",
    textAlign: "center",
    lineHeight: hp("3%"),
    marginBottom: hp("2%"),
  },
  busId: { fontWeight: "bold", color: "#dc2626" },
  detailsCard: {
    backgroundColor: "#f8fafc",
    borderRadius: wp("3%"),
    padding: wp("4%"),
    marginBottom: hp("2%"),
  },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: hp("1%") },
  detailText: { marginLeft: wp("2%"), color: "#64748b", fontSize: hp("2%") },
  suggestionBox: {
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
    paddingLeft: wp("4%"),
  },
  suggestionTitle: { fontWeight: "600", color: "#1f2937", marginBottom: hp("1%") },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1%"),
  },
  suggestionText: { marginLeft: wp("2%"), color: "#4b5563", fontSize: hp("2%") },
  waveDecoration: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: hp("5%"),
    backgroundColor: "#dc2626",
    borderTopLeftRadius: wp("5%"),
    borderTopRightRadius: wp("5%"),
    opacity: 0.1,
  },
});

export default UnavailableBusScreen;
