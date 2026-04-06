import React, { useEffect, Suspense } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import useAuthStore from "./src/store/useAuthStore";

// Lazy load screens
const HomeScreen = React.lazy(() => import("./src/screens/HomeScreen"));
const BusDetails = React.lazy(() => import("./src/screens/BusDetails"));
const LoginScreen = React.lazy(() => import("./src/screens/LoginScreen"));
const Profile = React.lazy(() => import("./src/screens/Profile"));
const HelpSupportScreen = React.lazy(
  () => import("./src/screens/HelpSupportScreen"),
);
const TermsPrivacyScreen = React.lazy(
  () => import("./src/screens/TermsPrivacyScreen"),
);
const ReportScreen = React.lazy(() => import("./src/screens/ReportScreen"));
const AboutAppScreen = React.lazy(() => import("./src/screens/AboutAppScreen"));
const AnnouncementPage = React.lazy(
  () => import("./src/screens/AnnouncementPage"),
);
import RouteManagementScreen from "./src/screens/RouteManagementScreen";

const Stack = createNativeStackNavigator();
function MainStack() {
  const {
    refreshToken,
    role,
    isLoading,
    loadStoredAuth,
    setupAxiosInterceptors,
  } = useAuthStore();

  useEffect(() => {
    loadStoredAuth();
    setupAxiosInterceptors();
  }, []);

  const isAdmin = role === "admin";

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4b0082" />
      </View>
    );
  }

  return (
    <Suspense
      fallback={
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#4b0082" />
        </View>
      }
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!refreshToken ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen
              name="BusDetails"
              component={BusDetails}
              initialParams={{ isAdmin }}
            />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
            <Stack.Screen name="TermsPrivacy" component={TermsPrivacyScreen} />
            <Stack.Screen name="ReportScreen" component={ReportScreen} />
            <Stack.Screen name="AboutAppScreen" component={AboutAppScreen} />
            <Stack.Screen
              name="AnnouncementPage"
              component={AnnouncementPage}
            />
            <Stack.Screen
              name="RouteManagement"
              component={RouteManagementScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </Suspense>
  );
}
export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaProvider>
        <MainStack />
        <Toast />
      </SafeAreaProvider>
    </NavigationContainer>
  );
}
