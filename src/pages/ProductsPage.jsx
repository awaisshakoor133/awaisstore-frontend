import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import FilterBar from "../components/FilterBar";
import {
  CartIcon,
  HeartIcon,        // ← FIX: HeartFilledIcon ki jagah HeartIcon
} from "../components/StoreIcons";

const API = import.meta.env.VITE_API_URL;

function ProductsPage({ addToCart, openProduct, toggleWishlist, isInWishlist }) {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  useEffect(() => {
    const searchFromUrl = searchParams.get("search") || "";
    setSearch(searchFromUrl);
  }, [searchParams]);

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
          <div className="empty-icon-svg">
            <svg viewBox="0 0 120 120" fill="none">
              <defs>
                <linearGradient id="loadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e1b4b" />
                  <stop offset="100%" stopColor="#312e81" />
                </linearGradient>
                <linearGradient id="goldLoad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c8a04b" />
                  <stop offset="100%" stopColor="#e0bb6a" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="52" fill="url(#loadGrad)" opacity="0.08" />
              <circle cx="60" cy="60" r="52" stroke="url(#goldLoad)" strokeWidth="1.5" strokeDasharray="4 6" fill="none" />
              <circle
                cx="60"
                cy="60"
                r="20"
                stroke="url(#goldLoad)"
                strokeWidth="3"
                fill="none"
                strokeDasharray="30 90"
                strokeLinecap="round"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 60 60"
                  to="360 60 60"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>
          <h3>Loading products...</h3>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-svg">
            <svg viewBox="0 0 120 120" fill="none">
              <defs>
                <linearGradient id="searchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e1b4b" />
                  <stop offset="100%" stopColor="#312e81" />
                </linearGradient>
                <linearGradient id="goldSearch" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c8a04b" />
                  <stop offset="100%" stopColor="#e0bb6a" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="52" fill="url(#searchGrad)" opacity="0.08" />
              <circle cx="60" cy="60" r="52" stroke="url(#goldSearch)" strokeWidth="1.5" strokeDasharray="4 6" fill="none" />
              <circle cx="55" cy="55" r="18" stroke="url(#goldSearch)" strokeWidth="3" fill="none" />
              <line x1="68" y1="68" x2="80" y2="80" stroke="url(#goldSearch)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h3>	No products found</h3>
          <p>	Try changing your filters or clear all.</p>
          <button className="clear-btn-lg" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="product-container">
          {filteredProducts.map((product) => (
            <Link
  to={`/products/${product._id}`}
  className="product-card"
  key={product._id}
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
                  <HeartIcon
                    size={18}
                    filled={isInWishlist(product._id)}
                  />
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
                <CartIcon size={16} />
                <span>Add to Cart</span>
              </button>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductsPage;