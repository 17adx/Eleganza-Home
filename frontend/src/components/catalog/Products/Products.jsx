import React, { useEffect, useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import useCart from "../../../hooks/useCart";

import { catalog } from "../../../api/catalog";

import Button from "react-bootstrap/Button";

import "./products.css";

const PRODUCTS_PER_PAGE = 10;

const Products = ({ selectedCategory }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addedProductId, setAddedProductId] = useState(null);

  const { addToCart } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get("search") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const params = {
          page: currentPage,
          search: searchTerm,
        };

        if (
          selectedCategory &&
          selectedCategory.slug !== "all"
        ) {
          params.category = selectedCategory.slug;
        }

        const response = await catalog.listProducts(params);

        console.log("Products API response:", response.data);

        setProducts(response.data.results || []);
        setTotalCount(response.data.count || 0);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, currentPage, searchTerm]);

  const handleAddToCart = (product) => {
    addToCart(product);

    setAddedProductId(product.id);

    setTimeout(() => {
      setAddedProductId(null);
    }, 2000);
  };

  const totalPages = Math.ceil(
    totalCount / PRODUCTS_PER_PAGE
  );

  return (
    <div className="container small-screen products-container">
      <h3 className="fw-bold fs-3 mx-5 small-screen-h3">
        Products:
      </h3>

      <div className="small-screen d-flex flex-wrap gap-4 justify-content-center p-3">
        {loading ? (
          <div className="dot-spinner">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="dot-spinner__dot"
              ></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          products.map((product) => (
            <div
              className="card-container-products"
              key={product.id}
            >
              <div className="card-effect">
                <div
                  className="card-inner"
                  onClick={() =>
                    navigate(`/product/${product.id}`)
                  }
                >
                  <div className="card__liquid"></div>

                  <div className="card__shine"></div>

                  <div className="card__glow"></div>

                  <div className="card__content">
                    <div className="card__badge">
                      TRENDING
                    </div>

                    <div
                      className="card__image"
                      style={{
                        "--bg-color": "#ff6b6b",
                        backgroundImage: `url(${
                          product.images?.[0]?.image ||
                          "fallback.jpg"
                        })`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    ></div>

                    <div className="card__text">
                      <p className="card__title">
                        {product.title}
                      </p>

                      <p className="card__description text-truncate">
                        {product.description}
                      </p>
                    </div>

                    <div className="card__footer">
                      <div className="card__price">
                        ${product.price}
                      </div>

                      <div
                        className="card__button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleAddToCart(product);
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                        >
                          <path
                            fill="currentColor"
                            d="M5 12H19M12 5V19"
                            stroke="currentColor"
                            strokeWidth="2"
                          ></path>
                        </svg>
                      </div>
                    </div>

                    {addedProductId === product.id && (
                      <div className="added-message animate">
                        ✔︎Added to cart!
                      </div>
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

      <div className="pages-buttons d-flex justify-content-center mt-4">
        {Array.from(
          { length: totalPages },
          (_, index) => (
            <Button
              key={index}
              variant={
                currentPage === index + 1
                  ? "black"
                  : "outline-secondary"
              }
              className="mx-1"
              onClick={() =>
                setCurrentPage(index + 1)
              }
            >
              {index + 1}
            </Button>
          )
        )}
      </div>
    </div>
  );
};

export default Products;