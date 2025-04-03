import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';

const ImageUploadModal = ({ show, onHide, onUpload, uploading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        setError('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      setError(null);
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    onUpload(selectedFile);
    setSelectedFile(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Upload Product Image</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group>
          <Form.Label>Select Image</Form.Label>
          <Form.Control 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <div className="small text-muted mt-2">
            Supported formats: JPEG, PNG, WEBP. Max size: 5MB
          </div>
        </Form.Group>
        {selectedFile && (
          <div className="mt-3">
            <h6>Preview:</h6>
            <img 
              src={URL.createObjectURL(selectedFile)} 
              alt="Preview" 
              style={{ maxWidth: '100%', maxHeight: '200px' }}
              className="img-thumbnail"
            />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={uploading}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? (
            <>
              <Spinner as="span" animation="border" size="sm" className="me-2" />
              Uploading...
            </>
          ) : (
            'Upload Image'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageUploadModal;