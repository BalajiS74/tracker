import React, { useContext, useState, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import DefaultProfileImage from "../images/default-profile-image.png";

const API_BASE_URL = "https://trakerbackend.onrender.com";
const ALLOWED_IMAGE_TYPES = ["jpg", "jpeg", "png"];
const windowDimensions = Dimensions.get("window");

// Responsive helpers
const wp = (percent) => windowDimensions.width * (percent / 100);
const hp = (percent) => windowDimensions.height * (percent / 100);

// MenuItem Component
const MenuItem = memo(({ icon, text, onPress, isLast }) => (
  <TouchableOpacity
    style={[styles.menuItem, isLast && styles.menuItemLast]}
    onPress={onPress}
    accessible
    accessibilityLabel={text}
    accessibilityRole="button"
  >
    <View style={styles.menuIconContainer}>
      <Ionicons name={icon} size={24} color="#6C63FF" />
    </View>
    <Text style={styles.menuText}>{text}</Text>
    <Ionicons name="chevron-forward" size={20} color="#ccc" />
  </TouchableOpacity>
));

const Profile = () => {
  const { user, userToken, refreshUser, logout } = useContext(AuthContext);
  const navigation = useNavigation();
  const [avatarUri, setAvatarUri] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load avatar from AsyncStorage or user object
  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const saved = await AsyncStorage.getItem("profilePhoto");
        if (saved) setAvatarUri(saved);
        else if (user?.avatar) {
          const fullUrl = `${API_BASE_URL}${user.avatar}?${Date.now()}`;
          setAvatarUri(fullUrl);
          await AsyncStorage.setItem("profilePhoto", fullUrl);
        }
      } catch (error) {
        console.error("Failed to load avatar:", error);
      }
    };
    loadAvatar();
  }, [user]);

  // Image picker
  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert(
        "Permission Denied",
        "You need to allow media access to change your profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  // Avatar upload
  const uploadAvatar = async (uri, retryCount = 0) => {
    if (isUploading) return;
    setIsUploading(true);

    try {
      const fileName = uri.split("/").pop();
      const ext = fileName.split(".").pop().toLowerCase();
      if (!ALLOWED_IMAGE_TYPES.includes(ext)) {
        throw new Error("Only JPG, JPEG, and PNG images are allowed");
      }

      const formData = new FormData();
      formData.append("avatar", {
        uri,
        name: `avatar.${ext}`,
        type: `image/${ext}`,
      });

      const response = await fetch(`${API_BASE_URL}/api/auth/upload-avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server did not return JSON. Response: " + text.slice(0, 100));
      }

      if (!response.ok) throw new Error(data.message || "Upload failed");

      const fullUrl = `${API_BASE_URL}${data.user.avatar}?${Date.now()}`;
      setAvatarUri(fullUrl);
      await refreshUser(data.user);
      Alert.alert("Success", "Your profile picture has been updated!");
    } catch (error) {
      console.error("Upload error:", error);
      if (retryCount < 2) {
        setTimeout(() => uploadAvatar(uri, retryCount + 1), 1000);
        return;
      }
      Alert.alert("Upload Failed", error.message || "Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Logout handler
  const handleLogout = useCallback(() => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              logout();
            } catch (error) {
              console.error("Logout error:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [logout]);

  // Menu items
  const menuItems = [
    { icon: "help-circle-outline", text: "Help & Support", onPress: () => navigation.navigate("HelpSupport") },
    { icon: "document-text-outline", text: "Terms & Privacy", onPress: () => navigation.navigate("TermsPrivacy") },
    { icon: "alert-circle-outline", text: "Report a Problem", onPress: () => navigation.navigate("ReportScreen") },
    { icon: "information-circle-outline", text: "About the app", onPress: () => navigation.navigate("AboutAppScreen") },
    ...(user?.role === "admin" ? [{ icon: "megaphone-outline", text: "Announcements", onPress: () => navigation.navigate("AnnouncementPage") }] : []),
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.absoluteHeader}>
        <View>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your account settings</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSpacer} />

        <View style={styles.profileCard}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              onPress={pickImage}
              style={styles.avatarContainer}
              disabled={isUploading}
            >
              <Image
                source={avatarUri ? { uri: avatarUri } : DefaultProfileImage}
                style={styles.avatar}
                onError={() => setAvatarUri(null)}
              />
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            </TouchableOpacity>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || "Not provided"}</Text>
              <Text style={styles.userEmail}>{user?.email || "Not provided"}</Text>
              <Text style={styles.userRole}>{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || "User"}</Text>
            </View>
          </View>

          {/* Personal Details */}
          <View style={styles.detailsSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-circle-outline" size={20} color="#6C63FF" />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="call-outline" size={18} color="#6C63FF" />
              <Text style={styles.detailLabel}>Phone:</Text>
              <Text style={styles.detailValue}>{user?.phone || "Not provided"}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={18} color="#6C63FF" />
              <Text style={styles.detailLabel}>Member since:</Text>
              <Text style={styles.detailValue}>{user?.joinDate || "2025"}</Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={20} color="#6C63FF" />
            <Text style={styles.sectionTitle}>Settings & Support</Text>
          </View>
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <MenuItem
                key={item.text}
                icon={item.icon}
                text={item.text}
                onPress={item.onPress}
                isLast={index === menuItems.length - 1}
              />
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Upload Overlay */}
      {isUploading && (
        <View style={styles.uploadOverlay}>
          <View style={styles.uploadIndicator}>
            <Ionicons name="cloud-upload" size={40} color="#6C63FF" />
            <Text style={styles.uploadText}>Updating Profile...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
  absoluteHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 20,
    backgroundColor: "#6C63FF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex:100
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  scrollContainer: { padding: 16, paddingTop: 60, paddingBottom: 40 },
  headerSpacer: { height: 100 },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarSection: { flexDirection: "row", alignItems: "center", marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  avatarContainer: { position: "relative", marginRight: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: "#6C63FF" },
  cameraIcon: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#6C63FF", borderRadius: 12, padding: 4 },
  userInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: "600", color: "#2C3E50", marginBottom: 4 },
  userEmail: { fontSize: 14, color: "#7F8C8D", marginBottom: 4 },
  userRole: { fontSize: 12, color: "#6C63FF", fontWeight: "500", backgroundColor: "#f0e6ff", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, alignSelf: "flex-start" },
  detailsSection: { marginBottom: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#2C3E50", marginLeft: 8 },
  detailItem: { flexDirection: "row", alignItems: "center", marginBottom: 12, paddingHorizontal: 4 },
  detailLabel: { fontSize: 14, color: "#7F8C8D", marginLeft: 8, marginRight: 4, width: 100 },
  detailValue: { fontSize: 14, color: "#2C3E50", fontWeight: "500", flex: 1 },
  menuSection: { marginBottom: 24 },
  menuContainer: { backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
  menuItemLast: { borderBottomWidth: 0 },
  menuIconContainer: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#f0e6ff", justifyContent: "center", alignItems: "center", marginRight: 12 },
  menuText: { flex: 1, fontSize: 16, color: "#2C3E50", fontWeight: "500" },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FF6B6B", padding: 16, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  logoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8,padding:5 },
  uploadOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  uploadIndicator: { backgroundColor: "#fff", padding: 24, borderRadius: 16, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  uploadText: { fontSize: 16, color: "#2C3E50", marginTop: 12, fontWeight: "500" },
});

export default Profile;
