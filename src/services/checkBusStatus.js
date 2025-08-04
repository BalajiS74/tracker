// src/services/checkBusStatus.js
export const checkStatus = async (busID) => {
  if (!busID) return false;

  try {
    const res = await fetch(
      `https://bus-tracking-school-92dd9-default-rtdb.asia-southeast1.firebasedatabase.app/gps/${busID}.json`
    );
    const data = await res.json();
    const now = Date.now();

    if (data && data.lastSeen) {
      const lastSeen = data.lastSeen * 1000;
      const isRecent = now - lastSeen <= 30000;
      return data.status === true && isRecent;
    } else {
      return false;
    }
  } catch (err) {
    console.error("❌ Error fetching bus status:", err);
    return false;
  }
};
