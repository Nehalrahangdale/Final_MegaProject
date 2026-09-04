import { useEffect, useState } from "react";
import {
  FaParking,
  FaCar,
  FaCheckCircle,
  FaCalendarCheck,
  FaRupeeSign,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSyncAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

import {
  addParking,
  getMyParking,
  updateParking,
  deleteParking,
  reverseGeocode,
  getGoogleMapsDirectionsUrl,
} from "../services/parkingService";

import { getOwnerDashboard } from "../services/ownerService";
import { ParkingMap } from "../components";

import "../styles/OwnerDashboard.css";

function OwnerDashboard() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pricePerHour: "",
    totalSlots: "",
    availableSlots: "",
    vehicleType: "Car",
    description: "",
    image: "",
    latitude: "",
    longitude: "",
  });

  const [myParking, setMyParking] = useState([]);

  const [dashboard, setDashboard] = useState({
    totalParking: 0,
    totalSlots: 0,
    availableSlots: 0,
    bookedSlots: 0,
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    recentBookings: [],
  });

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [geocodingLocation, setGeocodingLocation] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Auto-detect current coordinates for parking location and reverse-geocode address
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
        setDetectingLocation(false);

        // Auto reverse-geocode to populate address / city / state
        try {
          setGeocodingLocation(true);
          const geo = await reverseGeocode(lat, lng);
          if (geo) {
            setFormData((prev) => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              city: prev.city || geo.city,
              state: prev.state || geo.state,
              address: prev.address || geo.address,
            }));
          }
        } catch (e) {
          console.warn("Reverse geocode failed:", e);
        } finally {
          setGeocodingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Could not fetch your location. Please enter coordinates or pick on map.");
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Map click/drag picker handler
  const handleMapPickerSelect = async (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));

    try {
      setGeocodingLocation(true);
      const geo = await reverseGeocode(lat, lng);
      if (geo) {
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          city: prev.city || geo.city,
          state: prev.state || geo.state,
          address: prev.address || geo.address,
        }));
      }
    } catch (e) {
      console.warn("Reverse geocode failed:", e);
    } finally {
      setGeocodingLocation(false);
    }
  };

  // =====================================
  // Load Data
  // =====================================

  const loadData = async () => {
    await Promise.all([
      loadMyParking(),
      loadDashboard(),
    ]);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMyParking = async () => {
    try {
      const data = await getMyParking();
      setMyParking(data.parking || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadDashboard = async () => {
    try {
      const data = await getOwnerDashboard();

      setDashboard(
        data.dashboard || {
          totalParking: 0,
          totalSlots: 0,
          availableSlots: 0,
          bookedSlots: 0,
          totalBookings: 0,
          activeBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          totalRevenue: 0,
          recentBookings: [],
        }
      );
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setPageLoading(false);
    }
  };

  // =====================================
  // Form
  // =====================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      pricePerHour: "",
      totalSlots: "",
      availableSlots: "",
      vehicleType: "Car",
      description: "",
      image: "",
      latitude: "",
      longitude: "",
    });

    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
  };

  // =====================================
  // Add / Update
  // =====================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const totalSlots = Number(formData.totalSlots);

      const availableSlots =
        formData.availableSlots === ""
          ? totalSlots
          : Number(formData.availableSlots);

      if (availableSlots > totalSlots) {
        alert(
          "Available slots cannot be greater than total slots."
        );
        return;
      }

      const latVal =
        formData.latitude !== "" &&
        formData.latitude !== null &&
        !isNaN(Number(formData.latitude))
          ? Number(formData.latitude)
          : null;

      const lngVal =
        formData.longitude !== "" &&
        formData.longitude !== null &&
        !isNaN(Number(formData.longitude))
          ? Number(formData.longitude)
          : null;

      let payload;

      if (imageFile) {
        const formDataObj = new FormData();
        formDataObj.append("name", formData.name.trim());
        formDataObj.append("address", formData.address.trim());
        formDataObj.append("city", formData.city.trim());
        formDataObj.append("state", formData.state.trim());
        formDataObj.append("pricePerHour", Number(formData.pricePerHour));
        formDataObj.append("totalSlots", totalSlots);
        formDataObj.append("availableSlots", availableSlots);
        formDataObj.append("vehicleType", formData.vehicleType);
        formDataObj.append("description", formData.description.trim());
        if (latVal !== null) formDataObj.append("latitude", latVal);
        if (lngVal !== null) formDataObj.append("longitude", lngVal);
        formDataObj.append("image", imageFile);
        payload = formDataObj;
      } else {
        payload = {
          name: formData.name.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pricePerHour: Number(formData.pricePerHour),
          totalSlots,
          availableSlots,
          vehicleType: formData.vehicleType,
          description: formData.description.trim(),
          image: formData.image.trim(),
          latitude: latVal,
          longitude: lngVal,
        };
      }

      let data;

      if (editingId) {
        data = await updateParking(
          editingId,
          payload
        );
      } else {
        data = await addParking(payload);
      }

      alert(
        data.message ||
          "Parking saved successfully."
      );

      resetForm();
      await loadData();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Unable to save parking."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // Edit
  // =====================================

  const handleEdit = (parking) => {
    setEditingId(parking._id);

    setFormData({
      name: parking.name || "",
      address: parking.address || "",
      city: parking.city || "",
      state: parking.state || "",
      pricePerHour: parking.pricePerHour || "",
      totalSlots: parking.totalSlots || "",
      availableSlots: parking.availableSlots || "",
      vehicleType: parking.vehicleType || "Car",
      description: parking.description || "",
      image: parking.image || "",
      latitude:
        parking.latitude !== null && parking.latitude !== undefined
          ? parking.latitude
          : "",
      longitude:
        parking.longitude !== null && parking.longitude !== undefined
          ? parking.longitude
          : "",
    });

    setImageFile(null);
    setImagePreview(parking.image || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================
  // Delete
  // =====================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this parking?"
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      const data = await deleteParking(id);

      alert(
        data.message ||
          "Parking deleted successfully."
      );

      await loadData();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Delete failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // Refresh
  // =====================================

  const handleRefresh = async () => {
    setPageLoading(true);
    await loadData();
  };

  // =====================================
  // Date
  // =====================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================
  // Loading
  // =====================================

  if (pageLoading) {
    return (
      <div className="owner-loading">
        <div className="spinner-border text-success" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="owner-dashboard">

      {/* ================================= */}
      {/* Hero Header */}
      {/* ================================= */}

      <div className="owner-hero">

        <div>
          <div className="owner-badge">
            <FaParking />
            OWNER PANEL
          </div>

          <h1>
            Parking Management
          </h1>

          <p>
            Manage your parking locations,
            slots and customer bookings from
            one place.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
        >
          <FaSyncAlt />
          Refresh
        </button>

      </div>

      {/* ================================= */}
      {/* Statistics */}
      {/* ================================= */}

      <div className="stats-grid">

        <div className="stat-card blue">
          <div className="stat-icon">
            <FaParking />
          </div>

          <div>
            <span>Total Parking</span>
            <h2>{dashboard.totalParking}</h2>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">
            <FaCar />
          </div>

          <div>
            <span>Total Slots</span>
            <h2>{dashboard.totalSlots}</h2>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>

          <div>
            <span>Available Slots</span>
            <h2>{dashboard.availableSlots}</h2>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">
            <FaCalendarCheck />
          </div>

          <div>
            <span>Total Bookings</span>
            <h2>{dashboard.totalBookings}</h2>
          </div>
        </div>

        <div className="stat-card red">
          <div className="stat-icon">
            <FaCar />
          </div>

          <div>
            <span>Booked Slots</span>
            <h2>{dashboard.bookedSlots}</h2>
          </div>
        </div>

        <div className="stat-card teal">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>

          <div>
            <span>Completed</span>
            <h2>{dashboard.completedBookings}</h2>
          </div>
        </div>

        <div className="stat-card dark">
          <div className="stat-icon">
            <FaCalendarCheck />
          </div>

          <div>
            <span>Active Bookings</span>
            <h2>{dashboard.activeBookings}</h2>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">
            <FaRupeeSign />
          </div>

          <div>
            <span>Total Revenue</span>
            <h2>
              ₹{dashboard.totalRevenue || 0}
            </h2>
          </div>
        </div>

      </div>

      {/* ================================= */}
      {/* Add Parking */}
      {/* ================================= */}

      <div className="section-card">

        <div className="section-header">

          <div>
            <h2>
              {editingId
                ? "Edit Parking"
                : "Add New Parking"}
            </h2>

            <p>
              Add and manage your parking
              location details.
            </p>
          </div>

          {editingId && (
            <button
              className="cancel-btn"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}

        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            <div className="form-group">
              <label>Parking Name</label>

              <input
                type="text"
                name="name"
                placeholder="Example: City Mall Parking"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Address</label>

              <input
                type="text"
                name="address"
                placeholder="Parking address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>City</label>

              <input
                type="text"
                name="city"
                placeholder="Nagpur"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>State</label>

              <input
                type="text"
                name="state"
                placeholder="Maharashtra"
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Vehicle Type</label>

              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
              >
                <option value="Car">
                  Car
                </option>

                <option value="Bike">
                  Bike
                </option>

                <option value="Truck">
                  Truck
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>Price / Hour</label>

              <input
                type="number"
                name="pricePerHour"
                placeholder="50"
                min="0"
                value={formData.pricePerHour}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Total Slots</label>

              <input
                type="number"
                name="totalSlots"
                placeholder="50"
                min="1"
                value={formData.totalSlots}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Available Slots</label>

              <input
                type="number"
                name="availableSlots"
                placeholder="50"
                min="0"
                value={formData.availableSlots}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ margin: 0 }}>Latitude</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={detectingLocation || geocodingLocation}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2563eb",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "600",
                      padding: 0,
                    }}
                  >
                    {detectingLocation
                      ? "GPS..."
                      : geocodingLocation
                      ? "Resolving..."
                      : "📍 Auto GPS"}
                  </button>
                  <span style={{ color: "#cbd5e1" }}>|</span>
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(!showMapPicker)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#059669",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "600",
                      padding: 0,
                    }}
                  >
                    {showMapPicker ? "Close Map" : "🗺️ Pick on Map"}
                  </button>
                </div>
              </div>

              <input
                type="number"
                step="any"
                name="latitude"
                placeholder="e.g. 21.1458"
                value={formData.latitude}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Longitude</label>

              <input
                type="number"
                step="any"
                name="longitude"
                placeholder="e.g. 79.0882"
                value={formData.longitude}
                onChange={handleChange}
              />
            </div>

          </div>

          {/* Interactive Map Picker */}
          {showMapPicker && (
            <div
              className="form-group full"
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <h6 style={{ margin: 0, fontWeight: 700, color: "#1e293b" }}>
                    🗺️ Select Parking Location on Map
                  </h6>
                  <small style={{ color: "#64748b" }}>
                    Click anywhere on the map or drag the red pin to set the exact coordinates.
                  </small>
                </div>

                {formData.latitude && formData.longitude && (
                  <span
                    className="badge bg-light text-primary border"
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                  >
                    📍 Lat: {Number(formData.latitude).toFixed(4)}, Lng: {Number(formData.longitude).toFixed(4)}
                  </span>
                )}
              </div>

              <ParkingMap
                isPicker={true}
                pickerLocation={
                  formData.latitude && formData.longitude
                    ? {
                        lat: Number(formData.latitude),
                        lng: Number(formData.longitude),
                      }
                    : { lat: 21.1458, lng: 79.0882 }
                }
                onLocationSelect={handleMapPickerSelect}
                height="320px"
              />
            </div>
          )}

          <div className="form-group full">
            <label>Parking Image</label>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
              />

              {imagePreview && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                    }}
                  />
                  <button
                    type="button"
                    className="cancel-btn"
                    style={{ padding: "4px 8px", fontSize: "12px" }}
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                      setFormData({ ...formData, image: "" });
                    }}
                  >
                    Remove Image
                  </button>
                </div>
              )}

              <input
                type="url"
                name="image"
                placeholder="Or paste image URL (https://...)"
                value={formData.image}
                onChange={(e) => {
                  handleChange(e);
                  if (!imageFile) setImagePreview(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="form-group full">
            <label>Description</label>

            <textarea
              name="description"
              rows="4"
              placeholder="Describe your parking facility..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <button
            className="primary-btn"
            disabled={loading}
          >
            <FaPlus />

            {loading
              ? "Saving..."
              : editingId
              ? "Update Parking"
              : "Add Parking"}
          </button>

        </form>

      </div>

      {/* ================================= */}
      {/* My Parking */}
      {/* ================================= */}

      <div className="section-title">

        <div>
          <h2>My Parking Locations</h2>

          <p>
            Manage all your registered parking
            facilities.
          </p>
        </div>

        <span className="count-badge">
          {myParking.length} Locations
        </span>

      </div>

      <div className="parking-grid">

        {myParking.length === 0 ? (

          <div className="empty-card">
            <FaParking />

            <h3>
              No Parking Added
            </h3>

            <p>
              Add your first parking location
              using the form above.
            </p>
          </div>

        ) : (

          myParking.map((parking) => (

            <div
              className="parking-card"
              key={parking._id}
            >

              {parking.image ? (

                <img
                  src={parking.image}
                  alt={parking.name}
                  className="parking-image"
                />

              ) : (

                <div className="parking-placeholder">
                  <FaParking />
                </div>

              )}

              <div className="parking-content">

                <div className="parking-title">

                  <div>
                    <h3>
                      {parking.name}
                    </h3>

                    <p>
                      <FaMapMarkerAlt />
                      {parking.city}
                    </p>
                  </div>

                  <span className="vehicle-badge">
                    {parking.vehicleType}
                  </span>

                </div>

                <p className="address">
                  {parking.address}
                </p>

                {parking.latitude !== null &&
                  parking.latitude !== undefined &&
                  parking.longitude !== null &&
                  parking.longitude !== undefined && (
                    <p style={{ margin: "2px 0 8px" }}>
                      <a
                        href={getGoogleMapsDirectionsUrl(
                          parking.latitude,
                          parking.longitude
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "12px",
                          color: "#2563eb",
                          fontWeight: "600",
                          textDecoration: "none",
                        }}
                        title="View Location on Google Maps"
                      >
                        📍 Lat: {Number(parking.latitude).toFixed(4)}, Lng:{" "}
                        {Number(parking.longitude).toFixed(4)} ↗
                      </a>
                    </p>
                  )}

                <div className="parking-info">

                  <div>
                    <span>Price</span>
                    <strong>
                      ₹{parking.pricePerHour}/hr
                    </strong>
                  </div>

                  <div>
                    <span>Total</span>
                    <strong>
                      {parking.totalSlots}
                    </strong>
                  </div>

                  <div>
                    <span>Available</span>
                    <strong className="available">
                      {parking.availableSlots}
                    </strong>
                  </div>

                </div>

                <div className="parking-actions">

                  <button
                    className="edit-btn"
                    onClick={() =>
                      handleEdit(parking)
                    }
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      handleDelete(parking._id)
                    }
                    disabled={loading}
                  >
                    <FaTrash />
                    Delete
                  </button>

                </div>

              </div>

            </div>

          ))

        )}

      </div>

      {/* ================================= */}
      {/* Recent Bookings */}
      {/* ================================= */}

      <div className="section-title booking-title">

        <div>
          <h2>Recent Bookings</h2>

          <p>
            Latest customer booking activity.
          </p>
        </div>

      </div>

      <div className="booking-card">

        {dashboard.recentBookings?.length === 0 ? (

          <div className="empty-bookings">

            <FaCalendarCheck />

            <h3>
              No Bookings Yet
            </h3>

            <p>
              Customer bookings will appear
              here.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>User</th>
                  <th>Parking</th>
                  <th>Slot</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {dashboard.recentBookings.map(
                  (booking) => (

                    <tr key={booking._id}>

                      <td>
                        <strong>
                          {booking.user?.name ||
                            "N/A"}
                        </strong>

                        <small>
                          {booking.user?.email ||
                            ""}
                        </small>
                      </td>

                      <td>
                        {booking.parking?.name ||
                          "N/A"}
                      </td>

                      <td>
                        <span className="slot-badge">
                          {booking.slot
                            ?.slotNumber ||
                            "N/A"}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          booking.bookingDate
                        )}
                      </td>

                      <td className="amount">
                        ₹
                        {booking.totalAmount ||
                          0}
                      </td>

                      <td>
                        <span
                          className={
                            booking.paymentStatus ===
                            "Paid"
                              ? "status paid"
                              : "status pending"
                          }
                        >
                          {booking.paymentStatus ||
                            "Pending"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            booking.status ===
                            "Booked"
                              ? "status booked"
                              : booking.status ===
                                "Completed"
                              ? "status completed"
                              : "status cancelled"
                          }
                        >
                          {booking.status ||
                            "Unknown"}
                        </span>
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default OwnerDashboard;