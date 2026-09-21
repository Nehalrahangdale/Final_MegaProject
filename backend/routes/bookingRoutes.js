const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getBookingQR,
  verifyBookingQR,
  publicVerifyBooking,
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

// Public Ticket Verification (Normal phone cameras, web readers, guards)
router.get("/verify-public/:id", publicVerifyBooking);
router.get("/verify-public", publicVerifyBooking);

// Verify Scanned QR (Must be before /:id)
router.post("/verify-qr", verifyBookingQR);

// Get Booking QR Code
router.get("/:id/qr", protect, getBookingQR);

// Get Booking By ID
router.get("/:id", protect, getBookingById);

// Cancel Booking
router.put("/:id/cancel", protect, cancelBooking);

module.exports = router;