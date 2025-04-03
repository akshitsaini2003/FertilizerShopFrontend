import React, { useState, useEffect } from 'react';
import { Alert,Table, Button, Dropdown, Badge, Container, Spinner, Stack } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTimes,FaCheck,FaCog,FaEye, FaEdit, FaRupeeSign, FaBox, FaUser, FaCalendarAlt, FaCreditCard } from 'react-icons/fa';
import API from '../../utils/api';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/orders');
      
      const formattedOrders = data.map(order => ({
        ...order,
        orderId: order.orderId || order._id,
        user: order.user || { name: 'Guest', email: 'guest@example.com' },
        items: order.items?.map(item => ({
          ...item,
          name: item.name || item.product?.name || 'Unknown Product',
          price: item.price || item.product?.price || 0,
          image: item.image || item.product?.images?.[0] || '/images/placeholder-product.png',
          category: item.category || item.product?.category || 'General',
          presentation: item.presentation || item.product?.presentation || 'Standard'
        })) || []
      }));
      
      setOrders(formattedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
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

  const updateStatusHandler = async (orderId, status) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status });
      await fetchOrders();
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating order status');
      console.error('Error updating status:', error);
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
        <p className="mt-3">Loading orders...</p>
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
        <FaBox size={48} className="text-muted mb-3" />
        <h3>No orders found</h3>
        <p className="text-muted">When orders are placed, they will appear here</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <FaBox className="me-2" size={24} />
          <h2 className="mb-0">Order Management</h2>
        </div>
        <Badge bg="secondary" pill>
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </Badge>
      </div>

      <div className="table-responsive">
        <Table hover className="align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: '10%' }}>Order #</th>
              <th style={{ width: '12%' }}>Customer</th>
              <th style={{ width: '30%' }}>Products</th>
              <th style={{ width: '8%' }}>Date</th>
              <th style={{ width: '8%' }}>Total</th>
              <th style={{ width: '10%' }}>Payment</th>
              <th style={{ width: '10%' }}>Status</th>
              <th style={{ width: '12%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td className="fw-bold">#{order.orderId}</td>
                <td>
                  <div className="d-flex align-items-center">
                    <FaUser className="me-2 text-muted" />
                    <div>
                      <div className="fw-bold">{order.user.name}</div>
                      <div className="small text-muted text-truncate" style={{ maxWidth: '150px' }}>
                        {order.user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="d-flex flex-column gap-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="d-flex align-items-start gap-3">
                        <div className="position-relative">
                          <img 
                            src={item.image} 
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
                          <div className="fw-bold mb-1">{item.name}</div>
                          <div className="d-flex flex-wrap gap-1 align-items-center mb-1">
                            {item.category && (
                              <Badge bg="info" className="text-capitalize">
                                {item.category}
                              </Badge>
                            )}
                            {item.presentation && (
                              <span className="text-muted small">
                                {item.presentation}
                              </span>
                            )}
                          </div>
                          <div className="d-flex align-items-center small">
                            <FaRupeeSign size={10} className="me-1" />
                            {item.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <FaCalendarAlt className="me-2 text-muted" />
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </td>
                <td className="fw-bold">
                  <div className="d-flex align-items-center">
                    <FaRupeeSign className="me-1" />
                    {order.totalAmount.toFixed(2)}
                  </div>
                </td>
                <td>
                  <Badge 
                    bg={
                      order.paymentStatus === 'Success' ? 'success' :
                      order.paymentStatus === 'Pending' ? 'warning' : 'danger'
                    }
                    className="d-flex align-items-center text-uppercase"
                  >
                    <FaCreditCard className="me-1" size={12} />
                    {order.paymentStatus}
                  </Badge>
                </td>
                <td>
                  <Badge 
                    bg={getStatusBadge(order.orderStatus)} 
                    className="text-uppercase"
                  >
                    {order.orderStatus}
                  </Badge>
                </td>
                <td>
                  <Stack direction="horizontal" gap={2}>
                    <Link
                      to={`/order/${order._id}`}
                      className="btn btn-sm btn-outline-primary d-flex align-items-center"
                      title="View Details"
                    >
                      <FaEye className="me-1" />
                    </Link>
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="outline-secondary"
                        size="sm"
                        className="d-flex align-items-center"
                        disabled={['Cancelled', 'Delivered'].includes(order.orderStatus)}
                      >
                        <FaEdit className="me-1" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {order.orderStatus === 'Processing' && (
                          <>
                            <Dropdown.Item 
                              onClick={() => updateStatusHandler(order._id, 'Shipped')}
                              className="d-flex align-items-center"
                            >
                              <FaBox className="me-2" /> Mark as Shipped
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              onClick={() => updateStatusHandler(order._id, 'Cancelled')}
                              className="text-danger d-flex align-items-center"
                            >
                              <FaTimes className="me-2" /> Cancel Order
                            </Dropdown.Item>
                          </>
                        )}
                        {order.orderStatus === 'Shipped' && (
                          <>
                            <Dropdown.Item 
                              onClick={() => updateStatusHandler(order._id, 'Delivered')}
                              className="d-flex align-items-center"
                            >
                              <FaCheck className="me-2" /> Mark as Delivered
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              onClick={() => updateStatusHandler(order._id, 'Cancelled')}
                              className="text-danger d-flex align-items-center"
                            >
                              <FaTimes className="me-2" /> Cancel Order
                            </Dropdown.Item>
                          </>
                        )}
                        {!['Processing', 'Shipped', 'Cancelled', 'Delivered'].includes(order.orderStatus) && (
                          <Dropdown.Item 
                            onClick={() => updateStatusHandler(order._id, 'Processing')}
                            className="d-flex align-items-center"
                          >
                            <FaCog className="me-2" /> Mark as Processing
                          </Dropdown.Item>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
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

export default OrderList;