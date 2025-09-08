import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useUser } from "../UserContext/UserContext";

/**
 * Activation Component
 * Handles account activation via URL params (uid & token) after email verification.
 * On successful activation, logs the user in and stores JWT tokens in localStorage.
 */
const Activation = () => {
  const { uid, token } = useParams(); // Extract UID and token from URL
  const navigate = useNavigate();
  const { setUser } = useUser(); // Access context to store user info
  const [loading, setLoading] = useState(true); // Loading state for UI feedback

  useEffect(() => {
    /**
     * Activate user account and fetch profile
     */
    const activateAccount = async () => {
      try {
        // Call activation endpoint
        const res = await fetch(`http://127.0.0.1:8000/api/auth/activate/${uid}/${token}/`);
        const data = await res.json();

        if (data.detail === "Account activated successfully.") {
          // Save JWT tokens to localStorage
          localStorage.setItem("access", data.access);
          localStorage.setItem("refresh", data.refresh);

          // Fetch user profile after activation
          const userRes = await fetch("http://127.0.0.1:8000/api/auth/me/profile/", {
            headers: {
              Authorization: `Bearer ${data.access}`,
            },
          });
          const userData = await userRes.json();

          // Set user in context
          setUser(userData);

          // Show success message and navigate to profile
          Swal.fire("Success", "Your account is activated and logged in!", "success").then(() => {
            navigate("/profile");
          });
        } else {
          // Show activation error
          Swal.fire("Error", data.detail, "error");
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Something went wrong.", "error");
      } finally {
        setLoading(false); // Stop loading spinner
      }
    };

    activateAccount();
  }, [uid, token, setUser, navigate]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      {loading ? "Activating your account..." : null}
    </div>
  );
};

export default Activation;