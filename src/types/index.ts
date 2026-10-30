// ---------------------------------------------------------------
// Shared TypeScript types used by both the pages and the API.
// ---------------------------------------------------------------

export type CategorySlug =
  | "educational-toys"
  | "baby-toys"
  | "remote-control-toys"
  | "soft-toys"
  | "building-blocks"
  | "outdoor-toys"
  | "board-games"
  | "action-figures";

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  category: CategorySlug;
  brand: string;
  description: string;
  /** Selling price in Indian Rupees */
  price: number;
  /** MRP (price before discount) in Indian Rupees */
  originalPrice: number;
  /** Discount percentage, e.g. 35 means 35% off */
  discount: number;
  rating: number;
  reviewCount: number;
  image: string;
  /** Units available. 0 means out of stock. */
  stock: number;
  ageGroup: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  /** ISO date, used for "Newest" sorting */
  createdAt: string;
  specifications: Record<string, string>;
}

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export type SortOption = "popularity" | "newest" | "price-asc" | "price-desc";

export interface ProductQuery {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
  limit?: number;
}

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  stock: number;
  quantity: number;
}

export interface CartTotals {
  itemCount: number;
  /** Sum of MRP x quantity */
  subtotal: number;
  /** Money saved from product discounts */
  discount: number;
  deliveryFee: number;
  total: number;
}

export type PaymentMethod = "upi" | "card" | "netbanking" | "cod";

export interface CustomerDetails {
  name: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  pinCode: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  orderId: string;
  createdAt: string;
  customer: CustomerDetails;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  totals: CartTotals;
  status: "confirmed";
}

export interface User {
  name: string;
  email: string;
}

/** Standard shape returned by every API route */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
