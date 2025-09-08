import React, { useState } from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext/UserContext'; 
import './navbar.css';

// Add FontAwesome icon libraries to the project
library.add(fab, fas);

const Navbar = () => {
  // --- User Context to check login state and update user ---
  const { user, setUser } = useUser();
  const isLoggedIn = !!user; // Boolean flag for login status

  // --- React Router utilities ---
  const navigate = useNavigate(); 
  const location = useLocation();
  const isHome = location.pathname === "/"; // Flag to apply different navbar styling on homepage

  // --- State for search input ---
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * Logout handler
   * - Removes JWT tokens from localStorage
   * - Resets user context to null
   */
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null); 
  };

  /**
   * Handle search form submission
   * - Navigates to /products route with query string
   */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <>
      {/* Main Navbar container */}
      <div className={`${isHome ? "navbar-main" : "navbar-main fixed-top"}`}>
        <div className="container">
          <div className="main-nav">

            {/* Brand/Logo */}
            <div className="navbar-brand">
              <Link className="brand-link" to="/">
                <span className="brand-name">Eleganza Home</span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
              <form onSubmit={handleSearch}>
                <div className="input-container">
                  <input
                    type="text"
                    name="text"
                    className="input"
                    placeholder="search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="submit" className="icon">
                    <svg width="19px" height="19px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                      <g id="SVGRepo_iconCarrier"> 
                        <path opacity="1" d="M14 5H20" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> 
                        <path opacity="1" d="M14 8H17" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> 
                        <path d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path> 
                        <path opacity="1" d="M22 22L20 20" stroke="#000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"></path> 
                      </g>
                    </svg>
                  </button>
                </div>
              </form>
            </div>

            {/* Navigation Links */}
            <ul className="navbar-links">
              {/* Categories Link */}
              <li className="links">
                <Link to="/categories">Categories</Link>
              </li>

              {/* Conditional Login/Profile Links */}
              <li className="links">
                {isLoggedIn ? (
                  <div className="user-login">
                    {/* Profile Icon */}
                    <Link className="nav-link" to="/profile">
                      <FontAwesomeIcon className="cart" icon={['fas', 'user']} />
                    </Link>

                    {/* Logout Button */}
                    <button className="nav-link" onClick={handleLogout}>
                      <FontAwesomeIcon className="cart" icon={['fas', 'right-to-bracket']} style={{rotate: '180deg'}} />
                    </button>
                  </div>
                ) : (
                  <Link className="nav-link" to="/login">
                    <FontAwesomeIcon className="cart" icon={['fas', 'right-to-bracket']} />
                  </Link>
                )}
              </li>

              {/* Cart Icon */}
              <li className="links d-flex align-items-center">
                <Link className="nav-link" to="/cart">
                  <FontAwesomeIcon className="cart" icon={['fas', 'cart-shopping']} />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;