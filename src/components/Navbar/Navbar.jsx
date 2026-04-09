import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCompare } from "../../context/CompareContext";
import { useNotifications } from "../../context/NotificationsContext";
import { useApp } from "../../context/AppContext";
import { fmt } from "../../utils/helpers";
import styles from "./Navbar.module.css";

export default function Navbar({ showSearch = false }) {
  const { user, logout } = useAuth();
  const { totalItems, total } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareCount } = useCompare();
  const { unreadCount } = useNotifications();
  const { navigate, page } = useApp();
  const [search, setSearch] = useState("");
  const [drop, setDrop] = useState(false);

  // expose search value upward via window (simple approach without prop drilling)
  if (typeof window !== "undefined") window.__sc_search = search;

  const handleLogout = () => { logout(); navigate("welcome"); setDrop(false); };

  const menuItems = [
    { label: "🏠 Shop",        target: "home"    },
    { label: "✨ Build a Look", target: "builder" },
    { label: "⇄ Compare",      target: "compare" },
    { label: "♡ Wishlist",    target: "wishlist" },
    { label: "🔔 Notifications", target: "notifications" },
    { label: "🛒 Cart",        target: "cart"    },
    { label: "📦 My Orders",   target: "orders"  },
    { label: "👤 Profile",     target: "profile" },
    ...(user?.role === "admin" ? [{ label: "⚙️ Admin Panel", target: "admin" }] : []),
  ];

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        {/* Logo */}
        <div className={styles.logo} onClick={() => navigate("home")}>
          <div className={styles.logoIcon}>S</div>
          <span className={styles.logoText}>
            Smart<em>Cart</em>
          </span>
        </div>

        {/* Search */}
        {showSearch && (
          <div className={styles.searchBox}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
            />
            {search && (
              <button onClick={() => setSearch("")} className={styles.clearBtn}>×</button>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <button
            className={styles.iconAction}
            onClick={() => navigate("wishlist")}
            aria-label="Open wishlist"
          >
            <span className={styles.iconGlyph}>{wishlistCount > 0 ? "♥" : "♡"}</span>
            {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
          </button>

          <button
            className={styles.iconAction}
            onClick={() => navigate("compare")}
            aria-label="Open compare"
          >
            <span className={styles.iconGlyph}>⇄</span>
            {compareCount > 0 && <span className={styles.badge}>{compareCount}</span>}
          </button>

          <button
            className={styles.iconAction}
            onClick={() => navigate("notifications")}
            aria-label="Open notifications"
          >
            <span className={styles.iconGlyph}>🔔</span>
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          </button>

          <button className={styles.cartAction} onClick={() => navigate("cart")}>
            <span className={styles.cartTopRow}>
              <span className={styles.cartIconWrap}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </span>
              <span className={styles.cartLabel}>Cart</span>
              {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
            </span>
            {total > 0 && <span className={styles.cartPrice}>{fmt(total)}</span>}
          </button>

          {/* Profile dropdown */}
          <div className={styles.profileWrap}>
            <button
              className={styles.avatar}
              onClick={() => setDrop(!drop)}
            >
              {user?.name?.[0]?.toUpperCase() || "U"}
            </button>

            {drop && (
              <div className={styles.dropdown} onClick={() => setDrop(false)}>
                <div className={styles.dropHeader}>
                  <p className={styles.dropName}>{user?.name}</p>
                  <p className={styles.dropEmail}>{user?.email}</p>
                  <span className={`badge badge-${user?.role === "admin" ? "accent" : "dim"}`}>{user?.role}</span>
                </div>

                {menuItems.map((item) => (
                  <button
                    key={item.target}
                    className={styles.dropItem}
                    onClick={() => navigate(item.target)}
                  >
                    {item.label}
                  </button>
                ))}

                <hr className="divider" style={{ margin: "4px 0" }} />
                <button className={`${styles.dropItem} ${styles.dropLogout}`} onClick={handleLogout}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
