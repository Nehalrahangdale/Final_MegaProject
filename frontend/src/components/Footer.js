import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-dark text-light pt-5 pb-3">

      <div className="container">

        <div className="row">

          {/* Company */}

          <div className="col-lg-4 mb-4">

            <h3 className="fw-bold text-warning">
              🚗 NextPark AI
            </h3>

            <p className="mt-3">
              Smart Parking Solution powered by AI.
              Find nearby parking, reserve instantly
              and pay securely.
            </p>

          </div>

          {/* Links */}

          <div className="col-lg-2 mb-4">

            <h5>Quick Links</h5>

            <ul className="list-unstyled">

              <li>
                <Link className="footer-link" to="/">
                  Home
                </Link>
              </li>

              <li>
                <Link className="footer-link" to="/parkings">
                  Parking
                </Link>
              </li>

              <li>
                <Link className="footer-link" to="/login">
                  Login
                </Link>
              </li>

              <li>
                <Link className="footer-link" to="/register">
                  Register
                </Link>
              </li>

            </ul>

          </div>

          {/* Contact */}

          <div className="col-lg-3 mb-4">

            <h5>Contact</h5>

            <p>
              <FaMapMarkerAlt className="me-2" />
              Nagpur, Maharashtra
            </p>

            <p>
              <FaPhone className="me-2" />
              +91 9876543210
            </p>

            <p>
              <FaEnvelope className="me-2" />
              support@nextpark.com
            </p>

          </div>

          {/* Social */}

          <div className="col-lg-3 mb-4">

            <h5>Follow Us</h5>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon"
                aria-label="Facebook"
              >
                <FaFacebook />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon"
                aria-label="GitHub"
              >
                <FaGithub />
              </a>

          </div>

        </div>

        <hr className="border-secondary" />

        <div className="text-center">

          © {new Date().getFullYear()} NextPark AI |
          All Rights Reserved.

        </div>

      </div>

    </footer>
  );
}

export default Footer;