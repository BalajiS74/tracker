import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "https://trakerbackend.onrender.com"; // adjust if needed
const api = axios.create({ baseURL: API_URL });

// Refresh token queue
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  role: null,
  relatedTo: null,
  isLoading: true,

  // Load stored auth on mount
  loadStoredAuth: async () => {
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
        set({
          user: JSON.parse(storedUser),
          accessToken: storedAccess,
          refreshToken: storedRefresh,
          role: storedRole,
          relatedTo: storedRelated,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Error loading auth:", error);
      set({ isLoading: false });
    }
  },

  // Login function
  login: async (payload) => {
    try {
      let data;

      if (payload?.email && payload?.password) {
        const res = await api.post("/auth/login", payload);
        data = res.data;
      } else {
        data = payload;
      }

      const accessToken = data.accessToken || data.access_token;
      const refreshToken = data.refreshToken || data.refresh_token;
      const user = data.user;
      const role = data.role || data.user?.role;
      const relatedTo =
        data.relatedTo || data.related_to || data.user?.relatedTo;

      if (!accessToken || !refreshToken) {
        throw new Error("Login response missing required tokens");
      }

      set({
        user,
        accessToken,
        refreshToken,
        role,
        relatedTo,
      });

      await Promise.all([
        AsyncStorage.setItem("accessToken", accessToken),
        AsyncStorage.setItem("refreshToken", refreshToken),
        AsyncStorage.setItem("user", JSON.stringify(user)),
        AsyncStorage.setItem("role", role || ""),
        AsyncStorage.setItem(
          "relatedTo",
          relatedTo ? JSON.stringify(relatedTo) : "",
        ),
      ]);
    } catch (error) {
      console.error("Login error in store:", error);
      throw error;
    }
  },

  // Logout
  // Update your logout function in useAuthStore.js
  logout: async () => {
    try {
      // Clear state first (faster UI response)
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        role: null,
        relatedTo: null,
      });

      // Clear AsyncStorage in parallel (faster)
      await Promise.all([
        AsyncStorage.removeItem("accessToken"),
        AsyncStorage.removeItem("refreshToken"),
        AsyncStorage.removeItem("user"),
        AsyncStorage.removeItem("role"),
        AsyncStorage.removeItem("relatedTo"),
      ]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  },
  // Refresh token
  refreshAccessToken: async () => {
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => resolve(newToken));
      });
    }

    isRefreshing = true;
    try {
      const { refreshToken } = get();
      const res = await api.post("/auth/refresh", { refreshToken });
      const { accessToken } = res.data;

      set({ accessToken });
      await AsyncStorage.setItem("accessToken", accessToken);

      onRefreshed(accessToken);
      return accessToken;
    } catch (error) {
      await get().logout();
      throw error;
    } finally {
      isRefreshing = false;
    }
  },

  // Axios interceptor setup (call this in App.js or provider)
  setupAxiosInterceptors: () => {
    api.interceptors.request.use(
      async (config) => {
        const { accessToken } = get();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            const newToken = await get().refreshAccessToken();
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return api(error.config);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      },
    );
  },

  // API request helper
  apiRequest: async (endpoint, options = {}) => {
    try {
      const response = await api(endpoint, options);
      console.log("this is from auth api", response.data);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
}));

export default useAuthStore;
