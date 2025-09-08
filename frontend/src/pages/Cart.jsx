import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import Navbar from '../components/navbar/navbar';
import Footer from '../components/Footer/footer';
import { useCart } from '../contexts/CartContext/CartContext';
import {
  Card,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Form,
  InputGroup,
  Alert,
  Container,
  Row,
  Col,
  Spinner
} from 'react-bootstrap';
import { FaThList, FaThLarge } from 'react-icons/fa';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity, loading } = useCart(); // Cart context
  const [layout, setLayout] = useState('grid'); // Grid or List layout
  const [coupon, setCoupon] = useState(''); // Coupon input
  const [appliedCoupon, setAppliedCoupon] = useState(null); // Stores applied coupon
  const [message, setMessage] = useState(''); // Message for coupon status

  // Helper: safely convert values to number
  const safeNumber = (val) => Number(val) || 0;

  // Calculate subtotal, shipping, discount, and total
  const subtotal = Array.isArray(cartItems)
    ? cartItems.reduce((acc, item) => acc + safeNumber(item.price) * safeNumber(item.quantity), 0)
    : 0;
  const shipping = subtotal >= 100 ? 0 : 10; // Free shipping for orders >= 100
  const discount = appliedCoupon === 'SAVE10' ? 0.1 * subtotal : 0; // 10% discount
  const total = subtotal - discount + shipping;

  // Show loading spinner while cart is loading
  if (loading) {
    return (
      <div className="dot-spinner">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="dot-spinner__dot"></div>
        ))}
      </div>
    );
  }

  // Handle layout toggle
  const handleLayoutChange = (val) => setLayout(val);

  // Handle coupon application
  const handleApplyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'SAVE10') {
      setAppliedCoupon('SAVE10');
      setMessage('Coupon applied: 10% discount!');
    } else {
      setAppliedCoupon(null);
      setMessage('Invalid coupon code.');
    }
  };

  return (
    <>
      <Navbar />
      <Container className="cart-wrapper">
        {/* Header and layout toggle */}
        <Row className="align-items-center mb-3">
          <Col>
            <h2>🛒 Shopping Cart</h2>
          </Col>
          <Col xs="auto">
            <ToggleButtonGroup type="radio" name="layoutOptions" value={layout} onChange={handleLayoutChange}>
              <ToggleButton id="grid-view" value="grid" className={`layout-toggle ${layout === 'grid' ? 'active-layout' : 'inactive-layout'}`}>
                <FaThLarge className="me-2" /> Grid
              </ToggleButton>
              <ToggleButton id="list-view" value="list" className={`layout-toggle ${layout === 'list' ? 'active-layout' : 'inactive-layout'}`}>
                <FaThList className="me-2" /> List
              </ToggleButton>
            </ToggleButtonGroup>
          </Col>
        </Row>

        {/* Empty cart message */}
        {(!Array.isArray(cartItems) || cartItems.length === 0) ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className={`cart-items ${layout === 'grid' ? 'grid-layout' : 'list-layout'}`}>
            {cartItems.map(item => {
              const price = safeNumber(item.price);
              const quantity = safeNumber(item.quantity);
              const lineTotal = price * quantity;
              const productImage = item.images && item.images.length > 0 ? item.images[0].image : '/placeholder.png';

              return (
                <Card key={item.id} className="cart-card">
                  <Row className="g-0 align-items-center">
                    <Col xs={layout === 'grid' ? 12 : 3} className="img-col">
                      <img src={productImage} alt={item.title || 'Product image'} className="cart-img" />
                    </Col>
                    <Col xs={layout === 'grid' ? 12 : 9}>
                      <Card.Body>
                        <Card.Title>{item.title || 'No title'}</Card.Title>
                        <Card.Text className="text-muted">{item.description || 'No description'}</Card.Text>
                        <p className="price">Price: ${price.toFixed(2)}</p>

                        {/* Quantity controls */}
                        <div className="quantity-controls">
                          <Button variant="outline-secondary" size="sm" onClick={() => decreaseQuantity(item.id)}>−</Button>
                          <span className="qty">{quantity}</span>
                          <Button variant="outline-secondary" size="sm" onClick={() => increaseQuantity(item.id)}>+</Button>
                          <span className="total">Total: ${lineTotal.toFixed(2)}</span>
                        </div>

                        {/* Category and Brand */}
                        <p className="info">
                          Category: {typeof item.category === "object" ? item.category?.name : item.category || 'N/A'} • 
                          Brand: {typeof item.brand === "object" ? item.brand?.name : item.brand || 'N/A'}
                        </p>

                        {/* Remove item */}
                        <Button variant="danger" size="sm" onClick={() => removeFromCart(item.id)}>Remove</Button>
                      </Card.Body>
                    </Col>
                  </Row>
                </Card>
              );
            })}
          </div>
        )}

        {/* Checkout section with coupon and totals */}
        {Array.isArray(cartItems) && cartItems.length > 0 && (
          <div className="checkout-section">
            <InputGroup className="coupon-group">
              <Form.Control placeholder="Enter coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
              <Button variant="primary" onClick={handleApplyCoupon}>Apply</Button>
            </InputGroup>

            {message && <Alert variant={appliedCoupon ? 'success' : 'danger'}>{message}</Alert>}

            <div className="totals">
              <p>Subtotal: ${safeNumber(subtotal).toFixed(2)}</p>
              <p>Discount: -${safeNumber(discount).toFixed(2)}</p>
              <p>Shipping: {safeNumber(shipping) === 0 ? 'Free' : `$${safeNumber(shipping).toFixed(2)}`}</p>
              <h4>Total: ${safeNumber(total).toFixed(2)}</h4>
              <Button variant="success" onClick={() => navigate("/checkout")}>
                Checkout
              </Button>
            </div>
          </div>
        )}
      </Container>
      <Footer />
    </>
  );
};

export default Cart;