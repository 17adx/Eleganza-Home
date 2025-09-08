import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '../UserContext/UserContext';

// Create CartContext
export const CartContext = createContext();

/**
 * CartProvider Component
 * Provides cart state and helper functions (add, remove, update, clear) 
 * for both logged-in and guest users.
 */
export const CartProvider = ({ children }) => {
  const { user } = useUser(); // Access user info from context
  const [cartItems, setCartItems] = useState([]); // List of items in cart
  const [cartId, setCartId] = useState(null); // Server-side cart ID for logged-in users
  const [loading, setLoading] = useState(true); // Loading state while fetching cart

  // Function to generate headers for API calls
  const getHeaders = () => {
    const token = localStorage.getItem("access");
    return token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  };

  // Fetch the cart on component mount or whenever the user changes
  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (!user) {
          // Guest cart: retrieve from localStorage
          const savedCart = localStorage.getItem("guest_cart");
          const parsedCart = savedCart ? JSON.parse(savedCart) : [];
          const safeCart = parsedCart.map(item => ({
            ...item,
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1
          }));
          setCartItems(safeCart);
          setLoading(false);
          return;
        }

        // Logged-in user's cart: fetch from backend
        const res = await fetch("http://localhost:8000/api/orders/carts/my/", { headers: getHeaders() });
        if (!res.ok) throw new Error(`Failed to fetch cart: ${res.status}`);
        const data = await res.json();

        let cart = Array.isArray(data) && data.length > 0 ? data[0] : data?.id ? data : null;

        // If no cart exists, create a new one
        if (!cart) {
          const createRes = await fetch("http://localhost:8000/api/orders/carts/create/", {
            method: "POST",
            headers: getHeaders()
          });
          if (!createRes.ok) throw new Error(`Failed to create cart: ${createRes.status}`);
          cart = await createRes.json();
        }

        if (!cart?.id) {
          setCartId(null);
          setCartItems([]);
          setLoading(false);
          return;
        }

        setCartId(cart.id);

        // Fetch cart items
        const itemsRes = await fetch(`http://localhost:8000/api/orders/carts/${cart.id}/items/`, { headers: getHeaders() });
        if (!itemsRes.ok) throw new Error(`Failed to fetch cart items: ${itemsRes.status}`);
        const itemsData = await itemsRes.json();

        const itemsList = Array.isArray(itemsData) ? itemsData : itemsData?.results || [];

        // Map backend response to front-end format
        const mergedItems = itemsList.map(item => ({
          ...item,
          title: item.product?.title || '',
          description: item.product?.description || '',
          images: item.product?.images || [],
          price: Number(item.product?.price) || 0,
          quantity: Number(item.quantity) || 1,
          category: item.product?.category || {},
          brand: item.product?.brand || {}
        }));

        setCartItems(mergedItems);

      } catch (err) {
        console.error("Failed to fetch cart:", err);
        setCartItems([]);
        setCartId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  /**
   * Sync individual cart item with backend (PATCH)
   * Only applies to logged-in users
   */
  const syncCartItem = async (itemId, data) => {
    if (!user || !cartId) return;
    try {
      await fetch(`http://localhost:8000/api/orders/carts/${cartId}/items/${itemId}/`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.error("Failed to sync cart item:", err);
    }
  };

  /**
   * Add a product to the cart
   * Handles both guest and logged-in users
   */
  const addToCart = async (product) => {
    if (user && cartId) {
      // Logged-in user
      const existing = cartItems.find(item => item.product?.id === product.id);
      if (existing) {
        const updated = { ...existing, quantity: Number(existing.quantity) + 1 };
        setCartItems(prev => prev.map(i => i.product?.id === product.id ? updated : i));
        await syncCartItem(existing.id, { quantity: updated.quantity });
      } else {
        const res = await fetch(`http://localhost:8000/api/orders/carts/${cartId}/items/`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ product_id: product.id, quantity: 1 })
        });
        if (!res.ok) throw new Error(`Failed to add cart item: ${res.status}`);
        const newItem = await res.json();

        const mergedItem = {
          ...newItem,
          product,
          title: product.title || '',
          description: product.description || '',
          images: product.images || [],
          price: Number(product.price) || 0,
          quantity: Number(newItem.quantity) || 1,
          category: product.category || {},
          brand: product.brand || {}
        };

        setCartItems(prev => [...prev, mergedItem]);
      }
    } else {
      // Guest user: store in localStorage
      const existing = cartItems.find(i => i.id === product.id);
      const updatedCart = existing
        ? cartItems.map(i => i.id === product.id ? { ...i, quantity: Number(i.quantity) + 1 } : i)
        : [...cartItems, { ...product, price: Number(product.price) || 0, quantity: 1, images: product.images || [] }];
      setCartItems(updatedCart);
      localStorage.setItem("guest_cart", JSON.stringify(updatedCart));
    }
  };

  /**
   * Remove a product from the cart
   * Handles both guest and logged-in users
   */
  const removeFromCart = async (id) => {
    if (user && cartId) {
      try {
        await fetch(`http://localhost:8000/api/orders/carts/${cartId}/items/${id}/`, { method: "DELETE", headers: getHeaders() });
        setCartItems(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error("Failed to remove item:", err);
      }
    } else {
      const updatedCart = cartItems.filter(item => item.id !== id);
      setCartItems(updatedCart);
      localStorage.setItem("guest_cart", JSON.stringify(updatedCart));
    }
  };

  // Increase quantity of a cart item
  const increaseQuantity = (id) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;
    const updated = { ...item, quantity: Number(item.quantity) + 1 };
    setCartItems(prev => prev.map(i => i.id === id ? updated : i));
    syncCartItem(id, updated);
  };

  // Decrease quantity of a cart item (min quantity = 1)
  const decreaseQuantity = (id) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;
    const qty = Number(item.quantity) > 1 ? Number(item.quantity) - 1 : 1;
    const updated = { ...item, quantity: qty };
    setCartItems(prev => prev.map(i => i.id === id ? updated : i));
    syncCartItem(id, updated);
  };

  // Clear entire cart (guest or logged-in)
  const clearCart = () => {
    setCartItems([]);
    setCartId(null);
    if (!user) localStorage.removeItem("guest_cart");
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => useContext(CartContext);