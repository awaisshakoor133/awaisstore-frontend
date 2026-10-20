import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { SearchIcon, CloseIcon, ArrowRightIcon } from "./StoreIcons";
import { useProducts } from "../context/ProductsContext";

const RECENT_KEY = "awais-recent-searches";
const MAX_RECENT = 5;
const DEBOUNCE_MS = 300;
const MAX_SUGGESTIONS = 5;

// ============ HIGHLIGHT MATCHED TEXT ============
function highlightMatch(text, query) {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="search-highlight">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function SearchBar({ placeholder = "Search products..." }) {
  const navigate = useNavigate();
  const { products } = useProducts();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiIntent, setAiIntent] = useState("");

  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // ============ LOAD RECENT SEARCHES ============
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) setRecent(JSON.parse(saved));
    } catch {}
  }, []);

  // ============ AI SEARCH (when debouncedQuery changes) ============
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 3) {
      setAiResults([]);
      setAiIntent("");
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    const fetchAISearch = async () => {
      setAiLoading(true);
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/ai/search`,
          { query: debouncedQuery.trim() },
          { signal: controller.signal }
        );

        if (!cancelled) {
          setAiResults(res.data.products || []);
          setAiIntent(res.data.intent || "");
        }
      } catch (err) {
        if (!cancelled && err.name !== "CanceledError") {
          console.error("AI search failed:", err);
        }
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    };

    fetchAISearch();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debouncedQuery]);

  // ============ DEBOUNCE QUERY ============
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  // ============ KEYBOARD SHORTCUT "/" ============
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

  // ============ CLOSE DROPDOWN ON CLICK OUTSIDE ============
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ============ FILTER SUGGESTIONS (using debouncedQuery) ============
  const suggestions = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    const q = debouncedQuery.toLowerCase();

    return products
      .filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
      .slice(0, MAX_SUGGESTIONS);
  }, [products, debouncedQuery]);

  // ============ MATCHING CATEGORIES ============
  const matchingCategories = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    const q = debouncedQuery.toLowerCase();
    const categories = [
      ...new Set(products.map((p) => p.category).filter(Boolean)),
    ];

    return categories
      .filter((cat) => cat.toLowerCase().includes(q))
      .slice(0, 3);
  }, [products, debouncedQuery]);

  // ============ SAVE RECENT SEARCH ============
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

  // ============ SUBMIT SEARCH ============
  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    saveRecent(query.trim());
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    setFocused(false);
    inputRef.current?.blur();
  };

  // ============ CLICK SUGGESTION ============
  const handleSuggestionClick = (productName) => {
    saveRecent(productName);
    setQuery(productName);
    navigate(`/products?search=${encodeURIComponent(productName)}`);
    setFocused(false);
    inputRef.current?.blur();
  };

  // ============ CLICK CATEGORY ============
  const handleCategoryClick = (category) => {
    saveRecent(category);
    setQuery(category);
    navigate(`/products?search=${encodeURIComponent(category)}`);
    setFocused(false);
    inputRef.current?.blur();
  };

  // ============ CLEAR ============
  const clearSearch = () => {
    setQuery("");
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const clearRecent = () => {
    setRecent([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {}
  };

  // ============ KEYBOARD NAVIGATION ============
  const allItems = useMemo(() => {
    const items = [];

    suggestions.forEach((p) => {
      items.push({ type: "product", data: p });
    });

    matchingCategories.forEach((cat) => {
      items.push({ type: "category", data: cat });
    });

    return items;
  }, [suggestions, matchingCategories]);

  const handleKeyDown = (e) => {
    if (!focused) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (allItems.length === 0) return;
      setSelectedIndex((prev) => (prev + 1) % allItems.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (allItems.length === 0) return;
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
    }

    if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const selected = allItems[selectedIndex];
      if (selected?.type === "product") {
        handleSuggestionClick(selected.data.name);
      } else if (selected?.type === "category") {
        handleCategoryClick(selected.data);
      }
    }

    if (e.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  // ============ RESET SELECTED ON QUERY CHANGE ============
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

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
          onKeyDown={handleKeyDown}
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

      {/* ============ DROPDOWN ============ */}
      {focused && (
        <div className="search-dropdown">
          {aiLoading ? (
            // ✅ AI LOADING STATE
            <div className="search-ai-loading">
              <div className="ai-spinner" />
              <div>
                <p><strong>✨ AI is searching...</strong></p>
                <span>Understanding your query</span>
              </div>
            </div>
          ) : aiResults.length > 0 ? (
            // ✅ AI RESULTS
            <>
              <div className="search-ai-header">
                <span className="search-ai-badge">✨ AI-Powered</span>
                <span className="search-ai-intent">{aiIntent}</span>
              </div>
              {aiResults.slice(0, MAX_SUGGESTIONS).map((p) => (
                <button
                  type="button"
                  key={p._id}
                  className="search-suggestion search-ai-result"
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
                  <ArrowRightIcon size={14} />
                </button>
              ))}
              {query.trim() && (
                <button
                  type="button"
                  className="search-view-all"
                  onClick={handleSubmit}
                >
                  <SearchIcon size={14} />
                  <span>
                    View all results for "<strong>{query}</strong>"
                  </span>
                  <ArrowRightIcon size={14} />
                </button>
              )}
            </>
          ) : suggestions.length > 0 || matchingCategories.length > 0 ? (
            // ❌ Text search fallback (only if AI returned nothing)
            <>
              {matchingCategories.length > 0 && (
                <>
                  <p className="search-dropdown-label">Categories</p>
                  <div className="search-categories">
                    {matchingCategories.map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        className="search-category-chip"
                        onClick={() => handleCategoryClick(cat)}
                      >
                        {highlightMatch(cat, debouncedQuery)}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {suggestions.length > 0 && (
                <>
                  <p className="search-dropdown-label">Products</p>
                  {suggestions.map((p, index) => (
                    <button
                      type="button"
                      key={p._id}
                      className={`search-suggestion ${
                        selectedIndex === index ? "active" : ""
                      }`}
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
                        <strong>{highlightMatch(p.name, debouncedQuery)}</strong>
                        <span>Rs. {p.price?.toLocaleString()}</span>
                      </span>
                      <ArrowRightIcon size={14} />
                    </button>
                  ))}
                </>
              )}

              {query.trim() && (
                <button
                  type="button"
                  className="search-view-all"
                  onClick={handleSubmit}
                >
                  <SearchIcon size={14} />
                  <span>
                    View all results for "<strong>{query}</strong>"
                  </span>
                  <ArrowRightIcon size={14} />
                </button>
              )}
            </>
          ) : query.trim() ? (
            <div className="search-no-result">
              <SearchIcon size={24} />
              <p>No products found for "{query}"</p>
              <span className="search-no-result-hint">
                Try different keywords or browse categories
              </span>
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