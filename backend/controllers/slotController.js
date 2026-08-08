const Slot = require("../models/Slot");

// ===============================
// Add Slot
// ===============================
const addSlot = async (req, res) => {
    try {
        const { parking, slotNumber, vehicleType } = req.body;

        if (!parking || !slotNumber) {
            return res.status(400).json({
                success: false,
                message: "Parking and Slot Number are required"
            });
        }

        const existingSlot = await Slot.findOne({
            parking,
            slotNumber
        });

        if (existingSlot) {
            return res.status(400).json({
                success: false,
                message: "Slot already exists"
            });
        }

        const slot = await Slot.create({
            parking,
            slotNumber,
            vehicleType: vehicleType || "Car"
        });

        res.status(201).json({
            success: true,
            message: "Slot Added Successfully",
            slot
        });

    } catch (error) {
        console.error("Add Slot Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ===============================
// Get All Slots
// ===============================
const getAllSlots = async (req, res) => {
    try {
        const slots = await Slot.find()
            .populate("parking", "name city address")
            .sort({ slotNumber: 1 });

        res.status(200).json({
            success: true,
            count: slots.length,
            slots
        });

    } catch (error) {
        console.error("Get Slots Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ===============================
// Get Slots By Parking
// ===============================
const getSlotsByParking = async (req, res) => {
    try {
        const { parkingId } = req.params;

        const slots = await Slot.find({
            parking: parkingId
        }).sort({ slotNumber: 1 });

        res.status(200).json({
            success: true,
            count: slots.length,
            slots
        });

    } catch (error) {
        console.error("Get Parking Slots Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ===============================
// Get Single Slot
// ===============================
const getSlot = async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.id)
            .populate("parking", "name city address");

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: "Slot Not Found"
            });
        }

        res.status(200).json({
            success: true,
            slot
        });

    } catch (error) {
        console.error("Get Slot Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ===============================
// Update Slot
// ===============================
const updateSlot = async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: "Slot Not Found"
            });
        }

        const updatedSlot = await Slot.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: "Slot Updated Successfully",
            slot: updatedSlot
        });

    } catch (error) {
        console.error("Update Slot Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ===============================
// Delete Slot
// ===============================
const deleteSlot = async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: "Slot Not Found"
            });
        }

        await slot.deleteOne();

        res.status(200).json({
            success: true,
            message: "Slot Deleted Successfully"
        });

    } catch (error) {
        console.error("Delete Slot Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    addSlot,
    getAllSlots,
    getSlotsByParking,
    getSlot,
    updateSlot,
    deleteSlot
};