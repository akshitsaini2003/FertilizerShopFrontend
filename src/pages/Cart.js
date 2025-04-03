import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Table, Button, Card, ListGroup, 
  Form, Row, Col, Badge, Image, Alert, Spinner, Container
} from 'react-bootstrap';
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaHome, FaWallet } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../utils/api';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const updateCartAndNotify = (updatedItems) => {
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const loadCartFromStorage = () => {
    try {
      const cartData = localStorage.getItem('cartItems');
      return cartData ? JSON.parse(cartData) : [];
    } catch (e) {
      console.error('Error parsing cart items', e);
      return [];
    }
  };

  const verifyProducts = async (savedCart) => {
    return await Promise.all(
      savedCart.map(async item => {
        try {
          const { data: product } = await API.get(`/products/${item.product}`);
          
          const inStock = product.isActive;
          const sufficientStock = product.quantityInStock >= item.quantity;
          let stockStatus = 'In Stock';

          if (!inStock) {
            stockStatus = 'Product Unavailable';
          } else if (!sufficientStock) {
            stockStatus = `Only ${product.quantityInStock} available`;
          }

          return {
            ...item,
            name: product.name || item.name,
            stockStatus,
            price: product.price * (1 - (product.discount / 100)),
            image: product.images?.[0] || item.image,
            actualStock: product.quantityInStock,
            maxAvailable: Math.min(product.quantityInStock, 10),
            category: product.category,
            presentation: product.presentation,
            presentationSize: product.presentationSize,
            suitableForCrops: product.suitableForCrops
          };
        } catch (err) {
          console.error(`Error verifying product ${item.product}:`, err);
          return {
            ...item,
            stockStatus: 'Unavailable',
            price: item.price || 0,
            actualStock: 0,
            maxAvailable: 0,
            category: 'General',
            presentation: 'Standard',
            presentationSize: 'N/A',
            suitableForCrops: []
          };
        }
      })
    );
  };

  const loadAddresses = async () => {
    try {
      const { data } = await API.get('/users/address');
      setAddresses(data);
      if (data.length > 0) {
        const defaultAddr = data.find(a => a.isDefault) || data[0];
        setSelectedAddress(defaultAddr._id);
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
      toast.error('Failed to load addresses');
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedCart = loadCartFromStorage();
        const verifiedItems = await verifyProducts(savedCart);
        setCartItems(verifiedItems);
        await loadAddresses();
      } catch (err) {
        console.error('Cart load error:', err);
        setError('Failed to load cart data. Please refresh the page.');
      }
    };
    
    loadData();
  }, []);

  const removeItem = (productId) => {
    const updated = cartItems.filter(item => item.product !== productId);
    updateCartAndNotify(updated);
    toast.success('Item removed from cart');
  };

  const updateQty = (productId, newQty) => {
    const numQty = Number(newQty);
    if (isNaN(numQty)) return;
    
    const updated = cartItems.map(item => {
      if (item.product === productId) {
        const quantity = Math.max(1, Math.min(numQty, item.maxAvailable || 10));
        return { ...item, quantity };
      }
      return item;
    });
    
    updateCartAndNotify(updated);
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }
    
    const unavailableItems = cartItems.filter(i => 
      i.stockStatus !== 'In Stock' || i.quantity > (i.actualStock || 0)
    );

    if (unavailableItems.length > 0) {
      toast.error(
        `Cannot proceed: ${unavailableItems[0].name} has stock issues`
      );
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          presentation: item.presentation,
          presentationSize: item.presentationSize
        })),
        shippingAddress: selectedAddress,
        paymentMethod
      };

      const { data } = await API.post('/orders', orderData);
      
      if (paymentMethod === 'Razorpay') {
        handleRazorpayPayment(data);
      } else {
        completeOrder(data._id);
      }
    } catch (err) {
      handleCheckoutError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = (orderData) => {
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: orderData.razorpayOrder.amount,
      currency: orderData.razorpayOrder.currency,
      name: 'Fertilizer Shop',
      description: `Order #${orderData.orderId}`,
      order_id: orderData.razorpayOrder.id,
      handler: async (response) => {
        try {
          await API.post('/orders/verify-payment', {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            orderId: orderData.orderId
          });
          completeOrder(orderData._id);
        } catch (err) {
          console.error('Payment verification failed:', err);
          toast.error('Payment failed. Please check your orders.');
          navigate('/my-orders');
        }
      },
      theme: { color: '#3399cc' }
    };
    
    new window.Razorpay(options).open();
  };

  const handleCheckoutError = (err) => {
    console.error('Checkout error:', err);
    const errorMsg = err.response?.data?.message || 'Checkout failed';
    toast.error(errorMsg);
    
    if (err.response?.data?.productId) {
      const updatedCart = cartItems.filter(
        item => item.product !== err.response.data.productId
      );
      updateCartAndNotify(updatedCart);
    }
  };

  const completeOrder = (orderId) => {
    localStorage.removeItem('cartItems');
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success(
      <div>
        Order placed successfully!
      </div>
    );
    navigate(`/order/${orderId}`);
  };

  const { subtotal, itemCount } = cartItems.reduce(
    (totals, item) => {
      totals.subtotal += item.price * item.quantity;
      totals.itemCount += item.quantity;
      return totals;
    }, 
    { subtotal: 0, itemCount: 0 }
  );

  if (error) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
        <Button 
          variant="primary" 
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container className="py-5 text-center">
        <div className="mb-4">
          <FaShoppingCart size={48} className="text-muted mb-3" />
          <h2>Your Cart is Empty</h2>
          <p className="text-muted mb-4">Looks like you haven't added anything to your cart yet</p>
        </div>
        <Link to="/" className="btn btn-primary btn-lg">
          Continue Shopping
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-4" >
      <div className="d-flex align-items-center mb-4" >
        <FaShoppingCart className="me-2" size={24} />
        <h2 className="mb-0">Shopping Cart</h2>
        <Badge bg="secondary" className="ms-2">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Badge>
      </div>
      
      <Row>
        <Col lg={8}>
          <Card className="mb-4 border-0 shadow-sm" >
            <Card.Body className="p-4">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '40%' }}>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map(item => (
                      <tr key={item.product}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="position-relative me-3">
                              <Image
                                src={item.image || '/images/placeholder-product.png'}
                                alt={item.name}
                                width={80}
                                height={80}
                                className="rounded border"
                                style={{ objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.src = '/images/placeholder-product.png';
                                }}
                              />
                              {item.stockStatus !== 'In Stock' && (
                                <Badge 
                                  bg={item.stockStatus.includes('Only') ? 'warning' : 'danger'} 
                                  className="position-absolute top-0 start-0 translate-middle"
                                >
                                  {item.stockStatus.includes('Only') ? 'Low Stock' : 'Unavailable'}
                                </Badge>
                              )}
                            </div>
                            <div>
                              <Link 
                                to={`/products/${item.product}`} 
                                className="text-decoration-none fw-bold text-dark"
                              >
                                {item.name}
                              </Link>
                              <div className="text-muted small mt-1">
                                {item.presentation} ({item.presentationSize})
                              </div>
                              <Badge bg="light" text="dark" className="mt-1" style={{textTransform:"capitalize"}}>
                                {item.category}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td className="align-middle">
                          <div className="fw-bold">₹{item.price.toFixed(2)}</div>
                          {item.suitableForCrops?.length > 0 && (
                            <div className="small text-muted">
                              For: {item.suitableForCrops.join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="align-middle">
                          <div className="d-flex align-items-center">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="px-3"
                              onClick={() => updateQty(item.product, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <FaMinus size={12} />
                            </Button>
                            <Form.Control
                              type="number"
                              min="1"
                              max={item.maxAvailable || 10}
                              value={item.quantity}
                              onChange={(e) => updateQty(item.product, e.target.value)}
                              className="mx-2 text-center"
                              style={{ width: '50px' }}
                            />
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="px-3"
                              onClick={() => updateQty(item.product, item.quantity + 1)}
                              disabled={item.quantity >= (item.maxAvailable || 10)}
                            >
                              <FaPlus size={12} />
                            </Button>
                          </div>
                        </td>
                        <td className="align-middle fw-bold">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td className="align-middle">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="p-2"
                            onClick={() => removeItem(item.product)}
                            aria-label="Remove item"
                          >
                            <FaTrash size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
          
          <div className="d-flex justify-content-between mb-4">
            <Link to="/" className="btn btn-outline-primary">
              <FaHome className="me-2" />
              Continue Shopping
            </Link>
            <Button 
              variant="outline-danger" 
              onClick={() => {
                localStorage.removeItem('cartItems');
                setCartItems([]);
                window.dispatchEvent(new Event('cartUpdated'));
                toast.success('Cart cleared successfully');
              }}
            >
              <FaTrash className="me-2" />
              Clear Cart
            </Button>
          </div>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm sticky-top" style={{ top: '20px',zIndex:1 }}>
            <Card.Body className="p-4" >
              <h4 className="mb-4 d-flex align-items-center">
                <FaWallet className="me-2" />
                Order Summary
              </h4>
              
              <ListGroup variant="flush" className="mb-4">
                <ListGroup.Item className="d-flex justify-content-between py-3">
                  <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                  <span className="fw-bold">₹{subtotal.toFixed(2)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between py-3">
                  <span>Shipping</span>
                  <span className="text-success fw-bold">FREE</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between py-3 bg-light">
                  <span className="fw-bold">Total Amount</span>
                  <span className="fw-bold fs-5">₹{subtotal.toFixed(2)}</span>
                </ListGroup.Item>
              </ListGroup>

              <div className="mb-4">
                <h5 className="mb-3">Shipping Address</h5>
                {addressLoading ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : addresses.length > 0 ? (
                  <Form.Select
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    className="mb-3"
                  >
                    {addresses.map(addr => (
                      <option key={addr._id} value={addr._id}>
                        {addr.name}, {addr.city} - {addr.pinCode}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <Alert variant="warning" className="d-flex align-items-center">
                    <div>
                      <p className="mb-2">No addresses saved</p>
                      <Link to="/profile/addresses" className="btn btn-sm btn-primary">
                        Add Address
                      </Link>
                    </div>
                  </Alert>
                )}
              </div>

              <div className="mb-4">
                <h5 className="mb-3">Payment Method</h5>
                <Form.Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="COD">Cash on Delivery</option>
                  <option value="Razorpay">Pay Online</option>
                </Form.Select>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-100 py-3 fw-bold"
                onClick={handleCheckout}
                disabled={
                  loading || 
                  cartItems.some(i => i.stockStatus !== 'In Stock') || 
                  !selectedAddress
                }
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;