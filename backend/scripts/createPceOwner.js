const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("../models/Parking");
const User = require("../models/User");
const Parking = require("../models/Parking");

async function createPceOwner() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_parking");

  const hashedPassword = await bcrypt.hash("pce@123", 10);

  const pceOwner = await User.findOneAndUpdate(
    { email: "pce.owner@gmail.com" },
    {
      name: "PCE Campus Parking Owner",
      email: "pce.owner@gmail.com",
      password: hashedPassword,
      phone: "9823012345",
      role: "owner",
    },
    { upsert: true, new: true }
  );

  console.log("PCE Owner Created / Updated:");
  console.log("  Name  :", pceOwner.name);
  console.log("  Email :", pceOwner.email);
  console.log("  Pass  : pce@123");
  console.log("  Role  :", pceOwner.role);

  // Link all PCE parking lots to this owner
  const updateRes = await Parking.updateMany(
    { name: { $regex: "PCE", $options: "i" } },
    { owner: pceOwner._id }
  );

  console.log(`Assigned ${updateRes.modifiedCount} PCE parking plazas to this owner.`);

  process.exit(0);
}

createPceOwner().catch(console.error);
