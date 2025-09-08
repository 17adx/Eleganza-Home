import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useUser } from "../../../contexts/UserContext/UserContext";
import axios from "axios";
import "./UserProfile.css";

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useUser(); // User context for session management

  // State for the profile form
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    birthdate: "",
    address: "",
    city: "",
    country: "",
  });

  const [loading, setLoading] = useState(true); // Spinner while fetching profile

  /**
   * Fetch user profile on component mount
   * Redirects to login if no token is present
   */
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("https://eleganza-home.onrender.com/api/auth/me/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        setFormData({
          username: data.user.username || "",
          first_name: data.user.first_name || "",
          last_name: data.user.last_name || "",
          email: data.user.email || "",
          mobile: data.mobile || "",
          birthdate: data.birthdate || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "",
          avatar: data.avatar || "",
        });
        setLoading(false);
      })
      .catch(() => {
        logout(); // Clear session on failure
        navigate("/login");
      });
  }, [navigate, logout]);

  /**
   * Logout handler
   * Clears session and shows success toast
   */
  const handleLogout = () => {
    logout();
    Swal.fire({
      icon: "success",
      title: "Logged Out",
      text: "You have been logged out successfully.",
      timer: 2000,
      showConfirmButton: false,
    });
    navigate("/login");
  };

  /**
   * Handle input changes for profile form fields
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Save updated profile
   * Supports avatar upload using multipart/form-data
   */
  const handleSave = async () => {
    const token = localStorage.getItem("access");
    try {
      const formPayload = new FormData();

      // User details
      formPayload.append("user[username]", formData.username);
      formPayload.append("user[first_name]", formData.first_name);
      formPayload.append("user[last_name]", formData.last_name);

      // Profile details
      formPayload.append("mobile", formData.mobile);
      formPayload.append("birthdate", formData.birthdate);
      formPayload.append("address", formData.address);
      formPayload.append("city", formData.city);
      formPayload.append("country", formData.country);

      if (formData.avatar) {
        formPayload.append("avatar", formData.avatar);
      }

      await axios.put(
        "https://eleganza-home.onrender.com/api/auth/me/profile/",
        formPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your profile has been updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Something went wrong while updating your profile.",
      });
    }
  };

  // Show spinner while loading profile
  if (loading) return (
    <div className="dot-spinner">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div key={idx} className="dot-spinner__dot"></div>
      ))}
    </div>
  );

  return (
    <div className="profile-container">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="content-form shadow-lg rounded-3xl p-8 w-full max-w-md">

          {/* ---------------- Profile Header ---------------- */}
          <div className="text-center mb-6 relative">
            {/* Avatar */}
            <img
              src={
                formData.avatar instanceof File
                  ? URL.createObjectURL(formData.avatar)
                  : formData.avatar
                    ? formData.avatar
                    : `https://ui-avatars.com/api/?name=${formData.username}`
              }
              alt="avatar"
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />

            {/* Avatar edit button */}
            <label htmlFor="avatarUpload" className="absolute bottom-0 right-1 pen text-white rounded-full p-1 cursor-pointer shadow-lg">
              ✏️
            </label>

            <input
              type="file"
              id="avatarUpload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.files[0] })}
            />

            <h2 className="text-2xl font-semibold username">{formData.username}</h2>
            <p className="text-gray-600 text-sm">{formData.email}</p>
          </div>

          {/* ---------------- Profile Form ---------------- */}
          <div className="flex flex-col gap-4 profile-form">
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="First Name"
              className="input"
            />
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Last Name"
              className="input"
            />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="input"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              placeholder="Email"
              className="input bg-gray-100 cursor-not-allowed"
            />
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Mobile"
              className="input"
            />
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              placeholder="Birthdate"
              className="input"
            />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="input"
            />
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="input"
            />
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Country"
              className="input"
            />

            {/* Action buttons */}
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-lg shadow-md profile-button transition"
            >
              Save Changes
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="px-6 py-2 rounded-lg shadow-md profile-button transition"
            >
              View Orders
            </button>
            <button
              onClick={() => navigate("/wishlist")}
              className="px-6 py-2 rounded-lg shadow-md profile-button transition"
            >
              Wishlist
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-lg shadow-md profile-button transition"
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;