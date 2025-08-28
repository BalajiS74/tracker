import React, { useState, useContext, useCallback, useRef } from "react";
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
import Ionicons from "@expo/vector-icons/Ionicons";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const passwordInputRef = useRef(null);

  // === LOGIN ===
  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please enter both email and password",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://trakerbackend.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (jsonErr) {
        console.error("Invalid JSON response:", jsonErr);
        Toast.show({
          type: "error",
          text1: "Server Error",
          text2: "Invalid JSON returned by server",
        });
        return;
      }

      if (response.ok) {
        // ✅ Call AuthContext login
        login(
          data.user,         // user object
          data.accessToken,   // access token
          data.refreshToken,  // refresh token
          data.role,          // user role
          data.relatedTo      // optional related student/family
        );
        Toast.show({
          type: "success",
          text1: "Login Successful",
          text2: `Welcome back, ${data.user?.name || "User"}`,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: data.message || "Invalid credentials",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Check your internet or try again",
      });
    } finally {
      setLoading(false);
    }
  }, [email, password, login]);

  // === RESET PASSWORD ===
  const handleResetPassword = async () => {
    if (!email || !newPassword) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please enter email and new password",
      });
      return;
    }

    setResetLoading(true);

    try {
      const response = await fetch(
        "https://trakerbackend.onrender.com/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, newPassword }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Password Updated",
        });
        setShowReset(false);
        setNewPassword("");
      } else {
        Toast.show({
          type: "error",
          text1: "Reset Failed",
          text2: data.message,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* === Your UI/UX remains 100% unchanged === */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Email Input */}
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={styles.inputWithIcon}>
            <Ionicons
              name="mail-outline"
              size={22}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
          </View>

          {/* Password Input */}
          {!showReset && (
            <>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={passwordInputRef}
                  style={[styles.textInput, { flex: 1 }]}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={22}
                    color="#666"
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Login Button */}
          {!showReset && (
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
          )}

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => setShowReset(!showReset)}
          >
            <Text style={styles.forgotPasswordText}>
              {showReset ? "Cancel Reset" : "Forgot Password?"}
            </Text>
          </TouchableOpacity>

          {/* Reset Password Form */}
          {showReset && (
            <>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons
                  name="key-outline"
                  size={22}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter new password"
                  placeholderTextColor="#999"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>
              <TouchableOpacity
                style={[styles.button, resetLoading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={resetLoading}
              >
                {resetLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </>
          )}
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
    padding: 5,
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
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14, // Ensure enough vertical space
    paddingHorizontal: 20,
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
    color: "#fff", // white looks better over indigo
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    padding: 5,
  },

  forgotPasswordButton: {
    alignSelf: "center",
    marginTop: 15,
  },
  forgotPasswordText: {
    color: "#4b0082",
    fontSize: 14,
    fontWeight: "600",
    padding: 5,
  },
});
