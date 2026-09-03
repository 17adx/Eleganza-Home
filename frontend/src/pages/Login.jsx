import React from 'react';
import Navbar from '../components/common/Navbar/navbar';
import LoginSingUp from '../components/auth/LoginSignUp/LoginSignUp';
import Footer from '../components/common/Footer/footer';

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