import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaCar,
  FaEye,
  FaMapMarkerAlt,
  FaParking,
  FaRupeeSign,
} from "react-icons/fa";

import { getAllParking } from "../../services/adminService";

import "../../styles/admin/AdminPages.css";

const AdminParking = () => {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================
  // Fetch All Parking
  // =====================================

  useEffect(() => {
    fetchParking();
  }, []);

  const fetchParking = async () => {
    try {
      setLoading(true);

      const data = await getAllParking();

      setParkings(data.parking || []);
    } catch (error) {
      console.error(
        "Error fetching parking:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load parking areas."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // Loading
  // =====================================

  if (loading) {
    return (
      <div className="admin-page-container">

        <div className="admin-loading">

          <div className="spinner-border text-success" />

          <h5>
            Loading Parking Areas...
          </h5>

          <p>
            Please wait while we fetch parking
            information.
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="admin-page-container">

      {/* ================================= */}
      {/* Header */}
      {/* ================================= */}

      <div className="admin-page-header">

        <div>

          <div className="admin-page-title">

            <FaParking />

            <h1>
              Manage Parking
            </h1>

          </div>

          <p>
            View and monitor all registered
            parking areas.
          </p>

        </div>

        <Link
          to="/admin/dashboard"
          className="admin-back-btn"
        >
          <FaArrowLeft />
          Back to Dashboard
        </Link>

      </div>

      {/* ================================= */}
      {/* Summary */}
      {/* ================================= */}

      <div className="admin-page-summary">

        <div className="summary-icon">
          <FaParking />
        </div>

        <div>

          <span>
            Total Parking Areas
          </span>

          <strong>
            {parkings.length}
          </strong>

        </div>

      </div>

      {/* ================================= */}
      {/* Empty State */}
      {/* ================================= */}

      {parkings.length === 0 ? (

        <div className="admin-empty">

          <div className="admin-empty-icon">
            <FaParking />
          </div>

          <h3>
            No Parking Areas Found
          </h3>

          <p>
            There are currently no parking
            areas registered in the system.
          </p>

          <Link
            to="/admin/dashboard"
            className="admin-back-btn"
          >
            <FaArrowLeft />
            Back to Dashboard
          </Link>

        </div>

      ) : (

        /* =================================
           Parking Table
        ================================= */

        <div className="admin-table-container">

          <div className="admin-table-header">

            <div>

              <h3>
                Parking Areas
              </h3>

              <p>
                {parkings.length} parking area
                {parkings.length !== 1
                  ? "s"
                  : ""}{" "}
                registered
              </p>

            </div>

            <button
              className="admin-refresh-btn"
              onClick={fetchParking}
            >
              Refresh
            </button>

          </div>

          <div className="table-responsive">

            <table className="admin-table">

              <thead>

                <tr>

                  <th>
                    Parking
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Owner
                  </th>

                  <th>
                    Slots
                  </th>

                  <th>
                    Price / Hour
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {parkings.map((parking) => (

                  <tr key={parking._id}>

                    {/* Parking */}

                    <td>

                      <div className="parking-name-cell">

                        <div className="parking-table-icon">
                          <FaParking />
                        </div>

                        <div>

                          <strong>
                            {parking.name ||
                              "Unnamed Parking"}
                          </strong>

                          <small>
                            {parking.vehicleType ||
                              "Car"}
                          </small>

                        </div>

                      </div>

                    </td>

                    {/* Location */}

                    <td>

                      <div className="location-cell">

                        <FaMapMarkerAlt />

                        <div>

                          <strong>
                            {parking.city ||
                              "Unknown City"}
                          </strong>

                          <small>
                            {parking.address ||
                              "Address unavailable"}
                          </small>

                        </div>

                      </div>

                    </td>

                    {/* Owner */}

                    <td>

                      <div className="owner-cell">

                        <div className="owner-avatar">
                          {parking.owner?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "O"}
                        </div>

                        <div>

                          <strong>
                            {parking.owner?.name ||
                              "Unknown"}
                          </strong>

                          <small>
                            {parking.owner?.email ||
                              "No email"}
                          </small>

                        </div>

                      </div>

                    </td>

                    {/* Slots */}

                    <td>

                      <div className="slot-info">

                        <FaCar />

                        <strong>
                          {parking.totalSlots ||
                            0}
                        </strong>

                        <span>
                          slots
                        </span>

                      </div>

                    </td>

                    {/* Price */}

                    <td>

                      <div className="price-cell">

                        <FaRupeeSign />

                        <strong>
                          {parking.pricePerHour ||
                            0}
                        </strong>

                        <span>
                          / hr
                        </span>

                      </div>

                    </td>

                    {/* Action */}

                    <td>

                      <Link
                        to={`/parking/${parking._id}`}
                        className="action-btn view"
                        title="View Parking Details"
                      >
                        <FaEye />
                        <span>
                          View
                        </span>
                      </Link>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  );
};

export default AdminParking;