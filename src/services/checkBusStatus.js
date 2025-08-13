<<<<<<< HEAD
// src/services/checkBusStatus.js
// import * as Notifications from 'expo-notifications';
// import haversine from 'haversine-distance'; // distance calculation

export const checkStatus = async (busID) => {
  if (!busID) return false;
=======
export const checkStatus = async (bus) => {
  const busID = bus.busID || bus.id; // Ensure busID is defined
  if (!busID) return;
>>>>>>> 94f820d72ce582d368de01463ed3c39ba57fbc95

  try {
    const res = await fetch(
      `https://bus-tracking-school-92dd9-default-rtdb.asia-southeast1.firebasedatabase.app/gps/${busID}.json`
    );
    const data = await res.json();
<<<<<<< HEAD
    const now = Date.now();

    if (data && data.lastSeen) {
      const lastSeen = data.lastSeen * 1000;
      const isRecent = now - lastSeen <= 30000;
      return data.status === true && isRecent;
    }
    return false;
  } catch (err) {
    console.error(`❌ Error fetching bus status for ${busID}:`, err);
    return false;
  }
};

// function checkDelayAlert(scheduledTime, eta) {
//   const delayMinutes = eta - scheduledTime;
//   if (delayMinutes > 5) {
//     sendNotification("Bus Delay ⏳", `Your bus is running ${delayMinutes} minutes late.`);
//   }
// }


// function checkArrivalAlert(busCoords, studentCoords) {
//   const distance = haversine(busCoords, studentCoords); // in meters
//   if (distance <= 500) {
//     Notifications.scheduleNotificationAsync({
//       content: {
//         title: "Bus is Almost Here 🚍",
//         body: "Your bus is just 500 meters away!",
//       },
//       trigger: null
//     });
//   }
// }
=======
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
>>>>>>> 94f820d72ce582d368de01463ed3c39ba57fbc95
