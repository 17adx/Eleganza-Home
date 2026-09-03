import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import Swal from "sweetalert2";

import useAuth from "../../../hooks/useAuth";

import { profile } from "../../../api/profile";

import "./UserProfile.css";

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [formData, setFormData] = useState({
    username: user?.username || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    mobile: "",
    birthdate: "",
    address: "",
    city: "",
    country: "",
    avatar: user?.avatar || "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await profile.me();
        const data = response.data;

        setFormData({
          username: data.username || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          mobile: data.mobile || "",
          birthdate: data.birthdate || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "",
          avatar: data.avatar || "",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);

        logout();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, logout]);

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

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!user) {
      logout();
      navigate("/login");
      return;
    }

    try {
      const formPayload = new FormData();

      formPayload.append(
        "user[username]",
        formData.username
      );

      formPayload.append(
        "user[first_name]",
        formData.first_name
      );

      formPayload.append(
        "user[last_name]",
        formData.last_name
      );

      formPayload.append("mobile", formData.mobile);
      formPayload.append("birthdate", formData.birthdate);
      formPayload.append("address", formData.address);
      formPayload.append("city", formData.city);
      formPayload.append("country", formData.country);

      if (formData.avatar instanceof File) {
        formPayload.append("avatar", formData.avatar);
      }

      await profile.update(formPayload);

      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your profile has been updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Failed to update profile:", error);

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Something went wrong while updating your profile.",
      });
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFormData((previousData) => ({
      ...previousData,
      avatar: file,
    }));
  };

  if (loading) {
    return (
      <div className="dot-spinner">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="dot-spinner__dot"
          ></div>
        ))}
      </div>
    );
  }

  const avatarPreview =
    formData.avatar instanceof File
      ? URL.createObjectURL(formData.avatar)
      : formData.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          formData.username
        )}`;

  return (
    <div className="profile-container">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="content-form shadow-lg rounded-3xl p-8 w-full max-w-md">
          <div className="text-center mb-6 relative">
            <img
              src={avatarPreview}
              alt="avatar"
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />

            <label
              htmlFor="avatarUpload"
              className="absolute bottom-0 right-1 pen text-white rounded-full p-1 cursor-pointer shadow-lg"
            >
              ✏️
            </label>

            <input
              type="file"
              id="avatarUpload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />

            <h2 className="text-2xl font-semibold username">
              {formData.username}
            </h2>

            <p className="text-gray-600 text-sm">
              {formData.email}
            </p>
          </div>

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