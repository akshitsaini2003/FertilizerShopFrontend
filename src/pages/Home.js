import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Form, InputGroup, Dropdown, Card } from 'react-bootstrap';
import API from '../utils/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('latest');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get('/products?fields=name,price,discount,quantityInStock,images,category,presentation,presentationSize');
        setProducts(data);
        setFilteredProducts(data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(product => product.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let results = [...products];
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      results = results.filter(product => 
        product.category === selectedCategory
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'lowToHigh':
        results.sort((a, b) => {
          const priceA = a.price - (a.price * (a.discount / 100));
          const priceB = b.price - (b.price * (b.discount / 100));
          return priceA - priceB;
        });
        break;
      case 'highToLow':
        results.sort((a, b) => {
          const priceA = a.price - (a.price * (a.discount / 100));
          const priceB = b.price - (b.price * (b.discount / 100));
          return priceB - priceA;
        });
        break;
      case 'latest':
      default:
        // Assuming newer products have higher IDs (adjust based on your data)
        results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }
    
    setFilteredProducts(results);
  }, [searchTerm, sortOption, selectedCategory, products]);

  return (
    <Container className="py-4">
      {/* Hero Section */}
      <Card className="bg-success text-white mb-4 border-0 shadow">
        <Card.Body className="p-5 text-center">
          <h1 className="display-5 fw-bold">Shakumbhari Fertilizers</h1>
          <p className="fs-5">High-quality products for your agricultural needs</p>
        </Card.Body>
      </Card>
      
      {/* Search and Filter Bar */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text className="bg-light">
                  <i className="bi bi-search text-muted"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
              </InputGroup>
            </Col>
            
            <Col md={3}>
              <Dropdown>
                <Dropdown.Toggle variant="light" className="w-100 border d-flex justify-content-between align-items-center">
                  <span>
                    {sortOption === 'lowToHigh' ? 'Price: Low to High' : 
                     sortOption === 'highToLow' ? 'Price: High to Low' : 'Latest'}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100">
                  <Dropdown.Item onClick={() => setSortOption('latest')}>
                    <i className="bi bi-arrow-up me-2"></i>Latest
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortOption('lowToHigh')}>
                    <i className="bi bi-arrow-up me-2"></i>Price: Low to High
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortOption('highToLow')}>
                    <i className="bi bi-arrow-down me-2"></i>Price: High to Low
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text className="bg-light">
                  <i className="bi bi-filter text-muted"></i>
                </InputGroup.Text>
                <Form.Select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border-start-0"
                  style={{textTransform:"capitalize"}}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
            
            <Col md={1} className="text-end">
              <span className="text-muted">{filteredProducts.length} items</span>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Products Section */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading products...</p>
        </div>
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <Card className="text-center py-5 shadow-sm">
              <Card.Body>
                <i className="bi bi-exclamation-circle display-5 text-muted mb-3"></i>
                <h4 className="text-muted">No products found</h4>
                <p className="text-muted">Try adjusting your search or filter criteria</p>
                <button 
                  className="btn btn-outline-success mt-2"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSortOption('latest');
                  }}
                >
                  Reset filters
                </button>
              </Card.Body>
            </Card>
          ) : (
            <Row className="g-4">
              {filteredProducts.map((product) => (
                <Col key={product._id} xs={12} sm={6} md={4} lg={3}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          )}
        </>
      )}
      
      {/* Footer Note */}
      {!loading && filteredProducts.length > 0 && (
        <div className="text-center mt-5 text-muted">
          <p>Showing {filteredProducts.length} of {products.length} products</p>
        </div>
      )}
    </Container>
  );
};

export default Home;