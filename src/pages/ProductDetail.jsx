import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import ProductCard from "../components/ProductCard/ProductCard";
import { useCompare } from "../context/CompareContext";
import { useNotifications } from "../context/NotificationsContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { fmt, getProductKey, getRecentViews, getUrgencyMeta, saveRecentViews, stars } from "../utils/helpers";
import styles from "./ProductDetails.module.css";

export default function ProductDetails() {
  const { page, selectedProduct, setSelectedProduct, navigate, toast } = useApp();
  const { addToCart, cart } = useCart();
  const { compareCount, isCompared, toggleCompare } = useCompare();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { pushNotification } = useNotifications();
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState(selectedProduct);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(!selectedProduct);
  const [error, setError] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [preBookingDate, setPreBookingDate] = useState("");
  const [preBookingLoading, setPreBookingLoading] = useState(false);
  const [existingPreBooking, setExistingPreBooking] = useState(null);
  const productId = page.startsWith("product/") ? page.replace("product/", "") : "";
  const API = "https://smartcart-api-2ogq.onrender.com";

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

    const gallery = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

    setSelectedImage(gallery[0] || "");

    const userKey = user?.email || "guest";
    const currentKey = getProductKey(product);
    const nextRecent = [
      product,
      ...getRecentViews(userKey).filter((item) => getProductKey(item) !== currentKey),
    ].slice(0, 8);

    saveRecentViews(userKey, nextRecent);

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

  useEffect(() => {
    if (!user?.email || !product?._id) return;

    fetch(`${API}/api/prebookings?userEmail=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => {
        const activeBooking = Array.isArray(data)
          ? data.find(
              (item) =>
                String(item.productId) === String(product._id) &&
                (item.status === "active" || item.status === "partial")
            )
          : null;
        setExistingPreBooking(activeBooking || null);
      })
      .catch((err) => console.log("pre-booking status error", err));
  }, [user?.email, product?._id]);

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
  const compared = isCompared(product);
  const orig    = Math.round(product.price * 1.25);
  const disc    = Math.round((1 - product.price / orig) * 100);
  const urgency = getUrgencyMeta(product);
  const galleryImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : [];
  const advanceAmount = Math.round(Number(product.price || 0) * 0.1 * qty);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 7);
  const minDateValue = tomorrow.toISOString().split("T")[0];
  const maxDateValue = maxDate.toISOString().split("T")[0];

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    toast(`Added ${qty}× ${product.name} 🛒`, "success");
    pushNotification({
      title: "Cart updated",
      message: `${product.name} was added to your cart.`,
      type: "success",
      link: "cart",
    });
  };

  const perks = [
    "🚚 Free delivery on orders above ₹999",
    "🔄 Easy 30-day returns",
    "🔒 100% Secure payments",
    "✅ Genuine product guarantee",
  ];

  const handlePreBook = async () => {
    if (!preBookingDate) {
      toast("Choose a valid expiry date for pre-booking", "error");
      return;
    }

    try {
      setPreBookingLoading(true);
      const res = await fetch(`${API}/api/prebookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id,
          userEmail: user?.email,
          productId: product._id,
          quantity: qty,
          expiresAt: new Date(`${preBookingDate}T23:59:59`).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Pre-booking failed");

      setExistingPreBooking(data.booking);
      setProduct((prev) => (prev ? { ...prev, stock: prev.stock - qty } : prev));
      pushNotification({
        title: "Pre-booking confirmed",
        message: `${product.name} is reserved for you until ${new Date(data.booking.expiresAt).toLocaleDateString()}.`,
        type: "success",
        link: "profile",
      });
      toast(`Pre-booked with ${fmt(data.booking.advanceAmount)} advance`, "success");
    } catch (error) {
      console.log(error);
      toast(error.message || "Failed to pre-book product", "error");
    } finally {
      setPreBookingLoading(false);
    }
  };

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
              src={selectedImage || product.image}
              alt={product.name}
              className={styles.image}
              onError={(e) => { e.target.src = `https://placehold.co/600x600/1e1e1e/666?text=${encodeURIComponent(product.name)}`; }}
            />
            {galleryImages.length > 1 && (
              <div className={styles.galleryStrip}>
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    className={`${styles.galleryThumb} ${selectedImage === image ? styles.galleryThumbActive : ""}`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className={styles.galleryThumbImage}
                    />
                  </button>
                ))}
              </div>
            )}
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

            <div className={`${styles.urgencyBanner} ${styles[`urgency${urgency.tone[0].toUpperCase()}${urgency.tone.slice(1)}`] || ""}`}>
              <strong>{urgency.badge}</strong>
              <span>{urgency.message}</span>
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
              <button
                className="btn btn-outline"
                style={{ padding: 14 }}
                onClick={() => {
                  if (!compared && compareCount >= 4) {
                    toast("You can compare up to 4 products at a time", "error");
                    return;
                  }

                  toggleCompare(product);
                  pushNotification({
                    title: compared ? "Compare updated" : "Added to compare",
                    message: compared
                      ? `${product.name} was removed from compare.`
                      : `${product.name} is ready in your compare list.`,
                    type: "info",
                    link: "compare",
                  });
                  toast(compared ? "Removed from compare" : "Added to compare", "success");
                }}
              >
                {compared ? "✓ Compared" : "⇄ Compare"}
              </button>
              <button className="btn btn-dark" style={{ flex: 1, padding: 14 }} disabled={product.stock === 0}
                onClick={() => { handleAdd(); navigate("cart"); }}>
                Buy Now →
              </button>
            </div>

            <div className={styles.preBookCard}>
              <div className={styles.preBookHeader}>
                <div>
                  <p className={styles.preBookEyebrow}>Reserve this product</p>
                  <h3 className={styles.preBookTitle}>Pre-book for 10% advance</h3>
                </div>
                <span className="badge badge-accent">{fmt(advanceAmount)}</span>
              </div>
              {existingPreBooking ? (
                <div className={styles.preBookStatus}>
                  <p>
                    Reserved until <strong>{new Date(existingPreBooking.expiresAt).toLocaleDateString()}</strong>
                  </p>
                  <p>
                    Advance paid: <strong>{fmt(existingPreBooking.advanceAmount)}</strong>
                  </p>
                  <p>
                    Buy before expiry to get this amount adjusted in your final order.
                  </p>
                </div>
              ) : (
                <>
                  <p className={styles.preBookCopy}>
                    Reserve your selected quantity for up to 7 days. If you complete the purchase before expiry, the advance is adjusted in checkout. If you do not, the reservation expires and the advance is forfeited.
                  </p>
                  <div className={styles.preBookForm}>
                    <input
                      type="date"
                      value={preBookingDate}
                      min={minDateValue}
                      max={maxDateValue}
                      onChange={(e) => setPreBookingDate(e.target.value)}
                      className={styles.preBookDate}
                    />
                    <button
                      className="btn btn-outline"
                      disabled={product.stock === 0 || preBookingLoading}
                      onClick={handlePreBook}
                    >
                      {preBookingLoading ? "Reserving..." : "Pre-Book Now"}
                    </button>
                  </div>
                </>
              )}
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
