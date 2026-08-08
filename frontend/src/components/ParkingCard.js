import { Link } from "react-router-dom";

function ParkingCard({ parking }) {
  return (
    <div className="col-md-4 mb-4">
      <div className="card shadow h-100">

        <img
          src={
            parking.image ||
            "https://via.placeholder.com/400x220?text=Parking"
          }
          className="card-img-top"
          alt={parking.name}
        />

        <div className="card-body">

          <h5>{parking.name}</h5>

          <p>📍 {parking.city}</p>

          <p>💰 ₹{parking.pricePerHour} / Hour</p>

          <p>🅿 {parking.totalSlots} Slots</p>

          <Link
            className="btn btn-primary w-100"
            to={`/parking/${parking._id}`}
          >
            View Details
          </Link>

        </div>
      </div>
    </div>
  );
}

export default ParkingCard;