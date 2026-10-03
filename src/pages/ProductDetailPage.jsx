import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  CartIcon,
  HeartIcon,
  WhatsAppIcon,
  ArrowLeftIcon,
  TruckIcon,
  ReturnIcon,
  ShieldCheckIcon,
  PlusIcon,
  MinusIcon,
} from "../components/StoreIcons";
import { orderProductOnWhatsApp } from "../utils/whatsapp";
import { useCart } from "../context/CartContext";
import ProductReviews from "../components/ProductReviews";

const API = import.meta.env.VITE_API_URL;

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API}/products`)
      .then((res) => {
        const found = res.data.find((p) => p._id === id);
        if (!found) {
          toast.error("Product not found");
          navigate("/products");
          return;
        }
        setProduct(found);

        const related = res.data
          .filter((p) => p.category === found.category && p._id !== found._id)
          .slice(0, 4);
        setRelatedProducts(related);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load product");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} — Rs. ${product.price?.toLocaleString()} | Awais Mobile-Zone`;

      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content =
        product.description ||
        `Buy ${product.name} at best price in Pakistan. Free shipping, COD available.`;

      const ogTags = [
        { property: "og:title", content: product.name },
        { property: "og:description", content: product.description },
        { property: "og:image", content: product.image },
        { property: "og:type", content: "product" },
      ];

      ogTags.forEach(({ property, content }) => {
        if (!content) return;
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement("meta");
          tag.setAttribute("property", property);
          document.head.appendChild(tag);
        }
        tag.content = content;
      });
    }
  }, [product]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Check out ${product.name} on Awais Mobile-Zone`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  if (loading) {
    return (
      <section className="product-detail-page">
        <div className="empty-state">
          <h3>Loading product...</h3>
        </div>
      </section>
    );
  }

  if (!product) return null;

  const inWishlist = isInWishlist(product._id);

  return (
    <section className="product-detail-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>›</span>
        <Link to="/products">Products</Link>
        <span>›</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeftIcon size={16} />
        <span>Back</span>
      </button>

      <div className="product-detail-grid">
        <div className="product-detail-image">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <span className="product-detail-icon">{product.icon}</span>
          )}
          <span className="product-detail-category">{product.category}</span>
        </div>

        <div className="product-detail-info">
          <p className="eyebrow">— PRODUCT DETAILS</p>
          <h1>{product.name}</h1>

          <div className="product-detail-rating">
            <span className="stars">★★★★★</span>
            <span className="rating-count">(4.8)</span>
          </div>

          <p className="product-detail-desc">{product.description}</p>

          <div className="product-detail-price">
            <strong>Rs. {product.price?.toLocaleString()}</strong>
            {product.oldPrice && (
              <del>Rs. {product.oldPrice?.toLocaleString()}</del>
            )}
          </div>

          <div className="quantity-section">
            <label>Quantity</label>
            <div className="quantity-controls">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease"
              >
                <MinusIcon size={14} />
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase"
              >
                <PlusIcon size={14} />
              </button>
            </div>
          </div>

          <div className="product-detail-actions">
            <button className="add-btn" onClick={handleAddToCart}>
              <CartIcon size={18} />
              <span>Add to Cart</span>
            </button>

            <button
              className="wishlist-toggle-btn"
              onClick={() => toggleWishlist(product)}
              aria-label="Toggle wishlist"
            >
              <HeartIcon size={20} filled={inWishlist} />
            </button>
          </div>

          <button
            className="whatsapp-order-btn"
            onClick={() => orderProductOnWhatsApp(product)}
          >
            <WhatsAppIcon size={18} />
            <span>Order on WhatsApp</span>
          </button>

          <button className="share-btn" onClick={shareProduct}>
            Share this product
          </button>

          <ul className="product-detail-features">
            <li>
              <TruckIcon size={20} />
              <span>Free Shipping over Rs. 5,000</span>
            </li>
            <li>
              <ReturnIcon size={20} />
              <span>7-Day Easy Returns</span>
            </li>
            <li>
              <ShieldCheckIcon size={20} />
              <span>1 Year Warranty</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="product-reviews-section">
        <ProductReviews productId={product._id} />
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-products">
          <div className="section-head">
            <p className="eyebrow">— YOU MAY ALSO LIKE</p>
            <h2>
              Related <span className="gradient-text">Products</span>
            </h2>
          </div>

          <div className="related-grid">
            {relatedProducts.map((p) => (
              <Link
                to={`/products/${p._id}`}
                className="related-card"
                key={p._id}
              >
                <div className="related-img">
                  {p.image ? (
                    <img src={p.image} alt={p.name} loading="lazy" />
                  ) : (
                    <span>{p.icon}</span>
                  )}
                </div>
                <h4>{p.name}</h4>
                <strong>Rs. {p.price?.toLocaleString()}</strong>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default ProductDetailPage;