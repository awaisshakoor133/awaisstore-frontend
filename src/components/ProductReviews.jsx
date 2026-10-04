import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useReviews } from "../context/ReviewsContext";
import {
  StarIcon,
  ThumbsUpIcon,
  CheckCircleIcon,
   EditIcon, 
} from "./StoreIcons";

const API = import.meta.env.VITE_API_URL;

function ProductReviews({ productId }) {
  const { user } = useAuth();
  const { fetchReviews, addReview, getCached, isLoading } = useReviews();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  // Get from cache or fetch
  const cached = getCached(productId);
  const reviews = cached?.reviews || [];
  const stats = cached?.stats || {
    total: 0,
    avgRating: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  };
  const loading = isLoading(productId) || !cached;

  // Fetch on mount if not cached
  useEffect(() => {
    if (productId) {
      fetchReviews(productId);
    }
  }, [productId, fetchReviews]);
  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to write a review");
      return;
    }

    const loadingToast = toast.loading("Posting review...");

    try {
      await axios.post(`${API}/reviews`, {
        product: productId,
        user: user._id,
        userName: user.name,
        userEmail: user.email,
        rating: Number(form.rating),
        title: form.title,
        comment: form.comment,
      });

           toast.success("Review posted!", { id: loadingToast });
      setForm({ rating: 5, title: "", comment: "" });
      setShowForm(false);
      fetchReviews(productId, true);  // force refresh
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to post", {
        id: loadingToast,
      });
    }
  };

  const handleHelpful = async (reviewId) => {
    const identifier = user?.email || `guest-${Date.now()}`;
    try {
           await axios.post(`${API}/reviews/${reviewId}/helpful`, {
        userIdentifier: identifier,
      });
      fetchReviews(productId, true);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) return <p className="muted">Loading reviews...</p>;

  return (
    <div className="product-reviews">
      <div className="reviews-header">
        <h3>Customer Reviews</h3>
        {!showForm && (
          <button
  className="write-review-btn"
  onClick={() => {
    if (!user) {
      toast.error("Please login to write a review");
      return;
    }
    setShowForm(true);
  }}
>
  <EditIcon size={16} />
  <span>Write a Review</span>
</button>
        )}
      </div>

      {/* Stats */}
      <div className="reviews-stats">
        <div className="reviews-avg">
          <div className="avg-number">{stats.avgRating.toFixed(1)}</div>
          <div className="avg-stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <StarIcon
                key={s}
                size={16}
                filled={s <= Math.round(stats.avgRating)}
              />
            ))}
          </div>
          <div className="avg-total">{stats.total} reviews</div>
        </div>

        <div className="reviews-breakdown">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.breakdown[star] || 0;
            const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <div className="breakdown-row" key={star}>
                <span className="breakdown-label">{star} ★</span>
                <div className="breakdown-bar">
                  <div
                    className="breakdown-fill"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <span className="breakdown-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <h4>Write Your Review</h4>

          <div className="field">
            <label>Rating</label>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  className={`rating-star ${s <= form.rating ? "active" : ""}`}
                  onClick={() => setForm({ ...form, rating: s })}
                >
                  <StarIcon size={24} filled={s <= form.rating} />
                </button>
              ))}
              <span className="rating-text">
                {form.rating} / 5
              </span>
            </div>
          </div>

          <div className="field">
            <label>Title (optional)</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Summarize your review"
              maxLength={80}
            />
          </div>

          <div className="field">
            <label>Your Review</label>
            <textarea
              name="comment"
              value={form.comment}
              onChange={handleChange}
              placeholder="Share your experience..."
              maxLength={1000}
              required
            />
          </div>

          <div className="review-form-actions">
            <button type="submit" className="place-order-btn">
              Post Review
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="no-reviews">
          <p>No reviews yet.</p>
          <p className="muted">Be the first to review!</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div className="review-item" key={review._id}>
              <div className="review-item-header">
                <div className="review-avatar-circle">
                  {review.userName.charAt(0).toUpperCase()}
                </div>
                <div className="review-user-info">
                  <div className="review-user-top">
                    <strong>{review.userName}</strong>
                    {review.isVerifiedPurchase && (
                      <span className="verified-badge">
                        <CheckCircleIcon size={12} />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="review-stars-row">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <StarIcon
                        key={s}
                        size={14}
                        filled={s <= review.rating}
                      />
                    ))}
                    <span className="review-date">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {review.title && (
                <h5 className="review-item-title">{review.title}</h5>
              )}

              <p className="review-item-comment">{review.comment}</p>

              <button
                className="helpful-btn"
                onClick={() => handleHelpful(review._id)}
              >
                <ThumbsUpIcon size={14} />
                Helpful ({review.helpfulCount})
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductReviews;