const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getBookingQR,
  verifyBookingQR,
} = require("../controllers/bookingController");

const {
  protect,
} = require("../middleware/authMiddleware");

// ===============================
// Booking Routes
// ===============================

// Create Booking
router.post("/", protect, createBooking);

// Logged-in User Bookings
router.get("/my", protect, getMyBookings);

// Verify Scanned QR (Must be before /:id)
router.post("/verify-qr", protect, verifyBookingQR);

// Get Booking QR Code
router.get("/:id/qr", protect, getBookingQR);

// Get Booking By ID
router.get("/:id", protect, getBookingById);

// Cancel Booking
router.put("/:id/cancel", protect, cancelBooking);

module.exports = router;