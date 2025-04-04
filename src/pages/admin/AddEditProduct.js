import React, { useState, useEffect } from 'react';
import { 
  Form, Button, Row, Col, Badge, 
  Alert, Spinner, Image, Card, Container,
  FloatingLabel
} from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, FaPlus, FaSave, 
  FaImage, FaLeaf, FaInfoCircle,
  FaCheck, FaBox, FaTimesCircle
} from 'react-icons/fa';
import API from '../../utils/api';
import ImageUploadModal from '../../components/ImageUploadModal';

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [product, setProduct] = useState({
    name: '',
    category: 'wheat',
    presentation: 'Powder Form',
    presentationSize: '100gm',
    images: [],
    discount: '',
    benefits: [],
    description: '',
    dosage: '',
    price: '',
    suitableForCrops: [],
    quantityInStock: '',
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cropInput, setCropInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const presentationOptions = {
    'Powder Form': ['100gm', '250gm', '500gm', '1kg', '3kg', '5kg', '25kg', '50kg'],
    'Liquid Form': ['10ml', '80ml', '1l'],
    'Seed Form': ['1kg', '5kg', '25kg'],
    'Granules Form': ['45kg'],
    'Jaivik Form': ['40kg']
  };

  const categories = ['wheat', 'rice', 'sugarcane', 'bajra', 'vegetable', 'Mango'];

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const { data } = await API.get(`/products/${id}`);
          if (!data) {
            toast.error('Product not found');
            navigate('/admin/products');
            return;
          }
          setProduct({
            ...data,
            discount: data.discount || '',
            price: data.price || '',
            quantityInStock: data.quantityInStock || '',
            presentationSize: data.presentationSize || (data.presentation === 'Liquid Form' ? '10ml' : '100gm'),
            benefits: data.benefits || []
          });
        } catch (error) {
          toast.error(error.response?.data?.message || 'Error fetching product');
          navigate('/admin/products');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, navigate]);

  const validateForm = () => {
    const errors = {};
    if (!product.name.trim()) errors.name = 'Product name is required';
    if (!product.price || isNaN(product.price)) errors.price = 'Valid price is required';
    if (product.price <= 0) errors.price = 'Price must be greater than 0';
    if (product.discount && (isNaN(product.discount) || product.discount < 0 || product.discount > 100) {
      errors.discount = 'Discount must be between 0-100';
    }
    if (!product.quantityInStock || isNaN(product.quantityInStock)) errors.quantityInStock = 'Valid quantity is required';
    if (product.quantityInStock < 0) errors.quantityInStock = 'Quantity cannot be negative';
    if (!product.description.trim()) errors.description = 'Description is required';
    if (product.benefits.length === 0) errors.benefits = 'At least one benefit is required';
    if (!product.dosage.trim()) errors.dosage = 'Dosage information is required';
    if (product.images.length === 0) errors.images = 'At least one image is required';
    if (!product.presentationSize) errors.presentationSize = 'Please select a presentation size';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'presentation') {
      let defaultSize = '100gm';
      if (value === 'Liquid Form') defaultSize = '10ml';
      else if (value === 'Seed Form') defaultSize = '1kg';
      else if (value === 'Granules Form') defaultSize = '45kg';
      else if (value === 'Jaivik Form') defaultSize = '40kg';
      
      setProduct(prev => ({
        ...prev,
        presentation: value,
        presentationSize: prev.presentationSize || defaultSize
      }));
    } else {
      setProduct(prev => ({ ...prev, [name]: value }));
    }

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for discount field
    if (name === 'discount') {
      const numValue = Number(value);
      if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 100)) {
        setProduct(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name]) {
          setValidationErrors(prev => ({ ...prev, [name]: null }));
        }
      }
      return;
    }
    
    // For other number fields
    if (value === '' || !isNaN(value)) {
      setProduct(prev => ({ ...prev, [name]: value }));
      if (validationErrors[name]) {
        setValidationErrors(prev => ({ ...prev, [name]: null }));
      }
    }
  };

  const handleAddCrop = () => {
    const crop = cropInput.trim();
    if (crop && !product.suitableForCrops.includes(crop)) {
      setProduct(prev => ({
        ...prev,
        suitableForCrops: [...prev.suitableForCrops, crop]
      }));
      setCropInput('');
      if (validationErrors.crops) {
        setValidationErrors(prev => ({ ...prev, crops: null }));
      }
    }
  };

  const handleRemoveCrop = (crop) => {
    setProduct(prev => ({
      ...prev,
      suitableForCrops: prev.suitableForCrops.filter(c => c !== crop)
    }));
  };

  const handleAddBenefit = () => {
    const benefit = benefitInput.trim();
    if (benefit && !product.benefits.includes(benefit)) {
      setProduct(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefit]
      }));
      setBenefitInput('');
      if (validationErrors.benefits) {
        setValidationErrors(prev => ({ ...prev, benefits: null }));
      }
    }
  };

  const handleRemoveBenefit = (benefit) => {
    setProduct(prev => ({
      ...prev,
      benefits: prev.benefits.filter(b => b !== benefit)
    }));
  };

  const handleKeyDown = (e, type) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'crop') handleAddCrop();
      if (type === 'benefit') handleAddBenefit();
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const { data } = await API.post('/products/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setProduct(prev => ({
        ...prev,
        images: [...prev.images, data.url]
      }));

      if (validationErrors.images) {
        setValidationErrors(prev => ({ ...prev, images: null }));
      }

      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    const newImages = [...product.images];
    newImages.splice(index, 1);
    setProduct(prev => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const productData = {
        ...product,
        discount: product.discount === '' ? 0 : Number(product.discount),
        price: Number(product.price),
        quantityInStock: Number(product.quantityInStock),
        presentationSize: product.presentationSize || 
          (product.presentation === 'Liquid Form' ? '10ml' :
           product.presentation === 'Seed Form' ? '1kg' :
           product.presentation === 'Granules Form' ? '45kg' :
           product.presentation === 'Jaivik Form' ? '40kg' : '100gm')
      };

      if (isEdit) {
        await API.put(`/products/${id}`, productData);
        toast.success('Product updated successfully');
      } else {
        await API.post('/products', productData);
        toast.success('Product created successfully');
      }
      navigate('/admin/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading product data...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <FaBox className="me-2" size={24} />
          <h2 className="mb-0">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
        </div>
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate('/admin/products')}
          className="d-flex align-items-center"
        >
          <FaArrowLeft className="me-2" /> Back to Products
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                {/* Product Name */}
                <FloatingLabel controlId="name" label="Product Name *" className="mb-3">
                  <Form.Control
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.name}
                    placeholder="Product Name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.name}
                  </Form.Control.Feedback>
                </FloatingLabel>

                {/* Category */}
                <FloatingLabel controlId="category" label="Category *" className="mb-3">
                  <Form.Select
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </Form.Select>
                </FloatingLabel>

                {/* Form Type */}
                <FloatingLabel controlId="presentation" label="Form Type *" className="mb-3">
                  <Form.Select
                    name="presentation"
                    value={product.presentation}
                    onChange={handleChange}
                  >
                    <option value="Powder Form">Powder Form</option>
                    <option value="Liquid Form">Liquid Form</option>
                    <option value="Seed Form">Seed Form</option>
                    <option value="Granules Form">Granules Form</option>
                    <option value="Jaivik Form">Jaivik Form</option>
                  </Form.Select>
                </FloatingLabel>

                {/* Presentation Size */}
                <FloatingLabel controlId="presentationSize" label="Presentation Size *" className="mb-3">
                  <Form.Select
                    name="presentationSize"
                    value={product.presentationSize}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.presentationSize}
                  >
                    {presentationOptions[product.presentation]?.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.presentationSize}
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Col>

              <Col md={6}>
                {/* Price */}
                <FloatingLabel controlId="price" label="Price (₹) *" className="mb-3">
                  <Form.Control
                    type="text"
                    name="price"
                    value={product.price}
                    onChange={handleNumberChange}
                    isInvalid={!!validationErrors.price}
                    placeholder="0.00"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.price}
                  </Form.Control.Feedback>
                </FloatingLabel>

                {/* Discount */}
                <FloatingLabel controlId="discount" label="Discount (%)" className="mb-3">
                  <Form.Control
                    type="text"
                    name="discount"
                    value={product.discount}
                    onChange={handleNumberChange}
                    isInvalid={!!validationErrors.discount}
                    placeholder="0-100"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.discount}
                  </Form.Control.Feedback>
                </FloatingLabel>

                {/* Quantity in Stock */}
                <FloatingLabel controlId="quantityInStock" label="Quantity in Stock *" className="mb-3">
                  <Form.Control
                    type="text"
                    name="quantityInStock"
                    value={product.quantityInStock}
                    onChange={handleNumberChange}
                    isInvalid={!!validationErrors.quantityInStock}
                    placeholder="0"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.quantityInStock}
                  </Form.Control.Feedback>
                </FloatingLabel>

                {/* Status */}
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="isActive"
                    label={
                      <span className="d-flex align-items-center">
                        {product.isActive ? (
                          <FaCheck className="text-success me-2" />
                        ) : (
                          <FaTimesCircle className="text-danger me-2" />
                        )}
                        {product.isActive ? 'Active (Visible to customers)' : 'Inactive (Hidden from customers)'}
                      </span>
                    }
                    checked={product.isActive}
                    onChange={(e) => setProduct(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Images */}
            <Form.Group className="mb-4">
              <Form.Label className="d-flex align-items-center">
                <FaImage className="me-2" /> Product Images *
              </Form.Label>
              {validationErrors.images && (
                <Alert variant="danger" className="py-2 d-flex align-items-center">
                  <FaInfoCircle className="me-2" />
                  {validationErrors.images}
                </Alert>
              )}
              <div className="d-flex flex-wrap mb-3">
                {product.images.map((img, index) => (
                  <div key={index} className="position-relative me-3 mb-3">
                    <Image
                      src={img}
                      thumbnail
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 rounded-circle p-0"
                      style={{ width: '24px', height: '24px' }}
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline-primary"
                onClick={() => setShowImageModal(true)}
                disabled={uploadingImage}
                className="d-flex align-items-center"
              >
                {uploadingImage ? (
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                ) : (
                  <FaPlus className="me-2" />
                )}
                Upload Image
              </Button>
            </Form.Group>

            {/* Suitable Crops */}
            <Form.Group className="mb-4">
              <Form.Label className="d-flex align-items-center">
                <FaLeaf className="me-2" /> Suitable for Crops
              </Form.Label>
              <div className="d-flex mb-2">
                <Form.Control
                  type="text"
                  value={cropInput}
                  onChange={(e) => setCropInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'crop')}
                  placeholder="Enter crop name and press Add or Enter"
                />
                <Button 
                  variant="outline-secondary" 
                  onClick={handleAddCrop} 
                  className="ms-2 d-flex align-items-center"
                >
                  <FaPlus className="me-1" /> Add
                </Button>
              </div>
              <div className="d-flex flex-wrap">
                {product.suitableForCrops.length > 0 ? (
                  product.suitableForCrops.map(crop => (
                    <Badge key={crop} bg="info" className="me-2 mb-2 d-flex align-items-center">
                      {crop}
                      <Button
                        variant="link"
                        size="sm"
                        className="text-white p-0 ms-1"
                        onClick={() => handleRemoveCrop(crop)}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))
                ) : (
                  <Alert variant="info" className="py-1 px-2 d-flex align-items-center">
                    <FaInfoCircle className="me-2" />
                    No crops added yet
                  </Alert>
                )}
              </div>
            </Form.Group>

            {/* Benefits */}
            <Form.Group className="mb-4">
              <Form.Label className="d-flex align-items-center">
                <FaLeaf className="me-2" /> Benefits *
              </Form.Label>
              {validationErrors.benefits && (
                <Alert variant="danger" className="py-2 d-flex align-items-center">
                  <FaInfoCircle className="me-2" />
                  {validationErrors.benefits}
                </Alert>
              )}
              <div className="d-flex mb-2">
                <Form.Control
                  type="text"
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'benefit')}
                  placeholder="Enter benefit and press Add or Enter"
                />
                <Button 
                  variant="outline-secondary" 
                  onClick={handleAddBenefit} 
                  className="ms-2 d-flex align-items-center"
                >
                  <FaPlus className="me-1" /> Add
                </Button>
              </div>
              <div className="d-flex flex-wrap">
                {product.benefits.length > 0 ? (
                  product.benefits.map((benefit, index) => (
                    <Badge key={index} bg="info" className="me-2 mb-2 d-flex align-items-center">
                      {benefit}
                      <Button
                        variant="link"
                        size="sm"
                        className="text-white p-0 ms-1"
                        onClick={() => handleRemoveBenefit(benefit)}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))
                ) : (
                  <Alert variant="info" className="py-1 px-2 d-flex align-items-center">
                    <FaInfoCircle className="me-2" />
                    No benefits added yet
                  </Alert>
                )}
              </div>
            </Form.Group>

            {/* Description */}
            <FloatingLabel controlId="description" label="Description *" className="mb-4">
              <Form.Control
                as="textarea"
                style={{ height: '100px' }}
                name="description"
                value={product.description}
                onChange={handleChange}
                isInvalid={!!validationErrors.description}
                placeholder="Enter product description"
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.description}
              </Form.Control.Feedback>
            </FloatingLabel>

            {/* Dosage */}
            <FloatingLabel controlId="dosage" label="Dosage Instructions *" className="mb-4">
              <Form.Control
                as="textarea"
                style={{ height: '80px' }}
                name="dosage"
                value={product.dosage}
                onChange={handleChange}
                isInvalid={!!validationErrors.dosage}
                placeholder="Enter dosage instructions"
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.dosage}
              </Form.Control.Feedback>
            </FloatingLabel>

            <div className="d-flex justify-content-end">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
                className="px-4 d-flex align-items-center"
              >
                {submitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" />
                    {isEdit ? 'Update Product' : 'Create Product'}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <ImageUploadModal
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        onUpload={handleImageUpload}
        uploading={uploadingImage}
      />
    </Container>
  );
};

export default AddEditProduct;
