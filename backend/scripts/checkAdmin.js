const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env") });

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_parking")
  .then(async () => {
    const admin = await User.findOne({ email: "admin@nextpark.com" });
    if (!admin) {
      console.log("❌ Admin NOT found in DB!");
      process.exit(0);
    }
    console.log("✅ Admin found:");
    console.log("   Name :", admin.name);
    console.log("   Email:", admin.email);
    console.log("   Role :", admin.role);
    console.log("   Hash :", admin.password);

    // Test password
    const testPass = "admin@123";
    const isMatch = await bcrypt.compare(testPass, admin.password);
    console.log(`\n🔐 Password "admin@123" matches: ${isMatch ? "✅ YES" : "❌ NO"}`);

    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
