import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  createPaymentOrder,
  verifyPayment,
} from "../services/paymentService";

import { getBookingById } from "../services/bookingService";

function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

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
    } catch (error) {
      console.error("Booking Load Error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to load booking."
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
      alert("Booking not found.");
      return;
    }

    try {
      setPaymentLoading(true);

      // Create Razorpay Order
      const data = await createPaymentOrder(
        booking._id
      );

      if (!data.success || !data.order) {
        throw new Error(
          data.message || "Unable to create payment order."
        );
      }

      const user = JSON.parse(
        localStorage.getItem("user")
      );

      // =====================================
      // Razorpay Options
      // =====================================

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,

        amount: data.order.amount,

        currency: data.order.currency || "INR",

        name: "NextPark AI",

        description: "Smart Parking Booking",

        order_id: data.order.id,

        handler: async function (response) {
          try {
            const verifyData = await verifyPayment({
              razorpay_order_id:
                response.razorpay_order_id,

              razorpay_payment_id:
                response.razorpay_payment_id,

              razorpay_signature:
                response.razorpay_signature,
            });

            if (!verifyData.success) {
              throw new Error(
                verifyData.message ||
                  "Payment verification failed."
              );
            }

            alert(
              "Payment Successful! Booking Confirmed."
            );

            navigate("/user/dashboard");
          } catch (error) {
            console.error(
              "Payment Verification Error:",
              error
            );

            alert(
              error.response?.data?.message ||
                error.message ||
                "Payment verification failed."
            );
          }
        },

        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },

        notes: {
          bookingId: booking._id,
        },

        theme: {
          color: "#198754",
        },

        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
          },
        },
      };

      // =====================================
      // Check Razorpay
      // =====================================

      if (!window.Razorpay) {
        alert(
          "Razorpay Checkout is not loaded. Please refresh the page."
        );

        setPaymentLoading(false);

        return;
      }

      // =====================================
      // Open Razorpay
      // =====================================

      const razorpay = new window.Razorpay(
        options
      );

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Payment Failed:",
            response.error
          );

          alert(
            response.error?.description ||
              "Payment Failed"
          );

          setPaymentLoading(false);
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Payment Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Payment Failed"
      );

      setPaymentLoading(false);
    }
  };

  // =====================================
  // Loading
  // =====================================

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-success"
          role="status"
        />

        <h5 className="mt-3">
          Loading payment details...
        </h5>
      </div>
    );
  }

  // =====================================
  // Booking Not Found
  // =====================================

  if (!booking) {
    return (
      <div className="container py-5">

        <div className="alert alert-warning">
          Booking not found.
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/parkings")}
        >
          Back to Parking
        </button>

      </div>
    );
  }

  // =====================================
  // Payment Page
  // =====================================

  return (
    <div className="container py-5">

      <div className="row justify-content-center">

        <div className="col-lg-7">

          <div className="card shadow-lg border-0">

            <div className="card-header bg-success text-white p-4">

              <h3 className="mb-0">
                💳 Secure Payment
              </h3>

            </div>

            <div className="card-body p-4">

              <h4 className="mb-4">
                {booking.parking?.name ||
                  "Parking"}
              </h4>

              <table className="table">

                <tbody>

                  <tr>
                    <th>Parking</th>

                    <td>
                      {booking.parking?.name ||
                        "N/A"}
                    </td>
                  </tr>

                  <tr>
                    <th>Location</th>

                    <td>
                      {booking.parking?.city ||
                        "N/A"}
                    </td>
                  </tr>

                  <tr>
                    <th>Slot</th>

                    <td>
                      {booking.slot?.slotNumber ||
                        "N/A"}
                    </td>
                  </tr>

                  <tr>
                    <th>Booking Date</th>

                    <td>
                      {new Date(
                        booking.bookingDate
                      ).toLocaleDateString()}
                    </td>
                  </tr>

                  <tr>
                    <th>Start Time</th>

                    <td>
                      {booking.startTime}
                    </td>
                  </tr>

                  <tr>
                    <th>End Time</th>

                    <td>
                      {booking.endTime}
                    </td>
                  </tr>

                  <tr>
                    <th>Duration</th>

                    <td>
                      {booking.duration} Hour(s)
                    </td>
                  </tr>

                  <tr>
                    <th>Payment Status</th>

                    <td>
                      <span className="badge bg-warning text-dark">
                        {booking.paymentStatus}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <th>Total Amount</th>

                    <td className="fw-bold text-success fs-5">
                      ₹{booking.totalAmount}
                    </td>
                  </tr>

                </tbody>

              </table>

              <button
                className="btn btn-success btn-lg w-100 mt-3"
                onClick={handlePayment}
                disabled={paymentLoading}
              >

                {paymentLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />

                    Processing...
                  </>
                ) : (
                  <>
                    Pay ₹{booking.totalAmount}
                  </>
                )}

              </button>

              <p className="text-muted text-center mt-3 mb-0">
                🔒 Secure payment powered by Razorpay
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Payment;