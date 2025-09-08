import React from "react";
import { useUser } from "../UserContext/UserContext";
import { Spinner } from "react-bootstrap";
import UserProfile from "../../components/Profiles/Users/UserProfile";
import SellerDashboard from "../../components/Profiles/Sellers/SellerDashboard";

/**
 * ProfileWrapper Component
 * Decides which profile view to render based on user type.
 * - Shows a loading spinner while user data is being fetched.
 * - Shows a message if the user is not logged in.
 * - Renders either the SellerDashboard or UserProfile based on the user role.
 */
const ProfileWrapper = () => {
  const { user, loading } = useUser(); // Get user and loading state from context

  // Show loading spinner while user data is being fetched
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // If user is not logged in, show a warning message
  if (!user) {
    return (
      <p className="text-center mt-5">
        ⚠️ You must be logged in to view profile.
      </p>
    );
  }

  // Render SellerDashboard if user is a seller, else render UserProfile
  return user.is_seller ? <SellerDashboard /> : <UserProfile />;
};

export default ProfileWrapper;