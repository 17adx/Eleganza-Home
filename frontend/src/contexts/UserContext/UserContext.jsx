import { createContext, useContext, useState, useEffect } from "react";
import API from "../../api";

// Create a context for user data and actions
const UserContext = createContext();

/**
 * UserProvider component
 * Wrap your app with this provider to give access to user state and actions
 */
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);   // Holds current logged-in user profile
  const [loading, setLoading] = useState(true); // Tracks loading state for async operations

  /**
   * Fetch the logged-in user's profile from the backend.
   * Called on mount and can be reused to refresh user data.
   */
  const fetchUser = async () => {
    const token = localStorage.getItem("access"); // JWT token
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await API.get("/auth/me/profile/"); // API call to get user profile
      setUser(res.data); // Update user state with fetched profile
    } catch (err) {
      console.error("❌ Failed to fetch user profile:", err);
      setUser(null); // Reset user if fetch fails
    } finally {
      setLoading(false); // End loading state
    }
  };

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUser();
  }, []);

  /**
   * Logout function
   * Clears JWT tokens and resets user state
   */
  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,          // Current user profile
        setUser,       // Setter for user state
        loading,       // Loading state for async operations
        logout,        // Logout action
        refreshUser: fetchUser // Function to refresh user data
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

/**
 * Custom hook to use the UserContext
 * Provides easy access to user state and actions
 */
export const useUser = () => useContext(UserContext);