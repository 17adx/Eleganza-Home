import React from 'react';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/Footer/footer';
import Products from '../components/products/Products';
import './ProductsPage.css';

const ProductsPage = ({ selectedCategory }) => {
  return (
    <>
      <Navbar />

      {/* Main content: products listing */}
      <div className="products-page">
        {/* Products component receives the currently selected category */}
        <Products selectedCategory={selectedCategory} />
      </div>
      
      <Footer />
    </>
  );
};

export default ProductsPage;