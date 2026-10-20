import { useCallback } from "react";

// Map of module URLs to loaders (Lazy imports)
const prefetchMap = {
  "/": () => import("../pages/StoreHome"),
  "/products": () => import("../pages/ProductsPage"),
  "/categories": () => import("../pages/CategoriesPage"),
  "/cart": () => import("../pages/CartPage"),
  "/wishlist": () => import("../pages/WishlistPage"),
  "/orders": () => import("../pages/OrdersPage"),
  "/blog": () => import("../pages/BlogListPage"),
  "/profile": () => import("../pages/UserProfilePage"),
};

export function usePrefetch() {
  const prefetch = useCallback((path) => {
    const loader = prefetchMap[path];
    if (loader) {
      // Fire and forget
      loader().catch(() => {
        // Ignore errors on prefetch
      });
    }
  }, []);

  return prefetch;
}