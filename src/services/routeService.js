// Helper function for handling fetch responses
const handleResponse = async (response) => {
  console.log(`📡 API Response: ${response.status} ${response.url}`);

  const responseText = await response.text();

  // Check if response is HTML
  if (responseText.trim().startsWith("<")) {
    console.error("❌ Server returned HTML instead of JSON");
    throw new Error(
      `API returned HTML. Please check if backend is running correctly.`,
    );
  }

  // Try to parse JSON
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    console.error("❌ Failed to parse JSON:", responseText.substring(0, 200));
    throw new Error(`Invalid JSON response: ${e.message}`);
  }

  // Check if response was successful
  if (!response.ok) {
    throw new Error(
      data.message || data.error || `HTTP error! status: ${response.status}`,
    );
  }

  return data;
};

// Helper function for making API requests
const apiRequest = async (url, method, body = null) => {
  const fullUrl = `${process.env.EXPO_PUBLIC_BACKEND_URL}${url}`;
  console.log(`📡 API Request: ${method} ${fullUrl}`);
  if (body) {
    console.log("Request data:", JSON.stringify(body, null, 2));
  }

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(fullUrl, options);
    return await handleResponse(response);
  } catch (error) {
    console.error(`❌ API Error (${method} ${url}):`, error.message);
    throw error;
  }
};

// Get all routes/buses
export const getRoutes = async () => {
  try {
    const data = await apiRequest("/buses", "GET");
    return data;
  } catch (error) {
    console.error("Get routes error:", error);
    throw error;
  }
};

// Create a new route/bus - FIXED: Using 'busid' instead of 'busID'
export const createRoute = async (routeData) => {
  try {
    // Transform the data to match backend schema
    const payload = {
      busid: routeData.busID, // Changed from busID to busid (lowercase)
      routeName: routeData.routeName,
      stops: routeData.stops.map((stop) => ({
        name: stop.name,
        lat: stop.lat,
        lng: stop.lng,
        isStartingPoint: stop.isStartingPoint,
        m: stop.m,
        nextStop: stop.nextStop,
        to_next_distance_km: stop.to_next_distance_km,
        cumulative_km_to_next: stop.cumulative_km_to_next,
      })),
    };

    console.log("📡 Transformed payload:", JSON.stringify(payload, null, 2));

    const data = await apiRequest("/buses", "POST", payload);
    console.log("✅ Route created successfully");
    return data;
  } catch (error) {
    console.error("Create route error:", error);
    throw error;
  }
};

// Update an existing route/bus
export const updateRoute = async (id, routeData) => {
  try {
    // Transform the data to match backend schema
    const payload = {
      busid: routeData.busID, // Changed from busID to busid (lowercase)
      routeName: routeData.routeName,
      stops: routeData.stops.map((stop) => ({
        name: stop.name,
        lat: stop.lat,
        lng: stop.lng,
        isStartingPoint: stop.isStartingPoint,
        m: stop.m,
        nextStop: stop.nextStop,
        to_next_distance_km: stop.to_next_distance_km,
        cumulative_km_to_next: stop.cumulative_km_to_next,
      })),
    };

    const data = await apiRequest(`/buses/${id}`, "PUT", payload);
    console.log(`✅ Route ${id} updated successfully`);
    return data;
  } catch (error) {
    console.error("Update route error:", error);
    throw error;
  }
};

// Delete a route/bus
export const deleteRoute = async (id) => {
  try {
    const data = await apiRequest(`/buses/${id}`, "DELETE");
    console.log(`✅ Route ${id} deleted successfully`);
    return data;
  } catch (error) {
    console.error("Delete route error:", error);
    throw error;
  }
};
