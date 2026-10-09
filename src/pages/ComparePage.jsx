import { Link } from "react-router-dom";
import { useCompare } from "../context/CompareContext";
import { useCart } from "../context/CartContext";
import {
  CartIcon,
  CloseIcon,
  TrashIcon,
  ArrowLeftIcon,
  CheckIcon,
} from "../components/StoreIcons";

function ComparePage() {
  const { items, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  // Empty state
  if (items.length === 0) {
    return (
      <section className="compare-page">
        <div className="empty-state">
          <div className="empty-icon-svg">
            <svg viewBox="0 0 120 120" fill="none">
              <defs>
                <linearGradient id="compareGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c8a04b" />
                  <stop offset="100%" stopColor="#e0bb6a" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="52" fill="#1e1b4b" opacity="0.08" />
              <circle cx="60" cy="60" r="52" stroke="url(#compareGrad)" strokeWidth="1.5" strokeDasharray="4 6" fill="none" />
              <path
                d="M40 45h40M40 60h30M40 75h40"
                stroke="url(#compareGrad)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h3>No products to compare</h3>
          <p>Add products to compare their features side-by-side.</p>
          <Link to="/products" className="empty-state-cta">
            Browse Products <span>→</span>
          </Link>
        </div>
      </section>
    );
  }

  // Get all unique keys for comparison
  const compareFields = [
    { key: "image", label: "Image", type: "image" },
    { key: "price", label: "Price", type: "price" },
    { key: "oldPrice", label: "Original Price", type: "oldPrice" },
    { key: "category", label: "Category", type: "text" },
    { key: "description", label: "Description", type: "text" },
  ];

  // Find lowest price
  const lowestPrice = Math.min(...items.map((p) => p.price));

  return (
    <section className="compare-page">
      {/* Header */}
      <div className="compare-header">
        <button className="back-btn" onClick={() => window.history.back()}>
          <ArrowLeftIcon size={16} />
          <span>Back</span>
        </button>

        <div className="compare-header-info">
          <p className="eyebrow">— SIDE BY SIDE</p>
          <h1>Compare Products</h1>
          <p className="muted">
            {items.length} of 3 products selected
          </p>
        </div>

        <button className="clear-compare-btn" onClick={clearCompare}>
          <TrashIcon size={14} />
          <span>Clear All</span>
        </button>
      </div>

      {/* Compare Grid */}
      <div className="compare-grid-wrap">
        <div className="compare-grid" style={{ "--item-count": items.length }}>
          {/* Product Cards */}
          {items.map((product) => (
            <div className="compare-card" key={product._id}>
              <button
                className="compare-remove-btn"
                onClick={() => removeFromCompare(product._id)}
                aria-label="Remove from compare"
              >
                <CloseIcon size={14} />
              </button>

              {/* Image */}
              <div className="compare-img">
                {product.image ? (
                  <img src={product.image} alt={product.name} loading="lazy" />
                ) : (
                  <span>{product.icon}</span>
                )}
                {product.price === lowestPrice && items.length > 1 && (
                  <span className="best-price-badge">
                    <CheckIcon size={12} />
                    Best Price
                  </span>
                )}
              </div>

              {/* Name */}
              <div className="compare-info">
                <span className="compare-category">{product.category}</span>
                <h3>{product.name}</h3>

                {/* Price */}
                <div className="compare-price">
                  <strong>Rs. {product.price?.toLocaleString()}</strong>
                  {product.oldPrice && (
                    <del>Rs. {product.oldPrice?.toLocaleString()}</del>
                  )}
                </div>

                {/* Description */}
                <p className="compare-desc">{product.description}</p>

                {/* Add to Cart */}
                <button
                  className="compare-add-btn"
                  onClick={() => addToCart(product)}
                >
                  <CartIcon size={16} />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}

          {/* Empty Slots */}
          {items.length < 3 &&
            Array.from({ length: 3 - items.length }).map((_, i) => (
              <div className="compare-card compare-card-empty" key={`empty-${i}`}>
                <div className="compare-empty-content">
                  <div className="compare-empty-icon">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                  <p>Add another product</p>
                  <Link to="/products" className="compare-empty-link">
                    Browse Products
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="compare-table-wrap">
        <h2>Detailed Comparison</h2>
        <div className="compare-table-scroll">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Feature</th>
                {items.map((p) => (
                  <th key={p._id}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Price</td>
                {items.map((p) => (
                  <td key={p._id} className={p.price === lowestPrice ? "best" : ""}>
                    Rs. {p.price?.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Original Price</td>
                {items.map((p) => (
                  <td key={p._id}>
                    {p.oldPrice ? `Rs. ${p.oldPrice.toLocaleString()}` : "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Discount</td>
                {items.map((p) => (
                  <td key={p._id}>
                    {p.oldPrice
                      ? `${Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}% OFF`
                      : "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Category</td>
                {items.map((p) => (
                  <td key={p._id}>{p.category}</td>
                ))}
              </tr>
              <tr>
                <td>Description</td>
                {items.map((p) => (
                  <td key={p._id} className="compare-desc-cell">
                    {p.description}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="compare-cta-wrap">
        <Link to="/products" className="compare-cta">
          Continue Shopping <span>→</span>
        </Link>
      </div>
    </section>
  );
}

export default ComparePage;