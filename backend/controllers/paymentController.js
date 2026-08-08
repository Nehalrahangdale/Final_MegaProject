const Razorpay = require("razorpay");
const crypto = require("crypto");

const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Slot = require("../models/Slot");
const Notification = require("../models/Notification");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ======================================
// Create Razorpay Order
// ======================================

const createOrder = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and Amount are required",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const options = {
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: bookingId.toString(),
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      booking: bookingId,
      user: req.user._id,
      amount,
      razorpayOrderId: order.id,
      status: "Pending",
    });

    res.status(200).json({
      success: true,
      message: "Order Created Successfully",
      order,
    });

  } catch (error) {

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

    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment Verification Failed",
      });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.status = "Success";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;

    await payment.save();

    const booking = await Booking.findById(payment.booking);

    if (booking) {

      booking.paymentStatus = "Paid";
      booking.status = "Booked";

      await booking.save();

      const slot = await Slot.findById(booking.slot);

      if (slot) {

        slot.isAvailable = false;
        slot.status = "Booked";

        await slot.save();

      }

      await Notification.create({
        user: booking.user,
        title: "Booking Confirmed",
        message:
          "Your parking booking has been confirmed successfully.",
      });

    }

    res.status(200).json({
      success: true,
      message: "Payment Verified Successfully",
    });

  } catch (error) {

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
      .populate("user", "name email")
      .populate("booking")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });

  } catch (error) {

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

    const payment = await Payment.findById(req.params.id)
      .populate("user", "name email")
      .populate("booking");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment Not Found",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getAllPayments,
  getPaymentById,
};