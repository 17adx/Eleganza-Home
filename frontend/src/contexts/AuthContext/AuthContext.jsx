import { useState, useEffect } from "react";

import { auth } from "../../api/auth";

import { AuthContext } from "./AuthContextDefinition";

/**
 * AuthProvider component
 * Wrap your app with this provider to give access to user state and actions
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch the logged-in user's profile from the backend.
   * Called on mount and can be reused to refresh user data.
   */
  const fetchUser = async () => {
    const token = localStorage.getItem("access");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await auth.profileMe();
      setUser(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch user profile:", error);
      setUser(null);
    } finally {
      setLoading(false);
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
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        logout,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};