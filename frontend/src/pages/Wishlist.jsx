import React from "react";
import Navbar from "../components/common/Navbar/navbar";
import Wishlist from "../components/Wishlist/Wishlist";
import Footer from "../components/common/Footer/footer";

const WishlistPage = () => {
    return (
    <>
      <Navbar />
      <Wishlist />
      <Footer />
    </>
  );
};

export default WishlistPage;
