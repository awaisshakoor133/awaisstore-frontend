import {
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
  TrashIcon,
  CalendarSmallIcon,
  ThumbsUpSmallIcon,
  BadgeCheckSmallIcon,
} from "../components/AdminIcons";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL;

function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API}/reviews`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Reviews could not be loaded");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const toggleApprove = async (review) => {
    try {
      await axios.put(`${API}/reviews/${review._id}`, {
        isApproved: !review.isApproved,
      });
      fetchReviews();
      toast.success(
  review.isApproved ? "Review hidden" : "Review approved"
);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    const loadingToast = toast.loading("Deleting...");
    try {
      await axios.delete(`${API}/reviews/${id}`);
      fetchReviews();
      toast.success("Review deleted", {
  icon: <TrashIcon size={18} />,
  id: loadingToast,
});
    } catch (err) {
      toast.error("Delete failed", { id: loadingToast });
    }
  };

  const filtered = reviews.filter((r) => {
    if (filter === "approved") return r.isApproved;
    if (filter === "hidden") return !r.isApproved;
    return true;
  });

  if (loading) return <p className="muted">Loading reviews...</p>;

  return (
    <div className="admin-section">
      <div className="admin-section-head">
        <h2>Reviews ({filtered.length})</h2>
        <div className="admin-filter-tabs">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All ({reviews.length})
          </button>
          <button
            className={filter === "approved" ? "active" : ""}
            onClick={() => setFilter("approved")}
          >
            Approved
          </button>
          <button
            className={filter === "hidden" ? "active" : ""}
            onClick={() => setFilter("hidden")}
          >
            Hidden
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="admin-empty">
          <p>	No reviews yet.</p>
        </div>
      ) : (
        <div className="admin-reviews-list">
          {filtered.map((review) => (
            <div
              className={`admin-review-card ${
                !review.isApproved ? "hidden-review" : ""
              }`}
              key={review._id}
            >
              <div className="admin-review-head">
                <div className="admin-review-user">
                  <div className="admin-review-avatar">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong>{review.userName}</strong>
                    <p className="muted">{review.userEmail || "N/A"}</p>
                  </div>
                </div>

                <div className="admin-review-actions">
                  {!review.isApproved && (
                    <span className="admin-badge hidden-badge">Hidden</span>
                  )}
                  {review.isVerifiedPurchase && (
  <span className="admin-badge verified-badge">
    <BadgeCheckSmallIcon size={12} />
    <span>Verified</span>
  </span>
)}
                  
                  <button
  className="admin-edit-btn"
  onClick={() => toggleApprove(review)}
  title={review.isApproved ? "Hide review" : "Approve review"}
>
  {review.isApproved ? (
    <>
      <EyeOffIcon size={14} />
      <span>Hide</span>
    </>
  ) : (
    <>
      <CheckIcon size={14} />
      <span>Approve</span>
    </>
  )}
</button>
              <button
  className="admin-del-btn"
  onClick={() => handleDelete(review._id)}
  title="Delete review"
>
  <TrashIcon size={14} />
</button>
                </div>
              </div>

              <div className="admin-review-product">
                <strong>Product:</strong>{" "}
                {review.product?.name || "Unknown"}
              </div>

              <div className="admin-review-stars">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
                <span className="muted"> ({review.rating}/5)</span>
              </div>

              {review.title && (
                <h4 className="admin-review-title">{review.title}</h4>
              )}

              <p className="admin-review-comment">{review.comment}</p>

              <div className="admin-review-meta">
  <span>
    <CalendarSmallIcon size={12} />
    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
  </span>
  <span>
    <ThumbsUpSmallIcon size={12} />
    <span>{review.helpfulCount} helpful</span>
  </span>
</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminReviewsPage;