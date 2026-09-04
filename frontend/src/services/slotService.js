import API from "./api";

// Authorization helper header
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};

// ===============================
// Get All Slots
// ===============================
export const getAllSlots = async () => {
  const res = await API.get("/slots");
  return res.data;
};

// ===============================
// Get Slots By Parking ID
// ===============================
export const getSlotsByParking = async (parkingId) => {
  if (!parkingId) {
    throw new Error("parkingId is required");
  }

  const res = await API.get(`/slots/parking/${parkingId}`);
  return res.data;
};

// ===============================
// Get Single Slot By ID
// ===============================
export const getSlotById = async (slotId) => {
  const res = await API.get(`/slots/${slotId}`);
  return res.data;
};

// ===============================
// Add Slot (Owner / Admin)
// ===============================
export const addSlot = async (slotData) => {
  const res = await API.post("/slots", slotData, getAuthHeaders());
  return res.data;
};

// ===============================
// Update Slot (Owner / Admin)
// ===============================
export const updateSlot = async (slotId, slotData) => {
  const res = await API.put(`/slots/${slotId}`, slotData, getAuthHeaders());
  return res.data;
};

// ===============================
// Delete Slot (Owner / Admin)
// ===============================
export const deleteSlot = async (slotId) => {
  const res = await API.delete(`/slots/${slotId}`, getAuthHeaders());
  return res.data;
};

const slotService = {
  getAllSlots,
  getSlotsByParking,
  getSlotById,
  addSlot,
  updateSlot,
  deleteSlot,
};

export default slotService;
