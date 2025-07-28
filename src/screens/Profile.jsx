import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  memo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  SafeAreaView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import mime from "mime";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/AuthContext";

const MenuItem = memo(({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={24} color="#4b0082" />
    <Text style={[styles.menuText, { marginLeft: 16 }]}>{text}</Text>
    <Ionicons name="chevron-forward" size={20} color="#ccc" />
  </TouchableOpacity>
));

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [avatarUri, setAvatarUri] = useState(null);
  const [role, setRole] = useState(null);
  const [windowDimensions, setWindowDimensions] = useState(
    Dimensions.get("window")
  );

  useEffect(() => {
    const updateDimensions = () =>
      setWindowDimensions(Dimensions.get("window"));
    const subscription = Dimensions.addEventListener(
      "change",
      updateDimensions
    );
    return () => subscription?.remove();
  }, []);

  const wp = (percentage) => windowDimensions.width * (percentage / 100);
  const hp = (percentage) => windowDimensions.height * (percentage / 100);

  useEffect(() => {
    const loadProfileInfo = async () => {
      try {
        const savedUri = await AsyncStorage.getItem("profilePhoto");
        const storedRole = await AsyncStorage.getItem("role");
        setRole(storedRole);
        setAvatarUri(
          savedUri ||
            user?.avatar ||
            "https://randomuser.me/api/portraits/men/1.jpg"
        );
      } catch (e) {
        setAvatarUri("https://randomuser.me/api/portraits/men/1.jpg");
      }
    };
    loadProfileInfo();
  }, [user]);

  const pickImage = useCallback(async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission denied",
        "We need permission to access your gallery"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const mimeType = mime.getType(uri);

      const formData = new FormData();
      formData.append("avatar", {
        uri,
        type: mimeType,
        name: uri.split("/").pop(),
      });

      const userId = user?.id;
      const userEmail = user?.email;
      const currentRole = role;

      if (!userId || !userEmail || !currentRole) {
        Alert.alert("Error", "Missing user info (ID, email, or role).");
        return;
      }

      try {
        const response = await fetch(
          `https://trakerbackend.onrender.com/api/upload-avatar/${userId}?role=${currentRole}&email=${userEmail}`,
          {
            method: "POST",
            headers: { "Content-Type": "multipart/form-data" },
            body: formData,
          }
        );
        const data = await response.json();
        if (response.ok) {
          setAvatarUri(data.avatar);
          await AsyncStorage.setItem("profilePhoto", data.avatar);
          Alert.alert("Success", "Profile photo updated!");
        } else {
          Alert.alert("Upload Error", data.message || "Failed to upload.");
        }
      } catch (err) {
        Alert.alert("Upload Failed", "Something went wrong.");
      }
    }
  }, [user, role]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            await AsyncStorage.removeItem("profilePhoto");
            await AsyncStorage.removeItem("role");
            logout();
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  }, [logout]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.container,
          { paddingHorizontal: wp(6), paddingTop: hp(8), paddingBottom: hp(1) },
        ]}
      >
        <View style={[styles.header, { marginBottom: hp(3.5) }]}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={
                typeof avatarUri === "string"
                  ? { uri: avatarUri }
                  : require("../images/default-profile-image.png")
              }
              style={[
                styles.avatar,
                {
                  width: wp(30),
                  height: wp(30),
                  borderRadius: wp(15),
                  borderWidth: wp(0.7),
                  marginBottom: hp(2),
                },
              ]}
            />
          </TouchableOpacity>
          <Text style={[styles.name, { fontSize: wp(6) }]}>
            {user?.name || "Unknown User"}
          </Text>
          <Text style={[styles.email, { fontSize: wp(4) }]}>
            {user?.email || "No email provided"}
          </Text>
        </View>

        <View
          style={[
            styles.detailsContainer,
            { borderRadius: wp(4), padding: wp(5), marginBottom: hp(2.5) },
          ]}
        >
          <View style={[styles.detailItem, { marginBottom: hp(2) }]}>
            <Ionicons name="call-outline" size={wp(6)} color="#4b0082" />
            <Text
              style={[
                styles.detailText,
                { marginLeft: wp(4), fontSize: wp(4) },
              ]}
            >
              {user?.phone || "N/A"}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={wp(6)} color="#4b0082" />
            <Text
              style={[
                styles.detailText,
                { marginLeft: wp(4), fontSize: wp(4) },
              ]}
            >
              {user?.joinDate || "Member since 2025"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.menuContainer,
            {
              borderRadius: wp(4),
              paddingHorizontal: wp(5),
              marginBottom: hp(2.5),
            },
          ]}
        >
          <MenuItem
            icon="settings-outline"
            text="Settings"
            onPress={() => {}}
          />
          <MenuItem
            icon="help-circle-outline"
            text="Help & Support"
            onPress={() => {}}
          />
          <MenuItem
            icon="document-text-outline"
            text="Terms & Privacy"
            onPress={() => {}}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            { borderRadius: wp(2.5), padding: wp(4), borderWidth: wp(0.3) },
          ]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutButtonText, { fontSize: wp(4) }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
  container: { flex: 1 },
  header: { alignItems: "center" },
  avatar: { borderColor: "#4b0082" },
  name: { fontWeight: "bold", color: "#333" },
  email: { color: "#666" },
  detailsContainer: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  detailItem: { flexDirection: "row", alignItems: "center" },
  detailText: { color: "#333" },
  menuContainer: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 16,
  },
  menuText: { flex: 1, color: "#333" },
  logoutButton: {
    backgroundColor: "#fff",
    borderColor: "#ff4444",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  logoutButtonText: {
    color: "#ff4444",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default Profile;
