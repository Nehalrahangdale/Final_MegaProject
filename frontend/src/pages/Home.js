import { Link } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCar,
  FaParking,
} from "react-icons/fa";

function Home() {
  return (
    <>
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
                <span className="text-warning">
                  {" "}Anywhere
                </span>
              </h1>

              <p className="lead mt-4">
                Book parking slots instantly, make secure online
                payments, and enjoy a hassle-free parking experience
                with NextPark AI.
              </p>

              <div className="mt-4">

                <Link
                  to="/parkings"
                  className="btn btn-warning btn-lg me-3"
                >
                  Book Parking
                </Link>

                <Link
                  to="/register"
                  className="btn btn-outline-light btn-lg"
                >
                  Create Account
                </Link>

              </div>

            </div>

            <div className="col-lg-6 text-center mt-5 mt-lg-0">

              <img
                src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=900"
                alt="Parking"
                className="img-fluid rounded-4 shadow-lg"
              />

            </div>

          </div>

        </div>
      </section>

      {/* ================= SEARCH SECTION ================= */}

      <section className="py-5 bg-white">

        <div className="container">

          <div className="card shadow-lg border-0 p-4">

            <h2 className="text-center fw-bold mb-4">
              Search Parking
            </h2>

            <div className="row g-3">

              <div className="col-md-3">

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter City"
                />

              </div>

              <div className="col-md-3">

                <select className="form-select">

                  <option>Vehicle Type</option>

                  <option>Bike</option>

                  <option>Car</option>

                  <option>Truck</option>

                </select>

              </div>

              <div className="col-md-2">

                <input
                  type="date"
                  className="form-control"
                />

              </div>

              <div className="col-md-2">

                <input
                  type="time"
                  className="form-control"
                />

              </div>

              <div className="col-md-2 d-grid">

                <button className="btn btn-primary">

                  <FaSearch className="me-2" />

                  Search

                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= FEATURED PARKING ================= */}

      <section className="py-5 bg-light">

        <div className="container">

          <h2 className="section-title">
            Featured Parking
          </h2>

          <p className="section-subtitle">
            Most Popular Parking Locations
          </p>

          <div className="row g-4">

            {[1, 2, 3].map((item) => (

              <div className="col-lg-4" key={item}>

                <div className="card parking-card shadow">

                  <img
                    src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800"
                    className="card-img-top"
                    alt="Parking"
                  />

                  <div className="card-body">

                    <h5 className="card-title">
                      City Mall Parking
                    </h5>

                    <p>

                      <FaMapMarkerAlt className="text-danger me-2" />

                      Nagpur

                    </p>

                    <p>

                      <FaParking className="text-success me-2" />

                      120 Slots Available

                    </p>

                    <p>

                      <FaCar className="text-primary me-2" />

                      Car Parking

                    </p>

                    <h4 className="price">
                      ₹50 / Hour
                    </h4>

                    <Link
                      to="/parkings"
                      className="btn btn-primary w-100 mt-3"
                    >
                      View Details
                    </Link>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ================= WHY CHOOSE US ================= */}

      <section className="py-5">

  <div className="container">

    <h2 className="section-title">
      Why Choose NextPark AI?
    </h2>

    <p className="section-subtitle">
      Smart, Secure & Fast Parking Experience
    </p>

    <div className="row g-4">

      <div className="col-md-3">

        <div className="feature-card shadow">

          <div className="feature-icon">
            🚗
          </div>

          <h4>Easy Booking</h4>

          <p>
            Reserve your parking slot in just a few clicks.
          </p>

        </div>

      </div>

      <div className="col-md-3">

        <div className="feature-card shadow">

          <div className="feature-icon">
            📍
          </div>

          <h4>Nearby Parking</h4>

          <p>
            Find the nearest available parking instantly.
          </p>

        </div>

      </div>

      <div className="col-md-3">

        <div className="feature-card shadow">

          <div className="feature-icon">
            💳
          </div>

          <h4>Secure Payment</h4>

          <p>
            Pay safely with Razorpay using UPI, Card or Net Banking.
          </p>

        </div>

      </div>

      <div className="col-md-3">

        <div className="feature-card shadow">

          <div className="feature-icon">
            🤖
          </div>

          <h4>AI Recommendation</h4>

          <p>
            Get the best parking suggestions using AI.
          </p>

        </div>

      </div>

    </div>

  </div>

</section>

{/* ================= HOW IT WORKS ================= */}

<section className="py-5 bg-light">

  <div className="container">

    <h2 className="section-title">
      How It Works
    </h2>

    <p className="section-subtitle">
      Book Your Parking in 4 Easy Steps
    </p>

    <div className="row text-center">

      <div className="col-md-3">

        <div className="stats-box">

          <h1>1️⃣</h1>

          <h5 className="mt-3">
            Search
          </h5>

          <p>
            Search parking by city and vehicle type.
          </p>

        </div>

      </div>

      <div className="col-md-3">

        <div className="stats-box">

          <h1>2️⃣</h1>

          <h5 className="mt-3">
            Select Slot
          </h5>

          <p>
            Choose your preferred parking slot.
          </p>

        </div>

      </div>

      <div className="col-md-3">

        <div className="stats-box">

          <h1>3️⃣</h1>

          <h5 className="mt-3">
            Pay Online
          </h5>

          <p>
            Complete payment securely using Razorpay.
          </p>

        </div>

      </div>

      <div className="col-md-3">

        <div className="stats-box">

          <h1>4️⃣</h1>

          <h5 className="mt-3">
            Park
          </h5>

          <p>
            Enjoy a seamless parking experience.
          </p>

        </div>

      </div>

    </div>

  </div>

</section>

{/* ================= STATISTICS ================= */}

<section className="py-5">

  <div className="container">

    <h2 className="section-title">
      Our Achievements
    </h2>

    <p className="section-subtitle">
      Trusted by Thousands of Users
    </p>

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

    <h2 className="section-title">
      What Our Customers Say
    </h2>

    <p className="section-subtitle">
      Trusted by Thousands of Happy Users
    </p>

    <div className="row g-4">

      <div className="col-md-4">

        <div className="card shadow p-4 h-100">

          <h4 className="text-warning">
            ⭐⭐⭐⭐⭐
          </h4>

          <p className="mt-3">
            Booking was super easy. Payment was secure and I
            found parking within a minute.
          </p>

          <h5 className="mt-3">
            Sumit B.
          </h5>

          <small>Nagpur</small>

        </div>

      </div>

      <div className="col-md-4">

        <div className="card shadow p-4 h-100">

          <h4 className="text-warning">
            ⭐⭐⭐⭐⭐
          </h4>

          <p className="mt-3">
            Amazing experience. The parking location was accurate
            and booking confirmation was instant.
          </p>

          <h5 className="mt-3">
            Rahul S.
          </h5>

          <small>Pune</small>

        </div>

      </div>

      <div className="col-md-4">

        <div className="card shadow p-4 h-100">

          <h4 className="text-warning">
            ⭐⭐⭐⭐⭐
          </h4>

          <p className="mt-3">
            One of the best parking platforms I have used.
            Highly recommended.
          </p>

          <h5 className="mt-3">
            Priya K.
          </h5>

          <small>Mumbai</small>

        </div>

      </div>

    </div>

  </div>

</section>

{/* ================= FAQ ================= */}

<section className="py-5">

<div className="container">

<h2 className="section-title">
Frequently Asked Questions
</h2>

<div className="accordion mt-5">

<div className="accordion-item">

<h2 className="accordion-header">

<button
className="accordion-button"
data-bs-toggle="collapse"
data-bs-target="#faq1">

How can I book parking?

</button>

</h2>

<div
id="faq1"
className="accordion-collapse collapse show">

<div className="accordion-body">

Search parking, choose a slot, make payment
and your booking is confirmed instantly.

</div>

</div>

</div>

<div className="accordion-item">

<h2 className="accordion-header">

<button
className="accordion-button collapsed"
data-bs-toggle="collapse"
data-bs-target="#faq2">

Can I cancel my booking?

</button>

</h2>

<div
id="faq2"
className="accordion-collapse collapse">

<div className="accordion-body">

Yes. You can cancel your booking before
the scheduled start time.

</div>

</div>

</div>

<div className="accordion-item">

<h2 className="accordion-header">

<button
className="accordion-button collapsed"
data-bs-toggle="collapse"
data-bs-target="#faq3">

Which payment methods are supported?

</button>

</h2>

<div
id="faq3"
className="accordion-collapse collapse">

<div className="accordion-body">

UPI, Credit Card, Debit Card,
Net Banking and Wallets using Razorpay.

</div>

</div>

</div>

</div>

</div>

</section>

{/* ================= CONTACT ================= */}

<section id="contact" className="py-5 bg-light">

<div className="container">

<h2 className="section-title">
Contact Us
</h2>

<p className="section-subtitle">
Have questions? We'd love to hear from you.
</p>

<div className="row">

<div className="col-lg-6">

<input
className="form-control mb-3"
placeholder="Full Name"
/>

<input
className="form-control mb-3"
placeholder="Email"
/>

<input
className="form-control mb-3"
placeholder="Phone"
/>

<textarea
className="form-control"
rows="5"
placeholder="Write your message..."
></textarea>

<button className="btn btn-success mt-3">

Send Message

</button>

</div>

<div className="col-lg-6 mt-5 mt-lg-0">

<div className="card shadow p-4">

<h4>
📍 NextPark AI
</h4>

<hr />

<p>

<strong>Address</strong>

<br />

Nagpur, Maharashtra

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

24 × 7 Customer Support

</p>

</div>

</div>

</div>

</div>

</section>

{/* ================= DOWNLOAD APP ================= */}

<section className="py-5 bg-primary text-white">

<div className="container text-center">

<h2 className="fw-bold">

Download Our Mobile App

</h2>

<p className="mt-3">

Book parking anytime using Android & iOS.

</p>

<div className="mt-4">

<button className="btn btn-light btn-lg me-3">

📱 Google Play

</button>

<button className="btn btn-warning btn-lg">

🍎 App Store

</button>

</div>

</div>

</section>

      {/* ================= GOOGLE MAP ================= */}

<section className="py-5 bg-white">

  <div className="container">

    <h2 className="section-title">
      Find Us On Map
    </h2>

    <p className="section-subtitle">
      Locate our parking services across the city.
    </p>

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

      <section className="py-5 bg-dark text-white">

        <div className="container text-center">

          <h2 className="display-5 fw-bold">
            Ready to Book Your Parking?
          </h2>

          <p className="lead mt-3">
            Save your time and enjoy a stress-free parking experience with NextPark AI.
          </p>

          <div className="mt-4">

            <Link
              to="/parkings"
              className="btn btn-warning btn-lg me-3"
            >
              Explore Parking
            </Link>

            <Link
              to="/register"
              className="btn btn-outline-light btn-lg"
            >
              Get Started
            </Link>

          </div>

        </div>

      </section>

    </>
  );
}

export default Home;