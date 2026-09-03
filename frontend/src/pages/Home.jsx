import React from 'react';
import Navbar from '../components/common/Navbar/navbar';
import HeroSection from '../components/catalog/HeroSection/HeroSection';
import Products from '../components/catalog/Products/Products';
import AboutUs from '../components/common/AboutUs/aboutUs';
import Footer from '../components/common/Footer/footer';

const Home = () => {
  return (
    <>
      <Navbar />
      <HeroSection />
      <Products />
      <AboutUs />
      <Footer />
    </>
  )
}

export default Home