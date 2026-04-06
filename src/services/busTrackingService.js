import { globalDataFetcher } from './getdata';
import { calculateDistance } from '../helpers/calculations';
// Fetch bus location from Firebase
export const fetchBusLocation = async (busId) => {
  const firebaseURL = process.env.EXPO_PUBLIC_FIREBASE_URL.replace('${busId}', busId);
  const { data, isBusOnline } = await globalDataFetcher(firebaseURL);
  return { busInfo: data, isOnline: isBusOnline };
};

// Find nearest stop based on current location
export const findNearestStop = (latitude, longitude, stops) => {
  let minDist = Infinity;
  let nearestIdx = -1;
  
  stops.forEach((stop, idx) => {
    const d = calculateDistance(latitude, longitude, stop.lat, stop.lng);
    if (d < minDist) {
      minDist = d;
      nearestIdx = idx;
    }
  });
  
  return { nearestIdx, distance: minDist };
};

// Calculate distance to next stop
export const getDistanceToNextStop = (busLat, busLng, stops, currentIdx) => {
  if (currentIdx + 1 >= stops.length) return null;
  const nextStop = stops[currentIdx + 1];
  return calculateDistance(busLat, busLng, nextStop.lat, nextStop.lng);
};

// Reverse route with recalculated distances
export const reverseRouteWithDistances = (stops, calculateDistanceFn) => {
  const reversed = [...stops].reverse();
  let cumulative = 0;
  
  return reversed.map((stop, idx) => {
    let distanceToNext = 0;
    let nextStopName = null;
    
    if (idx < reversed.length - 1) {
      const next = reversed[idx + 1];
      distanceToNext = calculateDistanceFn(stop.lat, stop.lng, next.lat, next.lng);
      nextStopName = next.name;
    }
    
    cumulative += distanceToNext;
    
    return {
      ...stop,
      nextStop: nextStopName,
      to_next_distance_km: distanceToNext.toFixed(3),
      cumulative_km_to_next: cumulative.toFixed(3),
    };
  });
};

// Fetch driver details (mock - replace with actual API)
export const fetchDriverDetails = async (busId) => {
  // Simulate API call
  return {
    driverId: `DRV${busId.slice(-3)}`,
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh.kumar@scadbus.com',
    licenseNumber: 'TN-07-2024-001234',
    experience: '8 years',
    rating: 4.8,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    joiningDate: '2022-01-15',
    status: 'active'
  };
};