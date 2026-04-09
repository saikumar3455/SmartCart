import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import { useCart } from "../context/CartContext";
import { useApp } from "../context/AppContext";
import { fmt, getProductKey } from "../utils/helpers";
import styles from "./BundleBuilder.module.css";

const BUNDLE_SLOTS = [
  { id: "hero", title: "Hero Piece", sub: "Start with the standout item in your look." },
  { id: "layer", title: "Layer", sub: "Add a complementary second piece." },
  { id: "accent", title: "Accent", sub: "Bring balance with a contrasting item." },
  { id: "finish", title: "Finish", sub: "Complete the outfit with a final touch." },
];

export default function BundleBuilder() {
  const { addItemsToCart } = useCart();
  const { navigate, setSelectedProduct, toast } = useApp();
  const [products, setProducts] = useState([]);
  const [activeSlot, setActiveSlot] = useState("hero");
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://smartcart-api-2ogq.onrender.com/api/products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log("bundle builder fetch error", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const selectedItems = useMemo(
    () => BUNDLE_SLOTS.map((slot) => selected[slot.id]).filter(Boolean),
    [selected]
  );

  const selectedKeys = new Set(selectedItems.map((item) => getProductKey(item)));

  const recommendations = useMemo(() => {
    const hero = selected.hero;
    const preferredCategory = hero?.category || "all";

    return products
      .filter((item) => !selectedKeys.has(getProductKey(item)))
      .filter((item) => preferredCategory === "all" || item.category === preferredCategory || item.category === "accessories" || item.category === "food")
      .slice(0, 12);
  }, [products, selected, selectedKeys]);

  const bundleTotal = selectedItems.reduce((sum, item) => sum + Number(item.price || 0), 0);

  const addBundleToCart = () => {
    if (!selectedItems.length) {
      toast("Pick a few pieces to build your outfit first", "info");
      return;
    }

    addItemsToCart(selectedItems.map((item) => ({ ...item, quantity: 1 })));
    toast("Full outfit added to cart", "success");
    navigate("cart");
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Style Lab</p>
            <h1 className={styles.title}>Build Your Own Outfit Bundle</h1>
            <p className={styles.sub}>
              Mix standout pieces, layers, and finishing touches into one coordinated look, then add the whole bundle in one tap.
            </p>
          </div>

          <div className={styles.bundleSummary}>
            <p className={styles.summaryLabel}>Bundle Total</p>
            <h2 className={styles.summaryTotal}>{fmt(bundleTotal)}</h2>
            <p className={styles.summaryMeta}>{selectedItems.length} of {BUNDLE_SLOTS.length} pieces selected</p>
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 16 }} onClick={addBundleToCart}>
              Add Full Look to Cart
            </button>
          </div>
        </section>

        <section className={styles.layout}>
          <div className={styles.builderPane}>
            <div className={styles.slotGrid}>
              {BUNDLE_SLOTS.map((slot) => {
                const item = selected[slot.id];
                const active = activeSlot === slot.id;

                return (
                  <button
                    key={slot.id}
                    className={`${styles.slotCard} ${active ? styles.slotActive : ""}`}
                    onClick={() => setActiveSlot(slot.id)}
                  >
                    <div className={styles.slotHead}>
                      <div>
                        <p className={styles.slotTitle}>{slot.title}</p>
                        <p className={styles.slotSub}>{slot.sub}</p>
                      </div>
                      {item && <span className="badge badge-success">Ready</span>}
                    </div>

                    {item ? (
                      <div className={styles.slotItem}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className={styles.slotImage}
                          onError={(e) => {
                            e.target.src = `https://placehold.co/120x120/1e1e1e/666?text=${encodeURIComponent(item.name)}`;
                          }}
                        />
                        <div className={styles.slotInfo}>
                          <h3>{item.name}</h3>
                          <p>{item.category}</p>
                          <strong>{fmt(item.price)}</strong>
                        </div>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected((prev) => ({ ...prev, [slot.id]: null }));
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className={styles.slotEmpty}>Select a product for this slot</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <aside className={styles.catalogPane}>
            <div className={styles.catalogHead}>
              <div>
                <p className={styles.catalogEyebrow}>Pick for</p>
                <h2 className={styles.catalogTitle}>
                  {BUNDLE_SLOTS.find((slot) => slot.id === activeSlot)?.title}
                </h2>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate("home")}>
                Back to Shop
              </button>
            </div>

            {loading ? (
              <div className={styles.stateCard}>Loading your style options...</div>
            ) : recommendations.length === 0 ? (
              <div className={styles.stateCard}>No more matching pieces right now. Try clearing a slot or browsing the shop.</div>
            ) : (
              <div className={styles.catalogGrid}>
                {recommendations.map((item) => (
                  <div key={getProductKey(item)} className={styles.productCard}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className={styles.productImage}
                      onError={(e) => {
                        e.target.src = `https://placehold.co/300x220/1e1e1e/666?text=${encodeURIComponent(item.name)}`;
                      }}
                    />
                    <div className={styles.productBody}>
                      <p className={styles.productCategory}>{item.category}</p>
                      <h3 className={styles.productName}>{item.name}</h3>
                      <p className={styles.productPrice}>{fmt(item.price)}</p>
                    </div>
                    <div className={styles.productActions}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setSelectedProduct(item);
                          navigate(`product/${getProductKey(item)}`);
                        }}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setSelected((prev) => ({ ...prev, [activeSlot]: item }));
                          toast(`${item.name} added to ${BUNDLE_SLOTS.find((slot) => slot.id === activeSlot)?.title}`, "success");
                        }}
                      >
                        Use in Look
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </section>
      </div>
    </div>
  );
}
