const Parking = require("../models/Parking");

// ==============================
// Add Parking
// ==============================
const addParking = async (req, res) => {
  try {
    const parking = await Parking.create({
      ...req.body,
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Parking Added Successfully",
      parking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get All Parking
// ==============================
const getAllParking = async (req, res) => {
  try {
    const parking = await Parking.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: parking.length,
      parking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get My Parking
// ==============================
const getMyParking = async (req, res) => {
  try {
    const parking = await Parking.find({
      owner: req.user._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: parking.length,
      parking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get Parking By ID
// ==============================
const getParkingById = async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id).populate(
      "owner",
      "name email"
    );

    if (!parking) {
      return res.status(404).json({
        success: false,
        message: "Parking Not Found",
      });
    }

    res.status(200).json({
      success: true,
      parking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Update Parking
// ==============================
const updateParking = async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);

    if (!parking) {
      return res.status(404).json({
        success: false,
        message: "Parking Not Found",
      });
    }

    if (
      req.user.role !== "admin" &&
      parking.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this parking.",
      });
    }

    const updatedParking = await Parking.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Parking Updated Successfully",
      parking: updatedParking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Delete Parking
// ==============================
const deleteParking = async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);

    if (!parking) {
      return res.status(404).json({
        success: false,
        message: "Parking Not Found",
      });
    }

    if (
      req.user.role !== "admin" &&
      parking.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this parking.",
      });
    }

    await parking.deleteOne();

    res.status(200).json({
      success: true,
      message: "Parking Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Search Parking
// ==============================
const searchParking = async (req, res) => {
  try {
    const { city, vehicleType, minPrice, maxPrice } = req.query;

    const query = {};

    if (city) {
      query.city = {
        $regex: city,
        $options: "i",
      };
    }

    if (vehicleType) {
      query.vehicleType = vehicleType;
    }

    if (minPrice || maxPrice) {
      query.pricePerHour = {};

      if (minPrice) query.pricePerHour.$gte = Number(minPrice);

      if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
    }

    const parking = await Parking.find(query)
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: parking.length,
      parking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addParking,
  getAllParking,
  getMyParking,
  getParkingById,
  updateParking,
  deleteParking,
  searchParking,
};