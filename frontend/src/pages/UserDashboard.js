import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarCheck,
  FaCar,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaParking,
  FaRupeeSign,
  FaTimesCircle,
  FaSyncAlt,
  FaQrcode,
  FaCreditCard,
} from "react-icons/fa";

import {
  getMyBookings,
  cancelBooking,
} from "../services/bookingService";

import "../styles/UserDashboard.css";

function UserDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(null);

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // =====================================
  // Load Bookings
  // =====================================

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);

      const data = await getMyBookings();

      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Booking Error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to load bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // Cancel Booking
  // =====================================

  const handleCancel = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    try {
      setCancelLoading(bookingId);

      await cancelBooking(bookingId);

      alert("Booking cancelled successfully.");

      await loadBookings();
    } catch (error) {
      console.error(
        "Cancel Booking Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to cancel booking."
      );
    } finally {
      setCancelLoading(null);
    }
  };

  // =====================================
  // Format Date
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
  // Statistics
  // =====================================

  const totalBookings = bookings.length;

  const activeBookings = bookings.filter(
    (booking) =>
      booking.status === "Booked"
  ).length;

  const completedBookings = bookings.filter(
    (booking) =>
      booking.status === "Completed"
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) =>
      booking.status === "Cancelled"
  ).length;

  const totalSpent = bookings
    .filter(
      (booking) =>
        booking.paymentStatus === "Paid"
    )
    .reduce(
      (total, booking) =>
        total + Number(
          booking.totalAmount || 0
        ),
      0
    );

  // =====================================
  // Status
  // =====================================

  const getStatusClass = (status) => {
    if (status === "Booked") {
      return "status-badge booked";
    }

    if (status === "Completed") {
      return "status-badge completed";
    }

    if (status === "Cancelled") {
      return "status-badge cancelled";
    }

    return "status-badge";
  };

  const getPaymentClass = (status) => {
    if (status === "Paid") {
      return "payment-badge paid";
    }

    if (status === "Failed") {
      return "payment-badge failed";
    }

    return "payment-badge pending";
  };

  // =====================================
  // Loading
  // =====================================

  if (loading) {
    return (
      <div className="user-loading">

        <div className="loading-circle">
          <div className="spinner-border" />
        </div>

        <h4>Loading Dashboard</h4>

        <p>
          Fetching your parking bookings...
        </p>

      </div>
    );
  }

  return (
    <div className="user-dashboard">

      {/* ================================= */}
      {/* Hero */}
      {/* ================================= */}

      <section className="dashboard-hero">

        <div className="hero-content">

          <div className="hero-badge">
            <FaParking />
            SMART PARKING
          </div>

          <h1>
            Welcome back,{" "}
            <span>
              {user?.name || "User"}
            </span>{" "}
            👋
          </h1>

          <p>
            Manage your parking bookings,
            payments and parking history
            from one place.
          </p>

          <div className="hero-actions">

            <a
              href="/parkings"
              className="find-parking-btn"
            >
              <FaParking />
              Find Parking
            </a>

            <button
              className="refresh-dashboard-btn"
              onClick={loadBookings}
            >
              <FaSyncAlt />
              Refresh
            </button>

          </div>

        </div>

        <div className="hero-icon">

          <FaCar />

          <div className="hero-icon-circle">
            <FaParking />
          </div>

        </div>

      </section>

      {/* ================================= */}
      {/* Statistics */}
      {/* ================================= */}

      <section className="stats-grid">

        <div className="dashboard-stat blue">

          <div className="stat-icon">
            <FaCalendarCheck />
          </div>

          <div>
            <span>Total Bookings</span>
            <h2>{totalBookings}</h2>
            <small>All bookings</small>
          </div>

        </div>

        <div className="dashboard-stat green">

          <div className="stat-icon">
            <FaClock />
          </div>

          <div>
            <span>Active Bookings</span>
            <h2>{activeBookings}</h2>
            <small>Currently active</small>
          </div>

        </div>

        <div className="dashboard-stat purple">

          <div className="stat-icon">
            <FaCheckCircle />
          </div>

          <div>
            <span>Completed</span>
            <h2>{completedBookings}</h2>
            <small>Completed trips</small>
          </div>

        </div>

        <div className="dashboard-stat orange">

          <div className="stat-icon">
            <FaRupeeSign />
          </div>

          <div>
            <span>Total Spent</span>
            <h2>₹{totalSpent}</h2>
            <small>Successful payments</small>
          </div>

        </div>

      </section>

      {/* ================================= */}
      {/* Booking Header */}
      {/* ================================= */}

      <div className="booking-section-header">

        <div>

          <div className="section-label">
            <FaParking />
            BOOKING MANAGEMENT
          </div>

          <h2>
            My Bookings
          </h2>

          <p>
            View and manage all your
            parking reservations.
          </p>

        </div>

        <button
          className="refresh-btn"
          onClick={loadBookings}
        >
          <FaSyncAlt />
          Refresh
        </button>

      </div>

      {/* ================================= */}
      {/* No Bookings */}
      {/* ================================= */}

      {bookings.length === 0 ? (

        <div className="empty-bookings">

          <div className="empty-icon">
            <FaParking />
          </div>

          <h3>
            No Bookings Yet
          </h3>

          <p>
            You haven't made any parking
            bookings yet.
          </p>

          <a
            href="/parkings"
            className="find-btn"
          >
            Find Available Parking
          </a>

        </div>

      ) : (

        <div className="booking-grid">

          {bookings.map((booking) => (

            <div
              className="booking-card"
              key={booking._id}
            >

              {/* Card Header */}

              <div className="booking-card-header">

                <div className="parking-heading">

                  <div className="parking-icon">
                    <FaParking />
                  </div>

                  <div>

                    <h3>
                      {booking.parking?.name ||
                        "Parking"}
                    </h3>

                    <p>
                      <FaMapMarkerAlt />

                      {booking.parking?.city ||
                        booking.parking?.address ||
                        "Location unavailable"}
                    </p>

                  </div>

                </div>

                <span
                  className={getStatusClass(
                    booking.status
                  )}
                >
                  {booking.status ||
                    "Unknown"}
                </span>

              </div>

              {/* Card Body */}

              <div className="booking-card-body">

                {/* Booking Information */}

                <div className="booking-info-grid">

                  <div className="info-item">

                    <span>
                      <FaParking />
                      Slot
                    </span>

                    <strong>
                      {booking.slot
                        ?.slotNumber ||
                        "N/A"}
                    </strong>

                  </div>

                  <div className="info-item">

                    <span>
                      <FaCalendarCheck />
                      Date
                    </span>

                    <strong>
                      {formatDate(
                        booking.bookingDate
                      )}
                    </strong>

                  </div>

                  <div className="info-item">

                    <span>
                      <FaClock />
                      Time
                    </span>

                    <strong>
                      {booking.startTime} -{" "}
                      {booking.endTime}
                    </strong>

                  </div>

                  <div className="info-item">

                    <span>
                      <FaClock />
                      Duration
                    </span>

                    <strong>
                      {booking.duration} Hour(s)
                    </strong>

                  </div>

                </div>

                {/* Amount */}

                <div className="amount-box">

                  <div>

                    <span>
                      Total Amount
                    </span>

                    <strong>
                      ₹{booking.totalAmount || 0}
                    </strong>

                  </div>

                  <div className="payment-wrapper">

                    <small>
                      Payment
                    </small>

                    <span
                      className={getPaymentClass(
                        booking.paymentStatus
                      )}
                    >
                      {booking.paymentStatus ||
                        "Pending"}
                    </span>

                  </div>

                </div>

              </div>

              {/* Card Footer */}

              <div className="booking-card-footer">

                <div className="booking-id">

                  Booking ID

                  <strong>
                    #{booking._id?.slice(-8)}
                  </strong>

                </div>

                {booking.status !== "Cancelled" ? (
                  booking.paymentStatus === "Paid" ? (
                    <button
                      className="ticket-btn"
                      onClick={() =>
                        navigate(
                          `/qr-ticket?bookingId=${booking._id}`
                        )
                      }
                      title="View Entrance Pass"
                    >
                      <FaQrcode /> View QR Ticket
                    </button>
                  ) : (
                    <button
                      className="pay-now-btn"
                      onClick={() =>
                        navigate(
                          `/payment?bookingId=${booking._id}`
                        )
                      }
                      title="Complete payment for this reservation"
                    >
                      <FaCreditCard /> Pay Now (₹{booking.totalAmount || 0})
                    </button>
                  )
                ) : (
                  <span className="cancelled-note">Reservation Cancelled</span>
                )}

                {booking.status ===
                  "Booked" && (

                  <button
                    className="cancel-btn"
                    onClick={() =>
                      handleCancel(
                        booking._id
                      )
                    }
                    disabled={
                      cancelLoading ===
                      booking._id
                    }
                  >

                    {cancelLoading ===
                    booking._id ? (
                      <>
                        <span className="small-spinner" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <FaTimesCircle />
                        Cancel Booking
                      </>
                    )}

                  </button>

                )}

              </div>

            </div>

          ))}

        </div>

      )}

      {/* ================================= */}
      {/* Footer Summary */}
      {/* ================================= */}

      <div className="dashboard-summary">

        <div>
          <FaCheckCircle />
          <span>
            Completed Bookings
          </span>
          <strong>
            {completedBookings}
          </strong>
        </div>

        <div>
          <FaTimesCircle />
          <span>
            Cancelled Bookings
          </span>
          <strong>
            {cancelledBookings}
          </strong>
        </div>

        <div>
          <FaRupeeSign />
          <span>
            Successful Payments
          </span>
          <strong>
            ₹{totalSpent}
          </strong>
        </div>

      </div>

    </div>
  );
}

export default UserDashboard;