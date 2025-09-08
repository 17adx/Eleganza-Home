import React, { useState } from "react";
import "./signup.css";
import ResendActivation from "../Resend/ResendActivation";
import { Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SignUp = ({ signupData, setSignupData, handleSignup }) => {
  // State for password validation
  const [passwordValid, setPasswordValid] = useState(null);
  const [passwordErrors, setPasswordErrors] = useState([]);

  // State for confirm password validation
  const [confirmValid, setConfirmValid] = useState(null);

  // State for showing/hiding password fields
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Submission-related states
  const [submitErrors, setSubmitErrors] = useState([]);
  const [showResendModal, setShowResendModal] = useState(false);

  // Controls visibility of validation error messages
  const [showPasswordErrors, setShowPasswordErrors] = useState(false);
  const [showConfirmErrors, setShowConfirmErrors] = useState(false);

  /**
   * Validate password on the client-side before submitting
   * - At least 8 characters
   * - At least 1 uppercase letter
   * - At least 1 lowercase letter
   * - At least 1 number
   */
  const validatePasswordFrontend = (value) => {
    if (!value) {
      setPasswordValid(null);
      setPasswordErrors([]);
      return;
    }

    const errors = [];
    if (value.length < 8) errors.push("Password must be at least 8 characters");
    if (!/[A-Z]/.test(value)) errors.push("Password must contain at least 1 uppercase letter");
    if (!/[a-z]/.test(value)) errors.push("Password must contain at least 1 lowercase letter");
    if (!/[0-9]/.test(value)) errors.push("Password must contain at least 1 number");

    if (errors.length === 0) {
      setPasswordValid(true);
      setPasswordErrors([]);
    } else {
      setPasswordValid(false);
      setPasswordErrors(errors);
    }
  };

  /**
   * Validate confirm password field
   * - Checks if it matches the original password
   */
  const validateConfirmPassword = (value) => {
    if (!value) {
      setConfirmValid(null);
      return;
    }
    setConfirmValid(value === signupData.password);
  };

  /**
   * Handle form submission
   * - Run frontend validation first
   * - Prevent submission if validation fails
   * - Otherwise, call the provided handleSignup()
   */
  const handleFormSubmit = (e) => {
    e.preventDefault();
    validatePasswordFrontend(signupData.password);
    validateConfirmPassword(signupData.confirm_password);

    if (passwordValid === false || confirmValid === false) {
      setSubmitErrors(["Please fix the errors before submitting"]);
      return;
    }

    setSubmitErrors([]);
    handleSignup(e);
  };

  return (
    <>
      <div className="signup-container">
        <form onSubmit={handleFormSubmit} className="form">
          {/* Title */}
          <div className="title">
            <h2 className="text-2xl font-bold">Register,</h2>
            <span className="text-gray-500">
              Signup now and get full access to our app.
            </span>
          </div>

          {/* First Name */}
          <input
            type="text"
            required
            className="input"
            placeholder="First Name"
            value={signupData.first_name}
            onChange={(e) => setSignupData({ ...signupData, first_name: e.target.value })}
          />

          {/* Last Name */}
          <input
            type="text"
            required
            className="input"
            placeholder="Last Name"
            value={signupData.last_name}
            onChange={(e) => setSignupData({ ...signupData, last_name: e.target.value })}
          />

          {/* Username */}
          <input
            type="text"
            required
            className="input"
            placeholder="Username"
            value={signupData.username}
            onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
          />

          {/* Email */}
          <input
            type="email"
            required
            className="input"
            placeholder="Email"
            value={signupData.email}
            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
          />

          {/* Password */}
          <div className="input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              required
              className={`input ${passwordValid === true ? "valid" : passwordValid === false ? "invalid" : ""}`}
              placeholder="Password"
              value={signupData.password}
              onChange={(e) => {
                const value = e.target.value;
                setSignupData({ ...signupData, password: value });
                validatePasswordFrontend(value);
                validateConfirmPassword(signupData.confirm_password);
              }}
              onBlur={() => setShowPasswordErrors(true)}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FontAwesomeIcon icon={['fas', 'eye-slash']} />
              ) : (
                <FontAwesomeIcon icon={['fas', 'eye']} />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="input-wrapper">
            <input
              type={showConfirm ? "text" : "password"}
              required
              className={`input ${confirmValid === true ? "valid" : confirmValid === false ? "invalid" : ""}`}
              placeholder="Confirm Password"
              value={signupData.confirm_password}
              onChange={(e) => {
                const value = e.target.value;
                setSignupData({ ...signupData, confirm_password: value });
                validateConfirmPassword(value);
              }}
              onBlur={() => setShowConfirmErrors(true)}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? (
                <FontAwesomeIcon icon={['fas', 'eye-slash']} />
              ) : (
                <FontAwesomeIcon icon={['fas', 'eye']} />
              )}
            </button>
          </div>

          {/* Mobile */}
          <input
            type="tel"
            className="input"
            placeholder="Mobile"
            value={signupData.mobile}
            onChange={(e) => setSignupData({ ...signupData, mobile: e.target.value })}
          />

          {/* Avatar Upload */}
          <label className="input button-confirm avatar">
            Avatar
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSignupData({ ...signupData, avatar: e.target.files[0] })}
            />
          </label>

          {/* Seller Checkbox */}
          <label className="checkbox-container input button-confirm seller">
            <input
              type="checkbox"
              name="is_seller"
              checked={signupData.is_seller || false}
              onChange={(e) => setSignupData({ ...signupData, is_seller: e.target.checked })}
            />
            Register as Seller
          </label>

          {/* Show form submission errors */}
          {submitErrors.length > 0 && (
            <ul className="error-messages">
              {submitErrors.map((err, idx) => <li key={idx}>{err}</li>)}
            </ul>
          )}

          {/* Submit button and Resend Activation link */}
          <div className="button-below">
            <button type="submit" className="button-confirm">
              Submit
            </button>
            <div className="flex justify-between w-full text-sm text-gray-500 mt-2">
              <button
                type="button"
                className="hover:underline"
                onClick={() => setShowResendModal(true)}
              >
                Resend Activation Email
              </button>
            </div>
          </div>
        </form>

        {/* Display Password Validation Errors */}
        {(showPasswordErrors && passwordErrors.length > 0) || (showConfirmErrors && confirmValid === false) ? (
          <div className="password-errors-container">
            {showPasswordErrors && passwordErrors.length > 0 && (
              <ul className="password-errors">
                {passwordErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            )}
            {showConfirmErrors && confirmValid === false && (
              <p className="password-errors">❌ Passwords do not match</p>
            )}
          </div>
        ) : null}
      </div>

      {/* Modal for Resending Activation Email */}
      <Modal show={showResendModal} onHide={() => setShowResendModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Resend Activation Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ResendActivation />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResendModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SignUp;