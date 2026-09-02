import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaParking, FaEnvelope, FaExclamationTriangle } from "react-icons/fa";

function NotFound() {
  return (
    <div
      className="d-flex align-items-center justify-content-center py-5"
      style={{ minHeight: "75vh", background: "linear-gradient(135deg, #0b0f19 0%, #1a2332 100%)", color: "#fff" }}
    >
      <div className="container text-center py-4">
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 shadow-lg"
          style={{
            width: "100px",
            height: "100px",
            background: "rgba(255, 193, 7, 0.15)",
            border: "2px solid rgba(255, 193, 7, 0.4)",
            color: "#ffc107",
          }}
        >
          <FaExclamationTriangle size={48} />
        </div>

        <h1
          className="display-1 fw-bold mb-2"
          style={{
            letterSpacing: "4px",
            background: "linear-gradient(135deg, #ffc107, #ff9800)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </h1>

        <h2 className="fw-bold mb-3">Page Not Found</h2>

        <p className="text-muted mx-auto mb-4 lead" style={{ maxWidth: "520px" }}>
          Oops! The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>

        <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
          <Link
            to="/"
            className="btn btn-warning btn-lg px-4 d-inline-flex align-items-center gap-2 fw-semibold"
          >
            <FaHome /> Go to Home
          </Link>

          <Link
            to="/parkings"
            className="btn btn-outline-light btn-lg px-4 d-inline-flex align-items-center gap-2"
          >
            <FaParking /> Find Parking
          </Link>

          <Link
            to="/contact"
            className="btn btn-outline-secondary btn-lg px-4 d-inline-flex align-items-center gap-2"
          >
            <FaEnvelope /> Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;