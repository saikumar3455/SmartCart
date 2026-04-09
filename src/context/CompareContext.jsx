import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { getCompareItems, getProductKey, saveCompareItems } from "../utils/helpers";

const CompareContext = createContext();

export function CompareProvider({ children }) {
  const { user } = useAuth();
  const userKey = user?.email || "guest";
  const [compareItems, setCompareItems] = useState(() => getCompareItems(userKey));

  useEffect(() => {
    setCompareItems(getCompareItems(userKey));
  }, [userKey]);

  useEffect(() => {
    saveCompareItems(userKey, compareItems);
  }, [compareItems, userKey]);

  const value = useMemo(() => {
    const isCompared = (product) =>
      compareItems.some((item) => getProductKey(item) === getProductKey(product));

    const toggleCompare = (product) => {
      setCompareItems((prev) => {
        const exists = prev.some((item) => getProductKey(item) === getProductKey(product));

        if (exists) {
          return prev.filter((item) => getProductKey(item) !== getProductKey(product));
        }

        if (prev.length >= 4) {
          return prev;
        }

        return [...prev, product];
      });
    };

    const removeCompareItem = (productKey) => {
      setCompareItems((prev) => prev.filter((item) => getProductKey(item) !== productKey));
    };

    const clearCompare = () => setCompareItems([]);

    return {
      compareItems,
      compareCount: compareItems.length,
      isCompared,
      toggleCompare,
      removeCompareItem,
      clearCompare,
    };
  }, [compareItems]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export const useCompare = () => useContext(CompareContext);
