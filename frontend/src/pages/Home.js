import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCar,
  FaParking,
  FaChevronDown,
  FaChevronUp,
  FaStar,
  FaLocationArrow,
} from "react-icons/fa";
import { getAllParking } from "../services/parkingService";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();

  // Search state
  const [searchCity, setSearchCity] = useState("");
  const [searchVehicle, setSearchVehicle] = useState("Car");
  const [searchDate, setSearchDate] = useState("");
  const [searchTime, setSearchTime] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Near Me (Current GPS Location) Search
  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDetectingLocation(false);
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const params = new URLSearchParams();
        params.append("lat", lat);
        params.append("lng", lng);
        params.append("nearMe", "true");
        if (searchVehicle && searchVehicle !== "All") {
          params.append("vehicleType", searchVehicle);
        }
        navigate(`/parkings?${params.toString()}`);
      },
      (err) => {
        setDetectingLocation(false);
        console.error("Geolocation error:", err);
        alert("Could not retrieve your GPS location. Please type your city manually or grant location permission.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Featured parking state
  const [featuredParkings, setFeaturedParkings] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(0);

  // Quick Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [contactStatus, setContactStatus] = useState({ sent: false, loading: false, msg: "" });

  // Load top/featured parking
  useEffect(() => {
    const fetchTopParkings = async () => {
      try {
        setLoadingFeatured(true);
        const data = await getAllParking();
        if (data?.parking && data.parking.length > 0) {
          setFeaturedParkings(data.parking.slice(0, 3));
        }
      } catch (err) {
        console.warn("Could not fetch featured parkings:", err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchTopParkings();
  }, []);

  // Handle Search Submission
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity.trim()) params.append("search", searchCity.trim());
    if (searchVehicle && searchVehicle !== "All") params.append("vehicleType", searchVehicle);
    if (searchDate) params.append("date", searchDate);
    if (searchTime) params.append("time", searchTime);

    navigate(`/parkings?${params.toString()}`);
  };

  // Handle Quick Contact Submission
  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      alert("Please fill in your Name, Email, and Message.");
      return;
    }
    setContactStatus({ sent: false, loading: true, msg: "" });
    setTimeout(() => {
      setContactStatus({
        sent: true,
        loading: false,
        msg: "Thank you! Your message has been received. Our team will contact you shortly.",
      });
      setContactForm({ name: "", email: "", phone: "", message: "" });
    }, 600);
  };

  const faqs = [
    {
      q: "How can I book parking on NextPark AI?",
      a: "Search for your destination city, select an available parking slot from the map or list, choose your booking time slot, and complete the instant payment to receive your digital QR entry ticket.",
    },
    {
      q: "Can I cancel my parking reservation?",
      a: "Yes! You can easily cancel your booking from your User Dashboard before the scheduled booking time for a seamless experience.",
    },
    {
      q: "Which payment methods are supported?",
      a: "We support all major payment options powered by Razorpay, including UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and digital wallets.",
    },
    {
      q: "How does the QR Code entry ticket work?",
      a: "Once your payment is confirmed, a secure digital QR ticket is generated on your dashboard. Simply show or scan the QR code at the parking entry gate.",
    },
  ];

  return (
    <div className="home-wrapper">
      {/* ================= HERO SECTION ================= */}
      <section className="hero">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <span className="badge bg-warning text-dark px-3 py-2 mb-3">
                🚗 Smart Parking Platform
              </span>

              <h1 className="display-3 fw-bold">
                Find & Reserve
                <br />
                Parking
                <span className="text-warning"> Anywhere</span>
              </h1>

              <p className="lead mt-4">
                Book parking slots instantly, make secure online payments, and enjoy a hassle-free
                parking experience with NextPark AI.
              </p>

              <div className="mt-4">
                <Link to="/parkings" className="btn btn-warning btn-lg me-3">
                  Book Parking
                </Link>

                <Link to="/register" className="btn btn-outline-light btn-lg">
                  Create Account
                </Link>
              </div>
            </div>

            <div className="col-lg-6 text-center mt-5 mt-lg-0">
              <img
                src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=900"
                alt="Smart Parking Facility"
                className="img-fluid rounded-4 shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= SEARCH SECTION ================= */}
      <section className="search-section pb-5">
        <div className="container">
          <div className="card shadow-lg border-0 p-4">
            <h2 className="text-center fw-bold mb-4">Search Parking</h2>

            <form onSubmit={handleSearch}>
              <div className="row g-3">
                <div className="col-lg-4 col-md-6">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter City or Area (e.g. Nagpur)"
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary d-flex align-items-center gap-1"
                      onClick={handleNearMe}
                      disabled={detectingLocation}
                      title="Find parking near your current GPS location"
                    >
                      <FaLocationArrow />
                      <span>{detectingLocation ? "Detecting..." : "Near Me"}</span>
                    </button>
                  </div>
                </div>

                <div className="col-lg-2 col-md-6">
                  <select
                    className="form-select"
                    value={searchVehicle}
                    onChange={(e) => setSearchVehicle(e.target.value)}
                  >
                    <option value="All">All Vehicles</option>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Truck">Truck</option>
                  </select>
                </div>

                <div className="col-lg-2 col-md-4">
                  <input
                    type="date"
                    className="form-control"
                    value={searchDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSearchDate(e.target.value)}
                  />
                </div>

                <div className="col-lg-2 col-md-4">
                  <input
                    type="time"
                    className="form-control"
                    value={searchTime}
                    onChange={(e) => setSearchTime(e.target.value)}
                  />
                </div>

                <div className="col-lg-2 col-md-4 d-grid">
                  <button type="submit" className="btn btn-primary d-flex align-items-center justify-content-center">
                    <FaSearch className="me-2" />
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ================= FEATURED PARKING ================= */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="section-title">Featured Parking</h2>
          <p className="section-subtitle">Most Popular Parking Locations</p>

          <div className="row g-4">
            {featuredParkings.length > 0 ? (
              featuredParkings.map((item) => (
                <div className="col-lg-4" key={item._id}>
                  <div className="card parking-card shadow h-100">
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800"
                      }
                      className="card-img-top"
                      alt={item.name}
                      style={{ height: "200px", objectFit: "cover" }}
                    />

                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title fw-bold mb-0">{item.name}</h5>
                        <span className="badge bg-warning text-dark">
                          <FaStar className="me-1" />
                          {item.rating || "4.8"}
                        </span>
                      </div>

                      <p className="text-muted mb-2">
                        <FaMapMarkerAlt className="text-danger me-2" />
                        {item.address ? `${item.address}, ` : ""}
                        {item.city}
                      </p>

                      <p className="mb-2">
                        <FaParking className="text-success me-2" />
                        {item.availableSlots ?? item.totalSlots ?? 0} Slots Available
                      </p>

                      <p className="mb-3">
                        <FaCar className="text-primary me-2" />
                        {item.vehicleType || "Car"} Parking
                      </p>

                      <div className="mt-auto">
                        <h4 className="price text-primary mb-3">₹{item.pricePerHour} / Hour</h4>
                        <Link to={`/parking/${item._id}`} className="btn btn-primary w-100">
                          View Details & Reserve
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : !loadingFeatured ? (
              [1, 2, 3].map((num) => (
                <div className="col-lg-4" key={num}>
                  <div className="card parking-card shadow h-100">
                    <img
                      src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800"
                      className="card-img-top"
                      alt="Parking"
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <div className="card-body">
                      <h5 className="card-title fw-bold">
                        {num === 1 ? "City Mall Prime Parking" : num === 2 ? "Metro Station Plaza" : "Airport Express Parking"}
                      </h5>
                      <p className="text-muted">
                        <FaMapMarkerAlt className="text-danger me-2" />
                        Nagpur, Maharashtra
                      </p>
                      <p>
                        <FaParking className="text-success me-2" />
                        {num * 25 + 40} Slots Available
                      </p>
                      <p>
                        <FaCar className="text-primary me-2" />
                        Car / Bike Parking
                      </p>
                      <h4 className="price text-primary">₹{30 + num * 10} / Hour</h4>
                      <Link to="/parkings" className="btn btn-primary w-100 mt-3">
                        Explore Available Slots
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="py-5">
        <div className="container">
          <h2 className="section-title">Why Choose NextPark AI?</h2>
          <p className="section-subtitle">Smart, Secure & Fast Parking Experience</p>

          <div className="row g-4">
            <div className="col-md-3">
              <div className="feature-card shadow">
                <div className="feature-icon">🚗</div>
                <h4>Easy Booking</h4>
                <p>Reserve your verified parking slot in advance in just a few clicks.</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="feature-card shadow">
                <div className="feature-icon">📍</div>
                <h4>Nearby Parking</h4>
                <p>Find the nearest available parking space with accurate real-time GPS locations.</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="feature-card shadow">
                <div className="feature-icon">💳</div>
                <h4>Secure Payment</h4>
                <p>Pay safely with Razorpay using UPI, Credit/Debit Card or Net Banking.</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="feature-card shadow">
                <div className="feature-icon">🤖</div>
                <h4>AI Recommendation</h4>
                <p>Get the smartest parking slot recommendations based on availability and proximity.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Book Your Parking in 4 Easy Steps</p>

          <div className="row text-center">
            <div className="col-md-3">
              <div className="stats-box">
                <h1>1️⃣</h1>
                <h5 className="mt-3">Search</h5>
                <p>Search parking facilities by city, vehicle type, and preferred time.</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="stats-box">
                <h1>2️⃣</h1>
                <h5 className="mt-3">Select Slot</h5>
                <p>Choose your preferred verified parking slot from the real-time slot layout.</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="stats-box">
                <h1>3️⃣</h1>
                <h5 className="mt-3">Pay Online</h5>
                <p>Complete payment securely using Razorpay UPI, Cards, or Net Banking.</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="stats-box">
                <h1>4️⃣</h1>
                <h5 className="mt-3">Scan & Park</h5>
                <p>Scan your digital QR code ticket at the gate and park stress-free.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATISTICS ================= */}
      <section className="py-5">
        <div className="container">
          <h2 className="section-title">Our Achievements</h2>
          <p className="section-subtitle">Trusted by Thousands of Users Nationwide</p>

          <div className="row g-4">
            <div className="col-md-3">
              <div className="stats-box">
                <h2>500+</h2>
                <p>Parking Locations</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="stats-box">
                <h2>10K+</h2>
                <p>Registered Users</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="stats-box">
                <h2>35K+</h2>
                <p>Successful Bookings</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="stats-box">
                <h2>4.9★</h2>
                <p>Customer Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CUSTOMER REVIEWS ================= */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">Trusted by Thousands of Happy Drivers</p>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card review-card h-100">
                <h4 className="text-warning">⭐⭐⭐⭐⭐</h4>
                <p className="mt-3">
                  Booking was super easy. Payment was secure and I found parking within a minute. The QR ticket worked seamlessly at the gate.
                </p>
                <h5 className="mt-3 fw-bold">Sumit B.</h5>
                <small className="text-muted">Nagpur</small>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card review-card h-100">
                <h4 className="text-warning">⭐⭐⭐⭐⭐</h4>
                <p className="mt-3">
                  Amazing experience. The parking location was accurate and booking confirmation was instant. Will definitely use it daily!
                </p>
                <h5 className="mt-3 fw-bold">Rahul S.</h5>
                <small className="text-muted">Pune</small>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card review-card h-100">
                <h4 className="text-warning">⭐⭐⭐⭐⭐</h4>
                <p className="mt-3">
                  One of the best parking platforms I have used. Clean interface and super reliable slot availability updates.
                </p>
                <h5 className="mt-3 fw-bold">Priya K.</h5>
                <small className="text-muted">Mumbai</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ACCORDION ================= */}
      <section className="py-5">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">Answers to common questions about NextPark AI</p>

          <div className="mt-4 mx-auto" style={{ maxWidth: "800px" }}>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="card mb-3 shadow-sm border-0"
                  style={{ borderRadius: "10px", overflow: "hidden" }}
                >
                  <button
                    type="button"
                    className="btn text-start d-flex justify-content-between align-items-center p-3 fw-bold bg-white"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    style={{ fontSize: "16px", color: "#212529" }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <FaChevronUp className="text-primary" /> : <FaChevronDown className="text-muted" />}
                  </button>
                  {isOpen && (
                    <div className="p-3 pt-0 text-muted bg-white border-top">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= CONTACT SECTION ================= */}
      <section id="contact" className="py-5 bg-light">
        <div className="container">
          <h2 className="section-title">Contact Us</h2>
          <p className="section-subtitle">Have questions? We'd love to hear from you.</p>

          <div className="row">
            <div className="col-lg-6">
              {contactStatus.sent && (
                <div className="alert alert-success shadow-sm mb-3">
                  {contactStatus.msg}
                </div>
              )}

              <form onSubmit={handleContactSubmit}>
                <input
                  className="form-control mb-3"
                  placeholder="Full Name *"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />

                <input
                  type="email"
                  className="form-control mb-3"
                  placeholder="Email Address *"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />

                <input
                  type="tel"
                  className="form-control mb-3"
                  placeholder="Phone Number (Optional)"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                />

                <textarea
                  className="form-control mb-3"
                  rows="4"
                  placeholder="Write your message here... *"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                ></textarea>

                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={contactStatus.loading}
                >
                  {contactStatus.loading ? "Sending Message..." : "Send Message"}
                </button>
              </form>
            </div>

            <div className="col-lg-6 mt-5 mt-lg-0">
              <div className="card contact-card h-100 shadow-sm p-4">
                <h4>📍 NextPark AI Head Office</h4>
                <hr />
                <p>
                  <strong>Address</strong>
                  <br />
                  Nagpur, Maharashtra, India
                </p>
                <p>
                  <strong>Email</strong>
                  <br />
                  support@nextpark.com
                </p>
                <p>
                  <strong>Phone</strong>
                  <br />
                  +91 9876543210
                </p>
                <p>
                  <strong>Working Hours</strong>
                  <br />
                  24 × 7 Dedicated Customer Support
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= GOOGLE MAP ================= */}
      <section className="py-5 bg-white">
        <div className="container">
          <h2 className="section-title">Find Us On Map</h2>
          <p className="section-subtitle">Locate our smart parking network across the city.</p>

          <div className="ratio ratio-21x9 rounded shadow overflow-hidden">
            <iframe
              src="https://www.google.com/maps?q=Nagpur&output=embed"
              title="Google Map"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="final-cta text-white">
        <div className="container text-center">
          <h2 className="display-5 fw-bold">Ready to Book Your Parking?</h2>
          <p className="lead mt-3">
            Save time and enjoy a stress-free parking experience with NextPark AI.
          </p>
          <div className="mt-4">
            <Link to="/parkings" className="btn btn-warning btn-lg me-3">
              Explore Parking
            </Link>
            <Link to="/register" className="btn btn-outline-light btn-lg">
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;