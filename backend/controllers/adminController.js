const User = require("../models/User");
const Parking = require("../models/Parking");
const Booking = require("../models/Booking");
const Slot = require("../models/Slot");
const Payment = require("../models/Payment");

// =====================================
// Admin Dashboard
// =====================================

const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({
      role: "user",
    });

    const totalOwners = await User.countDocuments({
      role: "owner",
    });

    const totalParking = await Parking.countDocuments();

    const totalBookings = await Booking.countDocuments();

    const totalSlots = await Slot.countDocuments();

    const activeBookings = await Booking.countDocuments({
      status: "Booked",
    });

    const completedBookings = await Booking.countDocuments({
      status: "Completed",
    });

    const revenue = await Payment.aggregate([
      {
        $match: {
          status: "Success",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const totalRevenue =
      revenue.length > 0
        ? revenue[0].totalRevenue
        : 0;

    return res.status(200).json({
      success: true,
      dashboard: {
        totalUsers,
        totalOwners,
        totalParking,
        totalBookings,
        totalSlots,
        activeBookings,
        completedBookings,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error(
      "Admin Dashboard Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard",
      error: error.message,
    });
  }
};

// =====================================
// Get All Users
// =====================================

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: "user",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "Get Users Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load users",
      error: error.message,
    });
  }
};

// =====================================
// Get All Owners
// =====================================

const getAllOwners = async (req, res) => {
  try {
    const owners = await User.find({
      role: "owner",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: owners.length,
      owners,
    });
  } catch (error) {
    console.error(
      "Get Owners Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load owners",
      error: error.message,
    });
  }
};

// =====================================
// Get All Parking
// =====================================

const getAllParking = async (req, res) => {
  try {
    const parking = await Parking.find()
      .populate(
        "owner",
        "name email phone"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: parking.length,
      parking,
    });
  } catch (error) {
    console.error(
      "Get Parking Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load parking",
      error: error.message,
    });
  }
};

// =====================================
// Get All Bookings
// =====================================

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate(
        "user",
        "name email phone"
      )
      .populate(
        "parking",
        "name city address"
      )
      .populate(
        "slot",
        "slotNumber vehicleType status"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(
      "Get Bookings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load bookings",
      error: error.message,
    });
  }
};

// =====================================
// Get All Payments
// =====================================

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate(
        "user",
        "name email phone"
      )
      .populate({
        path: "booking",
        populate: [
          {
            path: "parking",
            select:
              "name city address pricePerHour",
          },
          {
            path: "slot",
            select:
              "slotNumber vehicleType status",
          },
        ],
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error(
      "Get Payments Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load payments",
      error: error.message,
    });
  }
};

// =====================================
// Delete User
// =====================================

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting admin
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin account cannot be deleted.",
      });
    }

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message:
        "User deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete User Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete user",
      error: error.message,
    });
  }
};

// =====================================
// Export Controllers
// =====================================

module.exports = {
  getDashboard,
  getAllUsers,
  getAllOwners,
  getAllParking,
  getAllBookings,
  getAllPayments,
  deleteUser,
};