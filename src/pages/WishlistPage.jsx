import { Link } from "react-router-dom";

function WishlistPage({ wishlist, toggleWishlist, addToCart }) {
  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <div className="section-head">
          <p className="eyebrow">— YOUR FAVORITES</p>
          <h2>
            My <span className="gradient-text">Wishlist</span>
          </h2>
          <p className="section-text">
            {wishlist.length === 0
              ? "You haven't added anything yet."
              : `${wishlist.length} ${
                  wishlist.length === 1 ? "item" : "items"
                } saved`}
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-svg">
              <svg viewBox="0 0 120 120" fill="none">
                <defs>
                  <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c8a04b" />
                    <stop offset="100%" stopColor="#e0bb6a" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="52" fill="#1e1b4b" opacity="0.08" />
                <circle cx="60" cy="60" r="52" stroke="url(#heartGrad)" strokeWidth="1.5" strokeDasharray="4 6" fill="none" />
                <path
                  d="M60 88 L38 66 C30 58 30 46 38 38 C46 30 58 30 60 42 C62 30 74 30 82 38 C90 46 90 58 82 66 Z"
                  fill="url(#heartGrad)"
                  opacity="0.7"
                />
              </svg>
            </div>
            <h3>Your wishlist is empty</h3>
            <p>Start adding products you love!</p>
            <Link to="/" className="empty-state-cta">
              Browse Products <span>→</span>
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((product) => (
              <div className="wishlist-card" key={product._id}>
                <button
                  className="wishlist-remove"
                  onClick={() => toggleWishlist(product)}
                >
                  ✕
                </button>

                <div className="wishlist-img">
                  {product.image ? (
                    <img src={product.image} alt={product.name} loading="lazy" />
                  ) : (
                    <span>{product.icon}</span>
                  )}
                </div>

                <div className="wishlist-info">
                  <span className="wishlist-category">{product.category}</span>
                  <h3>{product.name}</h3>
                  <p className="wishlist-desc">{product.description}</p>

                  <div className="wishlist-price">
                    <strong>Rs. {product.price.toLocaleString()}</strong>
                    {product.oldPrice && (
                      <del>Rs. {product.oldPrice.toLocaleString()}</del>
                    )}
                  </div>

                  <button
                    className="wishlist-add-btn"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart 🛒
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <Link to="/" className="empty-state-cta">
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}

export default WishlistPage;