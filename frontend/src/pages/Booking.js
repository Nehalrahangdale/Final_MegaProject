import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaParking,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaCar,
  FaMotorcycle,
  FaLock,
  FaStar,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaBolt,
  FaArrowRight,
  FaSyncAlt,
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
  const [slotFilter, setSlotFilter] = useState("ALL");

  const getTodayDate = () => new Date().toISOString().split("T")[0];
  const getCurrentTime = () => {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };

  const [bookingDate, setBookingDate] = useState(getTodayDate);
  const [startTime, setStartTime] = useState(getCurrentTime);
  const [duration, setDuration] = useState(1);

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // ==========================================
  // LOAD PARKING + SLOTS
  // ==========================================

  const loadBookingData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      }

      if (!parking) {
        const parkingData = await getParkingById(id);
        setParking(parkingData.parking);
      }

      const slotData = await getSlotsByParking(id, {
        bookingDate,
        startTime,
        duration,
      });

      const allSlots = (slotData.slots || []).sort((a, b) =>
        String(a.slotNumber).localeCompare(String(b.slotNumber), undefined, {
          numeric: true,
        })
      );

      setSlots(allSlots);

      // Deselect slot if it is booked for the requested window
      setSelectedSlot((curr) => {
        if (!curr) return "";
        const matched = allSlots.find((s) => s._id === curr);
        return matched && matched.status === "Available" ? curr : "";
      });
    } catch (error) {
      console.error("Booking Data Error:", error);

      if (isInitial) {
        alert(
          error.response?.data?.message ||
            "Failed to load parking booking data."
        );
      }
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, [id, parking, bookingDate, startTime, duration]);

  useEffect(() => {
    loadBookingData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (parking) {
      loadBookingData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingDate, startTime, duration]);

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
      } else if (data.type === "RESET_ALL") {
        setSlots((prev) => prev.map((s) => ({ ...s, status: "Available" })));
        setSelectedSlot("");
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

  const availableSlotsCount = slots.filter((s) => s.status === "Available").length;
  const bookedSlotsCount = slots.filter((s) => s.status === "Booked").length;
  const selectedSlotObj = slots.find((s) => s._id === selectedSlot);

  const filteredSlots = slots.filter((slot) => {
    if (slotFilter === "AVAILABLE") return slot.status === "Available";
    if (slotFilter === "BOOKED") return slot.status === "Booked";
    return true;
  });

  return (
    <div className="container py-5 booking-container">
      <div className="row g-4">
        {/* =====================================
            PARKING INFORMATION (LEFT)
        ====================================== */}
        <div className="col-lg-5">
          <div className="parking-preview-card">
            <div className="parking-preview-img-wrapper">
              <img
                src={
                  parking.image ||
                  "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=900"
                }
                alt={parking.name}
                className="parking-preview-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=900";
                }}
              />
              <span className="parking-type-tag">
                {parking.vehicleType === "Bike" ? <FaMotorcycle /> : <FaCar />}
                {parking.vehicleType || "Car"} Parking
              </span>
              <span className="parking-price-tag">
                ₹{parking.pricePerHour}{" "}
                <span className="text-muted fw-normal" style={{ fontSize: "12px" }}>
                  /hr
                </span>
              </span>
            </div>

            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h4 className="fw-bold mb-0 text-dark">{parking.name}</h4>
                {parking.rating && (
                  <span className="parking-rating-badge">
                    <FaStar className="text-warning" /> {parking.rating}
                  </span>
                )}
              </div>

              <p className="text-muted small mb-3">
                <FaMapMarkerAlt className="text-danger me-1" />
                {parking.address}, {parking.city}
              </p>

              {parking.description && (
                <p className="text-secondary small mb-3">{parking.description}</p>
              )}

              <hr className="my-3 text-muted opacity-25" />

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-semibold text-secondary">
                    <FaParking className="text-success me-1" /> Live Bay Availability
                  </span>
                  <strong className="text-success small">
                    {availableSlotsCount} / {slots.length} Free
                  </strong>
                </div>
                <div
                  className="progress"
                  style={{ height: "8px", borderRadius: "8px", background: "#e2e8f0" }}
                >
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{
                      width: `${
                        slots.length > 0
                          ? (availableSlotsCount / slots.length) * 100
                          : 0
                      }%`,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2 pt-2">
                <span className="badge bg-light text-secondary border px-2 py-2">
                  <FaShieldAlt className="text-primary me-1" /> 24/7 CCTV & Barrier
                </span>
                <span className="badge bg-light text-secondary border px-2 py-2">
                  <FaBolt className="text-warning me-1" /> Instant QR Entry
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================
            BOOKING FORM (RIGHT)
        ====================================== */}
        <div className="col-lg-7">
          <div className="booking-card">
            <div className="booking-header d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h4 className="mb-0 fw-bold d-flex align-items-center gap-2">
                  <FaParking /> Reserve Your Parking
                </h4>
                <small className="opacity-75">
                  Pick your preferred bay and schedule your reservation
                </small>
              </div>

              <div className="live-sync-pill">
                <span className="live-sync-dot" />
                <span>Live Real-Time Sync</span>
              </div>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleContinue}>
                {/* =================================
                    SLOT SELECTION
                ================================== */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                    <label className="form-label fw-bold mb-0 text-dark">
                      Select Parking Slot
                    </label>
                  </div>

                  {/* Legend & Filter Bar */}
                  <div className="slot-legend-bar">
                    <div className="slot-legend-chips">
                      <div className="slot-chip">
                        <span className="slot-chip-dot avail" />
                        <span>Available ({availableSlotsCount})</span>
                      </div>
                      <div className="slot-chip">
                        <span className="slot-chip-dot booked" />
                        <span>Booked ({bookedSlotsCount})</span>
                      </div>
                      {selectedSlot && (
                        <div className="slot-chip">
                          <span className="slot-chip-dot selected" />
                          <span className="text-primary">Selected (1)</span>
                        </div>
                      )}
                    </div>

                    <div className="slot-filters-group">
                      <button
                        type="button"
                        className={`slot-filter-btn ${
                          slotFilter === "ALL" ? "active" : ""
                        }`}
                        onClick={() => setSlotFilter("ALL")}
                      >
                        All ({slots.length})
                      </button>
                      <button
                        type="button"
                        className={`slot-filter-btn ${
                          slotFilter === "AVAILABLE" ? "active" : ""
                        }`}
                        onClick={() => setSlotFilter("AVAILABLE")}
                      >
                        Available ({availableSlotsCount})
                      </button>
                      {bookedSlotsCount > 0 && (
                        <button
                          type="button"
                          className={`slot-filter-btn ${
                            slotFilter === "BOOKED" ? "active" : ""
                          }`}
                          onClick={() => setSlotFilter("BOOKED")}
                        >
                          Booked ({bookedSlotsCount})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Slot Grid */}
                  {slots.length === 0 ? (
                    <div className="alert alert-warning">
                      No parking slots found for this location.
                    </div>
                  ) : filteredSlots.length === 0 ? (
                    <div className="alert alert-light border text-center py-3 text-muted">
                      No slots match the selected filter.
                    </div>
                  ) : (
                    <div className="row g-2">
                      {filteredSlots.map((slot) => {
                        const isBooked = slot.status === "Booked";
                        const isSelected = selectedSlot === slot._id;

                        return (
                          <div className="col-6 col-sm-4" key={slot._id}>
                            <button
                              type="button"
                              disabled={isBooked}
                              title={
                                isBooked
                                  ? `Bay ${slot.slotNumber} is Occupied / Booked`
                                  : isSelected
                                  ? `Bay ${slot.slotNumber} is currently selected`
                                  : `Click to select Bay ${slot.slotNumber}`
                              }
                              className={`slot-bay-card ${
                                isBooked
                                  ? "booked"
                                  : isSelected
                                  ? "selected"
                                  : "available"
                              }`}
                              onClick={() => {
                                if (!isBooked) {
                                  setSelectedSlot(slot._id);
                                }
                              }}
                            >
                              <div className="slot-bay-top">
                                <span className="slot-bay-icon">
                                  {slot.vehicleType === "Bike" ? (
                                    <FaMotorcycle />
                                  ) : (
                                    <FaCar />
                                  )}
                                </span>
                                <span>{slot.slotNumber}</span>
                              </div>

                              <span className="slot-bay-badge">
                                {isBooked ? (
                                  <>
                                    <FaLock style={{ fontSize: "9px" }} />{" "}
                                    {slot.activeBooking?.endTime
                                      ? `Until ${slot.activeBooking.endTime}`
                                      : "Booked"}
                                  </>
                                ) : isSelected ? (
                                  <>
                                    <FaCheckCircle style={{ fontSize: "10px" }} />{" "}
                                    Selected
                                  </>
                                ) : (
                                  "Available"
                                )}
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Selected Banner */}
                  {selectedSlotObj && (
                    <div className="slot-selected-banner">
                      <div className="d-flex align-items-center">
                        <FaCheckCircle className="me-2 text-primary" />
                        <span>
                          <strong>Bay {selectedSlotObj.slotNumber} Selected</strong>
                          <span className="text-muted ms-2 small">
                            ({selectedSlotObj.vehicleType || "Car"} Bay • Ready to
                            reserve)
                          </span>
                        </span>
                      </div>
                      <span className="badge bg-primary px-2 py-1">Active Selection</span>
                    </div>
                  )}
                </div>

                {/* =================================
                    DATE & TIME
                ================================== */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-secondary">
                      <FaCalendarAlt className="me-1 text-primary" /> Booking Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={bookingDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-secondary">
                      <FaClock className="me-1 text-primary" /> Start Time
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* =================================
                    DURATION
                ================================== */}
                <div className="mb-4">
                  <label className="form-label fw-bold small text-secondary">
                    Parking Duration
                  </label>
                  <select
                    className="form-select"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                  >
                    <option value={1}>1 Hour</option>
                    <option value={2}>2 Hours</option>
                    <option value={3}>3 Hours</option>
                    <option value={4}>4 Hours</option>
                    <option value={5}>5 Hours</option>
                    <option value={6}>6 Hours</option>
                  </select>
                </div>

                {/* =================================
                    TOTAL BREAKDOWN
                ================================== */}
                <div className="booking-summary-box mb-4">
                  <div className="booking-summary-row">
                    <span>Base Hourly Rate</span>
                    <strong>₹{parking.pricePerHour} / hr</strong>
                  </div>

                  <div className="booking-summary-row">
                    <span>Selected Duration</span>
                    <strong>{duration} Hour(s)</strong>
                  </div>

                  {selectedSlotObj && (
                    <div className="booking-summary-row">
                      <span>Assigned Bay</span>
                      <strong className="text-primary">
                        Bay {selectedSlotObj.slotNumber}
                      </strong>
                    </div>
                  )}

                  <div className="booking-summary-row">
                    <span>Reservation Fee</span>
                    <span className="badge bg-success bg-opacity-10 text-success fw-bold">
                      FREE
                    </span>
                  </div>

                  <div className="booking-summary-row total">
                    <span className="fs-5">Total Payable</span>
                    <span className="fs-4 text-success fw-bold">
                      ₹{calculateAmount()}
                    </span>
                  </div>
                </div>

                {/* =================================
                    CONTINUE BUTTON
                ================================== */}
                <button
                  type="submit"
                  className="booking-btn-submit w-100 d-flex align-items-center justify-content-center gap-2"
                  disabled={slots.length === 0 || bookingLoading}
                >
                  {bookingLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                      />
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <span>Continue to Payment</span>
                      <FaArrowRight />
                    </>
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