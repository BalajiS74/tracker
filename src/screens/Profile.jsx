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
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import DefaultProfileImage from "../images/default-profile-image.png";

const API_BASE_URL = "https://trakerbackend.onrender.com";

const MenuItem = memo(({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={24} color="#4b0082" />
    <Text style={[styles.menuText, { marginLeft: 16 }]}>{text}</Text>
    <Ionicons name="chevron-forward" size={20} color="#ccc" />
  </TouchableOpacity>
));

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigation = useNavigation();
  const [avatarUri, setAvatarUri] = useState(null);
  const [windowDimensions, setWindowDimensions] = useState(
    Dimensions.get("window")
  );

  const wp = (p) => windowDimensions.width * (p / 100);
  const hp = (p) => windowDimensions.height * (p / 100);

  useEffect(() => {
    const loadAvatar = async () => {
      const saved = await AsyncStorage.getItem("profilePhoto");
      if (saved) {
        setAvatarUri(saved);
      } else if (user?.avatar) {
        const fullUrl = `${API_BASE_URL}${user.avatar}`;
        setAvatarUri(fullUrl);
        await AsyncStorage.setItem("profilePhoto", fullUrl);
      }
    };
    loadAvatar();
  }, [user]);

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", () =>
      setWindowDimensions(Dimensions.get("window"))
    );
    return () => sub?.remove();
  }, []);

  const pickImage = async () => {
    try {
      const { granted } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!granted) {
        Alert.alert("Permission Denied", "You need to allow media access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const pickedUri = result.assets[0].uri;
        await uploadAvatar(pickedUri);
      } else {
        console.log("User cancelled image picker.");
      }
    } catch (err) {
      console.error("Image Picker Error:", err);
      Alert.alert("Error", "Image picker failed.");
    }
  };

  const uploadAvatar = async (uri) => {
    try {
      const fileName = uri.split("/").pop();
      const ext = fileName.split(".").pop();
      const mimeType = `image/${ext}`;

      const formData = new FormData();
      formData.append("avatar", {
        uri,
        name: fileName,
        type: mimeType,
      });

      const res = await fetch(`${API_BASE_URL}/api/auth/upload-avatar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        const fullUrl = `${API_BASE_URL}${data.avatarUrl}`;
        setAvatarUri(fullUrl);
        await AsyncStorage.setItem("profilePhoto", fullUrl);
        Alert.alert("Success", "Profile photo updated!");
      } else {
        Alert.alert("Error", data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Upload error", "Something went wrong.");
    }
  };

  const handleLogout = useCallback(() => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.clear();
          logout();
        },
        style: "destructive",
      },
    ]);
  }, [logout]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.container,
          { paddingHorizontal: wp(6), paddingTop: hp(8) },
        ]}
      >
        <View style={[styles.header, { marginBottom: hp(3.5) }]}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={avatarUri ? { uri: avatarUri } : DefaultProfileImage}
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
            {user?.name || "Unknown"}
          </Text>
          <Text style={[styles.email, { fontSize: wp(4) }]}>
            {user?.email || "No email"}
          </Text>
        </View>

        <View
          style={[
            styles.detailsContainer,
            { padding: wp(5), borderRadius: wp(4), marginBottom: hp(2.5) },
          ]}
        >
          <View style={[styles.detailItem, { marginBottom: hp(2) }]}>
            <Ionicons name="call-outline" size={wp(6)} color="#4b0082" />
            <Text style={[styles.detailText, { fontSize: wp(4) }]}>
              {user?.phone || "N/A"}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={wp(6)} color="#4b0082" />
            <Text style={[styles.detailText, { fontSize: wp(4) }]}>
              {user?.joinDate || "2025"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.menuContainer,
            { borderRadius: wp(4), paddingHorizontal: wp(5) },
          ]}
        >
          <MenuItem icon="settings-outline" text="Settings" onPress={() => {}} />
          <MenuItem
            icon="help-circle-outline"
            text="Help & Support"
            onPress={() => navigation.navigate("HelpSupport")}
          />
          <MenuItem
            icon="document-text-outline"
            text="Terms & Privacy"
            onPress={() => navigation.navigate("TermsPrivacy")}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            { borderRadius: wp(2.5), padding: wp(2), borderWidth: wp(0.3) },
          ]}
          onPress={handleLogout}
        >
          <Text
            style={[
              styles.logoutButtonText,
              { fontSize: wp(4), lineHeight: wp(5) },
            ]}
          >
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
  detailText: {
    color: "#333",
    fontWeight: "500",
    marginLeft: 10,
    flex: 1,
    textAlign: "left",
    lineHeight: 20,
  },
  menuContainer: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 16,
  },
  menuText: {
    flex: 1,
    color: "#333",
    fontWeight: "500",
    lineHeight: 15,
    padding: 10,
  },
  logoutButton: {
    backgroundColor: "#fff",
    borderColor: "#ff4444",
    alignItems: "center",
    justifyContent: "center",
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
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});

export default Profile;
