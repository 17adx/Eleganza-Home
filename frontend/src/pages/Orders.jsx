import React from "react";

import Navbar from "../components/common/Navbar/navbar";
import Orders from "../components/Orders/Orders";
import Footer from "../components/common/Footer/footer";

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
