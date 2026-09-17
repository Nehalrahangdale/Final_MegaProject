const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { io } = require("socket.io-client");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Parking = require("../models/Parking");
const Slot = require("../models/Slot");

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_parking";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const INTERVAL_SECONDS = 60;

async function runSimulator() {
  console.log("==================================================");
  console.log("🔄 PCE Nagpur Real-Time Slot Simulator Started");
  console.log("==================================================");
  console.log(`Connecting to MongoDB...`);

  await mongoose.connect(mongoUri);
  console.log("✅ MongoDB Connected");

  // Connect to Socket.IO
  console.log(`Connecting Socket.IO to ${BACKEND_URL}...`);
  const socket = io(BACKEND_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
  });

  socket.on("connect", () => {
    console.log(`⚡ Connected to Backend Socket.IO Server (ID: ${socket.id})`);
  });

  socket.on("connect_error", (err) => {
    console.warn(`⚠️ Socket connection warning: ${err.message} (Will retry automatically)`);
  });

  // Find all PCE Parkings
  const pceParkings = await Parking.find({ name: { $regex: /PCE/i } });
  if (pceParkings.length === 0) {
    console.log("❌ No PCE parkings found. Please run 'npm run seed:pce' first.");
    process.exit(1);
  }

  console.log(`Found ${pceParkings.length} PCE facilities for live simulation.`);
  console.log(`Simulation will toggle random slot statuses every ${INTERVAL_SECONDS} seconds.\n`);
  console.log("Press Ctrl + C to stop simulation at any time.\n");

  const runTick = async () => {
    try {
      // Pick random parking facility
      const randomParking = pceParkings[Math.floor(Math.random() * pceParkings.length)];
      const slots = await Slot.find({ parking: randomParking._id });

      if (!slots || slots.length === 0) return;

      // Pick random slot
      const slot = slots[Math.floor(Math.random() * slots.length)];
      const isCurrentlyBooked = slot.status === "Booked";
      const newStatus = isCurrentlyBooked ? "Available" : "Booked";

      // Update Slot in DB
      slot.status = newStatus;
      await slot.save();

      // Recalculate available slots for the facility
      const availableCount = await Slot.countDocuments({
        parking: randomParking._id,
        status: "Available",
      });

      await Parking.findByIdAndUpdate(randomParking._id, {
        availableSlots: availableCount,
      });

      const timestamp = new Date().toLocaleTimeString();
      const statusIcon = newStatus === "Booked" ? "🔴 BOOKED" : "🟢 FREED/AVAILABLE";

      console.log(
        `[${timestamp}] ${statusIcon} -> ${slot.slotNumber} at "${randomParking.name.slice(0, 30)}..." (Available: ${availableCount}/${randomParking.totalSlots})`
      );

      // Broadcast update via Socket.IO
      if (socket.connected) {
        socket.emit("simulateSlotUpdate", {
          parkingId: String(randomParking._id),
          type: newStatus === "Booked" ? "BOOKED" : "AVAILABLE",
          slot: {
            _id: slot._id,
            slotNumber: slot.slotNumber,
            vehicleType: slot.vehicleType,
            status: newStatus,
            parking: slot.parking,
          },
        });
      }
    } catch (err) {
      console.error("Simulation tick error:", err.message);
    }
  };

  // Run first tick after 3 seconds, then every INTERVAL_SECONDS
  setTimeout(() => {
    runTick();
    setInterval(runTick, INTERVAL_SECONDS * 1000);
  }, 3000);
}

runSimulator().catch((err) => {
  console.error("Fatal Simulator Error:", err);
  process.exit(1);
});
