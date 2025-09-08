import React, { useState } from "react";
import Swal from "sweetalert2";

const ResetPassword = ({ closeModal }) => {
  // Local state to hold the user's email input
  const [email, setEmail] = useState("");

  /**
   * Handle password reset request
   * - Prevents default form submission
   * - Sends the email to Django backend (Djoser reset_password endpoint)
   * - Shows success or error alerts using SweetAlert2
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/auth/users/reset_password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        // ✅ Success: tell user to check email
        Swal.fire("Success", "Check your email for reset instructions.", "success");
        
        // Close modal if passed down from parent (Login component)
        if (closeModal) closeModal();
      } else {
        // ❌ Error: log details for debugging
        const text = await res.text();
        console.log(text);
        Swal.fire("Error", "Server error, check console", "error");
      }
    } catch (err) {
      // ❌ Network/other error
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      {/* Email Input */}
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input"
        required
      />

      {/* Submit Button */}
      <button type="submit" className="button-confirm mt-2 w-100">
        Send Link
      </button>
    </form>
  );
};

export default ResetPassword;