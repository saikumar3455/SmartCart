import {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";

export const AppContext = createContext();

export function AppProvider({ children }) {
  const { user } = useAuth();
  const isProtectedPage = (target) =>
    [
      "home",
      "cart",
      "checkout",
      "success",
      "orders",
      "wishlist",
      "builder",
      "compare",
      "notifications",
      "profile",
      "product",
    ].some((page) => target === page || target.startsWith(`${page}/`) || target.startsWith(`${page}?`));

  const getInitialPage = () => {
    const hashPage = window.location.hash.replace("#", "");
    if (hashPage) return hashPage;

    const saved = localStorage.getItem("sc_user");
    const u = saved ? JSON.parse(saved) : null;
    return u ? (u.role === "admin" ? "admin" : "home") : "welcome";
  };

  const [page, setPageRaw] = useState(getInitialPage);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toasts, setToasts] = useState([]);

  const navigate = useCallback(
    (target) => {
      if (isProtectedPage(target) && !user) {
        target = "login";
      }

      if ((target === "admin" || target.startsWith("admin/")) && user?.role !== "admin") {
        target = "home";
      }

      window.history.pushState({ page: target }, "", `#${target}`);
      setPageRaw(target);
    },
    [user]
  );

  const toast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // ✅ browser back / forward support
  useEffect(() => {
    const handlePopState = () => {
      const hashPage = window.location.hash.replace("#", "");
      setPageRaw(hashPage || "welcome");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        page,
        navigate,
        selectedProduct,
        setSelectedProduct,
        toasts,
        toast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
