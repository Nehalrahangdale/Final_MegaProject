import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCar,
  FaParking,
  FaStar,
  FaClock,
  FaCheckCircle,
  FaUser,
  FaDirections,
  FaLocationArrow,
} from "react-icons/fa";

import {
  getParkingById,
  calculateDistance,
  getGoogleMapsDirectionsUrl,
  getParkingPrediction,
} from "../services/parkingService";
import { getSlotsByParking } from "../services/slotService";
import { ParkingMap } from "../components";
import { socket, joinParkingRoom, leaveParkingRoom } from "../services/socket";

function ParkingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [parking, setParking] = useState(null);
  const [slots, setSlots] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Auto-detect user GPS for distance calculation if permitted
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
          });
        },
        (err) => {
          // Silent catch on auto-detect
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const handleDetectUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingLocation(false);
        setUserLocation({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        });
      },
      (err) => {
        setDetectingLocation(false);
        console.error("GPS error:", err);
        alert("Could not detect location. Please check browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const loadParking = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getParkingById(id);
      setParking(data.parking);

      try {
        const slotData = await getSlotsByParking(id);
        if (slotData && slotData.slots) {
          setSlots(
            slotData.slots.sort((a, b) =>
              String(a.slotNumber).localeCompare(String(b.slotNumber), undefined, {
                numeric: true,
              })
            )
          );
        }
      } catch (slotErr) {
        console.warn("Could not load slot preview:", slotErr);
      }

      // Fetch AI Occupancy & Demand Prediction
      try {
        const predData = await getParkingPrediction(id);
        if (predData && predData.success && predData.prediction) {
          setPrediction(predData.prediction);
        }
      } catch (predErr) {
        console.warn("Could not load AI prediction:", predErr);
      }
    } catch (error) {
      console.error("Parking Details Error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to load parking details."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadParking();
  }, [loadParking]);

  // Real-time slot update subscription
  useEffect(() => {
    if (!id) return;

    joinParkingRoom(id);

    const handleSlotUpdated = (data) => {
      if (!data) return;

      if (data.type === "BOOKED") {
        setSlots((prev) =>
          prev.map((s) =>
            s._id === data.slotId ? { ...s, status: "Booked" } : s
          )
        );
      } else if (data.type === "CANCELLED" || data.type === "COMPLETED") {
        setSlots((prev) =>
          prev.map((s) =>
            s._id === data.slotId || (data.slot && s._id === data.slot._id)
              ? { ...s, status: "Available" }
              : s
          )
        );
      } else if (data.type === "ADDED" && data.slot) {
        setSlots((prev) => {
          if (prev.some((s) => s._id === data.slot._id)) return prev;
          return [...prev, data.slot].sort((a, b) =>
            String(a.slotNumber).localeCompare(String(b.slotNumber), undefined, {
              numeric: true,
            })
          );
        });
      } else if (data.type === "DELETED") {
        setSlots((prev) => prev.filter((s) => s._id !== data.slotId));
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

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="container py-5">

        <div className="text-center py-5">

          <div
            className="spinner-border text-primary"
            role="status"
          />

          <h5 className="mt-3">
            Loading parking details...
          </h5>

        </div>

      </div>
    );
  }

  // ================= NOT FOUND =================

  if (!parking) {
    return (
      <div className="container py-5">

        <div className="text-center py-5">

          <FaParking
            size={70}
            className="text-muted mb-3"
          />

          <h3>
            Parking Not Found
          </h3>

          <p className="text-muted">
            This parking location may have been removed.
          </p>

          <Link
            to="/parkings"
            className="btn btn-primary"
          >
            Back to Parking
          </Link>

        </div>

      </div>
    );
  }

  const availableSlots =
    parking.availableSlots ?? parking.totalSlots ?? 0;

  const totalSlots = parking.totalSlots ?? 0;

  const rating = parking.rating || 0;

  const isAvailable = availableSlots > 0;

  // ================= BOOK =================

  const handleBooking = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to book parking.");

      navigate("/login");

      return;
    }

    navigate(`/booking/${parking._id}`);
  };

  return (
    <div className="parking-details-page">

      {/* ================= BACK BUTTON ================= */}

      <div className="container pt-4">

        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="me-2" />
          Back
        </button>

      </div>

      {/* ================= MAIN ================= */}

      <section className="container py-4">

        <div className="row g-4">

          {/* ================= IMAGE ================= */}

          <div className="col-lg-7">

            <div className="parking-details-image">

              <img
                src={
                  parking.image ||
                  "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1200"
                }
                alt={parking.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1200";
                }}
              />

              <div className="details-price">
                ₹{parking.pricePerHour}/Hour
              </div>

            </div>

          </div>

          {/* ================= BASIC INFO ================= */}

          <div className="col-lg-5">

            <div className="card shadow border-0 h-100">

              <div className="card-body p-4">

                <div className="d-flex justify-content-between align-items-start">

                  <h1 className="fw-bold mb-3">
                    {parking.name}
                  </h1>

                  <span
                    className={
                      isAvailable
                        ? "badge bg-success"
                        : "badge bg-danger"
                    }
                  >
                    {isAvailable
                      ? "Available"
                      : "Full"}
                  </span>

                </div>

                {/* Location */}

                <p className="text-muted">

                  <FaMapMarkerAlt className="text-danger me-2" />

                  {parking.address
                    ? `${parking.address}, `
                    : ""}

                  {parking.city}

                  {parking.state
                    ? `, ${parking.state}`
                    : ""}

                </p>

                {/* Rating */}

                <div className="mb-4">

                  <span className="text-warning">

                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <FaStar
                          key={star}
                          className={
                            star <= rating
                              ? "me-1"
                              : "me-1 text-muted"
                          }
                        />
                      )
                    )}

                  </span>

                  <span className="ms-2">
                    {rating > 0
                      ? `${rating}/5`
                      : "No ratings yet"}
                  </span>

                </div>

                <hr />

                {/* Details */}

                <div className="row g-3 mt-2">

                  <div className="col-6">

                    <div className="details-info-box">

                      <FaCar className="text-primary mb-2" />

                      <small>
                        Vehicle Type
                      </small>

                      <strong>
                        {parking.vehicleType || "Car"}
                      </strong>

                    </div>

                  </div>

                  <div className="col-6">

                    <div className="details-info-box">

                      <FaParking className="text-success mb-2" />

                      <small>
                        Available
                      </small>

                      <strong>
                        {availableSlots} Slots
                      </strong>

                    </div>

                  </div>

                  <div className="col-6">

                    <div className="details-info-box">

                      <FaClock className="text-warning mb-2" />

                      <small>
                        Price
                      </small>

                      <strong>
                        ₹{parking.pricePerHour}/hr
                      </strong>

                    </div>

                  </div>

                  <div className="col-6">

                    <div className="details-info-box">

                      <FaCheckCircle className="text-success mb-2" />

                      <small>
                        Total Slots
                      </small>

                      <strong>
                        {totalSlots}
                      </strong>

                    </div>

                  </div>

                </div>

                {/* Live Slot Status Mini Grid */}
                {slots.length > 0 && (
                  <div className="mt-4 pt-3 border-top">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold small text-dark">
                        Live Slot Availability
                      </span>
                      <span
                        className="badge bg-success bg-opacity-75"
                        style={{ fontSize: "11px" }}
                      >
                        Live Sync 🔄
                      </span>
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      {slots.map((slot) => {
                        const isBooked = slot.status === "Booked";
                        return (
                          <span
                            key={slot._id}
                            className={`badge ${
                              isBooked
                                ? "bg-danger bg-opacity-10 text-danger border border-danger"
                                : "bg-success bg-opacity-10 text-success border border-success"
                            } p-2`}
                            style={{ fontSize: "12px" }}
                            title={
                              isBooked
                                ? `Slot ${slot.slotNumber} (Booked 🔴)`
                                : `Slot ${slot.slotNumber} (Available 🟢)`
                            }
                          >
                            {isBooked ? "🔴" : "🟢"} Slot {slot.slotNumber}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 🤖 AI Parking Prediction */}
                {prediction && (
                  <div
                    className="card border-0 shadow-sm mt-3 p-3"
                    style={{
                      background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
                      borderRadius: "14px",
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span
                        className="fw-bold d-inline-flex align-items-center gap-2 text-primary"
                        style={{ fontSize: "13px" }}
                      >
                        <span>🤖</span> AI Occupancy & Demand Predictor
                      </span>
                      <span
                        className={`badge ${
                          prediction.rush_hour_alert
                            ? "bg-warning text-dark"
                            : "bg-primary text-white"
                        }`}
                        style={{ fontSize: "11px" }}
                      >
                        {prediction.demand_level} Demand
                      </span>
                    </div>

                    <div className="mb-2">
                      <div className="d-flex justify-content-between small text-muted mb-1">
                        <span>Expected Occupancy Rate:</span>
                        <strong className="text-dark">
                          {prediction.occupancy_rate}%
                        </strong>
                      </div>
                      <div
                        className="progress"
                        style={{ height: "7px", borderRadius: "4px" }}
                      >
                        <div
                          className={`progress-bar ${
                            prediction.occupancy_rate >= 75
                              ? "bg-danger"
                              : prediction.occupancy_rate >= 50
                              ? "bg-warning"
                              : "bg-success"
                          }`}
                          role="progressbar"
                          style={{
                            width: `${Math.min(
                              100,
                              prediction.occupancy_rate
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="small text-muted mb-2 d-flex justify-content-between">
                      <span>
                        Est. Free:{" "}
                        <strong className="text-success">
                          {prediction.predicted_available_slots ??
                            Math.max(
                              0,
                              totalSlots - prediction.predicted_booked_slots
                            )}
                        </strong>
                      </span>
                      <span>
                        Est. Booked:{" "}
                        <strong className="text-danger">
                          {prediction.predicted_booked_slots}
                        </strong>
                      </span>
                    </div>

                    <p
                      className="mb-0 small text-dark p-2 rounded"
                      style={{
                        background: "rgba(255, 255, 255, 0.85)",
                        border: "1px solid #e2e8f0",
                        fontSize: "12px",
                      }}
                    >
                      💡 {prediction.recommendation}
                    </p>
                  </div>
                )}

                {/* Booking Button */}

                <button
                  className="btn btn-success btn-lg w-100 mt-4"
                  disabled={!isAvailable}
                  onClick={handleBooking}
                >
                  {isAvailable
                    ? "Book This Parking"
                    : "Parking Full"}
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= DESCRIPTION ================= */}

      <section className="container pb-5">

        <div className="row g-4">

          <div className="col-lg-8">

            <div className="card shadow-sm border-0">

              <div className="card-body p-4">

                <h3 className="fw-bold mb-3">
                  About This Parking
                </h3>

                <p className="text-muted">

                  {parking.description ||
                    "This parking location provides a convenient and secure parking facility for your vehicle."}

                </p>

              </div>

            </div>

            {parking.latitude && parking.longitude && (
              <div className="card shadow-sm border-0 mt-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <div>
                      <h4 className="fw-bold mb-1">📍 Location & Directions</h4>
                      <small className="text-muted">
                        Coordinates: {Number(parking.latitude).toFixed(4)}, {Number(parking.longitude).toFixed(4)}
                      </small>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      {userLocation ? (
                        <span className="badge bg-primary text-white px-3 py-2 rounded-pill d-flex align-items-center gap-1">
                          <FaLocationArrow size={11} />
                          <span>
                            {calculateDistance(
                              userLocation.lat,
                              userLocation.lng,
                              parking.latitude,
                              parking.longitude
                            )}{" "}
                            km away
                          </span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={handleDetectUserLocation}
                          disabled={detectingLocation}
                        >
                          <FaLocationArrow size={11} />
                          <span>{detectingLocation ? "Detecting..." : "Calculate Distance"}</span>
                        </button>
                      )}

                      <a
                        href={getGoogleMapsDirectionsUrl(
                          parking.latitude,
                          parking.longitude
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-success d-flex align-items-center gap-1"
                      >
                        <FaDirections />
                        <span>Get Directions</span>
                      </a>
                    </div>
                  </div>

                  <ParkingMap
                    parking={[parking]}
                    userLocation={userLocation}
                    height="340px"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Owner */}

          <div className="col-lg-4">

            <div className="card shadow-sm border-0">

              <div className="card-body p-4">

                <h4 className="fw-bold mb-3">
                  Parking Owner
                </h4>

                <div className="d-flex align-items-center">

                  <div className="owner-icon">

                    <FaUser />

                  </div>

                  <div className="ms-3">

                    <h6 className="mb-1">

                      {parking.owner?.name ||
                        "Parking Owner"}

                    </h6>

                    <small className="text-muted">

                      {parking.owner?.email ||
                        "Owner information unavailable"}

                    </small>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default ParkingDetails;