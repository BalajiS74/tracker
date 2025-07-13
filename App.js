import React, { useState, useEffect, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import * as SplashScreen from "expo-splash-screen"; // ✅ required

// Screens
import HomeScreen from "./src/screens/HomeScreen";
import Track from "./src/screens/Track";
import BusDetails from "./src/screens/BusDetails";
import LoginScreen from "./src/screens/LoginScreen";
import Profile from "./src/screens/Profile";
import Splash from "./src/screens/SplashScreen"; // ✅ renamed to avoid name clash

// Auth
import { AuthProvider, AuthContext } from "./src/context/AuthContext";

// Navigators
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Bottom Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Track") iconName = focused ? "location" : "location-outline";
          else if (route.name === "Profile") iconName = focused ? "person-circle" : "person-circle-outline";

          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: "#4b0082",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "#ffffff",
          borderRadius: 20,
          width: 350,
          height: 70,
          paddingBottom: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 10,
          marginBottom: 20,
          marginLeft: 20,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Track" component={Track} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

// Stack Navigator (Login + Tabs + Bus Details)
function MainStack() {
  const { userToken } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userToken === null ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="BusDetails"
              component={BusDetails}
              options={{ title: "Bus Details" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Root App with splash control
SplashScreen.preventAutoHideAsync(); // ✅ this line is required at top level

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setShowSplash(false);
      await SplashScreen.hideAsync(); // ✅ hide native splash manually
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      {showSplash ? <Splash /> : <MainStack />}
      <Toast />
    </AuthProvider>
  );
}
