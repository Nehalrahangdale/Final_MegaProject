import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCar,
  FaParking,
  FaStar,
  FaFilter,
  FaSyncAlt,
  FaMapMarkedAlt,
  FaLocationArrow,
  FaDirections,
} from "react-icons/fa";

import {
  getAllParking,
  calculateDistance,
  getGoogleMapsDirectionsUrl,
} from "../services/parkingService";
import { ParkingMap } from "../components";

function ParkingList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [parking, setParking] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize from search query parameters if present
  const initialSearch = searchParams.get("search") || searchParams.get("city") || "";
  const initialVehicle = searchParams.get("vehicleType") || "All";
  const initialLat = searchParams.get("lat");
  const initialLng = searchParams.get("lng");
  const initialNearMe = searchParams.get("nearMe") === "true";

  const [search, setSearch] = useState(initialSearch);
  const [vehicleType, setVehicleType] = useState(initialVehicle);
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState(initialLat && initialLng ? "distance" : "newest");
  const [showMap, setShowMap] = useState(true);
  const [maxRadius, setMaxRadius] = useState(""); // in km
  const [detectingLocation, setDetectingLocation] = useState(false);

  // User detected GPS location
  const [userLocation, setUserLocation] = useState(
    initialLat && initialLng
      ? { lat: Number(initialLat), lng: Number(initialLng) }
      : null
  );

  // Keep state synced if URL params change
  useEffect(() => {
    const urlSearch = searchParams.get("search") || searchParams.get("city") || "";
    const urlVehicle = searchParams.get("vehicleType") || "All";
    const urlLat = searchParams.get("lat");
    const urlLng = searchParams.get("lng");

    if (urlSearch) setSearch(urlSearch);
    if (urlVehicle) setVehicleType(urlVehicle);
    if (urlLat && urlLng) {
      setUserLocation({ lat: Number(urlLat), lng: Number(urlLng) });
      setSortBy("distance");
    }
  }, [searchParams]);

  // If user requested near me on load and no coordinates yet
  useEffect(() => {
    if (initialNearMe && !userLocation) {
      detectUserLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNearMe]);

  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDetectingLocation(false);
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setUserLocation({ lat, lng });
        setSortBy("distance");

        // Update URL query parameters
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.set("lat", lat);
          next.set("lng", lng);
          return next;
        });
      },
      (err) => {
        setDetectingLocation(false);
        console.error("Geolocation error:", err);
        alert("Unable to detect your location. Please check your browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const clearLocation = () => {
    setUserLocation(null);
    if (sortBy === "distance") {
      setSortBy("newest");
    }
    setMaxRadius("");
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("lat");
      next.delete("lng");
      next.delete("nearMe");
      return next;
    });
  };

  const loadParking = async () => {
    try {
      setLoading(true);
      const data = await getAllParking();
      setParking(data.parking || []);
    } catch (error) {
      console.error("Parking Error:", error);
      alert(
        error.response?.data?.message ||
          "Unable to fetch parking locations."
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
    let result = parking.map((item) => {
      const dist =
        item.distance != null
          ? item.distance
          : userLocation?.lat && userLocation?.lng && item.latitude != null && item.longitude != null
          ? calculateDistance(
              userLocation.lat,
              userLocation.lng,
              item.latitude,
              item.longitude
            )
          : null;
      return { ...item, calculatedDistance: dist };
    });

    // Search text filter
    if (search.trim()) {
      const keyword = search.toLowerCase();
      result = result.filter((item) =>
        `${item.name || ""} ${item.city || ""} ${item.address || ""}`
          .toLowerCase()
          .includes(keyword)
      );
    }

    // Vehicle Type
    if (vehicleType !== "All") {
      result = result.filter(
        (item) => item.vehicleType?.toLowerCase() === vehicleType.toLowerCase()
      );
    }

    // Maximum Price
    if (maxPrice) {
      result = result.filter(
        (item) => Number(item.pricePerHour) <= Number(maxPrice)
      );
    }

    // Max Distance / Radius filter
    if (maxRadius && userLocation) {
      const radiusNum = Number(maxRadius);
      result = result.filter(
        (item) => item.calculatedDistance !== null && item.calculatedDistance <= radiusNum
      );
    }

    // Sorting
    if (sortBy === "distance") {
      result.sort((a, b) => {
        if (a.calculatedDistance === null) return 1;
        if (b.calculatedDistance === null) return -1;
        return a.calculatedDistance - b.calculatedDistance;
      });
    } else if (sortBy === "priceLow") {
      result.sort(
        (a, b) => Number(a.pricePerHour) - Number(b.pricePerHour)
      );
    } else if (sortBy === "priceHigh") {
      result.sort(
        (a, b) => Number(b.pricePerHour) - Number(a.pricePerHour)
      );
    } else if (sortBy === "rating") {
      result.sort(
        (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
      );
    } else if (sortBy === "slots") {
      result.sort(
        (a, b) =>
          Number(b.availableSlots || b.totalSlots || 0) -
          Number(a.availableSlots || a.totalSlots || 0)
      );
    }

    return result;
  }, [parking, search, vehicleType, maxPrice, sortBy, maxRadius, userLocation]);

  // ================= CLEAR FILTER =================
  const clearFilters = () => {
    setSearch("");
    setVehicleType("All");
    setMaxPrice("");
    setSortBy("newest");
    setMaxRadius("");
    setUserLocation(null);
    setSearchParams({});
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <h5 className="mt-3">Finding available parking...</h5>
          <p className="text-muted">Please wait.</p>
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
            <h1 className="fw-bold">Find Your Perfect Parking</h1>
            <p className="lead mb-0">
              Search and reserve parking spaces quickly and securely.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FILTER SECTION ================= */}
      <div className="container">
        <div className="parking-filter-card shadow">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div className="d-flex align-items-center">
              <FaFilter className="text-primary me-2" />
              <h5 className="mb-0 fw-bold">Find Parking</h5>
            </div>

            <div>
              {userLocation ? (
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-2 rounded-pill d-flex align-items-center gap-1">
                    <FaLocationArrow size={11} />
                    <span>GPS: {userLocation.lat.toFixed(3)}, {userLocation.lng.toFixed(3)}</span>
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={clearLocation}
                    title="Clear detected location"
                  >
                    Clear GPS
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
                  onClick={detectUserLocation}
                  disabled={detectingLocation}
                >
                  <FaLocationArrow />
                  <span>{detectingLocation ? "Detecting Location..." : "📍 Use My Location"}</span>
                </button>
              )}
            </div>
          </div>

          <div className="row g-3">
            {/* Search */}
            <div className={userLocation ? "col-lg-3 col-md-6" : "col-lg-4"}>
              <label className="form-label fw-semibold">Search</label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Parking name, city or address"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Vehicle */}
            <div className="col-md-4 col-lg-2">
              <label className="form-label fw-semibold">Vehicle</label>
              <select
                className="form-select"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Bike">Bike</option>
                <option value="Car">Car</option>
                <option value="Truck">Truck</option>
              </select>
            </div>

            {/* Price */}
            <div className="col-md-4 col-lg-2">
              <label className="form-label fw-semibold">Max Price</label>
              <select
                className="form-select"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              >
                <option value="">Any Price</option>
                <option value="50">₹50 / hour</option>
                <option value="100">₹100 / hour</option>
                <option value="200">₹200 / hour</option>
                <option value="500">₹500 / hour</option>
              </select>
            </div>

            {/* Radius Filter (when GPS location is enabled) */}
            {userLocation && (
              <div className="col-md-4 col-lg-2">
                <label className="form-label fw-semibold">Radius</label>
                <select
                  className="form-select"
                  value={maxRadius}
                  onChange={(e) => setMaxRadius(e.target.value)}
                >
                  <option value="">Any Distance</option>
                  <option value="5">Within 5 km</option>
                  <option value="10">Within 10 km</option>
                  <option value="25">Within 25 km</option>
                  <option value="50">Within 50 km</option>
                </select>
              </div>
            )}

            {/* Sort */}
            <div className={userLocation ? "col-md-4 col-lg-2" : "col-md-4 col-lg-2"}>
              <label className="form-label fw-semibold">Sort By</label>
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {userLocation && (
                  <option value="distance">📍 Nearest First</option>
                )}
                <option value="newest">Newest</option>
                <option value="priceLow">Price: Low</option>
                <option value="priceHigh">Price: High</option>
                <option value="rating">Rating</option>
                <option value="slots">Available Slots</option>
              </select>
            </div>

            {/* Clear */}
            <div className={userLocation ? "col-md-4 col-lg-1 d-flex align-items-end" : "col-md-12 col-lg-2 d-flex align-items-end"}>
              <button
                className="btn btn-outline-secondary w-100"
                onClick={clearFilters}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= INTERACTIVE MAP SECTION ================= */}
      <section className="container mt-4 mb-2">
        <div
          className="card border-0 shadow-sm"
          style={{ borderRadius: "16px", overflow: "hidden" }}
        >
          <div className="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center border-bottom">
            <div className="d-flex align-items-center gap-2">
              <FaMapMarkedAlt className="text-primary fs-5" />
              <div>
                <h5 className="mb-0 fw-bold">Live Parking Map</h5>
                <small className="text-muted">
                  Interactive GPS map with real-time locations, distances, and direct directions
                </small>
              </div>
            </div>

            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => setShowMap(!showMap)}
            >
              {showMap ? "Hide Map" : "Show Map"}
            </button>
          </div>

          {showMap && (
            <div className="p-3 bg-light">
              <ParkingMap
                parking={filteredParking}
                userLocation={userLocation}
                height="430px"
              />
            </div>
          )}
        </div>
      </section>

      {/* ================= PARKING RESULTS ================= */}
      <section className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">Available Parking</h3>
            <p className="text-muted mb-0">
              {filteredParking.length} parking location(s) found
              {userLocation ? " near your GPS position" : ""}
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
            <FaParking size={65} className="text-muted mb-3" />
            <h4>No Parking Found</h4>
            <p className="text-muted">
              Try changing your search query, increasing radius, or resetting filters.
            </p>
            <button className="btn btn-primary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {filteredParking.map((item) => (
              <div className="col-md-6 col-lg-4" key={item._id}>
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
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800";
                      }}
                    />
                    <span className="parking-price">
                      ₹{item.pricePerHour}/hr
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between">
                      <h5 className="fw-bold">{item.name}</h5>
                      <span className="rating-badge">
                        <FaStar className="me-1" />
                        {item.rating || "4.8"}
                      </span>
                    </div>

                    <p className="text-muted mb-2">
                      <FaMapMarkerAlt className="text-danger me-2" />
                      {item.address ? `${item.address}, ` : ""}
                      {item.city}
                    </p>

                    {/* Location & Distance Badges */}
                    <div className="mb-2 d-flex flex-wrap gap-2 align-items-center">
                      {item.calculatedDistance != null && (
                        <span
                          className="badge bg-primary text-white px-2 py-1 d-flex align-items-center gap-1"
                          style={{ fontSize: "12px", borderRadius: "8px" }}
                        >
                          <FaLocationArrow size={10} />
                          <span>{item.calculatedDistance} km away</span>
                        </span>
                      )}

                      {item.latitude && item.longitude && (
                        <span
                          className="badge bg-light text-secondary border px-2 py-1"
                          style={{ fontSize: "11px" }}
                        >
                          📍 {Number(item.latitude).toFixed(3)}, {Number(item.longitude).toFixed(3)}
                        </span>
                      )}
                    </div>

                    <p className="mb-2">
                      <FaCar className="text-primary me-2" />
                      {item.vehicleType || "Car"}
                    </p>

                    <div className="slot-info">
                      <FaParking className="text-success me-2" />
                      <strong>
                        {item.availableSlots ?? item.totalSlots ?? 0}
                      </strong>{" "}
                      slots available
                    </div>

                    <div className="d-flex gap-2 mt-4">
                      <Link
                        to={`/parking/${item._id}`}
                        className="btn btn-primary flex-grow-1"
                      >
                        View Parking
                      </Link>

                      {item.latitude && item.longitude && (
                        <a
                          href={getGoogleMapsDirectionsUrl(item.latitude, item.longitude)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-secondary d-flex align-items-center justify-content-center px-3"
                          title="Open in Google Maps"
                        >
                          <FaDirections className="me-1" />
                          Directions
                        </a>
                      )}
                    </div>
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