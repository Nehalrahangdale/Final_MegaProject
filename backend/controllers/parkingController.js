const Parking = require("../models/Parking");
const Booking = require("../models/Booking");
const cloudinary = require("../config/cloudinary");
const { execFile } = require("child_process");
const path = require("path");

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

// Calculate distance in kilometers between two GPS coordinates (Haversine formula)
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);
  if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) return null;

  const R = 6371; // Earth radius in km
  const dLat = ((nLat2 - nLat1) * Math.PI) / 180;
  const dLon = ((nLon2 - nLon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((nLat1 * Math.PI) / 180) *
      Math.cos((nLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

// ==============================
// Get All Parking
// ==============================
const getAllParking = async (req, res) => {
  try {
    const { lat, lng, radius, sortBy } = req.query;

    let parking = await Parking.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .lean();

    if (lat && lng) {
      const userLat = Number(lat);
      const userLng = Number(lng);

      parking = parking.map((item) => {
        if (item.latitude != null && item.longitude != null) {
          const distance = calculateDistanceKm(
            userLat,
            userLng,
            Number(item.latitude),
            Number(item.longitude)
          );
          return { ...item, distance };
        }
        return { ...item, distance: null };
      });

      if (radius) {
        const maxRadius = Number(radius);
        parking = parking.filter(
          (item) => item.distance !== null && item.distance <= maxRadius
        );
      }

      if (sortBy === "distance") {
        parking.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
      }
    }

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
    const {
      city,
      search,
      vehicleType,
      minPrice,
      maxPrice,
      lat,
      lng,
      radius,
      sortBy,
    } = req.query;

    const query = {};

    const searchTerm = search || city;
    if (searchTerm) {
      query.$or = [
        { city: { $regex: searchTerm, $options: "i" } },
        { name: { $regex: searchTerm, $options: "i" } },
        { address: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (vehicleType && vehicleType !== "All") {
      query.vehicleType = vehicleType;
    }

    if (minPrice || maxPrice) {
      query.pricePerHour = {};

      if (minPrice) query.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
    }

    let parking = await Parking.find(query)
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .lean();

    if (lat && lng) {
      const userLat = Number(lat);
      const userLng = Number(lng);

      parking = parking.map((item) => {
        if (item.latitude != null && item.longitude != null) {
          const distance = calculateDistanceKm(
            userLat,
            userLng,
            Number(item.latitude),
            Number(item.longitude)
          );
          return { ...item, distance };
        }
        return { ...item, distance: null };
      });

      if (radius) {
        const maxRadius = Number(radius);
        parking = parking.filter(
          (item) => item.distance !== null && item.distance <= maxRadius
        );
      }

      if (sortBy === "distance") {
        parking.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
      }
    }

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
// Get Nearby Parking
// ==============================
const getNearbyParking = async (req, res) => {
  try {
    const { lat, lng, radius = 50, vehicleType, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude (lat) and Longitude (lng) are required.",
      });
    }

    const userLat = Number(lat);
    const userLng = Number(lng);
    const maxRadius = Number(radius);

    const query = {
      latitude: { $ne: null },
      longitude: { $ne: null },
    };

    if (vehicleType && vehicleType !== "All") {
      query.vehicleType = vehicleType;
    }

    const allParkings = await Parking.find(query)
      .populate("owner", "name email")
      .lean();

    const nearby = allParkings
      .map((item) => {
        const distance = calculateDistanceKm(
          userLat,
          userLng,
          Number(item.latitude),
          Number(item.longitude)
        );
        return { ...item, distance };
      })
      .filter((item) => item.distance !== null && item.distance <= maxRadius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, Number(limit));

    res.status(200).json({
      success: true,
      count: nearby.length,
      userCoordinates: { latitude: userLat, longitude: userLng },
      parking: nearby,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get AI Parking Prediction
// ==============================
const getParkingPrediction = async (req, res) => {
  try {
    const { id } = req.params;
    const parking = await Parking.findById(id);

    if (!parking) {
      return res.status(404).json({
        success: false,
        message: "Parking not found",
      });
    }

    const now = new Date();
    const hour = now.getHours();
    const day = (now.getDay() + 6) % 7; // 0 = Monday, 6 = Sunday

    // Count real bookings for this parking facility from MongoDB
    const bookingsCount = await Booking.countDocuments({
      parking: id,
    });

    const totalSlots = parking.totalSlots || 50;

    // Execute Python Random Forest Predictor
    const scriptPath = path.join(__dirname, "../../ai/predict.py");
    const pythonExe = process.platform === "win32" ? "python" : "python3";

    execFile(
      pythonExe,
      [
        scriptPath,
        String(hour),
        String(day),
        String(bookingsCount),
        String(totalSlots),
      ],
      { timeout: 6000 },
      (error, stdout, stderr) => {
        if (error || !stdout) {
          console.warn("Python prediction fallback:", error?.message || stderr);
          const baseOccupancy = Math.min(
            95,
            Math.max(
              15,
              Math.round(
                ((totalSlots - (parking.availableSlots || totalSlots)) /
                  totalSlots) *
                  100
              ) || 35
            )
          );

          return res.status(200).json({
            success: true,
            source: "heuristic_fallback",
            prediction: {
              occupancy_rate: baseOccupancy,
              demand_level:
                baseOccupancy >= 75
                  ? "High"
                  : baseOccupancy >= 40
                  ? "Moderate"
                  : "Low",
              rush_hour_alert:
                (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 20),
              recommendation:
                baseOccupancy >= 75
                  ? "🟠 High demand expected. Advance booking is strongly advised."
                  : "🟢 Normal parking availability expected.",
              predicted_available_slots: Math.max(
                0,
                Math.round((1 - baseOccupancy / 100) * totalSlots)
              ),
              predicted_booked_slots: Math.min(
                totalSlots,
                Math.round((baseOccupancy / 100) * totalSlots)
              ),
            },
            input: {
              hour,
              day,
              bookings: bookingsCount,
              total_slots: totalSlots,
            },
          });
        }

        try {
          const result = JSON.parse(stdout.trim());
          return res.status(200).json({
            success: true,
            source: "random_forest_ml",
            prediction: result.prediction,
            input: result.input,
          });
        } catch (parseErr) {
          return res.status(500).json({
            success: false,
            message: "Failed to parse prediction output",
            error: parseErr.message,
          });
        }
      }
    );
  } catch (error) {
    console.error("AI Prediction Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error generating AI prediction",
      error: error.message,
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
  getNearbyParking,
  getParkingPrediction,
};