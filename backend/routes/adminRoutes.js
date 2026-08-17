const express = require("express");

const router = express.Router();

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const {
  getDashboard,
  getAllUsers,
  getAllParking,
  getAllBookings,
  deleteUser,
} = require("../controllers/adminController");

// =====================================
// Admin Dashboard
// =====================================

router.get(
  "/dashboard",
  protect,
  authorize("admin"),
  getDashboard
);

// =====================================
// Users
// =====================================

router.get(
  "/users",
  protect,
  authorize("admin"),
  getAllUsers
);

// =====================================
// Parking
// =====================================

router.get(
  "/parking",
  protect,
  authorize("admin"),
  getAllParking
);

// =====================================
// Bookings
// =====================================

router.get(
  "/bookings",
  protect,
  authorize("admin"),
  getAllBookings
);

// =====================================
// Delete User
// =====================================

router.delete(
  "/users/:id",
  protect,
  authorize("admin"),
  deleteUser
);

module.exports = router;