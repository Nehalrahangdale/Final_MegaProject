import { BrowserRouter, Routes, Route } from "react-router-dom";

// CSS
import "./App.css";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ParkingList from "./pages/ParkingList";
import ParkingDetails from "./pages/ParkingDetails";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

// Dashboard Pages
import UserDashboard from "./pages/UserDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Admin Management Pages
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOwners from "./pages/admin/AdminOwners";
import AdminParking from "./pages/admin/AdminParking";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminPayments from "./pages/admin/AdminPayments";

function App() {
  return (
    <BrowserRouter>
      <div className="App">

        {/* ================= NAVBAR ================= */}

        <Navbar />

        {/* ================= MAIN CONTENT ================= */}

        <main className="main-content">

          <Routes>

            {/* ================= PUBLIC ROUTES ================= */}

            <Route path="/" element={<Home />} />

            <Route path="/about" element={<About />} />

            <Route path="/contact" element={<Contact />} />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            <Route
              path="/parkings"
              element={<ParkingList />}
            />

            <Route
              path="/parking/:id"
              element={<ParkingDetails />}
            />

            {/* ================= PROTECTED ROUTES ================= */}

            <Route
              path="/booking/:id"
              element={
                <PrivateRoute>
                  <Booking />
                </PrivateRoute>
              }
            />

            <Route
              path="/payment"
              element={
                <PrivateRoute>
                  <Payment />
                </PrivateRoute>
              }
            />

            {/* ================= USER DASHBOARD ================= */}

            <Route
              path="/user/dashboard"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <UserDashboard />
                </PrivateRoute>
              }
            />

            {/* ================= OWNER DASHBOARD ================= */}

            <Route
              path="/owner/dashboard"
              element={
                <PrivateRoute allowedRoles={["owner"]}>
                  <OwnerDashboard />
                </PrivateRoute>
              }
            />

            {/* ================= ADMIN ROUTES ================= */}

            {/* Admin Dashboard */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            {/* Manage Users */}
            <Route
              path="/admin/users"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminUsers />
                </PrivateRoute>
              }
            />

            {/* Manage Owners */}
            <Route
              path="/admin/owners"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminOwners />
                </PrivateRoute>
              }
            />

            {/* Manage Parking */}
            <Route
              path="/admin/parking"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminParking />
                </PrivateRoute>
              }
            />

            {/* Manage Bookings */}
            <Route
              path="/admin/bookings"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminBookings />
                </PrivateRoute>
              }
            />

            {/* Manage Payments */}
            <Route
              path="/admin/payments"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminPayments />
                </PrivateRoute>
              }
            />

            {/* ================= UNAUTHORIZED ================= */}

            <Route
              path="/unauthorized"
              element={<Unauthorized />}
            />

            {/* ================= 404 ================= */}

            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>

        </main>

        {/* ================= FOOTER ================= */}

        <Footer />

      </div>
    </BrowserRouter>
  );
}

export default App;