import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useUser } from "../../../contexts/UserContext/UserContext";
import axios from "axios";
import "./SellerDashboard.css";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser(); // User context to manage session
  const [loading, setLoading] = useState(true); // Spinner while fetching data

  // --- State for profile and products ---
  const [profileData, setProfileData] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [tags, setTags] = useState([]);

  // --- Form state for product creation/editing ---
  const [productForm, setProductForm] = useState({
    id: null,
    title: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
    discount_percent: "",
    tags: [],
    images: [],
  });

  const token = localStorage.getItem("access");
  const headers = { Authorization: `Bearer ${token}` }; // Common headers for API calls

  /**
   * Fetch seller profile, products, categories, brands, and tags
   * Runs once on component mount
   */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch profile info
        const profileRes = await axios.get(
          "http://localhost:8000/api/auth/me/profile/",
          { headers }
        );
        setProfileData(profileRes.data);

        // Fetch seller's products
        const productsRes = await axios.get(
          "http://localhost:8000/api/catalog/products/seller/",
          { headers }
        );
        setProducts(productsRes.data);

        // Fetch categories, brands, and tags simultaneously
        const [categoriesRes, brandsRes, tagsRes] = await Promise.all([
          axios.get("http://localhost:8000/api/catalog/categories/", { headers }),
          axios.get("http://localhost:8000/api/catalog/brands/", { headers }),
          axios.get("http://localhost:8000/api/catalog/tags/", { headers }),
        ]);

        setCategories(categoriesRes.data.results || []);
        setBrands(brandsRes.data.results || []);
        setTags(tagsRes.data.results || []);

        setLoading(false);
      } catch (err) {
        console.error(err);
        logout();
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate, logout, token]);

  /**
   * Handle changes in the profile form
   * Supports text input and file uploads
   */
  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  /**
   * Save the updated seller profile
   * Sends multipart/form-data to support file uploads
   */
  const handleSaveProfile = async () => {
    try {
      const formPayload = new FormData();

      // Append user and profile fields
      formPayload.append("username", profileData.user?.username || "");
      formPayload.append("first_name", profileData.user?.first_name || "");
      formPayload.append("last_name", profileData.user?.last_name || "");
      formPayload.append("mobile", profileData.mobile || "");
      formPayload.append("birthdate", profileData.birthdate || "");
      formPayload.append("address", profileData.address || "");
      formPayload.append("city", profileData.city || "");
      formPayload.append("country", profileData.country || "");
      formPayload.append("is_seller", "true");

      if (profileData.avatar instanceof File) {
        formPayload.append("avatar", profileData.avatar);
      }

      await axios.put(
        "http://localhost:8000/api/auth/me/profile/",
        formPayload,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );

      Swal.fire("Success", "Profile updated successfully!", "success");
    } catch (err) {
      console.error(err.response ? err.response.data : err);
      Swal.fire("Error", "Failed to update profile.", "error");
    }
  };

  /**
   * Handle changes in the product form
   * Supports text, number inputs, and file uploads
   */
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: files ? files : value,
    }));
  };

  /**
   * Handle changes to product tags (checkboxes)
   */
  const handleTagChange = (e) => {
    const { value, checked } = e.target;
    setProductForm((prev) => {
      let updatedTags = [...prev.tags];
      if (checked) updatedTags.push(value);
      else updatedTags = updatedTags.filter((tag) => tag !== value);
      return { ...prev, tags: updatedTags };
    });
  };

  /**
   * Save or update a product
   * Supports multipart form data for images
   */
  const handleSaveProduct = async () => {
    try {
      const formData = new FormData();

      ["title", "description", "price", "stock", "discount_percent"].forEach((key) => {
        const value = productForm[key];
        if (value !== "" && value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      if (productForm.category) formData.append("category", productForm.category);
      if (productForm.brand) formData.append("brand", productForm.brand);

      productForm.tags.forEach((tagSlug) => formData.append("tags", tagSlug));

      if (productForm.images && productForm.images.length > 0) {
        Array.from(productForm.images).forEach((file) => formData.append("images", file));
      }

      let res;
      if (productForm.id) {
        // Update existing product
        res = await axios.put(
          `http://localhost:8000/api/catalog/products/${productForm.id}/`,
          formData,
          { headers: { ...headers, "Content-Type": "multipart/form-data" } }
        );
        setProducts((prev) => prev.map((p) => (p.id === res.data.id ? res.data : p)));
      } else {
        // Add new product
        res = await axios.post(
          "http://localhost:8000/api/catalog/products/",
          formData,
          { headers: { ...headers, "Content-Type": "multipart/form-data" } }
        );
        setProducts((prev) => [...prev, res.data]);
      }

      Swal.fire("Success", "Product saved successfully!", "success");

      // Reset product form
      setProductForm({
        id: null,
        title: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        brand: "",
        discount_percent: "",
        tags: [],
        images: [],
      });
    } catch (err) {
      console.error(err.response ? err.response.data : err);
      Swal.fire("Error", "Failed to save product.", "error");
    }
  };

  /**
   * Logout the user
   */
  const handleLogout = () => {
    logout();
    Swal.fire("Logged out", "You have been logged out successfully.", "success");
    navigate("/login");
  };

  if (loading)
    return (
      <div className="dot-spinner">
        {Array.from({ length: 9 }).map((_, idx) => (
          <div key={idx} className="dot-spinner__dot"></div>
        ))}
      </div>
    );

  return (
    <div className="profile-container flex flex-col md:flex-row gap-6 p-6">
      {/* ------------------- Profile Section ------------------- */}
      <div className="content-form md:w-1/3 shadow-lg rounded-3xl p-6">
        <div className="text-center mb-6 relative">
          {/* Avatar */}
          <img
            src={
              profileData.avatar instanceof File
                ? URL.createObjectURL(profileData.avatar)
                : profileData.avatar
                ? profileData.avatar
                : `https://ui-avatars.com/api/?name=${profileData.user?.username || "User"}`
            }
            alt="avatar"
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
          />

          {/* Avatar edit button */}
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
            onChange={(e) =>
              setProfileData((prev) => ({
                ...prev,
                avatar: e.target.files[0],
              }))
            }
          />

          <h2 className="text-2xl font-semibold username">
            {profileData.user?.username}
          </h2>
          <p className="text-gray-600">{profileData.user?.email}</p>
        </div>

        {/* Profile form */}
        <div className="flex flex-col gap-3 profile-form">
          <input
            type="text"
            name="first_name"
            value={profileData.user?.first_name || ""}
            onChange={handleProfileChange}
            className="input"
            placeholder="First Name"
          />
          <input
            type="text"
            name="last_name"
            value={profileData.user?.last_name || ""}
            onChange={handleProfileChange}
            className="input"
            placeholder="Last Name"
          />
          <input
            type="text"
            name="mobile"
            value={profileData.mobile || ""}
            onChange={handleProfileChange}
            className="input"
            placeholder="Mobile"
          />
          <input
            type="text"
            name="address"
            value={profileData.address || ""}
            onChange={handleProfileChange}
            className="input"
            placeholder="Address"
          />
          <input
            type="text"
            name="city"
            value={profileData.city || ""}
            onChange={handleProfileChange}
            className="input"
            placeholder="City"
          />
          <input
            type="text"
            name="country"
            value={profileData.country || ""}
            onChange={handleProfileChange}
            className="input"
            placeholder="Country"
          />
          <button
            onClick={handleSaveProfile}
            className="profile-button px-6 py-2 rounded-lg shadow-md"
          >
            Save Profile
          </button>
          <button
            onClick={handleLogout}
            className="profile-button px-6 py-2 rounded-lg shadow-md"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ------------------- Products Section ------------------- */}
      <div className="product-content md:w-2/3 shadow-lg rounded-3xl p-6">
        <h3 className="product-title">Your Products ({products.length})</h3>

        {/* Product list with edit buttons */}
        <ul className="mb-4">
          {products.map((p) => (
            <li key={p.id} className="mb-2">
              {p.title} - ${p.price}
              <button
                onClick={() => setProductForm(p)}
                className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
              >
                Edit
              </button>
            </li>
          ))}
        </ul>

        {/* Product form for add/edit */}
        <h4 className="product-form-title">
          {productForm.id ? "Edit Product" : "Add New Product"}
        </h4>
        <div className="product-form">
          <input
            type="text"
            name="title"
            value={productForm.title}
            onChange={handleInputChange}
            placeholder="Title"
            className="input"
          />
          <input
            type="text"
            name="description"
            value={productForm.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="input"
          />
          <input
            type="number"
            name="price"
            value={productForm.price}
            onChange={handleInputChange}
            placeholder="Price"
            className="input"
          />
          <input
            type="number"
            name="stock"
            value={productForm.stock}
            onChange={handleInputChange}
            placeholder="Stock"
            className="input"
          />

          <select
            name="category"
            value={productForm.category}
            onChange={handleInputChange}
            className="input"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            name="brand"
            value={productForm.brand}
            onChange={handleInputChange}
            className="input"
          >
            <option value="">Select Brand</option>
            {brands.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="discount_percent"
            value={productForm.discount_percent}
            onChange={handleInputChange}
            placeholder="Discount %"
            className="input"
          />

          <label className="input upload-images button-confirm">
            Upload Images
            <input type="file" name="images" multiple onChange={handleInputChange} />
          </label>

          {/* Tags checkboxes */}
          <h5 className="product-form-title">Choose Tags</h5>
          <div className="tags">
            {tags.map((t) => (
              <label key={t.slug} className="input tags button-confirm">
                <input
                  type="checkbox"
                  value={t.slug}
                  checked={productForm.tags.includes(t.slug)}
                  onChange={handleTagChange}
                />{" "}
                {t.name}
              </label>
            ))}
          </div>

          <button
            onClick={handleSaveProduct}
            className="px-6 py-2 rounded-lg shadow-md button-confirm"
          >
            {productForm.id ? "Update Product" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;