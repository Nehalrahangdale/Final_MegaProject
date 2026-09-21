import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaQrcode,
  FaCamera,
  FaKeyboard,
  FaCheckCircle,
  FaTimesCircle,
  FaBolt,
  FaArrowRight,
  FaHistory,
} from "react-icons/fa";
import { verifyBookingPublic } from "../services/qrService";
import "../styles/GateScanner.css";

function GateScanner() {
  const [activeTab, setActiveTab] = useState("camera"); // "camera" | "pin"
  const [cameraActive, setCameraActive] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [barrierState, setBarrierState] = useState("CLOSED"); // "CLOSED" | "OPENING" | "OPEN"

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Process a detected QR code string or PIN
  const handleProcessCode = useCallback(async (code) => {
    if (!code || loading) return;

    try {
      setLoading(true);
      setErrorMsg(null);

      // Clean string
      const raw = String(code).trim();
      let target = raw;

      // If URL, extract id or pin
      if (raw.includes("verify-ticket")) {
        try {
          const u = new URL(raw.startsWith("http") ? raw : `http://localhost${raw}`);
          target = u.searchParams.get("id") || u.searchParams.get("bookingId") || u.searchParams.get("pin") || raw;
        } catch (e) {
          // ignore
        }
      }

      const res = await verifyBookingPublic(target);

      if (res && res.success) {
        setScanResult(res);

        // Add to history
        setScanHistory((prev) => [
          {
            id: res.booking?.id || target,
            time: new Date().toLocaleTimeString(),
            valid: res.isValid,
            slot: res.booking?.slotNumber,
            user: res.booking?.customerName,
          },
          ...prev.slice(0, 4),
        ]);

        if (res.isValid) {
          setBarrierState("OPENING");
          setTimeout(() => setBarrierState("OPEN"), 800);
          setTimeout(() => setBarrierState("CLOSED"), 4500);
        }
      } else {
        setErrorMsg(res?.message || "Invalid ticket data");
        setScanResult(res);
      }
    } catch (err) {
      console.error("Scan Verify Error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Ticket verification failed.";
      setErrorMsg(msg);
      if (err.response?.data) {
        setScanResult(err.response.data);
      }
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Start Camera
  const startCamera = async () => {
    try {
      setErrorMsg(null);
      const constraints = {
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);

        // Native BarcodeDetector if available
        if ("BarcodeDetector" in window) {
          const barcodeDetector = new window.BarcodeDetector({ formats: ["qr_code"] });

          scanIntervalRef.current = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes && barcodes.length > 0) {
                  const detectedValue = barcodes[0].rawValue;
                  if (detectedValue) {
                    stopCamera();
                    handleProcessCode(detectedValue);
                  }
                }
              } catch (e) {
                // scanning frame error ignore
              }
            }
          }, 350);
        }
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setErrorMsg(
        "Camera access denied or unavailable. You can use the manual Passcode PIN tab below."
      );
      setCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleManualPinSubmit = (e) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    handleProcessCode(pinInput.trim());
  };

  const isValid = scanResult?.isValid === true;
  const booking = scanResult?.booking;

  return (
    <div className="gate-scanner-wrapper">
      <div className="gate-scanner-container">
        <div className="scanner-terminal-card">
          {/* Terminal Header */}
          <div className="scanner-terminal-header">
            <div className="scanner-terminal-title">
              <div className="scanner-terminal-icon">
                <FaQrcode />
              </div>
              <div>
                <h3>Gate Entry Scanner</h3>
                <p>Scan driver's QR ticket or verify passcode</p>
              </div>
            </div>

            <div className="scanner-live-pill">
              <span className="scanner-live-dot" />
              <span>SCANNER READY</span>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="scanner-mode-tabs">
            <button
              type="button"
              className={`scanner-tab-btn ${activeTab === "camera" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("camera");
                stopCamera();
              }}
            >
              <FaCamera /> Scan with Camera
            </button>
            <button
              type="button"
              className={`scanner-tab-btn ${activeTab === "pin" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("pin");
                stopCamera();
              }}
            >
              <FaKeyboard /> Enter Passcode PIN
            </button>
          </div>

          {/* Tab 1: Live Camera View */}
          {activeTab === "camera" && (
            <div className="text-center">
              <div className="scanner-camera-box">
                {cameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      className="scanner-video"
                      playsInline
                      muted
                    />
                    <div className="scanner-viewfinder-overlay">
                      <div className="scanner-target-reticle">
                        <div className="scanner-scan-line" />
                        <div className="scanner-reticle-corner tl" />
                        <div className="scanner-reticle-corner tr" />
                        <div className="scanner-reticle-corner bl" />
                        <div className="scanner-reticle-corner br" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center h-100 p-3 text-muted">
                    <FaCamera size={44} className="mb-3 opacity-50" />
                    <p className="small mb-0">Point camera at customer's phone or paper pass.</p>
                    <small className="opacity-75">Click Start Camera to begin</small>
                  </div>
                )}
              </div>

              <div className="scanner-cam-controls">
                {cameraActive ? (
                  <button
                    type="button"
                    className="scanner-cam-btn stop"
                    onClick={stopCamera}
                  >
                    Pause Scanner
                  </button>
                ) : (
                  <button
                    type="button"
                    className="scanner-cam-btn"
                    onClick={startCamera}
                  >
                    <FaCamera /> Start Camera
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Manual Passcode PIN */}
          {activeTab === "pin" && (
            <div className="scanner-pin-box">
              <p className="text-muted small mb-3">
                Enter the 6-character Passcode PIN shown on customer's ticket:
              </p>
              <form onSubmit={handleManualPinSubmit}>
                <input
                  type="text"
                  className="scanner-pin-input"
                  placeholder="NPK-XXXXXX"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.toUpperCase())}
                  maxLength={24}
                  autoFocus
                />
                <button
                  type="submit"
                  className="scanner-pin-submit"
                  disabled={!pinInput.trim() || loading}
                >
                  {loading ? "Checking..." : "Verify Entry"}
                </button>
              </form>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mx-4 mb-3 alert alert-danger border-0 d-flex justify-content-between align-items-center rounded-3">
              <span>⚠️ {errorMsg}</span>
              <button
                type="button"
                className="btn-close"
                onClick={() => setErrorMsg(null)}
              />
            </div>
          )}

          {/* Scan Result Hero Card */}
          {scanResult && (
            <div className={`scanner-result-box ${isValid ? "valid" : "invalid"}`}>
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2">
                  {isValid ? (
                    <FaCheckCircle className="text-success fs-4" />
                  ) : (
                    <FaTimesCircle className="text-danger fs-4" />
                  )}
                  <div>
                    <h5 className="mb-0 fw-bold" style={{ color: isValid ? "#34d399" : "#f87171" }}>
                      {isValid ? "✓ Entry Approved · Valid Pass" : "Access Denied"}
                    </h5>
                    <small className="text-muted">
                      {scanResult.message || (isValid ? "Vehicle authorized for entry" : "Not authorized")}
                    </small>
                  </div>
                </div>

                {/* Gate Barrier Status Pill */}
                <div className="scanner-live-pill" style={{ background: isValid ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)", borderColor: isValid ? "#10b981" : "#ef4444" }}>
                  <FaBolt />
                  <span>
                    GATE: {barrierState === "OPENING" || barrierState === "OPEN" ? "OPEN 🟢" : "READY"}
                  </span>
                </div>
              </div>

              {booking && (
                <div className="row g-2 text-start pt-2 border-top border-secondary border-opacity-25">
                  <div className="col-sm-6">
                    <small className="text-muted d-block">Facility</small>
                    <strong className="text-light">{booking.parkingName}</strong>
                  </div>
                  <div className="col-sm-3">
                    <small className="text-muted d-block">Assigned Bay</small>
                    <strong className="text-primary fs-6">Bay {booking.slotNumber}</strong>
                  </div>
                  <div className="col-sm-3">
                    <small className="text-muted d-block">Payment</small>
                    <strong className={booking.paymentStatus === "Paid" ? "text-success" : "text-warning"}>
                      {booking.paymentStatus === "Paid" ? "PAID" : "PENDING"} (₹{booking.totalAmount})
                    </strong>
                  </div>
                  <div className="col-sm-6">
                    <small className="text-muted d-block">Driver / Phone</small>
                    <span className="text-light">{booking.customerName} {booking.customerPhone !== "N/A" ? `• ${booking.customerPhone}` : ""}</span>
                  </div>
                  <div className="col-sm-6">
                    <small className="text-muted d-block">Entry Window</small>
                    <span className="text-light">{booking.startTime} - {booking.endTime}</span>
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-end gap-2 mt-3">
                <Link
                  to={`/verify-ticket?id=${booking?.id || pinInput}`}
                  className="btn btn-sm btn-outline-info"
                  style={{ borderRadius: "8px", fontSize: "12px", fontWeight: "600" }}
                >
                  View Full Pass Details <FaArrowRight className="ms-1" />
                </Link>
              </div>
            </div>
          )}

          {/* Recent Scans Strip */}
          {scanHistory.length > 0 && (
            <div className="px-4 pb-4">
              <div className="d-flex align-items-center gap-2 mb-2 text-muted small fw-bold">
                <FaHistory /> Recent Gate Logs
              </div>
              <div className="d-flex flex-column gap-2">
                {scanHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-2 d-flex align-items-center justify-content-between"
                    style={{ background: "rgba(30, 41, 59, 0.4)", fontSize: "12px" }}
                  >
                    <span>
                      {item.valid ? "🟢" : "🔴"} <strong>{item.slot ? `Bay ${item.slot}` : "Passcode"}</strong>
                      <span className="text-muted ms-2">({item.user || item.id?.slice(-6)})</span>
                    </span>
                    <span className="text-muted">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GateScanner;
