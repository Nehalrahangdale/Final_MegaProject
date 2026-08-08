const express = require("express");
const router = express.Router();

const {
    createOrder,
    verifyPayment,
    getAllPayments,
    getPaymentById
} = require("../controllers/paymentController");

const {
    protect
} = require("../middleware/authMiddleware");

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/", protect, getAllPayments);
router.get("/:id", protect, getPaymentById);

module.exports = router;