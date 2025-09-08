import React from 'react';
import Navbar from '../components/Navbar/navbar';
import LoginSingUp from '../components/LoginSignUp/LoginSignUp';
import Footer from '../components/footer/footer';

const Login = () => {
    return (
      <>
        <Navbar />
        <LoginSingUp />
        <Footer />
      </>
    );
};

export default Login;