import AdminReviewsPage from "./pages/AdminReviewsPage";
import ProductReviews from "./components/ProductReviews";
import AdminCouponsPage from "./pages/AdminCouponsPage";
import { useState, useEffect, useMemo } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "./App.css";

// Layouts
import StoreLayout from "./layouts/StoreLayout";
import AdminLayout from "./components/AdminLayout";

// Components
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import ToastProvider from "./components/ToastProvider";

// Pages
import StoreHome from "./pages/StoreHome";
import ProductsPage from "./pages/ProductsPage";
import CategoriesPage from "./pages/CategoriesPage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import WishlistPage from "./pages/WishlistPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import UserProfilePage from "./pages/UserProfilePage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminCustomersPage from "./pages/AdminCustomersPage";

import { useAuth } from "./context/AuthContext";

const API = import.meta.env.VITE_API_URL;

// ============================================================
// STORE WRAPPER — Holds shared state (cart, wishlist, products)
// ============================================================
function StoreWrapper() {
  const { user } = useAuth();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("awais-theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("awais-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    toast.success(
      newTheme === "dark" ? "🌙 Dark mode on" : "☀️ Light mode on",
      { duration: 1500 }
    );
  };

  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("awais-wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("awais-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const addToCart = (product) => {
    const existing = cart.find((i) => i.id === product._id);
    if (existing) {
      setCart(
        cart.map((i) =>
          i.id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
      toast.success(`${product.name} quantity increased`, { icon: "➕" });
    } else {
      setCart([...cart, { ...product, id: product._id, quantity: 1 }]);
      toast.success(`${product.name} added to cart!`, { icon: "🛒" });
    }
  };

  const increaseQuantity = (id) =>
    setCart(
      cart.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i
      )
    );

  const decreaseQuantity = (id) =>
    setCart(
      cart
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );

  const removeFromCart = (id) => {
    const item = cart.find((i) => i.id === id);
    setCart(cart.filter((i) => i.id !== id));
    toast.error(`${item?.name || "Item"} removed`, { icon: "🗑️" });
  };

  const toggleWishlist = (product) => {
    const exists = wishlist.find((i) => i._id === product._id);
    if (exists) {
      setWishlist(wishlist.filter((i) => i._id !== product._id));
      toast.error(`${product.name} removed from wishlist`, { icon: "💔" });
    } else {
      setWishlist([...wishlist, product]);
      toast.success(`${product.name} added to wishlist!`, { icon: "❤️" });
    }
  };

  const isInWishlist = (id) => wishlist.some((i) => i._id === id);

  const openProduct = (p) => setSelectedProduct(p);
  const closeProduct = () => setSelectedProduct(null);

  const cartCount = cart.reduce((t, i) => t + i.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <StoreLayout
      theme={theme}
      toggleTheme={toggleTheme}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
    >
      <Outlet
        context={{
          products,
          addToCart,
          openProduct,
          wishlist,
          toggleWishlist,
          isInWishlist,
          cart,
          increaseQuantity,
          decreaseQuantity,
          removeFromCart,
          cartCount,
          cartTotal: cart.reduce((t, i) => t + i.price * i.quantity, 0),
          setCart,
        }}
      />

      {/* Product Modal */}
     {selectedProduct && (
  <div className="modal-overlay" onClick={closeProduct}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={closeProduct}>
        ✕
      </button>

      <div className="modal-body">
        <div className="modal-image">
          {selectedProduct.image ? (
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="modal-img"
            />
          ) : (
            <span className="zoom-icon">{selectedProduct.icon}</span>
          )}
          <span className="product-category modal-cat">
            {selectedProduct.category}
          </span>
        </div>

        <div className="modal-info">
          <p className="eyebrow">— PRODUCT DETAILS</p>
          <h2>{selectedProduct.name}</h2>
          <p className="modal-desc">{selectedProduct.description}</p>

          <div className="price modal-price">
            <strong>Rs. {selectedProduct.price.toLocaleString()}</strong>
            <del>Rs. {selectedProduct.oldPrice.toLocaleString()}</del>
          </div>

          <ul className="feature-list">
            <li>✔ Free shipping</li>
            <li>✔ 7-day returns</li>
            <li>✔ 1 year warranty</li>
          </ul>

          <button
            className="add-btn modal-add"
            onClick={() => {
              addToCart(selectedProduct);
              closeProduct();
            }}
          >
            Add to Cart <span>🛒</span>
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="modal-reviews-section">
        <ProductReviews productId={selectedProduct._id} />
      </div>
    </div>
  </div>
)}
    </StoreLayout>
  );
}

// ============================================================
// Page wrappers to pass context
// ============================================================
import { useOutletContext } from "react-router-dom";

function HomePage() {
  const ctx = useOutletContext();
  return (
    <StoreHome
      products={ctx.products}
      addToCart={ctx.addToCart}
      openProduct={ctx.openProduct}
    />
  );
}

function ProductsPageWrapper() {
  const ctx = useOutletContext();
  return (
    <ProductsPage
      addToCart={ctx.addToCart}
      openProduct={ctx.openProduct}
      wishlist={ctx.wishlist}
      toggleWishlist={ctx.toggleWishlist}
      isInWishlist={ctx.isInWishlist}
    />
  );
}

function CartPageWrapper() {
  const ctx = useOutletContext();
  return (
    <CartPage
      cart={ctx.cart}
      increaseQuantity={ctx.increaseQuantity}
      decreaseQuantity={ctx.decreaseQuantity}
      removeFromCart={ctx.removeFromCart}
      cartTotal={ctx.cartTotal}
      setCart={ctx.setCart}
    />
  );
}

function WishlistPageWrapper() {
  const ctx = useOutletContext();
  return (
    <WishlistPage
      wishlist={ctx.wishlist}
      toggleWishlist={ctx.toggleWishlist}
      addToCart={ctx.addToCart}
    />
  );
}

// ============================================================
// Admin Route Wrapper
// ============================================================
function AdminRoute() {
  const [isAuthed, setIsAuthed] = useState(
    () => localStorage.getItem("awais-admin-auth") === "true"
  );

  if (!isAuthed) {
    return <AdminLogin onLogin={() => setIsAuthed(true)} />;
  }

  return (
    <AdminLayout onLogout={() => setIsAuthed(false)}>
      <Outlet />
    </AdminLayout>
  );
}

// Protected Route
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ============================================================
// Main App with Router
// ============================================================
function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <Routes>
        {/* Store Routes */}
        <Route path="/" element={<StoreWrapper />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPageWrapper />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="cart" element={<CartPageWrapper />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="wishlist" element={<WishlistPageWrapper />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;