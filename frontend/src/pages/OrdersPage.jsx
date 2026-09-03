import React from "react";
import Navbar from "../components/common/Navbar/navbar";
import Orders from "../components/orders/Orders";
import Footer from "../components/common/footer/footer";


const OrdersPage = () => {
  
  return (
    <>
      <Navbar />
      <Orders />
      <Footer />
    </>
    
  );
};

export default OrdersPage;