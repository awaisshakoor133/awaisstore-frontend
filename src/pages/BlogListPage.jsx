import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL;

function BlogListPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");

  const categories = ["All", "Tips", "Comparison", "News", "Guide"];

  useEffect(() => {
    setLoading(true);
    const url =
      category === "All"
        ? `${API}/blogs`
        : `${API}/blogs?category=${category}`;

    axios
      .get(url)
      .then((res) => {
        setBlogs(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Blogs load nahi ho paaye");
        setLoading(false);
      });
  }, [category]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="blog-list-page">
      <div className="section-head">
        <p className="eyebrow">— OUR BLOG</p>
        <h2>
          Latest <span className="gradient-text">Articles</span>
        </h2>
        <p className="section-text">
          Tips, guides, and news from Awais Mobile-Zone
        </p>
      </div>

      {/* Category Filter */}
      <div className="blog-categories">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`blog-cat-btn ${category === cat ? "active" : ""}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">
          <h3>Loading articles...</h3>
        </div>
      ) : blogs.length === 0 ? (
        <div className="empty-state">
          <h3>Koi article nahi mila</h3>
          <p>Jald hi naye articles aayenge.</p>
        </div>
      ) : (
        <div className="blog-grid">
          {blogs.map((blog) => (
            <Link
              to={`/blog/${blog.slug}`}
              className="blog-card"
              key={blog._id}
            >
              <div className="blog-card-image">
                {blog.coverImage ? (
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    loading="lazy"
                  />
                ) : (
                  <div className="blog-placeholder">📝</div>
                )}
              </div>

              <div className="blog-card-content">
                <span className="blog-card-category">
                  {blog.category}
                </span>
                <h3>{blog.title}</h3>
                <p className="blog-card-excerpt">
                  {blog.excerpt || blog.content.substring(0, 120) + "..."}
                </p>

                <div className="blog-card-meta">
                  <span>✍️ {blog.author}</span>
                  <span>📅 {formatDate(blog.createdAt)}</span>
                  <span>⏱️ {blog.readTime} min</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default BlogListPage;