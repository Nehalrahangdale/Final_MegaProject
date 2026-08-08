import API from "./api";

// =====================================
// Create Booking
// =====================================
export const createBooking = async (bookingData) => {
  const token = localStorage.getItem("token");

  const res = await API.post(
    "/bookings",
    bookingData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

// =====================================
// Get My Bookings
// =====================================
export const getMyBookings = async () => {
  const token = localStorage.getItem("token");

  const res = await API.get(
    "/bookings/my",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

// =====================================
// Get Booking By ID
// =====================================
export const getBookingById = async (id) => {
  const token = localStorage.getItem("token");

  const res = await API.get(
    `/bookings/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

// =====================================
// Cancel Booking
// =====================================
export const cancelBooking = async (id) => {
  const token = localStorage.getItem("token");

  const res = await API.put(
    `/bookings/${id}/cancel`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};