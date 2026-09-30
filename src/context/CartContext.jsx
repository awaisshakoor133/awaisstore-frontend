import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const CartContext = createContext();

export function CartProvider({ children }) {
  // ============ CART STATE ============
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("awais-cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ============ WISHLIST STATE ============
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("awais-wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ============ PERSIST TO LOCALSTORAGE ============
  useEffect(() => {
    localStorage.setItem("awais-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("awais-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // ============ CART OPERATIONS ============
  const addToCart = (product) => {
    const existing = cart.find((i) => i.id === product._id);
    if (existing) {
      setCart(
        cart.map((i) =>
          i.id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
      toast.success(`${product.name} quantity increased`, { icon: "➕" });
    } else {
      setCart([...cart, { ...product, id: product._id, quantity: 1 }]);
      toast.success(`${product.name} added to cart!`, { icon: "🛒" });
    }
  };

  const increaseQuantity = (id) =>
    setCart(
      cart.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i))
    );

  const decreaseQuantity = (id) =>
    setCart(
      cart
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );

  const removeFromCart = (id) => {
    const item = cart.find((i) => i.id === id);
    setCart(cart.filter((i) => i.id !== id));
    toast.error(`${item?.name || "Item"} removed`);
  };

  const clearCart = () => setCart([]);

  // ============ WISHLIST OPERATIONS ============
  const toggleWishlist = (product) => {
    const exists = wishlist.find((i) => i._id === product._id);
    if (exists) {
      setWishlist(wishlist.filter((i) => i._id !== product._id));
      toast.error(`${product.name} removed from wishlist`, { icon: "💔" });
    } else {
      setWishlist([...wishlist, product]);
      toast.success(`${product.name} added to wishlist!`, { icon: "❤️" });
    }
  };

  const isInWishlist = (id) => wishlist.some((i) => i._id === id);

  // ============ COMPUTED VALUES ============
  const cartCount = cart.reduce((t, i) => t + i.quantity, 0);
  const cartTotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);
  const wishlistCount = wishlist.length;

  const value = {
    // Cart
    cart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    cartTotal,
    setCart,
    // Wishlist
    wishlist,
    toggleWishlist,
    isInWishlist,
    wishlistCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}