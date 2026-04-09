import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { getWishlist, getProductKey, normalizeCartItem, saveWishlist } from "../utils/helpers";

export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const userKey = user?.email || "guest";
  const [wishlist, setWishlist] = useState(() => getWishlist(userKey));

  useEffect(() => {
    setWishlist(getWishlist(userKey));
  }, [userKey]);

  useEffect(() => {
    saveWishlist(userKey, wishlist);
  }, [userKey, wishlist]);

  const toggleWishlist = (product) => {
    const item = normalizeCartItem(product);

    setWishlist((prev) => {
      const exists = prev.some((entry) => entry.id === item.id);
      return exists ? prev.filter((entry) => entry.id !== item.id) : [item, ...prev];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const clearWishlist = () => setWishlist([]);

  const isWishlisted = (product) => {
    const key = getProductKey(product);
    return wishlist.some((item) => item.id === key);
  };

  const value = useMemo(
    () => ({
      wishlist,
      wishlistCount: wishlist.length,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
      isWishlisted,
    }),
    [wishlist]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
