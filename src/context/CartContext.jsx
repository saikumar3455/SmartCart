import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { getCart, getSavedForLater, normalizeCartItem, saveCart, saveSavedForLater } from "../utils/helpers";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext);
  const userKey = user?.email || "guest";

  const [cart, setCart] = useState(() => getCart(userKey));
  const [savedForLater, setSavedForLater] = useState(() => getSavedForLater(userKey));

  // Reload cart when user switches
  useEffect(() => {
    setCart(getCart(userKey));
    setSavedForLater(getSavedForLater(userKey));
  }, [userKey]);

  // Persist on every change
  useEffect(() => { saveCart(userKey, cart); }, [cart, userKey]);
  useEffect(() => { saveSavedForLater(userKey, savedForLater); }, [savedForLater, userKey]);

  const addToCart = (product) =>
    setCart((prev) => {
      const item = normalizeCartItem(product);
      const existing = prev.find((i) => i.id === item.id);
      return existing
        ? prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...item, qty: 1 }];
    });

  const addItemsToCart = (products) =>
    setCart((prev) => {
      let next = [...prev];

      products.forEach((product) => {
        const item = normalizeCartItem(product);
        const qtyToAdd = Number(product.quantity || product.qty || 1);
        const existing = next.find((entry) => entry.id === item.id);

        if (existing) {
          next = next.map((entry) =>
            entry.id === item.id ? { ...entry, qty: entry.qty + qtyToAdd } : entry
          );
        } else {
          next.push({ ...item, qty: qtyToAdd });
        }
      });

      return next;
    });

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  const increaseQty = (id) =>
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty: i.qty + 1 } : i));

  const decreaseQty = (id) =>
    setCart((prev) =>
      prev.map((i) => i.id === id ? { ...i, qty: i.qty - 1 } : i).filter((i) => i.qty > 0)
    );

  const clearCart = () => setCart([]);

  const saveForLater = (id) =>
    setCart((prev) => {
      const item = prev.find((entry) => entry.id === id);
      if (!item) return prev;

      setSavedForLater((current) => {
        const exists = current.find((entry) => entry.id === item.id);
        if (exists) return current;
        return [...current, item];
      });

      return prev.filter((entry) => entry.id !== id);
    });

  const moveToCart = (id) =>
    setSavedForLater((prev) => {
      const item = prev.find((entry) => entry.id === id);
      if (!item) return prev;

      setCart((current) => {
        const exists = current.find((entry) => entry.id === item.id);
        return exists
          ? current.map((entry) =>
              entry.id === item.id ? { ...entry, qty: entry.qty + item.qty } : entry
            )
          : [...current, item];
      });

      return prev.filter((entry) => entry.id !== id);
    });

  const removeSavedItem = (id) =>
    setSavedForLater((prev) => prev.filter((entry) => entry.id !== id));

  const clearSavedForLater = () => setSavedForLater([]);

  const total      = cart.reduce((a, i) => a + Number(i.price) * i.qty, 0);
  const totalItems = cart.reduce((a, i) => a + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, savedForLater, addToCart, addItemsToCart, removeFromCart, increaseQty, decreaseQty, clearCart, saveForLater, moveToCart, removeSavedItem, clearSavedForLater, total, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
