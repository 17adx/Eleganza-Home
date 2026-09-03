import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "../../common/Navbar/navbar";
import Footer from "../../common/Footer/footer";

import useCart from "../../../hooks/useCart";
import useAuth from "../../../hooks/useAuth";

import { catalog } from "../../../api/catalog";

import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Carousel,
  Form,
  Alert,
  Card,
} from "react-bootstrap";

import "./SingleProduct.css";

const SingleProduct = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await catalog.getProduct(id);

        setProduct(response.data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("⚠️ Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?.category) {
        return;
      }

      const categorySlug =
        typeof product.category === "string"
          ? product.category
          : product.category.slug;

      if (!categorySlug) {
        return;
      }

      try {
        const response = await catalog.listProducts({
          category: categorySlug,
        });

        const data = response.data;

        const filteredProducts = (data.results || []).filter(
          (item) => item.id !== product.id
        );

        setRelatedProducts(filteredProducts);
      } catch (err) {
        console.error("Failed to fetch related products:", err);
        setRelatedProducts([]);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  // Add product to cart
  const handleAddToCart = () => {
    if (!product?.id) {
      alert("⚠️ Cannot add product to cart: ID is missing");
      return;
    }

    addToCart(product);
    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  // Add product to wishlist
  const handleAddToWishlist = async () => {
    if (!user) {
      alert("⚠️ You must be logged in to add to wishlist.");
      return;
    }

    const token = localStorage.getItem("access");

    if (!token) {
      alert("⚠️ No token found. Please log in again.");
      return;
    }

    try {
      await catalog.addToWishlist(product.id);

      setWishlistAdded(true);

      setTimeout(() => {
        setWishlistAdded(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to add to wishlist:", err);

      const errorMessage =
        err.response?.data?.detail ||
        "Failed to add product to wishlist.";

      alert(`⚠️ ${errorMessage}`);
    }
  };

  // Submit customer review
  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!user) {
      alert("⚠️ You must be logged in to submit a review.");
      return;
    }

    const token = localStorage.getItem("access");

    if (!token) {
      alert("⚠️ No token found. Please log in again.");
      return;
    }

    try {
      const response = await catalog.createReview(id, {
        rating,
        comment,
      });

      const newReview = response.data;

      setProduct((prev) => ({
        ...prev,
        reviews: [newReview, ...(prev.reviews || [])],
      }));

      setComment("");
      setRating(5);
    } catch (err) {
      console.error("Failed to submit review:", err);

      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.comment?.[0] ||
        "Failed to submit review.";

      alert(`⚠️ ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="dot-spinner">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="dot-spinner__dot"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-center mt-5">{error}</p>;
  }

  if (!product) {
    return (
      <p className="text-center mt-5">
        ❌ Product not found.
      </p>
    );
  }

  const avgRating =
    product.reviews && product.reviews.length > 0
      ? (
          product.reviews.reduce(
            (sum, review) => sum + review.rating,
            0
          ) / product.reviews.length
        ).toFixed(1)
      : null;

  return (
    <>
      <Navbar />

      <Container className="single-product-container">
        <Row className="align-items-center mb-5">
          <Col md={6} className="text-center mb-4">
            {product.images && product.images.length > 0 ? (
              <Carousel fade className="w-100">
                {product.images.map((image, index) => (
                  <Carousel.Item key={index}>
                    <img
                      src={image.image}
                      alt={`Slide ${index + 1}`}
                      className="d-block w-100 rounded shadow"
                      style={{
                        maxHeight: "400px",
                        objectFit: "contain",
                        margin: "0 auto",
                      }}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            ) : (
              <img
                src="/fallback.jpg"
                alt="No Image"
                className="img-fluid rounded shadow"
                style={{
                  maxHeight: "400px",
                  objectFit: "contain",
                }}
              />
            )}
          </Col>

          <Col md={6} className="text-center">
            <h2 className="fw-bold">{product.title}</h2>

            <p className="text-muted">
              {product.description}
            </p>

            <h4 className="text-danger mb-3">
              ${product.final_price ?? product.price}

              {product.discount_percent > 0 && (
                <small className="text-success ms-2">
                  (-{product.discount_percent}%)
                </small>
              )}
            </h4>

            <p>
              <strong>Stock:</strong> {product.stock}
            </p>

            <p>
              <strong>Category:</strong>{" "}
              {product.category ?? "N/A"}
            </p>

            <p>
              <strong>Brand:</strong>{" "}
              {product.brand ?? "N/A"}
            </p>

            <p>
              <strong>Seller:</strong>{" "}
              {product.seller?.username ?? product.seller}
            </p>

            {product.tags && product.tags.length > 0 && (
              <p>
                <strong>Tags:</strong>{" "}
                {product.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    bg="secondary"
                    className="me-1"
                  >
                    {tag}
                  </Badge>
                ))}
              </p>
            )}

            <p>
              <strong>Average Rating:</strong> ⭐{" "}
              {avgRating ?? "No rating yet"}
            </p>

            {added ? (
              <div className="added-message animate">
                ✔️ Added to cart!
              </div>
            ) : (
              <Button
                className="cart-button"
                variant="success"
                onClick={handleAddToCart}
              >
                🛒 Add to Cart
              </Button>
            )}

            <Button
              className="ms-2 wishlist-button"
              variant={wishlistAdded ? "secondary" : "warning"}
              onClick={handleAddToWishlist}
            >
              ❤️ {wishlistAdded ? "Added" : "Add to Wishlist"}
            </Button>

            {wishlistAdded && (
              <div className="added-message animate">
                ✔️ Added to wishlist!
              </div>
            )}
          </Col>
        </Row>

        {relatedProducts.length > 0 && (
          <Row className="mb-5">
            <Col md={12}>
              <h3 className="fw-bold mb-4">
                Related Products
              </h3>

              <Carousel indicators={false} interval={null}>
                {Array.from({
                  length: Math.ceil(
                    relatedProducts.length / 2
                  ),
                }).map((_, index) => (
                  <Carousel.Item key={index}>
                    <Row className="justify-content-center">
                      {relatedProducts
                        .slice(index * 2, index * 2 + 2)
                        .map((relatedProduct) => (
                          <Col
                            xs={12}
                            md={6}
                            key={relatedProduct.id}
                            className="d-flex justify-content-center"
                          >
                            <Card className="mx-2 shadow-sm related-card">
                              <Card.Img
                                variant="top"
                                src={
                                  relatedProduct.images?.[0]?.image ||
                                  "/fallback.jpg"
                                }
                                className="related-img"
                              />

                              <Card.Body className="d-flex flex-column">
                                <Card.Title className="related-title">
                                  {relatedProduct.title}
                                </Card.Title>

                                <Card.Text className="text-danger fw-bold mb-2">
                                  $
                                  {relatedProduct.final_price ??
                                    relatedProduct.price}
                                </Card.Text>

                                <Button
                                  variant="primary"
                                  href={`/product/${relatedProduct.id}`}
                                  className="mt-auto"
                                >
                                  View Product
                                </Button>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                    </Row>
                  </Carousel.Item>
                ))}
              </Carousel>
            </Col>
          </Row>
        )}

        <Row className="mt-5">
          <Col md={12}>
            <h3 className="fw-bold mb-4">
              Customer Reviews
            </h3>

            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review, index) => {
                const username =
                  review.user?.username || "User";

                const avatarUrl = review.user?.avatar
                  ? review.user.avatar
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      username
                    )}&background=random&size=64`;

                return (
                  <div
                    key={index}
                    className="border rounded p-3 mb-3 shadow-sm bg-light"
                    style={{
                      borderLeft: "5px solid #0d6efd",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center">
                        <img
                          src={avatarUrl}
                          alt={username}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            marginRight: "10px",
                          }}
                        />

                        <strong className="text-primary">
                          {username}
                        </strong>
                      </div>

                      <small className="text-muted">
                        {new Date(
                          review.created_at
                        ).toLocaleDateString()}
                      </small>
                    </div>

                    <div className="mb-2">
                      {"⭐".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>

                    <p className="mb-0">
                      {review.comment}
                    </p>
                  </div>
                );
              })
            ) : (
              <Alert variant="info">
                No reviews yet. Be the first to review!
              </Alert>
            )}

            <h5 className="fw-bold mt-4">
              Leave a Review
            </h5>

            <Form onSubmit={handleSubmitReview}>
              <Form.Group className="mb-3">
                <Form.Label>Rating</Form.Label>

                <Form.Select
                  value={rating}
                  onChange={(event) =>
                    setRating(Number(event.target.value))
                  }
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} Stars
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Comment</Form.Label>

                <Form.Control
                  as="textarea"
                  rows={3}
                  value={comment}
                  onChange={(event) =>
                    setComment(event.target.value)
                  }
                  placeholder="Write your comment..."
                />
              </Form.Group>

              <Button type="submit" variant="primary">
                Submit Review
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>

      <Footer />
    </>
  );
};

export default SingleProduct;