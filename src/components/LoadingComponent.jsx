import React, { useRef, useEffect } from "react";
import { Text, Animated, Easing, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LoadingComponent = () => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Spinner animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#ffffffff",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Animated Spinner */}
      <Animated.View
        style={{
          width: 70,
          height: 70,
          borderRadius: 35,
          borderWidth: 3,
          borderColor: "transparent",
          borderTopColor: "#0bc1bf",
          transform: [{ rotate: spin }],
          marginBottom: 20,
        }}
      />

      {/* Text with Pulse Animation */}
      <Animated.View
        style={{
          transform: [{ scale: pulseValue }],
        }}
      >
        <Text
          style={{
            fontSize: 20,
            color: "#000000ff",
            fontWeight: "bold",
            letterSpacing: 1,
            textShadowColor: "rgba(108, 99, 255, 0.5)",
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 10,
          }}
        >
          LOADING
        </Text>
      </Animated.View>

      {/* Animated Dots */}
      <View style={{ flexDirection: "row", marginTop: 10 }}>
        {[0, 1, 2].map((i) => (
          <AnimatedDot key={i} index={i} />
        ))}
      </View>
    </SafeAreaView>
  );
};

// Separate component for animated dots
const AnimatedDot = ({ index }) => {
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(index * 200),
        Animated.timing(dotAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.Text
      style={{
        fontSize: 40,
        color: "#6C63FF",
        opacity: dotAnim,
        marginHorizontal: 2,
      }}
    >
      .
    </Animated.Text>
  );
};

export default LoadingComponent;