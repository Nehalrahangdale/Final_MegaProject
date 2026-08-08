import { useLocation, useNavigate } from "react-router-dom";
import {
  createOrder,
  verifyPayment,
} from "../services/paymentService";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          Booking not found.
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    try {
      // Create Razorpay Order
      const data = await createOrder(
        booking._id,
        booking.totalAmount
      );

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,

        amount: data.order.amount,

        currency: data.order.currency,

        name: "Smart Parking",

        description: "Parking Booking",

        order_id: data.order.id,

        handler: async function (response) {
          await verifyPayment(response);

          alert("Payment Successful");

          navigate("/user/dashboard");
        },

        prefill: {
          name: JSON.parse(localStorage.getItem("user"))?.name,
          email: JSON.parse(localStorage.getItem("user"))?.email,
        },

        theme: {
          color: "#198754",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();

    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Payment Failed"
      );
    }
  };

  return (
    <div className="container py-5">

      <div className="row justify-content-center">

        <div className="col-lg-7">

          <div className="card shadow-lg">

            <div className="card-header bg-success text-white">
              <h3 className="mb-0">
                💳 Payment
              </h3>
            </div>

            <div className="card-body">

              <h4 className="mb-3">
                {booking.parkingName || "Parking"}
              </h4>

              <table className="table">

                <tbody>

                  <tr>
                    <th>Date</th>
                    <td>{booking.bookingDate}</td>
                  </tr>

                  <tr>
                    <th>Start Time</th>
                    <td>{booking.startTime}</td>
                  </tr>

                  <tr>
                    <th>Duration</th>
                    <td>{booking.duration} Hour(s)</td>
                  </tr>

                  <tr>
                    <th>Total Amount</th>
                    <td className="fw-bold text-success">
                      ₹{booking.totalAmount}
                    </td>
                  </tr>

                </tbody>

              </table>

              <button
                className="btn btn-success w-100"
                onClick={handlePayment}
              >
                Pay ₹{booking.totalAmount}
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Payment;