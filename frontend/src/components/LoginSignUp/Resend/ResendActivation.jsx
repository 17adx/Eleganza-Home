import React, { useState } from "react";
import Swal from "sweetalert2";

const ResendActivation = () => {
  // Local state to hold email input
  const [email, setEmail] = useState("");
  // Loading state to disable button and show "Sending..."
  const [loading, setLoading] = useState(false);

  /**
   * Handle resend activation email request
   * - Validates that the user entered an email
   * - Sends a POST request to Django backend (/api/auth/resend-activation/)
   * - Displays a SweetAlert2 notification for success or failure
   */
  const handleResend = async () => {
    if (!email) {
      Swal.fire("Error", "Please enter your email", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://eleganza-home.onrender.com/api/auth/resend-activation/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Successfully requested resend
        Swal.fire("Success", data.detail, "success");
      } else {
        // ❌ Backend returned an error
        Swal.fire("Error", data.detail || "Failed to resend email", "error");
      }
    } catch (err) {
      // ❌ Network/unknown error
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault(); // Prevent default form reload
        handleResend();
      }}
      className="form"
    >
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
      <button
        type="submit"
        className="button-confirm mt-2 w-100"
        disabled={loading}
      >
        {loading ? "Sending..." : "Resend"}
      </button>
    </form>
  );
};

export default ResendActivation;