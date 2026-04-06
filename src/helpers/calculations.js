// Haversine formula to calculate distance between two coordinates
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const degToRad = (degrees) => degrees * (Math.PI / 180);

// Calculate ETA based on distance and speed
export const calculateETA = (distanceKm, speedKmH) => {
  if (!speedKmH || speedKmH <= 0 || !distanceKm) return null;
  const hours = distanceKm / speedKmH;
  const minutes = hours * 60;
  return {
    hours: Math.floor(hours),
    minutes: Math.floor(minutes % 60),
    seconds: Math.floor((minutes * 60) % 60),
    totalSeconds: Math.floor(hours * 3600)
  };
};

// Format ETA for display
export const formatETA = (eta) => {
  if (!eta) return '--';
  if (eta.minutes < 1) return `${eta.seconds} sec`;
  if (eta.hours < 1) return `${eta.minutes} min ${eta.seconds} sec`;
  return `${eta.hours}h ${eta.minutes}m`;
};

// Get bus status based on speed
export const getBusStatus = (speed, isOnline) => {
  if (!isOnline) return { text: 'Offline', color: '#EF4444', icon: 'wifi-outline' };
  if (speed <= 2) return { text: 'Stopped', color: '#F59E0B', icon: 'stop-circle' };
  if (speed <= 10) return { text: 'Slow', color: '#FBBF24', icon: 'speedometer' };
  return { text: 'Moving', color: '#22C55E', icon: 'speedometer' };
};