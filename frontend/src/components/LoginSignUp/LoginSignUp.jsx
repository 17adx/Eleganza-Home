import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { useUser } from "../../contexts/UserContext/UserContext";

import LoginForm from "./Login/Login";
import SignUpForm from "./SignUp/SignUp";
import Swal from "sweetalert2";
import "./LoginSignUp.css";

const LoginSignUp = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  // --- State for Login Form ---
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
    remember: false,
  });

  // --- State for Signup Form ---
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

  /**
   * Handle input changes for both login and signup forms.
   * Supports checkboxes and text inputs dynamically.
   * @param {Event} e - DOM event
   * @param {Object} state - current form state
   * @param {Function} setState - state setter function
   */
  const handleInputChange = (e, state, setState) => {
    const { name, value, type, checked } = e.target;
    setState({
      ...state,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  /**
   * Show SweetAlert2 notifications in a standardized style
   * @param {string} icon - icon type: "success", "error", "warning"
   * @param {string} title - title text
   * @param {string} text - descriptive text
   * @param {number} timer - auto-close time in milliseconds
   */
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

  /**
   * Handle login form submission
   * - Calls API to authenticate user
   * - Stores JWT token in localStorage
   * - Fetches user profile and updates UserContext
   * - Handles inactive accounts and allows resending activation emails
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Authenticate with backend API
      const response = await API.post("/auth/login/", {
        username: loginData.username,
        password: loginData.password,
      });

      const data = response.data;
      localStorage.setItem("access", data.access);

      // Fetch user's profile information
      const profileRes = await API.get("/auth/me/profile/", {
        headers: { Authorization: `Bearer ${data.access}` },
      });

      const loggedInUser = profileRes.data;
      setUser(loggedInUser);

      // Show success alert
      await showAlert(
        "success",
        "Login Successful",
        `Welcome back, ${loggedInUser.first_name || loginData.username}`
      );

      navigate("/profile");
    } catch (error) {
      // Handle inactive account scenario
      if (
        error.response?.status === 401 &&
        error.response?.data?.detail?.toLowerCase().includes("inactive")
      ) {
        Swal.fire({
          icon: "warning",
          title: "Account not activated",
          text: "Your account is not activated. Resend activation email?",
          showCancelButton: true,
          confirmButtonText: "Resend",
          cancelButtonText: "Cancel",
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await API.post("/auth/resend-activation/", {
                email: loginData.username,
              });
              Swal.fire("Sent!", "Activation email has been resent.", "success");
            } catch (err) {
              Swal.fire(
                "Error",
                err.response?.data?.detail || "Failed to resend email.",
                "error"
              );
            }
          }
        });
      } else {
        // Show generic login error
        showAlert(
          "error",
          "Login Failed",
          error.response?.data?.detail || "Invalid credentials"
        );
      }
      console.error("Login error:", error);
    }
  };

  /**
   * Handle signup form submission
   * - Sends form data including file uploads (avatar) via FormData
   * - Creates user on backend
   * - Automatically triggers activation email
   */
  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("first_name", signupData.first_name);
      formData.append("last_name", signupData.last_name);
      formData.append("username", signupData.username);
      formData.append("email", signupData.email);
      formData.append("password", signupData.password);
      formData.append("confirm_password", signupData.confirm_password);
      formData.append("mobile", signupData.mobile);
      formData.append("is_seller", signupData.is_seller);

      if (signupData.avatar) {
        formData.append("avatar", signupData.avatar);
      }

      // Register new user
      const res = await fetch("https://eleganza-home.onrender.com/api/auth/register/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(JSON.stringify(errorData));
      }

      // Attempt to resend activation email
      try {
        await fetch("https://eleganza-home.onrender.com/api/auth/resend-activation/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: signupData.email }),
        });
      } catch (err) {
        console.warn("Activation email failed:", err);
      }

      Swal.fire(
        "Success",
        "Account created! Check your email to activate.",
        "success"
      );
    } catch (err) {
      Swal.fire("Error", err.message, "error");
      console.error("Signup error:", err);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        {/* Informational text */}
        <div className="text">
          <p>Sign up and personalize your shopping experience.</p>
        </div>

        {/* Login Form */}
        <div className="login">
          <LoginForm
            loginData={loginData}
            setLoginData={setLoginData}
            handleLogin={handleLogin}
            handleInputChange={handleInputChange}
          />
        </div>

        {/* Signup Form */}
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