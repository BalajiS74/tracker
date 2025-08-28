// BusContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BusContext = createContext();

export const BusProvider = ({ children }) => {
  const [buses, setBuses] = useState([]);

  const BASE_URL = "https://trakerbackend.onrender.com/api/buses"; // replace with your backend

  // Load from backend or AsyncStorage on first render
  useEffect(() => {
    const loadBuses = async () => {
      try {
        const res = await fetch(BASE_URL);
        const data = await res.json();
        setBuses(data);
        await AsyncStorage.setItem("buses", JSON.stringify(data));
      } catch (err) {
        const storedData = await AsyncStorage.getItem("buses");
        if (storedData) setBuses(JSON.parse(storedData));
      }
    };
    loadBuses();
  }, []);

  // Save to storage whenever buses change
  useEffect(() => {
    AsyncStorage.setItem("buses", JSON.stringify(buses));
  }, [buses]);

  // Toggle all buses availability (both locally and backend)
  const toggleAllBuses = async (status) => {
    try {
      await fetch(`${BASE_URL}/toggleAll`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isNotAvailable: status }),
      });
      setBuses((prev) =>
        prev.map((bus) => ({ ...bus, isNotAvailable: status }))
      );
    } catch (err) {
      console.log(err);
    }
  };

  // Toggle particular bus
  const toggleBus = async (busid, status) => {
    try {
      await fetch(`${BASE_URL}/toggle/${busid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isNotAvailable: status }),
      });
      setBuses((prev) =>
        prev.map((bus) =>
          bus.busid === busid ? { ...bus, isNotAvailable: status } : bus
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <BusContext.Provider value={{ buses, toggleAllBuses, toggleBus }}>
      {children}
    </BusContext.Provider>
  );
};

export const useBus = () => useContext(BusContext);
