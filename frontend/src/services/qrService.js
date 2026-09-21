import api from "./api";

/**
 * =========================================================
 * Frontend QR Service - NextPark AI
 * Handles QR Code generation payloads, ticket downloads,
 * printing, and backend verification requests.
 * =========================================================
 */

/**
 * Format a human-readable Indian date
 * @param {string|Date} date 
 * @returns {string} Formatted date e.g. "27 Aug 2026"
 */
export const formatTicketDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Build the standardized QR payload string
 * Encodes direct verification URL so any normal smartphone camera or scanner can read and open it directly!
 * @param {object} booking - Booking object from API
 * @returns {string} Verification URL string
 */
export const buildQRPayload = (booking) => {
  if (!booking || booking.paymentStatus !== "Paid" || booking.status === "Cancelled") {
    return "";
  }

  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "http://localhost:3000";

  const pin = booking._id
    ? `NPK-${booking._id.slice(-6).toUpperCase()}`
    : "";

  return `${origin}/verify-ticket?id=${booking._id}&pin=${pin}`;
};

/**
 * Render a branded high-resolution PNG ticket canvas and trigger download
 * @param {HTMLCanvasElement} qrCanvas - Source canvas element containing the QR code
 * @param {object} booking - Booking details
 * @param {string} [customFileName] - Optional custom download filename
 * @returns {boolean} Success status
 */
export const downloadQRTicket = (qrCanvas, booking, customFileName) => {
  if (!qrCanvas) {
    console.error("QR Canvas element not found for download");
    return false;
  }

  try {
    const padding = 32;
    const headerH = 80;
    const footerH = 65;

    // Create higher resolution offscreen canvas
    const offscreen = document.createElement("canvas");
    offscreen.width = qrCanvas.width + padding * 2;
    offscreen.height = qrCanvas.height + padding * 2 + headerH + footerH;

    const ctx = offscreen.getContext("2d");

    // 1. Dark Glass Card Background
    const bgGrad = ctx.createLinearGradient(0, 0, offscreen.width, offscreen.height);
    bgGrad.addColorStop(0, "#0a0a1a");
    bgGrad.addColorStop(0.5, "#0d1b2e");
    bgGrad.addColorStop(1, "#071220");
    ctx.fillStyle = bgGrad;

    if (ctx.roundRect) {
      ctx.roundRect(0, 0, offscreen.width, offscreen.height, 24);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, offscreen.width, offscreen.height);
    }

    // 2. Header Brand Strip
    const headerGrad = ctx.createLinearGradient(0, 0, offscreen.width, 0);
    headerGrad.addColorStop(0, "#0d6efd");
    headerGrad.addColorStop(0.6, "#0a58ca");
    headerGrad.addColorStop(1, "#198754");
    ctx.fillStyle = headerGrad;

    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(0, 0, offscreen.width, headerH, [24, 24, 0, 0]);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, offscreen.width, headerH);
    }

    // 3. Header Text & Logo
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("🅿️ NextPark AI", padding, 34);

    ctx.font = "12px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.fillText(
      `${booking?.parking?.name || "Smart Parking"} • Slot ${booking?.slot?.slotNumber || "N/A"}`,
      padding,
      58
    );

    // 4. Status Badge in Header
    const isPaid = booking?.paymentStatus === "Paid";
    const statusText = isPaid ? "✓ PAID" : (booking?.paymentStatus || "PENDING");
    const chipW = 85;
    const chipH = 26;
    const chipX = offscreen.width - chipW - padding;
    const chipY = (headerH - chipH) / 2;

    ctx.fillStyle = isPaid ? "rgba(25, 135, 84, 0.45)" : "rgba(255, 193, 7, 0.35)";
    ctx.strokeStyle = isPaid ? "#6ee7b7" : "#ffc107";
    ctx.lineWidth = 1;

    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(chipX, chipY, chipW, chipH, 13);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(chipX, chipY, chipW, chipH);
    }

    ctx.fillStyle = isPaid ? "#6ee7b7" : "#ffe082";
    ctx.font = "bold 11px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(statusText, chipX + chipW / 2, chipY + 17);
    ctx.textAlign = "left";

    // 5. White Rounded QR Background Frame
    const qrX = padding;
    const qrY = headerH + padding;
    ctx.fillStyle = "#ffffff";

    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(qrX - 6, qrY - 6, qrCanvas.width + 12, qrCanvas.height + 12, 16);
      ctx.fill();
    } else {
      ctx.fillRect(qrX - 6, qrY - 6, qrCanvas.width + 12, qrCanvas.height + 12);
    }

    // 6. Draw QR Code
    ctx.drawImage(qrCanvas, qrX, qrY);

    // 7. Footer Text
    const footerY = headerH + padding * 2 + qrCanvas.height;

    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "bold 13px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `Booking #${booking?._id?.slice(-8).toUpperCase() || "N/A"}  •  ₹${booking?.totalAmount || 0}`,
      offscreen.width / 2,
      footerY + 18
    );

    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.font = "11px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(
      "Scan this QR code at entry / exit gates • nextpark.ai",
      offscreen.width / 2,
      footerY + 38
    );

    // 8. Trigger File Download
    const fileName =
      customFileName ||
      `NextPark-Ticket-${booking?._id?.slice(-8) || "QR"}.png`;

    const link = document.createElement("a");
    link.download = fileName;
    link.href = offscreen.toDataURL("image/png");
    link.click();

    return true;
  } catch (error) {
    console.error("Error generating downloadable ticket:", error);
    return false;
  }
};

/**
 * Trigger clean browser print dialog
 */
export const printQRTicket = () => {
  window.print();
};

/**
 * Fetch server-side generated QR data for a booking (optional API)
 * @param {string} bookingId 
 * @returns {Promise<object>} API response data
 */
export const getBookingQRFromBackend = async (bookingId) => {
  const token = localStorage.getItem("token");
  const response = await api.get(`/bookings/${bookingId}/qr`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Verify a scanned QR payload with the backend
 * @param {string|object} qrData 
 * @returns {Promise<object>} Verification result
 */
export const verifyBookingQR = async (qrData) => {
  const token = localStorage.getItem("token");
  const payload = typeof qrData === "string" ? qrData : JSON.stringify(qrData);

  const response = await api.post(
    "/bookings/verify-qr",
    { qrData: payload },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * Publicly verify ticket by ID or Passcode PIN (works without requiring login)
 * @param {string} idOrPin
 * @returns {Promise<object>} Verification result
 */
export const verifyBookingPublic = async (idOrPin) => {
  const response = await api.get(`/bookings/verify-public/${idOrPin}`);
  return response.data;
};

const qrService = {
  formatTicketDate,
  buildQRPayload,
  downloadQRTicket,
  printQRTicket,
  getBookingQRFromBackend,
  verifyBookingQR,
  verifyBookingPublic,
};

export default qrService;
