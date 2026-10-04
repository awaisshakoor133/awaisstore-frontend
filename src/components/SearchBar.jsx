import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SearchIcon, CloseIcon } from "./StoreIcons";
import { useProducts } from "../context/ProductsContext";

const RECENT_KEY = "awais-recent-searches";
const MAX_RECENT = 5;

function SearchBar({ placeholder = "Search products..." }) {
  const navigate = useNavigate();
  const { products } = useProducts();

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState([]);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) setRecent(JSON.parse(saved));
    } catch {}
  }, []);

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKey = (e) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes(e.target.tagName) &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
        setFocused(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filter suggestions
  const suggestions = query.trim()
    ? products
        .filter(
          (p) =>
            p.name?.toLowerCase().includes(query.toLowerCase()) ||
            p.category?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
    : [];

  // Save to recent searches
  const saveRecent = (term) => {
    if (!term.trim()) return;
    const updated = [
      term,
      ...recent.filter((r) => r.toLowerCase() !== term.toLowerCase()),
    ].slice(0, MAX_RECENT);
    setRecent(updated);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    saveRecent(query.trim());
    navigate(`/products?search=${encodeURIComponent(query)}`);
    setFocused(false);
    inputRef.current?.blur();
  };

  const handleSuggestionClick = (productName) => {
    saveRecent(productName);
    setQuery(productName);
    navigate(`/products?search=${encodeURIComponent(productName)}`);
    setFocused(false);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const clearRecent = () => {
    setRecent([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {}
  };

  return (
    <div className="search-bar-wrapper" ref={wrapperRef}>
      <form className="search-bar" onSubmit={handleSubmit}>
        <span className="search-bar-icon">
          <SearchIcon size={18} />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="search-bar-clear"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <CloseIcon size={14} />
          </button>
        )}
        {!query && !focused && (
          <span className="search-bar-shortcut">/</span>
        )}
      </form>

      {/* Dropdown */}
      {focused && (
        <div className="search-dropdown">
          {suggestions.length > 0 ? (
            <>
              <p className="search-dropdown-label">Products</p>
              {suggestions.map((p) => (
                <button
                  type="button"
                  key={p._id}
                  className="search-suggestion"
                  onClick={() => handleSuggestionClick(p.name)}
                >
                  <span className="suggestion-img">
                    {p.image ? (
                      <img src={p.image} alt={p.name} />
                    ) : (
                      <span>{p.icon}</span>
                    )}
                  </span>
                  <span className="suggestion-info">
                    <strong>{p.name}</strong>
                    <span>Rs. {p.price?.toLocaleString()}</span>
                  </span>
                </button>
              ))}
            </>
          ) : query.trim() ? (
            <div className="search-no-result">
              <SearchIcon size={24} />
              <p>No products found for "{query}"</p>
            </div>
          ) : recent.length > 0 ? (
            <>
              <div className="search-dropdown-header">
                <p className="search-dropdown-label">Recent Searches</p>
                <button
                  type="button"
                  className="clear-recent-btn"
                  onClick={clearRecent}
                >
                  Clear
                </button>
              </div>
              {recent.map((term) => (
                <button
                  type="button"
                  key={term}
                  className="search-suggestion search-recent-item"
                  onClick={() => handleSuggestionClick(term)}
                >
                  <SearchIcon size={14} />
                  <span>{term}</span>
                </button>
              ))}
            </>
          ) : (
            <div className="search-hint">
              <p>Start typing to search products...</p>
              <span className="search-hint-shortcut">
                Pro tip: Press <kbd>/</kbd> to focus search
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;