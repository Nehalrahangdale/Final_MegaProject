import API from "./api";

// ===============================
// Distance Calculation (Haversine)
// ===============================
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);
  if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) return null;

  const R = 6371; // Earth radius in km
  const dLat = ((nLat2 - nLat1) * Math.PI) / 180;
  const dLon = ((nLon2 - nLon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((nLat1 * Math.PI) / 180) *
      Math.cos((nLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

// ===============================
// OpenStreetMap Reverse Geocoding
// ===============================
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
        },
      }
    );
    if (!response.ok) throw new Error("Reverse geocoding failed");
    const data = await response.json();
    const addr = data.address || {};

    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.suburb ||
      addr.county ||
      "";
    const state = addr.state || "";
    const address =
      data.display_name ||
      [addr.road, addr.neighbourhood, addr.suburb, city, state]
        .filter(Boolean)
        .join(", ");

    return {
      displayName: data.display_name,
      address,
      city,
      state,
      country: addr.country || "",
      postcode: addr.postcode || "",
    };
  } catch (error) {
    console.warn("Reverse geocode error:", error);
    return null;
  }
};

// ===============================
// Google Maps Directions Helper
// ===============================
export const getGoogleMapsDirectionsUrl = (lat, lng) => {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
};

// ===============================
// Get All Parking
// ===============================
export const getAllParking = async (params = {}) => {
  const res = await API.get("/parking", { params });
  return res.data;
};

// ===============================
// Search Parking
// ===============================
export const searchParking = async (params = {}) => {
  const res = await API.get("/parking/search", { params });
  return res.data;
};

// ===============================
// Get Nearby Parking
// ===============================
export const getNearbyParking = async (lat, lng, radius = 50, vehicleType = "") => {
  const params = { lat, lng, radius };
  if (vehicleType && vehicleType !== "All") {
    params.vehicleType = vehicleType;
  }
  const res = await API.get("/parking/nearby", { params });
  return res.data;
};

// ===============================
// Get Single Parking
// ===============================
export const getParkingById = async (id) => {
  const res = await API.get(`/parking/${id}`);
  return res.data;
};

// ===============================
// Add Parking
// ===============================
export const addParking = async (parkingData) => {
  const token = localStorage.getItem("token");

  const res = await API.post("/parking", parkingData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// ===============================
// Get My Parking
// ===============================
export const getMyParking = async () => {
  const token = localStorage.getItem("token");

  const res = await API.get("/parking/my", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// ===============================
// Update Parking
// ===============================
export const updateParking = async (id, parkingData) => {
  const token = localStorage.getItem("token");

  const res = await API.put(`/parking/${id}`, parkingData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// ===============================
// Delete Parking
// ===============================
export const deleteParking = async (id) => {
  const token = localStorage.getItem("token");

  const res = await API.delete(`/parking/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// ===============================
// Get AI Parking Prediction
// ===============================
export const getParkingPrediction = async (parkingId) => {
  const res = await API.get(`/parking/${parkingId}/prediction`);
  return res.data;
};

// ===============================
// Get Slots By Parking (Delegated to slotService)
// ===============================
export { getSlotsByParking } from "./slotService";