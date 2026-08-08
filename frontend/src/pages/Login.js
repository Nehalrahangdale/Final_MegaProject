import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const data = await loginUser(formData);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("✅ Login Successful");

      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "owner") {
        navigate("/owner/dashboard");
      } else {
        navigate("/user/dashboard");
      }

    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    }

    setLoading(false);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">

        <div className="col-md-5">

          <div className="card shadow-lg border-0 p-4">

            <h2 className="text-center mb-4">
              🔐 Login
            </h2>

            <form onSubmit={handleSubmit}>

              <div className="mb-3">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label>Password</label>

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-control"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <div className="form-check mt-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    onChange={() => setShowPassword(!showPassword)}
                  />

                  <label className="form-check-label">
                    Show Password
                  </label>
                </div>

              </div>

              <button
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

            </form>

            <p className="text-center mt-3">
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