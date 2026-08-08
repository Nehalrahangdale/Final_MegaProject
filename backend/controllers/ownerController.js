const Parking = require("../models/Parking");
const Slot = require("../models/Slot");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");

const getDashboard = async (req, res) => {
    try {

        const ownerId = req.user._id;

        // Owner ki parking
        const parkings = await Parking.find({ owner: ownerId });

        const parkingIds = parkings.map(p => p._id);

        // Dashboard Data
        const totalParking = parkings.length;

        const totalSlots = await Slot.countDocuments({
            parking: { $in: parkingIds }
        });

        const availableSlots = await Slot.countDocuments({
            parking: { $in: parkingIds },
            status: "Available"
        });

        const bookedSlots = await Slot.countDocuments({
            parking: { $in: parkingIds },
            status: "Booked"
        });

        const totalBookings = await Booking.countDocuments({
            parking: { $in: parkingIds }
        });

        const revenue = await Payment.aggregate([
            {
                $match: {
                    status: "Success"
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$amount"
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            dashboard: {
                totalParking,
                totalSlots,
                availableSlots,
                bookedSlots,
                totalBookings,
                totalRevenue:
                    revenue.length > 0 ? revenue[0].totalRevenue : 0
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    getDashboard
};