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
        <a
  href="#secure"
  className="feature-link"
  onClick={(e) => {
    e.preventDefault();
    alert("🔒 100% Secure Payment\n\n✅ 256-bit SSL encryption\n✅ Cash on Delivery available\n✅ No hidden charges\n✅ Safe checkout process");
  }}
>
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
        <a
  href="#returns"
  className="feature-link"
  onClick={(e) => {
    e.preventDefault();
    alert("↩️ 7-Day Easy Return Policy\n\n✅ Return within 7 days of delivery\n✅ Full refund guaranteed\n✅ No questions asked\n✅ Free pickup in major cities");
  }}
>
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
        <a
  href="https://wa.me/923352494258"
  target="_blank"
  rel="noopener noreferrer"
  className="feature-link"
>
  Contact Us <span>→</span>
</a>
      </div>
    </div>
        {/* Feature 5: Cash on Delivery */}
    <div className="feature-block">
      <div className="feature-icon-wrap">
        <span className="feature-icon-big">💵</span>
      </div>
      <div className="feature-content">
        <h3>Cash on Delivery</h3>
        <p>
          Pay only when you receive your order at your doorstep.
          No advance payment required — shop worry-free.
        </p>
        <a href="#products" className="feature-link">
          Order Now <span>→</span>
        </a>
      </div>
    </div>

    {/* Feature 6: Easy EMI */}
    <div className="feature-block">
      <div className="feature-icon-wrap">
        <span className="feature-icon-big">💳</span>
      </div>
      <div className="feature-content">
        <h3>Easy EMI Plans</h3>
        <p>
          Buy now, pay later with flexible 3, 6, or 12-month
          installment plans on select products.
        </p>
        <a
  href="#emi"
  className="feature-link"
  onClick={(e) => {
    e.preventDefault();
    alert("💳 Easy EMI Plans\n\n✅ 3-month: 0% markup\n✅ 6-month: Small markup\n✅ 12-month: Flexible\n\nAvailable on select phones.\nContact: 0335-2494258");
  }}
>
  View Plans <span>→</span>
</a>
      </div>
    </div>

    {/* Feature 7: 1 Year Warranty */}
    <div className="feature-block">
      <div className="feature-icon-wrap">
        <span className="feature-icon-big">🛡️</span>
      </div>
      <div className="feature-content">
        <h3>1 Year Warranty</h3>
        <p>
          Every product comes with official brand warranty.
          Buy with complete peace of mind.
        </p>
        <a
  href="#warranty"
  className="feature-link"
  onClick={(e) => {
    e.preventDefault();
    alert("🛡️ 1 Year Warranty\n\n✅ Official brand warranty\n✅ Free repair or replacement\n✅ Covered: manufacturing defects\n✅ Contact: awaisshakoor133@gmail.com");
  }}
>
  Warranty Info <span>→</span>
