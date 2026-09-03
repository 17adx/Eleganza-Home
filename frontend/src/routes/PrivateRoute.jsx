import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * PrivateRoute Component
 * Protects routes that require authentication.
 * If the user is not logged in, redirects to the login page.
 */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait until authentication state is resolved.
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect unauthenticated users to the login page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content for authenticated users.
  return children;
};

export default PrivateRoute;