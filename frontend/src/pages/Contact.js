import { useState } from "react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaCheckCircle,
} from "react-icons/fa";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({
    submitted: false,
    loading: false,
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    setStatus({ submitted: false, loading: true, message: "" });

    // Simulate sending message
    setTimeout(() => {
      setStatus({
        submitted: true,
        loading: false,
        message: "Thank you! Your message has been sent successfully. Our support team will get back to you within 24 hours.",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    }, 600);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-dark text-white py-5">
        <div className="container text-center">
          <h1 className="display-4 fw-bold">Contact Us</h1>
          <p className="lead mt-3">
            We'd love to hear from you. Get in touch with us anytime for assistance or inquiries.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            {/* Contact Form */}
            <div className="col-lg-7 mb-4">
              <div className="card shadow border-0">
                <div className="card-body p-4">
                  <h3 className="mb-4 fw-bold">Send Us a Message</h3>

                  {status.submitted && (
                    <div className="alert alert-success d-flex align-items-center mb-4">
                      <FaCheckCircle className="me-2 fs-5" />
                      <div>{status.message}</div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        className="form-control"
                        placeholder="Subject or issue title"
                        value={formData.subject}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">Message *</label>
                      <textarea
                        rows="5"
                        name="message"
                        className="form-control"
                        placeholder="Write your message or inquiry here..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2 fw-semibold"
                      disabled={status.loading}
                    >
                      {status.loading ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="col-lg-5">
              <div className="card shadow border-0 h-100">
                <div className="card-body p-4">
                  <h3 className="mb-4 fw-bold">Contact Information</h3>

                  <p className="mb-3">
                    <FaMapMarkerAlt className="text-danger me-2" />
                    <strong>Location:</strong> Nagpur, Maharashtra, India
                  </p>

                  <p className="mb-3">
                    <FaPhoneAlt className="text-success me-2" />
                    <strong>Phone:</strong> +91 9876543210
                  </p>

                  <p className="mb-3">
                    <FaEnvelope className="text-primary me-2" />
                    <strong>Email:</strong> support@nextparkai.com
                  </p>

                  <p className="mb-4">
                    <FaClock className="text-warning me-2" />
                    <strong>Working Hours:</strong> 24 × 7 Customer Support
                  </p>

                  <hr />

                  <h5 className="mb-3 fw-bold">Follow Us</h5>

                  <div className="d-flex gap-3 fs-4">
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary"
                      aria-label="Facebook"
                    >
                      <FaFacebook />
                    </a>

                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-danger"
                      aria-label="Instagram"
                    >
                      <FaInstagram />
                    </a>

                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-info"
                      aria-label="LinkedIn"
                    >
                      <FaLinkedin />
                    </a>

                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-dark"
                      aria-label="GitHub"
                    >
                      <FaGithub />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Map */}
      <section className="pb-5">
        <div className="container">
          <h2 className="text-center fw-bold mb-4">Our Location</h2>
          <div className="ratio ratio-21x9 shadow rounded overflow-hidden">
            <iframe
              src="https://www.google.com/maps?q=Nagpur&output=embed"
              title="Google Map"
              loading="lazy"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;