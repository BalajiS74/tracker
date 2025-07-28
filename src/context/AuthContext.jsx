import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [role, setRole] = useState(null); // ✅ add role state
  const [relatedTo, setRelatedTo] = useState(null); // ✅ for parent/mentor link to student
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        const storedUser = await AsyncStorage.getItem("user");
        const storedRole = await AsyncStorage.getItem("role");
        const storedRelatedTo = await AsyncStorage.getItem("relatedTo");

        if (storedToken && storedUser) {
          setUserToken(storedToken);
          setUser(JSON.parse(storedUser));
          setRole(storedRole);
          if (storedRelatedTo) {
            setRelatedTo(JSON.parse(storedRelatedTo));
          }
        }
      } catch (error) {
        console.error("Error loading auth from storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // ✅ login with role & relatedTo
  const login = async (userData, token, userRole, relatedStudent = null) => {
    try {
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      await AsyncStorage.setItem("role", userRole);
      if (relatedStudent) {
        await AsyncStorage.setItem("relatedTo", JSON.stringify(relatedStudent));
      }

      if (userData?.parentdata?.phone) {
        await AsyncStorage.setItem("parentPhone", userData.parentdata.phone);
      }

      setUser(userData);
      setUserToken(token);
      setRole(userRole);
      if (relatedStudent) setRelatedTo(relatedStudent);
    } catch (error) {
      console.error("Login storage error:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "userToken",
        "user",
        "role",
        "relatedTo",
      ]);
      setUser(null);
      setUserToken(null);
      setRole(null);
      setRelatedTo(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userToken,
        role,
        relatedTo,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
