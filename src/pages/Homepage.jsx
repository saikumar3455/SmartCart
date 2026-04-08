import { useState, useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import ProductCard from "../components/ProductCard/ProductCard";
import { useApp } from "../context/AppContext";
import styles from "./Homepage.module.css";

const CATEGORIES = ["all", "mens", "womens", "kids", "accessories"];

const SORT_OPTIONS = [
  { value: "default", label: "Featured" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
];

export default function Homepage() {
  const { navigate } = useApp();

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // fetch DB products
        const dbRes = await fetch(
          "https://smartcart-api-2ogq.onrender.com/api/products"
        );
        const dbProducts = await dbRes.json();

        // fetch 200 products from external API
        const apiRes = await fetch(
          "https://dummyjson.com/products?limit=200"
        );
        const apiData = await apiRes.json();

        const mapped = apiData.products.map((p) => {
          let mappedCategory = "accessories";
          const cat = p.category.toLowerCase();

          if (
            cat.includes("mens") ||
            cat.includes("shirts") ||
            cat.includes("shoes") ||
            cat.includes("tops")
          ) {
            mappedCategory = "mens";
          } else if (
            cat.includes("womens") ||
            cat.includes("dress") ||
            cat.includes("beauty") ||
            cat.includes("skincare")
          ) {
            mappedCategory = "womens";
          } else if (
            cat.includes("kids") ||
            cat.includes("baby")
          ) {
            mappedCategory = "kids";
          }

          return {
            _id: `dummy-${p.id}`,
            name: p.title,
            price: Math.round(p.price * 83),
            category: mappedCategory,
            image: p.thumbnail,
            description: p.description,
            rating: p.rating,
            stock: p.stock,
          };
        });

        // show products instantly on homepage
        setProducts([...dbProducts, ...mapped]);

        // import into backend DB
        const importRes = await fetch(
          "https://smartcart-api-2ogq.onrender.com/api/products/import",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(mapped),
          }
        );

        const importData = await importRes.json();
        console.log("📦 IMPORT RESPONSE:", importData);
      } catch (err) {
        console.log("product fetch error", err);
      }
    };

    fetchProducts();
  }, []);

  // navbar search listener
  useEffect(() => {
    const interval = setInterval(() => {
      const s = window.__sc_search ?? "";
      if (s !== search) setSearch(s);
    }, 80);

    return () => clearInterval(interval);
  }, [search]);

  const filtered = products
    .filter((p) => {
      const matchesSearch =
        (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "all" || p.category === category;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) =>
      sort === "price-asc"
        ? a.price - b.price
        : sort === "price-desc"
        ? b.price - a.price
        : sort === "rating"
        ? (b.rating || 0) - (a.rating || 0)
        : 0
    );

  return (
    <div className={styles.page}>
      <Navbar showSearch />

      {/* Hero */}
      <div className={styles.banner}>
        <div className={styles.bannerGlow} />
        <div className={styles.bannerContent}>
          <div
            className="badge badge-accent"
            style={{ marginBottom: 12 }}
          >
            🔥 New Arrivals · Free delivery above ₹999
          </div>
          <h2 className={styles.bannerTitle}>
            Discover Your <span>Style</span>
          </h2>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterBar}>
        <div className={styles.filterInner}>
          <div className={styles.cats}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`${styles.catBtn} ${
                  category === c ? styles.catActive : ""
                }`}
                onClick={() => setCategory(c)}
              >
                {c === "all"
                  ? "All"
                  : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>

          <div className={styles.sortWrap}>
            <span className={styles.sortLabel}>Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={styles.sortSelect}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products */}
      <main className={styles.main}>
        <p className={styles.count}>
          {filtered.length} product
          {filtered.length !== 1 ? "s" : ""} found
        </p>

        {filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.map((p, i) => (
              <div
                key={p._id || p.id}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filter</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setCategory("all");
                window.__sc_search = "";
                setSearch("");
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}