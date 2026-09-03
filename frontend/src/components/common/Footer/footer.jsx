import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; 
import './footer.css';

const Footer = () => {
  const navigate = useNavigate();

  // Navigation handlers for footer links
  const handleCategoriesClick = () => {
    navigate('/categories');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <>
      {/* Footer Section */}
      <footer className="footer pt-4 mt-5">
        <div className="container text-center text-md-start">
          <div className="row">
            
            {/* Company Description */}
            <div className="col-12 col-sm-6 col-md-3 mb-4">
              <h6 className="text-uppercase fw-bold">Eleganza Home</h6>
              <p>Where elegant design meets everyday comfort for your home.</p>
            </div>

            {/* Products Links */}
            <div className="col-12 col-sm-6 col-md-2 mb-4">
              <h6 className="text-uppercase fw-bold">Products</h6>
              <ul className="list-unstyled">
                <li><a href="#!" className="text-reset" onClick={handleCategoriesClick}>Categories</a></li>
                <li><a href="#!" className="text-reset">Offers</a></li>
                <li><a href="#!" className="text-reset" onClick={handleCartClick}>Cart</a></li>
                <li><a href="#!" className="text-reset" onClick={handleLoginClick}>Login</a></li>
              </ul>
            </div>

            {/* Information Links */}
            <div className="col-12 col-sm-6 col-md-3 mb-4">
              <h6 className="text-uppercase fw-bold">Information</h6>
              <ul className="list-unstyled">
                <li><a href="#!" className="text-reset">About Us</a></li>
                <li><a href="#!" className="text-reset">Contact</a></li>
                <li><a href="#!" className="text-reset">Support</a></li>
                <li><a href="#!" className="text-reset">Privacy</a></li>
              </ul>
            </div>

            {/* Contact Details */}
            <div className="col-12 col-sm-6 col-md-4 mb-4">
              <h6 className="text-uppercase fw-bold">Contact</h6>
              <p><i className="bi bi-house-door-fill me-2"></i> Cairo, Egypt</p>
              <p><i className="bi bi-envelope-fill me-2"></i> anssalem810@gmail.com</p>
              <p><i className="bi bi-phone-fill me-2"></i> +20 10 600 695 34</p>
            </div>
          </div>
        </div>

        {/* Footer Bottom Section */}
        <div className="text-center p-3 copyright">
          © {new Date().getFullYear()} Anas Salem. All rights reserved.
        </div>
      </footer>
    </>
  );
};

export default Footer;