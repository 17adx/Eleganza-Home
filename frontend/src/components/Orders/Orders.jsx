import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../../contexts/UserContext/UserContext";
import { Container, Spinner, Form } from "react-bootstrap";
import "./Orders.css";

const Orders = () => {
  // --- User Context to get current user and logout function ---
  const { user, logout } = useUser();

  // --- Local state ---
  const [orders, setOrders] = useState([]); // stores user's orders
  const [loading, setLoading] = useState(true); // loading state for spinner

  /**
   * Fetch orders on component mount
   * - Uses JWT token from localStorage for authentication
   * - If no token is found, logs the user out
   */
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return logout();

    axios.get("http://localhost:8000/api/orders/orders/", { 
      headers: { Authorization: `Bearer ${token}` } 
    })
    .then(res => {
      // Some endpoints return paginated results, so handle both
      const data = res.data.results || res.data;
      setOrders(Array.isArray(data) ? data : []);
    })
    .catch(err => {
      console.error("Failed to fetch orders:", err);
      logout(); // logout if request fails (invalid/expired token)
    })
    .finally(() => setLoading(false));
  }, [logout]);

  /**
   * Update order status (for staff/admin users)
   * @param {number} orderId - ID of the order to update
   * @param {string} newStatus - New status (Pending, Processing, etc.)
   */
  const updateStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem("access");
    try {
      await axios.patch(
        `http://localhost:8000/api/orders/orders/${orderId}/`, 
        { status: newStatus }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state to reflect change instantly
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch(err) {
      console.error(`Failed to update status for order ${orderId}:`, err);
    }
  };

  // --- Loading State: show spinner while fetching orders ---
  if (loading) return (
    <div className="dot-spinner">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div key={idx} className="dot-spinner__dot"></div>
      ))}
    </div>
  );

  // --- No Orders State ---
  if (!orders || orders.length === 0) 
    return <Container className="orders-container">No orders found.</Container>;

  // --- Orders List Rendering ---
  return (
    <Container className="orders-container">
      <h2>My Orders</h2>
      {orders.map(order => (
        <div key={order.id} className="p-3 mb-3 border rounded">
          {/* Display basic order info */}
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Date:</strong> {order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}</p>          
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Total:</strong> ${order.total}</p>

          {/* Admin/Staff: allow updating order status */}
          {user.is_staff && (
            <Form.Select
              value={order.status}
              onChange={e => updateStatus(order.id, e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </Form.Select>
          )}
        </div>
      ))}
    </Container>
  );
};

export default Orders;