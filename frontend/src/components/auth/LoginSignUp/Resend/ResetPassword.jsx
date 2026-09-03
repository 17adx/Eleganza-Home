import React, { useState } from "react";
import Swal from "sweetalert2";
import { auth } from "../../../../api/auth";

const ResetPassword = ({ closeModal }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      Swal.fire("Error", "Please enter your email", "error");
      return;
    }

    setLoading(true);

    try {
      await auth.resetPassword(email);

      Swal.fire(
        "Success",
        "Check your email for reset instructions.",
        "success"
      );

      closeModal?.();
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Server error. Please try again.";

      Swal.fire("Error", message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input"
        required
      />

      <button
        type="submit"
        className="button-confirm mt-2 w-100"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Link"}
      </button>
    </form>
  );
};

export default ResetPassword;