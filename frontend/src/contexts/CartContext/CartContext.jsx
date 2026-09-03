import React, { useEffect, useState } from "react";

import { CartContext } from "./CartContextDefinition";

import useAuth from "../../hooks/useAuth";

import { carts } from "../../api/cart";

const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadGuestCart = () => {
    try {
      const savedCart = localStorage.getItem("guest_cart");
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];

      if (!Array.isArray(parsedCart)) {
        setCartItems([]);
        return;
      }

      const safeCart = parsedCart.map((item) => ({
        ...item,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
      }));

      setCartItems(safeCart);
    } catch (error) {
      console.error("Failed to load guest cart:", error);
      setCartItems([]);
    }
  };

  const loadUserCart = async () => {
    try {
      const response = await carts.myCart();
      const cart = response.data;

      if (!cart?.id) {
        setCartId(null);
        setCartItems([]);
        return;
      }

      setCartId(cart.id);

      const itemsResponse = await carts.listItems(cart.id);
      const itemsData = itemsResponse.data;

      const itemsList = Array.isArray(itemsData)
        ? itemsData
        : itemsData?.results || [];

      const mergedItems = itemsList.map((item) => ({
        ...item,
        title: item.product?.title || "",
        description: item.product?.description || "",
        images: item.product?.images || [],
        price:
          Number(
            item.product?.final_price ?? item.product?.price
          ) || 0,
        quantity: Number(item.quantity) || 1,
        category: item.product?.category || {},
        brand: item.product?.brand || {},
      }));

      setCartItems(mergedItems);
    } catch (error) {
      console.error("Failed to load user cart:", error);
      setCartItems([]);
      setCartId(null);
    }
  };

  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);

      if (!user) {
        loadGuestCart();
        setLoading(false);
        return;
      }

      await loadUserCart();
      setLoading(false);
    };

    loadCart();
  }, [user]);

  const addToCart = async (product) => {
    if (!user || !cartId) {
      const existing = cartItems.find(
        (item) => item.id === product.id
      );

      const updatedCart = existing
        ? cartItems.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: Number(item.quantity) + 1,
                }
              : item
          )
        : [
            ...cartItems,
            {
              ...product,
              price:
                Number(
                  product.final_price ?? product.price
                ) || 0,
              quantity: 1,
              images: product.images || [],
            },
          ];

      setCartItems(updatedCart);

      localStorage.setItem(
        "guest_cart",
        JSON.stringify(updatedCart)
      );

      return;
    }

    try {
      const existing = cartItems.find(
        (item) => item.product?.id === product.id
      );

      if (existing) {
        const quantity = Number(existing.quantity) + 1;

        await carts.updateItem(cartId, existing.id, {
          quantity,
        });

        setCartItems((previousItems) =>
          previousItems.map((item) =>
            item.id === existing.id
              ? {
                  ...item,
                  quantity,
                }
              : item
          )
        );

        return;
      }

      const response = await carts.addItem(cartId, {
        product_id: product.id,
        quantity: 1,
      });

      const newItem = response.data;

      const mergedItem = {
        ...newItem,
        product,
        title: product.title || "",
        description: product.description || "",
        images: product.images || [],
        price:
          Number(
            product.final_price ?? product.price
          ) || 0,
        quantity: Number(newItem.quantity) || 1,
        category: product.category || {},
        brand: product.brand || {},
      };

      setCartItems((previousItems) => [
        ...previousItems,
        mergedItem,
      ]);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    }
  };

  const removeFromCart = async (id) => {
    if (!user || !cartId) {
      const updatedCart = cartItems.filter(
        (item) => item.id !== id
      );

      setCartItems(updatedCart);

      localStorage.setItem(
        "guest_cart",
        JSON.stringify(updatedCart)
      );

      return;
    }

    try {
      await carts.deleteItem(cartId, id);

      setCartItems((previousItems) =>
        previousItems.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error("Failed to remove cart item:", error);
    }
  };

  const increaseQuantity = async (id) => {
    const item = cartItems.find(
      (cartItem) => cartItem.id === id
    );

    if (!item) {
      return;
    }

    const quantity = Number(item.quantity) + 1;

    if (!user || !cartId) {
      const updatedCart = cartItems.map((cartItem) =>
        cartItem.id === id
          ? {
              ...cartItem,
              quantity,
            }
          : cartItem
      );

      setCartItems(updatedCart);

      localStorage.setItem(
        "guest_cart",
        JSON.stringify(updatedCart)
      );

      return;
    }

    try {
      await carts.updateItem(cartId, id, {
        quantity,
      });

      setCartItems((previousItems) =>
        previousItems.map((cartItem) =>
          cartItem.id === id
            ? {
                ...cartItem,
                quantity,
              }
            : cartItem
        )
      );
    } catch (error) {
      console.error(
        "Failed to increase cart item quantity:",
        error
      );
    }
  };

  const decreaseQuantity = async (id) => {
    const item = cartItems.find(
      (cartItem) => cartItem.id === id
    );

    if (!item) {
      return;
    }

    const quantity = Math.max(
      1,
      Number(item.quantity) - 1
    );

    if (!user || !cartId) {
      const updatedCart = cartItems.map((cartItem) =>
        cartItem.id === id
          ? {
              ...cartItem,
              quantity,
            }
          : cartItem
      );

      setCartItems(updatedCart);

      localStorage.setItem(
        "guest_cart",
        JSON.stringify(updatedCart)
      );

      return;
    }

    try {
      await carts.updateItem(cartId, id, {
        quantity,
      });

      setCartItems((previousItems) =>
        previousItems.map((cartItem) =>
          cartItem.id === id
            ? {
                ...cartItem,
                quantity,
              }
            : cartItem
        )
      );
    } catch (error) {
      console.error(
        "Failed to decrease cart item quantity:",
        error
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);

    if (!user) {
      localStorage.removeItem("guest_cart");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartProvider };