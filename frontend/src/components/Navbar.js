import { Link, useNavigate } from "react-router-dom";
import { FaParking, FaUserCircle } from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const logoutHandler = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow">
      <div className="container">

        {/* Logo */}
        <Link className="navbar-brand fw-bold" to="/">
          <FaParking className="me-2 text-warning" />
          Smart Parking
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

        {/* Menu */}
        <div className="collapse navbar-collapse" id="navbarNav">

          <ul className="navbar-nav ms-auto align-items-lg-center">

            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/parkings">
                Parking
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/about">
                About
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/contact">
                Contact
              </Link>
            </li>

            {!token ? (
              <>
                <li className="nav-item ms-lg-3">
                  <Link
                    className="btn btn-outline-light me-lg-2 mt-2 mt-lg-0"
                    to="/login"
                  >
                    Login
                  </Link>
                </li>

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
              <li className="nav-item dropdown ms-lg-3">

                <button
                  className="btn btn-outline-light dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <FaUserCircle className="me-2" />
                  {user?.name || "User"}
                </button>

                <ul className="dropdown-menu dropdown-menu-end">

                  {user?.role === "user" && (
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/user/dashboard"
                      >
                        User Dashboard
                      </Link>
                    </li>
                  )}

                  {user?.role === "owner" && (
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/owner/dashboard"
                      >
                        Owner Dashboard
                      </Link>
                    </li>
                  )}

                  {user?.role === "admin" && (
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/admin/dashboard"
                      >
                        Admin Dashboard
                      </Link>
                    </li>
                  )}

                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                  <li>
                    <button
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