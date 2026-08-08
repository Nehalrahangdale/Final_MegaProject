const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
{
    parking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parking",
        required: true
    },

    slotNumber: {
        type: String,
        required: true
    },

    vehicleType: {
        type: String,
        enum: ["Bike", "Car", "Truck"],
        default: "Car"
    },

    status: {
        type: String,
        enum: ["Available", "Booked"],
        default: "Available"
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Slot", slotSchema);