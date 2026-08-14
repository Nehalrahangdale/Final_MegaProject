import API from "./api";

// =====================================
// Create Razorpay Order
// =====================================
export const createPaymentOrder = async (bookingId) => {
  const token = localStorage.getItem("token");

  const res = await API.post(
    "/payments/create-order",
    {
      bookingId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

// =====================================
// Verify Razorpay Payment
// =====================================
export const verifyPayment = async (paymentData) => {
  const token = localStorage.getItem("token");

  const res = await API.post(
    "/payments/verify",
    paymentData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

// =====================================
// Get All Payments
// =====================================
export const getAllPayments = async () => {
  const token = localStorage.getItem("token");

  const res = await API.get(
    "/payments",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

// =====================================
// Get Payment By ID
// =====================================
export const getPaymentById = async (id) => {
  const token = localStorage.getItem("token");

  const res = await API.get(
    `/payments/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};