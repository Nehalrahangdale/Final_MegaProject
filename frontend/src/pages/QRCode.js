import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { getBookingById } from "../services/bookingService";
import {
  buildQRPayload,
  formatTicketDate,
  downloadQRTicket,
  printQRTicket,
} from "../services/qrService";
import "./QRCode.css";

// =============================================
// Icon Components (inline SVG)
// =============================================
const Icon = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);

const ICONS = {
  location: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  calendar: "M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z",
  clock: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z",
  slot: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
  rupee: "M11 8h5v2h-5v1h3c1.66 0 3 1.34 3 3s-1.34 3-3 3h-1v2h-2v-2H7v-2h5v-1H9c-1.66 0-3-1.34-3-3s1.34-3 3-3H9V6h2v2zm-2 2v2h2v-2H9zm4 4h2v-2h-2v2z",
  duration: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z",
  download: "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
  print: "M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z",
  back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z",
  qrscan: "M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13 0h-3v2h-2v-2h2v-2h-2v-2h3v2h2v2zm0 4h-2v2h2v-2zm2 0v-2h-2v2h2zm-4-8h-2v2h2v-2z",
};

// =============================================
// QRCode Page
// =============================================
function QRCodePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloaded, setDownloaded] = useState(false);

  const qrRef = useRef(null);

  // Load Booking
  const loadBooking = useCallback(async () => {
    try {
      if (!bookingId) {
        setError("No booking ID provided.");
        setLoading(false);
        return;
      }
      const data = await getBookingById(bookingId);
      setBooking(data.booking);
    } catch (err) {
      console.error("QR Booking Error:", err);
      setError(err.response?.data?.message || "Unable to load booking details.");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  // Download QR Code as PNG using qrService
  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas || !booking) return;

    const success = downloadQRTicket(canvas, booking);
    if (success) {
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    }
  };

  // Print Ticket using qrService
  const handlePrint = () => {
    printQRTicket();
  };

  // Loading
  if (loading) {
    return (
      <div className="qr-loading">
        <div className="qr-loading-spinner" />
        <p>Generating your parking ticket...</p>
      </div>
    );
  }

  // Error
  if (error || !booking) {
    return (
      <div className="qr-error">
        <div className="qr-error-icon">🚫</div>
        <h3>Ticket Not Found</h3>
        <p>{error || "We couldn't load the booking details."}</p>
        <button className="qr-back-btn" onClick={() => navigate("/user/dashboard")}>
          <Icon d={ICONS.back} size={16} />
          Back to Dashboard
        </button>
      </div>
    );
  }

  const qrData = buildQRPayload(booking);

  return (
    <div className="qr-page">
      <div className="qr-grid-bg" />

      {/* Page Header */}
      <div className="qr-header">
        <div className="qr-brand-badge">
          <Icon d={ICONS.qrscan} size={13} />
          E-TICKET
        </div>
        <h1>Parking <span>QR Ticket</span></h1>
        <p>Scan this code at the entry gate to access your slot</p>
      </div>

      {/* Ticket Card */}
      <div className="qr-ticket" id="printable-ticket">

        {/* Gradient Header Strip */}
        <div className="ticket-header-strip">
          <div className="ticket-header-top">
            <div className="ticket-brand">
              <div className="ticket-brand-icon">🅿️</div>
              <div className="ticket-brand-text">
                <h2>NextPark AI</h2>
                <p>SMART PARKING SYSTEM</p>
              </div>
            </div>
            <span className={`ticket-status-chip ${booking.paymentStatus === "Paid" ? "paid" : ""}`}>
              {booking.paymentStatus === "Paid" ? "✓ PAID" : booking.paymentStatus || "PENDING"}
            </span>
          </div>
          <div className="ticket-parking-name">
            <h3>{booking.parking?.name || "Parking Spot"}</h3>
            <p>
              <Icon d={ICONS.location} size={13} />
              {booking.parking?.address || booking.parking?.city || "Location N/A"}
            </p>
          </div>
        </div>

        {/* Tear Line */}
        <div className="ticket-tear">
          <div className="ticket-tear-circle left" />
          <div className="ticket-tear-line" />
          <div className="ticket-tear-circle right" />
        </div>

        {/* QR Code */}
        <div className="ticket-qr-section">
          <div className="qr-frame" ref={qrRef}>
            <div className="qr-corner tl" />
            <div className="qr-corner tr" />
            <div className="qr-corner bl" />
            <div className="qr-corner br" />
            <QRCodeCanvas
              value={qrData}
              size={220}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#0a0a1a"
            />
          </div>
          <p className="qr-scan-label">Scan at entry gate</p>
        </div>

        {/* Details Grid */}
        <div className="ticket-details-grid">
          <div className="ticket-detail-item">
            <div className="detail-label"><Icon d={ICONS.slot} />Slot Number</div>
            <div className="detail-value">{booking.slot?.slotNumber || "N/A"}</div>
          </div>
          <div className="ticket-detail-item highlight">
            <div className="detail-label"><Icon d={ICONS.rupee} />Amount Paid</div>
            <div className="detail-value">₹{booking.totalAmount || 0}</div>
          </div>
          <div className="ticket-detail-item">
            <div className="detail-label"><Icon d={ICONS.calendar} />Booking Date</div>
            <div className="detail-value">{formatTicketDate(booking.bookingDate)}</div>
          </div>
          <div className="ticket-detail-item">
            <div className="detail-label"><Icon d={ICONS.duration} />Duration</div>
            <div className="detail-value">{booking.duration} Hour{booking.duration !== 1 ? "s" : ""}</div>
          </div>
          <div className="ticket-detail-item">
            <div className="detail-label"><Icon d={ICONS.clock} />Entry Time</div>
            <div className="detail-value">{booking.startTime || "N/A"}</div>
          </div>
          <div className="ticket-detail-item">
            <div className="detail-label"><Icon d={ICONS.clock} />Exit Time</div>
            <div className="detail-value">{booking.endTime || "N/A"}</div>
          </div>
        </div>

        {/* Booking ID */}
        <div className="ticket-id-bar">
          <span className="ticket-id-label">Booking ID</span>
          <span className="ticket-id-value">#{booking._id?.toUpperCase()}</span>
        </div>

        {/* Action Buttons */}
        <div className="ticket-actions">
          <button className="btn-download" onClick={handleDownload} id="btn-download-qr">
            {downloaded ? (
              <><Icon d={ICONS.check} size={16} />Downloaded!</>
            ) : (
              <><Icon d={ICONS.download} size={16} />Download QR</>
            )}
          </button>
          <button className="btn-print" onClick={handlePrint} id="btn-print-ticket">
            <Icon d={ICONS.print} size={16} />Print Ticket
          </button>
        </div>

        {/* Back link */}
        <button className="btn-back-dash" onClick={() => navigate("/user/dashboard")} id="btn-back-dashboard">
          <Icon d={ICONS.back} size={14} />
          Back to Dashboard
        </button>

      </div>

      <p className="qr-footer-note">
        🔒 Cryptographically secured ticket · NextPark AI © 2025
      </p>
    </div>
  );
}

export default QRCodePage;