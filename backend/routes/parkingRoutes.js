const express = require("express");

const router = express.Router();

const {
  addParking,
  getAllParking,
  getMyParking,
  getParkingById,
  updateParking,
  deleteParking,
  searchParking,
} = require("../controllers/parkingController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// =====================================
// Public Routes
// =====================================

// Get all parking
router.get("/", getAllParking);

// Search parking
router.get("/search", searchParking);

// =====================================
// Protected Owner/Admin Routes
// =====================================

// Get my parking
// IMPORTANT: /my must come before /:id
router.get(
  "/my",
  protect,
  authorize("owner", "admin"),
  getMyParking
);

// Get parking by ID
router.get("/:id", getParkingById);

// Add parking
router.post(
  "/",
  protect,
  authorize("owner", "admin"),
  addParking
);

// Update parking
router.put(
  "/:id",
  protect,
  authorize("owner", "admin"),
  updateParking
);

// Delete parking
router.delete(
  "/:id",
  protect,
  authorize("owner", "admin"),
  deleteParking
);

module.exports = router;