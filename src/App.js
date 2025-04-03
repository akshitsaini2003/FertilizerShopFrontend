import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import LoginPage from './pages/auth/LoginPage';
import Register from './pages/auth/Register';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductList from './pages/admin/ProductList';
import AddEditProduct from './pages/admin/AddEditProduct';
import OrderList from './pages/admin/OrderList';
// import PrivateRoute from './components/PrivateRoute';
import AddressForm from './components/AddressForm';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="py-3">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          {/* Private User Routes */}
          <Route
          // element={<PrivateRoute />}
          >
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile/addresses" element={<AddressForm />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/order/:id" element={<OrderDetails />} />
          </Route>

          {/* Admin Routes */}
          <Route
          // element={<PrivateRoute admin />}
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<ProductList />} />
            <Route path="/admin/products/add" element={<AddEditProduct />} />
            <Route path="/admin/products/edit/:id" element={<AddEditProduct />} />
            <Route path="/admin/orders" element={<OrderList />} />
          </Route>
        </Routes>
      </main>
      <Footer />
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;