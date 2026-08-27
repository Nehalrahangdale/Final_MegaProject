import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaParking,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";

import {
  getParkingById,
  getSlotsByParking,
} from "../services/parkingService";

import { createBooking } from "../services/bookingService";

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [parking, setParking] = useState(null);
  const [slots, setSlots] = useState([]);

  const [selectedSlot, setSelectedSlot] = useState("");

  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(1);

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // ==========================================
  // LOAD PARKING + SLOTS
  // ==========================================

  const loadBookingData = useCallback(async () => {
    try {
      setLoading(true);

      const parkingData = await getParkingById(id);

      setParking(parkingData.parking);

      const slotData = await getSlotsByParking(id);

      const availableSlots = (slotData.slots || []).filter(
        (slot) => slot.status === "Available"
      );

      setSlots(availableSlots);
    } catch (error) {
      console.error("Booking Data Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load parking booking data."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBookingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ==========================================
  // CALCULATE AMOUNT
  // ==========================================

  const calculateAmount = () => {
    if (!parking) {
      return 0;
    }

    return (
      Number(parking.pricePerHour || 0) *
      Number(duration || 1)
    );
  };

  // ==========================================
  // CREATE BOOKING
  // ==========================================

  const handleContinue = async (e) => {
    e.preventDefault();

    if (!selectedSlot) {
      alert("Please select a parking slot.");
      return;
    }

    if (!bookingDate) {
      alert("Please select booking date.");
      return;
    }

    if (!startTime) {
      alert("Please select start time.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to continue.");

      navigate("/login");

      return;
    }

    try {
      setBookingLoading(true);

      const bookingData = {
        parkingId: parking._id,
        slotId: selectedSlot,
        bookingDate,
        startTime,
        duration: Number(duration),
      };

      /*
       * Amount frontend se backend ko nahi bhej rahe.
       * Backend parking ke price se amount calculate karega.
       */

      const data = await createBooking(bookingData);

      if (!data.success) {
        throw new Error(
          data.message || "Booking failed"
        );
      }

      // Save real booking ID for payment page
      sessionStorage.setItem(
        "bookingId",
        data.booking._id
      );

      // Save booking details for UI
      sessionStorage.setItem(
        "pendingBooking",
        JSON.stringify(data.booking)
      );

      // Go to payment
      navigate(
        `/payment?bookingId=${data.booking._id}`
      );
    } catch (error) {
      console.error("Create Booking Error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Unable to create booking."
      );

      // Reload slots because slot may have
      // become unavailable
      await loadBookingData();
    } finally {
      setBookingLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="container py-5 text-center">

        <div
          className="spinner-border text-primary"
          role="status"
        />

        <h5 className="mt-3">
          Loading booking details...
        </h5>

      </div>
    );
  }

  // ==========================================
  // PARKING NOT FOUND
  // ==========================================

  if (!parking) {
    return (
      <div className="container py-5 text-center">

        <h3>
          Parking Not Found
        </h3>

        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate("/parkings")}
        >
          Back to Parking
        </button>

      </div>
    );
  }

  return (
    <div className="container py-5">

      <div className="row g-4">

        {/* =====================================
            PARKING INFORMATION
        ====================================== */}

        <div className="col-lg-5">

          <div className="card shadow border-0 h-100">

            <img
              src={
                parking.image ||
                "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=900"
              }
              alt={parking.name}
              className="card-img-top"
              style={{
                height: "250px",
                objectFit: "cover",
              }}
            />

            <div className="card-body p-4">

              <h3 className="fw-bold">
                {parking.name}
              </h3>

              <p className="text-muted">
                📍 {parking.address},{" "}
                {parking.city}
              </p>

              <hr />

              <div className="d-flex justify-content-between">

                <span>
                  <FaParking className="text-success me-2" />
                  Available Slots
                </span>

                <strong>
                  {slots.length}
                </strong>

              </div>

              <div className="d-flex justify-content-between mt-3">

                <span>
                  💰 Price
                </span>

                <strong>
                  ₹{parking.pricePerHour}/hour
                </strong>

              </div>

            </div>

          </div>

        </div>

        {/* =====================================
            BOOKING FORM
        ====================================== */}

        <div className="col-lg-7">

          <div className="card shadow border-0">

            <div className="card-header bg-primary text-white p-4">

              <h3 className="mb-0">
                <FaParking className="me-2" />
                Reserve Your Parking
              </h3>

            </div>

            <div className="card-body p-4">

              <form onSubmit={handleContinue}>

                {/* =================================
                    SLOT SELECTION
                ================================== */}

                <div className="mb-4">

                  <label className="form-label fw-bold">
                    Select Parking Slot
                  </label>

                  {slots.length === 0 ? (

                    <div className="alert alert-danger">
                      No parking slots are currently
                      available.
                    </div>

                  ) : (

                    <div className="row g-3">

                      {slots.map((slot) => (

                        <div
                          className="col-6 col-md-4"
                          key={slot._id}
                        >

                          <button
                            type="button"
                            className={
                              `slot-button w-100 ${
                                selectedSlot === slot._id
                                  ? "selected"
                                  : ""
                              }`
                            }
                            onClick={() =>
                              setSelectedSlot(
                                slot._id
                              )
                            }
                          >

                            <FaParking />

                            <span>
                              Slot {slot.slotNumber}
                            </span>

                            {selectedSlot ===
                              slot._id && (
                              <FaCheckCircle
                                className="text-success"
                              />
                            )}

                          </button>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

                {/* =================================
                    DATE
                ================================== */}

                <div className="mb-3">

                  <label className="form-label fw-bold">

                    <FaCalendarAlt className="me-2" />

                    Booking Date

                  </label>

                  <input
                    type="date"
                    className="form-control"
                    value={bookingDate}
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    onChange={(e) =>
                      setBookingDate(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

                {/* =================================
                    TIME
                ================================== */}

                <div className="mb-3">

                  <label className="form-label fw-bold">

                    <FaClock className="me-2" />

                    Start Time

                  </label>

                  <input
                    type="time"
                    className="form-control"
                    value={startTime}
                    onChange={(e) =>
                      setStartTime(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

                {/* =================================
                    DURATION
                ================================== */}

                <div className="mb-4">

                  <label className="form-label fw-bold">
                    Duration
                  </label>

                  <select
                    className="form-select"
                    value={duration}
                    onChange={(e) =>
                      setDuration(
                        Number(e.target.value)
                      )
                    }
                  >

                    <option value={1}>
                      1 Hour
                    </option>

                    <option value={2}>
                      2 Hours
                    </option>

                    <option value={3}>
                      3 Hours
                    </option>

                    <option value={4}>
                      4 Hours
                    </option>

                    <option value={5}>
                      5 Hours
                    </option>

                    <option value={6}>
                      6 Hours
                    </option>

                  </select>

                </div>

                {/* =================================
                    TOTAL
                ================================== */}

                <div className="booking-total p-3 mb-4">

                  <div className="d-flex justify-content-between">

                    <span>
                      Price / Hour
                    </span>

                    <strong>
                      ₹{parking.pricePerHour}
                    </strong>

                  </div>

                  <div className="d-flex justify-content-between mt-2">

                    <span>
                      Duration
                    </span>

                    <strong>
                      {duration} Hour(s)
                    </strong>

                  </div>

                  <hr />

                  <div className="d-flex justify-content-between">

                    <h5>
                      Total Amount
                    </h5>

                    <h4 className="text-success">
                      ₹{calculateAmount()}
                    </h4>

                  </div>

                </div>

                {/* =================================
                    CONTINUE
                ================================== */}

                <button
                  type="submit"
                  className="btn btn-success btn-lg w-100"
                  disabled={
                    slots.length === 0 ||
                    bookingLoading
                  }
                >

                  {bookingLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />

                      Creating Booking...
                    </>
                  ) : (
                    "Continue to Payment"
                  )}

                </button>

              </form>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Booking;