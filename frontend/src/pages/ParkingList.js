import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCar,
  FaParking,
  FaStar,
  FaFilter,
  FaSyncAlt,
} from "react-icons/fa";

import { getAllParking } from "../services/parkingService";

function ParkingList() {
  const [parking, setParking] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [vehicleType, setVehicleType] = useState("All");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const loadParking = async () => {
    try {
      setLoading(true);

      const data = await getAllParking();

      setParking(data.parking || []);
    } catch (error) {
      console.error("Parking Error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to fetch parking."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParking();
  }, []);

  // ================= FILTER + SORT =================

  const filteredParking = useMemo(() => {
    let result = [...parking];

    // Search
    if (search.trim()) {
      const keyword = search.toLowerCase();

      result = result.filter((item) =>
        `${item.name || ""} ${item.city || ""} ${
          item.address || ""
        }`
          .toLowerCase()
          .includes(keyword)
      );
    }

    // Vehicle Type
    if (vehicleType !== "All") {
      result = result.filter(
        (item) => item.vehicleType === vehicleType
      );
    }

    // Maximum Price
    if (maxPrice) {
      result = result.filter(
        (item) =>
          Number(item.pricePerHour) <= Number(maxPrice)
      );
    }

    // Sorting
    if (sortBy === "priceLow") {
      result.sort(
        (a, b) =>
          Number(a.pricePerHour) -
          Number(b.pricePerHour)
      );
    }

    if (sortBy === "priceHigh") {
      result.sort(
        (a, b) =>
          Number(b.pricePerHour) -
          Number(a.pricePerHour)
      );
    }

    if (sortBy === "rating") {
      result.sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      );
    }

    if (sortBy === "slots") {
      result.sort(
        (a, b) =>
          Number(b.availableSlots || 0) -
          Number(a.availableSlots || 0)
      );
    }

    return result;
  }, [
    parking,
    search,
    vehicleType,
    maxPrice,
    sortBy,
  ]);

  // ================= CLEAR FILTER =================

  const clearFilters = () => {
    setSearch("");
    setVehicleType("All");
    setMaxPrice("");
    setSortBy("newest");
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
            Finding available parking...
          </h5>

          <p className="text-muted">
            Please wait.
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="parking-page">

      {/* ================= HEADER ================= */}

      <section className="parking-header py-5">

        <div className="container">

          <div className="text-center text-white">

            <h1 className="fw-bold">
              Find Your Perfect Parking
            </h1>

            <p className="lead mb-0">
              Search and reserve parking spaces
              quickly and securely.
            </p>

          </div>

        </div>

      </section>

      {/* ================= FILTER SECTION ================= */}

      <div className="container">

        <div className="parking-filter-card shadow">

          <div className="d-flex align-items-center mb-4">

            <FaFilter className="text-primary me-2" />

            <h5 className="mb-0 fw-bold">
              Find Parking
            </h5>

          </div>

          <div className="row g-3">

            {/* Search */}

            <div className="col-lg-4">

              <label className="form-label fw-semibold">
                Search
              </label>

              <div className="input-group">

                <span className="input-group-text">
                  <FaSearch />
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Parking, city or address"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>

            </div>

            {/* Vehicle */}

            <div className="col-md-4 col-lg-2">

              <label className="form-label fw-semibold">
                Vehicle
              </label>

              <select
                className="form-select"
                value={vehicleType}
                onChange={(e) =>
                  setVehicleType(e.target.value)
                }
              >
                <option value="All">
                  All
                </option>

                <option value="Bike">
                  Bike
                </option>

                <option value="Car">
                  Car
                </option>

                <option value="Truck">
                  Truck
                </option>
              </select>

            </div>

            {/* Price */}

            <div className="col-md-4 col-lg-2">

              <label className="form-label fw-semibold">
                Max Price
              </label>

              <select
                className="form-select"
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(e.target.value)
                }
              >
                <option value="">
                  Any Price
                </option>

                <option value="50">
                  ₹50 / hour
                </option>

                <option value="100">
                  ₹100 / hour
                </option>

                <option value="200">
                  ₹200 / hour
                </option>

                <option value="500">
                  ₹500 / hour
                </option>
              </select>

            </div>

            {/* Sort */}

            <div className="col-md-4 col-lg-2">

              <label className="form-label fw-semibold">
                Sort By
              </label>

              <select
                className="form-select"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
              >
                <option value="newest">
                  Newest
                </option>

                <option value="priceLow">
                  Price: Low
                </option>

                <option value="priceHigh">
                  Price: High
                </option>

                <option value="rating">
                  Rating
                </option>

                <option value="slots">
                  Available Slots
                </option>
              </select>

            </div>

            {/* Clear */}

            <div className="col-md-12 col-lg-2 d-flex align-items-end">

              <button
                className="btn btn-outline-secondary w-100"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* ================= PARKING RESULTS ================= */}

      <section className="container py-5">

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>

            <h3 className="fw-bold mb-1">
              Available Parking
            </h3>

            <p className="text-muted mb-0">
              {filteredParking.length} parking
              location(s) found
            </p>

          </div>

          <button
            className="btn btn-outline-primary"
            onClick={loadParking}
          >
            <FaSyncAlt className="me-2" />
            Refresh
          </button>

        </div>

        {/* Empty */}

        {filteredParking.length === 0 ? (

          <div className="empty-parking text-center py-5">

            <FaParking
              size={65}
              className="text-muted mb-3"
            />

            <h4>
              No Parking Found
            </h4>

            <p className="text-muted">
              Try changing your search or filters.
            </p>

            <button
              className="btn btn-primary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>

        ) : (

          <div className="row g-4">

            {filteredParking.map((item) => (

              <div
                className="col-md-6 col-lg-4"
                key={item._id}
              >

                <div className="card parking-result-card h-100 shadow-sm">

                  {/* Image */}

                  <div className="parking-image-wrapper">

                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800"
                      }
                      alt={item.name}
                      className="parking-image"
                    />

                    <span className="parking-price">
                      ₹{item.pricePerHour}/hr
                    </span>

                  </div>

                  {/* Card Body */}

                  <div className="card-body p-4">

                    <div className="d-flex justify-content-between">

                      <h5 className="fw-bold">
                        {item.name}
                      </h5>

                      <span className="rating-badge">
                        <FaStar className="me-1" />
                        {item.rating || "New"}
                      </span>

                    </div>

                    <p className="text-muted mb-2">

                      <FaMapMarkerAlt className="text-danger me-2" />

                      {item.address
                        ? `${item.address}, `
                        : ""}

                      {item.city}

                    </p>

                    <p className="mb-2">

                      <FaCar className="text-primary me-2" />

                      {item.vehicleType || "Car"}

                    </p>

                    <div className="slot-info">

                      <FaParking className="text-success me-2" />

                      <strong>
                        {item.availableSlots ??
                          item.totalSlots ??
                          0}
                      </strong>{" "}
                      slots available

                    </div>

                    <Link
                      to={`/parking/${item._id}`}
                      className="btn btn-primary w-100 mt-4"
                    >
                      View Parking
                    </Link>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default ParkingList;