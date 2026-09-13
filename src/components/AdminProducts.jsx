import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL;

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  oldPrice: "",
  icon: "🛍️",
  category: "Electronics",
};

function AdminProducts({ refreshStats }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Products load nahi ho paaye");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyProduct);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice,
      icon: product.icon,
      category: product.category,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      oldPrice: Number(form.oldPrice),
    };

    const loadingToast = toast.loading(
      editing ? "Updating product..." : "Adding product..."
    );

    try {
      if (editing) {
        await axios.put(`${API}/products/${editing}`, payload);
        toast.success("Product updated successfully ✅", {
          id: loadingToast,
        });
      } else {
        await axios.post(`${API}/products`, payload);
        toast.success("Product added successfully ✅", {
          id: loadingToast,
        });
      }
      setShowModal(false);
      fetchProducts();
      refreshStats?.();
    } catch (err) {
      console.error(err);
      toast.error(
        "Error: " + (err.response?.data?.error || err.message),
        { id: loadingToast }
      );
    }
  };

  const handleDelete = (id, name) => {
    toast(
      (t) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <span>
            <strong>{name}</strong> delete karna hai?
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const loadToast = toast.loading("Deleting...");
                try {
                  await axios.delete(`${API}/products/${id}`);
                  fetchProducts();
                  refreshStats?.();
                  toast.success("Product deleted 🗑️", { id: loadToast });
                } catch (err) {
                  console.error(err);
                  toast.error("Delete failed", { id: loadToast });
                }
              }}
              style={{
                padding: "6px 14px",
                border: "none",
                borderRadius: "6px",
                background: "#b0455f",
                color: "#fff",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Yes, Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                padding: "6px 14px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                background: "transparent",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 6000 }
    );
  };

  const categories = [
    "Electronics",
    "Watches",
    "Accessories",
    "Stationery",
  ];

  return (
    <div className="admin-section">
      <div className="admin-section-head">
        <h2>Products ({products.length})</h2>
        <button className="admin-add-btn" onClick={openAdd}>
          ➕ Add Product
        </button>
      </div>

      {loading ? (
        <p className="muted">Loading...</p>
      ) : products.length === 0 ? (
        <div className="admin-empty">
          <p>Koi product nahi. Add karo pehla!</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Old Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="admin-table-icon">{p.icon}</td>
                  <td>
                    <strong>{p.name}</strong>
                    <p className="muted admin-table-desc">{p.description}</p>
                  </td>
                  <td>
                    <span className="admin-badge">{p.category}</span>
                  </td>
                  <td>Rs. {p.price.toLocaleString()}</td>
                  <td className="muted">Rs. {p.oldPrice.toLocaleString()}</td>
                  <td className="admin-actions">
                    <button
                      className="admin-edit-btn"
                      onClick={() => openEdit(p)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="admin-del-btn"
                      onClick={() => handleDelete(p._id, p.name)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <div className="admin-modal-body">
              <p className="eyebrow">
                — {editing ? "EDIT PRODUCT" : "NEW PRODUCT"}
              </p>
              <h2>{editing ? "Update Product" : "Add New Product"}</h2>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="iPhone 15 Pro"
                  />
                </div>

                <div className="field">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    placeholder="Short description..."
                  />
                </div>

                <div className="field-row">
                  <div className="field">
                    <label>Price (Rs.)</label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      required
                      placeholder="349999"
                    />
                  </div>

                  <div className="field">
                    <label>Old Price (Rs.)</label>
                    <input
                      type="number"
                      name="oldPrice"
                      value={form.oldPrice}
                      onChange={handleChange}
                      required
                      placeholder="399999"
                    />
                  </div>
                </div>

                <div className="field-row">
                  <div className="field">
                    <label>Icon (Emoji)</label>
                    <input
                      type="text"
                      name="icon"
                      value={form.icon}
                      onChange={handleChange}
                      placeholder="📱"
                      maxLength="4"
                    />
                  </div>

                  <div className="field">
                    <label>Category</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="submit" className="place-order-btn">
                  {editing ? "Update Product ✅" : "Add Product ✅"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;