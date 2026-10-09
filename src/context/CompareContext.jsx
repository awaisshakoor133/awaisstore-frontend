import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const CompareContext = createContext();
const STORAGE_KEY = "awais-compare";
const MAX_ITEMS = 3;

export function CompareProvider({ children }) {
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

  // Add product to compare
  const addToCompare = (product) => {
    if (!product?._id) return;

    // Check if already in compare
    if (items.find((p) => p._id === product._id)) {
      toast.error(`${product.name} is already in compare`);
      return;
    }

    // Check max limit
    if (items.length >= MAX_ITEMS) {
      toast.error(`Maximum ${MAX_ITEMS} products allowed`);
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        _id: product._id,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        image: product.image,
        icon: product.icon,
        category: product.category,
        description: product.description,
      },
    ]);

    toast.success(`${product.name} added to compare`);
  };

  // Remove from compare
  const removeFromCompare = (id) => {
    const item = items.find((p) => p._id === id);
    setItems((prev) => prev.filter((p) => p._id !== id));
    if (item) toast.error(`${item.name} removed from compare`);
  };

  // Clear all
  const clearCompare = () => {
    setItems([]);
    toast.success("Compare cleared");
  };

  // Check if in compare
  const isInCompare = (id) => items.some((p) => p._id === id);

  // Toggle
  const toggleCompare = (product) => {
    if (isInCompare(product._id)) {
      removeFromCompare(product._id);
    } else {
      addToCompare(product);
    }
  };

  const value = {
    items,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    toggleCompare,
    count: items.length,
    maxItems: MAX_ITEMS,
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return context;
}