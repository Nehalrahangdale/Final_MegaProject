const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_parking", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
    const hashedPassword = await bcrypt.hash("admin@123", 10);

    const result = await User.findOneAndUpdate(
        { email: "admin@nextpark.com" },
        { password: hashedPassword },
        { new: true }
    );

    if (result) {
        console.log("✅ Admin password reset successfully!");
        console.log("   Email   : admin@nextpark.com");
        console.log("   Password: admin@123");
        console.log("   Role    : admin");
    } else {
        console.log("❌ Admin not found!");
    }

    process.exit(0);
}).catch(err => {
    console.error("Error:", err);
    process.exit(1);
});
