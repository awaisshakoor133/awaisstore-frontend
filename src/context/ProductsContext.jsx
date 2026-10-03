import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL;
const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============ FETCH PRODUCTS ============
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error("Products fetch error:", err);
      setError(err.message);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ============ HELPERS ============
  const getProductById = useCallback(
    (id) => products.find((p) => p._id === id),
    [products]
  );

  const getRelatedProducts = useCallback(
    (category, excludeId, limit = 4) =>
      products
        .filter((p) => p.category === category && p._id !== excludeId)
        .slice(0, limit),
    [products]
  );

  const refresh = () => fetchProducts();

  const value = {
    products,
    loading,
    error,
    fetchProducts,
    refresh,
    getProductById,
    getRelatedProducts,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within ProductsProvider");
  }
  return context;
}