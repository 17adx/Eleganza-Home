import React, { useState } from "react";

import { useNavigate } from "react-router-dom";

import { auth } from "../../../api/auth";

import useAuth from "../../../hooks/useAuth";

import Swal from "sweetalert2";

import LoginForm from "./Login/Login";

import SignUpForm from "./SignUp/SignUp";

import "./LoginSignUp.css";

const LoginSignUp = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
    remember: false,
  });

  const [signupData, setSignupData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    mobile: "",
    avatar: null,
    is_seller: false,
  });

  const handleInputChange = (event, state, setState) => {
    const { name, value, type, checked } = event.target;

    setState({
      ...state,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const showAlert = (icon, title, text, timer = 2500) => {
    return Swal.fire({
      icon,
      title,
      text,
      timer,
      showConfirmButton: true,
      customClass: {
        icon: "swal-icon",
        popup: "swal-popup",
        title: "swal-title",
        htmlContainer: "swal-text",
        confirmButton: "swal-confirm",
      },
      background: "#F6F2F0",
      color: "#333",
    });
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await auth.login({
        username: loginData.username,
        password: loginData.password,
      });

      const { access, refresh } = response.data;

      localStorage.setItem("access", access);

      if (refresh) {
        localStorage.setItem("refresh", refresh);
      }

      const profileResponse = await auth.profileMe();
      const loggedInUser = profileResponse.data;

      setUser(loggedInUser);

      await showAlert(
        "success",
        "Login Successful",
        `Welcome back, ${
          loggedInUser.first_name || loginData.username
        }`
      );

      navigate("/profile");
    } catch (error) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail || "";

      if (
        status === 401 &&
        detail.toLowerCase().includes("inactive")
      ) {
        const result = await Swal.fire({
          icon: "warning",
          title: "Account not activated",
          text: "Your account is not activated. Resend activation email?",
          showCancelButton: true,
          confirmButtonText: "Resend",
          cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
          try {
            await auth.resendActivation(loginData.username);

            await Swal.fire(
              "Sent!",
              "Activation email has been resent.",
              "success"
            );
          } catch (resendError) {
            await Swal.fire(
              "Error",
              resendError.response?.data?.detail ||
                "Failed to resend email.",
              "error"
            );
          }
        }

        return;
      }

      await showAlert(
        "error",
        "Login Failed",
        detail || "Invalid credentials"
      );

      console.error("Login error:", error);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();

      formData.append("first_name", signupData.first_name);
      formData.append("last_name", signupData.last_name);
      formData.append("username", signupData.username);
      formData.append("email", signupData.email);
      formData.append("password", signupData.password);
      formData.append(
        "confirm_password",
        signupData.confirm_password
      );
      formData.append("mobile", signupData.mobile);
      formData.append("is_seller", signupData.is_seller);

      if (signupData.avatar) {
        formData.append("avatar", signupData.avatar);
      }

      await auth.register(formData);

      try {
        await auth.resendActivation(signupData.email);
      } catch (activationError) {
        console.warn(
          "Activation email failed:",
          activationError.response?.data ||
            activationError.message
        );
      }

      await Swal.fire(
        "Success",
        "Account created! Check your email to activate.",
        "success"
      );
    } catch (error) {
      const responseData = error.response?.data;

      const message =
        responseData?.detail ||
        (typeof responseData === "object"
          ? JSON.stringify(responseData)
          : error.message) ||
        "Something went wrong.";

      await Swal.fire("Error", message, "error");

      console.error("Signup error:", error);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <div className="text">
          <p>
            Sign up and personalize your shopping experience.
          </p>
        </div>

        <div className="login">
          <LoginForm
            loginData={loginData}
            setLoginData={setLoginData}
            handleLogin={handleLogin}
            handleInputChange={handleInputChange}
          />
        </div>

        <div className="sign-up">
          <SignUpForm
            signupData={signupData}
            setSignupData={setSignupData}
            handleSignup={handleSignup}
            handleInputChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginSignUp;