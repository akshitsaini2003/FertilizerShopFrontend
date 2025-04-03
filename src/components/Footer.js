import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { 
  FaFacebook, FaTwitter, FaInstagram, 
  FaPhone, FaEnvelope, FaClock, 
  FaWhatsapp
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-3 mt-5">
      <Container>
        <Row>
          {/* About Section */}
          <Col md={4} className="mb-4">
            <h5 className="mb-3 text-warning">Shakumbhari Fertilizer</h5>
            <p className="small">
              Your trusted partner for quality agricultural inputs since 2020. 
              We provide the best fertilizers for maximum crop yield.
            </p>
            <div className="mt-3">
              <a href="https://www.facebook.com/" className="text-white me-3"><FaFacebook size={20} /></a>
              <a href="https://x.com/?lang=en" className="text-white me-3"><FaTwitter size={20} /></a>
              <a href="https://www.instagram.com/" className="text-white me-3"><FaInstagram size={20} /></a>
              <a href="https://api.whatsapp.com/send?phone=917983332595&text=Welcome%20to%20Shakumbhari%20Fetilizers" className="text-white"><FaWhatsapp size={20} /></a>
            </div>
          </Col>

          {/* Quick Links */}
          <Col md={2} className="mb-4">
            <h5 className="mb-3 text-warning">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="/" className="text-white text-decoration-none">Home</a></li>
              <li className="mb-2"><a href="/profile" className="text-white text-decoration-none">Profile</a></li>
              <li><a href="/my-orders" className="text-white text-decoration-none">My Orders</a></li>
            </ul>
          </Col>

          {/* Contact Info */}
          <Col md={3} className="mb-4">
            <h5 className="mb-3 text-warning">Contact Us</h5>
            <ul className="list-unstyled">
              <li className="mb-3 d-flex align-items-center">
                <FaPhone className="me-2" />
                <a href="tel:+917983332595" className="text-white text-decoration-none">+91 7983332595</a>
              </li>
              <li className="mb-3 d-flex align-items-center">
                <FaEnvelope className="me-2" />
                <a href="mailto:abhisaini6065@gmail.com" className="text-white text-decoration-none">abhisaini6065@gmail.com</a>
              </li>
              <li className="d-flex align-items-center">
                <FaClock className="me-2" />
                <span>Mon-Sat: 9AM - 6PM</span>
              </li>
            </ul>
          </Col>

          {/* Single Shop Address */}
          <Col md={3} className="mb-4">
            <h5 className="mb-3 text-warning">Visit Us</h5>
            <div className="bg-light text-dark p-3 rounded small">
              <p className="fw-bold">Shakumbhari Fertilizer</p>
              <p>
                Salempur Gada<br />
                Near BSM Inter College<br />
                Uttar Pradesh - 247121<br />
                India
              </p>
              <p className="mt-2">
                <FaClock className="me-2" />
                Open: Mon-Sat, 9AM-6PM
              </p>
            </div>
          </Col>
        </Row>

        <hr className="my-4 bg-secondary" />

        {/* Copyright */}
        <Row>
          <Col className="text-center">
            <p className="mb-0 small">
              &copy; {new Date().getFullYear()} Fertilizer Shop. All Rights Reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
