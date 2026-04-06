import { useState, useEffect, useCallback } from 'react';
import { fetchBusLocation, findNearestStop, getDistanceToNextStop } from '../services/busTrackingService';
import { calculateETA } from '../helpers/calculations';

export const useBusTracking = (busId, stops, refreshToken, lastConfirmedStopRef) => {
  const [busInfo, setBusInfo] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentStopIdx, setCurrentStopIdx] = useState(-1);
  const [lastConfirmedStopIdx, setLastConfirmedStopIdx] = useState(-1);
  const [nextStop, setNextStop] = useState(null);
  const [eta, setEta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [distanceToNext, setDistanceToNext] = useState(null);

  const updateTracking = useCallback(async () => {
    if (!busId || stops.length === 0 || !refreshToken) return;

    try {
      const { busInfo: info, isOnline: online } = await fetchBusLocation(busId);
      setBusInfo(info);
      setIsOnline(online);

      if (!info?.latitude || !info?.longitude || !online) {
        setCurrentStopIdx(-1);
        setLoading(false);
        return;
      }

      // Find nearest stop
      const { nearestIdx, distance } = findNearestStop(info.latitude, info.longitude, stops);
      
      // Update indices based on proximity
      if (distance < 0.3 && nearestIdx > lastConfirmedStopRef.current) {
        setLastConfirmedStopIdx(nearestIdx);
        setCurrentStopIdx(nearestIdx);
        lastConfirmedStopRef.current = nearestIdx;
      } else {
        setCurrentStopIdx(nearestIdx);
      }

      // Set next stop
      const next = stops[nearestIdx + 1] || null;
      setNextStop(next);

      // Calculate distance to next stop
      const distToNext = getDistanceToNextStop(info.latitude, info.longitude, stops, nearestIdx);
      setDistanceToNext(distToNext);

      // Calculate ETA
      if (info.speed > 0 && distToNext) {
        const etaResult = calculateETA(distToNext, info.speed);
        setEta(etaResult);
      } else {
        setEta(null);
      }

      setLoading(false);
    } catch (error) {
      console.error('Tracking error:', error);
      setCurrentStopIdx(-1);
      setLoading(false);
    }
  }, [busId, stops, refreshToken, lastConfirmedStopRef]);

  useEffect(() => {
    updateTracking();
    const interval = setInterval(updateTracking, 5000);
    return () => clearInterval(interval);
  }, [updateTracking]);

  return {
    busInfo,
    isOnline,
    currentStopIdx,
    lastConfirmedStopIdx,
    nextStop,
    eta,
    loading,
    distanceToNext,
    refreshTracking: updateTracking
  };
};