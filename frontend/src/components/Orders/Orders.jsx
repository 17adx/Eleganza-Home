import React, { useEffect, useState } from "react";

import useAuth from "../../hooks/useAuth";
import { orders as ordersApi } from "../../api/orders";

import { Alert, Container, Form } from "react-bootstrap";

import "./Orders.css";

const Orders = () => {
  const { user, logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        logout();
        setLoading(false);
        return;
      }

      try {
        setError("");

        const response = await ordersApi.myOrders();

        const data = response.data?.results || response.data;

        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);

        setError(
          error.response?.data?.detail ||
            "Failed to load orders. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [logout]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await ordersApi.update(orderId, {
        status: newStatus,
      });

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order
        )
      );
    } catch (error) {
      console.error(
        `Failed to update status for order ${orderId}:`,
        error
      );

      setError(
        error.response?.data?.detail ||
          "Failed to update order status."
      );
    }
  };

  if (loading) {
    return (
      <div className="dot-spinner">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="dot-spinner__dot"
          />
        ))}
      </div>
    );
  }

  return (
    <Container className="orders-container">
      <h2>My Orders</h2>

      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {!orders.length ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="p-3 mb-3 border rounded"
          >
            <p>
              <strong>Order ID:</strong> {order.id}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {order.created_at
                ? new Date(
                    order.created_at
                  ).toLocaleDateString()
                : "N/A"}
            </p>

            <p>
              <strong>Status:</strong> {order.status}
            </p>

            <p>
              <strong>Total:</strong> ${order.total}
            </p>

            {user?.is_staff && (
              <Form.Select
                value={order.status}
                onChange={(event) =>
                  updateStatus(
                    order.id,
                    event.target.value
                  )
                }
              >
                <option value="PENDING">
                  Pending
                </option>

                <option value="PROCESSING">
                  Processing
                </option>

                <option value="SHIPPED">
                  Shipped
                </option>

                <option value="DELIVERED">
                  Delivered
                </option>
              </Form.Select>
            )}
          </div>
        ))
      )}
    </Container>
  );
};

export default Orders;