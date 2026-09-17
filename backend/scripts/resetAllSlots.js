const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Parking = require("../models/Parking");
const Slot = require("../models/Slot");
const Booking = require("../models/Booking");

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_parking";

async function resetAllSlots() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const parkings = await Parking.find({});

    for (const parking of parkings) {
      // 1. Reset all slots to Available
      const slotResult = await Slot.updateMany(
        { parking: parking._id },
        { $set: { status: "Available" } }
      );

      // 2. Mark active demo bookings as Completed
      const bookingResult = await Booking.updateMany(
        { parking: parking._id, status: "Booked" },
        { $set: { status: "Completed" } }
      );

      // 3. Update total and available slot counts
      const totalSlots = await Slot.countDocuments({ parking: parking._id });
      parking.totalSlots = totalSlots;
      parking.availableSlots = totalSlots;
      await parking.save();

      console.log(
        `[${parking.name}] -> Reset ${slotResult.modifiedCount} slots to Available | ${bookingResult.modifiedCount} active bookings set to Completed | Available Slots: ${totalSlots}/${totalSlots}`
      );
    }

    console.log("\nAll slots have been reset to Available!");
    process.exit(0);
  } catch (err) {
    console.error("Reset error:", err);
    process.exit(1);
  }
}

resetAllSlots();
