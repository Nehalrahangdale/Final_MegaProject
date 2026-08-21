import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaRegCalendarTimes } from "react-icons/fa";
import { getAllBookings } from "../../services/adminService";
import "./AdminPages.css";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      alert(error.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="admin-loading">
          <div className="spinner-border text-warning" />
          <h5>Loading Bookings...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1>Manage Bookings</h1>
        <Link to="/admin/dashboard" className="admin-back-btn">
          <FaArrowLeft /> Back to Dashboard
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="admin-empty">
          <FaRegCalendarTimes />
          <h3>No bookings found</h3>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>User</th>
                <th>Parking Area</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>
                    <small>{booking._id.substring(booking._id.length - 8)}</small>
                  </td>
                  <td>{booking.user?.name || "Unknown"}</td>
                  <td>{booking.parking?.name || "Unknown"}</td>
                  <td>
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </td>
                  <td>
                    {booking.startTime} - {booking.endTime}
                  </td>
                  <td>₹{booking.totalAmount}</td>
                  <td>
                    <span className={`status-badge ${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
