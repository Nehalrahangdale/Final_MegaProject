const Razorpay = require("razorpay");
const crypto = require("crypto");

const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Slot = require("../models/Slot");
const Notification = require("../models/Notification");

// ======================================
// Razorpay Configuration
// ======================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ======================================
// Create Razorpay Order
// ======================================

const createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Check Booking ID
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check booking belongs to logged-in user
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized for this booking",
      });
    }

    // Check payment already completed
    if (booking.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Payment already completed for this booking",
      });
    }

    // Amount comes from database
    const amount = Number(booking.totalAmount);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking amount",
      });
    }

    // Razorpay amount is in paise
    const amountInPaise = Math.round(amount * 100);

    // Create Razorpay Order
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `booking_${booking._id}`,
    };

    const order = await razorpay.orders.create(options);

    // Save payment record
    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: amount,
      razorpayOrderId: order.id,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",
      order,
      payment,
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Verify Razorpay Payment
// ======================================

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Check required data
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification data is incomplete",
      });
    }

    // Create signature
    const body =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body)
      .digest("hex");

    // Verify signature
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment Verification Failed",
      });
    }

    // Find payment
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Check payment belongs to logged-in user
    if (
      payment.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized for this payment",
      });
    }

    // Prevent duplicate verification
    if (payment.status === "Success") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
      });
    }

    // Update payment
    payment.status = "Success";
    payment.razorpayPaymentId =
      razorpay_payment_id;

    await payment.save();

    // Find booking
    const booking = await Booking.findById(
      payment.booking
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Update booking payment status
    booking.paymentStatus = "Paid";
    booking.paymentId = razorpay_payment_id;
    booking.status = "Booked";

    await booking.save();

    // Find slot
    const slot = await Slot.findById(
      booking.slot
    );

    if (slot) {
      slot.status = "Booked";

      await slot.save();
    }

    // Notification
    await Notification.create({
      user: booking.user,
      title: "Booking Confirmed",
      message:
        "Your parking booking has been confirmed successfully.",
    });

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment,
      booking,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get All Payments
// ======================================

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "name email phone")
      .populate({
        path: "booking",
        populate: [
          {
            path: "parking",
            select: "name address city pricePerHour",
          },
          {
            path: "slot",
            select: "slotNumber vehicleType status",
          },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get All Payments Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Payment By ID
// ======================================

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(
      req.params.id
    )
      .populate("user", "name email phone")
      .populate({
        path: "booking",
        populate: [
          {
            path: "parking",
            select: "name address city pricePerHour",
          },
          {
            path: "slot",
            select: "slotNumber vehicleType status",
          },
        ],
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // User can access only their own payment
    if (
      payment.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this payment",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get Payment Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Export
// ======================================

module.exports = {
  createOrder,
  verifyPayment,
  getAllPayments,
  getPaymentById,
};