import { useApp } from "../context/AppContext";
import styles from "./Welcome.module.css";

export default function Welcome() {
  const { navigate } = useApp();

  return (
    <div className={styles.page}>
      <div className={styles.gridBg} />
      <div className={styles.glow} />

      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>S</div>
          <span className={styles.logoText}>Smart<em>Cart</em></span>
        </div>
        <div className={styles.headerActions}>
          <button className="btn btn-outline" onClick={() => navigate("login")}>Sign In</button>
          <button className="btn btn-primary" onClick={() => navigate("signup")}>Get Started →</button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={`badge badge-accent ${styles.heroBadge}`}>🛍️ The Modern Shopping Experience</div>
          <h1 className={styles.title}>
            Shop Smarter,<br />
            <span>Live Better.</span>
          </h1>
          <p className={styles.subtitle}>
            Discover curated fashion, accessories and lifestyle products.
            Fast delivery, easy returns, unbeatable prices.
          </p>
          <div className={styles.cta}>
            <button className="btn btn-primary" style={{ padding: "14px 36px", fontSize: "1rem" }} onClick={() => navigate("signup")}>
              Start Shopping →
            </button>
            <button className="btn btn-outline" style={{ padding: "14px 36px", fontSize: "1rem" }} onClick={() => navigate("login")}>
              Sign In
            </button>
          </div>
          <div className={styles.stats}>
            {[["50K+", "Products"], ["200K+", "Customers"], ["4.9★", "Avg Rating"]].map(([n, l]) => (
              <div key={l} className={styles.stat}>
                <strong>{n}</strong>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.cards}>
          {[
            ["👔", "Men's Fashion",    "1,200+ items"],
            ["👗", "Women's Fashion",  "2,400+ items"],
            ["🧒", "Kids",             "800+ items"],
            ["👜", "Accessories",      "600+ items"],
          ].map(([icon, label, count]) => (
            <div key={label} className={styles.card} onClick={() => navigate("signup")}>
              <div className={styles.cardIcon}>{icon}</div>
              <div>
                <p className={styles.cardLabel}>{label}</p>
                <p className={styles.cardCount}>{count}</p>
              </div>
              <span className={styles.cardArrow}>→</span>
            </div>
          ))}
        </div>
      </main>

      <footer className={styles.footer}>© 2025 SmartCart · Built for modern shoppers</footer>
    </div>
  );
}