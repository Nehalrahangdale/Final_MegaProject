import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarCheck,
  FaSyncAlt,
  FaSearch,
  FaRupeeSign,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaDownload,
  FaQrcode,
  FaLock,
} from "react-icons/fa";

import { getAllBookings } from "../../services/adminService";
import "../../styles/admin/AdminPages.css";
import "../../styles/admin/AdminPayments.css";

const AdminBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

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

  // Status Badge
  const getBookingStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === "completed") {
      return (
        <span className="status-badge completed d-inline-flex align-items-center gap-1">
          <FaCheckCircle /> Completed
        </span>
      );
    }
    if (s === "cancelled") {
      return (
        <span className="status-badge cancelled d-inline-flex align-items-center gap-1">
          <FaTimesCircle /> Cancelled
        </span>
      );
    }
    return (
      <span className="status-badge booked d-inline-flex align-items-center gap-1">
        <FaClock /> {status || "Booked"}
      </span>
    );
  };

  // Payment Status Badge
  const getPaymentStatusBadge = (status) => {
    const p = status?.toLowerCase();
    if (p === "paid" || p === "success") {
      return (
        <span className="payment-badge success">
          <FaCheckCircle /> Paid
        </span>
      );
    }
    if (p === "failed") {
      return (
        <span className="payment-badge failed">
          <FaTimesCircle /> Failed
        </span>
      );
    }
    return (
      <span className="payment-badge pending">
        <FaClock /> {status || "Pending"}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Filtered list
  const filteredBookings = bookings.filter((booking) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      booking._id?.toLowerCase().includes(query) ||
      booking.user?.name?.toLowerCase().includes(query) ||
      booking.user?.email?.toLowerCase().includes(query) ||
      booking.user?.phone?.toLowerCase().includes(query) ||
      booking.parking?.name?.toLowerCase().includes(query) ||
      booking.parking?.city?.toLowerCase().includes(query) ||
      booking.slot?.slotNumber?.toString().toLowerCase().includes(query) ||
      booking.paymentId?.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" ||
      booking.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesPayment =
      paymentFilter === "all" ||
      booking.paymentStatus?.toLowerCase() === paymentFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Calculate Metrics
  const activeCount = bookings.filter(
    (b) => b.status?.toLowerCase() === "booked"
  ).length;

  const completedCount = bookings.filter(
    (b) => b.status?.toLowerCase() === "completed"
  ).length;

  const totalBookingRevenue = bookings
    .filter((b) => b.paymentStatus?.toLowerCase() === "paid")
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Sr",
      "Booking ID",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Parking Name",
      "City",
      "Slot Number",
      "Vehicle Type",
      "Booking Date",
      "Start Time",
      "End Time",
      "Duration (Hours)",
      "Total Amount (INR)",
      "Payment Status",
      "Razorpay Payment ID",
      "Booking Status",
    ];

    const rows = filteredBookings.map((b, i) => [
      i + 1,
      b._id,
      b.user?.name || "Customer",
      b.user?.email || "N/A",
      b.user?.phone || "N/A",
      b.parking?.name || "N/A",
      b.parking?.city || "N/A",
      b.slot?.slotNumber || "N/A",
      b.slot?.vehicleType || "Car",
      formatDate(b.bookingDate),
      b.startTime || "N/A",
      b.endTime || "N/A",
      b.duration || 1,
      b.totalAmount || 0,
      b.paymentStatus || "Pending",
      b.paymentId || "N/A",
      b.status || "Booked",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `NextPark-Bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="admin-loading">
          <div className="spinner-border text-success" />
          <h5 className="mt-3 fw-bold">Loading Reservations...</h5>
          <p className="text-muted">Fetching platform booking logs & payment statuses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-title">
          <div className="admin-title-icon" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" }}>
            <FaCalendarCheck />
          </div>
          <div>
            <h1>Manage Bookings</h1>
            <p>Monitor parking reservations, active sessions, customer details, and payment settlements.</p>
          </div>
        </div>

        <Link to="/admin/dashboard" className="admin-back-btn">
          <FaArrowLeft /> Back to Dashboard
        </Link>
      </div>

      {/* Summary Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card blue">
          <div className="stat-info">
            <span>Total Bookings</span>
            <h2>{bookings.length}</h2>
          </div>
          <div className="stat-icon-box">
            <FaCalendarCheck />
          </div>
        </div>

        <div className="admin-stat-card gold">
          <div className="stat-info">
            <span>Active Ongoing</span>
            <h2>{activeCount}</h2>
          </div>
          <div className="stat-icon-box">
            <FaClock />
          </div>
        </div>

        <div className="admin-stat-card green">
          <div className="stat-info">
            <span>Completed Trips</span>
            <h2>{completedCount}</h2>
          </div>
          <div className="stat-icon-box">
            <FaCheckCircle />
          </div>
        </div>

        <div className="admin-stat-card green">
          <div className="stat-info">
            <span>Booking Revenue</span>
            <h2>₹{totalBookingRevenue.toLocaleString("en-IN")}</h2>
          </div>
          <div className="stat-icon-box">
            <FaRupeeSign />
          </div>
        </div>
      </div>

      {/* Bookings Table Container */}
      {bookings.length === 0 ? (
        <div className="admin-empty">
          <FaCalendarCheck size={55} />
          <h3 className="mt-3">No Bookings Found</h3>
          <p>No parking slots have been booked yet.</p>
          <button className="admin-refresh-btn" onClick={fetchBookings}>
            <FaSyncAlt /> Refresh
          </button>
        </div>
      ) : (
        <div className="admin-table-container">
          <div className="admin-table-header">
            <div>
              <h3>All Reservations</h3>
              <p>
                Showing {filteredBookings.length} of {bookings.length} reservations
              </p>
            </div>

            <div className="admin-table-actions flex-wrap">
              {/* Booking Status Filter */}
              <select
                className="form-select form-select-sm"
                style={{ width: "auto" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                title="Filter by Booking Status"
              >
                <option value="all">All Bookings</option>
                <option value="booked">Active / Booked</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Payment Status Filter */}
              <select
                className="form-select form-select-sm"
                style={{ width: "auto" }}
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                title="Filter by Payment Status"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              {/* Search */}
              <div className="admin-search">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search user, lot, slot, ID, payment..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Export CSV */}
              <button
                className="admin-export-btn"
                onClick={handleExportCSV}
                title="Export Bookings CSV"
              >
                <FaDownload />
                Export CSV
              </button>

              {/* Refresh */}
              <button
                className="admin-refresh-btn"
                onClick={fetchBookings}
                title="Refresh Bookings"
              >
                <FaSyncAlt />
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Parking Facility</th>
                  <th>Slot / Vehicle</th>
                  <th>Schedule</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
                  <th>Razorpay ID</th>
                  <th>Booking Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="no-search-result">
                      <FaCalendarCheck />
                      <span>No reservations match your filter criteria.</span>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking, index) => (
                    <tr key={booking._id}>
                      {/* Sr */}
                      <td>
                        <strong>{index + 1}</strong>
                      </td>

                      {/* ID */}
                      <td>
                        <code className="text-muted small">
                          #{booking._id?.slice(-8).toUpperCase()}
                        </code>
                        <small className="d-block text-muted" style={{ fontSize: "10px" }}>
                          {formatDate(booking.createdAt)}
                        </small>
                      </td>

                      {/* Customer */}
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {booking.user?.name
                              ? booking.user.name.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                          <div>
                            <strong>{booking.user?.name || "Customer"}</strong>
                            <small>{booking.user?.email || "N/A"}</small>
                            {booking.user?.phone && (
                              <small className="d-block text-muted">
                                📞 {booking.user.phone}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Parking */}
                      <td>
                        <div>
                          <strong>{booking.parking?.name || "Parking Lot"}</strong>
                          {booking.parking?.city && (
                            <small className="d-block text-muted">
                              📍 {booking.parking.city}
                            </small>
                          )}
                        </div>
                      </td>

                      {/* Slot */}
                      <td>
                        <span className="badge bg-light text-dark border">
                          Slot {booking.slot?.slotNumber || "N/A"}
                        </span>
                        <small className="d-block text-muted mt-1">
                          🚗 {booking.slot?.vehicleType || "Car"} ({booking.duration || 1} hr)
                        </small>
                      </td>

                      {/* Schedule */}
                      <td>
                        <div>
                          <strong>{formatDate(booking.bookingDate || booking.createdAt)}</strong>
                          <small className="d-block text-muted">
                            ⏰ {booking.startTime || "N/A"} - {booking.endTime || "N/A"}
                          </small>
                        </div>
                      </td>

                      {/* Amount */}
                      <td>
                        <strong className="text-success fs-6">
                          ₹{booking.totalAmount || 0}
                        </strong>
                      </td>

                      {/* Payment Status */}
                      <td>{getPaymentStatusBadge(booking.paymentStatus)}</td>

                      {/* Razorpay ID */}
                      <td>
                        {booking.paymentId ? (
                          <code className="text-muted small">
                            {booking.paymentId}
                          </code>
                        ) : (
                          <span className="text-muted small">N/A</span>
                        )}
                      </td>

                      {/* Booking Status */}
                      <td>{getBookingStatusBadge(booking.status)}</td>

                      {/* QR Ticket Action */}
                      <td>
                        {booking.status === "Cancelled" ? (
                          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger" style={{ fontSize: "10px", padding: "4px 8px" }}>
                            Cancelled
                          </span>
                        ) : booking.paymentStatus === "Paid" ? (
                          <button
                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                            style={{ borderRadius: "8px", fontSize: "11px", fontWeight: "600" }}
                            onClick={() => navigate(`/qr-ticket?bookingId=${booking._id}`)}
                            title="View & Download QR Ticket"
                          >
                            <FaQrcode /> QR Ticket
                          </button>
                        ) : (
                          <span
                            className="badge bg-warning bg-opacity-10 text-warning border border-warning d-inline-flex align-items-center gap-1"
                            style={{ fontSize: "10px", padding: "4px 8px" }}
                            title="Ticket locked until customer pays"
                          >
                            <FaLock size={9} /> QR Locked (Unpaid)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredBookings.length > 0 && (
            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid #edf0f4",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              <span>
                Showing {filteredBookings.length} booking records
              </span>
              <span>
                Filtered Revenue:{" "}
                <strong style={{ color: "#10b981", fontSize: "13px" }}>
                  ₹{filteredBookings
                    .filter((b) => b.paymentStatus?.toLowerCase() === "paid")
                    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0)
                    .toLocaleString("en-IN")}
                </strong>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBookings;