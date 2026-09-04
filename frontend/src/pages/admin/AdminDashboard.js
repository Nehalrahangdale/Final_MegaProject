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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { getAdminDashboard } from "../../services/adminService";
import "../../styles/admin/AdminDashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
    cancelledBookings: 0,
    availableSlotsCount: 0,
    bookedSlotsCount: 0,
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
        cancelledBookings: data.dashboard?.cancelledBookings || 0,
        availableSlotsCount: data.dashboard?.availableSlotsCount || 0,
        bookedSlotsCount: data.dashboard?.bookedSlotsCount || 0,
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

  // =====================================
  // Chart.js Configurations
  // =====================================
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          padding: 14,
          font: {
            size: 12,
            weight: "600",
          },
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        padding: 10,
        cornerRadius: 8,
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0f172a",
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: "600",
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(226, 232, 240, 0.6)",
        },
        ticks: {
          precision: 0,
        },
      },
    },
  };

  // 1. Users / Owners Distribution
  const userOwnerChartData = {
    labels: ["Users (Customers)", "Facility Owners"],
    datasets: [
      {
        label: "Accounts",
        data: [dashboard.totalUsers, dashboard.totalOwners],
        backgroundColor: ["#3b82f6", "#8b5cf6"],
        borderColor: ["#2563eb", "#7c3aed"],
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  // 2. Parking Facilities & Slot Capacity
  const parkingSlotsChartData = {
    labels: ["Facilities", "Total Slots", "Available", "Booked"],
    datasets: [
      {
        label: "Count",
        data: [
          dashboard.totalParking,
          dashboard.totalSlots,
          dashboard.availableSlotsCount ||
            Math.max(0, dashboard.totalSlots - dashboard.bookedSlotsCount),
          dashboard.bookedSlotsCount || dashboard.activeBookings,
        ],
        backgroundColor: ["#10b981", "#6366f1", "#06b6d4", "#f59e0b"],
        borderRadius: 8,
      },
    ],
  };

  // 3. Bookings Status Overview
  const bookingsChartData = {
    labels: ["Active Ongoing", "Completed", "Cancelled"],
    datasets: [
      {
        label: "Bookings",
        data: [
          dashboard.activeBookings,
          dashboard.completedBookings,
          dashboard.cancelledBookings ||
            Math.max(
              0,
              dashboard.totalBookings -
                dashboard.activeBookings -
                dashboard.completedBookings
            ),
        ],
        backgroundColor: ["#f59e0b", "#10b981", "#ef4444"],
        borderColor: ["#d97706", "#059669", "#dc2626"],
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  // 4. Platform Revenue & Average Ticket Size
  const revenueChartData = {
    labels: ["Total Settled (₹)", "Avg / Booking (₹)"],
    datasets: [
      {
        label: "Revenue (₹)",
        data: [
          dashboard.totalRevenue,
          dashboard.totalBookings > 0
            ? Math.round(dashboard.totalRevenue / dashboard.totalBookings)
            : 0,
        ],
        backgroundColor: ["#059669", "#0d9488"],
        borderRadius: 8,
      },
    ],
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
      {/* Visual Analytics Grid (Chart.js)  */}
      {/* ================================= */}
      <div className="admin-section-title">
        <div>
          <h2>Visual Analytics & Platform Breakdown</h2>
          <p>Real-time telemetry and resource distribution powered by Chart.js</p>
        </div>
        <span className="admin-chartjs-tag">
          📊 Interactive Chart.js Visuals
        </span>
      </div>

      <div className="admin-charts-grid">
        {/* Chart 1: Users vs Owners */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div>
              <h3>👥 Users &amp; Operators</h3>
              <p>Platform user role distribution</p>
            </div>
            <button
              className="admin-chart-btn"
              onClick={() => navigate("/admin/users")}
            >
              Manage &rarr;
            </button>
          </div>
          <div className="admin-chart-canvas-wrapper doughnut-wrapper">
            <Doughnut data={userOwnerChartData} options={doughnutOptions} />
          </div>
        </div>

        {/* Chart 2: Facilities & Slot Allocation */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div>
              <h3>🅿️ Facilities &amp; Slots</h3>
              <p>Locations, capacities, and live availability</p>
            </div>
            <button
              className="admin-chart-btn"
              onClick={() => navigate("/admin/parking")}
            >
              Facilities &rarr;
            </button>
          </div>
          <div className="admin-chart-canvas-wrapper">
            <Bar data={parkingSlotsChartData} options={barOptions} />
          </div>
        </div>

        {/* Chart 3: Booking Activity Status */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div>
              <h3>📅 Booking Status Overview</h3>
              <p>Active, fulfilled, and cancelled schedules</p>
            </div>
            <button
              className="admin-chart-btn"
              onClick={() => navigate("/admin/bookings")}
            >
              Audits &rarr;
            </button>
          </div>
          <div className="admin-chart-canvas-wrapper doughnut-wrapper">
            <Doughnut data={bookingsChartData} options={doughnutOptions} />
          </div>
        </div>

        {/* Chart 4: Revenue & Economics */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div>
              <h3>💰 Revenue &amp; Average Value</h3>
              <p>Gross settled earnings vs ticket average</p>
            </div>
            <button
              className="admin-chart-btn"
              onClick={() => navigate("/admin/payments")}
            >
              Ledger &rarr;
            </button>
          </div>
          <div className="admin-chart-canvas-wrapper">
            <Bar data={revenueChartData} options={barOptions} />
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