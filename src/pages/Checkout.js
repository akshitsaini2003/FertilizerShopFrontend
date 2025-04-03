import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, ListGroup, Button, Form,Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import API from '../utils/api';
import AddressForm from '../components/AddressForm';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartItems(items);

    const fetchAddresses = async () => {
      try {
        const { data } = await API.get('/users/address');
        setAddresses(data);
        if (data.length > 0) {
          const defaultAddress = data.find(addr => addr.isDefault) || data[0];
          setSelectedAddress(defaultAddress._id);
        }
      } catch (error) {
        toast.error('Error fetching addresses');
      }
    };
    fetchAddresses();
  }, []);

  const placeOrderHandler = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cartItems,
        shippingAddress: selectedAddress,
        paymentMethod
      };
      const { data } = await API.post('/orders', orderData);
      
      if (paymentMethod === 'Razorpay') {
        // Handle Razorpay payment
        const options = {
          key: process.env.RAZORPAY_KEY_ID,
          amount: data.razorpayOrder.amount,
          currency: data.razorpayOrder.currency,
          name: 'Fertilizer Shop',
          description: 'Order Payment',
          order_id: data.razorpayOrder.id,
          handler: async function(response) {
            try {
              await API.post('/orders/verify-payment', {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: data.orderId
              });
              localStorage.removeItem('cartItems');
              navigate(`/order/${data._id}`);
            } catch (error) {
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            name: data.user.name,
            email: data.user.email,
            contact: data.user.mobileNumber
          },
          theme: {
            color: '#3399cc'
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // For COD
        localStorage.removeItem('cartItems');
        navigate(`/order/${data._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating order');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSuccess = () => {
    setShowAddressForm(false);
    // Refresh addresses
    API.get('/users/address')
      .then(({ data }) => {
        setAddresses(data);
        if (data.length > 0) {
          setSelectedAddress(data[0]._id);
        }
      })
      .catch(error => {
        toast.error('Error fetching addresses');
      });
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity, 0
  );

  return (
    <div className="container">
      <h2 className="my-4">Checkout</h2>
      {cartItems.length === 0 ? (
        <div className="text-center">
          <p>Your cart is empty</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Go Shopping
          </Button>
        </div>
      ) : (
        <Row>
          <Col md={8}>
            <Card className="mb-4">
              <Card.Body>
                <h4>Shipping</h4>
                {showAddressForm ? (
                  <AddressForm onSuccess={handleAddressSuccess} />
                ) : (
                  <>
                    {addresses.length > 0 ? (
                      <Form.Select
                        value={selectedAddress}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                        className="mb-3"
                      >
                        {addresses.map(address => (
                          <option key={address._id} value={address._id}>
                            {address.name}, {address.city}, {address.state} - {address.pinCode}
                          </option>
                        ))}
                      </Form.Select>
                    ) : (
                      <p>No addresses saved</p>
                    )}
                    <Button
                      variant="link"
                      onClick={() => setShowAddressForm(true)}
                    >
                      {addresses.length > 0 ? 'Add New Address' : 'Add Address'}
                    </Button>
                  </>
                )}
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Body>
                <h4>Payment Method</h4>
                <Form.Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="COD">Cash on Delivery</option>
                  <option value="Razorpay">Pay Online</option>
                </Form.Select>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <h4>Order Items</h4>
                <ListGroup variant="flush">
                  {cartItems.map(item => (
                    <ListGroup.Item key={item.product}>
                      <Row className="align-items-center">
                        <Col md={6}>
                          <span>{item.name}</span>
                        </Col>
                        <Col md={3}>
                          <span>Qty: {item.quantity}</span>
                        </Col>
                        <Col md={3} className="text-end">
                          <span>₹{item.price * item.quantity}</span>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h4>Order Summary</h4>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Subtotal</Col>
                    <Col>₹{subtotal}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>Free</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col><strong>Total</strong></Col>
                    <Col><strong>₹{subtotal}</strong></Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Button
                    type="button"
                    className="btn-block"
                    disabled={cartItems.length === 0 || loading || addresses.length === 0}
                    onClick={placeOrderHandler}
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </Button>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Checkout;