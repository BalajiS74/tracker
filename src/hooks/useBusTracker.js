// src/hooks/useBusTracker.js
import { useEffect, useCallback,useState } from "react";

export function useBusTracker({
  busID,
  routeData,
  lastConfirmedStopIdx,
  setBusInfo,
  setCurrentStopIdx,
  setLastConfirmedStopIdx,
  setLoading,
  calculateDistance,
}) {
  const fetchCurrentLocation = useCallback(async () => {
    if (!routeData || !busID) return;

    const firebaseURL = `https://bus-tracking-school-92dd9-default-rtdb.asia-southeast1.firebasedatabase.app/gps/${busID}.json`;

    try {
      const res = await fetch(firebaseURL);
      const data = await res.json();
      
      setBusInfo(data);

      if (!data?.lat || !data?.lng) {
        setCurrentStopIdx(-1);
        setLoading(false);
        return;
      }

      let minDist = Infinity;
      let nearestIdx = -1;
      routeData.stops.forEach((stop, idx) => {
        const d = calculateDistance(data.lat, data.lng, stop.lat, stop.lng);
        if (d < minDist) {
          minDist = d;
          nearestIdx = idx;
        }
      });

      if (minDist < 300 && nearestIdx > lastConfirmedStopIdx) {
        setLastConfirmedStopIdx(nearestIdx);
      }

      setCurrentStopIdx(nearestIdx);
      setLoading(false);
    } catch (e) {
      console.error("Failed to fetch bus location:", e);
      setCurrentStopIdx(-1);
      setLoading(false);
    }
  }, [
    routeData,
    busID,
    lastConfirmedStopIdx,
    setBusInfo,
    setCurrentStopIdx,
    setLastConfirmedStopIdx,
    setLoading,
  ]);

  useEffect(() => {
    fetchCurrentLocation();
    const interval = setInterval(fetchCurrentLocation, 5000);
    return () => clearInterval(interval);
  }, [fetchCurrentLocation]);

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  return { fetchCurrentLocation }; // Optional, if you want to call manually too
}


export const useETA = (busInfo, currentStopIdx, routeData) => {
  const [etaToNextStop, setEtaToNextStop] = useState("--");
  const [countdown, setCountdown] = useState("--");

  useEffect(() => {
    if (
      busInfo?.speed > 0 &&
      currentStopIdx + 1 < routeData?.stops?.length &&
      busInfo?.lat &&
      busInfo?.lng
    ) {
      const nextStop = routeData.stops[currentStopIdx + 1];
      const dist = calculateDistance(
        busInfo.lat,
        busInfo.lng,
        nextStop.lat,
        nextStop.lng
      );
      const speedMS = (busInfo.speed * 1000) / 3600; // km/h to m/s
      const etaSec = speedMS > 0 ? dist / speedMS : null;

      if (etaSec) {
        setEtaToNextStop(`${Math.floor(etaSec / 60)} min ${Math.floor(etaSec % 60)} sec`);
        setCountdown(`${Math.max(0, Math.floor(etaSec))} sec`);
      } else {
        setEtaToNextStop("--");
        setCountdown("--");
      }
    } else {
      setEtaToNextStop("--");
      setCountdown("--");
    }
  }, [busInfo, currentStopIdx, routeData]);
  console.log(currentStopIdx);
  
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  return { etaToNextStop, countdown };
};


export function useArrivalNotification({
  busInfo,
  nearestUserStop,
  notified,
  setNotified,
  calculateDistance,
}) {
  useEffect(() => {
    if (!notified && nearestUserStop && busInfo?.lat && busInfo?.lng) {
      const dist = calculateDistance(
        busInfo.lat,
        busInfo.lng,
        nearestUserStop.lat,
        nearestUserStop.lng
      );

      if (dist < 100) {
        Alert.alert(
          "Bus Alert",
          `Bus is arriving at your nearest stop: ${nearestUserStop.name}`
        );
        setNotified(true);
      }
    }
  }, [busInfo, nearestUserStop, notified]);
}
