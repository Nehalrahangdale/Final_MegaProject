const Parking = require("../models/Parking");
const Slot = require("../models/Slot");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");

// =====================================
// Owner Dashboard
// =====================================

const getDashboard = async (req, res) => {
  try {
    const ownerId = req.user._id;

    // =====================================
    // Get Owner's Parking
    // =====================================

    const parkings = await Parking.find({
      owner: ownerId,
    });

    const parkingIds = parkings.map(
      (parking) => parking._id
    );

    // =====================================
    // Parking Statistics
    // =====================================

    const totalParking = parkings.length;

    const totalSlots = await Slot.countDocuments({
      parking: {
        $in: parkingIds,
      },
    });

    const availableSlots =
      await Slot.countDocuments({
        parking: {
          $in: parkingIds,
        },
        status: "Available",
      });

    const bookedSlots =
      await Slot.countDocuments({
        parking: {
          $in: parkingIds,
        },
        status: "Booked",
      });

    // =====================================
    // Booking Statistics
    // =====================================

    const totalBookings =
      await Booking.countDocuments({
        parking: {
          $in: parkingIds,
        },
      });

    const activeBookings =
      await Booking.countDocuments({
        parking: {
          $in: parkingIds,
        },
        status: "Booked",
      });

    const completedBookings =
      await Booking.countDocuments({
        parking: {
          $in: parkingIds,
        },
        status: "Completed",
      });

    const cancelledBookings =
      await Booking.countDocuments({
        parking: {
          $in: parkingIds,
        },
        status: "Cancelled",
      });

    // =====================================
    // Owner Revenue
    // =====================================

    const revenue = await Payment.aggregate([
      {
        $match: {
          status: "Success",
        },
      },

      {
        $lookup: {
          from: "bookings",
          localField: "booking",
          foreignField: "_id",
          as: "booking",
        },
      },

      {
        $unwind: "$booking",
      },

      {
        $match: {
          "booking.parking": {
            $in: parkingIds,
          },
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

    // =====================================
    // Recent Bookings
    // =====================================

    const recentBookings =
      await Booking.find({
        parking: {
          $in: parkingIds,
        },
      })
        .populate(
          "user",
          "name email"
        )
        .populate(
          "parking",
          "name city"
        )
        .populate(
          "slot",
          "slotNumber vehicleType"
        )
        .sort({
          createdAt: -1,
        })
        .limit(10);

    // =====================================
    // Response
    // =====================================

    res.status(200).json({
      success: true,

      dashboard: {
        totalParking,
        totalSlots,
        availableSlots,
        bookedSlots,

        totalBookings,
        activeBookings,
        completedBookings,
        cancelledBookings,

        totalRevenue,

        recentBookings,
      },
    });
  } catch (error) {
    console.error(
      "Owner Dashboard Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};