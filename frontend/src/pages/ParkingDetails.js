import { useEffect, useState } from "react";
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
} from "react-icons/fa";

import { getParkingById } from "../services/parkingService";

function ParkingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [parking, setParking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParking();
  }, [id]);

  const loadParking = async () => {
    try {
      setLoading(true);

      const data = await getParkingById(id);

      setParking(data.parking);
    } catch (error) {
      console.error("Parking Details Error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to load parking details."
      );
    } finally {
      setLoading(false);
    }
  };

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