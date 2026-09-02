const path = require("path");
const mongoose = require("mongoose");
const Parking = require("../models/Parking");
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env") });

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_parking", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB for seeding");

    const user = await User.findOne();
    if (!user) {
      console.log("No user found. Please register a user first.");
      process.exit(1);
    }

    const parking = new Parking({
      name: "Test Parking",
      address: "123 Test Street",
      city: "Nagpur",
      state: "Maharashtra",
      image: "https://example.com/parking.jpg",
      description: "A secure testing parking spot",
      vehicleType: "Car",
      pricePerHour: 50,
      totalSlots: 10,
      availableSlots: 10,
      rating: 4.5,
      owner: user._id,
    });

    await parking.save();
    console.log("Successfully seeded a parking spot.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to connect or seed:", err);
    process.exit(1);
  });
