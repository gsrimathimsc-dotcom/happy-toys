import type { CartItem, CartTotals } from "@/types";

/** Orders at or above this amount get free delivery. */
export const FREE_DELIVERY_THRESHOLD = 999;
export const DELIVERY_FEE = 49;

/** Products at or below this quantity show an "only a few left" message. */
export const LOW_STOCK_LIMIT = 10;

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

export function getStockLabel(stock: number): string {
  if (stock <= 0) return "Out of stock";
  if (stock <= LOW_STOCK_LIMIT) return `Only ${stock} left - order soon`;
  return "In stock";
}

/**
 * Cart totals for the screen, so quantity changes show instantly.
 * The API repeats this calculation for the real order.
 */
export function calculateTotals(
  items: Pick<CartItem, "price" | "originalPrice" | "quantity">[]
): CartTotals {
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.originalPrice * i.quantity, 0);
  const sellingTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee =
    itemCount === 0 || sellingTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

  return {
    itemCount,
    subtotal,
    discount: subtotal - sellingTotal,
    deliveryFee,
    total: sellingTotal + deliveryFee,
  };
}
