// src/screens/CustomSplashScreen.js
import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";

export default function CustomSplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish(); // tell App.js to continue
    }, 2000); // show splash for 2 sec

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/splashscreen_logo.png")}
        style={styles.fullImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover", // makes it fullscreen
  },
});
