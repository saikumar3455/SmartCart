import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import ProductCard from "../components/ProductCard/ProductCard";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useApp } from "../context/AppContext";
import { fmt, getProductKey, stars } from "../utils/helpers";
import styles from "./ProductDetails.module.css";

export default function ProductDetails() {
  const { page, selectedProduct, setSelectedProduct, navigate, toast } = useApp();
  const { addToCart, cart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState(selectedProduct);
  const [loading, setLoading] = useState(!selectedProduct);
  const [error, setError] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const productId = page.startsWith("product/") ? page.replace("product/", "") : "";

  useEffect(() => {
    if (selectedProduct && getProductKey(selectedProduct) === productId) {
      setProduct(selectedProduct);
      setLoading(false);
      setError("");
      return;
    }

    if (!productId) {
      setError("Product not found.");
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://smartcart-api-2ogq.onrender.com/api/products/${productId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Product not found");
        }

        setProduct(data);
        setSelectedProduct(data);
        setError("");
      } catch (err) {
        setError(err.message || "Product not found");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [page, productId, selectedProduct, setSelectedProduct]);

  useEffect(() => {
    if (!product) return;

    const loadRelatedProducts = async () => {
      try {
        const res = await fetch("https://smartcart-api-2ogq.onrender.com/api/products");
        const data = await res.json();
        const currentKey = getProductKey(product);

        if (!Array.isArray(data)) {
          setRelatedProducts([]);
          return;
        }

        const related = data
          .filter((item) => getProductKey(item) !== currentKey)
          .filter((item) => item.category === product.category)
          .slice(0, 4);

        setRelatedProducts(related);
      } catch (err) {
        console.log("related product fetch error", err);
        setRelatedProducts([]);
      }
    };

    loadRelatedProducts();
  }, [product]);

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.container}>
          <button className="btn btn-ghost" onClick={() => navigate("home")}>← Back to Shop</button>
          <div style={{ padding: "48px 0" }}>Loading product...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.container}>
          <button className="btn btn-ghost" onClick={() => navigate("home")}>← Back to Shop</button>
          <div style={{ padding: "48px 0" }}>
            <h2 style={{ marginBottom: 8 }}>Product unavailable</h2>
            <p style={{ marginBottom: 16 }}>{error || "We couldn't load this product."}</p>
            <button className="btn btn-primary" onClick={() => navigate("home")}>Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  const productKey = getProductKey(product);
  const inCart  = cart.find((i) => i.id === productKey);
  const wished = isWishlisted(product);
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
              <button
                className="btn btn-outline"
                style={{ padding: 14 }}
                onClick={() => {
                  toggleWishlist(product);
                  toast(wished ? "Removed from wishlist" : "Saved to wishlist", "success");
                }}
              >
                {wished ? "♥ Saved" : "♡ Save"}
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

        {relatedProducts.length > 0 && (
          <section className={styles.relatedSection}>
            <div className={styles.relatedHeader}>
              <div>
                <p className={styles.relatedEyebrow}>You May Also Like</p>
                <h2 className={styles.relatedTitle}>Related Products</h2>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate("home")}>
                Browse More
              </button>
            </div>

            <div className={styles.relatedGrid}>
              {relatedProducts.map((item) => (
                <ProductCard key={getProductKey(item)} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
