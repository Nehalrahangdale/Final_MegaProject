import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaCreditCard,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaRupeeSign,
  FaSyncAlt,
  FaSearch,
  FaReceipt,
  FaDownload,
  FaExclamationTriangle,
} from "react-icons/fa";

import { getAllPayments } from "../../services/adminService";
import "../../styles/admin/AdminPages.css";
import "../../styles/admin/AdminPayments.css";

// =============================================
// Helper: format rupees (handles paise if > 10000)
// =============================================
const formatAmount = (raw) => {
  const n = Number(raw || 0);
  // Razorpay stores paise — if value looks like paise (e.g. 50000 = ₹500), convert
  const amount = n > 10000 ? n / 100 : n;
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

// =============================================
// Helper: Raw amount in rupees for arithmetic
// =============================================
const toRupees = (raw) => {
  const n = Number(raw || 0);
  return n > 10000 ? n / 100 : n;
};

// =============================================
// Helper: format date
// =============================================
const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// =============================================
// Component
// =============================================
const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchPayments();
  }, []);

  // =============================================
  // Fetch
  // =============================================
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getAllPayments();
      setPayments(data.payments || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      alert(
        error.response?.data?.message || "Failed to load payments"
      );
    } finally {
      setLoading(false);
    }
  };

  // =============================================
  // Status Badge
  // =============================================
  const getStatusBadge = (status) => {
    const value = status?.toLowerCase();

    if (value === "success" || value === "paid") {
      return (
        <span className="payment-badge success">
          <FaCheckCircle />
          Success
        </span>
      );
    }

    if (value === "failed") {
      return (
        <span className="payment-badge failed">
          <FaTimesCircle />
          Failed
        </span>
      );
    }

    return (
      <span className="payment-badge pending">
        <FaClock />
        {status || "Pending"}
      </span>
    );
  };

  // =============================================
  // Filtered List
  // =============================================
  const filteredPayments = payments.filter((payment) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      payment.user?.name?.toLowerCase().includes(query) ||
      payment.user?.email?.toLowerCase().includes(query) ||
      payment.razorpayPaymentId?.toLowerCase().includes(query) ||
      payment.paymentId?.toLowerCase().includes(query) ||
      payment._id?.toLowerCase().includes(query) ||
      payment.booking?.parking?.name?.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" ||
      payment.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // =============================================
  // Metrics
  // =============================================
  const successPayments = payments.filter(
    (p) => p.status?.toLowerCase() === "success" || p.status?.toLowerCase() === "paid"
  );
  const failedPayments = payments.filter(
    (p) => p.status?.toLowerCase() === "failed"
  );
  const pendingPayments = payments.filter(
    (p) =>
      p.status?.toLowerCase() !== "success" &&
      p.status?.toLowerCase() !== "paid" &&
      p.status?.toLowerCase() !== "failed"
  );

  const totalRevenue = successPayments.reduce(
    (sum, p) => sum + toRupees(p.amount),
    0
  );

  // =============================================
  // Export CSV
  // =============================================
  const handleExportCSV = () => {
    const headers = [
      "Sr",
      "Customer Name",
      "Customer Email",
      "Parking",
      "City",
      "Amount (INR)",
      "Method",
      "Status",
      "Transaction ID",
      "Date & Time",
    ];

    const rows = filteredPayments.map((p, i) => [
      i + 1,
      p.user?.name || "Customer",
      p.user?.email || "N/A",
      p.booking?.parking?.name || "N/A",
      p.booking?.parking?.city || "N/A",
      toRupees(p.amount),
      p.paymentMethod || "Razorpay",
      p.status || "Pending",
      p.razorpayPaymentId || p.paymentId || p._id?.slice(-10) || "N/A",
      formatDate(p.createdAt),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `NextPark-Payments-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // =============================================
  // Loading
  // =============================================
  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="admin-loading">
          <div className="spinner-border text-success" />
          <h5 className="mt-3">Loading Payments...</h5>
          <p>Fetching transaction records.</p>
        </div>
      </div>
    );
  }

  // =============================================
  // Render
  // =============================================
  return (
    <div className="admin-page-container">

      {/* ================= HEADER ================= */}
      <div className="admin-page-header">
        <div className="admin-page-title">
          <div className="admin-title-icon">
            <FaCreditCard />
          </div>
          <div>
            <h1>Manage Payments</h1>
            <p>Monitor transactions, gateway IDs, and revenue details.</p>
          </div>
        </div>

        <Link to="/admin/dashboard" className="admin-back-btn">
          <FaArrowLeft />
          Back to Dashboard
        </Link>
      </div>

      {/* ================= STATS GRID ================= */}
      <div className="admin-stats-grid">

        <div className="admin-stat-card blue">
          <div className="stat-info">
            <span>Total Transactions</span>
            <h2>{payments.length}</h2>
          </div>
          <div className="stat-icon-box">
            <FaReceipt />
          </div>
        </div>

        <div className="admin-stat-card green">
          <div className="stat-info">
            <span>Successful</span>
            <h2>{successPayments.length}</h2>
          </div>
          <div className="stat-icon-box">
            <FaCheckCircle />
          </div>
        </div>

        <div className="admin-stat-card red">
          <div className="stat-info">
            <span>Failed / Pending</span>
            <h2>{failedPayments.length + pendingPayments.length}</h2>
          </div>
          <div className="stat-icon-box">
            <FaExclamationTriangle />
          </div>
        </div>

        <div className="admin-stat-card gold">
          <div className="stat-info">
            <span>Total Revenue</span>
            <h2>₹{totalRevenue.toLocaleString("en-IN")}</h2>
          </div>
          <div className="stat-icon-box">
            <FaRupeeSign />
          </div>
        </div>

      </div>

      {/* ================= EMPTY ================= */}
      {payments.length === 0 ? (
        <div className="admin-empty">
          <FaCreditCard size={55} />
          <h3 className="mt-3">No Payments Found</h3>
          <p>No payment transactions have been recorded yet.</p>
          <button className="admin-refresh-btn" onClick={fetchPayments}>
            <FaSyncAlt /> Refresh
          </button>
        </div>
      ) : (

        /* ================= TABLE CONTAINER ================= */
        <div className="admin-table-container">

          {/* Table Controls */}
          <div className="admin-table-header">
            <div>
              <h3>All Transactions</h3>
              <p>
                Showing {filteredPayments.length} of {payments.length} records
              </p>
            </div>

            <div className="admin-table-actions flex-wrap">

              {/* Status Filter */}
              <select
                className="form-select form-select-sm"
                style={{ width: "auto" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              {/* Search */}
              <div className="admin-search">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search user, ID, parking..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Export CSV */}
              <button
                className="admin-export-btn"
                onClick={handleExportCSV}
                title="Export as CSV"
              >
                <FaDownload />
                Export CSV
              </button>

              {/* Refresh */}
              <button
                className="admin-refresh-btn"
                onClick={fetchPayments}
                title="Refresh"
              >
                <FaSyncAlt />
              </button>

            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Parking / Location</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Transaction ID</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-search-result">
                      <FaCreditCard />
                      <span>No transactions match your search filter.</span>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment, index) => (
                    <tr key={payment._id}>

                      {/* Sr No */}
                      <td>
                        <strong>{index + 1}</strong>
                      </td>

                      {/* Customer */}
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {payment.user?.name
                              ? payment.user.name.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                          <div>
                            <strong>{payment.user?.name || "Customer"}</strong>
                            <small>{payment.user?.email || "N/A"}</small>
                          </div>
                        </div>
                      </td>

                      {/* Parking */}
                      <td>
                        <div>
                          <strong>
                            {payment.booking?.parking?.name || "Parking Booking"}
                          </strong>
                          {payment.booking?.parking?.city && (
                            <small className="d-block text-muted">
                              {payment.booking.parking.city}
                            </small>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td>
                        <strong className="text-success fs-6">
                          ₹{formatAmount(payment.amount)}
                        </strong>
                      </td>

                      {/* Method */}
                      <td>
                        <span className="badge bg-light text-dark border">
                          {payment.paymentMethod || "Razorpay"}
                        </span>
                      </td>

                      {/* Status */}
                      <td>{getStatusBadge(payment.status)}</td>

                      {/* Transaction ID */}
                      <td>
                        <code className="text-muted small">
                          {payment.razorpayPaymentId ||
                            payment.paymentId ||
                            payment._id?.slice(-10) ||
                            "N/A"}
                        </code>
                      </td>

                      {/* Date */}
                      <td>
                        <span className="joined-date">
                          {formatDate(payment.createdAt)}
                        </span>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer summary */}
          {filteredPayments.length > 0 && (
            <div
              style={{
                padding: "14px 22px",
                borderTop: "1px solid #edf0f4",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "#8a929d",
              }}
            >
              <span>
                {filteredPayments.length} record{filteredPayments.length !== 1 ? "s" : ""} shown
              </span>
              <span>
                Filtered Revenue:{" "}
                <strong style={{ color: "#198754" }}>
                  ₹{filteredPayments
                    .filter(
                      (p) =>
                        p.status?.toLowerCase() === "success" ||
                        p.status?.toLowerCase() === "paid"
                    )
                    .reduce((sum, p) => sum + toRupees(p.amount), 0)
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

export default AdminPayments;