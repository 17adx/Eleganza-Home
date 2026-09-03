import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../common/Navbar/navbar";
import Footer from "../common/Footer/footer";

import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";

import { orders } from "../../api/orders";

import { Container, Form, Button, Spinner } from "react-bootstrap";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import "./Checkout.css";

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();

  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [payment, setPayment] = useState("COD");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const subtotal = cartItems.reduce(
    (accumulator, item) =>
      accumulator + item.price * item.quantity,
    0
  );

  const createOrder = async (data) => {
    const response = await orders.create(data);

    return response.data;
  };

  const handleConfirm = async () => {
    if (!street || !city || !country) {
      return Swal.fire(
        "Error",
        "Please fill all shipping address fields.",
        "error"
      );
    }

    if (cartItems.length === 0) {
      return Swal.fire(
        "Error",
        "Your cart is empty.",
        "error"
      );
    }

    if (!user && !email) {
      return Swal.fire(
        "Error",
        "Enter your email for guest checkout.",
        "error"
      );
    }

    setLoading(true);

    try {
      const itemsData = cartItems.map((item) => ({
        product: item.product.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const orderData = {
        items: itemsData,
        shipping_address: `${street}, ${city}, ${country}`,
        payment_method: payment,
        email: user ? user.email : email,
        ...(!user && {
          session_key:
            localStorage.getItem("guest_cart_key") || "",
        }),
      };

      await createOrder(orderData);

      await Swal.fire(
        "Success",
        "Order confirmed! Check your email for details.",
        "success"
      );

      clearCart();

      navigate("/orders");
    } catch (err) {
      console.error("Failed to create order:", err);

      Swal.fire(
        "Error",
        "Failed to create order. Please try again.",
        "error"
      );
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
          {!user ? (
            <Form.Group className="mb-3">
              <Form.Label>
                Email (for guest checkout)
              </Form.Label>

              <Form.Control
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
              />
            </Form.Group>
          ) : (
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>

              <Form.Control
                type="email"
                value={user.email}
                readOnly
              />
            </Form.Group>
          )}

          <h5>Shipping Address</h5>

          <Form.Group className="mb-3">
            <Form.Label>Street</Form.Label>

            <Form.Control
              value={street}
              onChange={(event) =>
                setStreet(event.target.value)
              }
              placeholder="Street"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>City</Form.Label>

            <Form.Control
              value={city}
              onChange={(event) =>
                setCity(event.target.value)
              }
              placeholder="City"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Country</Form.Label>

            <Form.Control
              value={country}
              onChange={(event) =>
                setCountry(event.target.value)
              }
              placeholder="Country"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Payment Method</Form.Label>

            <Form.Select
              value={payment}
              onChange={(event) =>
                setPayment(event.target.value)
              }
            >
              <option value="COD">
                Cash on Delivery
              </option>

              <option value="CARD">
                Credit/Debit Card
              </option>

              <option value="PAYPAL">
                PayPal
              </option>
            </Form.Select>
          </Form.Group>

          <div className="mb-3">
            <h4>Order Summary</h4>

            {cartItems.map((item) => (
              <p key={item.id}>
                {item.title} x {item.quantity} = $
                {(item.price * item.quantity).toFixed(2)}
              </p>
            ))}

            <h5>
              Subtotal: ${subtotal.toFixed(2)}
            </h5>
          </div>

          <Button
            variant="success"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
              />
            ) : (
              "Confirm Order"
            )}
          </Button>
        </Form>
      </Container>

      <Footer />
    </>
  );
};

export default Checkout;