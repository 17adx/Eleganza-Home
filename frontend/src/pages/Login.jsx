import React from 'react';
import Navbar from '../components/navbar/navbar';
import LoginSingUp from '../components/LoginSignUp/LoginSignUp';
import Footer from '../components/Footer/footer';

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