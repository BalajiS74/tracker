import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import HomeScreen from "./src/screens/HomeScreen";
import Track from "./src/screens/Track";
// Dummy screen components
const Home = () => <View style={styles.screen}><HomeScreen/></View>;
const TrackScreen = () => <View style={styles.screen}><Track/></View>;
const Profile = () => <View style={styles.screen}><Text>Profile Screen</Text></View>;

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Track") {
              iconName = focused ? "location" : "location-outline";
            } else if (route.name === "Profile") {
              iconName = focused ? "person-circle" : "person-circle-outline";
            }

            return <Ionicons name={iconName} size={24} color={color} />;
          },
          tabBarActiveTintColor: "#4b0082",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            position: "absolute",
            backgroundColor: "#ffffff",
            borderRadius:20,
            width:350,
            height: 70,
            paddingBottom: Platform.OS === "ios" ? 20 : 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 10,
            marginBottom:60,
            marginLeft:20
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Track" component={TrackScreen} />
        <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
