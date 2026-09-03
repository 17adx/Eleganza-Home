import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import useCart from "../../../hooks/useCart";

import { catalog } from "../../../api/catalog";

import { Swiper, SwiperSlide } from "swiper/react";

import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";

import "swiper/css/navigation";

import "swiper/css/pagination";

import "swiper/css/autoplay";

import "./HeroSection.css";

const brands = [
  {
    id: 1,
    name: "IKEA",
    logo: "https://www.ikea.com/global/assets/logos/brand/ikea.svg",
  },
  {
    id: 2,
    name: "Ashley",
    logo: "https://store.ashley.sa/cdn/shop/files/store-logo-1593551721_256x.jpg?v=1699290477",
  },
  {
    id: 3,
    name: "Steelcase",
    logo: "https://dumy1g3ng547g.cloudfront.net/content/themes/steelcase/img/logo.svg",
  },
  {
    id: 4,
    name: "Home Centre",
    logo: "https://lmg.a.bigcontent.io/v1/static/website_images_logos_homecentre_ae_en_logo-homecentre?fmt=auto",
  },
  {
    id: 5,
    name: "West Elm",
    logo: "https://www.westelm.com.sa/icons/logo.svg",
  },
];

const pickArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.results)) {
    return payload.results;
  }

  return [];
};

const HeroSection = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState({
    best: true,
    new: true,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadBestSellers = async () => {
      try {
        const response = await catalog.featuredProducts();

        if (!isMounted) {
          return;
        }

        setBestSellers(pickArray(response.data).slice(0, 12));
      } catch (err) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to load Best Sellers:", err);

        setError("Failed to load Best Sellers");
      } finally {
        if (isMounted) {
          setLoading((state) => ({
            ...state,
            best: false,
          }));
        }
      }
    };

    const loadNewArrivals = async () => {
      try {
        const response = await catalog.newArrivals();

        if (!isMounted) {
          return;
        }

        setNewArrivals(pickArray(response.data).slice(0, 12));
      } catch (err) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to load New Arrivals:", err);

        setError((currentError) => {
          return currentError ?? "Failed to load New Arrivals";
        });
      } finally {
        if (isMounted) {
          setLoading((state) => ({
            ...state,
            new: false,
          }));
        }
      }
    };

    loadBestSellers();
    loadNewArrivals();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = (event, product) => {
    event.stopPropagation();
    addToCart(product);
  };

  const renderProductCard = (product) => {
    const createdDate = new Date(product.created_at);

    const isNew =
      createdDate >
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return (
      <div
        className="card-container cursor-pointer"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <div className="card-shine"></div>
        <div className="card-glow"></div>

        <div className="card-content">
          {isNew && <div className="card-badge">NEW</div>}

          <div
            className="card-image"
            style={{
              "--bg-color": "#a78bfa",
              backgroundImage: `url(${
                product.images?.[0]?.image ||
                "https://via.placeholder.com/400x300"
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>

          <div className="card-text">
            <p className="card-title">{product.title}</p>

            <p className="card-description line-clamp-2">
              {product.description ||
                "Hover to reveal stunning effects"}
            </p>
          </div>

          <div className="card-footer">
            <div className="card-price">
              ${product.final_price ?? product.price}
            </div>

            <div
              className="card-button cursor-pointer"
              onClick={(event) => handleAddToCart(event, product)}
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
      <div className="hero-content">
        <div className="container">
          <h1>
            Transform Your Home with <span>Eleganza Home</span>
          </h1>

          <p>
            Discover premium furniture for every space — from
            kitchens and offices to living rooms and bedrooms.
            Create comfort, style, and elegance that last a
            lifetime.
          </p>
        </div>
      </div>

      <div className="container">
        <section className="best-sellers">
          <h2>Best Sellers</h2>

          {loading.best ? (
            <div className="dot-spinner">
              {Array(8)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="dot-spinner__dot"
                  ></div>
                ))}
            </div>
          ) : (
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              navigation
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
              pagination={{ clickable: true }}
              breakpoints={{
                0: {
                  slidesPerView: 1,
                  spaceBetween: 10,
                },
                640: {
                  slidesPerView: 2,
                  spaceBetween: 0,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                1280: {
                  slidesPerView: 4,
                  spaceBetween: 20,
                },
              }}
            >
              {bestSellers.map((product) => (
                <SwiperSlide key={product.id}>
                  {renderProductCard(product)}
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </section>

        <section className="new-arrivals">
          <h2>New Arrivals</h2>

          {loading.new ? (
            <div className="dot-spinner">
              {Array(8)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="dot-spinner__dot"
                  ></div>
                ))}
            </div>
          ) : (
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              navigation
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              pagination={{ clickable: true }}
              breakpoints={{
                0: {
                  slidesPerView: 1,
                  spaceBetween: 10,
                },
                576: {
                  slidesPerView: 1,
                  spaceBetween: 15,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                992: {
                  slidesPerView: 4,
                  spaceBetween: 25,
                },
              }}
            >
              {newArrivals.map((product) => (
                <SwiperSlide key={product.id}>
                  {renderProductCard(product)}
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </section>

        {error && (
          <p className="text-red-600 text-center mt-4">
            {error}
          </p>
        )}
      </div>

      <section className="brands">
        <h2>Our Trusted Brands</h2>

        <Swiper
          modules={[Autoplay]}
          spaceBetween={40}
          slidesPerView={4}
          loop
          speed={2000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          className="opacity-80"
          breakpoints={{
            0: {
              slidesPerView: 2,
              spaceBetween: 16,
            },
            640: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 40,
            },
          }}
        >
          {brands.map((brand) => (
            <SwiperSlide key={brand.id}>
              <div className="flex items-center justify-center h-24 w-40 bg-transparent">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-16 object-contain"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </div>
  );
};

export default HeroSection;