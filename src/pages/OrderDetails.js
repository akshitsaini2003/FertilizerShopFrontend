import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card, ListGroup, Row, Col, Badge,
  Button, Alert, Spinner, Image, Table
} from 'react-bootstrap';
import { 
  FaCreditCard, FaArrowLeft, FaShoppingBag, FaCheckCircle, 
  FaTimesCircle, FaTruck, FaMoneyBillWave,
  FaMapMarkerAlt, FaCalendarAlt, FaPhone,
  FaUser, FaBoxOpen, FaRupeeSign
} from 'react-icons/fa';
import API from '../utils/api';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order details');
        console.error('Order fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const getStatusBadge = (status) => {
    const variants = {
      Delivered: 'success',
      Shipped: 'primary',
      Processing: 'warning',
      Cancelled: 'danger',
      Returned: 'info'
    };
    return variants[status] || 'secondary';
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <Alert variant="danger" className="d-flex align-items-center">
          <FaTimesCircle className="me-2" size={20} />
          <div>
            <p className="mb-0">{error}</p>
            <Button 
              variant="outline-danger" 
              onClick={() => navigate(-1)} 
              className="mt-2"
            >
              <FaArrowLeft className="me-1" /> Go Back
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5 text-center">
        <FaBoxOpen size={48} className="text-muted mb-3" />
        <h3>Order Not Found</h3>
        <p className="text-muted mb-4">The requested order could not be found</p>
        <Button 
          variant="primary" 
          onClick={() => navigate('/')} 
          className="d-flex align-items-center mx-auto"
        >
          <FaShoppingBag className="me-2" /> Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Button 
        variant="outline-secondary" 
        onClick={() => navigate(-1)} 
        className="mb-4 d-flex align-items-center"
      >
        <FaArrowLeft className="me-1" /> Back to Orders
      </Button>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <FaShoppingBag className="me-2" size={24} />
          <h2 className="mb-0">Order #{order.orderId}</h2>
        </div>
        <Badge
          bg={getStatusBadge(order.orderStatus)}
          className="fs-6 d-flex align-items-center"
        >
          {order.orderStatus === 'Delivered' && <FaCheckCircle className="me-1" />}
          {order.orderStatus === 'Cancelled' && <FaTimesCircle className="me-1" />}
          {order.orderStatus === 'Shipped' && <FaTruck className="me-1" />}
          {order.orderStatus}
        </Badge>
      </div>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h4 className="d-flex align-items-center mb-0">
                <FaBoxOpen className="me-2" /> Order Items
              </h4>
            </Card.Header>
            <Card.Body>
              <Table hover responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '60%' }}>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <Image
                              src={item.image || item.product?.images?.[0] || '/images/placeholder-product.png'}
                              alt={item.name}
                              width={60}
                              height={60}
                              className="rounded border"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/placeholder-product.png';
                              }}
                            />
                          </div>
                          <div>
                            <Link
                              to={`/products/${item.product?._id}`}
                              className="text-decoration-none fw-bold"
                            >
                              {item.name}
                            </Link>
                            <div className="small text-muted">
                              {item.presentation}
                            </div>
                            {item.category && (
                              <Badge bg="info" className="mt-1 text-capitalize">
                                {item.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaRupeeSign size={10} className="me-1" />
                          {item.price.toFixed(2)}
                        </div>
                      </td>
                      <td>{item.quantity}</td>
                      <td className="fw-bold">
                        <div className="d-flex align-items-center">
                          <FaRupeeSign size={12} className="me-1" />
                          {(item.price * item.quantity).toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0">
              <h4 className="d-flex align-items-center mb-0">
                <FaMoneyBillWave className="me-2" /> Order Summary
              </h4>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between py-3">
                  <span className="d-flex align-items-center">
                    <FaCalendarAlt className="me-2 text-muted" />
                    Date
                  </span>
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between py-3">
                  <span className="d-flex align-items-center">
                    <FaCreditCard className="me-2 text-muted" />
                    Payment
                  </span>
                  <Badge
                    bg={
                      order.paymentStatus === 'Success' ? 'success' :
                        order.paymentStatus === 'Pending' ? 'warning' : 'danger'
                    }
                    className="d-flex align-items-center"
                  >
                    {order.paymentMethod} - {order.paymentStatus}
                  </Badge>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between py-3">
                  <span>Subtotal</span>
                  <span>
                    <FaRupeeSign size={10} className="me-1" />
                    {order.totalAmount.toFixed(2)}
                  </span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between py-3">
                  <span>Shipping</span>
                  <span className="text-success">FREE</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between py-3 fw-bold bg-light">
                  <span>Total Amount</span>
                  <span>
                    <FaRupeeSign size={12} className="me-1" />
                    {order.totalAmount.toFixed(2)}
                  </span>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0">
              <h4 className="d-flex align-items-center mb-0">
                <FaMapMarkerAlt className="me-2" /> Shipping Details
              </h4>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="py-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaUser className="me-2 text-muted" />
                    <span className="fw-bold">{order.shippingAddress?.name}</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <FaPhone className="me-2 text-muted" />
                    <span>{order.shippingAddress?.mobileNumber}</span>
                  </div>
                  <div className="d-flex">
                    <FaMapMarkerAlt className="me-2 text-muted mt-1" />
                    <div>
                      {order.shippingAddress?.addressLine1 && (
                        <div>{order.shippingAddress.addressLine1}</div>
                      )}
                      <div>
                        {[
                          order.shippingAddress?.city,
                          order.shippingAddress?.state,
                          order.shippingAddress?.pinCode
                        ].filter(Boolean).join(', ')}
                      </div>
                      {order.shippingAddress?.country && (
                        <div>{order.shippingAddress.country}</div>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
                {order.expectedDelivery && (
                  <ListGroup.Item className="d-flex align-items-center py-3">
                    <FaTruck className="me-2 text-muted" />
                    <div>
                      <div className="fw-bold">Expected Delivery</div>
                      <div>{new Date(order.expectedDelivery).toLocaleDateString()}</div>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderDetails;