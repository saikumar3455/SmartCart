import Navbar from "../components/Navbar/Navbar";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useApp } from "../context/AppContext";
import { fmt } from "../utils/helpers";
import styles from "./Wishlist.module.css";

export default function Wishlist() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { navigate, setSelectedProduct, toast } = useApp();

  if (!wishlist.length) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>♡</div>
          <h2>Your wishlist is empty</h2>
          <p>Save products you like and come back to them anytime.</p>
          <button className="btn btn-primary" onClick={() => navigate("home")}>
            Explore Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Wishlist ({wishlist.length})</h1>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              clearWishlist();
              toast("Wishlist cleared", "success");
            }}
          >
            Clear All
          </button>
        </div>

        <div className={styles.list}>
          {wishlist.map((item) => (
            <div key={item.id} className={styles.card}>
              <img
                src={item.image}
                alt={item.name}
                className={styles.image}
                onError={(e) => {
                  e.target.src = `https://placehold.co/300x300/1e1e1e/666?text=${encodeURIComponent(item.name)}`;
                }}
              />

              <div className={styles.content}>
                <span className={styles.category}>{item.category}</span>
                <h2 className={styles.name}>{item.name}</h2>
                <p className={styles.price}>{fmt(item.price)}</p>
                <p className={styles.stock}>
                  {item.stock > 0 ? `In stock (${item.stock})` : "Out of stock"}
                </p>
              </div>

              <div className={styles.actions}>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setSelectedProduct(item);
                    navigate(`product/${item.id}`);
                  }}
                >
                  View
                </button>
                <button
                  className="btn btn-primary"
                  disabled={item.stock === 0}
                  onClick={() => {
                    addToCart(item);
                    toast(`${item.name} added to cart`, "success");
                  }}
                >
                  Add to Cart
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    removeFromWishlist(item.id);
                    toast("Removed from wishlist", "success");
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
