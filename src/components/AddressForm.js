import React, { useState } from 'react';
import { 
  Form, Button, Card, FloatingLabel, 
  Alert, Stack ,Spinner,Row,Col
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { 
  FaSave, 
  FaCheckCircle, FaArrowLeft 
} from 'react-icons/fa';
import API from '../utils/api';
import { useNavigate } from 'react-router-dom';

const AddressForm = ({ onSuccess, initialData = {}, isEdit = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    mobileNumber: initialData.mobileNumber || '',
    pinCode: initialData.pinCode || '',
    city: initialData.city || '',
    state: initialData.state || '',
    country: initialData.country || 'India',
    isDefault: initialData.isDefault || false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isEdit) {
        await API.put(`/users/address/${initialData._id}`, formData);
        toast.success('Address updated successfully');
      } else {
        await API.post('/users/address', formData);
        toast.success('Address added successfully');
      }
      
      // Redirect to cart page after successful save
      // navigate('/cart');
      
      // Call onSuccess if needed for parent component
      if (onSuccess) onSuccess();
      
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving address');
      console.error('Address save error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">
            {isEdit ? 'Edit Address' : 'Add New Address'}
          </h4>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => navigate('/cart')}
            className="d-flex align-items-center"
          >
            <FaArrowLeft className="me-1" /> Back to Cart
          </Button>
        </div>

        {error && (
          <Alert variant="danger" className="d-flex align-items-center">
            <FaCheckCircle className="me-2" />
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Stack gap={3}>
            <FloatingLabel controlId="name" label="Full Name" className="mb-3">
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
              />
            </FloatingLabel>

            <FloatingLabel controlId="mobileNumber" label="Mobile Number" className="mb-3">
              <Form.Control
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                placeholder="Enter mobile number"
                pattern="[0-9]{10}"
                maxLength="10"
              />
              <Form.Text className="text-muted">
                10 digit mobile number without country code
              </Form.Text>
            </FloatingLabel>

            <Row>
              <Col md={6}>
                <FloatingLabel controlId="pinCode" label="PIN Code" className="mb-3">
                  <Form.Control
                    type="text"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    required
                    placeholder="Enter PIN code"
                    pattern="[0-9]{6}"
                    maxLength="6"
                  />
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <FloatingLabel controlId="city" label="City" className="mb-3">
                  <Form.Control
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="Enter city"
                  />
                </FloatingLabel>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FloatingLabel controlId="state" label="State" className="mb-3">
                  <Form.Control
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    placeholder="Enter state"
                  />
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <FloatingLabel controlId="country" label="Country" className="mb-3">
                  <Form.Control
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    placeholder="Enter country"
                  />
                </FloatingLabel>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="isDefault"
                label="Set as default address"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/cart')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
                className="d-flex align-items-center"
              >
                {loading ? (
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                ) : (
                  <FaSave className="me-2" />
                )}
                {isEdit ? 'Update Address' : 'Save Address'}
              </Button>
            </div>
          </Stack>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AddressForm;