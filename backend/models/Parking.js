const mongoose = require("mongoose");

const parkingSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },

    address: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true,
        index: true
    },

    state: {
        type: String,
        default: ""
    },

    image: {
        type: String,
        default: ""
    },

    description: {
        type: String,
        default: ""
    },

    vehicleType: {
        type: String,
        enum: ["Bike", "Car", "Truck"],
        default: "Car"
    },

    pricePerHour: {
        type: Number,
        required: true
    },

    totalSlots: {
        type: Number,
        required: true
    },

    availableSlots: {
        type: Number,
        required: true
    },

    rating: {
        type: Number,
        default: 0
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

},
{
    timestamps: true
});

module.exports = mongoose.model("Parking", parkingSchema);