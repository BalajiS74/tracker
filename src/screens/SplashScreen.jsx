import { View, Text, StyleSheet,Image } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

const applogo  = require('../images/splash.png')
export default function SplashScreen() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Image source={applogo}></Image>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4b0082", // Dark splash background
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginTop:80
  },
});
