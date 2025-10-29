import { useState, useEffect } from 'react';

export default function useCart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.map(p =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(p => p.id !== id));
  };

  const updateQuantity = (id, qty) => {
    setCart(prev =>
      prev.map(p => (p.id === id ? { ...p, quantity: qty } : p))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const total = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return { cart, addToCart, removeFromCart, updateQuantity, clearCart, total };
}
