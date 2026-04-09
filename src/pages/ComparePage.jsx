import Navbar from "../components/Navbar/Navbar";
import { useCompare } from "../context/CompareContext";
import { useCart } from "../context/CartContext";
import { useApp } from "../context/AppContext";
import { fmt, getProductKey } from "../utils/helpers";
import styles from "./ComparePage.module.css";

export default function ComparePage() {
  const { compareItems, removeCompareItem, clearCompare } = useCompare();
  const { addItemsToCart } = useCart();
  const { navigate, toast } = useApp();

  const handleAddAll = () => {
    addItemsToCart(compareItems);
    toast("Compared items added to cart", "success");
    navigate("cart");
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Decision helper</p>
            <h1 className={styles.title}>Compare Products</h1>
          </div>
          <div className={styles.headerActions}>
            {compareItems.length > 0 && (
              <button className="btn btn-outline" onClick={clearCompare}>
                Clear
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => navigate("home")}>
              ← Back to Shop
            </button>
          </div>
        </div>

        {compareItems.length === 0 ? (
          <div className={styles.empty}>
            <h2>No products in compare</h2>
            <p>Add up to 4 products from the catalog to compare price, stock, and ratings side by side.</p>
            <button className="btn btn-primary" onClick={() => navigate("home")}>
              Start Comparing
            </button>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {compareItems.map((item) => (
                <article key={getProductKey(item)} className={styles.card}>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeCompareItem(getProductKey(item))}
                  >
                    Remove
                  </button>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.image}
                    onError={(e) => {
                      e.target.src = `https://placehold.co/600x600/1e1e1e/666?text=${encodeURIComponent(item.name)}`;
                    }}
                  />
                  <p className={styles.category}>{item.category}</p>
                  <h2 className={styles.name}>{item.name}</h2>
                  <div className={styles.metricList}>
                    <div className={styles.metric}><span>Price</span><strong>{fmt(item.price)}</strong></div>
                    <div className={styles.metric}><span>Rating</span><strong>{item.rating || 0}/5</strong></div>
                    <div className={styles.metric}><span>Reviews</span><strong>{item.reviews || 0}</strong></div>
                    <div className={styles.metric}><span>Stock</span><strong>{item.stock || 0} left</strong></div>
                  </div>
                  <button className="btn btn-primary" onClick={() => navigate(`product/${getProductKey(item)}`)}>
                    View Product
                  </button>
                </article>
              ))}
            </div>

            <div className={styles.summary}>
              <div>
                <p className={styles.summaryTitle}>Quick takeaway</p>
                <p className={styles.summaryText}>
                  Compare value, stock, and ratings before checkout. Products with stronger ratings and lower stock are the best candidates to buy first.
                </p>
              </div>
              <button className="btn btn-dark" onClick={handleAddAll}>
                Add Compared Items to Cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
