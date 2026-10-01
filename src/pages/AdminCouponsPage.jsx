import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  CloseIcon,
  CheckIcon,
} from "../components/AdminIcons";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL;

const emptyCoupon = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  expiryDate: "",
  usageLimit: "",
  description: "",
};

function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCoupon);

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${API}/coupons`);
      setCoupons(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Coupons could not be loaded");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyCoupon);
    setShowModal(true);
  };

  const openEdit = (coupon) => {
    setEditing(coupon._id);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || "",
      maxDiscount: coupon.maxDiscount || "",
      expiryDate: coupon.expiryDate.split("T")[0],
      usageLimit: coupon.usageLimit || "",
      description: coupon.description || "",
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(
      editing ? "Updating..." : "Creating..."
    );

    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: Number(form.maxDiscount) || 0,
        usageLimit: Number(form.usageLimit) || 0,
      };

      if (editing) {
        await axios.put(`${API}/coupons/${editing}`, payload);
        toast.success("Coupon updated ✅", { id: loadingToast });
      } else {
        await axios.post(`${API}/coupons`, payload);
        toast.success("Coupon created ✅", { id: loadingToast });
      }

      setShowModal(false);
      setForm(emptyCoupon);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed", { id: loadingToast });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    const loadingToast = toast.loading("Deleting...");
    try {
      await axios.delete(`${API}/coupons/${id}`);
      fetchCoupons();
      toast.success("Deleted", {
  icon: <TrashIcon size={18} />,
  id: loadingToast,
});
      
    } catch (err) {
      toast.error("Delete failed", { id: loadingToast });
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await axios.put(`${API}/coupons/${coupon._id}`, {
        isActive: !coupon.isActive,
      });
      fetchCoupons();
      toast.success(coupon.isActive ? "Deactivated" : "Activated");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  if (loading) return <p className="muted">Loading coupons...</p>;

  return (
    <div className="admin-section">
      <div className="admin-section-head">
        <h2>Coupons ({coupons.length})</h2>
        <button className="admin-add-btn" onClick={openAdd}>
  <PlusIcon size={16} />
  <span>Create Coupon</span>
</button>
      </div>

      {coupons.length === 0 ? (
        <div className="admin-empty">
          <p>No coupons yet. Create your first!</p>
        </div>
      ) : (
        <div className="coupon-grid">
          {coupons.map((coupon) => {
            const expired = new Date(coupon.expiryDate) < new Date();
            const limitReached =
              coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit;

            return (
              <div
                className={`coupon-card ${
                  !coupon.isActive || expired || limitReached ? "inactive" : ""
                }`}
                key={coupon._id}
              >
                <div className="coupon-card-top">
                  <div className="coupon-code">{coupon.code}</div>
                  <div className="coupon-actions">
                    <button
  className="coupon-toggle"
  onClick={() => toggleActive(coupon)}
  title={coupon.isActive ? "Deactivate" : "Activate"}
>
  {coupon.isActive ? (
    <CheckCircleIcon size={18} />
  ) : (
    <XCircleIcon size={18} />
  )}
</button>
                    <button
  className="admin-edit-btn"
  onClick={() => openEdit(coupon)}
  title="Edit coupon"
>
  <EditIcon size={14} />
</button> 
              <button
  className="admin-del-btn"
  onClick={() => handleDelete(coupon._id)}
  title="Delete coupon"
>
  <TrashIcon size={14} />
</button>
                  </div>
                </div>

                <div className="coupon-discount">
                  <span className="coupon-discount-value">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}% OFF`
                      : `Rs. ${coupon.discountValue} OFF`}
                  </span>
                  {coupon.maxDiscount > 0 && (
                    <span className="coupon-max">
                      (Max Rs. {coupon.maxDiscount})
                    </span>
                  )}
                </div>

                {coupon.description && (
                  <p className="coupon-desc">{coupon.description}</p>
                )}

                <div className="coupon-meta">
                  {coupon.minOrderAmount > 0 && (
                    <div>Min: Rs. {coupon.minOrderAmount}</div>
                  )}
                  <div>
                    Expires:{" "}
                    {new Date(coupon.expiryDate).toLocaleDateString()}
                  </div>
                  <div>
                    Used: {coupon.usedCount}
                    {coupon.usageLimit > 0 && ` / ${coupon.usageLimit}`}
                  </div>
                </div>

                {expired && (
                  <span className="coupon-status-badge expired">Expired</span>
                )}
                {!coupon.isActive && (
                  <span className="coupon-status-badge inactive">
                    Inactive
                  </span>
                )}
                {limitReached && (
                  <span className="coupon-status-badge exhausted">
                    Used Up
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
  className="modal-close"
  onClick={() => setShowModal(false)}
  aria-label="Close"
>
  <CloseIcon size={16} />
</button>

            <div className="admin-modal-body">
              <p className="eyebrow">
                — {editing ? "EDIT COUPON" : "NEW COUPON"}
              </p>
              <h2>{editing ? "Update Coupon" : "Create Coupon"}</h2>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Coupon Code</label>
                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="SAVE10"
                    required
                    style={{ textTransform: "uppercase" }}
                  />
                </div>

                <div className="field-row">
                  <div className="field">
                    <label>Discount Type</label>
                    <select
                      name="discountType"
                      value={form.discountType}
                      onChange={handleChange}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat (Rs.)</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>
                      Discount Value (
                      {form.discountType === "percentage" ? "%" : "Rs."})
                    </label>
                    <input
                      type="number"
                      name="discountValue"
                      value={form.discountValue}
                      onChange={handleChange}
                      placeholder={
                        form.discountType === "percentage" ? "10" : "500"
                      }
                      required
                    />
                  </div>
                </div>

                {form.discountType === "percentage" && (
                  <div className="field">
                    <label>Max Discount Cap (Rs.) — optional</label>
                    <input
                      type="number"
                      name="maxDiscount"
                      value={form.maxDiscount}
                      onChange={handleChange}
                      placeholder="1000"
                    />
                  </div>
                )}

                <div className="field">
                  <label>Minimum Order Amount (Rs.) — optional</label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    value={form.minOrderAmount}
                    onChange={handleChange}
                    placeholder="1000"
                  />
                </div>

                <div className="field-row">
                  <div className="field">
                    <label>Expiry Date</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={form.expiryDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Usage Limit — 0 = unlimited</label>
                    <input
                      type="number"
                      name="usageLimit"
                      value={form.usageLimit}
                      onChange={handleChange}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Description (optional)</label>
                  <input
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Get 10% off on your order"
                  />
                </div>

                <button type="submit" className="place-order-btn">
  <CheckIcon size={16} />
  <span>{editing ? "Update Coupon" : "Create Coupon"}</span>
</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCouponsPage;