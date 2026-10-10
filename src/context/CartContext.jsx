import { useAuth } from "./AuthContext";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  CartIcon,
  BrokenHeartIcon,
  PlusIcon,
  HeartIcon,
} from "../components/StoreIcons";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
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

  // ✅ Track abandoned cart (debounced)
  if (user?.email && cart.length > 0) {
    const timer = setTimeout(async () => {
      try {
        const total = cart.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );

        await fetch(`${import.meta.env.VITE_API_URL}/abandoned-carts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: user.email,
            userName: user.name || "",
            userPhone: user.phone || "",
            items: cart.map((i) => ({
              id: i.id,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              image: i.image,
              icon: i.icon,
            })),
            total,
          }),
        });
      } catch (err) {
        console.error("Track abandoned cart error:", err);
      }
    }, 5000); // 5 second debounce

    return () => clearTimeout(timer);
  }
}, [cart, user]);

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
      toast.success(`${product.name} quantity increased`, {
        icon: <PlusIcon size={18} />,
      });
    } else {
      setCart([...cart, { ...product, id: product._id, quantity: 1 }]);
      toast.success(`${product.name} added to cart!`, {
        icon: <CartIcon size={18} />,
      });
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
    toast.error(`${item?.name || "Item"} removed`, {
      icon: <BrokenHeartIcon size={18} />,
    });
  };

  const clearCart = () => setCart([]);

  // ============ WISHLIST OPERATIONS ============
  const toggleWishlist = (product) => {
    const exists = wishlist.find((i) => i._id === product._id);
    if (exists) {
      setWishlist(wishlist.filter((i) => i._id !== product._id));
      toast.error(`${product.name} removed from wishlist`, {
        icon: <BrokenHeartIcon size={18} />,
      });
    } else {
      setWishlist([...wishlist, product]);
      toast.success(`${product.name} added to wishlist!`, {
        icon: <HeartIcon size={18} filled={true} />,
      });
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

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}