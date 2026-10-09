import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ThumbsUpIcon,
  UserIcon,
  MailIcon,
  CloseIcon,
} from "./StoreIcons";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

function CommentSection({ blogId }) {
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    comment: "",
  });

  // ============ FETCH COMMENTS ============
  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API}/comments/blog/${blogId}`);
      setComments(res.data);
    } catch (err) {
      console.error("Fetch comments error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (blogId) fetchComments();
  }, [blogId]);

  // ============ SUBMIT COMMENT ============
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.comment.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    setSubmitting(true);

    try {
      const res = await axios.post(`${API}/comments`, {
        blog: blogId,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        comment: form.comment.trim(),
      });

      setComments([res.data, ...comments]);
      setForm({ ...form, comment: "" });
      setShowForm(false);
      toast.success("Comment posted!");
    } catch (err) {
      console.error("Post comment error:", err);
      toast.error(err.response?.data?.error || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  // ============ LIKE COMMENT ============
  const handleLike = async (commentId) => {
    const identifier = user?.email || `guest-${Date.now()}`;

    try {
      const res = await axios.post(`${API}/comments/${commentId}/like`, {
        userIdentifier: identifier,
      });

      setComments(
        comments.map((c) => (c._id === commentId ? res.data : c))
      );
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // ============ HELPERS ============
  const formatDate = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now - commentDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return commentDate.toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isLikedByUser = (comment) => {
    const identifier = user?.email;
    if (!identifier) return false;
    return comment.likedBy?.includes(identifier);
  };

  return (
    <div className="comment-section">
      {/* Header */}
      <div className="comment-header">
        <div>
          <h3>
            Comments <span className="comment-count">({comments.length})</span>
          </h3>
          <p className="muted">Join the discussion</p>
        </div>

        {!showForm && (
          <button
            className="write-comment-btn"
            onClick={() => setShowForm(true)}
          >
            Write a Comment
          </button>
        )}
      </div>

      {/* Comment Form */}
      {showForm && (
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="comment-form-header">
            <h4>Leave a Comment</h4>
            <button
              type="button"
              className="comment-form-close"
              onClick={() => setShowForm(false)}
              aria-label="Close form"
            >
              <CloseIcon size={16} />
            </button>
          </div>

          <div className="comment-form-row">
            <div className="comment-form-field">
              <label>
                <UserIcon size={14} />
                <span>Name</span>
              </label>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={50}
                required
              />
            </div>

            <div className="comment-form-field">
              <label>
                <MailIcon size={14} />
                <span>Email</span>
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="comment-form-field">
            <label>Comment</label>
            <textarea
              placeholder="Share your thoughts..."
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              maxLength={1000}
              rows={4}
              required
            />
            <span className="comment-char-count">
              {form.comment.length} / 1000
            </span>
          </div>

          <div className="comment-form-actions">
            <button
              type="submit"
              className="comment-submit-btn"
              disabled={submitting}
            >
              {submitting ? "Posting..." : "Post Comment"}
            </button>
            <button
              type="button"
              className="comment-cancel-btn"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="comment-loading">
          <p className="muted">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="comment-empty">
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="comment-list">
          {comments.map((comment) => (
            <div className="comment-item" key={comment._id}>
              <div className="comment-avatar">
                {getInitials(comment.name)}
              </div>

              <div className="comment-content">
                <div className="comment-meta">
                  <strong>{comment.name}</strong>
                  <span className="comment-dot">·</span>
                  <span className="comment-date">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>

                <p className="comment-text">{comment.comment}</p>

                <div className="comment-actions">
                  <button
                    className={`comment-like-btn ${
                      isLikedByUser(comment) ? "liked" : ""
                    }`}
                    onClick={() => handleLike(comment._id)}
                    aria-label="Like comment"
                  >
                    <ThumbsUpIcon size={14} />
                    <span>
                      {comment.likes > 0 ? comment.likes : "Helpful"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentSection;