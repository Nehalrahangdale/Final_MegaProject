import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaParking,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";

import { getParkingById } from "../services/parkingService";
import { getSlotsByParking } from "../services/slotService";
import { createBooking } from "../services/bookingService";
import { socket, joinParkingRoom, leaveParkingRoom } from "../services/socket";

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

      const allSlots = (slotData.slots || []).sort((a, b) =>
        String(a.slotNumber).localeCompare(String(b.slotNumber), undefined, {
          numeric: true,
        })
      );

      setSlots(allSlots);
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
  // REAL-TIME SLOT UPDATES (Socket.IO)
  // ==========================================
  useEffect(() => {
    if (!id) return;

    joinParkingRoom(id);

    const handleSlotUpdated = (data) => {
      if (!data) return;

      if (data.type === "BOOKED") {
        // Automatically switch slot to Booked 🔴
        setSlots((prev) =>
          prev.map((s) =>
            s._id === data.slotId ? { ...s, status: "Booked" } : s
          )
        );

        setSelectedSlot((curr) => {
          if (curr === data.slotId) {
            alert(
              `Slot ${data.slot?.slotNumber || ""} was just booked by another user! It is now 🔴 Booked.`
            );
            return "";
          }
          return curr;
        });
      } else if (
        data.type === "CANCELLED" ||
        data.type === "COMPLETED"
      ) {
        // Automatically switch slot back to Available 🟢
        setSlots((prev) =>
          prev.map((s) =>
            s._id === data.slotId || (data.slot && s._id === data.slot._id)
              ? { ...s, status: "Available" }
              : s
          )
        );
      } else if (data.type === "ADDED" && data.slot) {
        setSlots((prev) => {
          const exists = prev.some((s) => s._id === data.slot._id);
          if (exists) return prev;
          const updated = [...prev, data.slot];
          return updated.sort((a, b) =>
            String(a.slotNumber).localeCompare(String(b.slotNumber), undefined, {
              numeric: true,
            })
          );
        });
      } else if (data.type === "DELETED") {
        setSlots((prev) => prev.filter((s) => s._id !== data.slotId));
        setSelectedSlot((curr) => (curr === data.slotId ? "" : curr));
      } else if (data.type === "UPDATED" && data.slot) {
        setSlots((prev) =>
          prev.map((s) => (s._id === data.slot._id ? data.slot : s))
        );
        if (data.slot.status === "Booked") {
          setSelectedSlot((curr) => (curr === data.slot._id ? "" : curr));
        }
      }

      if (typeof data.availableSlots === "number") {
        setParking((prev) =>
          prev ? { ...prev, availableSlots: data.availableSlots } : prev
        );
      }
    };

    socket.on("slotUpdated", handleSlotUpdated);

    return () => {
      leaveParkingRoom(id);
      socket.off("slotUpdated", handleSlotUpdated);
    };
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

    const chosenSlot = slots.find((s) => s._id === selectedSlot);
    if (chosenSlot && chosenSlot.status === "Booked") {
      alert("This slot is already booked! Please select an available slot.");
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
                  {slots.filter((s) => s.status === "Available").length} / {slots.length}
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

            <div className="card-header bg-primary text-white p-4 d-flex justify-content-between align-items-center flex-wrap gap-2">

              <h3 className="mb-0">
                <FaParking className="me-2" />
                Reserve Your Parking
              </h3>

              <span className="badge bg-success bg-opacity-75 d-inline-flex align-items-center gap-2 px-3 py-2 fs-6">
                <span className="spinner-grow spinner-grow-sm text-light" style={{ width: "0.55rem", height: "0.55rem" }} />
                Live Slot Sync 🔄
              </span>

            </div>

            <div className="card-body p-4">

              <form onSubmit={handleContinue}>

                {/* =================================
                    SLOT SELECTION
                ================================== */}

                <div className="mb-4">

                  <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                    <label className="form-label fw-bold mb-0">
                      Select Parking Slot
                    </label>

                    <div className="slot-legend">
                      <span className="slot-legend-item text-success">
                        🟢 Available ({slots.filter((s) => s.status === "Available").length})
                      </span>
                      <span className="slot-legend-item text-danger">
                        🔴 Booked ({slots.filter((s) => s.status === "Booked").length})
                      </span>
                    </div>
                  </div>

                  {slots.length === 0 ? (
                    <div className="alert alert-warning">
                      No parking slots found for this location.
                    </div>
                  ) : (
                    <div className="row g-3">
                      {slots.map((slot) => {
                        const isBooked = slot.status === "Booked";
                        const isSelected = selectedSlot === slot._id;

                        return (
                          <div
                            className="col-6 col-md-4"
                            key={slot._id}
                          >
                            <button
                              type="button"
                              disabled={isBooked}
                              title={
                                isBooked
                                  ? `Slot ${slot.slotNumber} is Booked 🔴`
                                  : `Click to select Slot ${slot.slotNumber} 🟢`
                              }
                              className={
                                `slot-button w-100 ${
                                  isBooked
                                    ? "booked"
                                    : isSelected
                                    ? "selected"
                                    : "available"
                                }`
                              }
                              onClick={() => {
                                if (!isBooked) {
                                  setSelectedSlot(slot._id);
                                }
                              }}
                            >
                              <span>
                                {isBooked ? "🔴" : "🟢"}
                              </span>

                              <span>
                                Slot {slot.slotNumber}
                              </span>

                              {isBooked && (
                                <small
                                  className="badge bg-danger ms-1"
                                  style={{ fontSize: "10px" }}
                                >
                                  Booked
                                </small>
                              )}

                              {isSelected && !isBooked && (
                                <FaCheckCircle
                                  className="text-primary ms-1"
                                />
                              )}
                            </button>
                          </div>
                        );
                      })}
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