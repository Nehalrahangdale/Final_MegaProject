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

// Dashboard Pages
import UserDashboard from "./pages/UserDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <div className="App">

        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="main-content">

          <Routes>

            {/* ================= PUBLIC ROUTES ================= */}

            <Route path="/" element={<Home />} />

            <Route path="/about" element={<About />} />

            <Route path="/contact" element={<Contact />} />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            <Route path="/parkings" element={<ParkingList />} />

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

            <Route
              path="/user/dashboard"
              element={
                <PrivateRoute>
                  <UserDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/owner/dashboard"
              element={
                <PrivateRoute>
                  <OwnerDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            {/* ================= 404 ================= */}

            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>

        </main>

        {/* Footer */}
        <Footer />

      </div>
    </BrowserRouter>
  );
}

export default App;