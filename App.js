import React, { useContext, Suspense } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Lazy load screens for performance
const HomeScreen = React.lazy(() => import("./src/screens/HomeScreen"));
const Track = React.lazy(() => import("./src/screens/Track"));
const BusDetails = React.lazy(() => import("./src/screens/BusDetails"));
const LoginScreen = React.lazy(() => import("./src/screens/LoginScreen"));
const Profile = React.lazy(() => import("./src/screens/Profile"));
const HelpSupportScreen = React.lazy(() => import("./src/screens/HelpSupportScreen"));
const TermsPrivacyScreen = React.lazy(() => import("./src/screens/TermsPrivacyScreen"));

// Auth Context
import { AuthProvider, AuthContext } from "./src/context/AuthContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabBarStyle = {
  backgroundColor: "#ffffff",
  borderTopLeftRadius: wp("5%"),
  borderTopRightRadius: wp("5%"),
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
  elevation: 10,
};

const tabBarLabelStyle = {
  fontSize: wp("3%"),
  fontWeight: "600",
};

const MemoHomeScreen = React.memo(HomeScreen);
const MemoTrack = React.memo(Track);
const MemoProfile = React.memo(Profile);
const MemoHelpSupport = React.memo(HelpSupportScreen);
const MemoTermsPrivacy = React.memo(TermsPrivacyScreen);

function MainTabs() {
  const insets = useSafeAreaInsets();

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
        tabBarStyle: { ...tabBarStyle, height: hp("9%") + insets.bottom, paddingBottom: insets.bottom + hp("0.5%"), paddingTop: hp("1%") },
        tabBarLabelStyle,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={MemoHomeScreen} />
      <Tab.Screen name="Track" component={MemoTrack} />
      <Tab.Screen name="Profile" component={MemoProfile} />
    </Tab.Navigator>
  );
}

function MainStack() {
  const { userToken, isLoading, isAdmin } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4b0082" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Suspense fallback={<ActivityIndicator size="large" color="#4b0082" style={{ flex: 1 }} />}>
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
                children={props => <BusDetails {...props} isAdmin={isAdmin} />}
                options={{ title: "Bus Details" }}
              />
              <Stack.Screen
                name="HelpSupport"
                component={MemoHelpSupport}
                options={{ title: "Help & Support" }}
              />
              <Stack.Screen
                name="TermsPrivacy"
                component={MemoTermsPrivacy}
                options={{ title: "Terms & Privacy" }}
              />
            </>
          )}
        </Stack.Navigator>
      </Suspense>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainStack />
        <Toast />
      </AuthProvider>
    </SafeAreaProvider>
  );
}