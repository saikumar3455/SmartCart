import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { getCart, saveCart } from "../utils/helpers";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext);
  const userKey = user?.email || "guest";

  const [cart, setCart] = useState(() => getCart(userKey));

  // Reload cart when user switches
  useEffect(() => { setCart(getCart(userKey)); }, [userKey]);

  // Persist on every change
  useEffect(() => { saveCart(userKey, cart); }, [cart, userKey]);

  const addToCart = (product) =>
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      return existing
        ? prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...product, qty: 1 }];
    });

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  const increaseQty = (id) =>
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty: i.qty + 1 } : i));

  const decreaseQty = (id) =>
    setCart((prev) =>
      prev.map((i) => i.id === id ? { ...i, qty: i.qty - 1 } : i).filter((i) => i.qty > 0)
    );

  const clearCart = () => setCart([]);

  const total      = cart.reduce((a, i) => a + Number(i.price) * i.qty, 0);
  const totalItems = cart.reduce((a, i) => a + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, increaseQty, decreaseQty, clearCart, total, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);