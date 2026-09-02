import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaSyncAlt,
  FaSearch,
  FaTrashAlt,
  FaCalendarAlt,
} from "react-icons/fa";

import { getAllOwners, deleteUser } from "../../services/adminService";
import "../../styles/admin/AdminPages.css";

const AdminOwners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const data = await getAllOwners();
      setOwners(data.owners || []);
    } catch (error) {
      console.error("Error fetching owners:", error);
      alert(error.response?.data?.message || "Failed to load parking owners");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this parking owner?\nAll associated parking records might be impacted."
    );
    if (!confirmDelete) return;

    try {
      setDeleteLoading(id);
      await deleteUser(id);
      setOwners((prev) => prev.filter((owner) => owner._id !== id));
      alert("Owner account deleted successfully.");
    } catch (error) {
      console.error("Error deleting owner:", error);
      alert(error.response?.data?.message || "Failed to delete owner.");
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredOwners = owners.filter((owner) => {
    const query = search.toLowerCase().trim();
    return (
      !query ||
      owner.name?.toLowerCase().includes(query) ||
      owner.email?.toLowerCase().includes(query) ||
      owner.phone?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="admin-loading">
          <div className="spinner-border text-success" />
          <h5 className="mt-3">Loading Parking Owners...</h5>
          <p>Fetching registered parking operator accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-title">
          <div className="admin-title-icon">
            <FaUserTie />
          </div>
          <div>
            <h1>Manage Parking Owners</h1>
            <p>View and manage verified parking owners & operators.</p>
          </div>
        </div>

        <Link to="/admin/dashboard" className="admin-back-btn">
          <FaArrowLeft />
          Back to Dashboard
        </Link>
      </div>

      {/* Summary Card */}
      <div className="admin-page-summary">
        <div className="summary-icon">
          <FaUserTie />
        </div>
        <div>
          <span>Registered Operators & Owners</span>
          <strong>{owners.length}</strong>
        </div>
      </div>

      {/* Owners Table */}
      {owners.length === 0 ? (
        <div className="admin-empty">
          <FaUserTie size={55} />
          <h3 className="mt-3">No Owners Found</h3>
          <p>No parking facility owners are currently registered.</p>
          <button className="admin-refresh-btn" onClick={fetchOwners}>
            <FaSyncAlt /> Refresh
          </button>
        </div>
      ) : (
        <div className="admin-table-container">
          <div className="admin-table-header">
            <div>
              <h3>All Parking Owners</h3>
              <p>
                Showing {filteredOwners.length} of {owners.length} registered owners
              </p>
            </div>

            <div className="admin-table-actions">
              <div className="admin-search">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search name, email, phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button
                className="admin-refresh-btn"
                onClick={fetchOwners}
                title="Refresh Owners"
              >
                <FaSyncAlt />
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Owner</th>
                  <th>Contact Details</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOwners.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-search-result">
                      <FaUserTie />
                      <span>No owners match your search keyword.</span>
                    </td>
                  </tr>
                ) : (
                  filteredOwners.map((owner) => (
                    <tr key={owner._id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {owner.name ? owner.name.charAt(0).toUpperCase() : "O"}
                          </div>
                          <div>
                            <strong>{owner.name || "Owner"}</strong>
                            <small>ID: {owner._id?.slice(-8)}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="contact-cell">
                          <div>
                            <FaEnvelope />
                            <span>{owner.email || "No email"}</span>
                          </div>
                          <div>
                            <FaPhone />
                            <span>{owner.phone || "No phone"}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="role-badge owner">Owner</span>
                      </td>
                      <td>
                        <span className="joined-date">
                          <FaCalendarAlt className="me-1" />
                          {formatDate(owner.createdAt)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(owner._id)}
                          disabled={deleteLoading === owner._id}
                          title="Delete Owner Account"
                        >
                          {deleteLoading === owner._id ? (
                            <span className="small-spinner" />
                          ) : (
                            <FaTrashAlt />
                          )}
                          <span>
                            {deleteLoading === owner._id ? "Deleting..." : "Delete"}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOwners;