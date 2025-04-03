import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="container">
      <h2 className="my-4">Admin Dashboard</h2>
      <Row>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Products</Card.Title>
              <Card.Text>
                Manage your products inventory
              </Card.Text>
              <Link to="/admin/products" className="btn btn-primary">
                Manage Products
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Orders</Card.Title>
              <Card.Text>
                View and manage customer orders
              </Card.Text>
              <Link to="/admin/orders" className="btn btn-primary">
                Manage Orders
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;