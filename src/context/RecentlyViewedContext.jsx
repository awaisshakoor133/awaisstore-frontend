import { createContext, useContext, useState, useEffect } from "react";

const RecentlyViewedContext = createContext();
const STORAGE_KEY = "awais-recently-viewed";
const MAX_ITEMS = 8;

export function RecentlyViewedProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  // Add product (moves to front if already exists)
  const addToRecentlyViewed = (product) => {
    if (!product?._id) return;

    setItems((prev) => {
      const filtered = prev.filter((p) => p._id !== product._id);
      const trimmed = {
        _id: product._id,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        image: product.image,
        icon: product.icon,
        category: product.category,
      };
      return [trimmed, ...filtered].slice(0, MAX_ITEMS);
    });
  };

  // Clear all
  const clearRecentlyViewed = () => setItems([]);

  // Remove one
  const removeFromRecentlyViewed = (id) => {
    setItems((prev) => prev.filter((p) => p._id !== id));
  };

  const value = {
    items,
    addToRecentlyViewed,
    clearRecentlyViewed,
    removeFromRecentlyViewed,
  };

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error(
      "useRecentlyViewed must be used within RecentlyViewedProvider"
    );
  }
  return context;
}