</a>
      </div>
    </div>

    {/* Feature 8: 100% Original */}
    <div className="feature-block">
      <div className="feature-icon-wrap">
        <span className="feature-icon-big">✅</span>
      </div>
      <div className="feature-content">
        <h3>100% Original Products</h3>
        <p>
          We guarantee authentic, brand-new products straight
          from official distributors. No fakes.
        </p>
        <a href="#products" className="feature-link">
          Shop Authentic <span>→</span>
        </a>
      </div>
    </div>
  </div>
     </section>
     <section className="categories" id="categories">
  <div className="section-head">
    <p className="eyebrow">— BROWSE CATEGORIES</p>
    <h2>
      Shop By <span className="gradient-text">Category</span>
    </h2>
    <p className="section-text">
      Find everything you need, thoughtfully organized.
    </p>
  </div>

  <div className="category-container">
    {[
      {
        title: "Smartphones",
        desc: "iPhone, Samsung & more",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop",
        count: "120+ Products",
      },
      {
        title: "Smartwatches",
        desc: "Apple Watch, Galaxy Watch",
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&h=500&fit=crop",
        count: "45+ Products",
      },
      {
        title: "Accessories",
        desc: "Cases, Chargers & More",
        image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500&h=500&fit=crop",
        count: "200+ Products",
      },
      {
        title: "Audio",
        desc: "Earbuds, Headphones",
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop",
        count: "60+ Products",
      },
    ].map((c) => (
      <div
        className="category-card-new"
        key={c.title}
        onClick={() => {
          setCategory(c.title);
          document
            .getElementById("products")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <div className="category-image">
          <img src={c.image} alt={c.title} loading="lazy" />
          <div className="category-overlay">
            <span className="category-count">{c.count}</span>
          </div>
        </div>
        <div className="category-info">
          <h3>{c.title}</h3>
          <p>{c.desc}</p>
          <span className="category-shop-link">
            Shop Now →
          </span>
        </div>
      </div>
    ))}
  </div>
</section>

      {/* ===== SPECIAL OFFERS BANNER ===== */}
<section className="offers-banner">
  <div className="offers-container">
    <div className="offers-content">
      <p className="offers-eyebrow">🔥 LIMITED TIME OFFER</p>
      <h2>
        Mega Sale — Up to <span className="offers-discount">50% OFF</span>
      </h2>
      <p className="offers-text">
        Hurry! Big discounts on all smartphones, smartwatches, and accessories.
        Sale ends soon!
      </p>

      <div className="offers-timer">
        <div className="timer-box">
          <span className="timer-value">02</span>
          <span className="timer-label">Days</span>
        </div>
        <div className="timer-box">
          <span className="timer-value">14</span>
          <span className="timer-label">Hours</span>
        </div>
        <div className="timer-box">
          <span className="timer-value">35</span>
          <span className="timer-label">Mins</span>
        </div>
        <div className="timer-box">
          <span className="timer-value">48</span>
          <span className="timer-label">Secs</span>
        </div>
      </div>

      <a href="#products" className="offers-cta">
        Shop Sale <span>→</span>
      </a>
    </div>

    <div className="offers-image">
      <img
        src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=600&fit=crop"
        alt="Mega Sale"
      />
    </div>
  </div>
</section>
{/* ===== BEST SELLERS ===== */}
<section className="best-sellers">
  <div className="section-head">
    <p className="eyebrow">— TOP RATED</p>
    <h2>
      Best <span className="gradient-text">Sellers</span>
    </h2>
    <p className="section-text">
      Most loved products by our customers.
    </p>
  </div>

  <div className="bestseller-container">
    {products.slice(0, 4).map((product) => (
      <div
        className="bestseller-card"
        key={product._id}
        onClick={() => openProduct(product)}
      >
        <span className="bestseller-badge">🔥 Best Seller</span>

        <div className="bestseller-img">
          {product.image ? (
            <img src={product.image} alt={product.name} loading="lazy" />
          ) : (
            <span>{product.icon}</span>
          )}
        </div>

        <div className="bestseller-info">
          <span className="bestseller-category">{product.category}</span>
          <h3>{product.name}</h3>
          <p className="bestseller-desc">{product.description}</p>

          <div className="bestseller-rating">
            <span className="stars">★★★★★</span>
            <span className="rating-count">(4.8)</span>
          </div>

          <div className="bestseller-bottom">
            <div className="bestseller-price">
              <strong>Rs. {product.price.toLocaleString()}</strong>
              <del>Rs. {product.oldPrice.toLocaleString()}</del>
            </div>
            <button
              className="bestseller-add"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
            >
              Add 🛒
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
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
  <div className="empty-icon-svg">
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
        <linearGradient id="goldGradCart" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c8a04b" />
          <stop offset="100%" stopColor="#e0bb6a" />
        </linearGradient>
      </defs>
      
      <circle cx="60" cy="60" r="52" fill="url(#cartGrad)" opacity="0.08" />
      <circle cx="60" cy="60" r="52" stroke="url(#goldGradCart)" strokeWidth="1.5" strokeDasharray="4 6" fill="none" />
      
      <path
        d="M38 48 L42 90 C42.3 92.5 44.4 94.5 47 94.5 L73 94.5 C75.6 94.5 77.7 92.5 78 90 L82 48 Z"
        fill="url(#cartGrad)"
        stroke="url(#goldGradCart)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      
      <path
        d="M50 48 L50 38 C50 32 54 27 60 27 C66 27 70 32 70 38 L70 48"
        stroke="url(#goldGradCart)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      
      <line x1="45" y1="60" x2="75" y2="60" stroke="url(#goldGradCart)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="46" y1="70" x2="74" y2="70" stroke="url(#goldGradCart)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    </svg>
  </div>
  <h3>Your cart is empty</h3>
  <p>Add some products to get started.</p>
  <a href="#products" className="empty-state-cta">
    Start Shopping <span>→</span>
  </a>
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
      {/* ===== CUSTOMER REVIEWS ===== */}
<section className="reviews-section">
  <div className="section-head">
    <p className="eyebrow">— TESTIMONIALS</p>
    <h2>
      What Our <span className="gradient-text">Customers Say</span>
    </h2>
    <p className="section-text">
      Real reviews from real customers who love shopping with us.
    </p>
  </div>

  <div className="reviews-container">
    {[
      {
        name: "Ahmed Khan",
        location: "Karachi",
        rating: 5,
        text: "Amazing experience! iPhone 15 Pro original nikla aur delivery bhi 2 din mein aa gayi. Highly recommended!",
        avatar: "AK",
      },
      {
        name: "Fatima Ali",
        location: "Lahore",
        rating: 5,
        text: "Best prices online! Samsung watch ka warranty bhi original hai. Customer service is super responsive.",
        avatar: "FA",
      },
      {
        name: "Hassan Raza",
        location: "Islamabad",
        rating: 5,
        text: "Cash on delivery ne mera trust jeet liya. Product completely sealed tha. Aur EMI option bhi mila.",
        avatar: "HR",
      },
      {
        name: "Sara Malik",
        location: "Faisalabad",
        rating: 5,
        text: "Yeh mera pehla order tha aur bilkul satisfied hoon. Packaging bohat achi thi aur return policy bhi easy hai.",
        avatar: "SM",
      },
    ].map((review) => (
      <div className="review-card" key={review.name}>
        <div className="review-stars">★★★★★</div>

        <p className="review-text">"{review.text}"</p>

        <div className="review-author">
          <div className="review-avatar">{review.avatar}</div>
          <div>
            <h4>{review.name}</h4>
            <p className="review-location">{review.location}</p>
          </div>
        </div>

        <div className="review-quote">"</div>
      </div>
    ))}
  </div>
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
    <div className="empty-icon-svg">
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="orderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>
          <linearGradient id="goldGradOrder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c8a04b" />
            <stop offset="100%" stopColor="#e0bb6a" />
          </linearGradient>
        </defs>
        
        {/* Circle background */}
        <circle cx="60" cy="60" r="52" fill="url(#orderGrad)" opacity="0.08" />
        <circle cx="60" cy="60" r="52" stroke="url(#goldGradOrder)" strokeWidth="1.5" strokeDasharray="4 6" fill="none" />
        
        {/* Box body */}
        <path
          d="M35 50 L60 37 L85 50 L85 82 L60 95 L35 82 Z"
          fill="url(#orderGrad)"
          stroke="url(#goldGradOrder)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        
        {/* Box top face */}
        <path
          d="M35 50 L60 63 L85 50"
          stroke="url(#goldGradOrder)"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Box center line */}
        <line x1="60" y1="63" x2="60" y2="95" stroke="url(#goldGradOrder)" strokeWidth="2" />
        
        {/* Box tape */}
        <path
          d="M52 44 L68 44 M52 44 L52 50 M68 44 L68 50"
          stroke="url(#goldGradOrder)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />
        
        {/* Sparkle accents */}
        <circle cx="88" cy="35" r="2" fill="url(#goldGradOrder)" opacity="0.6" />
        <circle cx="32" cy="90" r="2" fill="url(#goldGradOrder)" opacity="0.4" />
        <circle cx="90" cy="80" r="1.5" fill="url(#goldGradOrder)" opacity="0.5" />
      </svg>
    </div>
    <h3>No Orders Yet</h3>
    <p>Your placed orders will appear here.</p>
    <a href="#products" className="empty-state-cta">
      Start Shopping <span>→</span>
    </a>
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
      {/* ===== TRUSTED BRANDS ===== */}
<section className="brands-section">
  <div className="section-head">
    <p className="eyebrow">— OFFICIAL PARTNERS</p>
    <h2>
      Trusted <span className="gradient-text">Brands</span>
    </h2>
    <p className="section-text">
      We deal only in 100% original products from official brands.
    </p>
  </div>

  <div className="brands-container">
    {[
      {
        name: "Apple",
        svg: (
          <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
        ),
      },
      {
        name: "Samsung",
        svg: (
          <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
            <path d="M19.817 6.5c1.16 0 2.04.54 2.04 1.65 0 1.54-1.3 2.17-1.3 3.32v.13c.56-.64 1.42-1.06 2.27-1.06.83 0 1.42.54 1.42 1.34 0 2.12-2.24 3.77-5.5 3.77-3.06 0-5.5-1.37-5.5-3.4 0-.86.6-1.4 1.4-1.4.87 0 1.72.44 2.28 1.06v-.13c0-1.15-1.3-1.78-1.3-3.32 0-1.11.88-1.65 2.04-1.65.63 0 1.2.16 1.72.46.5-.3 1.09-.46 1.72-.46zM8.13 6.5c1.16 0 2.04.54 2.04 1.65 0 1.54-1.3 2.17-1.3 3.32v.13c.55-.64 1.42-1.06 2.26-1.06.83 0 1.42.54 1.42 1.34 0 2.12-2.24 3.77-5.5 3.77-3.06 0-5.5-1.37-5.5-3.4 0-.86.6-1.4 1.4-1.4.88 0 1.73.44 2.29 1.06v-.13c0-1.15-1.3-1.78-1.3-3.32 0-1.11.88-1.65 2.04-1.65.63 0 1.2.16 1.72.46.5-.3 1.09-.46 1.73-.46z" />
          </svg>
        ),
      },
      {
        name: "OnePlus",
        svg: (
          <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
            <path d="M4 6h3v10H4zM8 10h7v6H8zM9 11v4h5v-4zM16 6h4v14h-4z" />
          </svg>
        ),
      },
      {
        name: "Xiaomi",
        svg: (
          <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
            <path d="M4 8h3v8H4zM7 12h4v4H7zM12 8h3v8h-3zM12 11h2v2h-2zM16 8h4v8h-4z" />
          </svg>
        ),
      },
      {
        name: "Oppo",
        svg: (
          <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
            <circle cx="8" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M14 8h2v8h-2zM18 12h2v4h-2z" />
          </svg>
        ),
      },
      {
        name: "Vivo",
        svg: (
          <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
            <path d="M4 8l4 8 4-8h-2l-2 4-2-4zM14 8h2v8h-2z" />
          </svg>
        ),
      },
      {
        name: "Realme",
        svg: (
          <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
            <circle cx="8" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M14 8h2v4l2-4h2l-2 4 2 4h-2l-2-4v4h-2z" />
          </svg>
        ),
      },
      {
        name: "Infinix",
        svg: (
          <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
            <path d="M4 8h3v8H4zM9 8h3v8H9zM14 8h3v8h-3zM14 11h2v2h-2zM19 8h2v8h-2z" />
          </svg>
        ),
      },
    ].map((brand) => (
      <a
  href="#products"
  className="brand-card"
  key={brand.name}
  onClick={() => {
    setSearch(brand.name);
    document
      .getElementById("products")
      ?.scrollIntoView({ behavior: "smooth" });
  }}
>
  <span className="brand-logo">{brand.svg}</span>
  <span className="brand-name">{brand.name}</span>
</a>
    ))}
  </div>
</section>
{/* ===== INSTAGRAM FEED ===== */}
<section className="instagram-section">
  <div className="section-head">
    <p className="eyebrow">— FOLLOW US</p>
    <h2>
      On <span className="gradient-text">Instagram</span>
    </h2>
    <p className="section-text">
      @awaisshakoor3 — Share your unboxing stories!
    </p>
  </div>

  <div className="instagram-grid">
    {[
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&h=400&fit=crop",
    ].map((img, idx) => (
      <a
  href="https://instagram.com/awaisshakoor3"
  target="_blank"
  rel="noopener noreferrer"
  className="insta-item"
  key={idx}
>
        <img src={img} alt={`Instagram post ${idx + 1}`} loading="lazy" />
        <div className="insta-overlay">
          <span>📷</span>
        </div>
      </a>
    ))}
  </div>

  <div className="insta-cta">
   <a
  href="https://instagram.com/awaisshakoor3"
  target="_blank"
  rel="noopener noreferrer"
  className="insta-btn"
>
  📷 Follow @awaisshakoor3
</a>
  </div>
</section>

   <footer className="site-footer">
  <div className="footer-container">
    {/* Top Row: Brand + Link Columns */}
    <div className="footer-main">
      {/* Brand Column */}
      <div className="footer-brand">
        <a href="#home" className="footer-logo">
          <span className="logo-mark">AM</span>
          <span className="logo-text">
            Awais<em> Mobile-Zone</em>
          </span>
        </a>
        <p className="footer-tagline">
          Pakistan's premium mobile store — quality phones, accessories,
          and unbeatable prices. Shop smart, live better.
        </p>

        {/* Social Icons */}
        <div className="footer-social">
          <a
            href="https://wa.me/923352494258"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            title="WhatsApp"
          >
            💬
          </a>
          <a
            href="https://instagram.com/awaisshakoor3"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            title="Instagram"
          >
            📷
          </a>
          <a
            href="https://facebook.com/awaisshakoor3"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            title="Facebook"
          >
            👍
          </a>
          <a
            href="https://twitter.com/awaisshakoor3"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            title="Twitter"
          >
            🐦
          </a>
        </div>
      </div>

      {/* Shop Column */}
      <div className="footer-col">
        <h4>Shop</h4>
        <a href="#products">All Products</a>
        <a href="#categories">Categories</a>
        <a href="#cart">My Cart</a>
        <a href="#products">New Arrivals</a>
        <a href="#products">Best Sellers</a>
      </div>

      {/* Support Column */}
      <div className="footer-col">
        <h4>Support</h4>
        <a href="#orders">Track Order</a>
        <a
          href="https://wa.me/923352494258"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact Us
        </a>
        <a href="#faq" onClick={(e) => {
          e.preventDefault();
          alert("📞 FAQ Section\n\nComing soon! For now, contact us:\n\nWhatsApp: 0335-2494258\nEmail: awaisshakoor133@gmail.com");
        }}>
          FAQ
        </a>
        <a href="#returns" onClick={(e) => {
          e.preventDefault();
          alert("↩️ Return Policy\n\n7-day easy returns on all products.\n\nFor returns, contact us:\nWhatsApp: 0335-2494258");
        }}>
          Returns
        </a>
        <a href="#shipping" onClick={(e) => {
          e.preventDefault();
          alert("🚚 Shipping Info\n\nFree shipping on orders above Rs. 5,000.\nDelivery time: 2-4 working days.");
        }}>
          Shipping Info
        </a>
      </div>

      {/* Contact Column */}
      <div className="footer-col">
        <h4>Get in Touch</h4>
        <a href="tel:+923352494258">📞+92335-2494258</a>
        <a href="mailto:awaisshakoor133@gmail.com">
          ✉️ awaisshakoor133@gmail.com
        </a>
        <span className="footer-address">
          📍 Badin, Pakistan
        </span>
        <a href="/admin" className="footer-admin-link">
          🔐 Admin Panel
        </a>
      </div>
    </div>

    {/* Newsletter Row */}
    <div className="footer-newsletter">
      <div className="newsletter-text">
        <h4>Stay Updated</h4>
        <p>Get the latest deals and new arrivals straight to your inbox.</p>
      </div>
      <form
        className="newsletter-form"
        onSubmit={(e) => {
          e.preventDefault();
          const email = e.target.email.value;
          if (email) {
            alert(`✅ Thank you for subscribing!\n\nWe'll send updates to: ${email}`);
            e.target.reset();
          }
        }}
      >
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
        />
        <button type="submit">Subscribe →</button>
      </form>
    </div>

    {/* Divider */}
    <div className="footer-divider"></div>

    {/* Bottom Row */}
    <div className="footer-bottom">
      <div className="footer-copyright">
        © 2026 <strong>Awais Mobile-Zone</strong>. All rights reserved.
      </div>
      <div className="footer-made">
        Made with <span className="heart">❤️</span> in Pakistan
      </div>
      <div className="footer-payments">
        <span title="Visa">💳</span>
        <span title="Bank">🏦</span>
        <span title="Cash">💰</span>
        <span title="COD">💵</span>
      </div>
    </div>
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