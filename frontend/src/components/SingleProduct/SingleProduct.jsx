import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../navbar/navbar';
import Footer from '../Footer/footer';
import { useCart } from '../../contexts/CartContext/CartContext';
import { useUser } from '../../contexts/UserContext/UserContext';
import { Container, Row, Col, Button, Spinner, Badge, Carousel, Form, Alert, Card } from 'react-bootstrap';
import './SingleProduct.css';

const API_BASE = 'http://localhost:8000/api';

const SingleProduct = () => {
  const { id } = useParams(); // Extract product ID from URL
  const { addToCart } = useCart(); // Cart context
  const { user } = useUser(); // User context

  // State variables
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  /**
   * Fetch single product details on component mount
   */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE}/catalog/products/${id}/`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError("⚠️ Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  /**
   * Fetch related products whenever main product changes
   * Excludes the current product itself
   */
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?.category) return;
      const categorySlug = typeof product.category === "string" ? product.category : product.category.slug;

      try {
        const res = await fetch(`${API_BASE}/catalog/products/?category=${categorySlug}`);
        const data = await res.json();
        const filtered = (data.results || []).filter(p => p.id !== product.id);
        setRelatedProducts(filtered);
      } catch (err) {
        console.error('Failed to fetch related products:', err);
      }
    };
    fetchRelatedProducts();
  }, [product]);

  /**
   * Add product to cart
   */
  const handleAddToCart = () => {
    if (!product?.id) return alert("⚠️ Cannot add product to cart: ID is missing");
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  /**
   * Add product to wishlist
   */
  const handleAddToWishlist = async () => {
    if (!user) return alert("⚠️ You must be logged in to add to wishlist.");
    const token = localStorage.getItem("access");
    if (!token) return alert("⚠️ No token found. Please log in again.");

    try {
      const res = await fetch(`${API_BASE}/catalog/wishlist/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ product_id: product.id }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to add to wishlist');
      setWishlistAdded(true);
      setTimeout(() => setWishlistAdded(false), 2000);
    } catch (err) {
      console.error("Failed to add to wishlist:", err);
      alert(`⚠️ Failed to add product to wishlist. ${err.message}`);
    }
  };

  /**
   * Submit customer review
   */
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return alert("⚠️ You must be logged in to submit a review.");
    const token = localStorage.getItem('access');
    if (!token) return alert("⚠️ No token found. Please log in again.");

    try {
      const res = await fetch(`${API_BASE}/catalog/products/${id}/reviews/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rating, comment })
      });
      if (!res.ok) throw new Error('Failed to submit review');
      const newReview = await res.json();
      setProduct(prev => ({ ...prev, reviews: [newReview, ...(prev.reviews || [])] }));
      setComment("");
      setRating(5);
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert(`⚠️ Failed to submit review. ${err.message}`);
    }
  };

  // Show loading spinner
  if (loading) return (
    <div className="dot-spinner">
      {Array.from({ length: 8 }).map((_, i) => <div key={i} className="dot-spinner__dot"></div>)}
    </div>
  );

  // Show error messages
  if (error) return <p className="text-center mt-5">{error}</p>;
  if (!product) return <p className="text-center mt-5">❌ Product not found.</p>;

  // Calculate average rating
  const avgRating = product.reviews && product.reviews.length > 0 
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : null;

  return (
    <>
      <Navbar />
      <Container className='single-product-container'>
        {/* ---------------- Product Details Section ---------------- */}
        <Row className="align-items-center mb-5">
          {/* Product Images Carousel */}
          <Col md={6} className="text-center mb-4">
            {product.images && product.images.length > 0 ? (
              <Carousel fade className="w-100">
                {product.images.map((img, idx) => (
                  <Carousel.Item key={idx}>
                    <img
                      src={img.image}
                      alt={`Slide ${idx + 1}`}
                      className="d-block w-100 rounded shadow"
                      style={{ maxHeight: '400px', objectFit: 'contain', margin: '0 auto' }}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            ) : (
              <img src="/fallback.jpg" alt="No Image" className="img-fluid rounded shadow" style={{ maxHeight: '400px', objectFit: 'contain' }} />
            )}
          </Col>

          {/* Product Info */}
          <Col md={6} className="text-center">
            <h2 className="fw-bold">{product.title}</h2>
            <p className="text-muted">{product.description}</p>
            <h4 className="text-danger mb-3">
              ${product.final_price ?? product.price}
              {product.discount_percent > 0 && <small className="text-success ms-2">(-{product.discount_percent}%)</small>}
            </h4>
            <p><strong>Stock:</strong> {product.stock}</p>
            <p><strong>Category:</strong> {product.category ?? "N/A"}</p>
            <p><strong>Brand:</strong> {product.brand ?? "N/A"}</p>
            <p><strong>Seller:</strong> {product.seller?.username ?? product.seller}</p>
            {product.tags && product.tags.length > 0 && (
              <p>
                <strong>Tags:</strong>{" "}
                {product.tags.map((tag, i) => <Badge key={i} bg="secondary" className="me-1">{tag}</Badge>)}
              </p>
            )}
            <p><strong>Average Rating:</strong> ⭐ {avgRating ?? "No rating yet"}</p>

            {/* Add to cart & wishlist buttons */}
            {added ? <div className="added-message animate">✔️ Added to cart!</div> : 
              <Button className="cart-button" variant="success" onClick={handleAddToCart}>🛒 Add to Cart</Button>}
            <Button
              className="ms-2 wishlist-button"
              variant={wishlistAdded ? "secondary" : "warning"}
              onClick={handleAddToWishlist}
            >
              ❤️ {wishlistAdded ? "Added" : "Add to Wishlist"}
            </Button>
            {wishlistAdded && <div className="added-message animate">✔️ Added to wishlist!</div>}
          </Col>
        </Row>

        {/* ---------------- Related Products Section ---------------- */}
        {relatedProducts.length > 0 && (
          <Row className="mb-5">
            <Col md={12}>
              <h3 className="fw-bold mb-4">Related Products</h3>
              <Carousel indicators={false} interval={null}>
                {Array.from({ length: Math.ceil(relatedProducts.length / 2) }).map((_, idx) => (
                  <Carousel.Item key={idx}>
                    <Row className="justify-content-center">
                      {relatedProducts.slice(idx*2, idx*2+2).map((rel) => (
                        <Col xs={12} md={6} key={rel.id} className="d-flex justify-content-center">
                          <Card className="mx-2 shadow-sm related-card">
                            <Card.Img variant="top" src={rel.images?.[0]?.image || '/fallback.jpg'} className="related-img"/>
                            <Card.Body className="d-flex flex-column">
                              <Card.Title className="related-title">{rel.title}</Card.Title>
                              <Card.Text className="text-danger fw-bold mb-2">${rel.final_price ?? rel.price}</Card.Text>
                              <Button variant="primary" href={`/product/${rel.id}`} className="mt-auto">View Product</Button>
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

        {/* ---------------- Customer Reviews Section ---------------- */}
        <Row className="mt-5">
          <Col md={12}>
            <h3 className="fw-bold mb-4">Customer Reviews</h3>
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review, i) => {
                const username = review.user?.username || "User";
                const avatarUrl = review.user?.avatar ? review.user.avatar : `https://ui-avatars.com/api/?name=${username}&background=random&size=64`;

                return (
                  <div key={i} className="border rounded p-3 mb-3 shadow-sm bg-light" style={{ borderLeft: "5px solid #0d6efd" }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center">
                        <img src={avatarUrl} alt={username} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", marginRight: "10px" }}/>
                        <strong className="text-primary">{username}</strong>
                      </div>
                      <small className="text-muted">{new Date(review.created_at).toLocaleDateString()}</small>
                    </div>
                    <div className="mb-2">{"⭐".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                    <p className="mb-0">{review.comment}</p>
                  </div>
                );
              })
            ) : (
              <Alert variant="info">No reviews yet. Be the first to review!</Alert>
            )}

            {/* Review submission form */}
            <h5 className="fw-bold mt-4">Leave a Review</h5>
            <Form onSubmit={handleSubmitReview}>
              <Form.Group className="mb-3">
                <Form.Label>Rating</Form.Label>
                <Form.Select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Comment</Form.Label>
                <Form.Control as="textarea" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write your comment..."/>
              </Form.Group>
              <Button type="submit" variant="primary">Submit Review</Button>
            </Form>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default SingleProduct;