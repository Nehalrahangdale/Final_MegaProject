import React from "react";

function Loader({ message = "Loading...", size = "md" }) {
  const spinnerClass =
    size === "sm"
      ? "spinner-border-sm"
      : size === "lg"
      ? "spinner-border"
      : "spinner-border";

  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 my-3">
      <div
        className={`spinner-border text-primary ${spinnerClass}`}
        role="status"
        style={size === "lg" ? { width: "3.5rem", height: "3.5rem" } : {}}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && (
        <p className="mt-3 text-muted fw-semibold mb-0" style={{ letterSpacing: "0.5px" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default Loader;
