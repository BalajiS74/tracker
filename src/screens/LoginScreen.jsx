import React, { useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Toast from "react-native-toast-message";
import { AuthContext } from "../context/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons"; // ✅ Ionicons imported

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please enter both email and password",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://trakerbackend.onrender.com/api/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.userToken, data.role, data.relatedTo);
        Toast.show({
          type: "success",
          text1: "Login Successful",
          text2: `Welcome back, ${data.user.name}`,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: data.message || "Invalid credentials",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Login Error",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [email, password, login]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Email Input with Icon */}
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={styles.inputWithIcon}>
            <Ionicons name="mail-outline" size={22} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input with Icon + Eye Toggle */}
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWithIcon}>
            <Ionicons name="lock-closed-outline" size={22} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, { flex: 1 }]}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="#666"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4b0082",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  inputLabel: {
    fontSize: 14,
    color: "#4b0082",
    marginBottom: 8,
    fontWeight: "600",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 12,
    marginBottom: 20,
    height: 56,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#4b0082",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    marginTop: 10,
    shadowColor: "#4b0082",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#a78bc7",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPasswordButton: {
    alignSelf: "center",
    marginTop: 20,
  },
  forgotPasswordText: {
    color: "#4b0082",
    fontSize: 14,
    fontWeight: "600",
  },
});
