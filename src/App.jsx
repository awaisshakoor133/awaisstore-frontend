import { useState, useEffect, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "./App.css";
import FilterBar from "./components/FilterBar";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import ToastProvider from "./components/ToastProvider";

const API = import.meta.env.VITE_API_URL;

// ============================================================
// Store (Public)
// ============================================================
function Store() {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API}/products`)
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Products fetch error:", err);
        setError("Products load nahi ho paaye 😢");
        setLoading(false);
        toast.error("Products load nahi ho paaye");
      });
  }, []);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    const min = parseFloat(priceRange.min) || 0;
    const max = parseFloat(priceRange.max) || Infinity;
    result = result.filter((p) => p.price >= min && p.price <= max);

    switch (sort) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-az":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        result.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
    }

    return result;
  }, [products, search, category, sort, priceRange]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setSort("newest");
    setPriceRange({ min: "", max: "" });
    toast("Filters cleared", { icon: "🔄" });
  };

  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    payment: "Cash on Delivery",
  });

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
      setCart([
        ...cart,
        { ...product, id: product._id, quantity: 1 },
      ]);
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
        .map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );

  const removeFromCart = (id) => {
    const item = cart.find((i) => i.id === id);
    setCart(cart.filter((i) => i.id !== id));
    toast.error(`${item?.name || "Item"} removed from cart`, { icon: "🗑️" });
  };

  const cartCount = cart.reduce((t, i) => t + i.quantity, 0);
  const cartTotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomer({ ...customer, [name]: value });
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    const orderData = {
      customer: { ...customer },
      products: cart.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        icon: i.icon,
      })),
      total: cartTotal,
    };

    const loadingToast = toast.loading("Placing your order...");

    try {
      const res = await axios.post(`${API}/orders`, orderData);

      setOrders([
        ...orders,
        {
          id: res.data._id,
          customer: res.data.customer,
          products: res.data.products,
          total: res.data.total,
          date: new Date(res.data.createdAt).toLocaleDateString(),
          status: res.data.status,
        },
      ]);

      toast.success(`Order placed! Thank you ${customer.name} 🎉`, {
        id: loadingToast,
        duration: 4000,
      });

      setCart([]);
      setShowCheckout(false);
      setCustomer({
        name: "",
        phone: "",
        address: "",
        city: "",
        payment: "Cash on Delivery",
      });
    } catch (err) {
      console.error("Order error:", err);
      toast.error("Order place nahi ho paaya. Server check karo.", {
        id: loadingToast,
      });
    }
  };

  const openProduct = (p) => setSelectedProduct(p);
  const closeProduct = () => setSelectedProduct(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeProduct();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="app">
      <nav className="navbar">
       <div className="logo">
           <img src="/logo.svg" alt="Awais Mobile-Zone" className="brand-logo" />
         </div>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#products">Products</a>
          <a href="#categories">Categories</a>
          <a href="#orders">Orders</a>
        </div>

        <div className="nav-actions">
          <button className="icon-btn" onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <a href="#cart" className="icon-btn cart-pill">
            🛒 <span className="badge">{cartCount}</span>
          </a>
          <a href="/admin" className="login-btn">
            🔐 Admin
          </a>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-bg-glow" />
        <div className="hero-content">
          <p className="eyebrow">— PREMIUM SHOPPING EXPERIENCE</p>
          <h1>
            Shop <span className="gradient-text">Smart.</span>
            <br />
            Live <span className="gradient-text">Better.</span>
          </h1>
          <p className="hero-text">
            Curated collections, premium quality, and a seamless checkout —
            all in one refined store.
          </p>

          <div className="hero-cta">
            <a href="#products" className="shop-btn">
              Shop Now <span>→</span>
            </a>
            <a href="#categories" className="ghost-btn">
              Explore Categories
            </a>
          </div>

          <div className="hero-stats">
            <div><strong>10K+</strong><span>Happy Customers</span></div>
            <div><strong>500+</strong><span>Products</span></div>
            <div><strong>4.9★</strong><span>Rating</span></div>
          </div>
        </div>

       <div className="hero-image">
         <div className="product-circle">
       <img
          src="https://images.unsplash.com/photo-1575695342320-d2d2d2f9b73f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTkxfHxwaG9uZXxlbnwwfHwwfHx8MA%3D%3D"
          alt="Awais Mobile-Zone"
          className="hero-img"
       />
          </div>
         <div className="floating-tag tag-1">✨ Free Shipping</div>
       <div className="floating-tag tag-2">🔒 Secure Payment</div>
      </div>
      </section> 

      {/* ===== WHY CHOOSE US — FEATURES ===== */}
<section className="features-section">
  <div className="features-header">
    <p className="eyebrow">— WHY CHOOSE US</p>
    <h2>
      Everything You Need, <br />
      All in <span className="gradient-text">One Place</span>
    </h2>
    <p className="features-subtitle">
      We're committed to giving you the best shopping experience with
      premium service and unmatched quality.
    </p>
  </div>

  <div className="features-grid">
    {/* Feature 1: Free Shipping */}
    <div className="feature-block">
      <div className="feature-icon-wrap">
        <span className="feature-icon-big">🚚</span>
      </div>
      <div className="feature-content">
        <h3>Free Shipping</h3>
        <p>
          Enjoy free home delivery on all orders above Rs. 5,000.
          Fast, safe, and reliable shipping across Pakistan.
        </p>
        <a href="#products" className="feature-link">
          Start Shopping <span>→</span>
        </a>
      </div>
    </div>

    {/* Feature 2: Secure Payment */}
    <div className="feature-block">
      <div className="feature-icon-wrap">
        <span className="feature-icon-big">🔒</span>
      </div>
      <div className="feature-content">
        <h3>100% Secure Payment</h3>
        <p>
          Your payment is protected with 256-bit SSL encryption.
          Shop with confidence — Cash on Delivery available.
        </p>
        <a href="#products" className="feature-link">
          Learn More <span>→</span>
        </a>
      </div>
    </div>

    {/* Feature 3: Easy Returns */}
    <div className="feature-block">
      <div className="feature-icon-wrap">
        <span className="feature-icon-big">↩️</span>
      </div>
      <div className="feature-content">
        <h3>7-Day Easy Returns</h3>
        <p>
          Not satisfied? Return any product within 7 days for a
          full refund. No questions asked.
        </p>
        <a href="#products" className="feature-link">
          Return Policy <span>→</span>
        </a>
      </div>
    </div>

    {/* Feature 4: 24/7 Support */}
    <div className="feature-block">
      <div className="feature-icon-wrap">
        <span className="feature-icon-big">💬</span>
      </div>
      <div className="feature-content">
        <h3>24/7 Customer Support</h3>
        <p>
          Our dedicated support team is always here to help you
          with any questions or concerns.
        </p>
        <a href="#" className="feature-link">
          Contact Us <span>→</span>
        </a>
      </div>
    </div>
  </div>
     </section>
      <section className="categories" id="categories">
        <div className="section-head">
          <p className="eyebrow">— BROWSE</p>
          <h2>Shop By Category</h2>
          <p className="section-text">
            Find everything you need, thoughtfully organized.
          </p>
        </div>

        <div className="category-container">
          {[
            { icon: "📱", title: "Electronics", desc: "Smart gadgets & accessories" },
            { icon: "⌚", title: "Watches", desc: "Timeless style for everyone" },
            { icon: "🎒", title: "Accessories", desc: "Everyday essentials" },
            { icon: "📚", title: "Stationery", desc: "Quality school supplies" },
          ].map((c) => (
            <div
              className="category-card"
              key={c.title}
              onClick={() => {
                setCategory(c.title);
                toast(`Filtered by ${c.title}`, { icon: "📂" });
                document
                  .getElementById("products")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <div className="cat-icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <span className="cat-arrow">→</span>
            </div>
          ))}
        </div>
      </section>

      <section className="products" id="products">
        <div className="section-head">
          <p className="eyebrow">— CURATED FOR YOU</p>
          <h2>Featured Products</h2>
          <p className="section-text">Handpicked favorites our customers love.</p>
        </div>

        <FilterBar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          onClear={clearFilters}
          totalCount={products.length}
          filteredCount={filteredProducts.length}
        />

        {loading ? (
          <div className="empty-state">
            <div className="empty-icon">⏳</div>
            <h3>Loading products...</h3>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h3>{error}</h3>
            <p>Backend server chal raha hai? Check karo.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>Koi product nahi mila</h3>
            <p>Filters change karke try karo ya clear karo.</p>
            <button className="clear-btn-lg" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="product-container">
            {filteredProducts.map((product) => (
              <div
                className="product-card"
                key={product._id}
                onClick={() => openProduct(product)}
              >
                <div className="product-img">
                  {product.image ? (
               <img
                 src={product.image}
                  alt={product.name}
                   loading="lazy"
               />
                 ) : (
               <span>{product.icon}</span>
              )}
              <span className="product-category">{product.category}</span>
              </div>

                <h3>{product.name}</h3>
                <p className="product-desc">{product.description}</p>

                <div className="price">
                  <strong>Rs. {product.price.toLocaleString()}</strong>
                  <del>Rs. {product.oldPrice.toLocaleString()}</del>
                </div>

                <button
                  className="add-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                >
                  Add to Cart <span>🛒</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedProduct && (
        <div className="modal-overlay" onClick={closeProduct}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeProduct}>✕</button>

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
                  <span className="discount-pill">
                    -
                    {Math.round(
                      ((selectedProduct.oldPrice - selectedProduct.price) /
                        selectedProduct.oldPrice) * 100
                    )}
                    %
                  </span>
                </div>

                <ul className="feature-list">
                  <li>✔ Free shipping on this item</li>
                  <li>✔ 7-day easy returns</li>
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
          </div>
        </div>
      )}

      <section className="cart-section" id="cart">
        <div className="section-head">
          <p className="eyebrow">— YOUR SELECTION</p>
          <h2>Shopping Cart</h2>
        </div>

        {cart.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some products to get started.</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-icon">{item.icon}</div>

                  <div className="cart-info">
                    <h3>{item.name}</h3>
                    <p className="muted">
                      Rs. {item.price.toLocaleString()} each
                    </p>

                    <div className="quantity-controls">
                      <button onClick={() => decreaseQuantity(item.id)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => increaseQuantity(item.id)}>+</button>
                    </div>
                  </div>

                  <div className="cart-right">
                    <div className="cart-price">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <div>
                <span className="muted">Subtotal</span>
                <h3>Rs. {cartTotal.toLocaleString()}</h3>
              </div>
              <button
                className="checkout-btn"
                onClick={() => setShowCheckout(true)}
              >
                Proceed to Checkout →
              </button>
            </div>
          </>
        )}
      </section>

      {showCheckout && (
        <section className="checkout-section">
          <div className="checkout-container">
            <div className="checkout-form">
              <p className="eyebrow">— CHECKOUT</p>
              <h2>Shipping Details</h2>
              <p className="muted">
                Enter your information to complete the order.
              </p>

              <form onSubmit={placeOrder}>
                <div className="field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={customer.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="03XX-XXXXXXX"
                    value={customer.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="field">
                  <label>Address</label>
                  <textarea
                    name="address"
                    placeholder="Enter your complete address"
                    value={customer.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="field-row">
                  <div className="field">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={customer.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Payment</label>
                    <select
                      name="payment"
                      value={customer.payment}
                      onChange={handleInputChange}
                    >
                      <option>Cash on Delivery</option>
                      <option>Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="place-order-btn">
                  Place Order ✅
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowCheckout(false)}
                >
                  Cancel
                </button>
              </form>
            </div>

            <div className="order-summary">
              <p className="eyebrow">— SUMMARY</p>
              <h2>Order Summary</h2>

              <div className="summary-items">
                {cart.map((item) => (
                  <div className="summary-item" key={item.id}>
                    <span>
                      {item.name} <em>× {item.quantity}</em>
                    </span>
                    <strong>
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="summary-total">
                <span>Total</span>
                <strong>Rs. {cartTotal.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="orders-section" id="orders">
        <div className="section-head">
          <p className="eyebrow">— HISTORY</p>
          <h2>My Orders</h2>
          <p className="section-text">View your recent orders and their details.</p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No Orders Yet</h3>
            <p>Your placed orders will appear here.</p>
          </div>
        ) : (
          <div className="orders-container">
            {orders.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="order-header">
                  <div>
                    <h3>Order #{order.id.toString().slice(-6)}</h3>
                    <p className="muted">Date: {order.date}</p>
                  </div>
                  <span className="order-status">{order.status}</span>
                </div>

                <div className="order-products">
                  {order.products.map((item, idx) => (
                    <div className="order-product" key={idx}>
                      <div className="order-product-icon">{item.icon}</div>
                      <div>
                        <h4>{item.name}</h4>
                        <p className="muted">Quantity: {item.quantity}</p>
                      </div>
                      <strong>
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div><strong>Customer:</strong> {order.customer.name}</div>
                  <div><strong>Payment:</strong> {order.customer.payment}</div>
                  <div className="order-total">
                    Total: Rs. {order.total.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer>
        <div className="footer-top">
          <div>
           <div className="logo">
           <img src="/logo.svg" alt="Awais Mobile-Zone" className="brand-logo" />
           </div>
            <p className="muted">Quality products. Affordable prices.</p>
          </div>

          <div className="footer-cols">
            <div>
              <h4>Shop</h4>
              <a href="#products">Products</a>
              <a href="#categories">Categories</a>
              <a href="#cart">Cart</a>
            </div>
            <div>
              <h4>Support</h4>
              <a href="#orders">Orders</a>
              <a href="#">Contact</a>
              <a href="#">FAQ</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 Awais Mobile-Zone. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// Admin Route Wrapper (Protected)
// ============================================================
function AdminRoute() {
  const [isAuthed, setIsAuthed] = useState(
    () => localStorage.getItem("awais-admin-auth") === "true"
  );

  if (!isAuthed) {
    return <AdminLogin onLogin={() => setIsAuthed(true)} />;
  }

  return <AdminDashboard onLogout={() => setIsAuthed(false)} />;
}

// ============================================================
// Main App with Router
// ============================================================
function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <Routes>
        <Route path="/" element={<Store />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;