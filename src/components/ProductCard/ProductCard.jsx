import { useCart } from "../../context/CartContext";
import { useApp } from "../../context/AppContext";
import { fmt, getProductKey, stars } from "../../utils/helpers";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const { addToCart, cart } = useCart();
  const { navigate, setSelectedProduct } = useApp();
  const productKey = getProductKey(product);
  const inCart = cart.find((i) => i.id === productKey);

  const handleView = () => {
    setSelectedProduct(product);
    navigate("product");
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageWrap} onClick={handleView}>
        <img
          src={product.image}
          alt={product.name}
          className={styles.image}
          onError={(e) => {
            e.target.src = `https://placehold.co/400x300/1e1e1e/666?text=${encodeURIComponent(product.name)}`;
          }}
        />
        <div className={styles.overlay}><span>View Details</span></div>
        {product.stock < 10 && product.stock > 0 && (
          <div className={`badge badge-accent ${styles.stockBadge}`}>Only {product.stock} left</div>
        )}
        {product.stock === 0 && (
          <div className={styles.soldOut}><span className="badge badge-dim">Out of Stock</span></div>
        )}
      </div>

      <div className={styles.info}>
        <span className={styles.category}>{product.category}</span>
        <h3 className={styles.name} onClick={handleView}>{product.name}</h3>
        {product.rating && (
          <div className={styles.rating}>
            {stars(product.rating)}
            <span className={styles.ratingCount}>({product.reviews})</span>
          </div>
        )}
        <div className={styles.footer}>
          <span className={styles.price}>{fmt(product.price)}</span>
          <button
            className={`btn btn-sm ${inCart ? "btn-success" : "btn-primary"}`}
            disabled={product.stock === 0}
            onClick={() => addToCart(product)}
          >
            {inCart ? `✓ In Cart (${inCart.qty})` : "+ Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
