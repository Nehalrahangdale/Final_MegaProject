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
} from "../services/parkingService";

import { getOwnerDashboard } from "../services/ownerService";

import "./OwnerDashboard.css";

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
    });

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

      const parkingData = {
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
      };

      let data;

      if (editingId) {
        data = await updateParking(
          editingId,
          parkingData
        );
      } else {
        data = await addParking(parkingData);
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
    });

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

          </div>

          <div className="form-group full">
            <label>Image URL</label>

            <input
              type="url"
              name="image"
              placeholder="https://example.com/parking.jpg"
              value={formData.image}
              onChange={handleChange}
            />
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