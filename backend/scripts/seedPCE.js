const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const Parking = require("../models/Parking");
const Slot = require("../models/Slot");
const Booking = require("../models/Booking");
const Review = require("../models/Review");

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_parking";

async function seedPCE() {
  try {
    console.log("==================================================");
    console.log("🏫 Seeding Real PCE Nagpur Parking Dataset");
    console.log("==================================================");
    console.log(`Connecting to MongoDB: ${mongoUri.includes("@") ? "MongoDB Atlas" : "Local MongoDB"}`);

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB successfully\n");

    // ----------------------------------------------------
    // 1. Passwords hashing
    // ----------------------------------------------------
    const adminPassword = await bcrypt.hash("admin123", 10);
    const ownerPassword = await bcrypt.hash("owner123", 10);
    const studentPassword = await bcrypt.hash("student123", 10);
    const facultyPassword = await bcrypt.hash("faculty123", 10);

    // ----------------------------------------------------
    // 2. Upsert Users (Admin, Owner, Students, Faculty)
    // ----------------------------------------------------
    console.log("👤 Creating PCE Users & Roles...");

    const adminUser = await User.findOneAndUpdate(
      { email: "admin@pce.edu.in" },
      {
        name: "PCE Campus Administrator",
        email: "admin@pce.edu.in",
        password: adminPassword,
        phone: "9876543210",
        role: "admin",
      },
      { upsert: true, new: true }
    );

    // Also ensure backup admin exists
    await User.findOneAndUpdate(
      { email: "admin@nextpark.com" },
      {
        name: "NextPark Admin",
        email: "admin@nextpark.com",
        password: await bcrypt.hash("admin@123", 10),
        phone: "9999999999",
        role: "admin",
      },
      { upsert: true, new: true }
    );

    const ownerUser = await User.findOneAndUpdate(
      { email: "pce.parking@pce.edu.in" },
      {
        name: "PCE Parking Incharge",
        email: "pce.parking@pce.edu.in",
        password: ownerPassword,
        phone: "9823012345",
        role: "owner",
      },
      { upsert: true, new: true }
    );

    const sumitStudent = await User.findOneAndUpdate(
      { email: "sumit.pce@gmail.com" },
      {
        name: "Sumit Bisen (Student)",
        email: "sumit.pce@gmail.com",
        password: studentPassword,
        phone: "9123456780",
        role: "user",
      },
      { upsert: true, new: true }
    );

    const rahulStudent = await User.findOneAndUpdate(
      { email: "rahul.deshmukh@gmail.com" },
      {
        name: "Rahul Deshmukh (Student)",
        email: "rahul.deshmukh@gmail.com",
        password: studentPassword,
        phone: "9123456781",
        role: "user",
      },
      { upsert: true, new: true }
    );

    const facultyUser = await User.findOneAndUpdate(
      { email: "dr.sharma@pce.edu.in" },
      {
        name: "Dr. A. Sharma (HOD CSE)",
        email: "dr.sharma@pce.edu.in",
        password: facultyPassword,
        phone: "9123456782",
        role: "user",
      },
      { upsert: true, new: true }
    );

    console.log("   ✅ Admin    : admin@pce.edu.in / admin123");
    console.log("   ✅ Owner    : pce.parking@pce.edu.in / owner123");
    console.log("   ✅ Student  : sumit.pce@gmail.com / student123");
    console.log("   ✅ Faculty  : dr.sharma@pce.edu.in / faculty123\n");

    // ----------------------------------------------------
    // 3. Clean up existing PCE parking records & associated slots
    // ----------------------------------------------------
    const existingPCEParkings = await Parking.find({
      name: { $regex: /PCE/i },
    });
    const pceParkingIds = existingPCEParkings.map((p) => p._id);

    if (pceParkingIds.length > 0) {
      await Slot.deleteMany({ parking: { $in: pceParkingIds } });
      await Booking.deleteMany({ parking: { $in: pceParkingIds } });
      await Review.deleteMany({ parking: { $in: pceParkingIds } });
      await Parking.deleteMany({ _id: { $in: pceParkingIds } });
      console.log(`🧹 Cleaned up ${pceParkingIds.length} previous PCE parking records`);
    }

    // ----------------------------------------------------
    // 4. Define 3 Real PCE Parking Facilities
    // ----------------------------------------------------
    const parkingLotsData = [
      {
        name: "PCE Main Admin & Academic Block – Faculty & VIP Car Parking",
        address: "PCE Main Building, CRPF Campus, Digdoh Hills, Hingna Road",
        city: "Nagpur",
        state: "Maharashtra",
        image: "/images/pce/pce_admin_block.jpg",
        description:
          "Official paved parking directly in front of the grand white administrative & academic building. Monitored with 24/7 CCTV surveillance, boom barriers, and security staff.",
        vehicleType: "Car",
        pricePerHour: 20,
        totalSlots: 20,
        availableSlots: 14,
        latitude: 21.1009,
        longitude: 79.0022,
        rating: 4.8,
        owner: ownerUser._id,
        slotPrefix: "ADM-C",
        bookedCount: 6,
      },
      {
        name: "PCE Campus Student 2-Wheeler Zone (Gate-1 Pathway)",
        address: "Near Campus Gate 1, Priyadarshini College of Engineering, Hingna Road",
        city: "Nagpur",
        state: "Maharashtra",
        image: "/images/pce/pce_gate1_bike_stand.jpg",
        description:
          "Dedicated tree-shaded interlocking tile pathway for student bikes and scooters. Quick walking distance to CSE, IT, Mechanical, and Civil departments.",
        vehicleType: "Bike",
        pricePerHour: 10,
        totalSlots: 35,
        availableSlots: 25,
        latitude: 21.0998,
        longitude: 79.0012,
        rating: 4.7,
        owner: ownerUser._id,
        slotPrefix: "G1-B",
        bookedCount: 10,
      },
      {
        name: "PCE Sports Ground Open Parking (Multi-Vehicle)",
        address: "Adjacent to College Cricket Ground, PCE Campus, Digdoh Hills",
        city: "Nagpur",
        state: "Maharashtra",
        image: "/images/pce/pce_sports_ground.jpg",
        description:
          "Spacious open ground parking with natural shade trees. Ideal for cars and two-wheelers, student gatherings, sports events, and annual cultural fest parking.",
        vehicleType: "Car",
        pricePerHour: 15,
        totalSlots: 25,
        availableSlots: 18,
        latitude: 21.1015,
        longitude: 79.0035,
        rating: 4.5,
        owner: ownerUser._id,
        slotPrefix: "GRD",
        bookedCount: 7,
      },
    ];

    console.log("🅿️ Creating 3 PCE Parking Facilities...");
    const createdParkings = [];
    const allSlots = [];
    const allBookings = [];

    const { computeStartAndEndDates } = require("../services/bookingExpiryService");

    const now = new Date();
    const students = [sumitStudent, rahulStudent, facultyUser];

    // For active bookings, create realistic window: started 1 hour ago, ends 2 hours from now
    const activeStartDT = new Date(now.getTime() - 60 * 60 * 1000);
    const activeEndDT = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const startH = String(activeStartDT.getHours()).padStart(2, "0");
    const startM = String(activeStartDT.getMinutes()).padStart(2, "0");
    const endH = String(activeEndDT.getHours()).padStart(2, "0");
    const endM = String(activeEndDT.getMinutes()).padStart(2, "0");
    const liveStartTime = `${startH}:${startM}`;
    const liveEndTime = `${endH}:${endM}`;

    for (const pData of parkingLotsData) {
      const { slotPrefix, bookedCount, ...parkingFields } = pData;
      const parking = await Parking.create(parkingFields);
      createdParkings.push({ parking, slotPrefix, bookedCount });

      console.log(`   📍 Created: ${parking.name} (${parking.totalSlots} Slots)`);

      // Generate Slots
      for (let i = 1; i <= parking.totalSlots; i++) {
        const isBooked = i <= bookedCount;
        const slotNumber = `${slotPrefix}-${i < 10 ? "0" + i : i}`;

        const slot = await Slot.create({
          parking: parking._id,
          slotNumber,
          vehicleType: parking.vehicleType,
          status: isBooked ? "Booked" : "Available",
        });

        allSlots.push(slot);

        // If slot is Booked, create realistic active booking
        if (isBooked) {
          const randomStudent = students[i % students.length];
          const booking = await Booking.create({
            user: randomStudent._id,
            parking: parking._id,
            slot: slot._id,
            bookingDate: now,
            startTime: liveStartTime,
            endTime: liveEndTime,
            startDateTime: activeStartDT,
            endDateTime: activeEndDT,
            duration: 3,
            totalAmount: parking.pricePerHour * 3,
            paymentStatus: "Paid",
            paymentId: `pay_pce_${Date.now()}_${i}`,
            status: "Booked",
          });
          allBookings.push(booking);
        }
      }
    }

    // ----------------------------------------------------
    // 5. Generate Historical Completed Bookings for Analytics & AI
    // ----------------------------------------------------
    console.log("\n📊 Generating Historical Bookings for Admin Charts & AI Model...");
    const pastDays = [1, 2, 3];
    let historicalCount = 0;

    for (const { parking } of createdParkings) {
      for (const dayOffset of pastDays) {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - dayOffset);
        const pastDateStr = pastDate.toISOString().split("T")[0];

        for (let b = 1; b <= 4; b++) {
          const randomStudent = students[(dayOffset + b) % students.length];
          const duration = 2 + (b % 3);
          const amount = parking.pricePerHour * duration;
          const startTimeStr = `${String(8 + b).padStart(2, "0")}:00`;
          const { startDateTime, endDateTime, endTime } = computeStartAndEndDates(
            pastDateStr,
            startTimeStr,
            duration
          );

          const pastBooking = await Booking.create({
            user: randomStudent._id,
            parking: parking._id,
            slot: allSlots[(b * 3) % allSlots.length]._id,
            bookingDate: pastDate,
            startTime: startTimeStr,
            endTime: endTime,
            startDateTime: startDateTime,
            endDateTime: endDateTime,
            duration,
            totalAmount: amount,
            paymentStatus: "Paid",
            paymentId: `pay_hist_${Date.now()}_${dayOffset}_${b}`,
            status: "Completed",
            createdAt: pastDate,
            updatedAt: pastDate,
          });

          allBookings.push(pastBooking);
          historicalCount++;
        }
      }
    }

    console.log(`   ✅ Created ${historicalCount} historical bookings`);

    // ----------------------------------------------------
    // 6. Generate Realistic PCE Reviews
    // ----------------------------------------------------
    console.log("\n⭐ Adding Genuine PCE Campus Reviews...");
    const reviewsData = [
      {
        user: facultyUser._id,
        parking: createdParkings[0].parking._id,
        rating: 5,
        comment:
          "Very organized and secure parking right in front of the admin building. Camera surveillance and security guards make it effortless for professors.",
      },
      {
        user: sumitStudent._id,
        parking: createdParkings[0].parking._id,
        rating: 5,
        comment:
          "Iconic white PCE building view! Paved parking slots make car parking completely hassle-free.",
      },
      {
        user: sumitStudent._id,
        parking: createdParkings[1].parking._id,
        rating: 5,
        comment:
          "Best bike parking spot for students! Shady neem trees keep bikes cool even during peak summer afternoons in Nagpur.",
      },
      {
        user: rahulStudent._id,
        parking: createdParkings[1].parking._id,
        rating: 4,
        comment:
          "Very close to Gate 1 and CSE block. Slots fill up fast by 10 AM so booking via app is super helpful.",
      },
      {
        user: rahulStudent._id,
        parking: createdParkings[2].parking._id,
        rating: 5,
        comment:
          "Huge open ground near the cricket pitch! Perfect parking spot during tech fests and college sports events.",
      },
    ];

    for (const r of reviewsData) {
      await Review.create(r);
    }
    console.log(`   ✅ Added ${reviewsData.length} genuine reviews`);

    console.log("\n==================================================");
    console.log("🎉 PCE NAGPUR DATASET SEEDING COMPLETED!");
    console.log("==================================================");
    console.log("📋 Credentials for Demo & Login:");
    console.log("   • Admin Login   : admin@pce.edu.in       | Password: admin123");
    console.log("   • Owner Login   : pce.parking@pce.edu.in | Password: owner123");
    console.log("   • Student Login : sumit.pce@gmail.com    | Password: student123");
    console.log("   • Faculty Login : dr.sharma@pce.edu.in   | Password: faculty123");
    console.log("--------------------------------------------------");
    console.log(`Total Facilities : ${createdParkings.length}`);
    console.log(`Total Slots      : ${allSlots.length}`);
    console.log(`Total Bookings   : ${allBookings.length}`);
    console.log("==================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
}

seedPCE();
