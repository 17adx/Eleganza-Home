import { useContext } from 'react';
import { CartContext } from '../CartContext/CartContext';

/**
 * Custom hook: useCart
 * Provides easy access to the CartContext throughout the app.
 * 
 * Usage:
 * const { cartItems, addToCart, removeFromCart } = useCart();
 *
 * This hook abstracts the useContext(CartContext) call,
 * making it cleaner and more readable in functional components.
 */
export const useCart = () => useContext(CartContext);