import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Image, Card, Button, Badge, Spinner, Alert, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import API from '../utils/api';
import { FaArrowLeft, FaShoppingCart, FaBolt, FaLeaf, FaInfoCircle } from 'react-icons/fa';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [stockStatus, setStockStatus] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/products/${id}`);
        
        const status = data.isActive 
          ? (data.quantityInStock > 0 ? 'In Stock' : 'Out of Stock')
          : 'Product Unavailable';
        
        setProduct(data);
        setStockStatus(status);
        
        const maxAvailable = Math.min(data.quantityInStock, 10);
        if (quantity > maxAvailable) {
          setQuantity(maxAvailable > 0 ? maxAvailable : 1);
        }
        
      } catch (err) {
        setError('Failed to load product details');
        toast.error('Error fetching product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, quantity]);

  const addToCartHandler = () => {
    if (stockStatus !== 'In Stock') {
      toast.error(`Product is ${stockStatus.toLowerCase()}`);
      return;
    }

    try {
      const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      const existingItem = cartItems.find(item => item.product === product._id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.quantityInStock) {
          toast.error(`Only ${product.quantityInStock} units available`);
          return;
        }
        existingItem.quantity = newQuantity;
      } else {
        cartItems.push({
          product: product._id,
          name: product.name,
          price: product.price - (product.price * product.discount / 100),
          quantity: quantity,
          image: product.images[0],
          stockStatus: stockStatus,
          actualStock: product.quantityInStock,
          maxAvailable: Math.min(product.quantityInStock, 10),
          presentation: `${product.presentation} (${product.presentationSize})`,
          category: product.category
        });
      }
      
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      
      toast.success(
        <div className="d-flex align-items-center">
          <span>Product added to cart</span>
          <Button 
            variant="outline-success" 
            size="sm" 
            className="ms-3"
            onClick={() => navigate('/cart')}
          >
            <FaShoppingCart className="me-1" /> View Cart
          </Button>
        </div>
      );
    } catch (error) {
      toast.error('Failed to add product to cart');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-5">
        <FaInfoCircle className="me-2" />
        {error}
        <Button variant="outline-danger" className="ms-3" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (!product) {
    return (
      <Alert variant="warning" className="my-5">
        Product not found
        <Button variant="outline-warning" className="ms-3" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-1" /> Go Back
        </Button>
      </Alert>
    );
  }

  const availableQuantities = stockStatus === 'In Stock'
    ? Math.min(product.quantityInStock, 10)
    : 0;

  const discountedPrice = product.price - (product.price * product.discount / 100);
  const savings = product.price - discountedPrice;

  return (
    <div className="container py-4">
      <Button 
        variant="outline-secondary" 
        onClick={() => navigate(-1)} 
        className="mb-4"
      >
        <FaArrowLeft className="me-1" /> Back to Products
      </Button>

      <Row className="g-4">
        {/* Product Images */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              <div className="text-center mb-3" style={{ height: '400px' }}>
                <Image 
                  src={product.images[activeImage]} 
                  alt={product.name} 
                  fluid 
                  className="h-100"
                  style={{ objectFit: 'contain' }}
                />
              </div>
              
              <div className="d-flex flex-wrap gap-2">
                {product.images.map((img, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail-container ${index === activeImage ? 'active' : ''}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <Image
                      src={img}
                      alt={product.name}
                      thumbnail
                      className="cursor-pointer"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Product Info */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
              <h2 className="mb-3" style={{textTransform:"capitalize"}}>{product.name}</h2>
              
              <div className="d-flex align-items-center mb-3">
                <Badge bg="info" className="me-2 text-capitalize">
                  {product.category}
                </Badge>
                <Badge bg={stockStatus === 'In Stock' ? 'success' : 'danger'}>
                  {stockStatus} {stockStatus === 'In Stock' && `(${product.quantityInStock})`}
                </Badge>
              </div>

              <div className="mb-4">
                <div className="d-flex align-items-center">
                  <h3 className="text-success mb-0">₹{discountedPrice.toFixed(2)}</h3>
                  {product.discount > 0 && (
                    <>
                      <span className="text-muted text-decoration-line-through ms-3">
                        ₹{product.price.toFixed(2)}
                      </span>
                      <Badge bg="danger" className="ms-2">
                        Save ₹{savings.toFixed(2)} ({product.discount}% OFF)
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h5 className="d-flex align-items-center">
                  <FaLeaf className="text-success me-2" />
                  <span>Product Details</span>
                </h5>
                <p className="mb-2"><strong>Presentation:</strong> {product.presentation} ({product.presentationSize})</p>
              </div>

              <div className="mb-4">
                <h5>Description</h5>
                <p >{product.description || 'No description available'}</p>
              </div>

              {stockStatus === 'In Stock' && (
                <div className="mb-4">
                  <Form.Group controlId="quantity">
                    <Form.Label><strong>Quantity:</strong></Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Select
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        style={{ width: '100px' }}
                      >
                        {[...Array(availableQuantities).keys()].map(x => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </Form.Select>
                      <span className="ms-2 text-muted">Max {availableQuantities} per order</span>
                    </div>
                  </Form.Group>
                </div>
              )}

              <div className="d-grid gap-3">
                <Button
                  variant="success"
                  size="lg"
                  onClick={addToCartHandler}
                  disabled={stockStatus !== 'In Stock'}
                >
                  <FaShoppingCart className="me-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    addToCartHandler();
                    navigate('/cart');
                  }}
                  disabled={stockStatus !== 'In Stock'}
                >
                  <FaBolt className="me-2" />
                  Buy Now
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Product Specifications */}
      <Row className="mt-4">
        <Col md={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h4 className="mb-4">
                <FaInfoCircle className="text-primary me-2" />
                Specifications
              </h4>
              
              <Row>
                <Col md={6}>
                  <h5>Benefits</h5>
                  {product.benefits?.length > 0 ? (
                    <ul className="benefits-list" >
                      {product.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No benefits information available</p>
                  )}
                </Col>
                
                <Col md={6}>
                  <h5>Dosage & Application</h5>
                  <p>{product.dosage || 'No dosage information available'}</p>
                </Col>
              </Row>

              {product.suitableForCrops?.length > 0 && (
                <div className="mt-4">
                  <h5>Suitable for Crops</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {product.suitableForCrops.map((crop, index) => (
                      <Badge key={index} bg="info" className="text-capitalize">
                        {crop}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        .thumbnail-container {
          border: 2px solid transparent;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        .thumbnail-container:hover {
          border-color: #198754;
        }
        .thumbnail-container.active {
          border-color: #198754;
        }
        .benefits-list {
          padding-left: 20px;
        }
        .benefits-list li {
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;