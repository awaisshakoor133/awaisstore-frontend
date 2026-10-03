import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { ProductsProvider } from "./context/ProductsContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <ProductsProvider>
            <App />
          </ProductsProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);