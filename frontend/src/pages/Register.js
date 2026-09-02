import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import NextParkLogo from "../components/NextParkLogo";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user",
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

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      };

      const data = await registerUser(payload);

      alert(data.message);

      navigate("/login");

    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed");
    }

    setLoading(false);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">

        <div className="col-md-6">

          <div className="card shadow-lg border-0 p-4">

            <div className="text-center mb-3">
              <NextParkLogo variant="compact" height={36} theme="light" animated={true} />
            </div>

            <h2 className="text-center mb-4">
              📝 Create Account
            </h2>

            <form onSubmit={handleSubmit}>

              <div className="mb-3">
                <label>Full Name</label>

                <input
                  type="text"
                  className="form-control"
                  name="name"
                  placeholder="Enter Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label>Email</label>

                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label>Phone</label>

                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  placeholder="Enter Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label>Password</label>

                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  name="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label>Register As</label>
                <select
                  className="form-control"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="user">User</option>
                  <option value="owner">Parking Owner</option>
                </select>
              </div>

              <div className="mb-3">
                <label>Confirm Password</label>

                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  onChange={() => setShowPassword(!showPassword)}
                />

                <label className="form-check-label">
                  Show Password
                </label>
              </div>

              <button
                className="btn btn-success w-100"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Register"}
              </button>

            </form>

            <p className="text-center mt-3">
              Already have an account?{" "}
              <Link to="/login">
                Login
              </Link>
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Register;