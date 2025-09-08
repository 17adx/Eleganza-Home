import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext/CartContext';
import axios from 'axios';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import './products.css';

const Products = ({ selectedCategory }) => {
  // --- Axios instance with base URL ---
  const API = axios.create({ baseURL: 'https://eleganza-home.onrender.com/api' });

  // --- Catalog API helper functions ---
  const catalog = {
    listProducts: (params) => API.get('/catalog/products/', { params }),
    getProduct: (id) => API.get(`/catalog/products/${id}/`),
    listCategories: () => API.get('/catalog/categories/'),
    listBrands: () => API.get('/catalog/brands/'),
    listTags: () => API.get('/catalog/tags/'),
    listReviews: (productId) => API.get(`/catalog/products/${productId}/reviews/`),
    createReview: (productId, data) => API.post(`/catalog/products/${productId}/reviews/`, data),
  };

  const PRODUCTS_PER_PAGE = 10; // pagination size
  const [currentPage, setCurrentPage] = useState(1); // current page state
  const [products, setProducts] = useState([]); // products for current page
  const [totalCount, setTotalCount] = useState(0); // total products count
  const [loading, setLoading] = useState(true); // loading spinner
  const [addedProductId, setAddedProductId] = useState(null); // highlight product after adding to cart
  const { addToCart } = useCart(); // cart context
  const navigate = useNavigate();
  const location = useLocation();

  // --- Extract search term from URL query params ---
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get('search') || '';

  /**
   * Fetch products whenever category, page, or search term changes
   * - Supports filtering by category
   * - Handles paginated API response
   */
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { page: currentPage, search: searchTerm };

        if (selectedCategory && selectedCategory.slug !== 'all') {
          params.category = selectedCategory.slug;
        }

        const res = await catalog.listProducts(params);
        console.log("Products API response:", res.data);

        // Handle paginated response
        setProducts(res.data.results || []);
        setTotalCount(res.data.count || 0);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, currentPage, searchTerm]);

  /**
   * Handle adding a product to the cart
   * - Highlights product temporarily
   */
  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2000);
  };

  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE); // calculate total pages

  return (
    <div className="container small-screen products-container">
      <h3 className="fw-bold fs-3 mx-5 small-screen-h3">Products:</h3>

      {/* Products Grid */}
      <div className="small-screen d-flex flex-wrap gap-4 justify-content-center p-3">
        {loading ? (
          // --- Loading spinner ---
          <div className="dot-spinner">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="dot-spinner__dot"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          // --- Render product cards ---
          products.map((product) => (
            <div className="card-container-products" key={product.id}>
              <div className="card-effect">
                <div
                  className="card-inner"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {/* Card visual effects */}
                  <div className="card__liquid"></div>
                  <div className="card__shine"></div>
                  <div className="card__glow"></div>

                  <div className="card__content">
                    <div className="card__badge">TRENDING</div>

                    {/* Product image */}
                    <div
                      className="card__image"
                      style={{
                        "--bg-color": "#ff6b6b",
                        backgroundImage: `url(${product.images?.[0]?.image || "fallback.jpg"})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    ></div>

                    {/* Product details */}
                    <div className="card__text">
                      <p className="card__title">{product.title}</p>
                      <p className="card__description text-truncate">{product.description}</p>
                    </div>

                    {/* Card footer: price + add to cart button */}
                    <div className="card__footer">
                      <div className="card__price">${product.price}</div>
                      <div
                        className="card__button"
                        onClick={(e) => {
                          e.stopPropagation(); // prevent navigating to product detail
                          handleAddToCart(product);
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path
                            fill="currentColor"
                            d="M5 12H19M12 5V19"
                            stroke="currentColor"
                            strokeWidth="2"
                          ></path>
                        </svg>
                      </div>
                    </div>

                    {/* Visual feedback after adding to cart */}
                    {addedProductId === product.id && (
                      <div className="added-message animate">✔︎Added to cart!</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>

      {/* Pagination Buttons */}
      <div className="pages-buttons d-flex justify-content-center mt-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i}
            variant={currentPage === i + 1 ? "black" : "outline-secondary"}
            className="mx-1"
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Products;