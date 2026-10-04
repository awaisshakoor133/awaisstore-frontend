import { Link } from "react-router-dom";
import { useRecentlyViewed } from "../context/RecentlyViewedContext";
import { ClockIcon, CloseIcon } from "./StoreIcons";

function RecentlyViewed({ excludeId, max = 4, title = "Recently Viewed" }) {
  const { items, clearRecentlyViewed, removeFromRecentlyViewed } =
    useRecentlyViewed();

  const display = items.filter((p) => p._id !== excludeId).slice(0, max);

  if (display.length === 0) return null;

  return (
    <section className="recently-viewed-section">
      <div className="section-head recently-viewed-head">
        <div>
          <p className="eyebrow">— YOUR HISTORY</p>
          <h2>
            <ClockIcon size={22} /> {title}
          </h2>
        </div>
        <button
          className="clear-recently-btn"
          onClick={clearRecentlyViewed}
          title="Clear history"
        >
          Clear
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeFromRecentlyViewed(p._id);
              }}
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
              <strong>Rs. {p.price?.toLocaleString()}</strong>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default RecentlyViewed;