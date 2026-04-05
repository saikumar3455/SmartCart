import { useState, useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import ProductCard from "../components/ProductCard/ProductCard";
import { useApp } from "../context/AppContext";

import styles from "./Homepage.module.css";

const CATEGORIES = ["all", "mens", "womens", "kids", "accessories"];
const SORT_OPTIONS = [
  { value: "default",    label: "Featured"         },
  { value: "price-asc",  label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating",     label: "Top Rated"         },
];

export default function Homepage() {
  const { navigate } = useApp();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");

  useEffect(() => {
  fetch("http://localhost:8000/api/products")
    .then((res) => res.json())
    .then((data) => setProducts(data))
    .catch((err) => console.error(err));
}, []);

  // also react to Navbar search (simple shared state via window)
  useEffect(() => {
    const interval = setInterval(() => {
      const s = window.__sc_search ?? "";
      if (s !== search) setSearch(s);
    }, 80);
    return () => clearInterval(interval);
  }, [search]);

  const filtered = products
    .filter((p) => {
      const ms =
  (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
  (p.category || "").toLowerCase().includes(search.toLowerCase());
      const mc = category === "all" || p.category === category;
      return ms && mc;
    })
    .sort((a, b) =>
      sort === "price-asc"  ? a.price - b.price :
      sort === "price-desc" ? b.price - a.price :
      sort === "rating"     ? (b.rating || 0) - (a.rating || 0) : 0
    );

  return (
    <div className={styles.page}>
      <Navbar showSearch />

      {/* Hero banner */}
      <div className={styles.banner}>
        <div className={styles.bannerGlow} />
        <div className={styles.bannerContent}>
          <div className="badge badge-accent" style={{ marginBottom: 12 }}>🔥 New Arrivals · Free delivery above ₹999</div>
          <h2 className={styles.bannerTitle}>Discover Your <span>Style</span></h2>
        </div>
      </div>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterInner}>
          <div className={styles.cats}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`${styles.catBtn} ${category === c ? styles.catActive : ""}`}
                onClick={() => setCategory(c)}
              >
                {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
          <div className={styles.sortWrap}>
            <span className={styles.sortLabel}>Sort:</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className={styles.sortSelect}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Products */}
      <main className={styles.main}>
        <p className={styles.count}>{filtered.length} product{filtered.length !== 1 ? "s" : ""} found</p>

        {filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.map((p, i) => (
              <div key={p.id} style={{ animationDelay: `${i * 0.04}s` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filter</p>
            <button className="btn btn-primary" onClick={() => { setCategory("all"); window.__sc_search = ""; setSearch(""); }}>
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}