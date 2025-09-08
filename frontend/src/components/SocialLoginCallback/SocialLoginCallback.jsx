import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { useUser } from "../../contexts/UserContext/UserContext"; 

/**
 * SocialLoginCallback Component
 * Handles OAuth login callbacks (e.g., Google login)
 * Fetches JWT tokens, validates user type, updates context, and redirects.
 */
const SocialLoginCallback = () => {
  const navigate = useNavigate();       // React Router hook for navigation
  const { setUser, refreshUser } = useUser(); // Access user context functions

  useEffect(() => {
    /**
     * Fetch JWT tokens after social login
     * Validate that only regular users can log in with Google
     * Save tokens and refresh user context
     */
    const fetchJWT = async () => {
      try {
        // Request JWT from backend
        const res = await API.get("/auth/social-login-jwt/", { withCredentials: true });

        // Restrict social login to regular users (not sellers)
        if (res.data.is_seller) {
          alert("🚫 Google login is only allowed for regular users, not sellers.");
          return navigate("/login");
        }

        // Store JWT tokens in localStorage
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);

        // Refresh user context to reflect logged-in state
        await refreshUser(); 

        // Redirect to profile page
        navigate("/profile");
      } catch (err) {
        console.error("User cancelled or login failed.", err);
        // Redirect back to login on error
        navigate("/login");
      }
    };

    fetchJWT();
  }, [navigate, refreshUser]);

  // Display temporary loading message while JWT is fetched
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontSize: "1.5rem"
    }}>
      Logging you in...
    </div>
  );
};

export default SocialLoginCallback;