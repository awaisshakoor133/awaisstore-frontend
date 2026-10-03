import { WHATSAPP_NUMBER, DEFAULT_GREETING } from "../config/whatsapp";

// Order single product
export function orderProductOnWhatsApp(product) {
  const message =
    `${DEFAULT_GREETING} 👋%0A%0A` +
    `I want to order this product:%0A%0A` +
    `*Product:* ${product.name}%0A` +
    `*Price:* Rs. ${product.price?.toLocaleString() || "N/A"}%0A` +
    `*Category:* ${product.category || "N/A"}%0A` +
    `*Product ID:* ${product._id?.slice(-6) || "N/A"}%0A%0A` +
    `Please confirm availability and delivery time.`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
}

// Order entire cart
export function orderCartOnWhatsApp(cart, total) {
  if (!cart?.length) return;

  let message = `${DEFAULT_GREETING} 👋%0A%0A*My Order:*%0A%0A`;

  cart.forEach((item, index) => {
    message += `${index + 1}. *${item.name}*%0A`;
    message += `   Rs. ${item.price?.toLocaleString()} × ${item.quantity} = Rs. ${(item.price * item.quantity).toLocaleString()}%0A%0A`;
  });

  message += `━━━━━━━━━━━━━━━%0A`;
  message += `*Total: Rs. ${total?.toLocaleString()}*%0A%0A`;
  message += `Please confirm my order.`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
}

// General chat
export function chatOnWhatsApp(message = DEFAULT_GREETING) {
  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}