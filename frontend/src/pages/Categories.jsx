import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar/navbar';
import Footer from '../components/footer/footer';
import Products from '../components/products/Products';
import './categories.css';

// API base URL, fallback to localhost if not defined in environment variables
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

const Categories = () => {
  // Categories state: default category "All"
  const [categories, setCategories] = useState([{ id: 'all', name: 'All' }]);
  // Selected category state: default is "All"
  const [selectedCategory, setSelectedCategory] = useState({ id: 'all', name: 'All' });
  const [loading, setLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/catalog/categories/`, {
          headers: { Accept: "application/json" }
        });
        const data = await res.json();

        console.log("Categories API response:", data);

        if (Array.isArray(data.results)) {
          // Merge default "All" category with fetched categories
          setCategories([
            { id: 'all', name: 'All', slug: 'all' },
            ...data.results.map(cat => ({ ...cat, slug: cat.slug }))
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      <main>
        <Navbar />
        <div className="categories-container">
          {/* Sidebar: list of categories */}
          <aside className="sidebar">
            <h5>Categories</h5>
            <ul>
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className={selectedCategory.id === cat.id ? 'active' : ''}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat.name}
                </li>
              ))}
            </ul>
          </aside>

          {/* Main content: show products of the selected category */}
          <main className="main-content">
            <Products selectedCategory={selectedCategory} />
          </main>
        </div>
        <Footer />
      </main>
    </>
  );
};

export default Categories;