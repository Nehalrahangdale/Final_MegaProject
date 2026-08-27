const QRCode = require("qrcode");
const crypto = require("crypto");

/**
 * =========================================================
 * QR Service - NextPark AI
 * Generates and validates QR codes for Smart Parking e-Tickets
 * =========================================================
 */

/**
 * Generate standard QR code as a base64 Data URL (image/png)
 * @param {string|object} data - String or object payload to encode
 * @param {object} customOptions - Optional QR code rendering options
 * @returns {Promise<string>} Base64 Data URL
 */
const generateQRCodeDataURL = async (data, customOptions = {}) => {
  try {
    const textData = typeof data === "object" ? JSON.stringify(data) : String(data);

    const defaultOptions = {
      errorCorrectionLevel: "H", // High error correction (30% recovery)
      type: "image/png",
      quality: 0.95,
      margin: 2,
      width: 300,
      color: {
        dark: "#0a0a1a",   // Dark brand color for modules
        light: "#ffffff",  // Clean white background
      },
      ...customOptions,
    };

    const dataUrl = await QRCode.toDataURL(textData, defaultOptions);
    return dataUrl;
  } catch (error) {
    console.error("QR Code DataURL Generation Error:", error);
    throw new Error(`Failed to generate QR Code Data URL: ${error.message}`);
  }
};

/**
 * Generate QR code as a binary Buffer (useful for attachments/emails)
 * @param {string|object} data - Data to encode
 * @param {object} customOptions - Optional QR rendering options
 * @returns {Promise<Buffer>} Binary PNG Buffer
 */
const generateQRCodeBuffer = async (data, customOptions = {}) => {
  try {
    const textData = typeof data === "object" ? JSON.stringify(data) : String(data);

    const defaultOptions = {
      errorCorrectionLevel: "H",
      type: "png",
      margin: 2,
      width: 300,
      color: {
        dark: "#0a0a1a",
        light: "#ffffff",
      },
      ...customOptions,
    };

    const buffer = await QRCode.toBuffer(textData, defaultOptions);
    return buffer;
  } catch (error) {
    console.error("QR Code Buffer Generation Error:", error);
    throw new Error(`Failed to generate QR Code Buffer: ${error.message}`);
  }
};

/**
 * Create a secure signature hash for the booking ticket
 * @param {string} bookingId 
 * @param {string} userId 
 * @param {string} slotNumber 
 * @returns {string} HMAC SHA256 hex string
 */
const createTicketSignature = (bookingId, userId, slotNumber) => {
  const secret = process.env.JWT_SECRET || "nextpark_qr_secret_key";
  return crypto
    .createHmac("sha256", secret)
    .update(`${bookingId}-${userId}-${slotNumber}`)
    .digest("hex")
    .substring(0, 16);
};

/**
 * Format a structured payload object for a booking
 * @param {object} booking - Mongoose booking document (populated or raw)
 * @returns {object} Standardized JSON payload object
 */
const generateBookingQRPayload = (booking) => {
  if (!booking || !booking._id) {
    throw new Error("Invalid booking data provided for QR payload");
  }

  const bookingId = booking._id.toString();
  const userId = booking.user?._id?.toString() || booking.user?.toString() || "N/A";
  const slotNum = booking.slot?.slotNumber || booking.slotNumber || "N/A";
  const parkingName = booking.parking?.name || "NextPark Facility";
  const city = booking.parking?.city || "N/A";

  const signature = createTicketSignature(bookingId, userId, slotNum);

  return {
    app: "NextPark AI",
    version: "1.0",
    bookingId: bookingId,
    user: booking.user?.name || "Customer",
    parking: parkingName,
    city: city,
    slot: slotNum,
    vehicleType: booking.slot?.vehicleType || "Car",
    date: booking.bookingDate
      ? new Date(booking.bookingDate).toISOString().slice(0, 10)
      : "N/A",
    startTime: booking.startTime || "N/A",
    endTime: booking.endTime || "N/A",
    duration: `${booking.duration || 1} Hour(s)`,
    totalAmount: `INR ${booking.totalAmount || 0}`,
    paymentStatus: booking.paymentStatus || "Pending",
    bookingStatus: booking.status || "Booked",
    issuedAt: new Date().toISOString(),
    signature: signature,
    verifyUrl: `http://localhost:5000/api/bookings/verify-qr?id=${bookingId}&sig=${signature}`,
  };
};

/**
 * High-level helper: Generates both payload and QR Data URL for a booking
 * @param {object} booking - Booking document
 * @param {object} qrOptions - Custom QR options
 * @returns {Promise<{ payload: object, qrCodeDataUrl: string }>}
 */
const generateBookingQR = async (booking, qrOptions = {}) => {
  const payload = generateBookingQRPayload(booking);
  const qrCodeDataUrl = await generateQRCodeDataURL(payload, qrOptions);

  return {
    payload,
    qrCodeDataUrl,
  };
};

/**
 * Verify scanned QR payload string or object
 * @param {string|object} qrData - Scanned data from QR code
 * @returns {object} Verification result { isValid, bookingId, message }
 */
const verifyQRPayload = (qrData) => {
  try {
    const payload = typeof qrData === "string" ? JSON.parse(qrData) : qrData;

    if (!payload || payload.app !== "NextPark AI" || !payload.bookingId) {
      return {
        isValid: false,
        message: "Invalid ticket format or unrecognized application",
      };
    }

    return {
      isValid: true,
      bookingId: payload.bookingId,
      signature: payload.signature,
      payload: payload,
      message: "QR Ticket payload successfully decoded",
    };
  } catch (err) {
    return {
      isValid: false,
      message: "Corrupt or unparseable QR code data",
    };
  }
};

module.exports = {
  generateQRCodeDataURL,
  generateQRCodeBuffer,
  generateBookingQRPayload,
  generateBookingQR,
  verifyQRPayload,
  createTicketSignature,
};
