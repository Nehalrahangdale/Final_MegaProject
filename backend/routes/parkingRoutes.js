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
  getNearbyParking,
  getParkingPrediction,
} = require("../controllers/parkingController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

// =====================================
// Public Routes
// =====================================

// Get all parking
router.get("/", getAllParking);

// Search parking
router.get("/search", searchParking);

// Get nearby parking by coordinates
router.get("/nearby", getNearbyParking);

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

router.get(
  "/my-parking",
  protect,
  authorize("owner", "admin"),
  getMyParking
);

// Get parking by ID
router.get("/:id", getParkingById);

// Get AI Occupancy & Demand Prediction
router.get("/:id/prediction", getParkingPrediction);

// Add parking
router.post(
  "/",
  protect,
  authorize("owner", "admin"),
  upload.single("image"),
  addParking
);

// Update parking
router.put(
  "/:id",
  protect,
  authorize("owner", "admin"),
  upload.single("image"),
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