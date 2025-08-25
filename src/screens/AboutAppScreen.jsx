import React from "react";
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const AboutAppScreen = () => {
  const features = [
    "Real-time bus tracking",
    "Next stop detection",
    "Estimated Time of Arrival (ETA)",
    "Emergency alerts with biometric confirmation",
    "Full route view",
    "Smart AM/PM route direction handling",
    "Voice alerts for upcoming stops (Text-to-Speech)",
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <MaterialIcons name="info" size={hp("3.5%")} color="#6c5ce7" />
          <Text style={styles.title}>About the App</Text>
        </View>

        {/* About the App Section */}
        <View style={styles.card}>
          <Text style={styles.paragraph}>
            This app is designed to provide real-time bus tracking and important
            features for students, parents, and guardians. It helps users track
            the live location of the bus, estimate arrival times, and stay
            updated with safety alerts. The goal is to ensure convenience and
            safety in daily commutes.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.headerContainer}>
          <MaterialIcons name="star" size={hp("3.5%")} color="#6c5ce7" />
          <Text style={styles.title}>Key Features</Text>
        </View>

        <View style={styles.card}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <MaterialIcons
                name="check-circle"
                size={hp("2.5%")}
                color="#00b894"
                style={styles.icon}
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        <View style={styles.createrNameContainer}>
          <Text style={styles.createrName}>created by ziotix❤️</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: wp("5%"),
    paddingBottom: hp("2%"),
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp("7%"),
  },
  title: {
    fontSize: hp("2.8%"),
    fontWeight: "700",
    color: "#2d3436",
    marginLeft: wp("3%"),
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: wp("3%"),
    padding: wp("5%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp("0.1%") },
    shadowOpacity: 0.1,
    shadowRadius: wp("1.5%"),
    elevation: 3,
    marginTop: hp("2%"),
  },
  paragraph: {
    fontSize: hp("1.9%"),
    lineHeight: hp("2.8%"),
    color: "#636e72",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: hp("1.5%"),
  },
  featureText: {
    fontSize: hp("1.9%"),
    color: "#2d3436",
    flex: 1,
    marginLeft: wp("2.5%"),
    lineHeight: hp("2.5%"),
  },
  icon: {
    marginTop: hp("0.2%"),
  },
  createrNameContainer:{
    padding:15,
    alignItems:"center",
    marginTop:hp('5%')
  },
  createrName:{
    fontSize:20
  }
  
});

export default AboutAppScreen;
