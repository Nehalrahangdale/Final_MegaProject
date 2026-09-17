const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

// Load Environment Variables
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

// Database Connection
const connectDB = require("./config/db");
connectDB();

const app = express();

// =======================
// =======================
// CORS & Origins Configuration
// =======================

const defaultOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const configuredOrigins = [...defaultOrigins];
if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(",")
    .map((url) => url.trim().replace(/\/$/, ""))
    .filter(Boolean)
    .forEach((url) => {
      if (!configuredOrigins.includes(url)) {
        configuredOrigins.push(url);
      }
    });
}

const checkOrigin = (origin, callback) => {
  // Allow requests with no origin (like mobile apps, curl, postman)
  if (!origin) return callback(null, true);

  // Exact match with configured origins
  if (configuredOrigins.includes(origin)) {
    return callback(null, true);
  }

  // Allow all Vercel deployment preview and production domains
  if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
    return callback(null, true);
  }

  // In non-production, be permissive for local network testing
  if (process.env.NODE_ENV !== "production") {
    return callback(null, true);
  }

  return callback(null, false);
};

// =======================
// HTTP SERVER
// =======================

const server = http.createServer(app);

// =======================
// Socket.IO
// =======================

const io = new Server(server, {
  cors: {
    origin: checkOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io available inside controllers
app.set("io", io);

// Socket connection
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("joinParking", (parkingId) => {
    socket.join(`parking-${parkingId}`);

    console.log(
      `📍 Socket ${socket.id} joined parking-${parkingId}`
    );
  });

  socket.on("leaveParking", (parkingId) => {
    socket.leave(`parking-${parkingId}`);

    console.log(
      `🚪 Socket ${socket.id} left parking-${parkingId}`
    );
  });

  socket.on("simulateSlotUpdate", (payload) => {
    if (payload && payload.parkingId) {
      io.to(`parking-${payload.parkingId}`).emit("slotUpdated", payload);
      console.log(`⚡ Real-time Simulation Broadcast: Slot ${payload.slot?.slotNumber} -> ${payload.slot?.status}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// =======================
// Middleware
// =======================

app.use(
  cors({
    origin: checkOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =======================
// Routes
// =======================

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const parkingRoutes = require("./routes/parkingRoutes");
const slotRoutes = require("./routes/slotRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const ownerRoutes = require("./routes/ownerRoutes");

// =======================
// API Routes
// =======================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/owner", ownerRoutes);

// =======================
// Home Route
// =======================

app.get("/", (req, res) => {
  res.status(200).send("🚗 Smart Parking Backend Running...");
});

// =======================
// 404 Route
// =======================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// =======================
// Global Error Handler
// =======================

app.use((err, req, res, next) => {
  console.error(
    "Global error handler:",
    err.stack || err.message
  );

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

// =======================
// Server
// =======================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `✅ Server running on http://localhost:${PORT}`
  );

  console.log("🔌 Socket.IO is running");

  // Start background auto-expiry worker
  try {
    const { startBookingExpiryWorker } = require("./services/bookingExpiryService");
    startBookingExpiryWorker(io);
  } catch (workerErr) {
    console.warn("⚠️ Could not start booking expiry worker:", workerErr.message);
  }
});