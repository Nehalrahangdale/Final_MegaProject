import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaLock,
  FaShieldAlt,
  FaCreditCard,
  FaMobileAlt,
  FaUniversity,
  FaParking,
  FaCalendarAlt,
  FaClock,
  FaArrowRight,
  FaArrowLeft,
  FaCheck,
  FaBolt,
} from "react-icons/fa";

import {
  createPaymentOrder,
  verifyPayment,
} from "../services/paymentService";
import { getBookingById } from "../services/bookingService";
import "../styles/Payment.css";

function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");

  // =====================================
  // Load Booking
  // =====================================
  const loadBooking = useCallback(async () => {
    try {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      const data = await getBookingById(bookingId);
      setBooking(data.booking);

      // If already paid, automatically navigate or show ticket option
      if (data.booking?.paymentStatus === "Paid") {
        setPaymentSuccess(true);
      }
    } catch (error) {
      console.error("Booking Load Error:", error);
      setPaymentError(
        error.response?.data?.message || "Unable to load booking details."
      );
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  // =====================================
  // Handle Payment
  // =====================================
  const handlePayment = async () => {
    if (!booking) {
      setPaymentError("Booking not found.");
      return;
    }

    setPaymentError(null);

    try {
      setPaymentLoading(true);

      // Create Razorpay Order
      const data = await createPaymentOrder(booking._id);

      if (!data.success || !data.order) {
        throw new Error(data.message || "Unable to create payment order.");
      }

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // =====================================
      // Check for Mock Test Mode
      // =====================================
      if (data.order?.isMock) {
        setTimeout(async () => {
          try {
            const verifyData = await verifyPayment({
              razorpay_order_id: data.order.id,
              razorpay_payment_id: `pay_mock_${Date.now()}`,
              razorpay_signature: "mock_signature_test",
            });

            if (!verifyData.success) {
              throw new Error(
                verifyData.message || "Payment verification failed."
              );
            }

            setPaymentSuccess(true);
            setPaymentLoading(false);

            setTimeout(() => {
              navigate(`/qr-ticket?bookingId=${booking._id}`);
            }, 1400);
          } catch (err) {
            console.error("Mock Verification Error:", err);
            setPaymentError(
              err.response?.data?.message ||
                err.message ||
                "Payment verification failed."
            );
            setPaymentLoading(false);
          }
        }, 1000);
        return;
      }

      // =====================================
      // Real Razorpay Checkout
      // =====================================
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency || "INR",
        name: "NextPark AI",
        description: `Parking Reservation: Bay ${booking.slot?.slotNumber || ""}`,
        order_id: data.order.id,
        handler: async function (response) {
          try {
            const verifyData = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (!verifyData.success) {
              throw new Error(
                verifyData.message || "Payment verification failed."
              );
            }

            setPaymentSuccess(true);
            setPaymentLoading(false);

            setTimeout(() => {
              navigate(`/qr-ticket?bookingId=${booking._id}`);
            }, 1400);
          } catch (err) {
            console.error("Verification Error:", err);
            setPaymentError(
              err.response?.data?.message ||
                err.message ||
                "Payment verification failed."
            );
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: user.phone || "",
        },
        theme: {
          color: "#059669",
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
          },
        },
      };

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay SDK failed to load. Please check your internet connection."
        );
      }

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        console.error("Payment Failed:", response.error);
        setPaymentError(response.error?.description || "Payment Failed");
        setPaymentLoading(false);
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment Error:", error);
      setPaymentError(
        error.response?.data?.message || error.message || "Payment Failed"
      );
      setPaymentLoading(false);
    }
  };

  // =====================================
  // Loading State
  // =====================================
  if (loading) {
    return (
      <div className="payment-page-wrapper d-flex align-items-center justify-content-center">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <h5 className="mt-3 text-secondary">Securing checkout session...</h5>
        </div>
      </div>
    );
  }

  // =====================================
  // Booking Not Found
  // =====================================
  if (!booking) {
    return (
      <div className="payment-page-wrapper">
        <div className="container py-5 text-center" style={{ maxWidth: "500px" }}>
          <div className="alert alert-warning border-0 shadow-sm p-4 rounded-4">
            <h4 className="fw-bold mb-2">Booking Not Found</h4>
            <p className="text-muted small mb-3">
              We couldn't locate this reservation. It may have expired or already been processed.
            </p>
            <button
              className="btn btn-primary px-4 py-2 rounded-3"
              onClick={() => navigate("/parkings")}
            >
              Browse Parking Locations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page-wrapper">
      <div className="container" style={{ maxWidth: "800px" }}>
        {/* =====================================
            CHECKOUT STEPS BAR
        ====================================== */}
        <div className="checkout-steps-bar">
          <div className="checkout-step-item completed">
            <span className="checkout-step-circle">
              <FaCheck size={11} />
            </span>
            <span>Slot Selected</span>
          </div>

          <span className="checkout-step-divider active" />

          <div className="checkout-step-item active">
            <span className="checkout-step-circle">2</span>
            <span>Checkout & Payment</span>
          </div>

          <span className="checkout-step-divider" />

          <div className="checkout-step-item">
            <span className="checkout-step-circle">3</span>
            <span>QR Access Ticket</span>
          </div>
        </div>

        {/* =====================================
            MAIN CHECKOUT CARD
        ====================================== */}
        <div className="checkout-card">
          <div className="checkout-header">
            <div>
              <h4 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <FaLock className="text-success" /> Secure Booking Checkout
              </h4>
              <small className="opacity-75">
                Instant confirmation & QR code entry pass
              </small>
            </div>

            <span className="checkout-security-tag">
              <FaShieldAlt /> 256-Bit Encrypted
            </span>
          </div>

          <div className="p-4 p-md-5">
            {/* Payment Error Alert */}
            {paymentError && (
              <div className="alert alert-danger border-0 d-flex justify-content-between align-items-center mb-4 rounded-3">
                <span>⚠️ {paymentError}</span>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setPaymentError(null)}
                />
              </div>
            )}

            {/* Success State */}
            {paymentSuccess ? (
              <div className="payment-success-box">
                <div className="payment-success-icon">
                  <FaCheck />
                </div>
                <h3 className="fw-bold text-dark mb-2">Payment Confirmed!</h3>
                <p className="text-muted mb-4">
                  Your reservation is confirmed. Redirecting to your digital QR entry pass...
                </p>
                <button
                  className="btn btn-success px-4 py-2 fw-bold"
                  onClick={() => navigate(`/qr-ticket?bookingId=${booking._id}`)}
                >
                  View QR Ticket Now <FaArrowRight className="ms-2" />
                </button>
              </div>
            ) : (
              <>
                {/* =====================================
                    FACILITY & SLOT SUMMARY
                ====================================== */}
                <div className="checkout-summary-box">
                  <div className="checkout-facility-row">
                    <img
                      src={
                        booking.parking?.image ||
                        "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400"
                      }
                      alt={booking.parking?.name || "Parking Facility"}
                      className="checkout-facility-thumb"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400";
                      }}
                    />
                    <div className="checkout-facility-info">
                      <h5>{booking.parking?.name || "PCE Parking Facility"}</h5>
                      <p>
                        📍 {booking.parking?.address || booking.parking?.city || "Nagpur, Maharashtra"}
                      </p>
                    </div>
                  </div>

                  {/* Chips Grid */}
                  <div className="checkout-chips-grid">
                    <div className="checkout-chip-item">
                      <div className="checkout-chip-label">Reserved Bay</div>
                      <div className="checkout-chip-value text-primary">
                        <FaParking className="me-1" /> Bay {booking.slot?.slotNumber || "N/A"}
                      </div>
                    </div>

                    <div className="checkout-chip-item">
                      <div className="checkout-chip-label">Booking Date</div>
                      <div className="checkout-chip-value">
                        <FaCalendarAlt className="me-1 text-secondary" />
                        {new Date(booking.bookingDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <div className="checkout-chip-item">
                      <div className="checkout-chip-label">Entry - Exit Window</div>
                      <div className="checkout-chip-value">
                        <FaClock className="me-1 text-secondary" />
                        {booking.startTime} - {booking.endTime}
                      </div>
                    </div>

                    <div className="checkout-chip-item">
                      <div className="checkout-chip-label">Duration</div>
                      <div className="checkout-chip-value">
                        {booking.duration} Hour(s)
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="checkout-breakdown">
                    <div className="checkout-breakdown-row">
                      <span>Hourly Parking Tariff</span>
                      <strong>₹{booking.parking?.pricePerHour || Math.round((booking.totalAmount || 20) / (booking.duration || 1))} / hr</strong>
                    </div>

                    <div className="checkout-breakdown-row">
                      <span>Duration Multiplier</span>
                      <span>× {booking.duration || 1} Hour(s)</span>
                    </div>

                    <div className="checkout-breakdown-row">
                      <span>Digital Convenience Fee</span>
                      <span className="badge bg-success bg-opacity-10 text-success fw-bold">FREE (₹0)</span>
                    </div>

                    <div className="checkout-breakdown-row total">
                      <span>Total Payable</span>
                      <span className="text-success">₹{booking.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* =====================================
                    PAYMENT METHOD SELECTION
                ====================================== */}
                <div className="mb-4">
                  <div className="payment-methods-title">
                    Select Payment Method
                  </div>

                  <div className="payment-method-selector">
                    <div
                      className={`payment-method-option ${
                        paymentMethod === "upi" ? "selected" : ""
                      }`}
                      onClick={() => setPaymentMethod("upi")}
                    >
                      <FaMobileAlt className="payment-method-icon" />
                      <span className="payment-method-name">UPI / QR</span>
                      <span className="payment-method-badge">Instant</span>
                    </div>

                    <div
                      className={`payment-method-option ${
                        paymentMethod === "card" ? "selected" : ""
                      }`}
                      onClick={() => setPaymentMethod("card")}
                    >
                      <FaCreditCard className="payment-method-icon" />
                      <span className="payment-method-name">Cards</span>
                      <span className="payment-method-badge">Debit/Credit</span>
                    </div>

                    <div
                      className={`payment-method-option ${
                        paymentMethod === "netbanking" ? "selected" : ""
                      }`}
                      onClick={() => setPaymentMethod("netbanking")}
                    >
                      <FaUniversity className="payment-method-icon" />
                      <span className="payment-method-name">Net Banking</span>
                      <span className="payment-method-badge">All Banks</span>
                    </div>
                  </div>
                </div>

                {/* =====================================
                    PAY CTA BUTTON
                ====================================== */}
                <button
                  type="button"
                  className="btn-pay-confirm"
                  onClick={handlePayment}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                      />
                      Processing Payment Securely...
                    </>
                  ) : (
                    <>
                      <FaLock size={14} />
                      <span>Complete Payment & Get Ticket (₹{booking.totalAmount})</span>
                    </>
                  )}
                </button>

                <div className="d-flex align-items-center justify-content-between mt-3 flex-wrap gap-2 text-muted small">
                  <Link to="/parkings" className="text-decoration-none text-secondary">
                    <FaArrowLeft className="me-1" /> Choose different parking
                  </Link>
                  <span>🔒 100% Safe Payment via Razorpay Gateway</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;