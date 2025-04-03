import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Badge, Container, 
  Spinner, Alert, Stack, Card, Form 
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaPlus, FaEdit, FaBox, 
  FaRupeeSign, FaTag, FaInfoCircle,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
  FaToggleOn, FaToggleOff
} from 'react-icons/fa';
import API from '../../utils/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/products/admin/all');
        setProducts(data);
      } catch (error) {
        setError(error.response?.data?.message || 'Error fetching products');
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // const deleteHandler = async (id) => {
  //   if (!window.confirm('Are you sure you want to delete this product?')) return;

  //   setDeletingId(id);
  //   try {
  //     await API.delete(`/products/${id}`);
  //     setProducts(products.filter(product => product._id !== id));
  //     toast.success('Product deleted successfully');
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || 'Error deleting product');
  //   } finally {
  //     setDeletingId(null);
  //   }
  // };

  const toggleActiveStatus = async (id, currentStatus) => {
    setTogglingId(id);
    try {
      const { data } = await API.put(`/products/${id}`, {
        isActive: !currentStatus
      });
      
      setProducts(products.map(product => 
        product._id === id ? data : product
      ));
      
      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating product status');
    } finally {
      setTogglingId(null);
    }
  };

  const getStockStatus = (quantity, isActive) => {
    if (!isActive) return 'Inactive';
    return quantity > 0 ? 'In Stock' : 'Out of Stock';
  };

  const getStockBadge = (quantity, isActive) => {
    if (!isActive) return 'secondary';
    return quantity > 0 ? 'success' : 'warning';
  };

  const getStatusIcon = (quantity, isActive) => {
    if (!isActive) return <FaTimesCircle className="me-1" />;
    return quantity > 0 ? <FaCheckCircle className="me-1" /> : <FaExclamationTriangle className="me-1" />;
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading products...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <FaInfoCircle className="me-2" size={20} />
          {error}
          <Button 
            variant="outline-danger" 
            className="ms-3" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <FaBox className="me-2" size={24} />
          <h2 className="mb-0">Product Management</h2>
        </div>
        <Link 
          to="/admin/products/add" 
          className="btn btn-primary d-flex align-items-center"
        >
          <FaPlus className="me-2" /> Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <Card className="text-center py-5 border-0 shadow-sm">
          <FaBox size={48} className="text-muted mb-3" />
          <h4>No Products Found</h4>
          <p className="text-muted mb-4">Add your first product to get started</p>
          <Link 
            to="/admin/products/add" 
            className="btn btn-primary d-flex align-items-center mx-auto"
          >
            <FaPlus className="me-2" /> Add Product
          </Link>
        </Card>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Form</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <img
                          src={product.images?.[0] || '/images/placeholder-product.png'}
                          alt={product.name}
                          width={50}
                          height={50}
                          className="rounded border"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/placeholder-product.png';
                          }}
                        />
                      </div>
                      <div>
                        <div className="fw-bold">{product.name}</div>
                        <div className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>
                          ID: {product._id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <FaRupeeSign size={12} className="me-1" />
                      {product.price.toFixed(2)}
                    </div>
                    {product.discount > 0 && (
                      <div className="small text-success">
                        <FaTag className="me-1" />
                        {product.discount}% off
                      </div>
                    )}
                  </td>
                  <td>
                    <Badge bg="info" className="text-capitalize">
                      {product.category}
                    </Badge>
                  </td>
                  <td>
                    <div className="small">
                      <div>{product.presentation}</div>
                      <div className="text-muted">Size: {product.presentationSize}</div>
                    </div>
                  </td>
                  <td className="fw-bold">
                    {product.quantityInStock}
                  </td>
                  <td>
                    <Badge 
                      bg={getStockBadge(product.quantityInStock, product.isActive)}
                      className="d-flex align-items-center"
                    >
                      {getStatusIcon(product.quantityInStock, product.isActive)}
                      {getStockStatus(product.quantityInStock, product.isActive)}
                    </Badge>
                  </td>
                  <td>
                    <Form.Check
                      type="switch"
                      id={`active-switch-${product._id}`}
                      checked={product.isActive}
                      onChange={() => toggleActiveStatus(product._id, product.isActive)}
                      disabled={togglingId === product._id}
                      label={
                        togglingId === product._id ? (
                          <Spinner as="span" animation="border" size="sm" />
                        ) : product.isActive ? (
                          <FaToggleOn className="text-success" />
                        ) : (
                          <FaToggleOff className="text-secondary" />
                        )
                      }
                    />
                  </td>
                  <td>
                    <Stack direction="horizontal" gap={2}>
                      <Link 
                        to={`/admin/products/edit/${product._id}`} 
                        className="btn btn-sm btn-outline-primary d-flex align-items-center"
                      >
                        <FaEdit className="me-1" /> Edit
                      </Link>
                      {/* <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => deleteHandler(product._id)}
                        disabled={deletingId === product._id}
                        className="d-flex align-items-center"
                      >
                        {deletingId === product._id ? (
                          <Spinner as="span" size="sm" animation="border" className="me-1" />
                        ) : (
                          <FaTrash className="me-1" />
                        )}
                        Delete
                      </Button> */}
                    </Stack>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default ProductList;