import { Navigate } from "react-router-dom";
import { useUser } from "../UserContext/UserContext";

/**
 * PrivateRoute Component
 * Protects routes that require authentication.
 * If the user is not logged in, redirects to the login page.
 */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useUser(); // Get user info and loading state from context

  // Show loading state while user info is being fetched
  if (loading) return <div>Loading...</div>;

  // Check if user is not logged in and token is missing
  const token = localStorage.getItem("access");
  if (!user && !token) {
    // Redirect to login page
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated, render the child components
  return children;
};

export default PrivateRoute;