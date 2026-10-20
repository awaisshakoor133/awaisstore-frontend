import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useRecentlyViewed } from "../context/RecentlyViewedContext";
import { ClockIcon, CloseIcon, ArrowRightIcon } from "./StoreIcons";

function RecentlyViewed({ excludeId, max = 12, title = "Recently Viewed" }) {
  const { items, clearRecentlyViewed, removeFromRecentlyViewed } =
    useRecentlyViewed();

  const display = items.filter((p) => p._id !== excludeId).slice(0, max);

  if (display.length === 0) return null;

  const handleClear = () => {
    if (window.confirm("Clear all recently viewed products?")) {
      clearRecentlyViewed();
      toast.success("History cleared");
    }
  };

  const handleRemove = (id, name, e) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromRecentlyViewed(id);
    toast.success(`${name} removed from history`);
  };

  return (
    <section className="recently-viewed-section">
      <div className="section-head recently-viewed-head">
        <div>
          <p className="eyebrow">— YOUR HISTORY</p>
          <h2>
            <ClockIcon size={22} /> {title}
          </h2>
          <p className="recently-viewed-count">
            {display.length} {display.length === 1 ? "product" : "products"}
          </p>
        </div>
        <button
          className="clear-recently-btn"
          onClick={handleClear}
          title="Clear history"
        >
          <CloseIcon size={14} />
          <span>Clear All</span>
        </button>
      </div>

      <div className="recently-viewed-grid">
        {display.map((p) => (
          <Link
            to={`/products/${p._id}`}
            className="recently-viewed-card"
            key={p._id}
          >
            <button
              className="recently-remove-btn"
              onClick={(e) => handleRemove(p._id, p.name, e)}
              aria-label="Remove from history"
              title="Remove"
            >
              <CloseIcon size={12} />
            </button>

            <div className="recently-viewed-img">
              {p.image ? (
                <img src={p.image} alt={p.name} loading="lazy" />
              ) : (
                <span>{p.icon}</span>
              )}
            </div>

            <div className="recently-viewed-info">
              <h4>{p.name}</h4>
              <div className="recently-viewed-footer">
                <strong>Rs. {p.price?.toLocaleString()}</strong>
                <span className="recently-view-icon">
                  <ArrowRightIcon size={14} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default RecentlyViewed;