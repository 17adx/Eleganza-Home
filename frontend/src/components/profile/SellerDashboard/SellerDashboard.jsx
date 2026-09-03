import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";
import { catalog } from "../../../api/catalog";
import { profile } from "../../../api/profile";
import "./SellerDashboard.css";

const EMPTY_PRODUCT_FORM = {
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
};

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [tags, setTags] = useState([]);

  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM);

  useEffect(() => {
    const fetchData = async () => {
      if (!localStorage.getItem("access")) {
        navigate("/login");
        return;
      }

      try {
        const [
          profileResponse,
          productsResponse,
          categoriesResponse,
          brandsResponse,
          tagsResponse,
        ] = await Promise.all([
          profile.me(),
          catalog.sellerProducts(),
          catalog.categories(),
          catalog.brands(),
          catalog.tags(),
        ]);

        setProfileData(profileResponse.data);
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data.results || []);
        setBrands(brandsResponse.data.results || []);
        setTags(tagsResponse.data.results || []);
      } catch (error) {
        console.error("Failed to load seller dashboard:", error);
        logout();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, logout]);

  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;

    setProfileData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const formPayload = new FormData();

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

      await profile.update(formPayload);

      Swal.fire(
        "Success",
        "Profile updated successfully!",
        "success"
      );
    } catch (error) {
      console.error(
        "Failed to update profile:",
        error.response?.data || error
      );

      Swal.fire(
        "Error",
        "Failed to update profile.",
        "error"
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    setProductForm((prev) => ({
      ...prev,
      [name]: files ? files : value,
    }));
  };

  const handleTagChange = (e) => {
    const { value, checked } = e.target;

    setProductForm((prev) => {
      let updatedTags = [...prev.tags];

      if (checked) {
        updatedTags.push(value);
      } else {
        updatedTags = updatedTags.filter((tag) => tag !== value);
      }

      return {
        ...prev,
        tags: updatedTags,
      };
    });
  };

  const handleSaveProduct = async () => {
    try {
      const formData = new FormData();

      [
        "title",
        "description",
        "price",
        "stock",
        "discount_percent",
      ].forEach((key) => {
        const value = productForm[key];

        if (
          value !== "" &&
          value !== null &&
          value !== undefined
        ) {
          formData.append(key, value.toString());
        }
      });

      if (productForm.category) {
        formData.append("category", productForm.category);
      }

      if (productForm.brand) {
        formData.append("brand", productForm.brand);
      }

      productForm.tags.forEach((tagSlug) => {
        formData.append("tags", tagSlug);
      });

      if (productForm.images && productForm.images.length > 0) {
        Array.from(productForm.images).forEach((file) => {
          formData.append("images", file);
        });
      }

      let response;

      if (productForm.id) {
        response = await catalog.updateProduct(
          productForm.id,
          formData
        );

        setProducts((prev) =>
          prev.map((product) =>
            product.id === response.data.id
              ? response.data
              : product
          )
        );
      } else {
        response = await catalog.createProduct(formData);

        setProducts((prev) => [
          ...prev,
          response.data,
        ]);
      }

      await Swal.fire(
        "Success",
        "Product saved successfully!",
        "success"
      );

      setProductForm(EMPTY_PRODUCT_FORM);
    } catch (error) {
      console.error(
        "Failed to save product:",
        error.response?.data || error
      );

      Swal.fire(
        "Error",
        "Failed to save product.",
        "error"
      );
    }
  };

  const handleLogout = () => {
    logout();

    Swal.fire(
      "Logged out",
      "You have been logged out successfully.",
      "success"
    );

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="dot-spinner">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="dot-spinner__dot"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="profile-container flex flex-col md:flex-row gap-6 p-6">
      <div className="content-form md:w-1/3 shadow-lg rounded-3xl p-6">
        <div className="text-center mb-6 relative">
          <img
            src={
              profileData.avatar instanceof File
                ? URL.createObjectURL(profileData.avatar)
                : profileData.avatar
                ? profileData.avatar
                : `https://ui-avatars.com/api/?name=${
                    profileData.user?.username || "User"
                  }`
            }
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

          <p className="text-gray-600">
            {profileData.user?.email}
          </p>
        </div>

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

      <div className="product-content md:w-2/3 shadow-lg rounded-3xl p-6">
        <h3 className="product-title">
          Your Products ({products.length})
        </h3>

        <ul className="mb-4">
          {products.map((product) => (
            <li
              key={product.id}
              className="mb-2"
            >
              {product.title} - ${product.price}

              <button
                onClick={() => setProductForm(product)}
                className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
              >
                Edit
              </button>
            </li>
          ))}
        </ul>

        <h4 className="product-form-title">
          {productForm.id
            ? "Edit Product"
            : "Add New Product"}
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
            <option value="">
              Select Category
            </option>

            {categories.map((category) => (
              <option
                key={category.slug}
                value={category.slug}
              >
                {category.name}
              </option>
            ))}
          </select>

          <select
            name="brand"
            value={productForm.brand}
            onChange={handleInputChange}
            className="input"
          >
            <option value="">
              Select Brand
            </option>

            {brands.map((brand) => (
              <option
                key={brand.slug}
                value={brand.slug}
              >
                {brand.name}
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

            <input
              type="file"
              name="images"
              multiple
              onChange={handleInputChange}
            />
          </label>

          <div className="tags-heading">
            <h5 className="product-form-title">
              Choose Tags
            </h5>
          </div>

          <div className="tags">
            {tags.map((tag) => (
              <label
                key={tag.slug}
                className="input tags button-confirm"
              >
                <input
                  type="checkbox"
                  value={tag.slug}
                  checked={productForm.tags.includes(
                    tag.slug
                  )}
                  onChange={handleTagChange}
                />{" "}
                {tag.name}
              </label>
            ))}
          </div>

          <button
            onClick={handleSaveProduct}
            className="px-6 py-2 rounded-lg shadow-md button-confirm"
          >
            {productForm.id
              ? "Update Product"
              : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;