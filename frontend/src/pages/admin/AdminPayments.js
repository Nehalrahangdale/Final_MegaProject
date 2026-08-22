import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaCreditCard,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";

import { getAllPayments } from "../../services/adminService";
import "./AdminPages.css";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const data = await getAllPayments();

      setPayments(data.payments || []);
    } catch (error) {
      console.error("Error fetching payments:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load payments"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // Payment Status
  // =====================================

  const getStatusBadge = (status) => {
    const value = status?.toLowerCase();

    if (value === "success") {
      return (
        <span className="badge bg-success">
          <FaCheckCircle className="me-1" />
          Success
        </span>
      );
    }

    if (value === "failed") {
      return (
        <span className="badge bg-danger">
          <FaTimesCircle className="me-1" />
          Failed
        </span>
      );
    }

    return (
      <span className="badge bg-warning text-dark">
        <FaClock className="me-1" />
        {status || "Pending"}
      </span>
    );
  };

  // =====================================
  // Loading
  // =====================================

  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="admin-loading">
          <div className="spinner-border text-primary" />

          <h5 className="mt-3">
            Loading Payments...
          </h5>
        </div>
      </div>
    );
  }

  // =====================================
  // Total Revenue
  // =====================================

  const totalRevenue = payments
    .filter(
      (payment) =>
        payment.status?.toLowerCase() === "success"
    )
    .reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    );

  return (
    <div className="admin-page-container">

      {/* =====================================
          Header
      ===================================== */}

      <div className="admin-page-header">

        <div>
          <h1>
            <FaCreditCard className="me-2" />
            Manage Payments
          </h1>

          <p className="text-muted mb-0">
            Monitor and manage all parking payments
          </p>
        </div>

        <Link
          to="/admin/dashboard"
          className="admin-back-btn"
        >
          <FaArrowLeft className="me-2" />
          Back to Dashboard
        </Link>

      </div>

      {/* =====================================
          Summary Cards
      ===================================== */}

      <div className="row mb-4">

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <h6 className="text-muted">
                    Total Payments
                  </h6>

                  <h2 className="fw-bold">
                    {payments.length}
                  </h2>
                </div>

                <FaCreditCard
                  size={35}
                  className="text-primary"
                />

              </div>

            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <h6 className="text-muted">
                    Successful Payments
                  </h6>

                  <h2 className="fw-bold text-success">
                    {
                      payments.filter(
                        (payment) =>
                          payment.status?.toLowerCase() ===
                          "success"
                      ).length
                    }
                  </h2>
                </div>

                <FaCheckCircle
                  size={35}
                  className="text-success"
                />

              </div>

            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <h6 className="text-muted">
                    Total Revenue
                  </h6>

                  <h2 className="fw-bold text-success">
                    ₹{totalRevenue}
                  </h2>
                </div>

                <FaMoneyBillWave
                  size={35}
                  className="text-success"
                />

              </div>

            </div>
          </div>
        </div>

      </div>

      {/* =====================================
          Payments Table
      ===================================== */}

      {payments.length === 0 ? (

        <div className="admin-empty">

          <FaCreditCard size={55} />

          <h3 className="mt-3">
            No Payments Found
          </h3>

          <p>
            No payment transactions are available yet.
          </p>

        </div>

      ) : (

        <div className="admin-table-container">

          <table className="admin-table">

            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Payment ID</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>

              {payments.map((payment, index) => (

                <tr key={payment._id}>

                  <td>
                    <strong>
                      {index + 1}
                    </strong>
                  </td>

                  <td>
                    <strong>
                      {payment.user?.name || "N/A"}
                    </strong>
                  </td>

                  <td>
                    {payment.user?.email || "N/A"}
                  </td>

                  <td>
                    <strong className="text-success">
                      ₹{Number(payment.amount || 0)}
                    </strong>
                  </td>

                  <td>
                    {payment.paymentMethod || "Razorpay"}
                  </td>

                  <td>
                    {getStatusBadge(payment.status)}
                  </td>

                  <td>
                    <small>
                      {payment.razorpayPaymentId ||
                        payment.paymentId ||
                        "N/A"}
                    </small>
                  </td>

                  <td>
                    {payment.createdAt
                      ? new Date(
                          payment.createdAt
                        ).toLocaleDateString()
                      : "N/A"}
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

export default AdminPayments;