import React, { useEffect, useState } from "react";

import Navbar from "../components/common/Navbar/navbar";

import Footer from "../components/common/Footer/footer";

import Products from "../components/catalog/Products/Products";

import { catalog } from "../api/catalog";

import "./Categories.css";

const Categories = () => {
  // Categories state: default category "All"
  const [categories, setCategories] = useState([
    {
      id: "all",
      name: "All",
      slug: "all",
    },
  ]);

  // Selected category state: default is "All"
  const [selectedCategory, setSelectedCategory] = useState({
    id: "all",
    name: "All",
    slug: "all",
  });

  // Fetch categories from the centralized API layer
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await catalog.listCategories();

        const data = response.data;

        console.log("Categories API response:", data);

        if (Array.isArray(data.results)) {
          setCategories([
            {
              id: "all",
              name: "All",
              slug: "all",
            },
            ...data.results.map((category) => ({
              ...category,
              slug: category.slug,
            })),
          ]);
        }
      } catch (error) {
        console.error(
          "Failed to fetch categories:",
          error
        );
      }
    };

    fetchCategories();
  }, []);

  return (
    <main>
      <Navbar />

      <div className="categories-container">
        {/* Categories Sidebar */}
        <aside className="sidebar">
          <h5>Categories</h5>

          <ul>
            {categories.map((category) => (
              <li
                key={category.id}
                className={
                  selectedCategory.id === category.id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setSelectedCategory(category)
                }
              >
                {category.name}
              </li>
            ))}
          </ul>
        </aside>

        {/* Products */}
        <main className="main-content">
          <Products
            selectedCategory={selectedCategory}
          />
        </main>
      </div>

      <Footer />
    </main>
  );
};

export default Categories;