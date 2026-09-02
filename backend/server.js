const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Load Environment Variables (support both backend/.env and current dir .env)
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

// Database Connection
const connectDB = require("./config/db");
connectDB();

const app = express();

// =======================
// Middleware
// =======================

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
  console.error("Global error handler:", err.stack || err.message);

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

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});