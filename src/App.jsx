import "./styles/global.css";

import "./App.css";

import { AuthProvider }    from "./context/AuthContext";
import { CartProvider }    from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AppProvider, useApp } from "./context/AppContext";

import Toast           from "./components/Toast";
import ErrorBoundary   from "./components/ErrorBoundary";
import Welcome         from "./pages/Welcome";
import { Login, Signup } from "./pages/Auth";
import Homepage        from "./pages/Homepage";
import ProductDetails  from "./pages/ProductDetail";
import CartPage        from "./pages/CartPage";
import Checkout        from "./pages/Checkout";
import OrderDetail     from "./pages/OrderDetail";
import Success         from "./pages/Success";
import Orders          from "./pages/Orders";
import Profile         from "./pages/Profile";
import Admin           from "./pages/Admin";
import Wishlist        from "./pages/Wishlist";
import BundleBuilder   from "./pages/BundleBuilder";

// Seed localStorage with default products + admin user on first load


/* ── Router reads AppContext.page and renders the matching page ── */
function Router() {
  const { page } = useApp();

  const pages = {
    welcome: <Welcome />,
    login:   <Login />,
    signup:  <Signup />,
    home:    <Homepage />,
    product: <ProductDetails />,
    cart:    <CartPage />,
    checkout:<Checkout />,
    success: <Success />,
    orders:  <Orders />,
    wishlist: <Wishlist />,
    builder: <BundleBuilder />,
    profile: <Profile />,
    admin:   <Admin />,
  };

  if (page.startsWith("product/")) {
    return (
      <>
        <ProductDetails />
        <Toast />
      </>
    );
  }

  if (page.startsWith("orders/")) {
    return (
      <>
        <OrderDetail />
        <Toast />
      </>
    );
  }

  if (page.startsWith("builder")) {
    return (
      <>
        <BundleBuilder />
        <Toast />
      </>
    );
  }

  return (
    <>
      {pages[page] ?? <Welcome />}
      <Toast />
    </>
  );
}

/* ── Providers wrap the entire app ── */
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AppProvider>
            <ErrorBoundary>
              <Router />
            </ErrorBoundary>
          </AppProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
