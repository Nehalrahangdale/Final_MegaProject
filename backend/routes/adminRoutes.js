const express = require("express");

const router = express.Router();

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const {
  getDashboard,
  getAllUsers,
  getAllOwners,
  getAllParking,
  getAllBookings,
  getAllPayments,
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
// Owners
// =====================================

router.get(
  "/owners",
  protect,
  authorize("admin"),
  getAllOwners
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
// Payments
// =====================================

router.get(
  "/payments",
  protect,
  authorize("admin"),
  getAllPayments
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