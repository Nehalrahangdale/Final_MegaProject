import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaUserTie } from "react-icons/fa";
import { getAllOwners } from "../../services/adminService";
import "./AdminPages.css";

const AdminOwners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

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
      alert(error.response?.data?.message || "Failed to load owners");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="admin-loading">
          <div className="spinner-border text-warning" />
          <h5>Loading Owners...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1>Manage Owners</h1>
        <Link to="/admin/dashboard" className="admin-back-btn">
          <FaArrowLeft /> Back to Dashboard
        </Link>
      </div>

      {owners.length === 0 ? (
        <div className="admin-empty">
          <FaUserTie />
          <h3>No owners found</h3>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((owner) => (
                <tr key={owner._id}>
                  <td>{owner.name}</td>
                  <td>{owner.email}</td>
                  <td>{owner.phone || "N/A"}</td>
                  <td>{new Date(owner.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOwners;