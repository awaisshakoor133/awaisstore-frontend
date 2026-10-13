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

const CATEGORIES = [
  "Electronics",
  "Watches",
  "Accessories",
  "Stationery",
  "Audio",
  "Smartphones",
];

const emptyCoupon = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  expiryDate: "",
  usageLimit: "",
  description: "",
  // Advanced
  applicableCategories: [],
  firstOrderOnly: false,
  perUserLimit: "",
  bogoBuyQty: 1,
  bogoGetQty: 1,
  badge: "",
};

function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCoupon);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
    setShowAdvanced(false);
    setShowModal(true);
  };

  const openEdit = (coupon) => {
    setEditing(coupon._id);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue || "",
      minOrderAmount: coupon.minOrderAmount || "",
      maxDiscount: coupon.maxDiscount || "",
      expiryDate: coupon.expiryDate.split("T")[0],
      usageLimit: coupon.usageLimit || "",
      description: coupon.description || "",
      applicableCategories: coupon.applicableCategories || [],
      firstOrderOnly: coupon.firstOrderOnly || false,
      perUserLimit: coupon.perUserLimit || "",
      bogoBuyQty: coupon.bogoConfig?.buyQuantity || 1,
      bogoGetQty: coupon.bogoConfig?.getQuantity || 1,
      badge: coupon.badge || "",
    });
    setShowAdvanced(true);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const toggleCategory = (cat) => {
    const current = form.applicableCategories || [];
    setForm({
      ...form,
      applicableCategories: current.includes(cat)
        ? current.filter((c) => c !== cat)
        : [...current, cat],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(
      editing ? "Updating..." : "Creating..."
    );

    try {
      const payload = {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue) || 0,
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: Number(form.maxDiscount) || 0,
        expiryDate: form.expiryDate,
        usageLimit: Number(form.usageLimit) || 0,
        description: form.description || "",
        applicableCategories: form.applicableCategories || [],
        firstOrderOnly: form.firstOrderOnly || false,
        perUserLimit: Number(form.perUserLimit) || 0,
        badge: form.badge || "",
        bogoConfig: {
          buyQuantity: Number(form.bogoBuyQty) || 1,
          getQuantity: Number(form.bogoGetQty) || 1,
        },
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

  // Get display label for coupon type
  const getCouponDisplay = (coupon) => {
    switch (coupon.discountType) {
      case "percentage":
        return {
          main: `${coupon.discountValue}% OFF`,
          sub:
            coupon.maxDiscount > 0
              ? `Max Rs. ${coupon.maxDiscount}`
              : null,
        };
      case "flat":
        return { main: `Rs. ${coupon.discountValue} OFF`, sub: null };
      case "bogo":
        return {
          main: "Buy 1 Get 1",
          sub: `Buy ${coupon.bogoConfig?.buyQuantity || 1} Get ${coupon.bogoConfig?.getQuantity || 1} Free`,
        };
      case "free_shipping":
        return { main: "Free Shipping", sub: null };
      default:
        return { main: "Coupon", sub: null };
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
            const display = getCouponDisplay(coupon);

            return (
              <div
                className={`coupon-card ${
                  !coupon.isActive || expired || limitReached ? "inactive" : ""
                }`}
                key={coupon._id}
              >
                {coupon.badge && (
                  <span className={`coupon-badge-tag badge-${coupon.badge.toLowerCase()}`}>
                    {coupon.badge}
                  </span>
                )}

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
                  <span className="coupon-discount-value">{display.main}</span>
                  {display.sub && (
                    <span className="coupon-max">({display.sub})</span>
                  )}
                </div>

                {coupon.description && (
                  <p className="coupon-desc">{coupon.description}</p>
                )}

                {/* Advanced rules badges */}
                <div className="coupon-rules">
                  {coupon.applicableCategories?.length > 0 && (
                    <span className="coupon-rule-tag">
                      📁 {coupon.applicableCategories.join(", ")}
                    </span>
                  )}
                  {coupon.firstOrderOnly && (
                    <span className="coupon-rule-tag">🌟 First Order</span>
                  )}
                  {coupon.perUserLimit > 0 && (
                    <span className="coupon-rule-tag">
                      👤 {coupon.perUserLimit} per user
                    </span>
                  )}
                </div>

                <div className="coupon-meta">
                  {coupon.minOrderAmount > 0 && (
                    <div>Min: Rs. {coupon.minOrderAmount}</div>
                  )}
                  <div>
                    Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
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
                  <span className="coupon-status-badge inactive">Inactive</span>
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

      {/* ADD/EDIT MODAL */}
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
                {/* Coupon Code */}
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

                {/* Discount Type + Badge */}
                <div className="field-row">
                  <div className="field">
                    <label>Coupon Type</label>
                    <select
                      name="discountType"
                      value={form.discountType}
                      onChange={handleChange}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat (Rs.)</option>
                      <option value="bogo">Buy 1 Get 1 (BOGO)</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Badge (optional)</label>
                    <select
                      name="badge"
                      value={form.badge}
                      onChange={handleChange}
                    >
                      <option value="">None</option>
                      <option value="HOT">HOT 🔥</option>
                      <option value="NEW">NEW ✨</option>
                      <option value="LIMITED">LIMITED ⏰</option>
                    </select>
                  </div>
                </div>

                {/* Percentage/Flat Discount */}
                {(form.discountType === "percentage" ||
                  form.discountType === "flat") && (
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
                )}

                {/* Max Discount for Percentage */}
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

                {/* BOGO Config */}
                {form.discountType === "bogo" && (
                  <div className="field-row">
                    <div className="field">
                      <label>Buy Quantity</label>
                      <input
                        type="number"
                        name="bogoBuyQty"
                        value={form.bogoBuyQty}
                        onChange={handleChange}
                        min="1"
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Get Quantity Free</label>
                      <input
                        type="number"
                        name="bogoGetQty"
                        value={form.bogoGetQty}
                        onChange={handleChange}
                        min="1"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Min Order */}
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

                {/* Expiry + Usage Limit */}
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

                {/* Description */}
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

                {/* Advanced Toggle */}
                <button
                  type="button"
                  className="advanced-toggle"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? "▼" : "▶"} Advanced Options
                </button>

                {showAdvanced && (
                  <div className="advanced-section">
                    {/* Categories */}
                    <div className="field">
                      <label>Applicable Categories (empty = all)</label>
                      <div className="category-selector">
                        {CATEGORIES.map((cat) => (
                          <button
                            type="button"
                            key={cat}
                            className={`category-chip ${
                              form.applicableCategories?.includes(cat)
                                ? "active"
                                : ""
                            }`}
                            onClick={() => toggleCategory(cat)}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* First Order + Per User */}
                    <div className="field-row">
                      <div className="field">
                        <label>Per User Limit — 0 = unlimited</label>
                        <input
                          type="number"
                          name="perUserLimit"
                          value={form.perUserLimit}
                          onChange={handleChange}
                          placeholder="1"
                          min="0"
                        />
                      </div>

                      <div className="field">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="firstOrderOnly"
                            checked={form.firstOrderOnly}
                            onChange={handleChange}
                          />
                          <span>First-time customers only</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

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