
import {globalDataFetcher} from "./getdata";
export const checkStatus = async (busID) => {
  if (!busID) return false;

  try {
    const data = await globalDataFetcher(
      `https://bus-tracking-school-92dd9-default-rtdb.asia-southeast1.firebasedatabase.app/gps/${busID}.json`
    );
    // const data = await res.json();
    const now = Date.now();

    if (data && data.lastSeen) {
     const lastSeen = data?.lastSeen ? data.lastSeen * 1000 : 0;
      const isRecent = now - lastSeen <= 30000;
      return data?.status === true && isRecent;
    }
    return false;
  } catch (err) {
    console.error(`❌ Error fetching bus status for ${busID}:`, err);
    return false;
  }
};

