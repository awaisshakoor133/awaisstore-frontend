import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

const emptyAddress = {
  label: "Home",
  name: "",
  phone: "",
  address: "",
  city: "",
  isDefault: false,
};

function AddressBook() {
  const { user, updateProfile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyAddress);

  const addresses = user?.addresses || [];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyAddress, name: user.name, phone: user.phone });
    setShowForm(true);
  };

  const openEdit = (address) => {
    setEditing(address._id);
    setForm({
      label: address.label,
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      isDefault: address.isDefault,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading(
      editing ? "Updating address..." : "Saving address..."
    );

    try {
      let res;
      if (editing) {
        res = await axios.put(`${API}/auth/addresses/${editing}`, form);
      } else {
        res = await axios.post(`${API}/auth/addresses`, form);
      }

      // Context update karo
      await updateProfile({});

      toast.success(
        editing ? "Address updated ✅" : "Address added ✅",
        { id: loadingToast }
      );

      setShowForm(false);
      setForm(emptyAddress);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.error || "Failed to save address",
        { id: loadingToast }
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Address delete karna hai?")) return;

    const loadingToast = toast.loading("Deleting...");
    try {
      await axios.delete(`${API}/auth/addresses/${id}`);
      await updateProfile({});
      toast.success("Address deleted 🗑️", { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete", { id: loadingToast });
    }
  };

  return (
    <div className="address-book">
      <div className="address-book-head">
        <h3>📍 My Addresses</h3>
        <button className="address-add-btn" onClick={openAdd}>
          + Add New
        </button>
      </div>

      {addresses.length === 0 && !showForm ? (
        <div className="address-empty">
          <p>Koi saved address nahi hai.</p>
          <p className="muted">
            Checkout pe time bachane ke liye address save karo.
          </p>
        </div>
      ) : (
        <div className="address-list">
          {addresses.map((addr) => (
            <div
              className={`address-card ${addr.isDefault ? "default" : ""}`}
              key={addr._id}
            >
              <div className="address-card-head">
                <div className="address-label">
                  <span className="address-label-badge">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="address-default-badge">
                      ⭐ Default
                    </span>
                  )}
                </div>
                <div className="address-actions">
                  <button
                    className="address-edit-btn"
                    onClick={() => openEdit(addr)}
                  >
                    ✏️
                  </button>
                  <button
                    className="address-del-btn"
                    onClick={() => handleDelete(addr._id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="address-card-body">
                <p className="address-name">
                  <strong>{addr.name}</strong>
                </p>
                <p className="address-phone">📞 {addr.phone}</p>
                <p className="address-text">
                  📍 {addr.address}, {addr.city}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="modal-content address-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>

            <div className="address-modal-body">
              <p className="eyebrow">
                — {editing ? "EDIT ADDRESS" : "NEW ADDRESS"}
              </p>
              <h2>{editing ? "Update Address" : "Add New Address"}</h2>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Label</label>
                  <select
                    name="label"
                    value={form.label}
                    onChange={handleChange}
                  >
                    <option value="Home">🏠 Home</option>
                    <option value="Office">🏢 Office</option>
                    <option value="Other">📍 Other</option>
                  </select>
                </div>

                <div className="field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Street address, house number"
                    required
                  />
                </div>

                <div className="field">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Karachi"
                    required
                  />
                </div>

                <div className="field-checkbox">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={form.isDefault}
                    onChange={handleChange}
                  />
                  <label htmlFor="isDefault">
                    Set as default address
                  </label>
                </div>

                <button type="submit" className="place-order-btn">
                  {editing ? "Update Address ✅" : "Save Address ✅"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddressBook;