import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Context Providers
import { UserProvider } from './contexts/UserContext/UserContext';
import { CartProvider } from './contexts/CartContext/CartContext';

// Pages
import HomePage from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import SingleProduct from './components/SingleProduct/SingleProduct';
import Categories from './pages/Categories';
import Login from './pages/Login';
import Profile from './pages/Profile';
import OrdersPage from "./pages/OrdersPage";
import WishlistPage from "./pages/WishlistPage";

// Components
import SocialLoginCallback from './components/SocialLoginCallback/SocialLoginCallback';
import PrivateRoute from "./contexts/PrivateRoute/PrivateRoute.jsx";
import Activation from './contexts/Activation/Activation.jsx';
import ResetPassword from "./components/LoginSignUp/Resend/ResetPassword.jsx";
import PasswordResetConfirm from './pages/PasswordResetConfirm.jsx';
import Cart from './pages/Cart';
import Checkout from './components/Checkout/Checkout';

// CSS
import 'normalize.css';
import './App.css';

const App = () => {
  return (
    // Provide user and cart context to the entire app
    <UserProvider>
      <CartProvider>
        {/* React Router Routes */}
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<SingleProduct />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/login" element={<Login />} />
          <Route path="/social-login" element={<SocialLoginCallback />} />
          <Route path="/activate/:uid/:token" element={<Activation />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/password-reset-confirm/:uid/:token" element={<PasswordResetConfirm />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* Protected routes */}
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
        </Routes>
      </CartProvider>
    </UserProvider>
  );
};

export default App;