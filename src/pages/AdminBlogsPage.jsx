import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { PlusIcon, EditIcon, TrashIcon, CheckIcon, CloseIcon } from "../components/AdminIcons";

const API = import.meta.env.VITE_API_URL;

const emptyBlog = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  category: "Tips",
  tags: "",
  author: "Awais Shakoor",
  readTime: 5,
  isPublished: true,
};

const categories = ["Tips", "Comparison", "News", "Guide", "General"];

function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBlog);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${API}/blogs/admin/all`);
      setBlogs(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Blogs load nahi ho paaye");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyBlog);
    setShowModal(true);
  };

  const openEdit = (blog) => {
    setEditing(blog._id);
    setForm({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || "",
      content: blog.content,
      coverImage: blog.coverImage || "",
      category: blog.category,
      tags: (blog.tags || []).join(", "),
      author: blog.author,
      readTime: blog.readTime,
      isPublished: blog.isPublished,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      readTime: Number(form.readTime),
    };

    const loadingToast = toast.loading(
      editing ? "Updating..." : "Publishing..."
    );

    try {
      if (editing) {
        await axios.put(`${API}/blogs/${editing}`, payload);
        toast.success("Blog updated ✅", { id: loadingToast });
      } else {
        await axios.post(`${API}/blogs`, payload);
        toast.success("Blog published ✅", { id: loadingToast });
      }
      setShowModal(false);
      setForm(emptyBlog);
      fetchBlogs();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed", {
        id: loadingToast,
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog post?")) return;
    const loadingToast = toast.loading("Deleting...");
    try {
      await axios.delete(`${API}/blogs/${id}`);
      fetchBlogs();
      toast.success("Blog deleted 🗑️", { id: loadingToast });
    } catch (err) {
      toast.error("Delete failed", { id: loadingToast });
    }
  };

  const togglePublish = async (blog) => {
    try {
      await axios.put(`${API}/blogs/${blog._id}`, {
        isPublished: !blog.isPublished,
      });
      fetchBlogs();
      toast.success(blog.isPublished ? "Unpublished" : "Published");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  if (loading) return <p className="muted">Loading blogs...</p>;

  return (
    <div className="admin-section">
      <div className="admin-section-head">
        <h2>Blog Posts ({blogs.length})</h2>
        <button className="admin-add-btn" onClick={openAdd}>
          <PlusIcon size={16} />
          <span>New Post</span>
        </button>
      </div>

      {blogs.length === 0 ? (
        <div className="admin-empty">
          <p>No blog posts yet. Create your first!</p>
        </div>
      ) : (
        <div className="blog-admin-list">
          {blogs.map((blog) => (
            <div className="blog-admin-card" key={blog._id}>
              <div className="blog-admin-image">
                {blog.coverImage ? (
                  <img src={blog.coverImage} alt={blog.title} />
                ) : (
                  <span>📝</span>
                )}
              </div>

              <div className="blog-admin-info">
                <div className="blog-admin-head">
                  <span className="admin-badge">{blog.category}</span>
                  {!blog.isPublished && (
                    <span className="admin-badge draft-badge">Draft</span>
                  )}
                </div>
                <h3>{blog.title}</h3>
                <p className="muted">
                  {blog.excerpt || blog.content.substring(0, 100)}...
                </p>
                <div className="blog-admin-meta">
                  <span>✍️ {blog.author}</span>
                  <span>👁️ {blog.views} views</span>
                  <span>📅 {new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="blog-admin-actions">
                <button
                  className="admin-edit-btn"
                  onClick={() => togglePublish(blog)}
                  title={blog.isPublished ? "Unpublish" : "Publish"}
                >
                  {blog.isPublished ? "Hide" : "Publish"}
                </button>
                <button
                  className="admin-edit-btn"
                  onClick={() => openEdit(blog)}
                >
                  <EditIcon size={14} />
                </button>
                <button
                  className="admin-del-btn"
                  onClick={() => handleDelete(blog._id)}
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content admin-modal blog-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowModal(false)}
            >
              <CloseIcon size={16} />
            </button>

            <div className="admin-modal-body">
              <p className="eyebrow">
                — {editing ? "EDIT BLOG" : "NEW BLOG"}
              </p>
              <h2>{editing ? "Update Post" : "Create Post"}</h2>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="How to Choose Perfect Smartphone"
                    required
                  />
                </div>

                <div className="field-row">
                  <div className="field">
                    <label>Category</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                    >
                      {categories.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Read Time (minutes)</label>
                    <input
                      type="number"
                      name="readTime"
                      value={form.readTime}
                      onChange={handleChange}
                      min="1"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Excerpt (short summary)</label>
                  <textarea
                    name="excerpt"
                    value={form.excerpt}
                    onChange={handleChange}
                    placeholder="Brief summary (max 300 chars)"
                    maxLength="300"
                  />
                </div>

                <div className="field">
                  <label>Cover Image URL</label>
                  <input
                    type="url"
                    name="coverImage"
                    value={form.coverImage}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="field">
                  <label>Content (HTML supported)</label>
                  <textarea
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    placeholder="<p>Your blog content here...</p>"
                    style={{ minHeight: "200px" }}
                    required
                  />
                </div>

                <div className="field-row">
                  <div className="field">
                    <label>Tags (comma separated)</label>
                    <input
                      type="text"
                      name="tags"
                      value={form.tags}
                      onChange={handleChange}
                      placeholder="smartphone, tips, buying"
                    />
                  </div>
                  <div className="field">
                    <label>Author</label>
                    <input
                      type="text"
                      name="author"
                      value={form.author}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="field-checkbox">
                  <input
                    type="checkbox"
                    id="isPublished"
                    name="isPublished"
                    checked={form.isPublished}
                    onChange={handleChange}
                  />
                  <label htmlFor="isPublished">Publish immediately</label>
                </div>

                <button type="submit" className="place-order-btn">
                  <CheckIcon size={16} />
                  <span>{editing ? "Update Post" : "Publish Post"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBlogsPage;