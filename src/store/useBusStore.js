import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = "https://trakerbackend.onrender.com/api/buses";

const useBusStore = create((set, get) => ({
  buses: [],

  loadBuses: async () => {
    try {
      const res = await fetch(BASE_URL);
      const data = await res.json();
      set({ buses: data });
      await AsyncStorage.setItem("buses", JSON.stringify(data));
    } catch (err) {
      console.error('Error loading buses:', err);
      const storedData = await AsyncStorage.getItem("buses");
      if (storedData) set({ buses: JSON.parse(storedData) });
    }
  },

  setBuses: async (buses) => {
    set({ buses });
    await AsyncStorage.setItem("buses", JSON.stringify(buses));
  },

  toggleAllBuses: async (status) => {
    try {
      await fetch(`${BASE_URL}/toggleAll`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isNotAvailable: status }),
      });

      set((state) => ({
        buses: state.buses.map((bus) => ({
          ...bus,
          isNotAvailable: status,
        })),
      }));
    } catch (err) {
      console.error('Error toggling all buses:', err);
    }
  },

  toggleBus: async (busid, status) => {
    try {
      await fetch(`${BASE_URL}/toggle/${busid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isNotAvailable: status }),
      });

      set((state) => ({
        buses: state.buses.map((bus) =>
          bus.busid === busid
            ? { ...bus, isNotAvailable: status }
            : bus
        ),
      }));
    } catch (err) {
      console.error('Error toggling bus:', err);
    }
  },

  updateBusLocation: (busid, location) => {
    set((state) => ({
      buses: state.buses.map((bus) =>
        bus.busid === busid ? { ...bus, location } : bus
      ),
    }));
  },
}));

export default useBusStore;