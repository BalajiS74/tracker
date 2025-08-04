export const checkStatus = async (bus) => {
  const busID = bus.busID || bus.id; // Ensure busID is defined
  if (!busID) return;

  try {
    const res = await fetch(
      `https://bus-tracking-school-92dd9-default-rtdb.asia-southeast1.firebasedatabase.app/gps/${busID}.json`
    );
    const data = await res.json();
    const now = Date.now(); // current time in ms

    if (data && data.lastSeen) {
      const lastSeen = data.lastSeen * 1000; // convert to ms
      const isRecent = now - lastSeen <= 30000; // 30 seconds threshold

      setIsOnline(data.status === true && isRecent);
    } else {
      setIsOnline(false);
    }
  } catch (err) {
    console.error("❌ Error fetching bus status:", err);
    setIsOnline(false);
  }
};
