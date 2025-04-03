import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignInAlt,FaInfoCircle, FaUserPlus, FaLock, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../utils/api';

const LoginPage = () => {
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.post('/users/login', { emailOrMobile, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/');
      toast.success('Login successful');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
      console.error('Login error:', error);
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
                  <FaSignInAlt className="me-2" /> Sign In
                </h2>
                <p className="text-muted">Access your account to continue</p>
              </div>

              {error && (
                <Alert variant="danger" className="d-flex align-items-center">
                  <FaInfoCircle className="me-2" />
                  {error}
                </Alert>
              )}

              <Form onSubmit={submitHandler}>
                <Form.Group controlId="emailOrMobile" className="mb-3">
                  <Form.Label className="d-flex align-items-center">
                    <FaEnvelope className="me-2" /> Email or Mobile
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter email or mobile number"
                    value={emailOrMobile}
                    onChange={(e) => setEmailOrMobile(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="password" className="mb-4">
                  <Form.Label className="d-flex align-items-center">
                    <FaLock className="me-2" /> Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    <FaSignInAlt className="me-2" />
                  )}
                  Sign In
                </Button>

                <div className="text-center mt-4">
                  <p className="text-muted mb-2">Don't have an account?</p>
                  <Link 
                    to="/register" 
                    className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                  >
                    <FaUserPlus className="me-2" /> Register Now
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

export default LoginPage;