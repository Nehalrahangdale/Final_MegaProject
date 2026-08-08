const express = require("express");

const router = express.Router();

const {
    addSlot,
    getAllSlots,
    getSlotsByParking,
    getSlot,
    updateSlot,
    deleteSlot
} = require("../controllers/slotController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");


// ===============================
// Public Routes
// ===============================

// Get all slots
router.get("/", getAllSlots);

// Get slots of particular parking
router.get("/parking/:parkingId", getSlotsByParking);

// Get single slot
router.get("/:id", getSlot);


// ===============================
// Owner / Admin Routes
// ===============================

// Add slot
router.post(
    "/",
    protect,
    authorize("owner", "admin"),
    addSlot
);

// Update slot
router.put(
    "/:id",
    protect,
    authorize("owner", "admin"),
    updateSlot
);

// Delete slot
router.delete(
    "/:id",
    protect,
    authorize("owner", "admin"),
    deleteSlot
);

module.exports = router;