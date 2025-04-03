import React, { useState, useEffect } from 'react';
import { 
  Navbar, Container, Nav, NavDropdown, 
  Badge, Stack
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  FaShoppingCart, FaUser, FaSignOutAlt, 
  FaUserCircle, FaClipboardList, FaTachometerAlt,
  FaBox, FaListAlt, FaBars
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Header = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const updateCartCount = () => {
    try {
      const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      const count = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
      setCartCount(count);
    } catch (e) {
      console.error('Error reading cart items:', e);
      setCartCount(0);
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('cartItems');
    toast.success('Logged Out Successfully');
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand className="fw-bold">Shakumbhari Fertilizers</Navbar.Brand>
        </LinkContainer>

        {/* Cart icon - always visible */}
//        <LinkContainer to="/cart" className="d-lg-none me-3">
//   <Nav.Link className="position-relative">
//     <FaShoppingCart size={20} style={{color:"white"}} />
//     {cartCount > 0 && (
//       <Badge 
//         pill 
//         bg="success" 
//         style={{ 
//           fontSize: '0.65rem',
//           position: 'absolute',
//           top: '-5px',
//           right: '-5px'
//         }}
//       >
//         {cartCount}
//       </Badge>
//     )}
//   </Nav.Link>
// </LinkContainer>
<LinkContainer to="/cart" className="d-lg-none me-3">
  <Nav.Link className="position-relative">
    <FaShoppingCart size={20} style={{color:"white"}}/>
    {cartCount > 0 && (
      <Badge 
        pill 
        bg="success" 
        style={{ fontSize: '0.65rem' }}
        className="position-absolute top-0 start-100 translate-middle"
      >
        {cartCount}
      </Badge>
    )}
  </Nav.Link>
</LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav">
          <FaBars />
        </Navbar.Toggle>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {/* Cart - visible only on desktop */}
            <LinkContainer to="/cart" className="d-none d-lg-block">
              <Nav.Link className="position-relative me-3">
                <Stack direction="horizontal" gap={2}>
                  <FaShoppingCart size={18} />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <Badge 
                      pill 
                      bg="success" 
                      style={{ fontSize: '0.65rem' }}
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Stack>
              </Nav.Link>
            </LinkContainer>

            {userInfo ? (
              <>
                {/* Mobile menu items (shown in collapse) */}
                <div className="d-lg-none">
                  <LinkContainer to="/profile">
                    <Nav.Link className="d-flex align-items-center gap-2 py-2">
                      <FaUserCircle size={18} /> Profile
                    </Nav.Link>
                  </LinkContainer>
                  
                  <LinkContainer to="/my-orders">
                    <Nav.Link className="d-flex align-items-center gap-2 py-2">
                      <FaClipboardList size={18} /> My Orders
                    </Nav.Link>
                  </LinkContainer>

                  <Nav.Link 
                    onClick={logoutHandler}
                    className="d-flex align-items-center gap-2 py-2 text-danger"
                  >
                    <FaSignOutAlt size={18} /> Logout
                  </Nav.Link>
                </div>

                {/* Desktop dropdown */}
                <NavDropdown 
                  title={
                    <Stack direction="horizontal" gap={2} className="d-none d-lg-flex">
                      <FaUserCircle size={18} />
                      <span>{userInfo.name}</span>
                    </Stack>
                  } 
                  id="username"
                  align="end"
                  className="dropdown-menu-end d-none d-lg-block"
                  style={{ zIndex: 10000 }}
                >
                  <LinkContainer to="/profile">
                    <NavDropdown.Item className="d-flex align-items-center gap-2">
                      <FaUser size={14} /> Profile
                    </NavDropdown.Item>
                  </LinkContainer>

                  <LinkContainer to="/my-orders">
                    <NavDropdown.Item className="d-flex align-items-center gap-2">
                      <FaClipboardList size={14} /> My Orders
                    </NavDropdown.Item>
                  </LinkContainer>

                  {userInfo.isAdmin && (
                    <>
                      <NavDropdown.Divider />
                      <NavDropdown.Header>Admin Panel</NavDropdown.Header>
                      <LinkContainer to="/admin/dashboard">
                        <NavDropdown.Item className="d-flex align-items-center gap-2">
                          <FaTachometerAlt size={14} /> Dashboard
                        </NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/products">
                        <NavDropdown.Item className="d-flex align-items-center gap-2">
                          <FaBox size={14} /> Products
                        </NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/orders">
                        <NavDropdown.Item className="d-flex align-items-center gap-2">
                          <FaListAlt size={14} /> Orders
                        </NavDropdown.Item>
                      </LinkContainer>
                    </>
                  )}

                  <NavDropdown.Divider />
                  <NavDropdown.Item 
                    onClick={logoutHandler}
                    className="d-flex align-items-center gap-2 text-danger"
                  >
                    <FaSignOutAlt size={14} /> Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <LinkContainer to="/login" className="d-none d-lg-block">
                <Nav.Link className="d-flex align-items-center gap-2">
                  <FaUser size={18} /> Sign In
                </Nav.Link>
              </LinkContainer>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
