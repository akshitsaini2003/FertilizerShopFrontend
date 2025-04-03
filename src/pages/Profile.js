import React, { useState, useEffect } from 'react';
import {
  Tab, Tabs, Card, ListGroup, Button,
  Modal, Row, Col, Badge, Table, Form,
  Container, Spinner, Alert, Stack
} from 'react-bootstrap';
import {
  FaUser, FaAddressBook, FaUsersCog,
  FaTrash, FaEdit, FaKey, FaPlus,
  FaBoxOpen, FaUserShield
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../utils/api';
import AddressForm from '../components/AddressForm';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [key, setKey] = useState('profile');
  const [allUsers, setAllUsers] = useState([]);
  const [userOrders, setUserOrders] = useState({});
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: userData } = await API.get('/users/profile');
        setUser(userData);

        const { data: addressData } = await API.get('/users/address');
        setAddresses(addressData);

        if (userData.isAdmin) {
          await loadAllUsers();
        }
      } catch (error) {
        setError('Error fetching profile data');
        toast.error('Error fetching profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const loadAllUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data: usersData } = await API.get('/admin/users');
      setAllUsers(usersData);
    } catch (error) {
      toast.error('Error fetching users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUserOrders = async (userId) => {
    try {
      const { data } = await API.get(`/admin/users/${userId}/orders`);
      setUserOrders(prev => ({ ...prev, [userId]: data }));
    } catch (error) {
      toast.error('Error fetching user orders');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await API.delete(`/users/address/${id}`);
        setAddresses(addresses.filter(addr => addr._id !== id));
        toast.success('Address deleted successfully');
      } catch (error) {
        toast.error('Error deleting address');
      }
    }
  };

  const handleAddressSuccess = () => {
    setShowAddressForm(false);
    setEditAddress(null);
    API.get('/users/address')
      .then(({ data }) => setAddresses(data))
      .catch(error => toast.error('Error fetching addresses'));
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await API.delete(`/admin/users/${userId}`);
        setAllUsers(allUsers.filter(user => user._id !== userId));
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Error deleting user');
      }
    }
  };

  const handleResetPassword = async (userId, newPassword) => {
    try {
      await API.put(`/admin/users/${userId}/reset-password`, { newPassword });
      toast.success('Password reset successfully');
      setShowResetPasswordModal(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error('Error resetting password');
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading your profile...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
          <Button variant="outline-danger" className="ms-3" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          User data not available
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <div className="d-flex align-items-center mb-4">
        <FaUser className="me-2" size={24} />
        <h2 className="mb-0">User Profile</h2>
      </div>

      <Tabs
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-4"
        fill
      >
        <Tab
          eventKey="profile"
          title={
            <span>
              <FaUser className="me-1" /> Profile
            </span>
          }
        >
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                  <span className="fw-bold">Name</span>
                  <span>{user.name}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                  <span className="fw-bold">Email</span>
                  <span>{user.email}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                  <span className="fw-bold">Mobile</span>
                  <span>{user.mobileNumber || 'Not provided'}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                  <span className="fw-bold">Role</span>
                  <Badge bg={user.isAdmin ? 'primary' : 'secondary'}>
                    {user.isAdmin ? 'Admin' : 'Customer'}
                  </Badge>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Tab>

        <Tab
          eventKey="addresses"
          title={
            <span>
              <FaAddressBook className="me-1" /> Addresses
            </span>
          }
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0">Your Addresses</h5>
            <Button
              variant="primary"
              onClick={() => setShowAddressForm(true)}
              className="d-flex align-items-center"
            >
              <FaPlus className="me-1" /> Add New Address
            </Button>
          </div>

          {addresses.length === 0 ? (
            <Card className="text-center py-5 border-0 shadow-sm">
              <FaAddressBook size={48} className="text-muted mb-3" />
              <h5>No addresses saved</h5>
              <p className="text-muted">Add your first address to get started</p>
              <Button
                variant="primary"
                onClick={() => setShowAddressForm(true)}
                className="mt-3"
              >
                Add Address
              </Button>
            </Card>
          ) : (
            <Row className="g-4">
              {addresses.map(address => (
                <Col key={address._id} md={6} lg={4}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <Card.Title className="mb-0">
                          {address.name}
                          {address.isDefault && (
                            <Badge bg="success" className="ms-2">Default</Badge>
                          )}
                        </Card.Title>
                        <Stack direction="horizontal" gap={2}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="p-1"
                            onClick={() => {
                              setEditAddress(address);
                              setShowAddressForm(true);
                            }}
                          >
                            <FaEdit size={14} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="p-1"
                            onClick={() => handleDeleteAddress(address._id)}
                          >
                            <FaTrash size={14} />
                          </Button>
                        </Stack>
                      </div>
                      <Card.Text>
                        <div className="mb-2">
                          <span className="text-muted">Mobile:</span> {address.mobileNumber}
                        </div>
                        <div className="mb-2">
                          <span className="text-muted">Address:</span> {address.addressLine1}, {address.city}, {address.state} - {address.pinCode}
                        </div>
                        <div>
                          <span className="text-muted">Country:</span> {address.country}
                        </div>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Tab>

        {user?.isAdmin && (
          <Tab
            eventKey="admin"
            title={
              <span>
                <FaUserShield className="me-1" /> Admin
              </span>
            }
          >
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h5 className="d-flex align-items-center mb-4">
                  <FaUserShield className="me-2" /> Admin Dashboard
                </h5>
                <div className="d-flex flex-wrap gap-3">
                  <Button
                    as={Link}
                    to="/admin/products"
                    variant="outline-primary"
                    className="d-flex align-items-center"
                  >
                    <FaBoxOpen className="me-2" /> Manage Products
                  </Button>
                  <Button
                    as={Link}
                    to="/admin/orders"
                    variant="outline-primary"
                    className="d-flex align-items-center"
                  >
                    <FaBoxOpen className="me-2" /> Manage Orders
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Tab>
        )}

        {user?.isAdmin && (
          <Tab
            eventKey="manage-users"
            title={
              <span>
                <FaUsersCog className="me-1" /> Manage Users
              </span>
            }
          >
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="d-flex align-items-center mb-0">
                    <FaUsersCog className="me-2" /> All Users
                  </h5>
                  {loadingUsers && <Spinner animation="border" size="sm" />}
                </div>

                <div className="table-responsive">
                  <Table striped bordered hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map(user => (
                        <tr key={user._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="me-2">
                                <Badge bg={user.isAdmin ? 'primary' : 'secondary'}>
                                  {user.isAdmin ? 'A' : 'C'}
                                </Badge>
                              </div>
                              <div>
                                <div className="fw-bold">{user.name}</div>
                                <div className="small text-muted">{user.mobileNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <Badge bg={user.isAdmin ? 'primary' : 'secondary'}>
                              {user.isAdmin ? 'Admin' : 'Customer'}
                            </Badge>
                          </td>
                          <td>
                            <Stack direction="horizontal" gap={2} >
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => fetchUserOrders(user._id)}
                                className="d-flex align-items-center"
                              >
                                <FaBoxOpen className="me-1" /> Orders
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteUser(user._id)}
                                className="d-flex align-items-center"
                              >
                                <FaTrash className="me-1" />
                              </Button>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowResetPasswordModal(true);
                                }}
                                className="d-flex align-items-center"
                              >
                                <FaKey className="me-1" />
                              </Button>
                            </Stack>

                            {userOrders[user._id] && (
                              <div className="mt-3">
                                <h6 className="small fw-bold mb-2">Recent Orders:</h6>
                                <div className="list-group list-group-flush small">
                                  {userOrders[user._id].slice(0, 3).map(order => (
                                    <Link
                                      key={order._id}
                                      to={`/order/${order._id}`}
                                      className="list-group-item list-group-item-action py-2"
                                    >
                                      <div className="d-flex justify-content-between">
                                        <span className="fw-bold">#{order.orderId}</span>
                                        <span>₹{order.totalAmount.toFixed(2)}</span>
                                      </div>
                                      <div className="text-muted">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Tab>
        )}
      </Tabs>

      {/* Address Form Modal */}
      <Modal
        show={showAddressForm}
        onHide={() => {
          setShowAddressForm(false);
          setEditAddress(null);
        }}
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            {editAddress ? (
              <span className="d-flex align-items-center">
                <FaEdit className="me-2" /> Edit Address
              </span>
            ) : (
              <span className="d-flex align-items-center">
                <FaPlus className="me-2" /> Add New Address
              </span>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddressForm
            onSuccess={handleAddressSuccess}
            initialData={editAddress || {}}
            isEdit={Boolean(editAddress)}
          />
        </Modal.Body>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        show={showResetPasswordModal}
        onHide={() => setShowResetPasswordModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="d-flex align-items-center">
            <FaKey className="me-2" /> Reset Password
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            Reset password for <strong>{selectedUser?.name}</strong> ({selectedUser?.email})
          </p>
          <Form onSubmit={(e) => {
            e.preventDefault();
            const newPassword = e.target.password.value;
            handleResetPassword(selectedUser._id, newPassword);
          }}>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                required
                minLength="6"
                placeholder="Enter new password"
              />
              <Form.Text className="text-muted">
                Minimum 6 characters
              </Form.Text>
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => setShowResetPasswordModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Reset Password
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Profile;