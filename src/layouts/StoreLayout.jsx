import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import ThemeToggle from "../components/ThemeToggle";
import { chatOnWhatsApp } from "../utils/whatsapp";
import {
  HomeIcon,
  ProductsIcon,
  CategoriesIcon,
  OrdersIcon,
  CartIcon,
  HeartIcon,
  PhoneIcon,
  MailIcon,
  UserIcon,
  InstagramIcon,
  WhatsAppIcon,
  FacebookIcon,
  LogoutIcon,
  ShieldIcon,
  SearchIcon,
  MoonIcon,
  SunIcon,
  HeartFilledIcon,
  PackageIconSmall,
   WaveIcon,
  UserIconSmall,
  MailIconSmall,
  MapPinIconSmall,
  HomeIconSmall,
  LogOutIcon,
    FileTextIcon,
} from "../components/StoreIcons";

function StoreLayout({
  children,
  theme,
  toggleTheme,
  cartCount,
  wishlistCount,
}) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
  e.preventDefault();
  if (searchQuery.trim()) {
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    setSidebarOpen(false);  // ← YEH ADD KARO (mobile pe sidebar band ho)
  }
};

  const menuItems = [
    { path: "/", label: "Home", Icon: HomeIcon },
    { path: "/products", label: "Products", Icon: ProductsIcon },
    { path: "/categories", label: "Categories", Icon: CategoriesIcon },
     { path: "/blog", label: "Blog", Icon: FileTextIcon },
    { path: "/orders", label: "Orders", Icon: OrdersIcon },
    { path: "/cart", label: "Cart", Icon: CartIcon, badge: cartCount },
    {
      path: "/wishlist",
      label: "Wishlist",
      Icon: HeartIcon,
      badge: wishlistCount,
    },
  ];

  const handleLogout = () => {
    logout();
   toast.success("Logged out successfully", {
  icon: <WaveIcon size={18} />,
});
    navigate("/");
  };

  return (
    <div className="store-layout">
      {/* ===== SIDEBAR ===== */}
      <aside className={`store-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="store-sidebar-header">
          <Link to="/" className="store-sidebar-logo">
            <span className="logo-mark">AM</span>
            <span className="logo-text">
              Awais<em> Mobile-Zone</em>
            </span>
          </Link>
        </div>

        <nav className="store-sidebar-nav">
  {/* Mobile Search Bar — SABSE UPAR */}
  <form className="sidebar-search" onSubmit={handleSearch}>
    <span className="search-icon">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </span>
    <input
      type="text"
      placeholder="Search products..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </form>

  {/* Menu Items */}
  {menuItems.map((item) => (
    <Link
      key={item.path}
      to={item.path}
      className={`store-nav-item ${
        isActive(item.path) ? "active" : ""
      }`}
      onClick={() => setSidebarOpen(false)}
    >
      <span className="store-nav-icon">
        <item.Icon size={18} />
      </span>
      <span className="store-nav-label">{item.label}</span>
      {item.badge > 0 && (
        <span className="store-nav-badge">{item.badge}</span>
      )}
    </Link>
  ))}
</nav>

        <div className="store-sidebar-footer">
          <a
            href="https://wa.me/923352494258"
            target="_blank"
            rel="noopener noreferrer"
            className="store-contact"
          >
            <PhoneIcon size={16} />
            <span>0335-2494258</span>
          </a>
          <a href="mailto:awaisshakoor133@gmail.com" className="store-contact">
            <MailIcon size={16} />
            <span>awaisshakoor133@gmail.com</span>
          </a>

          <div className="store-sidebar-social">
            <a
              href="https://wa.me/923352494258"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon size={18} />
            </a>
            <a
              href="https://instagram.com/awaisshakoor3"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <InstagramIcon size={18} />
            </a>
            <a
              href="https://facebook.com/awaisshakoor3"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FacebookIcon size={18} />
            </a>
          </div>

          <Link to="/admin" className="store-sidebar-admin">
            <ShieldIcon size={14} />
            <span>Admin Panel</span>
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div className="store-main-wrapper">
        <header className="store-topbar">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          <form className="topbar-search" onSubmit={handleSearch}>
  <span className="search-icon">
    <SearchIcon size={18} />
  </span>
  <input
    type="text"
    placeholder="Search products..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</form>
          <div className="topbar-actions">
           <ThemeToggle />

            <Link to="/cart" className="icon-btn cart-pill" title="Cart">
              <CartIcon size={18} />
              <span className="badge">{cartCount}</span>
            </Link>

            <Link
              to="/wishlist"
              className="icon-btn cart-pill"
              title="Wishlist"
            >
              <HeartIcon size={18} />
              <span className="badge">{wishlistCount}</span>
            </Link>

            {user ? (
              <div className="user-menu">
                <button className="user-avatar-btn">
                  <span className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="user-name">{user.name.split(" ")[0]}</span>
                  <span className="user-arrow">▼</span>
                </button>
                <div className="user-dropdown">
  <Link to="/profile" className="dropdown-item">
    <UserIconSmall size={16} />
    <span>My Profile</span>
  </Link>
  <Link to="/orders" className="dropdown-item">
    <PackageIconSmall size={16} />
    <span>My Orders</span>
  </Link>
  <Link to="/wishlist" className="dropdown-item">
    <HeartFilledIcon size={16} />
    <span>My Wishlist</span>
  </Link>
  <div className="dropdown-divider"></div>
  <button onClick={handleLogout} className="dropdown-item dropdown-logout">
    <LogOutIcon size={16} />
    <span>Logout</span>
  </button>
</div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="nav-login-btn">
                  Login
                </Link>
                <Link to="/signup" className="nav-signup-btn">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </header>

        <main className="store-content">{children}</main>

        <footer className="store-footer-simple">
          <div>
            © 2026 <strong>Awais Mobile-Zone</strong>. All rights reserved.
          </div>
          <div className="footer-made">
    Made with <HeartFilledIcon size={14} /> in Pakistan
  </div>
        </footer>
      </div>

      {/* WhatsApp Float */}
<button
  type="button"
  onClick={() => chatOnWhatsApp("Assalam-o-Alaikum! I need help with Awais Mobile-Zone.")}
  className="whatsapp-float"
  aria-label="Chat on WhatsApp"
  title="Chat on WhatsApp"
>
  <WhatsAppIcon size={28} />
</button>
    </div>
  );
}

export default StoreLayout;