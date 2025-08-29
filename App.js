import React, { useContext, Suspense } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import { ActivityIndicator, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import { BusProvider } from "./src/context/BusContext";

// Lazy load screens
const HomeScreen = React.lazy(() => import("./src/screens/HomeScreen"));
const Track = React.lazy(() => import("./src/screens/Track"));
const BusDetails = React.lazy(() => import("./src/screens/BusDetails"));
const LoginScreen = React.lazy(() => import("./src/screens/LoginScreen"));
const Profile = React.lazy(() => import("./src/screens/Profile"));
const HelpSupportScreen = React.lazy(() =>
  import("./src/screens/HelpSupportScreen")
);
const TermsPrivacyScreen = React.lazy(() =>
  import("./src/screens/TermsPrivacyScreen")
);
const SafetytipsScreen = React.lazy(() => import("./src/screens/SafetyTips"));
const ReportScreen = React.lazy(() => import("./src/screens/ReportScreen"));
const AboutAppScreen = React.lazy(() => import("./src/screens/AboutAppScreen"));
const AnnouncementPage = React.lazy(() =>
  import("./src/screens/AnnouncementPage")
);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab bar styles
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
const tabBarLabelStyle = { fontSize: wp("3%"), fontWeight: "600" };

// Memoized components
const MemoHomeScreen = React.memo(HomeScreen);
const MemoTrack = React.memo(Track);
const MemoProfile = React.memo(Profile);

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName = "home";
          if (route.name === "Home")
            iconName = focused ? "home" : "home-outline";
          else if (route.name === "Track")
            iconName = focused ? "location" : "location-outline";
          else if (route.name === "Profile")
            iconName = focused ? "person-circle" : "person-circle-outline";
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: "#4b0082",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          ...tabBarStyle,
          height: hp("9%") + insets.bottom,
          paddingBottom: insets.bottom + hp("0.5%"),
          paddingTop: hp("1%"),
        },
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
  const { refreshToken, role, isLoading } = useContext(AuthContext);
  const isAdmin = role === "admin";

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4b0082" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Suspense
        fallback={
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#4b0082" />
          </View>
        }
      >
        <Stack.Navigator>
          {!refreshToken ? (
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
                initialParams={{ isAdmin }}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="HelpSupport"
                component={HelpSupportScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="TermsPrivacy"
                component={TermsPrivacyScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Safetytips"
                component={SafetytipsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ReportScreen"
                component={ReportScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AboutAppScreen"
                component={AboutAppScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AnnouncementPage"
                component={AnnouncementPage}
                options={{ headerShown: false }}
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
        <BusProvider>
          <MainStack />
          <Toast />
        </BusProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
