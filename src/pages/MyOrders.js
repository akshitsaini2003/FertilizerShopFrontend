import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Container, Spinner, Alert, Stack } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaTimes, FaShoppingBag, FaCalendarAlt, FaRupeeSign, FaCreditCard } from 'react-icons/fa';
import API from '../utils/api';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/orders/myorders');
      setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const cancelOrderHandler = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await API.put(`/orders/${orderId}/cancel`);
        await fetchOrders();
        toast.success('Order cancelled successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error cancelling order');
        console.error('Error cancelling order:', error);
      }
    }
  };

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
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading your orders...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
          <Button variant="outline-danger" className="ms-3" onClick={fetchOrders}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container className="text-center py-5">
        <div className="mb-4">
          <FaShoppingBag size={48} className="text-muted mb-3" />
          <h3>You haven't placed any orders yet</h3>
          <p className="text-muted">Start shopping to see your orders here</p>
        </div>
        <Link to="/" className="btn btn-primary btn-lg">
          Start Shopping
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center mb-4">
        <FaShoppingBag className="me-2" size={24} />
        <h2 className="mb-0">My Orders</h2>
        <Badge bg="secondary" className="ms-2">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </Badge>
      </div>

      <div className="table-responsive">
        <Table hover className="align-middle">
          <thead className="table-light">
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Products</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td className="fw-bold">#{order.orderId}</td>
                <td>
                  <div className="d-flex align-items-center">
                    <FaCalendarAlt className="me-2 text-muted" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <div className="d-flex flex-column gap-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="d-flex align-items-start gap-3">
                        <div className="position-relative">
                          <img 
                            src={item.image || '/images/placeholder-product.png'} 
                            alt={item.name} 
                            className="rounded border"
                            style={{ 
                              width: '60px', 
                              height: '60px', 
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/images/placeholder-product.png';
                            }}
                          />
                          <Badge 
                            bg="light" 
                            text="dark" 
                            className="position-absolute top-0 start-100 translate-middle"
                          >
                            {item.quantity}
                          </Badge>
                        </div>
                        <div>
                          <Link 
                            to={`/products/${item.product}`} 
                            className="text-decoration-none fw-bold text-dark"
                          >
                            {item.name}
                          </Link>
                          <div className="d-flex flex-wrap gap-1 align-items-center my-1">
                            {item.category && (
                              <Badge bg="info" className="text-capitalize">
                                {item.category}
                              </Badge>
                            )}
                          </div>
                          <div className="text-muted small">
                            {item.presentation} • ₹{item.price?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="fw-bold">
                  <div className="d-flex align-items-center">
                    <FaRupeeSign className="me-1" size={12} />
                    {order.totalAmount?.toFixed(2)}
                  </div>
                </td>
                <td>
                  <Badge 
                    bg={
                      order.paymentStatus === 'Success' ? 'success' :
                      order.paymentStatus === 'Pending' ? 'warning' : 'danger'
                    }
                    className="d-flex align-items-center"
                  >
                    <FaCreditCard className="me-1" size={12} />
                    {order.paymentStatus}
                  </Badge>
                </td>
                <td>
                  <Badge bg={getStatusBadge(order.orderStatus)} className="text-capitalize">
                    {order.orderStatus}
                  </Badge>
                  {order.deliveryDate && order.orderStatus === 'Shipped' && (
                    <div className="small text-muted mt-1">
                      Est. delivery: {new Date(order.deliveryDate).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td>
                  <Stack direction="horizontal" gap={2}>
                    <Link
                      to={`/order/${order._id}`}
                      className="btn btn-sm btn-outline-primary d-flex align-items-center"
                    >
                      <FaEye className="me-1" /> Details
                    </Link>
                    {['Processing', 'Shipped'].includes(order.orderStatus) && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => cancelOrderHandler(order._id)}
                        className="d-flex align-items-center"
                      >
                        <FaTimes className="me-1" /> Cancel
                      </Button>
                    )}
                  </Stack>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default MyOrders;