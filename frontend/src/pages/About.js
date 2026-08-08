import { Link } from "react-router-dom";
import {
  FaCar,
  FaMapMarkedAlt,
  FaRobot,
  FaCreditCard,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";

function About() {
  return (
    <>
      {/* Hero */}
      <section className="bg-dark text-white py-5">
        <div className="container text-center">

          <h1 className="display-4 fw-bold">
            About NextPark AI
          </h1>

          <p className="lead mt-3">
            Smart Parking Solution powered by AI, helping users
            find, reserve and pay for parking effortlessly.
          </p>

        </div>
      </section>

      {/* About */}
      <section className="py-5">
        <div className="container">

          <div className="row align-items-center">

            <div className="col-lg-6">

              <img
                src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=900"
                className="img-fluid rounded shadow"
                alt="Parking"
              />

            </div>

            <div className="col-lg-6 mt-4 mt-lg-0">

              <h2 className="fw-bold">
                Who We Are
              </h2>

              <p className="mt-3">
                NextPark AI is a Smart Parking Management System
                developed to solve parking problems in cities.
                Users can search nearby parking, reserve slots,
                make secure payments and receive real-time updates.
              </p>

              <p>
                The platform is designed using React, Node.js,
                Express, MongoDB and AI technologies to provide
                a seamless parking experience.
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* Features */}

      <section className="bg-light py-5">

        <div className="container">

          <h2 className="text-center fw-bold mb-5">
            Our Features
          </h2>

          <div className="row g-4">

            <div className="col-md-4">
              <div className="card shadow text-center p-4 h-100">

                <FaMapMarkedAlt
                  size={45}
                  className="text-primary mx-auto mb-3"
                />

                <h4>Nearby Parking</h4>

                <p>
                  Find available parking locations instantly.
                </p>

              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow text-center p-4 h-100">

                <FaRobot
                  size={45}
                  className="text-success mx-auto mb-3"
                />

                <h4>AI Recommendation</h4>

                <p>
                  Smart AI suggests the best parking based on
                  your location and preferences.
                </p>

              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow text-center p-4 h-100">

                <FaCreditCard
                  size={45}
                  className="text-warning mx-auto mb-3"
                />

                <h4>Secure Payment</h4>

                <p>
                  Pay securely using Razorpay with multiple
                  payment options.
                </p>

              </div>
            </div>

          </div>

        </div>

      </section>

      {/* Why Choose Us */}

      <section className="py-5">

        <div className="container">

          <h2 className="text-center fw-bold mb-5">
            Why Choose NextPark AI?
          </h2>

          <div className="row g-4">

            <div className="col-md-4">
              <div className="card shadow p-4 text-center h-100">

                <FaShieldAlt
                  size={45}
                  className="text-danger mb-3 mx-auto"
                />

                <h4>Safe & Secure</h4>

                <p>
                  Secure booking and online payment with
                  encrypted transactions.
                </p>

              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow p-4 text-center h-100">

                <FaUsers
                  size={45}
                  className="text-info mb-3 mx-auto"
                />

                <h4>Trusted Users</h4>

                <p>
                  Thousands of satisfied customers use
                  NextPark AI daily.
                </p>

              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow p-4 text-center h-100">

                <FaCar
                  size={45}
                  className="text-success mb-3 mx-auto"
                />

                <h4>Smart Parking</h4>

                <p>
                  Book parking anytime, anywhere with
                  real-time availability.
                </p>

              </div>
            </div>

          </div>

        </div>

      </section>

      {/* CTA */}

      <section className="bg-primary text-white py-5">

        <div className="container text-center">

          <h2 className="fw-bold">
            Ready to Start?
          </h2>

          <p className="mt-3">
            Join NextPark AI today and enjoy hassle-free parking.
          </p>

          <Link
            to="/register"
            className="btn btn-warning btn-lg mt-3"
          >
            Create Account
          </Link>

        </div>

      </section>
    </>
  );
}

export default About;