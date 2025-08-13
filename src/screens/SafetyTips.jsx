// SafetyTips.js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

export default function SafetyTips() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Safety Tips</Text>

        <View style={styles.tipSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="man" size={wp("6%")} color="#007AFF" />
            <Text style={styles.sectionTitle}>For Boys</Text>
          </View>
          <Text style={styles.tip}>• Stay in groups when walking late.</Text>
          <Text style={styles.tip}>• Avoid secluded shortcuts or dark areas.</Text>
          <Text style={styles.tip}>• Don’t engage in arguments with strangers.</Text>
          <Text style={styles.tip}>• Keep your emergency contacts on speed dial.</Text>
        </View>

        <View style={styles.tipSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="woman" size={wp("6%")} color="#FF2D55" />
            <Text style={styles.sectionTitle}>For Girls</Text>
          </View>
          <Text style={styles.tip}>• Never travel alone at night—use safe routes.</Text>
          <Text style={styles.tip}>• Always inform someone of your travel plans.</Text>
          <Text style={styles.tip}>• Carry pepper spray or safety alarm if possible.</Text>
          <Text style={styles.tip}>• Avoid sharing personal details with strangers.</Text>
        </View>

        <View style={styles.tipSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={wp("6%")} color="#4B0082" />
            <Text style={styles.sectionTitle}>General Tips</Text>
          </View>
          <Text style={styles.tip}>• Use college transport or trusted options only.</Text>
          <Text style={styles.tip}>• Always keep your phone charged.</Text>
          <Text style={styles.tip}>• Report any suspicious activity to staff or authorities.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  scrollContainer: {
    padding: wp("5%"),
  },
  header: {
    fontSize: wp("7%"),
    fontWeight: "bold",
    marginBottom: wp("5%"),
    textAlign: "center",
    color: "#333",
  },
  tipSection: {
    marginBottom: wp("8%"),
    backgroundColor: "#fff",
    padding: wp("4%"),
    borderRadius: wp("3%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: wp("2%"),
  },
  sectionTitle: {
    fontSize: wp("5%"),
    fontWeight: "600",
    marginLeft: wp("2%"),
    color: "#333",
  },
  tip: {
    fontSize: wp("4%"),
    color: "#555",
    marginVertical: wp("1%"),
  },
});
