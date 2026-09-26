import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import FilterBar from "../components/FilterBar";

const API = import.meta.env.VITE_API_URL;

function ProductsPage({ addToCart, openProduct, toggleWishlist, isInWishlist }) {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search state — URL se initial value
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  // URL param change hone pe search update karo
  useEffect(() => {
    const searchFromUrl = searchParams.get("search") || "";
    setSearch(searchFromUrl);
  }, [searchParams]);

  // Products fetch
  useEffect(() => {
    axios
      .get(`${API}/products`)
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Filter + Sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    const min = parseFloat(priceRange.min) || 0;
    const max = parseFloat(priceRange.max) || Infinity;
    result = result.filter((p) => p.price >= min && p.price <= max);

    switch (sort) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-az":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [products, search, category, sort, priceRange]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setSort("newest");
    setPriceRange({ min: "", max: "" });
  };

  return (
    <section className="products-page">
      <div className="section-head">
        <p className="eyebrow">— ALL PRODUCTS</p>
        <h2>
          Our <span className="gradient-text">Collection</span>
        </h2>
        <p className="section-text">
          Discover our complete range of premium products.
        </p>
      </div>

      <FilterBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        sort={sort}
        setSort={setSort}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        onClear={clearFilters}
        totalCount={products.length}
        filteredCount={filteredProducts.length}
      />

      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <h3>Loading products...</h3>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Koi product nahi mila</h3>
          <p>Filters change karke try karo ya clear karo.</p>
          <button className="clear-btn-lg" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="product-container">
          {filteredProducts.map((product) => (
            <div
              className="product-card"
              key={product._id}
              onClick={() => openProduct(product)}
            >
              <div className="product-img">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                  />
                ) : (
                  <span>{product.icon}</span>
                )}
                <span className="product-category">{product.category}</span>

                <button
                  className={`wishlist-btn ${
                    isInWishlist(product._id) ? "active" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product);
                  }}
                  aria-label="Add to wishlist"
                >
                  {isInWishlist(product._id) ? "❤️" : "🤍"}
                </button>
              </div>

              <h3>{product.name}</h3>
              <p className="product-desc">{product.description}</p>

              <div className="price">
                <strong>Rs. {product.price.toLocaleString()}</strong>
                <del>Rs. {product.oldPrice.toLocaleString()}</del>
              </div>

              <button
                className="add-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                }}
              >
                Add to Cart <span>🛒</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductsPage;