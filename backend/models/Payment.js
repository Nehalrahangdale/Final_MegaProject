const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // Booking Reference
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    // User Reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Payment Amount
    amount: {
      type: Number,
      required: true,
    },

    // Currency
    currency: {
      type: String,
      default: "INR",
    },

    // Razorpay Details
    razorpayOrderId: {
      type: String,
      required: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpaySignature: {
      type: String,
      default: "",
    },

    // Payment Method
    paymentMethod: {
      type: String,
      default: "",
    },

    // Payment Status
    status: {
      type: String,
      enum: ["Pending", "Success", "Failed", "Refunded"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);