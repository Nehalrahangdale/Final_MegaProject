import API from "./api";

// Create Razorpay Order
export const createOrder = async (bookingId, amount) => {
  const token = localStorage.getItem("token");

  const res = await API.post(
    "/payments/create-order",
    {
      bookingId,
      amount,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

// Verify Payment
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