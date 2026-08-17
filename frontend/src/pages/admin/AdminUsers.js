import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaTrashAlt,
  FaUser,
  FaUsers,
  FaSyncAlt,
} from "react-icons/fa";

import {
  getAllUsers,
  deleteUser,
} from "../../services/adminService";

import "./AdminPages.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteLoading, setDeleteLoading] =
    useState(null);

  // =====================================
  // Fetch Users
  // =====================================

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const data = await getAllUsers();

      setUsers(data.users || []);
    } catch (error) {
      console.error(
        "Error fetching users:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // Delete User
  // =====================================

  const handleDelete = async (id, role) => {
    if (role === "admin") {
      alert("Admin users cannot be deleted.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?\n\nThis action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      setDeleteLoading(id);

      await deleteUser(id);

      setUsers((previousUsers) =>
        previousUsers.filter(
          (user) => user._id !== id
        )
      );

      alert("User deleted successfully.");
    } catch (error) {
      console.error(
        "Error deleting user:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete user."
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  // =====================================
  // Search
  // =====================================

  const filteredUsers = users.filter((user) => {
    const searchText =
      search.toLowerCase().trim();

    return (
      user.name
        ?.toLowerCase()
        .includes(searchText) ||
      user.email
        ?.toLowerCase()
        .includes(searchText) ||
      user.phone
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  // =====================================
  // Format Date
  // =====================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
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
            Loading Users...
          </h5>

          <p>
            Fetching registered users.
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

            <div className="admin-title-icon">
              <FaUsers />
            </div>

            <div>

              <h1>
                Manage Users
              </h1>

              <p>
                View and manage all registered
                users.
              </p>

            </div>

          </div>

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
      {/* Stats */}
      {/* ================================= */}

      <div className="admin-page-summary">

        <div className="summary-icon">
          <FaUsers />
        </div>

        <div>

          <span>
            Registered Users
          </span>

          <strong>
            {users.length}
          </strong>

        </div>

      </div>

      {/* ================================= */}
      {/* Users Table */}
      {/* ================================= */}

      {users.length === 0 ? (

        <div className="admin-empty">

          <div className="admin-empty-icon">
            <FaUsers />
          </div>

          <h3>
            No Users Found
          </h3>

          <p>
            There are currently no registered
            users in the system.
          </p>

          <button
            className="admin-refresh-btn"
            onClick={fetchUsers}
          >
            <FaSyncAlt />
            Refresh
          </button>

        </div>

      ) : (

        <div className="admin-table-container">

          {/* Table Header */}

          <div className="admin-table-header">

            <div>

              <h3>
                All Users
              </h3>

              <p>
                Showing{" "}
                {filteredUsers.length} of{" "}
                {users.length} users
              </p>

            </div>

            <div className="admin-table-actions">

              <div className="admin-search">

                <FaUser />

                <input
                  type="text"
                  placeholder="Search name, email or phone..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>

              <button
                className="admin-refresh-btn"
                onClick={fetchUsers}
                title="Refresh users"
              >
                <FaSyncAlt />
              </button>

            </div>

          </div>

          {/* Responsive Table */}

          <div className="table-responsive">

            <table className="admin-table">

              <thead>

                <tr>

                  <th>
                    User
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Joined
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredUsers.length === 0 ? (

                  <tr>

                    <td
                      colSpan="5"
                      className="no-search-result"
                    >
                      <FaUsers />

                      <span>
                        No users match your search.
                      </span>
                    </td>

                  </tr>

                ) : (

                  filteredUsers.map((user) => (

                    <tr key={user._id}>

                      {/* User */}

                      <td>

                        <div className="user-cell">

                          <div className="user-avatar">

                            {user.name
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}

                          </div>

                          <div>

                            <strong>
                              {user.name ||
                                "Unknown User"}
                            </strong>

                            <small>
                              ID:{" "}
                              {user._id?.slice(-8)}
                            </small>

                          </div>

                        </div>

                      </td>

                      {/* Contact */}

                      <td>

                        <div className="contact-cell">

                          <div>
                            <FaEnvelope />

                            <span>
                              {user.email ||
                                "No email"}
                            </span>
                          </div>

                          <div>
                            <FaPhone />

                            <span>
                              {user.phone ||
                                "No phone"}
                            </span>
                          </div>

                        </div>

                      </td>

                      {/* Role */}

                      <td>

                        <span
                          className={`role-badge ${
                            user.role || "user"
                          }`}
                        >
                          {user.role || "user"}
                        </span>

                      </td>

                      {/* Joined */}

                      <td>

                        <span className="joined-date">
                          {formatDate(
                            user.createdAt
                          )}
                        </span>

                      </td>

                      {/* Action */}

                      <td>

                        {user.role === "admin" ? (

                          <span className="protected-user">
                            Protected
                          </span>

                        ) : (

                          <button
                            className="action-btn delete"
                            onClick={() =>
                              handleDelete(
                                user._id,
                                user.role
                              )
                            }
                            disabled={
                              deleteLoading ===
                              user._id
                            }
                            title="Delete User"
                          >

                            {deleteLoading ===
                            user._id ? (
                              <span className="small-spinner" />
                            ) : (
                              <FaTrashAlt />
                            )}

                            <span>
                              {deleteLoading ===
                              user._id
                                ? "Deleting..."
                                : "Delete"}
                            </span>

                          </button>

                        )}

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

export default AdminUsers;