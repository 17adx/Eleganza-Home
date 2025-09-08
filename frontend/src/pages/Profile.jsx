import React from "react";
import Navbar from "../components/navbar/navbar";
import ProfileWrapper from "../contexts/ProfileWrapper/ProfileWrapper";
import Footer from "../components/Footer/footer";

const Profile = () => {
  return (
    <>
      <Navbar />
      <ProfileWrapper />
      <Footer />
    </>
  );
};

export default Profile;