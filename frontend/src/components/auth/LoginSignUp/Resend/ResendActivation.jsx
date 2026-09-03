import React, { useState } from "react";
import Swal from "sweetalert2";
import { auth } from "../../../../api/auth";

const ResendActivation = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!email.trim()) {
      Swal.fire("Error", "Please enter your email", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await auth.resendActivation(email);

      Swal.fire(
        "Success",
        response.data.detail || "Activation email sent successfully.",
        "success"
      );
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Failed to resend activation email.";

      Swal.fire("Error", message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleResend();
      }}
      className="form"
    >
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
        {loading ? "Sending..." : "Resend"}
      </button>
    </form>
  );
};

export default ResendActivation;