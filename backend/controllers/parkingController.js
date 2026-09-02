const Parking = require("../models/Parking");
const cloudinary = require("../config/cloudinary");

// ==============================
// Add Parking
// ==============================
const addParking = async (req, res) => {
  try {
    let imageUrl = req.body.image || "";

    // Upload image to Cloudinary
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "nextpark-ai/parking",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        uploadStream.end(req.file.buffer);
      });

      imageUrl = result.secure_url;
    }

    const parkingData = { ...req.body };

    if (
      parkingData.latitude === "" ||
      parkingData.latitude === "null" ||
      parkingData.latitude === undefined
    ) {
      parkingData.latitude = null;
    } else if (parkingData.latitude !== null) {
      parkingData.latitude = Number(parkingData.latitude);
    }

    if (
      parkingData.longitude === "" ||
      parkingData.longitude === "null" ||
      parkingData.longitude === undefined
    ) {
      parkingData.longitude = null;
    } else if (parkingData.longitude !== null) {
      parkingData.longitude = Number(parkingData.longitude);
    }

    const parking = await Parking.create({
      ...parkingData,
      image: imageUrl,
      owner: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Parking Added Successfully",
      parking,
    });
  } catch (error) {
    console.error("Add Parking Error:", error);

    return res.status(500).json({
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

    let updateData = { ...req.body };

    if (
      updateData.latitude === "" ||
      updateData.latitude === "null" ||
      updateData.latitude === undefined
    ) {
      updateData.latitude = null;
    } else if (updateData.latitude !== null) {
      updateData.latitude = Number(updateData.latitude);
    }

    if (
      updateData.longitude === "" ||
      updateData.longitude === "null" ||
      updateData.longitude === undefined
    ) {
      updateData.longitude = null;
    } else if (updateData.longitude !== null) {
      updateData.longitude = Number(updateData.longitude);
    }

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "nextpark-ai/parking",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        uploadStream.end(req.file.buffer);
      });

      updateData.image = result.secure_url;
    }

    const updatedParking = await Parking.findByIdAndUpdate(
      req.params.id,
      updateData,
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