import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaCheck, FaSignInAlt,FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../utils/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await API.post('/users/register', formData);
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/');
      toast.success('Registration successful! Welcome to our platform');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="d-flex align-items-center justify-content-center">
                  <FaUser className="me-2" /> Create Account
                </h2>
                <p className="text-muted">Join us to get started</p>
              </div>

              {error && (
                <Alert variant="danger" className="d-flex align-items-center">
                  <FaInfoCircle className="me-2" />
                  {error}
                </Alert>
              )}

              <Form onSubmit={submitHandler}>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label className="d-flex align-items-center">
                    <FaUser className="me-2" /> Full Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="email" className="mb-3">
                  <Form.Label className="d-flex align-items-center">
                    <FaEnvelope className="me-2" /> Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="mobileNumber" className="mb-3">
                  <Form.Label className="d-flex align-items-center">
                    <FaPhone className="me-2" /> Mobile Number
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="mobileNumber"
                    placeholder="Enter mobile number"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="password" className="mb-3">
                  <Form.Label className="d-flex align-items-center">
                    <FaLock className="me-2" /> Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="confirmPassword" className="mb-4">
                  <Form.Label className="d-flex align-items-center">
                    <FaLock className="me-2" /> Confirm Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg" 
                  className="w-100 mb-3" 
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                  ) : (
                    <FaCheck className="me-2" />
                  )}
                  Register
                </Button>

                <div className="text-center mt-4">
                  <p className="text-muted mb-2">Already have an account?</p>
                  <Link 
                    to="/login" 
                    className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                  >
                    <FaSignInAlt className="me-2" /> Sign In
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;