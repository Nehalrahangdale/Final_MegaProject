const express = require("express");
const router = express.Router();

const {
    getDashboard,
    getAllUsers,
    getAllParking,
    getAllBookings,
    deleteUser
} = require("../controllers/adminController");

router.get("/dashboard", getDashboard);
router.get("/users", getAllUsers);
router.get("/parking", getAllParking);
router.get("/bookings", getAllBookings);
router.delete("/users/:id", deleteUser);

module.exports = router;