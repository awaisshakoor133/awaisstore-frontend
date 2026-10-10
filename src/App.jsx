import { useProducts } from "./context/ProductsContext";
import { useState, useEffect, useMemo, lazy, Suspense } from "react";
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

// Layouts (static — chhote hain)
import StoreLayout from "./layouts/StoreLayout";
import AdminLayout from "./components/AdminLayout";

// Small components (static)
import AdminLogin from "./components/AdminLogin";
import ToastProvider from "./components/ToastProvider";
import ProductReviews from "./components/ProductReviews";
import { orderProductOnWhatsApp } from "./utils/whatsapp";
import { CartIcon, WhatsAppIcon } from "./components/StoreIcons";

// Contexts (static)
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import { useCart } from "./context/CartContext";

// ============================================================
// LAZY LOADED PAGES (Code Splitting)
// ============================================================
// Store pages
const StoreHome = lazy(() => import("./pages/StoreHome"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderTrackingPage = lazy(() => import("./pages/OrderTrackingPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));

// Auth pages
const SignupPage = lazy(() => import("./pages/SignupPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));

// Blog pages
const BlogListPage = lazy(() => import("./pages/BlogListPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));

// Admin pages
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const AdminProductsPage = lazy(() => import("./pages/AdminProductsPage"));
const AdminOrdersPage = lazy(() => import("./pages/AdminOrdersPage"));
const AdminCustomersPage = lazy(() => import("./pages/AdminCustomersPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/AdminAnalyticsPage"));
const AdminReviewsPage = lazy(() => import("./pages/AdminReviewsPage"));
const AdminCouponsPage = lazy(() => import("./pages/AdminCouponsPage"));
const AdminBlogsPage = lazy(() => import("./pages/AdminBlogsPage"));
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

  const { products } = useProducts();

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

     {/* ============================================
    PRODUCT MODAL
   ============================================ */}
{selectedProduct && (
  <div className="modal-overlay" onClick={closeProduct}>
    <div
      className="modal-content"
      onClick={(e) => e.stopPropagation()}
    >
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
            <strong>
              Rs. {selectedProduct.price?.toLocaleString()}
            </strong>
            {selectedProduct.oldPrice && (
              <del>
                Rs. {selectedProduct.oldPrice?.toLocaleString()}
              </del>
            )}
          </div>

          <ul className="feature-list">
            <li>✓ Free shipping</li>
            <li>✓ 7-day returns</li>
            <li>✓ 1 year warranty</li>
          </ul>

          <button
            className="add-btn modal-add"
            onClick={() => {
              addToCart(selectedProduct);
              closeProduct();
            }}
          >
            Add to Cart <CartIcon size={18} />
          </button>

          {/* WhatsApp Order Button */}
          <button
            className="add-btn modal-add modal-whatsapp"
            onClick={() => orderProductOnWhatsApp(selectedProduct)}
          >
            <WhatsAppIcon size={18} />
            <span>Order on WhatsApp</span>
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
// PAGE LOADER (Suspense Fallback)
// ============================================================
function PageLoader() {
  return (
    <div className="page-loader">
      <div className="page-loader-spinner" />
      <p>Loading...</p>
    </div>
  );
}

// ============================================================
// Main App with Router
// ============================================================
function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Store Routes */}
          <Route path="/" element={<StoreWrapper />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPageWrapper />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="cart" element={<CartPageWrapper />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderTrackingPage />} />
            <Route path="wishlist" element={<WishlistPageWrapper />} />
            <Route path="compare" element={<ComparePage />} />
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;