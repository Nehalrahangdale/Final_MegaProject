import API from "./api";

// ===============================
// Get All Parking
// ===============================
export const getAllParking = async () => {
  const res = await API.get("/parking");
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
// Get Slots By Parking
// ===============================
export const getSlotsByParking = async (parkingId) => {
  const res = await API.get(
    `/slots/parking/${parkingId}`
  );

  return res.data;
};