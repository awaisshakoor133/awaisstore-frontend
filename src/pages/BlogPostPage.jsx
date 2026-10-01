import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from "../components/StoreIcons";
import { CalendarIcon, EyeIcon } from "../components/AdminIcons";

const API = import.meta.env.VITE_API_URL;

function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/blogs/${slug}`)
      .then((res) => {
        setBlog(res.data);

        // Fetch related posts
        return axios.get(`${API}/blogs?category=${res.data.category}&limit=3`);
      })
      .then((res) => {
        if (res) {
          setRelated(res.data.filter((b) => b.slug !== slug).slice(0, 2));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Blog post not found");
        setLoading(false);
      });
  }, [slug]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="blog-post-page">
        <p className="muted" style={{ textAlign: "center", padding: "80px" }}>
          Loading...
        </p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-post-page">
        <div className="empty-state">
          <h3>Article not found</h3>
          <Link to="/blog" className="empty-state-cta">
            Back to Blog <span>→</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="blog-post-page">
      <div className="blog-post-container">
        {/* Back Link */}
        <Link to="/blog" className="blog-back-link">
          <ArrowLeftIcon size={16} />
          <span>Back to Blog</span>
        </Link>

        {/* Cover Image */}
        {blog.coverImage && (
          <div className="blog-post-cover">
            <img src={blog.coverImage} alt={blog.title} />
          </div>
        )}

        {/* Header */}
        <header className="blog-post-header">
          <span className="blog-post-category">{blog.category}</span>
          <h1>{blog.title}</h1>

          <div className="blog-post-meta">
            <span>
  <CalendarIcon size={14} /> {formatDate(blog.createdAt)}
</span>
<span>
  <EyeIcon size={14} /> {blog.views} views
</span>
          </div>
        </header>

        {/* Content */}
        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="blog-post-tags">
            <strong>Tags:</strong>
            {blog.tags.map((tag) => (
              <span key={tag} className="blog-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="blog-related">
            <h3>Related Articles</h3>
            <div className="blog-related-grid">
              {related.map((r) => (
                <Link
                  to={`/blog/${r.slug}`}
                  className="blog-related-card"
                  key={r._id}
                >
                  <h4>{r.title}</h4>
                  <p>{r.excerpt || r.content.substring(0, 80) + "..."}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default BlogPostPage;