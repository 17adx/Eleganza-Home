import React, { useState } from "react";
import Swal from "sweetalert2";
import "./Login.css";
import { Modal, Button } from "react-bootstrap";
import ResetPassword from "../Resend/ResetPassword";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Login = ({
  loginData,
  setLoginData,
  handleLogin,
  handleInputChange,
}) => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Handle social login flow.
   * Opens the backend authentication endpoint for the selected provider.
   */
  const handleSocialLogin = (provider) => {
    const width = 600;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const providerUrls = {
      twitter: "/auth/login/twitter/",
      google: "/auth/login/google-oauth2/",
      facebook: "/auth/login/facebook/",
    };

    const providerPath = providerUrls[provider];

    if (!providerPath) {
      console.error(`Unsupported social login provider: ${provider}`);
      return;
    }

    const socialWindow = window.open(
      `${import.meta.env.VITE_API_URL}${providerPath}`,
      "_blank",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    if (!socialWindow) {
      Swal.fire(
        "Popup Blocked",
        "Please allow popups in your browser and try again.",
        "warning"
      );
      return;
    }

    const timer = setInterval(() => {
      try {
        if (socialWindow.closed) {
          clearInterval(timer);
          Swal.fire(
            "Success",
            "Social login window closed. Check your session.",
            "success"
          );
        }
      } catch (error) {
        console.error("Social login popup check failed:", error);
      }
    }, 1000);
  };

  return (
    <>
      <form onSubmit={handleLogin} className="form">
        <div className="title">
          <h2 className="text-2xl font-bold">Welcome,</h2>
          <span className="text-gray-500">Sign in to continue</span>
        </div>

        <input
          type="text"
          name="username"
          placeholder="Username"
          required
          className="input"
          value={loginData.username}
          onChange={(event) =>
            handleInputChange(event, loginData, setLoginData)
          }
        />

        <div className="input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            required
            className="input"
            value={loginData.password}
            onChange={(event) =>
              handleInputChange(event, loginData, setLoginData)
            }
          />

          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword((previous) => !previous)}
          >
            {showPassword ? (
              <FontAwesomeIcon icon={["fas", "eye-slash"]} />
            ) : (
              <FontAwesomeIcon
                className="cart"
                icon={["fas", "eye"]}
              />
            )}
          </button>
        </div>

        <div className="login-with">
          <button
            type="button"
            className="button-log"
            onClick={() => handleSocialLogin("twitter")}
          >
            x
          </button>

          <button
            type="button"
            className="button-log"
            onClick={() => handleSocialLogin("google")}
          >
            G
          </button>

          <button
            type="button"
            className="button-log"
            onClick={() => handleSocialLogin("facebook")}
          >
            <svg className="w-6 h-6" viewBox="0 0 56.693 56.693">
              <path d="M40.43,21.739h-7.645v-5.014c0-1.883,1.248-2.322,2.127-2.322c0.877,0,5.395,0,5.395,0V6.125l-7.43-0.029 c-8.248,0-10.125,6.174-10.125,10.125v5.518h-4.77v8.53h4.77c0,10.947,0,24.137,0,24.137h10.033c0,0,0-13.32,0-24.137h6.77 L40.43,21.739z" />
            </svg>
          </button>
        </div>

        <button type="submit" className="button-confirm">
          Let`s go →
        </button>

        <div className="flex justify-between w-full text-sm text-gray-500 mt-2">
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="hover:underline"
          >
            Forgot Password?
          </button>
        </div>
      </form>

      <Modal
        show={showResetModal}
        onHide={() => setShowResetModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <ResetPassword
            closeModal={() => setShowResetModal(false)}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowResetModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Login;