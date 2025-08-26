import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [role, setRole] = useState(null);
  const [relatedTo, setRelatedTo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = "http://10.141.109.19:5000"; // adjust if needed

  // Axios instance for auth requests
  const api = axios.create({ baseURL: API_URL });

  // Load stored auth data on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const [
          storedAccess,
          storedRefresh,
          storedUser,
          storedRole,
          storedRelated,
        ] = await Promise.all([
          AsyncStorage.getItem("accessToken"),
          AsyncStorage.getItem("refreshToken"),
          AsyncStorage.getItem("user"),
          AsyncStorage.getItem("role"),
          AsyncStorage.getItem("relatedTo"),
        ]);

        if (storedAccess && storedRefresh && storedUser) {
          setAccessToken(storedAccess);
          setRefreshToken(storedRefresh);
          setUser(JSON.parse(storedUser));
          setRole(storedRole);
          if (storedRelated) setRelatedTo(JSON.parse(storedRelated));
        }
      } catch (error) {
        console.error("❌ Auth load error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Login: store tokens & user info
  const login = async (
    userData,
    access,
    refresh,
    userRole,
    relatedStudent = null
  ) => {
    try {
      const roleToStore = userRole || "student"; // default role if undefined

      const tasks = [
        AsyncStorage.setItem("accessToken", access),
        AsyncStorage.setItem("refreshToken", refresh),
        AsyncStorage.setItem("user", JSON.stringify(userData)),
        AsyncStorage.setItem("role", roleToStore),
      ];
      console.log(`this is from tasks${access}`);
      console.log(`this is from tasks${refresh}`);

      if (relatedStudent) {
        tasks.push(
          AsyncStorage.setItem("relatedTo", JSON.stringify(relatedStudent))
        );
      }
      if (userData?.avatar) {
        tasks.push(AsyncStorage.setItem("profilePhoto", userData.avatar));
      }

      const setedtolocalstoreage = await Promise.all(tasks);
      if (setedtolocalstoreage) {
        setUser(userData);
        setAccessToken(access);
        setRefreshToken(refresh);
        setRole(roleToStore);
        console.log("login successfully");
      }
      if (relatedStudent) setRelatedTo(relatedStudent);
    } catch (error) {
      console.error("❌ Login error:", error);
    }
  };

  // Logout: remove tokens & user data
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "accessToken",
        "refreshToken",
        "user",
        "role",
        "relatedTo",
        "profilePhoto",
      ]);
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setRole(null);
      setRelatedTo(null);
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  // Refresh access token using refresh token
  const refreshAccessToken = async () => {
    if (!refreshToken) return null;

    try {
      const res = await axios.post(`${API_URL}/api/auth/refresh-token`, {
        token: refreshToken,
      });
      const newAccess = res.data.accessToken;
      await AsyncStorage.setItem("accessToken", newAccess);
      setAccessToken(newAccess);
      return newAccess;
    } catch (error) {
      console.error("❌ Refresh token error:", error);
      await logout();
      return null;
    }
  };

  // API helper with automatic token refresh
  const apiRequest = async (endpoint, options = {}) => {
    try {
      const token = accessToken;

      const res = await api({
        url: endpoint,
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });

      return res.data;
    } catch (err) {
      // If 401, try refreshing token
      if (err.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (!newToken) throw err;

        const retryRes = await api({
          url: endpoint,
          ...options,
          headers: {
            Authorization: `Bearer ${newToken}`,
            ...(options.headers || {}),
          },
        });

        return retryRes.data;
      }

      throw err;
    }
  };

  // Refresh user data in AsyncStorage
  const refreshUser = async (newUserData) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(newUserData));
      if (newUserData?.avatar)
        await AsyncStorage.setItem("profilePhoto", newUserData.avatar);
      setUser(newUserData);
    } catch (error) {
      console.error("❌ User refresh error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        role,
        relatedTo,
        isLoading,
        login,
        logout,
        refreshUser,
        refreshAccessToken,
        apiRequest,
        api, // optional axios instance
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
