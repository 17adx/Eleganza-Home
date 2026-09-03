import { useParams } from "react-router-dom";

import { useState } from "react";

import Navbar from "../components/common/Navbar/navbar";

import Footer from "../components/common/Footer/footer";

import Swal from "sweetalert2";

import { auth } from "../api/auth";

const PasswordResetConfirm = () => {
  // Get uid and token from URL parameters
  const { uid, token } = useParams();

  // State for new password and confirmation
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      Swal.fire("Error", "Passwords do not match", "error");
      return;
    }

    try {
      // Send password reset confirmation through the auth API module
      await auth.confirmResetPassword({
        uid,
        token,
        new_password: password,
      });

      // Success feedback
      Swal.fire(
        "Success",
        "Password has been reset!",
        "success"
      );
    } catch (error) {
      // Error feedback
      console.error("Failed to reset password:", error);

      Swal.fire(
        "Error",
        "Failed to reset password",
        "error"
      );
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center flex-col p-4">
        <h2 className="mb-4 text-2xl font-semibold">
          Reset Password
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 w-full max-w-md"
        >
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input px-3 py-2 rounded border"
            required
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            className="input px-3 py-2 rounded border"
            required
          />

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Reset Password
          </button>
        </form>
      </div>

      <Footer />
    </>
  );
};

export default PasswordResetConfirm;