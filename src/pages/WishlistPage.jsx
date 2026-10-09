import {
  CloseIcon,
  CartIcon,
  HeartFilledIcon,
  WhatsAppIcon,
  LinkIcon,
  ShareIcon,
} from "../components/StoreIcons";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { chatOnWhatsApp } from "../utils/whatsapp";

const STORE_URL = "https://awaisstore-frontend.vercel.app";

function WishlistPage({ wishlist, toggleWishlist, addToCart }) {
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
      toast.success("Link copied to clipboard!");
    } catch (err) {
      // Fallback
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
      text: `Check out ${wishlist.length} ${wishlist.length === 1 ? "product" : "products"} on my wishlist!`,
      url: `${STORE_URL}/wishlist`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled
      }
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
          <>
            {/* SHARE BAR */}
            <div className="wishlist-share-bar">
              <div className="wishlist-share-info">
                <ShareIcon size={18} />
                <span>
                  Share your wishlist with friends & family
                </span>
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

            <div className="wishlist-grid">
              {wishlist.map((product) => (
                <div className="wishlist-card" key={product._id}>
  <div className="wishlist-img">
    {product.image ? (
      <img src={product.image} alt={product.name} loading="lazy" />
    ) : (
      <span>{product.icon}</span>
    )}

    {/* Remove button — IMAGE ke andar */}
    <button
      className="wishlist-remove"
      onClick={() => toggleWishlist(product)}
      title="Remove from wishlist"
      aria-label="Remove from wishlist"
    >
      <CloseIcon size={14} />
    </button>
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
      <CartIcon size={14} />
      <span>Add to Cart</span>
    </button>
  </div>
</div>
              ))}
            </div>
          </>
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