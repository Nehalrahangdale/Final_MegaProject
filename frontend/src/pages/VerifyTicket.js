import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaParking,
  FaCar,
  FaMotorcycle,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaShieldAlt,
  FaRupeeSign,
  FaArrowLeft,
} from "react-icons/fa";
import { verifyBookingPublic } from "../services/qrService";
import "../styles/VerifyTicket.css";

function VerifyTicket() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const id = searchParams.get("id") || searchParams.get("bookingId");
  const pin = searchParams.get("pin");

  const [loading, setLoading] = useState(true);
  const [ticketData, setTicketData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [gateSimulated, setGateSimulated] = useState(false);

  const fetchVerification = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const target = id || pin;
      if (!target) {
        setErrorMsg("No ticket identifier or passcode provided.");
        setLoading(false);
        return;
      }

      const res = await verifyBookingPublic(target);
      if (res && res.success) {
        setTicketData(res);
      } else {
        setErrorMsg(res?.message || "Verification failed");
      }
    } catch (err) {
      console.error("Verification error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Unable to verify gate pass.";
      setErrorMsg(msg);
      if (err.response?.data) {
        setTicketData(err.response.data);
      }
    } finally {
      setLoading(false);
    }
  }, [id, pin]);

  useEffect(() => {
    fetchVerification();
  }, [fetchVerification]);

  const handleSimulateGate = () => {
    setGateSimulated(true);
    setTimeout(() => {
      setGateSimulated(false);
    }, 4000);
  };

  if (loading) {
    return (
      <div className="verify-page-wrapper">
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status" />
          <h5 className="mt-3 text-dark fw-bold">Checking Parking Pass...</h5>
          <p className="text-muted small">Verifying booking details...</p>
        </div>
      </div>
    );
  }

  const isValid = ticketData?.isValid === true;
  const booking = ticketData?.booking;
  const accessStatus = ticketData?.accessStatus;

  return (
    <div className="verify-page-wrapper">
      <div className="verify-card">
        {/* Top Status Banner */}
        <div className={`verify-banner ${isValid ? "granted" : "denied"}`}>
          <div className="verify-icon-ring">
            {isValid ? <FaCheckCircle /> : <FaTimesCircle />}
          </div>
          <h2 className="verify-headline">
            {isValid ? "Entry Approved" : "Access Denied"}
          </h2>
          <p className="verify-subline">
            {isValid
              ? "Official NextPark pass · Show at entrance to access your bay"
              : errorMsg || ticketData?.message || "Invalid or Unpaid Reservation"}
          </p>
        </div>

        {/* If valid booking exists */}
        {booking && (
          <>
            {/* Bay Box Hero */}
            <div className="verify-bay-box">
              <div className="verify-bay-label">Reserved Parking Bay</div>
              <div className="verify-bay-number">
                Bay {booking.slotNumber}
              </div>
              <div className="verify-barrier-pill">
                <span className="verify-barrier-dot" />
                <span>
                  {gateSimulated
                    ? "✓ Gate Opened"
                    : isValid
                    ? "Ready for Check-in"
                    : "Payment Incomplete"}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="verify-details-grid">
              <div className="verify-detail-cell" style={{ gridColumn: "1 / -1" }}>
                <div className="verify-detail-label">
                  <FaParking className="text-primary" /> Facility Name
                </div>
                <div className="verify-detail-val">
                  {booking.parkingName}
                </div>
                {booking.parkingCity && (
                  <small className="text-muted d-block" style={{ fontSize: "11px" }}>
                    📍 {booking.parkingCity}
                  </small>
                )}
              </div>

              <div className="verify-detail-cell">
                <div className="verify-detail-label">
                  <FaUser /> Driver / Customer
                </div>
                <div className="verify-detail-val">
                  {booking.customerName}
                </div>
              </div>

              <div className="verify-detail-cell">
                <div className="verify-detail-label">
                  {booking.vehicleType === "Bike" ? <FaMotorcycle /> : <FaCar />} Vehicle
                </div>
                <div className="verify-detail-val">
                  {booking.vehicleType || "Car"}
                </div>
              </div>

              <div className="verify-detail-cell">
                <div className="verify-detail-label">
                  <FaCalendarAlt /> Date
                </div>
                <div className="verify-detail-val">
                  {booking.bookingDate
                    ? new Date(booking.bookingDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Today"}
                </div>
              </div>

              <div className="verify-detail-cell">
                <div className="verify-detail-label">
                  <FaClock /> Entry Time Window
                </div>
                <div className="verify-detail-val">
                  {booking.startTime} - {booking.endTime}
                </div>
              </div>

              <div className="verify-detail-cell">
                <div className="verify-detail-label">
                  <FaRupeeSign /> Total Fee
                </div>
                <div className="verify-detail-val">
                  ₹{booking.totalAmount}
                </div>
              </div>

              <div className="verify-detail-cell">
                <div className="verify-detail-label">
                  <FaShieldAlt /> Payment Status
                </div>
                <div className={`verify-detail-val ${booking.paymentStatus === "Paid" ? "paid" : "pending"}`}>
                  {booking.paymentStatus === "Paid" ? "✓ PAID" : "⚠️ PENDING"}
                </div>
              </div>
            </div>

            {/* Booking Passcode */}
            <div className="verify-pin-card">
              <div>
                <div className="verify-pin-label">Passcode PIN</div>
                <small className="text-muted" style={{ fontSize: "11px" }}>
                  Show at entrance if requested
                </small>
              </div>
              <div className="verify-pin-digits">
                {booking.pin || `NPK-${booking.id?.slice(-6).toUpperCase()}`}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="verify-actions">
              {isValid ? (
                <button
                  type="button"
                  className="verify-btn-open"
                  onClick={handleSimulateGate}
                >
                  <FaCheckCircle />
                  <span>
                    {gateSimulated
                      ? "Vehicle Entered · Checked-In!"
                      : "Confirm Vehicle Entry"}
                  </span>
                </button>
              ) : accessStatus === "DENIED_UNPAID" ? (
                <button
                  type="button"
                  className="verify-btn-open"
                  style={{ background: "#d97706" }}
                  onClick={() => navigate(`/payment?bookingId=${booking.id}`)}
                >
                  <FaRupeeSign /> Complete Payment (₹{booking.totalAmount})
                </button>
              ) : null}

              <Link to="/parkings" className="verify-btn-home">
                <FaArrowLeft className="me-1" /> Back to Parking Locations
              </Link>
            </div>
          </>
        )}

        {/* If no booking matched */}
        {!booking && (
          <div className="p-4 text-center">
            <p className="text-muted small mb-4">
              We couldn't find a parking reservation matching this ticket.
            </p>
            <Link to="/" className="verify-btn-home d-inline-block">
              Go to Home Page
            </Link>
          </div>
        )}

        <div className="verify-footer-tag">
          NextPark Smart Parking · Priyadarshini College of Engineering, Nagpur
        </div>
      </div>
    </div>
  );
}

export default VerifyTicket;
