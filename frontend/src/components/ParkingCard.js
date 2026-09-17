import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaParking, FaCar, FaStar } from "react-icons/fa";

function ParkingCard({ parking }) {
  if (!parking) return null;

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card shadow-sm h-100 border-0 overflow-hidden">
        <div style={{ position: "relative", height: "220px", overflow: "hidden", background: "#f1f5f9" }}>
          <img
            src={
              parking.image ||
              "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800"
            }
            className="card-img-top w-100 h-100"
            style={{ objectFit: "cover", objectPosition: "center" }}
            alt={parking.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800";
            }}
          />
          <span
            className="badge bg-dark text-white px-3 py-2"
            style={{
              position: "absolute",
              bottom: "12px",
              right: "12px",
              fontSize: "14px",
              borderRadius: "8px",
            }}
          >
            ₹{parking.pricePerHour} / hr
          </span>
        </div>

        <div className="card-body d-flex flex-column p-4">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="fw-bold mb-0">{parking.name}</h5>
            <span className="badge bg-warning text-dark">
              <FaStar className="me-1" />
              {parking.rating || "4.8"}
            </span>
          </div>

          <p className="text-muted mb-2">
            <FaMapMarkerAlt className="text-danger me-2" />
            {parking.address ? `${parking.address}, ` : ""}
            {parking.city}
          </p>

          <p className="mb-2">
            <FaParking className="text-success me-2" />
            <strong>{parking.availableSlots ?? parking.totalSlots ?? 0}</strong> Slots Available
          </p>

          <p className="mb-3">
            <FaCar className="text-primary me-2" />
            {parking.vehicleType || "Car"} Parking
          </p>

          <div className="mt-auto">
            <Link
              className="btn btn-primary w-100"
              to={`/parking/${parking._id}`}
            >
              View Details & Book
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParkingCard;