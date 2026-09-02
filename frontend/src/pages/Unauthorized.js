import { useNavigate } from "react-router-dom";
import { FaLock, FaHome, FaArrowLeft } from "react-icons/fa";
import "../styles/Unauthorized.css";

function Unauthorized() {
  const navigate = useNavigate();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const getDashboardPath = () => {
    if (user?.role === "owner") return "/owner/dashboard";
    if (user?.role === "admin") return "/admin/dashboard";
    return "/user/dashboard";
  };

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-card">

        {/* Icon */}
        <div className="unauth-icon-wrapper">
          <div className="unauth-icon">
            <FaLock />
          </div>
          <div className="unauth-glow" />
        </div>

        {/* Text */}
        <div className="unauth-code">403</div>

        <h1>Access Denied</h1>

        <p>
          Aapke paas is page ko dekhne ki permission nahi hai.
          <br />
          Ye page sirf <strong>Admin</strong> ke liye available hai.
        </p>

        {/* Buttons */}
        <div className="unauth-actions">

          <button
            className="unauth-btn primary"
            onClick={() => navigate(getDashboardPath())}
          >
            <FaHome />
            Apna Dashboard
          </button>

          <button
            className="unauth-btn secondary"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
            Wapas Jaao
          </button>

        </div>

      </div>
    </div>
  );
}

export default Unauthorized;
