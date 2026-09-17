const Slot = require("../models/Slot");
const Parking = require("../models/Parking");
const Booking = require("../models/Booking");
const {
    checkAndReleaseExpiredBookings,
    computeStartAndEndDates
} = require("../services/bookingExpiryService");

// ===============================
// Add Slot

// ===============================
const addSlot = async (req, res) => {
    try {
        const { parking, slotNumber, vehicleType } = req.body;

        if (!parking || !slotNumber) {
            return res.status(400).json({
                success: false,
                message: "Parking and Slot Number are required"
            });
        }

        const existingSlot = await Slot.findOne({
            parking,
            slotNumber
        });

        if (existingSlot) {
            return res.status(400).json({
                success: false,
                message: "Slot already exists"
            });
        }

        const slot = await Slot.create({
            parking,
            slotNumber,
            vehicleType: vehicleType || "Car"
        });

        // ===============================
        // Socket.IO Real-Time Update
        // ===============================
        const io = req.app.get("io");

        if (io) {
            io.to(`parking-${parking}`).emit("slotUpdated", {
                type: "ADDED",
                slot
            });
        }

        res.status(201).json({
            success: true,
            message: "Slot Added Successfully",
            slot
        });

    } catch (error) {
        console.error("Add Slot Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ===============================
// Get All Slots
// ===============================
const getAllSlots = async (req, res) => {
    try {
        const slots = await Slot.find()
            .populate("parking", "name city address")
            .sort({ slotNumber: 1 });

        res.status(200).json({
            success: true,
            count: slots.length,
            slots
        });

    } catch (error) {
        console.error("Get Slots Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ===============================
// Get Slots By Parking
// ===============================
const getSlotsByParking = async (req, res) => {
    try {
        const { parkingId } = req.params;
        const { bookingDate, startTime, duration } = req.query;
        const io = req.app.get("io");

        // Automatically clean and release any expired bookings for this parking
        await checkAndReleaseExpiredBookings(io, parkingId);

        const slots = await Slot.find({
            parking: parkingId
        }).sort({ slotNumber: 1 });

        const now = new Date();
        let activeBookings = [];
        let isCustomWindow = false;

        if (bookingDate && startTime) {
            // Determine conflict window based on requested booking time
            isCustomWindow = true;
            const { startDateTime: reqStart, endDateTime: reqEnd } = computeStartAndEndDates(
                bookingDate,
                startTime,
                duration || 1
            );

            activeBookings = await Booking.find({
                parking: parkingId,
                status: "Booked",
                startDateTime: { $lt: reqEnd },
                endDateTime: { $gt: reqStart }
            });
        } else {
            // Default to currently ongoing bookings right now
            activeBookings = await Booking.find({
                parking: parkingId,
                status: "Booked",
                startDateTime: { $lte: now },
                endDateTime: { $gt: now }
            });
        }

        const activeSlotMap = new Map();
        for (const b of activeBookings) {
            activeSlotMap.set(String(b.slot), {
                startTime: b.startTime,
                endTime: b.endTime,
                endDateTime: b.endDateTime,
                bookingDate: b.bookingDate
            });
        }

        const enrichedSlots = [];
        for (const slot of slots) {
            const slotObj = slot.toObject();
            const active = activeSlotMap.get(String(slot._id));

            if (active) {
                slotObj.status = "Booked";
                slotObj.activeBooking = active;
            } else {
                slotObj.status = "Available";
            }

            // If this was a live check (not custom future window), keep DB slot status in sync
            if (!isCustomWindow && slot.status !== slotObj.status) {
                await Slot.findByIdAndUpdate(slot._id, { status: slotObj.status });
            }

            enrichedSlots.push(slotObj);
        }

        // Keep Parking availableSlots count accurate
        if (!isCustomWindow) {
            const liveAvailableCount = enrichedSlots.filter(s => s.status === "Available").length;
            await Parking.findByIdAndUpdate(parkingId, { availableSlots: liveAvailableCount });
        }

        res.status(200).json({
            success: true,
            count: enrichedSlots.length,
            slots: enrichedSlots
        });

    } catch (error) {
        console.error("Get Parking Slots Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ===============================
// Get Single Slot
// ===============================
const getSlot = async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.id)
            .populate("parking", "name city address");

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: "Slot Not Found"
            });
        }

        res.status(200).json({
            success: true,
            slot
        });

    } catch (error) {
        console.error("Get Slot Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ===============================
// Update Slot
// ===============================
const updateSlot = async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: "Slot Not Found"
            });
        }

        const updatedSlot = await Slot.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        // ===============================
        // Socket.IO Real-Time Update
        // ===============================
        const io = req.app.get("io");

        if (io) {
            io.to(`parking-${slot.parking}`).emit("slotUpdated", {
                type: "UPDATED",
                slot: updatedSlot
            });
        }

        res.status(200).json({
            success: true,
            message: "Slot Updated Successfully",
            slot: updatedSlot
        });

    } catch (error) {
        console.error("Update Slot Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ===============================
// Delete Slot
// ===============================
const deleteSlot = async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: "Slot Not Found"
            });
        }

        const parkingId = slot.parking;

        await slot.deleteOne();

        // ===============================
        // Socket.IO Real-Time Update
        // ===============================
        const io = req.app.get("io");

        if (io) {
            io.to(`parking-${parkingId}`).emit("slotUpdated", {
                type: "DELETED",
                slotId: slot._id
            });
        }

        res.status(200).json({
            success: true,
            message: "Slot Deleted Successfully"
        });

    } catch (error) {
        console.error("Delete Slot Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ===============================
// Reset Slots of Parking to Available
// ===============================
const resetParkingSlots = async (req, res) => {
    try {
        const { parkingId } = req.params;
        const parking = await Parking.findById(parkingId);
        if (!parking) {
            return res.status(404).json({
                success: false,
                message: "Parking not found"
            });
        }

        await Slot.updateMany(
            { parking: parkingId },
            { $set: { status: "Available" } }
        );

        await Booking.updateMany(
            { parking: parkingId, status: "Booked" },
            { $set: { status: "Completed" } }
        );

        const totalSlots = await Slot.countDocuments({ parking: parkingId });
        parking.availableSlots = totalSlots;
        await parking.save();

        const io = req.app.get("io");
        if (io) {
            io.to(`parking-${parkingId}`).emit("slotUpdated", {
                type: "RESET_ALL",
                availableSlots: totalSlots
            });
        }

        const updatedSlots = await Slot.find({ parking: parkingId }).sort({ slotNumber: 1 });

        res.status(200).json({
            success: true,
            message: "All slots reset to Available successfully",
            availableSlots: totalSlots,
            slots: updatedSlots
        });
    } catch (error) {
        console.error("Reset Parking Slots Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addSlot,
    getAllSlots,
    getSlotsByParking,
    getSlot,
    updateSlot,
    deleteSlot,
    resetParkingSlots
};