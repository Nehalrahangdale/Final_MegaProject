const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const { execFile } = require("child_process");

const User = require("../models/User");
const Parking = require("../models/Parking");
const Slot = require("../models/Slot");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Review = require("../models/Review");
const Notification = require("../models/Notification");

async function runAllTests() {
  console.log("==================================================");
  console.log("🚗 NextPark AI: End-to-End System Feature Tests");
  console.log("==================================================");

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failedCount++;
    }
  }

  try {
    // 1. DATABASE CONNECTION
    console.log("\n[TEST 1] Testing Database Connection to MongoDB Atlas...");
    const conn = await mongoose.connect(process.env.MONGO_URI);
    assert(conn.connection.readyState === 1, `Connected to MongoDB Atlas: ${conn.connection.host}`);

    // 2. AUTHENTICATION & JWT TEST
    console.log("\n[TEST 2] Testing User Auth & JWT Signing...");
    const testEmail = `test_runner_${Date.now()}@example.com`;
    const plainPassword = "TestPassword@123";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const testUser = await User.create({
      name: "Automated Test User",
      email: testEmail,
      password: hashedPassword,
      phone: "9876543210",
      role: "owner",
    });

    assert(testUser._id, `Created test user ID: ${testUser._id}`);

    const isMatch = await bcrypt.compare(plainPassword, testUser.password);
    assert(isMatch === true, "Password hashing and bcrypt comparison verified");

    const token = jwt.sign(
      { id: testUser._id, role: testUser.role },
      process.env.JWT_SECRET || "smartparking123",
      { expiresIn: "1d" }
    );
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "smartparking123");
    assert(decoded.id === String(testUser._id), "JWT issued and verified successfully");

    // 3. PARKING & SLOTS MANAGEMENT TEST
    console.log("\n[TEST 3] Testing Parking Facility & Slot Creation...");
    const testParking = await Parking.create({
      name: "Super AI Test Plaza",
      address: "42 Innovation Road",
      city: "Nagpur",
      state: "Maharashtra",
      pricePerHour: 60,
      totalSlots: 5,
      availableSlots: 5,
      vehicleType: "Car",
      latitude: 21.1458,
      longitude: 79.0882,
      owner: testUser._id,
    });
    assert(testParking._id, `Created parking plaza ID: ${testParking._id}`);

    const slots = [];
    for (let i = 1; i <= 5; i++) {
      slots.push({
        parking: testParking._id,
        slotNumber: `A-${i}`,
        vehicleType: "Car",
        status: "Available",
      });
    }
    const createdSlots = await Slot.insertMany(slots);
    assert(createdSlots.length === 5, "Successfully created 5 individual parking slots");

    // 4. BOOKING WORKFLOW TEST
    console.log("\n[TEST 4] Testing Booking Workflow & Slot State Transition...");
    const targetSlot = createdSlots[0];
    const duration = 2;
    const totalAmount = testParking.pricePerHour * duration;

    const testBooking = await Booking.create({
      user: testUser._id,
      parking: testParking._id,
      slot: targetSlot._id,
      bookingDate: new Date(),
      startTime: "10:00",
      endTime: "12:00",
      duration: duration,
      totalAmount: totalAmount,
      paymentStatus: "Paid",
      paymentId: "pay_test_auto_12345",
      status: "Booked",
    });
    assert(testBooking._id, `Created booking ID: ${testBooking._id} (Total: ₹${totalAmount})`);

    // Mark slot as booked & decrement availableSlots
    targetSlot.status = "Booked";
    await targetSlot.save();
    testParking.availableSlots = testParking.availableSlots - 1;
    await testParking.save();

    const updatedSlot = await Slot.findById(targetSlot._id);
    const updatedParking = await Parking.findById(testParking._id);
    assert(updatedSlot.status === "Booked", "Slot status transitioned to 'Booked' 🔴");
    assert(updatedParking.availableSlots === 4, "Parking availableSlots correctly decremented to 4");

    // 5. QR CODE TICKET GENERATION
    console.log("\n[TEST 5] Testing QR Code Ticket Payload Generation...");
    const qrPayload = JSON.stringify({
      bookingId: testBooking._id,
      user: testUser.name,
      parking: testParking.name,
      slot: targetSlot.slotNumber,
      amount: totalAmount,
    });
    const qrDataUrl = await QRCode.toDataURL(qrPayload);
    assert(qrDataUrl.startsWith("data:image/png;base64,"), "QR Code Data URL successfully generated");

    // 6. PAYMENT RECORD CREATION
    console.log("\n[TEST 6] Testing Payment Ledger Record...");
    const testPayment = await Payment.create({
      user: testUser._id,
      booking: testBooking._id,
      parking: testParking._id,
      amount: totalAmount,
      currency: "INR",
      status: "Success",
      razorpayOrderId: "order_mock_test_123",
      razorpayPaymentId: "pay_test_auto_12345",
      razorpaySignature: "mock_signature_test",
    });
    assert(testPayment._id, "Payment ledger record created and linked to booking");

    // 7. ADMIN DASHBOARD ANALYTICS TEST
    console.log("\n[TEST 7] Testing Admin Dashboard Aggregations...");
    const totalUsers = await User.countDocuments();
    const totalParkings = await Parking.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const revenueAgg = await Payment.aggregate([
      { $match: { status: "Success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueAgg[0] ? revenueAgg[0].total : 0;

    assert(totalUsers > 0, `Total Users Aggregated: ${totalUsers}`);
    assert(totalParkings > 0, `Total Parkings Aggregated: ${totalParkings}`);
    assert(totalBookings > 0, `Total Bookings Aggregated: ${totalBookings}`);
    assert(totalRevenue >= totalAmount, `Total Settled Revenue Aggregated: ₹${totalRevenue}`);

    // 8. AI OCCUPANCY PREDICTION ENGINE TEST
    console.log("\n[TEST 8] Testing Python AI Machine Learning Predictor...");
    const aiPredictPath = path.join(__dirname, "../../ai/predict.py");
    await new Promise((resolve) => {
      execFile("python", [aiPredictPath, "14", "4", "30", "50"], (err, stdout) => {
        if (err) {
          console.error("  AI Prediction error:", err.message);
          assert(false, "Python predict.py failed");
          resolve();
          return;
        }
        try {
          const aiRes = JSON.parse(stdout.trim());
          assert(aiRes.success === true, `AI Prediction Successful! Occupancy: ${aiRes.prediction.occupancy_rate}%, Demand: ${aiRes.prediction.demand_level}`);
        } catch (pe) {
          assert(false, `AI JSON parsing failed: ${pe.message}`);
        }
        resolve();
      });
    });

    // 9. CLEANUP TEST DATA
    console.log("\n[CLEANUP] Cleaning up test records...");
    await Payment.findByIdAndDelete(testPayment._id);
    await Booking.findByIdAndDelete(testBooking._id);
    await Slot.deleteMany({ parking: testParking._id });
    await Parking.findByIdAndDelete(testParking._id);
    await User.findByIdAndDelete(testUser._id);
    console.log("  🧹 Test data cleaned up successfully.");

    // SUMMARY
    console.log("\n==================================================");
    console.log(`🏁 TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log("==================================================");

    await mongoose.disconnect();
    process.exit(failedCount > 0 ? 1 : 0);

  } catch (error) {
    console.error("❌ Unexpected Error in Test Suite:", error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

runAllTests();
