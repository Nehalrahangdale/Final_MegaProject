import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaUsers, FaCalendarCheck, FaShieldAlt, FaQrcode } from "react-icons/fa";
import { MdLocalParking } from "react-icons/md";
import NextParkLogo from "./NextParkLogo";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    user = null;
  }

  const logoutHandler = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // Decide dashboard according to role
  const getDashboardPath = () => {
    if (user?.role === "owner") {
      return "/owner/dashboard";
    }

    if (user?.role === "admin") {
      return "/admin/dashboard";
    }

    return "/user/dashboard";
  };

  const getDashboardName = () => {
    if (user?.role === "owner") {
      return "Owner Dashboard";
    }

    if (user?.role === "admin") {
      return "Admin Dashboard";
    }

    return "User Dashboard";
  };

  const isAdmin = user?.role === "admin";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow">
      <div className="container">

        {/* Logo */}
        <Link
          className="navbar-brand d-flex align-items-center py-1"
          to="/"
          title="NextPark AI - Smart Parking System"
        >
          <NextParkLogo variant="compact" height={36} animated={true} />
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Menu */}
        <div
          className="collapse navbar-collapse"
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto align-items-lg-center">

            {/* ========================= */}
            {/* ADMIN — Special Nav Links */}
            {/* ========================= */}

            {isAdmin ? (
              <>
                {/* Admin Panel Badge */}
                <li className="nav-item me-lg-2">
                  <span
                    className="badge d-flex align-items-center gap-1 py-2 px-3"
                    style={{
                      background: "linear-gradient(135deg, #dc3545, #c0392b)",
                      fontSize: "10px",
                      letterSpacing: "1px",
                      borderRadius: "20px",
                      fontWeight: 800,
                    }}
                  >
                    <FaShieldAlt />
                    ADMIN PANEL
                  </span>
                </li>

                {/* Admin: Users */}
                <li className="nav-item">
                  <Link
                    className="nav-link d-flex align-items-center gap-1"
                    to="/admin/users"
                    style={{ fontSize: "13px" }}
                  >
                    <FaUsers />
                    Users
                  </Link>
                </li>

                {/* Admin: Parking */}
                <li className="nav-item">
                  <Link
                    className="nav-link d-flex align-items-center gap-1"
                    to="/admin/parking"
                    style={{ fontSize: "13px" }}
                  >
                    <MdLocalParking />
                    Parking
                  </Link>
                </li>

                {/* Admin: Bookings */}
                <li className="nav-item">
                  <Link
                    className="nav-link d-flex align-items-center gap-1"
                    to="/admin/bookings"
                    style={{ fontSize: "13px" }}
                  >
                    <FaCalendarCheck />
                    Bookings
                  </Link>
                </li>
              </>
            ) : (
              <>
                {/* Home */}
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/"
                  >
                    Home
                  </Link>
                </li>

                {/* Parking */}
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/parkings"
                  >
                    Parking
                  </Link>
                </li>

                {/* About */}
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/about"
                  >
                    About
                  </Link>
                </li>

                {/* Contact */}
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/contact"
                  >
                    Contact
                  </Link>
                </li>

                {/* Gate Scanner */}
                <li className="nav-item">
                  <Link
                    className="nav-link d-flex align-items-center gap-1"
                    to="/gate-scanner"
                    title="QR Gate Ticket Scanner"
                  >
                    <FaQrcode style={{ fontSize: "12px" }} />
                    Gate Scanner
                  </Link>
                </li>
              </>
            )}

            {/* ========================= */}
            {/* NOT LOGGED IN */}
            {/* ========================= */}

            {!token ? (
              <>
                {/* Login */}
                <li className="nav-item ms-lg-3">
                  <Link
                    className="btn btn-outline-light me-lg-2 mt-2 mt-lg-0"
                    to="/login"
                  >
                    Login
                  </Link>
                </li>

                {/* Register */}
                <li className="nav-item">
                  <Link
                    className="btn btn-warning mt-2 mt-lg-0"
                    to="/register"
                  >
                    Register
                  </Link>
                </li>
              </>
            ) : (

              /* ========================= */
              /* LOGGED IN */
              /* ========================= */

              <li className="nav-item dropdown ms-lg-3">

                <button
                  className="btn dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{
                    background: isAdmin
                      ? "linear-gradient(135deg, #dc3545, #c0392b)"
                      : "rgba(255,255,255,0.1)",
                    border: isAdmin
                      ? "none"
                      : "1px solid rgba(255,255,255,0.4)",
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  <FaUserCircle />
                  {user?.name || "User"}
                  {isAdmin && (
                    <FaShieldAlt
                      style={{ fontSize: "10px", opacity: 0.9 }}
                    />
                  )}
                </button>

                <ul className="dropdown-menu dropdown-menu-end">

                  {/* Role Badge inside dropdown */}
                  <li>
                    <span
                      className="dropdown-item-text d-flex align-items-center gap-2"
                      style={{
                        fontSize: "11px",
                        color: isAdmin ? "#dc3545" : "#6c757d",
                        fontWeight: 800,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        padding: "8px 16px",
                      }}
                    >
                      <FaShieldAlt />
                      {user?.role?.toUpperCase() || "USER"}
                    </span>
                  </li>

                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                  {/* Dashboard */}
                  <li>
                    <Link
                      className="dropdown-item"
                      to={getDashboardPath()}
                    >
                      {getDashboardName()}
                    </Link>
                  </li>

                  {/* Gate Scanner */}
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center gap-2"
                      to="/gate-scanner"
                    >
                      <FaQrcode style={{ fontSize: "12px" }} />
                      Gate Scanner Terminal
                    </Link>
                  </li>

                  {/* Admin: extra quick links in dropdown */}
                  {isAdmin && (
                    <>
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/admin/users"
                        >
                          Manage Users
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/admin/parking"
                        >
                          Manage Parking
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/admin/bookings"
                        >
                          Manage Bookings
                        </Link>
                      </li>
                    </>
                  )}

                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                  {/* Logout */}
                  <li>
                    <button
                      type="button"
                      className="dropdown-item text-danger"
                      onClick={logoutHandler}
                    >
                      Logout
                    </button>
                  </li>

                </ul>

              </li>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
