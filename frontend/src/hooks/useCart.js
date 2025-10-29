import { useState, useEffect } from 'react';

const CART_KEY = 'arcana_cart';

export function useCart() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    setCartItems(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    setTotal(cartItems.reduce((sum, i) => sum + i.quantity * i.product.price, 0));
  }, [cartItems]);

  const addItem = (product, qty) => {
    setCartItems(items => {
      const idx = items.findIndex(i => i.product.id === product.id);
      if (idx >= 0) {
        items[idx].quantity += qty;
        return [...items];
      }
      return [...items, { product, quantity: qty }];
    });
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(i => i.product.id !== id));
  };

  const clearCart = () => setCartItems([]);

  return { cartItems, total, addItem, removeItem, clearCart };
}
