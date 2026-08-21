import { useEffect, useState } from "react";
import {
  FaUsers,
  FaUserTie,
  FaParking,
  FaCalendarCheck,
  FaCar,
  FaRupeeSign,
  FaSyncAlt,
  FaChartLine,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { getAdminDashboard } from "../services/adminService";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState({
    totalUsers: 0,
    totalOwners: 0,
    totalParking: 0,
    totalBookings: 0,
    totalSlots: 0,
    totalRevenue: 0,
    activeBookings: 0,
    completedBookings: 0,
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const data = await getAdminDashboard();

      setDashboard(
        data.dashboard || {}
      );
    } catch (error) {
      console.error(
        "Admin Dashboard Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner-border text-success" />

        <h5>
          Loading Admin Dashboard...
        </h5>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">

      {/* ================================= */}
      {/* Header */}
      {/* ================================= */}

      <div className="admin-hero">

        <div>

          <div className="admin-badge">
            <FaChartLine />
            ADMIN PANEL
          </div>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Monitor users, owners, parking,
            bookings and revenue from one
            central dashboard.
          </p>

        </div>

        <button
          className="admin-refresh"
          onClick={loadDashboard}
        >
          <FaSyncAlt />
          Refresh
        </button>

      </div>

      {/* ================================= */}
      {/* Statistics */}
      {/* ================================= */}

      <div className="admin-stats">

        <div className="admin-stat blue">

          <div className="admin-stat-icon">
            <FaUsers />
          </div>

          <div>
            <span>Total Users</span>
            <h2>
              {dashboard.totalUsers || 0}
            </h2>
          </div>

        </div>

        <div className="admin-stat purple">

          <div className="admin-stat-icon">
            <FaUserTie />
          </div>

          <div>
            <span>Total Owners</span>
            <h2>
              {dashboard.totalOwners || 0}
            </h2>
          </div>

        </div>

        <div className="admin-stat green">

          <div className="admin-stat-icon">
            <FaParking />
          </div>

          <div>
            <span>Total Parking</span>
            <h2>
              {dashboard.totalParking || 0}
            </h2>
          </div>

        </div>

        <div className="admin-stat orange">

          <div className="admin-stat-icon">
            <FaCalendarCheck />
          </div>

          <div>
            <span>Total Bookings</span>
            <h2>
              {dashboard.totalBookings || 0}
            </h2>
          </div>

        </div>

        <div className="admin-stat red">

          <div className="admin-stat-icon">
            <FaCar />
          </div>

          <div>
            <span>Total Slots</span>
            <h2>
              {dashboard.totalSlots || 0}
            </h2>
          </div>

        </div>

        <div className="admin-stat revenue">

          <div className="admin-stat-icon">
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
      {/* Quick Overview */}
      {/* ================================= */}

      <div className="admin-section-title">

        <div>
          <h2>
            Booking Overview
          </h2>

          <p>
            Current booking statistics
          </p>
        </div>

      </div>

      <div className="overview-grid">

        <div className="overview-card">

          <div className="overview-icon active">
            <FaCalendarCheck />
          </div>

          <div>
            <span>
              Active Bookings
            </span>

            <strong>
              {dashboard.activeBookings || 0}
            </strong>
          </div>

        </div>

        <div className="overview-card">

          <div className="overview-icon completed">
            <FaCalendarCheck />
          </div>

          <div>
            <span>
              Completed Bookings
            </span>

            <strong>
              {dashboard.completedBookings || 0}
            </strong>
          </div>

        </div>

      </div>

      {/* ================================= */}
      {/* Management */}
      {/* ================================= */}

      <div className="admin-section-title">

        <div>
          <h2>
            Management
          </h2>

          <p>
            Manage your Smart Parking system
          </p>
        </div>

      </div>

      <div className="management-grid">

        <div className="management-card">

          <div className="management-icon blue-icon">
            <FaUsers />
          </div>

          <h3>
            Users
          </h3>

          <p>
            View and manage registered users.
          </p>

          <button onClick={() => navigate("/admin/users")}>
            Manage Users
          </button>

        </div>

        <div className="management-card">

          <div className="management-icon purple-icon">
            <FaUserTie />
          </div>

          <h3>
            Owners
          </h3>

          <p>
            Manage parking owners and their
            accounts.
          </p>

          <button onClick={() => navigate("/admin/owners")}>
            Manage Owners
          </button>

        </div>

        <div className="management-card">

          <div className="management-icon green-icon">
            <FaParking />
          </div>

          <h3>
            Parking
          </h3>

          <p>
            Monitor all parking locations.
          </p>

          <button onClick={() => navigate("/admin/parking")}>
            Manage Parking
          </button>

        </div>

        <div className="management-card">

          <div className="management-icon orange-icon">
            <FaCalendarCheck />
          </div>

          <h3>
            Bookings
          </h3>

          <p>
            View and manage customer bookings.
          </p>

          <button onClick={() => navigate("/admin/bookings")}>
            Manage Bookings
          </button>

        </div>

        <div className="management-card">

          <div className="management-icon revenue-icon">
            <FaRupeeSign />
          </div>

          <h3>
            Payments
          </h3>

          <p>
            Monitor payments and revenue.
          </p>

          <button onClick={() => alert("Payment management is coming soon!")}>
            Manage Payments
          </button>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;