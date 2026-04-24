import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const updateStorage = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const addToCart = (item) => {
    updateStorage(
      cart.find(i => i.id === item.id)
        ? cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...cart, { ...item, quantity: 1 }]
    );
  };

  const removeFromCart = (id) => updateStorage(cart.filter(i => i.id !== id));

  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    updateStorage(cart.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => updateStorage([]);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
