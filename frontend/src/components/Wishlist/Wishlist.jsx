import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext/UserContext";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import "./Wishlist.css";

/**
 * Wishlist Component
 * Displays the logged-in user's wishlist with options to edit quantity or remove items.
 * Requires user authentication.
 */
const Wishlist = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser(); // Access user context functions

  // State to hold wishlist items and loading status
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state for editing quantity
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [quantity, setQuantity] = useState(1);

  /**
   * Fetch wishlist items when component mounts
   * Redirect to login if no token found
   */
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchWishlist = async () => {
      try {
        const res = await axios.get(
          "https://eleganza-home.onrender.com/api/catalog/wishlist/",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setWishlist(data);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
        logout();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [navigate, logout]);

  /**
   * Open modal to edit quantity of a wishlist item
   * @param {Object} item - Wishlist item
   */
  const handleEditClick = (item) => {
    setCurrentItem(item);
    setQuantity(item.quantity || 1);
    setShowModal(true);
  };

  /**
   * Delete a wishlist item
   * @param {number} itemId - Wishlist item ID
   */
  const handleDelete = async (itemId) => {
    const token = localStorage.getItem("access");
    try {
      await axios.delete(
        `https://eleganza-home.onrender.com/api/catalog/wishlist/${itemId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWishlist((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("Failed to delete wishlist item:", err);
      alert("⚠️ Failed to delete item.");
    }
  };

  /**
   * Save updated quantity for the current item in the modal
   */
  const handleSave = async () => {
    if (!currentItem) return;
    const token = localStorage.getItem("access");
    try {
      await axios.patch(
        `https://eleganza-home.onrender.com/api/catalog/wishlist/${currentItem.id}/`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWishlist((prev) =>
        prev.map((item) =>
          item.id === currentItem.id ? { ...item, quantity } : item
        )
      );
      setShowModal(false);
    } catch (err) {
      console.error("Failed to update wishlist item:", err);
      alert("⚠️ Failed to update item.");
    }
  };

  // Show loading spinner while fetching data
  if (loading)
    return (
      <div className="dot-spinner h-screen flex justify-center items-center">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="dot-spinner__dot"></div>
        ))}
      </div>
    );

  // Show empty state if no items in wishlist
  if (!Array.isArray(wishlist) || wishlist.length === 0)
    return (
      <div className="text-center mt-6 min-h-screen flex justify-center items-center">
        ❤️ Your wishlist is empty.
      </div>
    );

  return (
    <>
      <div className="whish-list-container">
        <div className="min-h-screen p-4 max-w-6xl mx-auto">
          <h1 className="text-3xl font-semibold mb-6 text-center">
            My Wishlist
          </h1>

          {/* Grid of wishlist cards */}
          <div className="flex flex-wrap gap-4 justify-center">
            {wishlist.map((item) => (
              <div className="card-container-products" key={item.id}>
                <div className="card-effect">
                  <div
                    className="card-inner"
                    onClick={() =>
                      navigate(`/product/${item.product?.id || item.id}`)
                    }
                  >
                    <div className="card__liquid"></div>
                    <div className="card__shine"></div>
                    <div className="card__glow"></div>
                    <div className="card__content">
                      <div className="card__badge">WISHLIST</div>

                      {/* Product image */}
                      <div
                        className="card__image"
                        style={{
                          "--bg-color": "#6c5ce7",
                          backgroundImage: `url(${
                            item.product?.images?.[0]?.image ||
                            item.image ||
                            "fallback.jpg"
                          })`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      ></div>

                      {/* Product details */}
                      <div className="card__text">
                        <p className="card__title">
                          {item.product?.title || item.name}
                        </p>
                        <p className="card__description text-truncate">
                          {item.product?.description || "No description"}
                        </p>
                      </div>

                      {/* Footer with price, quantity, and action buttons */}
                      <div className="card__footer flex justify-between items-center">
                        <div>
                          <div className="card__price">
                            $
                            {item.product?.final_price ??
                              item.product?.price ??
                              item.price}
                          </div>
                          {item.quantity && (
                            <div className="card__qty">
                              Qty: {item.quantity}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(item);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal for editing quantity */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Wishlist Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleSave}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default Wishlist;