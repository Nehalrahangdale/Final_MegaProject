const express = require("express");
const router = express.Router();

const {
    getUsers,
    getUserById,
} = require("../controllers/userController");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

// Admin only — get all users
router.get("/", protect, authorize("admin"), getUsers);

// Admin only — get user by ID
router.get("/:id", protect, authorize("admin"), getUserById);

module.exports = router;