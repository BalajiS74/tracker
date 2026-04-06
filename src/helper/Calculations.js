//  _______________________helpers___________________________________
// helper/Calculations.js - Fixed distance calculation

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) *
      Math.cos(degToRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 1000) / 1000; // Round to 3 decimal places
};

const degToRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Alternative: If you want distance in meters
export const calculateDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  return calculateDistance(lat1, lon1, lat2, lon2) * 1000;
};

// For debugging - log distances
export const logDistance = (lat1, lon1, lat2, lon2) => {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  console.log(`Distance: ${distance} km`);
  return distance;
};
//__________________________________________________________________

export function calculateBearing(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (d) => (d * 180) / Math.PI;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360; // degrees
}
export function calculateDestination(lat, lon, bearing, distance) {
  const R = 6371e3;
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (d) => (d * 180) / Math.PI;
  const φ1 = toRad(lat);
  const λ1 = toRad(lon);
  const θ = toRad(bearing);
  const δ = distance / R;
  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ),
  );
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2),
    );
  return {
    lat: toDeg(φ2),
    lon: toDeg(λ2),
  };
}
//__________________________________________________________________
export function calculateMidpoint(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (d) => (d * 180) / Math.PI;
  const φ1 = toRad(lat1);
  const λ1 = toRad(lon1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);
  const Bx = Math.cos(φ2) * Math.cos(Δλ);
  const By = Math.cos(φ2) * Math.sin(Δλ);
  const φm = Math.atan2(
    Math.sin(φ1) + Math.sin(φ2),
    Math.sqrt((Math.cos(φ1) + Bx) ** 2 + By ** 2),
  );
  const λm = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);
  return {
    lat: toDeg(φm),
    lon: toDeg(λm),
  };
}

// call the functions for example
// const dist = calculateDistance(51.5, -0.1, 38.8, -77.1);
// const bear = calculateBearing(51.5, -0.1, 38.8, -77.1);
// const dest = calculateDestination(51.5, -0.1, 270, 10000);
// const mid = calculateMidpoint(51.5, -0.1, 38.8, -77.1);
// console.log('Distance:', dist, 'meters');
// console.log('Bearing:', bear, 'degrees');
// console.log('Destination:', dest);
// console.log('Midpoint:', mid);

export function calculateDelayedTime(distance, speed, scheduledTime) {
  // 1️⃣ Travel time in seconds
  const travelTimeSec = distance / speed;

  // 2️⃣ Convert "HH:MM" → total seconds
  const [hours, minutes] = scheduledTime.split(":").map(Number);
  const scheduledSec = (hours * 60 + minutes) * 60;

  // 3️⃣ Delayed time in seconds
  const delayedSec = scheduledSec + travelTimeSec;

  // 4️⃣ Convert back to HH:MM format
  const delayedHours = Math.floor(delayedSec / 3600) % 24;
  const delayedMinutes = Math.floor((delayedSec % 3600) / 60);

  return {
    originalTime: scheduledTime,
    delayedTime: `${delayedHours}:${delayedMinutes
      .toString()
      .padStart(2, "0")}`,
  };
}
const result = calculateDelayedTime(4200, 10, "7:43");

console.log("Original time:", result.originalTime);
console.log("Delayed time:", result.delayedTime);
