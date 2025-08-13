import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";



  useEffect(() => {
    const loadProfileInfo = async () => {
      try {
        const savedUri = await AsyncStorage.getItem("profilePhoto");
        const storedRole = await AsyncStorage.getItem("role");
        setRole(storedRole);
        setAvatarUri(savedUri || user?.avatar || DefaultProfileImage);
      } catch (e) {
        setAvatarUri(DefaultProfileImage);
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
  }, [user, role])