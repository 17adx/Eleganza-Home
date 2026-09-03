import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './contexts/AuthContext/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext/CartContext';

// Pages
import HomePage from './pages/Home';
import Products from './pages/Products';
import SingleProduct from './components/catalog/SingleProduct/SingleProduct';
import Categories from './pages/Categories';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";

// Components
import SocialLoginCallback from './components/auth/SocialLoginCallback/SocialLoginCallback';
import PrivateRoute from "./routes/PrivateRoute.jsx";
import Activation from './components/auth/Activation/Activation.jsx';
import ResetPassword from "./components/auth/LoginSignUp/Resend/ResetPassword.jsx";
import PasswordResetConfirm from './pages/PasswordResetConfirm.jsx';
import Cart from './pages/Cart';
import Checkout from './components/checkout/Checkout.jsx';

// CSS
import 'normalize.css';
import './App.css';

const App = () => {
  return (
    // Provide user and cart context to the entire app
    <AuthProvider>
      <CartProvider>
        {/* React Router Routes */}
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<Products />} />
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
          <Route path="/orders" element={<Orders />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;