const Booking = require("../models/Booking");
const Parking = require("../models/Parking");
const Slot = require("../models/Slot");
const qrService = require("../services/qrService");
const {
    computeStartAndEndDates,
    checkAndReleaseExpiredBookings,
} = require("../services/bookingExpiryService");

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

        const io = req.app.get("io");

        // -----------------------------
        // Auto-release any expired bookings first
        // -----------------------------
        await checkAndReleaseExpiredBookings(io, parkingId);

        // -----------------------------
        // Compute exact timestamps
        // -----------------------------
        const { startDateTime, endDateTime, endTime } = computeStartAndEndDates(
            bookingDate,
            startTime,
            duration
        );

        // -----------------------------
        // Check Overlapping Active Booking
        // -----------------------------
        const existingBooking = await Booking.findOne({
            slot: slotId,
            status: "Booked",
            $or: [
                {
                    startDateTime: { $lt: endDateTime },
                    endDateTime: { $gt: startDateTime }
                }
            ]
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: `This slot is already booked between ${existingBooking.startTime} and ${existingBooking.endTime}. Please choose another slot or time.`
            });
        }

        // -----------------------------
        // Calculate Amount
        // -----------------------------
        const totalAmount =
            Number(parking.pricePerHour) *
            Number(duration);

        const finalAmount = totalAmount;

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
            startDateTime,
            endDateTime,
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
        // Socket.IO Real-Time Update
        // -----------------------------
        if (io) {
            io.to(`parking-${parkingId}`).emit("slotUpdated", {
                type: "BOOKED",
                slotId: slot._id,
                slot,
                availableSlots: parking.availableSlots
            });
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
        const io = req.app.get("io");
        await checkAndReleaseExpiredBookings(io);

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

        // User can only see own booking (admin can see all)
        const bookingUserId = booking.user ? (booking.user._id || booking.user).toString() : null;
        const reqUserId = req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (bookingUserId && bookingUserId !== reqUserId && !isAdmin) {
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
        const io = req.app.get("io");
        await checkAndReleaseExpiredBookings(io);

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

        // Socket.IO Real-Time Update
        const io = req.app.get("io");
        if (io) {
            io.to(`parking-${booking.parking}`).emit("slotUpdated", {
                type: "CANCELLED",
                slotId: slot ? slot._id : null,
                slot,
                availableSlots: parking ? parking.availableSlots : undefined
            });
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

        const slot = await Slot.findById(booking.slot);
        if (slot && slot.status === "Booked") {
            slot.status = "Available";
            await slot.save();
        }

        const parking = await Parking.findById(booking.parking);
        if (parking) {
            parking.availableSlots += 1;
            await parking.save();
        }

        const io = req.app.get("io");
        if (io) {
            io.to(`parking-${booking.parking}`).emit("slotUpdated", {
                type: "COMPLETED",
                slotId: slot ? slot._id : null,
                slot,
                availableSlots: parking ? parking.availableSlots : undefined
            });
        }

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

        // Strict Payment Status Check
        if (booking.paymentStatus !== "Paid") {
            return res.status(402).json({
                success: false,
                message: "Payment Required: QR ticket cannot be generated for unpaid bookings.",
            });
        }

        // Cancellation Check
        if (booking.status === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Invalid Request: QR ticket cannot be generated for a cancelled booking.",
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

        let booking;

        if (decoded.bookingId) {
            booking = await Booking.findById(decoded.bookingId)
                .populate("user", "name email phone")
                .populate("parking", "name address city pricePerHour")
                .populate("slot", "slotNumber vehicleType status");
        }

        // Try PIN resolution if direct ID didn't match
        if (!booking && decoded.pin) {
            const cleanPin = decoded.pin.toLowerCase();
            const candidates = await Booking.find()
                .populate("user", "name email phone")
                .populate("parking", "name address city pricePerHour")
                .populate("slot", "slotNumber vehicleType status")
                .sort({ createdAt: -1 })
                .limit(50);

            booking = candidates.find(b => b._id.toString().toLowerCase().endsWith(cleanPin));
        }

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found in records",
            });
        }

        // Validate payment status of scanned ticket
        if (booking.paymentStatus !== "Paid") {
            return res.status(402).json({
                success: false,
                message: "Invalid Ticket: Booking payment has not been completed.",
            });
        }

        // Validate booking cancellation
        if (booking.status === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Invalid Ticket: This booking reservation was cancelled.",
            });
        }

        res.status(200).json({
            success: true,
            message: "QR Ticket verified successfully",
            booking,
            ticketPayload: decoded.payload || {
                bookingId: booking._id,
                pin: `NPK-${booking._id.toString().slice(-6).toUpperCase()}`,
                slot: booking.slot?.slotNumber,
                status: booking.status,
                paymentStatus: booking.paymentStatus,
            },
        });
    } catch (error) {
        console.error("Verify QR Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================================
// PUBLIC TICKET VERIFICATION (For Mobile Cameras, Web, Guards)
// =====================================================
const publicVerifyBooking = async (req, res) => {
    try {
        const queryId = req.params.id || req.query.id || req.query.bookingId || req.query.pin;

        if (!queryId) {
            return res.status(400).json({
                success: false,
                isValid: false,
                message: "Booking ID or Gate Passcode is required",
            });
        }

        let booking;

        // Try direct ObjectId match
        if (/^[a-f0-9]{24}$/i.test(queryId)) {
            booking = await Booking.findById(queryId)
                .populate("user", "name email phone")
                .populate("parking", "name address city pricePerHour image")
                .populate("slot", "slotNumber vehicleType status");
        }

        // Try PIN match (e.g. NPK-D02BA85F or D02BA85F)
        if (!booking) {
            const cleanPin = queryId.replace(/^NPK-/i, "").toLowerCase();
            const candidateBookings = await Booking.find()
                .populate("user", "name email phone")
                .populate("parking", "name address city pricePerHour image")
                .populate("slot", "slotNumber vehicleType status")
                .sort({ createdAt: -1 })
                .limit(50);

            booking = candidateBookings.find(b =>
                b._id.toString().toLowerCase().endsWith(cleanPin)
            );
        }

        if (!booking) {
            return res.status(404).json({
                success: false,
                isValid: false,
                message: "No matching parking reservation found",
            });
        }

        // Check Payment Status & Flags
        const isPaid = booking.paymentStatus === "Paid";
        const isCancelled = booking.status === "Cancelled";

        let accessStatus = "GRANTED";
        let message = "Gate Pass Valid: Access Authorized.";

        if (isCancelled) {
            accessStatus = "DENIED_CANCELLED";
            message = "Access Denied: This reservation was cancelled.";
        } else if (!isPaid) {
            accessStatus = "DENIED_UNPAID";
            message = "Access Denied: Payment is pending for this booking.";
        }

        const now = new Date();
        const hasExpired = booking.endDateTime && new Date(booking.endDateTime) < now;

        res.status(200).json({
            success: true,
            isValid: isPaid && !isCancelled,
            accessStatus,
            hasExpired,
            message,
            booking: {
                id: booking._id,
                pin: `NPK-${booking._id.toString().slice(-6).toUpperCase()}`,
                customerName: booking.user?.name || "Customer",
                customerPhone: booking.user?.phone || "N/A",
                parkingName: booking.parking?.name || "Parking Facility",
                parkingAddress: booking.parking?.address || "",
                parkingCity: booking.parking?.city || "Nagpur",
                slotNumber: booking.slot?.slotNumber || "N/A",
                vehicleType: booking.slot?.vehicleType || "Car",
                bookingDate: booking.bookingDate,
                startTime: booking.startTime,
                endTime: booking.endTime,
                duration: booking.duration,
                totalAmount: booking.totalAmount,
                paymentStatus: booking.paymentStatus,
                paymentId: booking.paymentId || "N/A",
                bookingStatus: booking.status,
            },
        });
    } catch (error) {
        console.error("Public Verify Ticket Error:", error);
        res.status(500).json({
            success: false,
            isValid: false,
            message: error.message || "Failed to verify ticket",
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
    publicVerifyBooking,
};