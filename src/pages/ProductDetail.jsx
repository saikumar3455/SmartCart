import { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import { useCart } from "../context/CartContext";
import { useApp } from "../context/AppContext";
import { fmt, stars } from "../utils/helpers";
import styles from "./ProductDetails.module.css";

export default function ProductDetails() {
  const { selectedProduct: product, navigate, toast } = useApp();
  const { addToCart, cart } = useCart();
  const [qty, setQty] = useState(1);

  if (!product) { navigate("home"); return null; }

  const inCart  = cart.find((i) => i.id === product.id);
  const orig    = Math.round(product.price * 1.25);
  const disc    = Math.round((1 - product.price / orig) * 100);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    toast(`Added ${qty}× ${product.name} 🛒`, "success");
  };

  const perks = [
    "🚚 Free delivery on orders above ₹999",
    "🔄 Easy 30-day returns",
    "🔒 100% Secure payments",
    "✅ Genuine product guarantee",
  ];

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <button className="btn btn-ghost" onClick={() => navigate("home")}>← Back to Shop</button>

        <div className={styles.content}>
          {/* Image */}
          <div className={styles.imageSection}>
            <div className="badge badge-accent" style={{ position: "absolute", top: 16, left: 16, zIndex: 1 }}>
              {disc}% OFF
            </div>
            <img
              src={product.image}
              alt={product.name}
              className={styles.image}
              onError={(e) => { e.target.src = `https://placehold.co/600x600/1e1e1e/666?text=${encodeURIComponent(product.name)}`; }}
            />
          </div>

          {/* Info */}
          <div className={styles.info}>
            <span className={styles.category}>{product.category}</span>
            <h1 className={styles.name}>{product.name}</h1>

            {product.rating && (
              <div className={styles.rating}>
                {stars(product.rating)}
                <span className={styles.ratingText}>{product.rating} · {product.reviews} reviews</span>
              </div>
            )}

            <div className={styles.priceRow}>
              <span className={styles.price}>{fmt(product.price)}</span>
              <span className={styles.originalPrice}>{fmt(orig)}</span>
              <span className="badge badge-success">{disc}% off</span>
            </div>

            <p className={styles.description}>
              {product.description || "High-quality product with great features. Perfect for everyday use."}
            </p>

            <div className={styles.stockRow}>
              {product.stock > 0
                ? <span className="badge badge-success">✓ In Stock ({product.stock} units)</span>
                : <span className="badge badge-dim">Out of Stock</span>
              }
            </div>

            {/* Quantity */}
            <div className={styles.qtyRow}>
              <span className={styles.qtyLabel}>Qty</span>
              <div className={styles.qtyControl}>
                {[["−", () => setQty(Math.max(1, qty - 1))], [qty, null], ["+", () => setQty(Math.min(product.stock || 10, qty + 1))]].map(([v, fn], i) => (
                  <button
                    key={i}
                    onClick={fn || undefined}
                    className={styles.qtyBtn}
                    style={{ fontWeight: i === 1 ? 700 : 400, borderLeft: i > 0 ? "1px solid var(--border)" : "none" }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.actions}>
              <button className="btn btn-primary" style={{ flex: 1, padding: 14 }} disabled={product.stock === 0} onClick={handleAdd}>
                {inCart ? `In Cart (${inCart.qty}) · Add More` : "Add to Cart 🛒"}
              </button>
              <button className="btn btn-dark" style={{ flex: 1, padding: 14 }} disabled={product.stock === 0}
                onClick={() => { handleAdd(); navigate("cart"); }}>
                Buy Now →
              </button>
            </div>

            <div className={styles.perks}>
              {perks.map((p) => <div key={p} className={styles.perk}>{p}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}