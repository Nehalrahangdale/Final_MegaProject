import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaUserTie,
  FaParking,
  FaCalendarCheck,
  FaCar,
  FaRupeeSign,
  FaSyncAlt,
  FaChartLine,
  FaCreditCard,
  FaArrowRight,
  FaShieldAlt,
  FaCheckCircle,
  FaClock,
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
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  // =====================================
  // Load Dashboard Data
  // =====================================
  const loadDashboard = async () => {
    try {
      setRefreshing(true);
      const data = await getAdminDashboard();

      setDashboard({
        totalUsers: data.dashboard?.totalUsers || 0,
        totalOwners: data.dashboard?.totalOwners || 0,
        totalParking: data.dashboard?.totalParking || 0,
        totalBookings: data.dashboard?.totalBookings || 0,
        totalSlots: data.dashboard?.totalSlots || 0,
        totalRevenue: data.dashboard?.totalRevenue || 0,
        activeBookings: data.dashboard?.activeBookings || 0,
        completedBookings: data.dashboard?.completedBookings || 0,
      });
    } catch (error) {
      console.error("Admin Dashboard Error:", error);
      alert(
        error.response?.data?.message ||
          "Unable to load admin dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner-border text-success" role="status" />
        <h5 className="mt-3 fw-bold text-dark">Loading Admin Dashboard...</h5>
        <p className="text-muted">Fetching latest platform metrics & analytics.</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* ================================= */}
      {/* Hero Banner                       */}
      {/* ================================= */}
      <div className="admin-hero">
        <div>
          <div className="admin-badge">
            <FaShieldAlt />
            ADMINISTRATOR CONTROL PANEL
          </div>

          <h1>Smart Parking Dashboard</h1>

          <p>
            Real-time analytics and central control for users, parking operators,
            slot reservations, and payment settlements.
          </p>
        </div>

        <button
          className="admin-refresh"
          onClick={loadDashboard}
          disabled={refreshing}
          title="Sync latest live data"
        >
          <FaSyncAlt className={refreshing ? "spin-icon" : ""} />
          {refreshing ? "Updating..." : "Refresh Stats"}
        </button>
      </div>

      {/* ================================= */}
      {/* Key Metrics / KPI Grid           */}
      {/* ================================= */}
      <div className="admin-stats">
        {/* Total Users */}
        <div className="admin-stat blue" onClick={() => navigate("/admin/users")}>
          <div className="admin-stat-icon">
            <FaUsers />
          </div>
          <div className="admin-stat-info">
            <span>Total Customers</span>
            <h2>{dashboard.totalUsers.toLocaleString()}</h2>
            <small className="stat-link">Manage Users &rarr;</small>
          </div>
        </div>

        {/* Total Owners */}
        <div className="admin-stat purple" onClick={() => navigate("/admin/owners")}>
          <div className="admin-stat-icon">
            <FaUserTie />
          </div>
          <div className="admin-stat-info">
            <span>Parking Owners</span>
            <h2>{dashboard.totalOwners.toLocaleString()}</h2>
            <small className="stat-link">Manage Owners &rarr;</small>
          </div>
        </div>

        {/* Total Parking Areas */}
        <div className="admin-stat green" onClick={() => navigate("/admin/parking")}>
          <div className="admin-stat-icon">
            <FaParking />
          </div>
          <div className="admin-stat-info">
            <span>Parking Locations</span>
            <h2>{dashboard.totalParking.toLocaleString()}</h2>
            <small className="stat-link">Manage Parking &rarr;</small>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="admin-stat orange" onClick={() => navigate("/admin/bookings")}>
          <div className="admin-stat-icon">
            <FaCalendarCheck />
          </div>
          <div className="admin-stat-info">
            <span>Total Bookings</span>
            <h2>{dashboard.totalBookings.toLocaleString()}</h2>
            <small className="stat-link">Manage Bookings &rarr;</small>
          </div>
        </div>

        {/* Total Slots */}
        <div className="admin-stat red">
          <div className="admin-stat-icon">
            <FaCar />
          </div>
          <div className="admin-stat-info">
            <span>Total Parking Slots</span>
            <h2>{dashboard.totalSlots.toLocaleString()}</h2>
            <small className="text-muted">Across all facilities</small>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="admin-stat revenue" onClick={() => navigate("/admin/payments")}>
          <div className="admin-stat-icon">
            <FaRupeeSign />
          </div>
          <div className="admin-stat-info">
            <span>Platform Revenue</span>
            <h2 className="text-success">
              ₹{Number(dashboard.totalRevenue || 0).toLocaleString("en-IN")}
            </h2>
            <small className="stat-link">View Payments &rarr;</small>
          </div>
        </div>
      </div>

      {/* ================================= */}
      {/* Booking Health Overview           */}
      {/* ================================= */}
      <div className="admin-section-title">
        <div>
          <h2>Booking Activity Overview</h2>
          <p>Current operational status of parking reservations</p>
        </div>
      </div>

      <div className="overview-grid">
        {/* Active Reservations */}
        <div className="overview-card active-card" onClick={() => navigate("/admin/bookings")}>
          <div className="overview-icon active">
            <FaClock />
          </div>
          <div>
            <span>Active Ongoing Bookings</span>
            <strong>{dashboard.activeBookings.toLocaleString()}</strong>
            <p className="overview-subtext text-warning">Vehicles currently parked or reserved</p>
          </div>
        </div>

        {/* Completed Reservations */}
        <div className="overview-card completed-card" onClick={() => navigate("/admin/bookings")}>
          <div className="overview-icon completed">
            <FaCheckCircle />
          </div>
          <div>
            <span>Completed Reservations</span>
            <strong>{dashboard.completedBookings.toLocaleString()}</strong>
            <p className="overview-subtext text-success">Successfully fulfilled and settled</p>
          </div>
        </div>
      </div>

      {/* ================================= */}
      {/* Management Quick Access           */}
      {/* ================================= */}
      <div className="admin-section-title">
        <div>
          <h2>Platform Management Modules</h2>
          <p>Quick access to administration workflows and data records</p>
        </div>
      </div>

      <div className="management-grid">
        {/* Customers */}
        <div className="management-card">
          <div className="management-icon blue-icon">
            <FaUsers />
          </div>
          <h3>Customer Management</h3>
          <p>Search, inspect profiles, and manage registered end-users.</p>
          <button onClick={() => navigate("/admin/users")}>
            Open Users <FaArrowRight className="ms-1" />
          </button>
        </div>

        {/* Owners */}
        <div className="management-card">
          <div className="management-icon purple-icon">
            <FaUserTie />
          </div>
          <h3>Parking Operators</h3>
          <p>Manage verified parking facility owners and partner accounts.</p>
          <button onClick={() => navigate("/admin/owners")}>
            Open Owners <FaArrowRight className="ms-1" />
          </button>
        </div>

        {/* Facilities */}
        <div className="management-card">
          <div className="management-icon green-icon">
            <FaParking />
          </div>
          <h3>Parking Facilities</h3>
          <p>Monitor parking locations, pricing rules, and slot capacities.</p>
          <button onClick={() => navigate("/admin/parking")}>
            Open Parking <FaArrowRight className="ms-1" />
          </button>
        </div>

        {/* Bookings */}
        <div className="management-card">
          <div className="management-icon orange-icon">
            <FaCalendarCheck />
          </div>
          <h3>Bookings & Schedules</h3>
          <p>Audit booking logs, timestamps, active schedules, and cancellations.</p>
          <button onClick={() => navigate("/admin/bookings")}>
            Open Bookings <FaArrowRight className="ms-1" />
          </button>
        </div>

        {/* Payments */}
        <div className="management-card">
          <div className="management-icon revenue-icon">
            <FaCreditCard />
          </div>
          <h3>Payments & Revenue</h3>
          <p>Track Razorpay gateway IDs, successful transactions, and refunds.</p>
          <button onClick={() => navigate("/admin/payments")}>
            Open Payments <FaArrowRight className="ms-1" />
          </button>
        </div>

        {/* Analytics Shortcut */}
        <div className="management-card analytics-card">
          <div className="management-icon cyan-icon">
            <FaChartLine />
          </div>
          <h3>System Analytics</h3>
          <p>Platform health check: {dashboard.totalParking} lots across system.</p>
          <button onClick={loadDashboard}>
            Sync Analytics <FaSyncAlt className="ms-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;