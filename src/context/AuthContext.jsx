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

  const API_URL = "https://trakerbackend.onrender.com"; // adjust if needed
  const api = axios.create({ baseURL: API_URL });

  // --- Refresh token queue ---
  let isRefreshing = false;
  let refreshSubscribers = [];

  const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);
  const onRefreshed = (newToken) => {
    refreshSubscribers.forEach((cb) => cb(newToken));
    refreshSubscribers = [];
  };

  // --- Load stored auth on mount ---
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

        if (storedRefresh && storedUser) {
          setUser(JSON.parse(storedUser));
          setAccessToken(storedAccess);
          setRefreshToken(storedRefresh);
          setRole(storedRole);
          if (storedRelated) setRelatedTo(JSON.parse(storedRelated));
        }
      } catch (error) {
        console.error("❌ Auth load error:", error);
        await logout();
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredAuth();
  }, []);

  // --- Login ---
  const login = async (userData, access, refresh, userRole, relatedStudent = null) => {
    try {
      const roleToStore = userRole || "student";

      const tasks = [
        AsyncStorage.setItem("accessToken", access),
        AsyncStorage.setItem("refreshToken", refresh),
        AsyncStorage.setItem("user", JSON.stringify(userData)),
        AsyncStorage.setItem("role", roleToStore),
      ];

      if (relatedStudent) {
        tasks.push(AsyncStorage.setItem("relatedTo", JSON.stringify(relatedStudent)));
      }
      if (userData?.avatar) {
        tasks.push(AsyncStorage.setItem("profilePhoto", userData.avatar));
      }

      await Promise.all(tasks);

      setUser(userData);
      setAccessToken(access);
      setRefreshToken(refresh);
      setRole(roleToStore);
      if (relatedStudent) setRelatedTo(relatedStudent);
    } catch (error) {
      console.error("❌ Login error:", error);
    }
  };

  // --- Logout ---
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

  // --- Refresh access token ---
  const refreshAccessToken = async () => {
    const storedRefresh = await AsyncStorage.getItem("refreshToken");
    if (!storedRefresh) return null;

    if (isRefreshing) {
      return new Promise((resolve) => subscribeTokenRefresh(resolve));
    }

    isRefreshing = true;

    try {
      const res = await axios.post(`${API_URL}/api/auth/refresh-token`, { token: storedRefresh });
      const { accessToken: newAccess, refreshToken: newRefresh } = res.data;

      if (newRefresh) {
        await AsyncStorage.setItem("refreshToken", newRefresh);
        setRefreshToken(newRefresh);
      }

      if (newAccess) {
        await AsyncStorage.setItem("accessToken", newAccess);
        setAccessToken(newAccess);
      }

      onRefreshed(newAccess);
      return newAccess;
    } catch (err) {
      console.error("❌ Refresh token error:", err.response?.data || err);
      await logout();
      throw err;
    } finally {
      isRefreshing = false;
    }
  };

  // --- API helper with automatic retry ---
  const apiRequest = async (endpoint, options = {}) => {
    const makeRequest = async (token) =>
      api({ url: endpoint, ...options, headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) } });

    try {
      const storedAccess = await AsyncStorage.getItem("accessToken");
      return (await makeRequest(storedAccess)).data;
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        const newToken = await refreshAccessToken();
        if (!newToken) throw err;
        return (await makeRequest(newToken)).data;
      }
      throw err;
    }
  };

  // --- Refresh user in AsyncStorage ---
  const refreshUser = async (newUserData) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(newUserData));
      if (newUserData?.avatar) await AsyncStorage.setItem("profilePhoto", newUserData.avatar);
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
        api,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
