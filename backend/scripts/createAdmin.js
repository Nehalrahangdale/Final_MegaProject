const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env") });

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_parking", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB");

    const existingAdmin = await User.findOne({ email: "admin@nextpark.com" });
    if (existingAdmin) {
      console.log("Admin already exists! Email: admin@nextpark.com");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin@123", 10);

    const admin = await User.create({
      name: "Admin",
      email: "admin@nextpark.com",
      password: hashedPassword,
      phone: "9999999999",
      role: "admin",
    });

    console.log("✅ Admin created successfully!");
    console.log("   Email   : admin@nextpark.com");
    console.log("   Password: admin@123");
    console.log("   Role    : admin");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
