import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [role, setRole] = useState(null);
  const [relatedTo, setRelatedTo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const [storedToken, storedUser, storedRole, storedRelatedTo] =
          await Promise.all([
            AsyncStorage.getItem("userToken"),
            AsyncStorage.getItem("user"),
            AsyncStorage.getItem("role"),
            AsyncStorage.getItem("relatedTo"),
          ]);

        if (storedToken && storedUser) {
          setUserToken(storedToken);
          setUser(JSON.parse(storedUser));
          setRole(storedRole);
          if (storedRelatedTo) {
            setRelatedTo(JSON.parse(storedRelatedTo));
          }
        }
      } catch (error) {
        console.error("Auth load error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const login = async (userData, token, userRole, relatedStudent = null) => {
    try {
      const tasks = [
        AsyncStorage.setItem("userToken", token),
        AsyncStorage.setItem("user", JSON.stringify(userData)),
        AsyncStorage.setItem("role", userRole),
      ];

      if (relatedStudent) {
        tasks.push(
          AsyncStorage.setItem("relatedTo", JSON.stringify(relatedStudent))
        );
      }

      // Save emergency phone for student or staff
      if (userData?.role === "student" && userData.parents?.length > 0) {
        tasks.push(
          AsyncStorage.setItem("parentPhone", userData.parents[0].phone)
        );
      }

      if (
        userData?.role === "staff" &&
        userData.emergencyContact?.phone
      ) {
        tasks.push(
          AsyncStorage.setItem(
            "emergencyPhone",
            userData.emergencyContact.phone
          )
        );
      }

      // Save avatar URL from user
      if (userData?.avatar) {
        tasks.push(
          AsyncStorage.setItem("profilePhoto", userData.avatar)
        );
      }

      await Promise.all(tasks);

      setUser(userData);
      setUserToken(token);
      setRole(userRole);
      if (relatedStudent) setRelatedTo(relatedStudent);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "userToken",
        "user",
        "role",
        "relatedTo",
        "parentPhone",
        "emergencyPhone",
        "profilePhoto",
      ]);
      setUser(null);
      setUserToken(null);
      setRole(null);
      setRelatedTo(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshUser = async (newUserData) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(newUserData));
      if (newUserData.avatar) {
        await AsyncStorage.setItem("profilePhoto", newUserData.avatar);
      }
      setUser(newUserData);
    } catch (error) {
      console.error("User refresh error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userToken,
        role,
        relatedTo,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
