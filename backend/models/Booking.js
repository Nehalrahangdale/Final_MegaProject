const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // =========================
    // User
    // =========================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =========================
    // Parking
    // =========================
    parking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parking",
      required: true,
    },

    // =========================
    // Slot
    // =========================
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },

    // =========================
    // Booking Date
    // =========================
    bookingDate: {
      type: Date,
      required: true,
    },

    // =========================
    // Time
    // =========================
    startTime: {
      type: String,
      required: true,
      trim: true,
    },

    endTime: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================
    // Duration
    // =========================
    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    // =========================
    // Amount
    // =========================
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // =========================
    // Payment Status
    // =========================
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    // Razorpay Payment ID
    paymentId: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================
    // Booking Status
    // =========================
    status: {
      type: String,
      enum: ["Booked", "Cancelled", "Completed"],
      default: "Booked",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);