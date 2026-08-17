import API from "./api";

// =====================================
// Authorization Config
// =====================================

const getConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// =====================================
// Admin Dashboard
// =====================================

export const getAdminDashboard = async () => {
  const response = await API.get(
    "/admin/dashboard",
    getConfig()
  );

  return response.data;
};

// =====================================
// Get All Users
// =====================================

export const getAllUsers = async () => {
  const response = await API.get(
    "/admin/users",
    getConfig()
  );

  return response.data;
};

// =====================================
// Get All Owners
// =====================================

export const getAllOwners = async () => {
  const response = await API.get(
    "/admin/owners",
    getConfig()
  );

  return response.data;
};

// =====================================
// Get All Parking
// =====================================

export const getAllParking = async () => {
  const response = await API.get(
    "/admin/parking",
    getConfig()
  );

  return response.data;
};

// =====================================
// Get All Bookings
// =====================================

export const getAllBookings = async () => {
  const response = await API.get(
    "/admin/bookings",
    getConfig()
  );

  return response.data;
};

// =====================================
// Delete User
// =====================================

export const deleteUser = async (id) => {
  if (!id) {
    throw new Error("User ID is required");
  }

  const response = await API.delete(
    `/admin/users/${id}`,
    getConfig()
  );

  return response.data;
};