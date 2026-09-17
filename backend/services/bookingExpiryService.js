const Booking = require("../models/Booking");
const Slot = require("../models/Slot");
const Parking = require("../models/Parking");

/**
 * Parse time string like "14:30" or "02:30 PM" into hours and minutes
 */
function parseTimeParts(timeStr) {
  if (!timeStr) return { hours: 0, minutes: 0 };
  const str = String(timeStr).trim();
  const isPM = /pm/i.test(str);
  const isAM = /am/i.test(str);
  const cleaned = str.replace(/[^\d:]/g, "");
  const [h, m] = cleaned.split(":").map(Number);
  let hours = h || 0;
  const minutes = m || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return { hours, minutes };
}

/**
 * Compute exact startDateTime, endDateTime, and formatted endTime
 */
function computeStartAndEndDates(bookingDateInput, startTimeStr, durationHours) {
  // Parse date base accurately supporting Date objects, ISO strings, and YYYY-MM-DD
  let dateBase;
  if (bookingDateInput instanceof Date) {
    const y = bookingDateInput.getFullYear();
    const m = bookingDateInput.getMonth();
    const d = bookingDateInput.getDate();
    dateBase = new Date(y, m, d, 0, 0, 0, 0);
  } else if (typeof bookingDateInput === "string") {
    const [y, m, d] = bookingDateInput.split("T")[0].split("-").map(Number);
    dateBase = new Date(y, m - 1, d, 0, 0, 0, 0);
  } else {
    dateBase = new Date();
    dateBase.setHours(0, 0, 0, 0);
  }

  const { hours, minutes } = parseTimeParts(startTimeStr);
  const startDateTime = new Date(dateBase);
  startDateTime.setHours(hours, minutes, 0, 0);

  const dur = Math.max(1, Number(durationHours) || 1);
  const endDateTime = new Date(startDateTime.getTime() + dur * 60 * 60 * 1000);

  const endH = String(endDateTime.getHours()).padStart(2, "0");
  const endM = String(endDateTime.getMinutes()).padStart(2, "0");
  const endTimeStr = `${endH}:${endM}`;

  return {
    startDateTime,
    endDateTime,
    endTime: endTimeStr,
  };
}

/**
 * Check and release all expired bookings whose time has ended
 */
async function checkAndReleaseExpiredBookings(io, targetParkingId = null) {
  try {
    const now = new Date();
    const query = { status: "Booked" };
    if (targetParkingId) {
      query.parking = targetParkingId;
    }

    const activeBookings = await Booking.find(query);
    if (!activeBookings || activeBookings.length === 0) {
      return { completedCount: 0, freedCount: 0 };
    }

    let completedCount = 0;
    let freedCount = 0;
    const affectedParkingIds = new Set();
    const freedSlotIds = [];

    for (const booking of activeBookings) {
      // Ensure endDateTime is computed
      let endDT = booking.endDateTime;
      if (!endDT) {
        const { startDateTime, endDateTime, endTime } = computeStartAndEndDates(
          booking.bookingDate,
          booking.startTime,
          booking.duration
        );
        booking.startDateTime = startDateTime;
        booking.endDateTime = endDateTime;
        if (!booking.endTime && endTime) booking.endTime = endTime;
        endDT = endDateTime;
        await booking.save();
      }

      // Check if booking has expired
      if (endDT.getTime() <= now.getTime()) {
        booking.status = "Completed";
        await booking.save();
        completedCount++;

        if (booking.parking) {
          affectedParkingIds.add(String(booking.parking));
        }

        // Check if there is any OTHER active booking for this slot RIGHT NOW
        const otherActiveBooking = await Booking.findOne({
          _id: { $ne: booking._id },
          slot: booking.slot,
          status: "Booked",
          startDateTime: { $lte: now },
          endDateTime: { $gt: now }
        });

        if (!otherActiveBooking && booking.slot) {
          await Slot.findByIdAndUpdate(booking.slot, { status: "Available" });
          freedCount++;
          freedSlotIds.push(String(booking.slot));
        }
      }
    }

    // Update available slots count for each affected parking facility
    for (const pId of affectedParkingIds) {
      const availableCount = await Slot.countDocuments({
        parking: pId,
        status: "Available"
      });

      await Parking.findByIdAndUpdate(pId, {
        availableSlots: availableCount
      });

      // Emit real-time notification via Socket.IO to parking room
      if (io) {
        io.to(`parking-${pId}`).emit("slotUpdated", {
          type: "COMPLETED",
          availableSlots: availableCount,
          freedSlotIds
        });
      }
    }

    if (completedCount > 0) {
      console.log(
        `[Auto-Release] Released ${freedCount} parking slots from ${completedCount} expired bookings.`
      );
    }

    return { completedCount, freedCount };
  } catch (err) {
    console.error("[Auto-Release Error]:", err.message);
    return { completedCount: 0, freedCount: 0, error: err.message };
  }
}

/**
 * Start background timer to auto-release expired slots every 60 seconds (calm pace)
 */
function startBookingExpiryWorker(io) {
  console.log("⏱️ Booking Auto-Release Worker initialized (checking every 60s)...");

  // Run on startup
  checkAndReleaseExpiredBookings(io);

  // Run every 60 seconds
  setInterval(() => {
    checkAndReleaseExpiredBookings(io);
  }, 60000);
}

module.exports = {
  parseTimeParts,
  computeStartAndEndDates,
  checkAndReleaseExpiredBookings,
  startBookingExpiryWorker,
};
