import React from "react";
import Navbar from "../components/Navbar/navbar";
import ProfileWrapper from "../contexts/ProfileWrapper/ProfileWrapper";
import Footer from "../components/footer/footer";

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