import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminReviewsPage from "./pages/AdminReviewsPage";
import ProductReviews from "./components/ProductReviews";
import AdminCouponsPage from "./pages/AdminCouponsPage";
import BlogListPage from "./pages/BlogListPage";
import BlogPostPage from "./pages/BlogPostPage";
import AdminBlogsPage from "./pages/AdminBlogsPage";
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
import { useTheme } from "./context/ThemeContext";
import { useCart } from "./context/CartContext";

const API = import.meta.env.VITE_API_URL;

// ============================================================
// STORE WRAPPER — Holds shared state (cart, wishlist, products)
// ============================================================
function StoreWrapper() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    cart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    cartTotal,
    setCart,
    wishlist,
    toggleWishlist,
    isInWishlist,
    cartCount,
    wishlistCount,
  } = useCart();

  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const openProduct = (p) => setSelectedProduct(p);
  const closeProduct = () => setSelectedProduct(null);

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
          cartTotal,
          setCart,
        }}
      />

      {/* Product Modal — WAISA HI RAHEGA */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={closeProduct}>
          ... {/* poora modal code waise hi */}
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
           <Route path="blog" element={<BlogListPage />} />
           <Route path="blog/:slug" element={<BlogPostPage />} />
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
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="blogs" element={<AdminBlogsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;