const Booking = require("../models/Booking");
const Parking = require("../models/Parking");
const Slot = require("../models/Slot");
const qrService = require("../services/qrService");

// =====================================================
// CREATE BOOKING
// =====================================================
const createBooking = async (req, res) => {
    try {
        const {
            parkingId,
            slotId,
            bookingDate,
            startTime,
            duration,
            amount
        } = req.body;

        // -----------------------------
        // Validate required fields
        // -----------------------------
        if (
            !parkingId ||
            !slotId ||
            !bookingDate ||
            !startTime ||
            !duration
        ) {
            return res.status(400).json({
                success: false,
                message: "All booking fields are required"
            });
        }

        // -----------------------------
        // Check Parking
        // -----------------------------
        const parking = await Parking.findById(parkingId);

        if (!parking) {
            return res.status(404).json({
                success: false,
                message: "Parking not found"
            });
        }

        // -----------------------------
        // Check Slot
        // -----------------------------
        const slot = await Slot.findById(slotId);

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: "Slot not found"
            });
        }

        // Make sure slot belongs to parking
        if (slot.parking.toString() !== parkingId.toString()) {
            return res.status(400).json({
                success: false,
                message: "Selected slot does not belong to this parking"
            });
        }

        // -----------------------------
        // Check Slot Status
        // -----------------------------
        if (slot.status === "Booked") {
            return res.status(400).json({
                success: false,
                message: "This slot is already booked"
            });
        }

        // -----------------------------
        // Check Duplicate Booking
        // -----------------------------
        const existingBooking = await Booking.findOne({
            slot: slotId,
            bookingDate: new Date(bookingDate),
            status: "Booked"
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: "This slot is already booked for this date"
            });
        }

        // -----------------------------
        // Calculate Amount
        // -----------------------------
        const totalAmount =
            Number(parking.pricePerHour) *
            Number(duration);

        // Don't trust amount coming from frontend
        const finalAmount = totalAmount;

        // -----------------------------
        // Calculate End Time
        // -----------------------------
        const [hours, minutes] = startTime
            .split(":")
            .map(Number);

        const startDate = new Date();

        startDate.setHours(hours);
        startDate.setMinutes(minutes);
        startDate.setSeconds(0);
        startDate.setMilliseconds(0);

        const endDate = new Date(startDate);

        endDate.setHours(
            endDate.getHours() + Number(duration)
        );

        const endTime =
            String(endDate.getHours()).padStart(2, "0") +
            ":" +
            String(endDate.getMinutes()).padStart(2, "0");

        // -----------------------------
        // Create Booking
        // -----------------------------
        const booking = await Booking.create({
            user: req.user._id,
            parking: parkingId,
            slot: slotId,
            bookingDate: new Date(bookingDate),
            startTime,
            endTime,
            duration: Number(duration),
            totalAmount: finalAmount,
            status: "Booked"
        });

        // -----------------------------
        // Mark Slot Booked
        // -----------------------------
        slot.status = "Booked";
        await slot.save();

        // -----------------------------
        // Decrease Available Slots
        // -----------------------------
        if (parking.availableSlots > 0) {
            parking.availableSlots -= 1;
            await parking.save();
        }

        // -----------------------------
        // Populate Response
        // -----------------------------
        const populatedBooking =
            await Booking.findById(booking._id)
                .populate("user", "name email phone")
                .populate(
                    "parking",
                    "name address city pricePerHour"
                )
                .populate(
                    "slot",
                    "slotNumber vehicleType status"
                );

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking: populatedBooking
        });

    } catch (error) {
        console.error("Create Booking Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =====================================================
// GET MY BOOKINGS
// =====================================================
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            user: req.user._id
        })
            .populate(
                "parking",
                "name address city image pricePerHour"
            )
            .populate(
                "slot",
                "slotNumber vehicleType status"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });

    } catch (error) {
        console.error("Get My Bookings Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =====================================================
// GET SINGLE BOOKING
// =====================================================
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate(
                "user",
                "name email phone"
            )
            .populate(
                "parking",
                "name address city image pricePerHour"
            )
            .populate(
                "slot",
                "slotNumber vehicleType status"
            );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // User can only see own booking
        if (
            req.user.role === "user" &&
            booking.user._id.toString() !==
                req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        res.status(200).json({
            success: true,
            booking
        });

    } catch (error) {
        console.error("Get Booking Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =====================================================
// GET ALL BOOKINGS
// =====================================================
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate(
                "user",
                "name email phone"
            )
            .populate(
                "parking",
                "name address city"
            )
            .populate(
                "slot",
                "slotNumber vehicleType status"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });

    } catch (error) {
        console.error("Get All Bookings Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =====================================================
// CANCEL BOOKING
// =====================================================
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(
            req.params.id
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // User can cancel only own booking
        if (
            req.user.role === "user" &&
            booking.user.toString() !==
                req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        if (booking.status === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Booking already cancelled"
            });
        }

        // Cancel booking
        booking.status = "Cancelled";
        await booking.save();

        // Release slot
        const slot = await Slot.findById(
            booking.slot
        );

        if (slot) {
            slot.status = "Available";
            await slot.save();
        }

        // Increase available parking slots
        const parking = await Parking.findById(
            booking.parking
        );

        if (parking) {
            parking.availableSlots += 1;
            await parking.save();
        }

        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully"
        });

    } catch (error) {
        console.error("Cancel Booking Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =====================================================
// COMPLETE BOOKING
// =====================================================
const completeBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(
            req.params.id
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        booking.status = "Completed";

        await booking.save();

        res.status(200).json({
            success: true,
            message: "Booking completed successfully",
            booking
        });

    } catch (error) {
        console.error(
            "Complete Booking Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =====================================================
// GET BOOKING QR CODE (DATA URL & PAYLOAD)
// =====================================================
const getBookingQR = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("user", "name email phone")
            .populate("parking", "name address city")
            .populate("slot", "slotNumber vehicleType");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Authorization check
        if (
            req.user.role === "user" &&
            booking.user._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const qrData = await qrService.generateBookingQR(booking);

        res.status(200).json({
            success: true,
            bookingId: booking._id,
            payload: qrData.payload,
            qrCodeDataUrl: qrData.qrCodeDataUrl,
        });
    } catch (error) {
        console.error("Get Booking QR Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================================
// VERIFY SCANNED BOOKING QR
// =====================================================
const verifyBookingQR = async (req, res) => {
    try {
        const { qrData } = req.body;

        if (!qrData) {
            return res.status(400).json({
                success: false,
                message: "QR code data is required",
            });
        }

        const decoded = qrService.verifyQRPayload(qrData);

        if (!decoded.isValid) {
            return res.status(400).json({
                success: false,
                message: decoded.message,
            });
        }

        const booking = await Booking.findById(decoded.bookingId)
            .populate("user", "name email phone")
            .populate("parking", "name address city")
            .populate("slot", "slotNumber vehicleType status");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found in records",
            });
        }

        res.status(200).json({
            success: true,
            message: "QR Ticket verified successfully",
            booking,
            ticketPayload: decoded.payload,
        });
    } catch (error) {
        console.error("Verify QR Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getBookingById,
    getAllBookings,
    cancelBooking,
    completeBooking,
    getBookingQR,
    verifyBookingQR,
};