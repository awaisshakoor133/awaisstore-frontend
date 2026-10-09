import { Link } from "react-router-dom";
import {
  TruckIcon,
  LockIcon,
  ReturnIcon,
  ChatIcon,
  CashIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  BadgeCheckIcon,
  SparklesIcon,         
  ShieldCheckIconSmall,
  FireIcon,
  CartIcon,
  CheckIcon,
  MailIcon, 
} from "../components/StoreIcons";
import { useState } from "react";
import RecentlyViewed from "../components/RecentlyViewed";

function StoreHome({ products, addToCart, openProduct }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setSubscribed(true);
      setLoading(false);
      setEmail("");
    }, 1000);
  };

  return (
    <>
      {/* HERO */}
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
            <Link to="/products" className="shop-btn">
              Shop Now <span>→</span>
            </Link>
            <Link to="/categories" className="ghost-btn">
              Explore Categories
            </Link>
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
      src="https://images.unsplash.com/photo-1575695342320-d2d2d2f9b73f?w=600&auto=format&fit=crop&q=60"
      alt="Awais Mobile-Zone"
      className="hero-img"
    />
  </div>

  <div className="floating-tag tag-1">
    <SparklesIcon size={16} />
    <span>Free Shipping</span>
  </div>

  <div className="floating-tag tag-2">
    <ShieldCheckIconSmall size={16} />
    <span>Secure Payment</span>
  </div>
</div>
      </section>

       {/* TRUST BADGES BAR */}
      <section className="trust-badges-bar">
        <div className="trust-badges-container">
          <div className="trust-badge">
            <div className="trust-badge-icon">
              <TruckIcon size={22} />
            </div>
            <div className="trust-badge-text">
              <strong>Free Shipping</strong>
              <span>On orders above Rs. 5,000</span>
            </div>
          </div>

          <div className="trust-badge">
            <div className="trust-badge-icon">
              <LockIcon size={22} />
            </div>
            <div className="trust-badge-text">
              <strong>Secure Payment</strong>
              <span>256-bit SSL encrypted</span>
            </div>
          </div>

          <div className="trust-badge">
            <div className="trust-badge-icon">
              <ReturnIcon size={22} />
            </div>
            <div className="trust-badge-text">
              <strong>7-Day Returns</strong>
              <span>Easy returns & refunds</span>
            </div>
          </div>

          <div className="trust-badge">
            <div className="trust-badge-icon">
              <ChatIcon size={22} />
            </div>
            <div className="trust-badge-text">
              <strong>24/7 Support</strong>
              <span>Always here to help</span>
            </div>
          </div>
        </div>
      </section>


      {/* WHY CHOOSE US */}
      <section className="features-section">
        <div className="features-header">
          <p className="eyebrow">— WHY CHOOSE US</p>
          <h2>
            Everything You Need, <br />
            All in <span className="gradient-text">One Place</span>
          </h2>
          <p className="features-subtitle">
            We're committed to giving you the best shopping experience.
          </p>
        </div>

        <div className="features-grid">
  {/* Feature 1: Free Shipping */}
  <div className="feature-block">
    <div className="feature-icon-wrap">
      <TruckIcon size={36} />
    </div>
    <div className="feature-content">
      <h3>Free Shipping</h3>
      <p>Free home delivery on all orders above Rs. 5,000.</p>
      <Link to="/products" className="feature-link">
        Start Shopping <span>→</span>
      </Link>
    </div>
  </div>

  {/* Feature 2: Secure Payment */}
  <div className="feature-block">
    <div className="feature-icon-wrap">
      <LockIcon size={36} />
    </div>
    <div className="feature-content">
      <h3>100% Secure Payment</h3>
      <p>Your payment is protected with 256-bit SSL encryption.</p>
      <a
        href="#secure"
        className="feature-link"
        onClick={(e) => {
          e.preventDefault();
          alert("100% Secure Payment\n\n256-bit SSL\nCOD available");
        }}
      >
        Learn More <span>→</span>
      </a>
    </div>
  </div>

  {/* Feature 3: Easy Returns */}
  <div className="feature-block">
    <div className="feature-icon-wrap">
      <ReturnIcon size={36} />
    </div>
    <div className="feature-content">
      <h3>7-Day Easy Returns</h3>
      <p>Return within 7 days for a full refund.</p>
      <a
        href="#returns"
        className="feature-link"
        onClick={(e) => {
          e.preventDefault();
          alert("7-Day Return Policy\n\nFull refund");
        }}
      >
        Return Policy <span>→</span>
      </a>
    </div>
  </div>

  {/* Feature 4: 24/7 Support */}
  <div className="feature-block">
    <div className="feature-icon-wrap">
      <ChatIcon size={36} />
    </div>
    <div className="feature-content">
      <h3>24/7 Customer Support</h3>
      <p>Our team is always here to help you.</p>
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
      <CashIcon size={36} />
    </div>
    <div className="feature-content">
      <h3>Cash on Delivery</h3>
      <p>Pay only when you receive your order.</p>
      <Link to="/products" className="feature-link">
        Order Now <span>→</span>
      </Link>
    </div>
  </div>

  {/* Feature 6: EMI Plans */}
  <div className="feature-block">
    <div className="feature-icon-wrap">
      <CreditCardIcon size={36} />
    </div>
    <div className="feature-content">
      <h3>Easy EMI Plans</h3>
      <p>Flexible 3, 6, or 12-month installments.</p>
      <a
        href="#emi"
        className="feature-link"
        onClick={(e) => {
          e.preventDefault();
          alert("Easy EMI Plans\n\n3, 6, 12-month");
        }}
      >
        View Plans <span>→</span>
      </a>
    </div>
  </div>

  {/* Feature 7: Warranty */}
  <div className="feature-block">
    <div className="feature-icon-wrap">
      <ShieldCheckIcon size={36} />
    </div>
    <div className="feature-content">
      <h3>1 Year Warranty</h3>
      <p>Official brand warranty on all products.</p>
      <a
        href="#warranty"
        className="feature-link"
        onClick={(e) => {
          e.preventDefault();
          alert("1 Year Warranty");
        }}
      >
        Warranty Info <span>→</span>
      </a>
    </div>
  </div>

  {/* Feature 8: Original Products */}
  <div className="feature-block">
    <div className="feature-icon-wrap">
      <BadgeCheckIcon size={36} />
    </div>
    <div className="feature-content">
      <h3>100% Original Products</h3>
      <p>Authentic products from official distributors.</p>
      <Link to="/products" className="feature-link">
        Shop Authentic <span>→</span>
      </Link>
    </div>
  </div>
</div>
      </section>

      {/* CATEGORIES */}
      <section className="categories">
        <div className="section-head">
          <p className="eyebrow">— BROWSE CATEGORIES</p>
          <h2>Shop By <span className="gradient-text">Category</span></h2>
        </div>

        <div className="category-container">
          {[
            { title: "Smartphones", desc: "iPhone, Samsung & more", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop", count: "120+ Products" },
            { title: "Smartwatches", desc: "Apple Watch, Galaxy Watch", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&h=500&fit=crop", count: "45+ Products" },
            { title: "Accessories", desc: "Cases, Chargers & More", image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500&h=500&fit=crop", count: "200+ Products" },
            { title: "Audio", desc: "Earbuds, Headphones", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop", count: "60+ Products" },
          ].map((c) => (
            <Link to="/products" className="category-card-new" key={c.title}>
              <div className="category-image">
                <img src={c.image} alt={c.title} loading="lazy" />
                <div className="category-overlay"><span className="category-count">{c.count}</span></div>
              </div>
              <div className="category-info">
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
                <span className="category-shop-link">Shop Now →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* OFFERS BANNER */}
      <section className="offers-banner">
        <div className="offers-container">
          <div className="offers-content">
            <p className="offers-eyebrow">
  <FireIcon size={14} /> LIMITED TIME OFFER
</p>
            <h2>Mega Sale — Up to <span className="offers-discount">50% OFF</span></h2>
            <p className="offers-text">Hurry! Big discounts on all smartphones, smartwatches, and accessories.</p>
            <div className="offers-timer">
              <div className="timer-box"><span className="timer-value">02</span><span className="timer-label">Days</span></div>
              <div className="timer-box"><span className="timer-value">14</span><span className="timer-label">Hours</span></div>
              <div className="timer-box"><span className="timer-value">35</span><span className="timer-label">Mins</span></div>
              <div className="timer-box"><span className="timer-value">48</span><span className="timer-label">Secs</span></div>
            </div>
            <Link to="/products" className="offers-cta">Shop Sale <span>→</span></Link>
          </div>
          <div className="offers-image">
            <img src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=600&fit=crop" alt="Mega Sale" />
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="best-sellers">
        <div className="section-head">
          <p className="eyebrow">— TOP RATED</p>
          <h2>Best <span className="gradient-text">Sellers</span></h2>
        </div>
        <div className="bestseller-container">
          {products.slice(0, 4).map((product) => (
            <div className="bestseller-card" key={product._id} onClick={() => openProduct(product)}>
              <span className="bestseller-badge">
  <FireIcon size={12} /> Best Seller
</span>
              <div className="bestseller-img">
                {product.image ? <img src={product.image} alt={product.name} loading="lazy" /> : <span>{product.icon}</span>}
              </div>
              <div className="bestseller-info">
                <span className="bestseller-category">{product.category}</span>
                <h3>{product.name}</h3>
                <p className="bestseller-desc">{product.description}</p>
                <div className="bestseller-rating"><span className="stars">★★★★★</span><span className="rating-count">(4.8)</span></div>
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
  Add <CartIcon size={14} />
</button>                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

     <RecentlyViewed max={6} title="Recently Viewed" />

{/* REVIEWS */}
<section className="reviews-section">
        <div className="section-head">
          <p className="eyebrow">— TESTIMONIALS</p>
          <h2>What Our <span className="gradient-text">Customers Say</span></h2>
          
        </div>
        <div className="reviews-container">
          {[
            { name: "Ahmed Khan", location: "Karachi", text: "Amazing experience! iPhone original nikla aur delivery bhi 2 din mein.", avatar: "AK" },
            { name: "Fatima Ali", location: "Lahore", text: "Best prices online! Samsung watch ka warranty original hai.", avatar: "FA" },
            { name: "Hassan Raza", location: "Islamabad", text: "Cash on delivery ne mera trust jeet liya.", avatar: "HR" },
            { name: "Sara Malik", location: "Faisalabad", text: "Pehla order tha aur bilkul satisfied hoon.", avatar: "SM" },
          ].map((r) => (
            <div className="review-card" key={r.name}>
              <div className="review-stars">★★★★★</div>
              <p className="review-text">"{r.text}"</p>
              <div className="review-author">
                <div className="review-avatar">{r.avatar}</div>
                <div><h4>{r.name}</h4><p className="review-location">{r.location}</p></div>
              </div>
              <div className="review-quote">"</div>
            </div>
          ))}
        </div>
      </section>
    {/* NEWSLETTER */}
      <section className="newsletter-section">
        <div className="newsletter-container">
          <div className="newsletter-content">
            <p className="eyebrow">— STAY UPDATED</p>
            <h2>
              Get <span className="gradient-text">10% OFF</span>
              <br />
              your first order
            </h2>
            <p className="newsletter-text">
              Subscribe to our newsletter for exclusive deals, new arrivals,
              and special offers delivered to your inbox.
            </p>

            {subscribed ? (
              <div className="newsletter-success">
                <CheckIcon size={20} />
                <div>
                  <strong>You're subscribed!</strong>
                  <p>Check your email for the 10% discount code.</p>
                </div>
              </div>
            ) : (
              <form className="newsletter-form" onSubmit={handleSubscribe}>
                <div className="newsletter-input-wrap">
                  <MailIcon size={18} />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            )}

            <p className="newsletter-note">
              <LockIcon size={12} />
              <span>We respect your privacy. Unsubscribe anytime.</span>
            </p>
          </div>

          <div className="newsletter-image">
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=60"
              alt="Special Offer"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section className="brands-section">
        <div className="section-head">
          <p className="eyebrow">— OFFICIAL PARTNERS</p>
          <h2>Trusted <span className="gradient-text">Brands</span></h2>
        </div>
        <div className="brands-container">
          {["Apple", "Samsung", "OnePlus", "Xiaomi", "Oppo", "Vivo", "Realme", "Infinix"].map((b) => (
            <Link to="/products" className="brand-card" key={b}>
              <span className="brand-logo">{b}</span>
              <span className="brand-name">{b}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export default StoreHome;