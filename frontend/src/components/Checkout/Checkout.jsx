import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/navbar";
import Footer from "../footer/footer";
import { useUser } from "../../contexts/UserContext/UserContext";
import { useCart } from "../../contexts/CartContext/CartContext";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./Checkout.css";

const API_BASE = "https://eleganza-home.onrender.com/api";

const Checkout = () => {
  // Access cart items and ability to clear the cart
  const { cartItems, clearCart } = useCart();
  // Access user context (logged-in user or guest)
  const { user } = useUser();

  // Form states for shipping and payment
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [payment, setPayment] = useState("COD");
  const [email, setEmail] = useState(""); // Only used for guest checkout
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Calculate subtotal of all cart items
  const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  /**
   * Create an order by sending a POST request to the backend API
   * @param {object} data - Order payload including items, shipping, payment, etc.
   */
  const createOrder = async (data) => {
    const token = localStorage.getItem("access");
    const res = await fetch(`${API_BASE}/orders/orders/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}), // Add JWT if available
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create order");
    return res.json();
  };

  /**
   * Handle order confirmation
   * 1. Validate shipping address and cart
   * 2. Build order payload
   * 3. Send order request to API
   * 4. Clear cart and redirect to orders page
   */
  const handleConfirm = async () => {
    // Validation checks
    if (!street || !city || !country) {
      return Swal.fire("Error", "Please fill all shipping address fields.", "error");
    }
    if (cartItems.length === 0) {
      return Swal.fire("Error", "Your cart is empty.", "error");
    }
    if (!user?.user && !email) {
      return Swal.fire("Error", "Enter your email for guest checkout.", "error");
    }

    setLoading(true);

    try {
      // Prepare cart items for API request
      const itemsData = cartItems.map(item => ({
        product: item.product.id,
        quantity: item.quantity,
        price: item.price
      }));

      // Build order payload
      const orderData = {
        items: itemsData,
        shipping_address: `${street}, ${city}, ${country}`,
        payment_method: payment,
        email: user?.user ? user.user.email : email,
        ...( !user?.user && { session_key: localStorage.getItem("guest_cart_key") || "" }) // Include session key for guest checkout
      };

      // Send request to backend
      await createOrder(orderData);

      // Success message + redirect
      Swal.fire("Success", "Order confirmed! Check your email for details.", "success");
      clearCart(); // Empty cart after successful order
      navigate("/orders");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to create order. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container className="checkout-container">
        <h2>Checkout</h2>
        <Form>
          {/* If guest user → ask for email, otherwise show logged-in user email */}
          {!user?.user ? (
            <Form.Group className="mb-3">
              <Form.Label>Email (for guest checkout)</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </Form.Group>
          ) : (
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={user.user.email} readOnly />
            </Form.Group>
          )}

          {/* Shipping address inputs */}
          <h5>Shipping Address</h5>
          <Form.Group className="mb-3">
            <Form.Label>Street</Form.Label>
            <Form.Control value={street} onChange={e => setStreet(e.target.value)} placeholder="Street" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>City</Form.Label>
            <Form.Control value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Country</Form.Label>
            <Form.Control value={country} onChange={e => setCountry(e.target.value)} placeholder="Country" />
          </Form.Group>

          {/* Payment method */}
          <Form.Group className="mb-3">
            <Form.Label>Payment Method</Form.Label>
            <Form.Select value={payment} onChange={e => setPayment(e.target.value)}>
              <option value="COD">Cash on Delivery</option>
              <option value="CARD">Credit/Debit Card</option>
              <option value="PAYPAL">PayPal</option>
            </Form.Select>
          </Form.Group>

          {/* Order summary */}
          <div className="mb-3">
            <h4>Order Summary</h4>
            {cartItems.map(item => (
              <p key={item.id}>
                {item.title} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
              </p>
            ))}
            <h5>Subtotal: ${subtotal.toFixed(2)}</h5>
          </div>

          {/* Confirm order button */}
          <Button variant="success" onClick={handleConfirm} disabled={loading}>
            {loading ? <Spinner as="span" animation="border" size="sm" /> : "Confirm Order"}
          </Button>
        </Form>
      </Container>
      <Footer />
    </>
  );
};

export default Checkout;