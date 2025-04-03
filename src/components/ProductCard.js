import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Stack, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import API from '../utils/api';

const ProductCard = ({ product }) => {
  const [fullProduct, setFullProduct] = useState(product);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Only fetch details if presentationSize is missing
    if (!product.presentationSize) {
      const fetchProductDetails = async () => {
        setLoadingDetails(true);
        try {
          const { data } = await API.get(`/products/${product._id}`);
          setFullProduct(data);
        } catch (error) {
          console.error('Error fetching product details:', error);
          // Fallback to original product data if fetch fails
          setFullProduct(product);
        } finally {
          setLoadingDetails(false);
        }
      };
      fetchProductDetails();
    }
  }, [product._id, product.presentationSize,product]);

  const stockStatus = fullProduct.quantityInStock > 0 ? 'In Stock' : 'Out of Stock';
  const stockBadgeVariant = fullProduct.quantityInStock > 0 ? 'success' : 'danger';
  const discountedPrice = fullProduct.price - (fullProduct.price * (fullProduct.discount / 100));
  const productSize = fullProduct.presentationSize || fullProduct.presentation?.size || 'N/A';
  const hasDiscount = fullProduct.discount > 0;

  return (
    <Card className="h-100 shadow-sm border-0 product-card">
      {/* Image Section */}
      <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
        {loadingDetails ? (
          <div className="h-100 d-flex justify-content-center align-items-center bg-light">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            <Link to={`/products/${fullProduct._id}`} className="text-decoration-none">
              {fullProduct.images?.length > 0 ? (
                <>
                  {!imageLoaded && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-light">
                      <Spinner animation="border" variant="secondary" />
                    </div>
                  )}
                  <Card.Img
                    variant="top"
                    src={fullProduct.images[0]}
                    alt={fullProduct.name}
                    className={`img-fluid ${imageLoaded ? 'd-block' : 'd-none'}`}
                    style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageLoaded(true)} // Fallback if image fails to load
                  />
                </>
              ) : (
                <div className="h-100 d-flex justify-content-center align-items-center bg-light">
                  <span className="text-muted">No Image</span>
                </div>
              )}
            </Link>

            {/* Badges - only show when not loading */}
            {!loadingDetails && (
              <Stack direction="horizontal" gap={2} className="position-absolute top-0 start-0 p-2 w-100">
                <Badge bg={stockBadgeVariant}>{stockStatus}</Badge>
                {/* {fullProduct.category && (
                  <Badge bg="primary" className="ms-auto">
                    {fullProduct.category}
                  </Badge>
                )} */}
                {hasDiscount && (
                  <Badge bg="danger" className="position-absolute top-0 end-0 m-2">
                    {fullProduct.discount}% OFF
                  </Badge>
                )}
              </Stack>
            )}
          </>
        )}
      </div>

      {/* Card Body */}
      <Card.Body className="d-flex flex-column p-3">
        {loadingDetails ? (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" size="sm" />
          </div>
        ) : (
          <>
            <Link to={`/products/${fullProduct._id}`} className="text-decoration-none text-dark">
              <Card.Title as="h5" className="mb-2 text-truncate" style={{textTransform:"capitalize"}}>
                {fullProduct.name}
              </Card.Title>
            </Link>

            <div className="mb-2">
              <small className="text-muted">Size:</small>
              <div className="fw-semibold">{productSize}</div>
            </div>

            <div className="mt-auto">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  {hasDiscount && (
                    <small className="text-muted text-decoration-line-through me-2">
                      ₹{fullProduct.price.toFixed(2)}
                    </small>
                  )}
                  <span className="fs-5 fw-bold text-success">
                    ₹{discountedPrice.toFixed(2)}
                  </span>
                </div>
                {hasDiscount && (
                  <Badge bg="light" text="danger" className="border border-danger">
                    Save ₹{(fullProduct.price - discountedPrice).toFixed(2)} 
                  </Badge>
                )}
              </div>
            </div>

            <Button
              as={Link}
              to={`/products/${fullProduct._id}`}
              variant="outline-success"
              size="sm"
              className="mt-3 w-100"
            >
              View Details
            </Button>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProductCard;