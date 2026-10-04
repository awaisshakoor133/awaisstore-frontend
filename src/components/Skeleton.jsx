// ============================================
// SKELETON LOADER COMPONENTS
// ============================================
// Reusable shimmer loaders for better UX

export function Skeleton({ width = "100%", height = "20px", borderRadius = "8px", style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius, ...style }}
    />
  );
}

// ============ PRODUCT CARD SKELETON ============
export function ProductCardSkeleton() {
  return (
    <div className="product-card skeleton-card">
      <div className="skeleton skeleton-img" />
      <div className="skeleton-card-body">
        <Skeleton width="80px" height="20px" borderRadius="20px" />
        <Skeleton width="90%" height="18px" style={{ marginTop: "12px" }} />
        <Skeleton width="100%" height="14px" style={{ marginTop: "8px" }} />
        <Skeleton width="100%" height="14px" style={{ marginTop: "6px" }} />
        <Skeleton width="60%" height="20px" style={{ marginTop: "12px" }} />
        <Skeleton
          width="100%"
          height="42px"
          borderRadius="10px"
          style={{ marginTop: "16px" }}
        />
      </div>
    </div>
  );
}

// ============ PRODUCT GRID SKELETON ============
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="product-container">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ============ PRODUCT DETAIL SKELETON ============
export function ProductDetailSkeleton() {
  return (
    <section className="product-detail-page">
      <Skeleton width="280px" height="16px" />

      <div className="product-detail-grid" style={{ marginTop: "40px" }}>
        <div className="skeleton skeleton-detail-img" />

        <div className="skeleton-info">
          <Skeleton width="140px" height="14px" />
          <Skeleton
            width="85%"
            height="36px"
            style={{ marginTop: "16px" }}
          />
          <Skeleton
            width="150px"
            height="20px"
            style={{ marginTop: "16px" }}
          />
          <Skeleton
            width="100%"
            height="16px"
            style={{ marginTop: "24px" }}
          />
          <Skeleton
            width="95%"
            height="16px"
            style={{ marginTop: "8px" }}
          />
          <Skeleton
            width="70%"
            height="16px"
            style={{ marginTop: "8px" }}
          />
          <Skeleton
            width="220px"
            height="40px"
            style={{ marginTop: "32px" }}
          />
          <Skeleton
            width="100%"
            height="52px"
            borderRadius="12px"
            style={{ marginTop: "24px" }}
          />
          <Skeleton
            width="100%"
            height="52px"
            borderRadius="12px"
            style={{ marginTop: "12px" }}
          />
        </div>
      </div>

      <div className="skeleton-reviews" style={{ marginTop: "60px" }}>
        <Skeleton width="200px" height="24px" />
        <Skeleton
          width="100%"
          height="140px"
          borderRadius="16px"
          style={{ marginTop: "20px" }}
        />
      </div>
    </section>
  );
}

// ============ CART ITEM SKELETON ============
export function CartItemSkeleton() {
  return (
    <div className="cart-item skeleton-cart-item">
      <div className="skeleton skeleton-cart-icon" />
      <div className="skeleton-cart-info">
        <Skeleton width="70%" height="18px" />
        <Skeleton
          width="40%"
          height="14px"
          style={{ marginTop: "10px" }}
        />
        <Skeleton
          width="110px"
          height="34px"
          borderRadius="8px"
          style={{ marginTop: "14px" }}
        />
      </div>
      <div className="skeleton-cart-right">
        <Skeleton width="90px" height="22px" />
        <Skeleton
          width="90px"
          height="32px"
          borderRadius="8px"
          style={{ marginTop: "12px" }}
        />
      </div>
    </div>
  );
}

export function CartSkeleton({ count = 3 }) {
  return (
    <div className="cart-page-grid">
      <div className="cart-items-section">
        {Array.from({ length: count }).map((_, i) => (
          <CartItemSkeleton key={i} />
        ))}
      </div>
      <div className="checkout-box skeleton-checkout">
        <Skeleton width="60%" height="22px" />
        <Skeleton
          width="100%"
          height="50px"
          borderRadius="10px"
          style={{ marginTop: "20px" }}
        />
        <Skeleton
          width="100%"
          height="80px"
          borderRadius="12px"
          style={{ marginTop: "20px" }}
        />
        <Skeleton
          width="100%"
          height="52px"
          borderRadius="12px"
          style={{ marginTop: "20px" }}
        />
      </div>
    </div>
  );
}

// ============ ADMIN TABLE SKELETON ============
export function AdminTableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <table className="admin-table">
      <thead>
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i}>
              <Skeleton width="70%" height="14px" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i}>
            {Array.from({ length: cols }).map((_, j) => (
              <td key={j}>
                <Skeleton width="80%" height="16px" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}