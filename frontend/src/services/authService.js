import API from "./api";

// =====================================
// Register User
// =====================================

export const registerUser = async (data) => {
  const res = await API.post("/auth/register", data);

  return res.data;
};

// =====================================
// Login User
// =====================================

export const loginUser = async (data) => {
  const res = await API.post("/auth/login", data);

  return res.data;
};