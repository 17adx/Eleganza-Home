import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

import { catalog } from "../../api/catalog";

import {
  Alert,
  Button,
  Form,
  Modal,
} from "react-bootstrap";

import "./Wishlist.css";

const Wishlist = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        logout();
        setLoading(false);
        navigate("/login");
        return;
      }

      try {
        setError("");

        const response = await catalog.wishlist();

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

        setWishlist(data);
      } catch (error) {
        console.error(
          "Failed to fetch wishlist:",
          error
        );

        setError(
          error.response?.data?.detail ||
            "Failed to load wishlist. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [navigate, logout]);

  const handleEditClick = (item) => {
    setCurrentItem(item);
    setQuantity(item.quantity || 1);
    setShowModal(true);
  };

  const handleDelete = async (itemId) => {
    try {
      await catalog.deleteWishlistItem(itemId);

      setWishlist((previousWishlist) =>
        previousWishlist.filter(
          (item) => item.id !== itemId
        )
      );
    } catch (error) {
      console.error(
        "Failed to delete wishlist item:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Failed to delete item."
      );
    }
  };

  const handleSave = async () => {
    if (!currentItem) {
      return;
    }

    if (quantity < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    try {
      await catalog.updateWishlistItem(
        currentItem.id,
        { quantity }
      );

      setWishlist((previousWishlist) =>
        previousWishlist.map((item) =>
          item.id === currentItem.id
            ? {
                ...item,
                quantity,
              }
            : item
        )
      );

      setShowModal(false);
      setCurrentItem(null);
      setError("");
    } catch (error) {
      console.error(
        "Failed to update wishlist item:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Failed to update item."
      );
    }
  };

  if (loading) {
    return (
      <div className="dot-spinner h-screen flex justify-center items-center">
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
    <div className="whish-list-container">
      <div className="min-h-screen p-4 max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          My Wishlist
        </h1>

        {error && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {wishlist.length === 0 ? (
          <div className="text-center mt-6 flex justify-center items-center">
            ❤️ Your wishlist is empty.
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 justify-center">
            {wishlist.map((item) => (
              <div
                className="card-container-products"
                key={item.id}
              >
                <div className="card-effect">
                  <div
                    className="card-inner"
                    onClick={() =>
                      navigate(
                        `/product/${
                          item.product?.id || item.id
                        }`
                      )
                    }
                  >
                    <div className="card__liquid"></div>

                    <div className="card__shine"></div>

                    <div className="card__glow"></div>

                    <div className="card__content">
                      <div className="card__badge">
                        WISHLIST
                      </div>

                      <div
                        className="card__image"
                        style={{
                          "--bg-color": "#6c5ce7",
                          backgroundImage: `url(${
                            item.product?.images?.[0]
                              ?.image ||
                            item.image ||
                            "fallback.jpg"
                          })`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      ></div>

                      <div className="card__text">
                        <p className="card__title">
                          {item.product?.title ||
                            item.name}
                        </p>

                        <p className="card__description text-truncate">
                          {item.product?.description ||
                            "No description"}
                        </p>
                      </div>

                      <div className="card__footer flex justify-between items-center">
                        <div>
                          <div className="card__price">
                            $
                            {item.product
                              ?.final_price ??
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
                            onClick={(event) => {
                              event.stopPropagation();
                              handleEditClick(item);
                            }}
                          >
                            Edit
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
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
        )}
      </div>

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setCurrentItem(null);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Edit Wishlist Item
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Quantity</Form.Label>

              <Form.Control
                type="number"
                min={1}
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    Number(event.target.value)
                  )
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
              setCurrentItem(null);
            }}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSave}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Wishlist;