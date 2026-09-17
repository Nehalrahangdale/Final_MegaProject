import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { loginUser } from "../services/authService";
import NextParkLogo from "../components/NextParkLogo";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSessionExpired = new URLSearchParams(location.search).get("sessionExpired") === "true";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // =====================================
  // Handle Input
  // =====================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================
  // Login
  // =====================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = await loginUser(formData);

      // Save authentication data
      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // =================================
      // Role Based Redirect
      // =================================

      if (data.user?.role === "admin") {
        navigate("/admin/dashboard");
      } else if (
        data.user?.role === "owner"
      ) {
        navigate("/owner/dashboard");
      } else {
        navigate("/user/dashboard");
      }

    } catch (error) {
      console.error(
        "Login Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">

      <div className="row justify-content-center">

        <div className="col-md-5">

          <div className="card shadow-lg border-0 p-4">

            {/* Brand Logo Header */}
            <div className="text-center mb-3">
              <NextParkLogo variant="compact" height={36} theme="light" animated={true} />
            </div>

            <h2 className="text-center mb-4">
              🔐 Login
            </h2>

            {/* Session Expired Banner */}
            {isSessionExpired && (
              <div
                className="alert alert-warning d-flex align-items-center mb-4 py-2 px-3 shadow-sm border-0"
                style={{ borderRadius: "10px", fontSize: "14px" }}
                role="alert"
              >
                <span>⚠️ Your session has expired. Please log in again to continue.</span>
              </div>
            )}

            {/* Form */}

            <form onSubmit={handleSubmit}>

              {/* Email */}

              <div className="mb-3">

                <label
                  className="form-label"
                  htmlFor="email"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* Password */}

              <div className="mb-3">

                <label
                  className="form-label"
                  htmlFor="password"
                >
                  Password
                </label>

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  className="form-control"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                {/* Show Password */}

                <div className="form-check mt-2">

                  <input
                    id="showPassword"
                    type="checkbox"
                    className="form-check-input"
                    checked={showPassword}
                    onChange={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  />

                  <label
                    className="form-check-label"
                    htmlFor="showPassword"
                  >
                    Show Password
                  </label>

                </div>

              </div>

              {/* Login Button */}

              <button
                type="submit"
                className="btn btn-success w-100"
                disabled={loading}
              >
                {loading
                  ? "Logging in..."
                  : "Login"}
              </button>

            </form>

            {/* Register */}

            <p className="text-center mt-3 mb-0">

              Don't have an account?{" "}

              <Link to="/register">
                Register
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;