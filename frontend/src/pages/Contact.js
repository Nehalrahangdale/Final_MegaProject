import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa";

function Contact() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-dark text-white py-5">
        <div className="container text-center">
          <h1 className="display-4 fw-bold">Contact Us</h1>

          <p className="lead mt-3">
            We'd love to hear from you. Get in touch with us anytime.
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

                  <h3 className="mb-4">Send Message</h3>

                  <form>

                    <div className="mb-3">

                      <label className="form-label">
                        Full Name
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Full Name"
                      />

                    </div>

                    <div className="mb-3">

                      <label className="form-label">
                        Email
                      </label>

                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter Email"
                      />

                    </div>

                    <div className="mb-3">

                      <label className="form-label">
                        Subject
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Subject"
                      />

                    </div>

                    <div className="mb-3">

                      <label className="form-label">
                        Message
                      </label>

                      <textarea
                        rows="5"
                        className="form-control"
                        placeholder="Write your message..."
                      ></textarea>

                    </div>

                    <button className="btn btn-primary w-100">
                      Send Message
                    </button>

                  </form>

                </div>

              </div>

            </div>

            {/* Contact Info */}

            <div className="col-lg-5">

              <div className="card shadow border-0 h-100">

                <div className="card-body p-4">

                  <h3 className="mb-4">
                    Contact Information
                  </h3>

                  <p>
                    <FaMapMarkerAlt className="text-danger me-2" />
                    Nagpur, Maharashtra, India
                  </p>

                  <p>
                    <FaPhoneAlt className="text-success me-2" />
                    +91 9876543210
                  </p>

                  <p>
                    <FaEnvelope className="text-primary me-2" />
                    support@nextparkai.com
                  </p>

                  <p>
                    <FaClock className="text-warning me-2" />
                    24 × 7 Customer Support
                  </p>

                  <hr />

                  <h5 className="mb-3">
                    Follow Us
                  </h5>

                  <div className="d-flex gap-3 fs-3">

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

          <h2 className="text-center fw-bold mb-4">
            Our Location
          </h2>

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