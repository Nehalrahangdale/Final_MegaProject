import API from "./api";

// =====================================
// Get Owner Dashboard
// =====================================

export const getOwnerDashboard = async () => {
  const token = localStorage.getItem("token");

  const res = await API.get(
    "/owner/dashboard",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};