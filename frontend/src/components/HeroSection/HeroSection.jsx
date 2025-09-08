import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from '../../contexts/CartContext/CartContext';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import "./HeroSection.css";

// Base API URL (fallback to localhost if env var not set)
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

// Hardcoded list of featured brands to display
const brands = [
  { id: 1, name: "IKEA", logo: "https://www.ikea.com/global/assets/logos/brand/ikea.svg" },
  { id: 2, name: "Ashley", logo: "https://store.ashley.sa/cdn/shop/files/store-logo-1593551721_256x.jpg?v=1699290477" },
  { id: 3, name: "Steelcase", logo: "https://dumy1g3ng547g.cloudfront.net/content/themes/steelcase/img/logo.svg" },
  { id: 4, name: "Home Centre", logo: "https://lmg.a.bigcontent.io/v1/static/website_images_logos_homecentre_ae_en_logo-homecentre?fmt=auto" },
  { id: 5, name: "West Elm", logo: "https://www.westelm.com.sa/icons/logo.svg" },
];

// Utility to normalize API responses (array or paginated results)
function pickArray(payload) {
  if (payload && Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.results)) return payload.results;
  return [];
}

const HeroSection = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // State for products and UI feedback
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState({ best: true, new: true });
  const [error, setError] = useState(null);

  // Fetch products (Best Sellers + New Arrivals) when component mounts
  useEffect(() => {
    const abort = new AbortController();

    async function load() {
      // Fetch Best Sellers
      try {
        const resBest = await fetch(`${API_BASE}/api/catalog/products/featured/`, {
          signal: abort.signal,
          headers: { Accept: "application/json" },
        });
        const dataBest = await resBest.json();
        setBestSellers(pickArray(dataBest).slice(0, 12)); // limit to 12 items
      } catch (e) {
        console.error("Failed to load Best Sellers", e);
        setError("Failed to load Best Sellers");
      } finally {
        setLoading((s) => ({ ...s, best: false }));
      }

      // Fetch New Arrivals
      try {
        const resNew = await fetch(`${API_BASE}/api/catalog/products/?ordering=-created_at`, {
          signal: abort.signal,
          headers: { Accept: "application/json" },
        });
        const dataNew = await resNew.json();
        setNewArrivals(pickArray(dataNew).slice(0, 12));
        setError(null); // clear error if successful
      } catch (e) {
        console.error("Failed to load New Arrivals", e);
        setError((prev) => prev ?? "Failed to load New Arrivals");
      } finally {
        setLoading((s) => ({ ...s, new: false }));
      }
    }

    load();
    return () => abort.abort(); // cleanup request on unmount
  }, []);

  // Add product to cart without navigating away
  const handleAddToCart = (e, product) => {
    e.stopPropagation(); // prevent navigating when clicking cart button
    addToCart(product);
  };

  // Reusable product card
  const card = (product) => {
    const createdDate = new Date(product.created_at);
    const isNew = createdDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days threshold

    return (
      <div
        className="card-container cursor-pointer"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        {/* Decorative shine/glow layers */}
        <div className="card-shine"></div>
        <div className="card-glow"></div>

        <div className="card-content">
          {/* NEW badge for recent products */}
          {isNew && <div className="card-badge">NEW</div>}

          {/* Product Image */}
          <div
            className="card-image"
            style={{
              "--bg-color": "#a78bfa",
              backgroundImage: `url(${product.images?.[0]?.image || "https://via.placeholder.com/400x300"})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>

          {/* Title & Description */}
          <div className="card-text">
            <p className="card-title">{product.title}</p>
            <p className="card-description line-clamp-2">
              {product.description || "Hover to reveal stunning effects"}
            </p>
          </div>

          {/* Price + Add-to-Cart Button */}
          <div className="card-footer">
            <div className="card-price">${product.final_price ?? product.price}</div>
            <div
              className="card-button cursor-pointer"
              onClick={(e) => handleAddToCart(e, product)}
            >
              <svg height="16" width="16" viewBox="0 0 24 24">
                <path
                  strokeWidth="2"
                  stroke="currentColor"
                  d="M4 12H20M12 4V20"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="hero-section">
      {/* Hero Intro Section */}
      <div className="hero-content">
        <div className="container">
          <h1>
            Transform Your Home with <span>Eleganza Home</span>
          </h1>
          <p>
            Discover premium furniture for every space — from kitchens and offices to living rooms and bedrooms. Create comfort, style, and elegance that last a lifetime.
          </p>
        </div>
      </div>

      <div className="container">
        {/* Best Sellers Section */}
        <section className="best-sellers">
          <h2>Best Sellers</h2>
          {loading.best ? (
            // Loading spinner while fetching
            <div className="dot-spinner">
              {Array(8).fill(0).map((_, i) => <div key={i} className="dot-spinner__dot"></div>)}
            </div>
          ) : (
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              navigation
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              breakpoints={{
                0: { slidesPerView: 1, spaceBetween: 10 },    // small screens
                640: { slidesPerView: 2, spaceBetween: 0 },   // medium
                1024: { slidesPerView: 3, spaceBetween: 20 }, // large
                1280: { slidesPerView: 4, spaceBetween: 20 }, // extra large
              }}
            >
              {bestSellers.map((p) => (
                <SwiperSlide key={p.id}>{card(p)}</SwiperSlide>
              ))}
            </Swiper>
          )}
        </section>

        {/* New Arrivals Section */}
        <section className="new-arrivals">
          <h2>New Arrivals</h2>
          {loading.new ? (
            <div className="dot-spinner">
              {Array(8).fill(0).map((_, i) => <div key={i} className="dot-spinner__dot"></div>)}
            </div>
          ) : (
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              navigation
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              breakpoints={{
                0: { slidesPerView: 1, spaceBetween: 10 },
                576: { slidesPerView: 1, spaceBetween: 15 },
                768: { slidesPerView: 3, spaceBetween: 20 },
                992: { slidesPerView: 4, spaceBetween: 25 },
              }}
            >
              {newArrivals.map((p) => (
                <SwiperSlide key={p.id}>{card(p)}</SwiperSlide>
              ))}
            </Swiper>
          )}
        </section>

        {/* Error message if fetching fails */}
        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
      </div>

      {/* Brands Carousel */}
      <section className="brands">
        <h2>Our Trusted Brands</h2>
        <Swiper
          modules={[Autoplay]}
          spaceBetween={40}
          slidesPerView={4}
          loop
          speed={2000}
          autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: false }}
          className="opacity-80"
          breakpoints={{
            0: { slidesPerView: 2, spaceBetween: 16 },
            640: { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 4, spaceBetween: 40 },
          }}
        >
          {brands.map((brand) => (
            <SwiperSlide key={brand.id}>
              <div className="flex items-center justify-center h-24 w-40 bg-transparent">
                <img src={brand.logo} alt={brand.name} className="max-h-16 object-contain" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </div>
  );
};

export default HeroSection;