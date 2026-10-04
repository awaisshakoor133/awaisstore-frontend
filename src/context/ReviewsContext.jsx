import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL;
const ReviewsContext = createContext();

// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

const EMPTY_STATS = {
  total: 0,
  avgRating: 0,
  breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
};

export function ReviewsProvider({ children }) {
  // Cache: { [productId]: { reviews, stats, fetchedAt } }
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState({});

  // ============ FETCH REVIEWS (with cache) ============
  const fetchReviews = useCallback(
    async (productId, force = false) => {
      const cached = cache[productId];

      // Return cached if fresh
      if (!force && cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
        return cached;
      }

      setLoading((l) => ({ ...l, [productId]: true }));

      try {
        const res = await axios.get(`${API}/reviews/product/${productId}`);
        const data = {
          reviews: res.data.reviews || [],
          stats: res.data.stats || EMPTY_STATS,
          fetchedAt: Date.now(),
        };
        setCache((c) => ({ ...c, [productId]: data }));
        return data;
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        return {
          reviews: [],
          stats: EMPTY_STATS,
        };
      } finally {
        setLoading((l) => ({ ...l, [productId]: false }));
      }
    },
    [cache]
  );

  // ============ ADD REVIEW (updates cache) ============
  const addReview = useCallback((productId, newReview) => {
    setCache((c) => {
      const existing = c[productId];
      if (!existing) return c;

      return {
        ...c,
        [productId]: {
          ...existing,
          reviews: [newReview, ...existing.reviews],
          fetchedAt: Date.now(),
        },
      };
    });
  }, []);

  // ============ INVALIDATE ONE PRODUCT ============
  const invalidateProduct = useCallback((productId) => {
    setCache((c) => {
      const { [productId]: removed, ...rest } = c;
      return rest;
    });
  }, []);

  // ============ CLEAR ALL CACHE ============
  const clearCache = useCallback(() => setCache({}), []);

  // ============ HELPERS ============
  const getCached = useCallback(
    (productId) => cache[productId] || null,
    [cache]
  );

  const isLoading = useCallback(
    (productId) => !!loading[productId],
    [loading]
  );

  const value = {
    cache,
    loading,
    fetchReviews,
    addReview,
    invalidateProduct,
    clearCache,
    getCached,
    isLoading,
  };

  return (
    <ReviewsContext.Provider value={value}>
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error("useReviews must be used within ReviewsProvider");
  }
  return context;
}