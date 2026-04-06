import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const globalDataFetcher = async (url) => {
  try {
    const response = await axios.get(url);
    const now = Date.now();
      const lastSeen = response.data?.lastSeen ? response.data.lastSeen * 1000 : 0;
      const isRecent = now - lastSeen <= 30000;
      const isBusOnline = response.data?.status === true && isRecent;
   return {
    data: response.data,
    isBusOnline,
  };
  } catch (error) {
    console.error("Error fetching global data:", error);
    throw error;
  }
};


export const getRouteData = async (busID) => {
  try {
    const storedRoutes = await AsyncStorage.getItem("routes");
    const routes = storedRoutes ? JSON.parse(storedRoutes) : {};
    if (routes[busID]) {
      return routes[busID];
    }
    // Fallback to static files
    const files = {
      BUS123: require("../routedata/BUS123.json"),
      BUS456: require("../routedata/BUS456.json"),
      BUS789: require("../routedata/BUS789.json"),
      BUS1011: require("../routedata/BUS1011.json"),
    };
    return files[busID] || null;
  } catch (e) {
    return null;
  }
};

export const saveRouteData = async (busID, routeData) => {
  try {
    const storedRoutes = await AsyncStorage.getItem("routes");
    const routes = storedRoutes ? JSON.parse(storedRoutes) : {};
    routes[busID] = routeData;
    await AsyncStorage.setItem("routes", JSON.stringify(routes));
  } catch (e) {
    console.error("Error saving route data:", e);
  }
};

export const getAllRoutes = async () => {
  try {
    const storedRoutes = await AsyncStorage.getItem("routes");
    const dynamicRoutes = storedRoutes ? JSON.parse(storedRoutes) : {};
    const staticRoutes = {
      BUS123: require("../routedata/BUS123.json"),
      BUS456: require("../routedata/BUS456.json"),
      BUS789: require("../routedata/BUS789.json"),
      BUS1011: require("../routedata/BUS1011.json"),
    };
    return { ...staticRoutes, ...dynamicRoutes };
  } catch (e) {
    return {};
  }
};

export const deleteRouteData = async (busID) => {
  try {
    const storedRoutes = await AsyncStorage.getItem("routes");
    const routes = storedRoutes ? JSON.parse(storedRoutes) : {};
    delete routes[busID];
    await AsyncStorage.setItem("routes", JSON.stringify(routes));
  } catch (e) {
    console.error("Error deleting route data:", e);
  }
};
