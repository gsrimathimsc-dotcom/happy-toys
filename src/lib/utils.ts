import type { CartItem, CartTotals, Product, StockStatus } from "@/types";

/** Orders at or above this amount get free delivery. */
export const FREE_DELIVERY_THRESHOLD = 999;
export const DELIVERY_FEE = 49;

/** Formats a number as Indian Rupees, e.g. 1299 -> "₹1,299" */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Joins CSS class names and skips empty values. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out-of-stock";
  if (stock <= 10) return "low-stock";
  return "in-stock";
}

export function getStockLabel(stock: number): string {
  const status = getStockStatus(stock);
  if (status === "out-of-stock") return "Out of stock";
  if (status === "low-stock") return `Only ${stock} left - order soon`;
  return "In stock";
}

/**
 * Calculates cart totals. Used by the cart page, the checkout page
 * AND the order API, so the numbers always match.
 */
export function calculateTotals(
  items: Pick<CartItem, "price" | "originalPrice" | "quantity">[]
): CartTotals {
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.originalPrice * i.quantity, 0);
  const sellingTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = subtotal - sellingTotal;
  const deliveryFee =
    itemCount === 0 || sellingTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

  return {
    itemCount,
    subtotal,
    discount,
    deliveryFee,
    total: sellingTotal + deliveryFee,
  };
}

/** Converts a product into a cart line item. */
export function productToCartItem(product: Product, quantity: number): CartItem {
  return {
    productId: product.id,
    name: product.name,
    image: product.image,
    price: product.price,
    originalPrice: product.originalPrice,
    stock: product.stock,
    quantity,
  };
}

/** Creates a demo order number like "HT-20261030-4821". */
export function generateOrderId(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `HT-${date}-${random}`;
}

/** Simple validators used by the login, register and checkout forms. */
export const validators = {
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
  mobile: (value: string) => /^[6-9]\d{9}$/.test(value.trim()),
  pinCode: (value: string) => /^[1-9]\d{5}$/.test(value.trim()),
  required: (value: string) => value.trim().length > 0,
};
