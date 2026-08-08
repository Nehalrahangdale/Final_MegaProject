const express = require("express");
const router = express.Router();

const {
    addParking,
    getAllParking,
    getParkingById,
    updateParking,
    deleteParking,
    searchParking
} = require("../controllers/parkingController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

// Public Routes
router.get("/", getAllParking);
router.get("/search", searchParking);
router.get("/:id", getParkingById);

// Owner/Admin Routes
router.post("/", protect, authorize("owner", "admin"), addParking);
router.put("/:id", protect, authorize("owner", "admin"), updateParking);
router.delete("/:id", protect, authorize("owner", "admin"), deleteParking);

module.exports = router;