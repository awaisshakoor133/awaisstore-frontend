import { useState } from "react";
import {
  CloseIcon,
  CartIcon,
  WhatsAppIcon,
  LinkIcon,
  ShareIcon,
  EditIcon,
  PlusIcon,
} from "../components/StoreIcons";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { chatOnWhatsApp } from "../utils/whatsapp";

const STORE_URL = "https://awaisstore-frontend.vercel.app";

const PRIORITIES = [
  { value: "high", label: "High", color: "rose" },
  { value: "medium", label: "Medium", color: "accent" },
  { value: "low", label: "Low", color: "muted" },
];

const DEFAULT_TAGS = [
  "Gift Ideas",
  "For Later",
  "Favorites",
  "Buy Soon",
  "Window Shopping",
];

function WishlistPage({
  wishlist,
  toggleWishlist,
  addToCart,
  updateWishlistItem,
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("added");
  const [editingItem, setEditingItem] = useState(null);

  // ============ FILTER & SORT ============
  const filteredWishlist = wishlist
    .filter((item) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "high") return item.priority === "high";
      if (activeFilter === "medium") return item.priority === "medium";
      if (activeFilter === "low") return item.priority === "low";
      return item.tags?.includes(activeFilter);
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "priority") {
        const order = { high: 0, medium: 1, low: 2 };
        return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
      }
      // Default: date added (newest first)
      return new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
    });

  // ============ SHARE WISHLIST ON WHATSAPP ============
  const shareOnWhatsApp = () => {
    if (wishlist.length === 0) {
      toast.error("Wishlist is empty");
      return;
    }

    let message = `Assalam-o-Alaikum! 👋%0A%0A`;
    message += `Check out my wishlist on *Awais Mobile-Zone*:%0A%0A`;

    wishlist.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*%0A`;
      message += `   💰 Rs. ${item.price?.toLocaleString()}%0A`;
      if (item._id) {
        message += `   🔗 ${STORE_URL}/products/${item._id}%0A%0A`;
      }
    });

    message += `━━━━━━━━━━━━━━━%0A`;
    message += `🛍️ Shop now: ${STORE_URL}`;

    chatOnWhatsApp(message);
  };

  // ============ COPY WISHLIST LINK ============
  const copyLink = async () => {
    const link = `${STORE_URL}/wishlist`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied!");
    } catch (err) {
      const textarea = document.createElement("textarea");
      textarea.value = link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast.success("Link copied!");
    }
  };

  // ============ NATIVE SHARE ============
  const nativeShare = async () => {
    if (wishlist.length === 0) {
      toast.error("Wishlist is empty");
      return;
    }

    const shareData = {
      title: "My Wishlist — Awais Mobile-Zone",
      text: `Check out ${wishlist.length} ${
        wishlist.length === 1 ? "product" : "products"
      } on my wishlist!`,
      url: `${STORE_URL}/wishlist`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else {
      copyLink();
    }
  };

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
                  <linearGradient
                    id="heartGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#c8a04b" />
                    <stop offset="100%" stopColor="#e0bb6a" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="52" fill="#1e1b4b" opacity="0.08" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  stroke="url(#heartGrad)"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                  fill="none"
                />
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
          <>
            {/* SHARE BAR */}
            <div className="wishlist-share-bar">
              <div className="wishlist-share-info">
                <ShareIcon size={18} />
                <span>Share your wishlist with friends & family</span>
              </div>
              <div className="wishlist-share-actions">
                <button
                  className="wishlist-share-btn whatsapp"
                  onClick={shareOnWhatsApp}
                  title="Share on WhatsApp"
                >
                  <WhatsAppIcon size={16} />
                  <span>WhatsApp</span>
                </button>
                <button
                  className="wishlist-share-btn copy"
                  onClick={copyLink}
                  title="Copy link"
                >
                  <LinkIcon size={16} />
                  <span>Copy</span>
                </button>
                {typeof navigator !== "undefined" && navigator.share && (
                  <button
                    className="wishlist-share-btn native"
                    onClick={nativeShare}
                    title="Share"
                  >
                    <ShareIcon size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* FILTER & SORT BAR */}
            <div className="wishlist-toolbar">
              <div className="wishlist-filters">
                <button
                  className={`filter-chip ${
                    activeFilter === "all" ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter("all")}
                >
                  All ({wishlist.length})
                </button>
                <button
                  className={`filter-chip priority-high ${
                    activeFilter === "high" ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter("high")}
                >
                  High
                </button>
                <button
                  className={`filter-chip priority-medium ${
                    activeFilter === "medium" ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter("medium")}
                >
                  Medium
                </button>
                <button
                  className={`filter-chip priority-low ${
                    activeFilter === "low" ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter("low")}
                >
                  Low
                </button>
              </div>

              <select
                className="wishlist-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="added">Recently Added</option>
                <option value="priority">Priority</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* WISHLIST GRID */}
            {filteredWishlist.length === 0 ? (
              <div className="wishlist-empty-filter">
                <p>No items match this filter.</p>
                <button
                  className="filter-chip active"
                  onClick={() => setActiveFilter("all")}
                >
                  Show All
                </button>
              </div>
            ) : (
              <div className="wishlist-grid">
                {filteredWishlist.map((product) => (
                  <div className="wishlist-card" key={product._id}>
                    <div className="wishlist-img">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                        />
                      ) : (
                        <span>{product.icon}</span>
                      )}

                      {/* Priority Badge */}
                      {product.priority && (
                        <span
                          className={`wishlist-priority-badge priority-${product.priority}`}
                        >
                          {product.priority === "high" && "🔴 "}
                          {product.priority === "medium" && "🟡 "}
                          {product.priority === "low" && "🟢 "}
                          {PRIORITIES.find(
                            (p) => p.value === product.priority
                          )?.label || product.priority}
                        </span>
                      )}

                      <button
                        className="wishlist-remove"
                        onClick={() => toggleWishlist(product)}
                        title="Remove from wishlist"
                        aria-label="Remove from wishlist"
                      >
                        <CloseIcon size={14} />
                      </button>

                      <button
                        className="wishlist-edit-btn"
                        onClick={() => setEditingItem(product)}
                        title="Edit"
                        aria-label="Edit wishlist item"
                      >
                        <EditIcon size={14} />
                      </button>
                    </div>

                    <div className="wishlist-info">
                      <span className="wishlist-category">
                        {product.category}
                      </span>
                      <h3>{product.name}</h3>
                      <p className="wishlist-desc">{product.description}</p>

                      {/* Notes */}
                      {product.notes && (
                        <div className="wishlist-notes">
                          <span className="notes-icon">📝</span>
                          <span>{product.notes}</span>
                        </div>
                      )}

                      {/* Tags */}
                      {product.tags && product.tags.length > 0 && (
                        <div className="wishlist-tags">
                          {product.tags.map((tag) => (
                            <span className="wishlist-tag" key={tag}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

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
                        <CartIcon size={14} />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <Link to="/" className="empty-state-cta">
            ← Back to Store
          </Link>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingItem && (
        <EditWishlistModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(updates) => {
            updateWishlistItem(editingItem._id, updates);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

// ============ EDIT MODAL COMPONENT ============
function EditWishlistModal({ item, onClose, onSave }) {
  const [priority, setPriority] = useState(item.priority || "medium");
  const [notes, setNotes] = useState(item.notes || "");
  const [tags, setTags] = useState(item.tags || []);
  const [customTag, setCustomTag] = useState("");

  const toggleTag = (tag) => {
    setTags(tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]);
  };

  const addCustomTag = () => {
    const trimmed = customTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setCustomTag("");
    }
  };

  const handleSave = () => {
    onSave({ priority, notes, tags });
  };

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <div>
            <p className="eyebrow">— EDIT ITEM</p>
            <h3>{item.name}</h3>
          </div>
          <button className="edit-modal-close" onClick={onClose}>
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Priority */}
        <div className="edit-modal-section">
          <label>Priority</label>
          <div className="priority-options">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                className={`priority-option priority-${p.value} ${
                  priority === p.value ? "active" : ""
                }`}
                onClick={() => setPriority(p.value)}
              >
                {p.value === "high" && "🔴 "}
                {p.value === "medium" && "🟡 "}
                {p.value === "low" && "🟢 "}
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="edit-modal-section">
          <label>Notes</label>
          <textarea
            placeholder="e.g. Birthday gift for Ali"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={200}
            rows={3}
          />
          <span className="char-count">{notes.length} / 200</span>
        </div>

        {/* Tags */}
        <div className="edit-modal-section">
          <label>Tags</label>
          <div className="tag-options">
            {DEFAULT_TAGS.map((tag) => (
              <button
                key={tag}
                className={`tag-option ${tags.includes(tag) ? "active" : ""}`}
                onClick={() => toggleTag(tag)}
              >
                #{tag}
              </button>
            ))}
            {tags
              .filter((t) => !DEFAULT_TAGS.includes(t))
              .map((tag) => (
                <button
                  key={tag}
                  className="tag-option active"
                  onClick={() => toggleTag(tag)}
                >
                  #{tag} ×
                </button>
              ))}
          </div>

          {/* Custom Tag Input */}
          <div className="custom-tag-input">
            <input
              type="text"
              placeholder="Add custom tag..."
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomTag();
                }
              }}
              maxLength={20}
            />
            <button type="button" onClick={addCustomTag} disabled={!customTag.trim()}>
              <PlusIcon size={14} />
            </button>
          </div>
        </div>

        <div className="edit-modal-actions">
          <button className="edit-modal-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="edit-modal-btn save" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default WishlistPage;