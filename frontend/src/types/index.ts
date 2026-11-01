// ---------------------------------------------------------------
// TypeScript types that match the ASP.NET Core API's JSON.
// ---------------------------------------------------------------

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
}

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  brand: string;
  description: string;
  /** Selling price in Indian Rupees */
  price: number;
  /** MRP (price before discount) in Indian Rupees */
  originalPrice: number;
  /** Discount percentage, e.g. 35 means 35% off */
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  /** The main image */
  imageUrl: string;
  /** Every image, main one first */
  imageUrls: string[];
  /** Units available. 0 means out of stock. */
  stockQuantity: number;
  stockStatus: StockStatus;
  isActive: boolean;
  createdDate: string;
  ageGroup: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  specifications: Record<string, string>;
}

/** Live figures for the home page */
export interface StoreSummary {
  productCount: number;
  categoryCount: number;
  averageRating: number;
  highestDiscount: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductDetails {
  product: Product;
  related: Product[];
}

export type SortOption = "popularity" | "newest" | "price-asc" | "price-desc";

export interface CartItem {
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  stockQuantity: number;
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

/** A browser-saved cart after the API checked it against today's prices and stock. */
export interface CartValidation {
  items: CartItem[];
  totals: CartTotals;
  isValid: boolean;
  issues: string[];
}

export type PaymentMethod = "cod" | "upi" | "card";

export type OrderStatus = "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export interface CustomerDetails {
  name: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  createdDate: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customer: CustomerDetails;
  items: OrderItem[];
  totals: CartTotals;
  canCancel: boolean;
}

export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface AuthResult {
  token: string;
  expiresAt: string;
  user: User;
}

/** What the API needs to save a product (admin only) */
export interface ProductInput {
  name: string;
  categoryId: string;
  brand: string;
  description: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  stockQuantity: number;
  isActive: boolean;
  ageGroup: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  specifications: Record<string, string>;
}

export interface DailyItem {
  productId: string;
  name: string;
  quantity: number;
  amount: number;
}

export interface DailySales {
  date: string;
  orders: number;
  itemsSold: number;
  sales: number;
  items: DailyItem[];
}

export interface AdminDashboard {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalSales: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  openOrders: number;
  productsOnOffer: number;
  activeCoupons: number;
  today: DailySales;
  recentOrders: Order[];
  bestSellingProducts: { productId: string; name: string; imageUrl: string; unitsSold: number; revenue: number }[];
  salesOverview: DailySales[];
  orderStatusCounts: { status: OrderStatus; count: number }[];
}

export interface Coupon {
  id: number;
  code: string;
  type: "percentage" | "fixedAmount";
  value: number;
  minimumOrderAmount: number;
  isActive: boolean;
  expiresAt: string | null;
}

export interface CouponInput {
  code: string;
  type: Coupon["type"];
  value: number;
  minimumOrderAmount: number;
  isActive: boolean;
  expiresAt: string | null;
}

export interface CategoryInput {
  name: string;
  description: string;
}

export interface MonthlySales {
  year: number;
  month: number;
  label: string;
  orders: number;
  itemsSold: number;
  sales: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  joinedAt: string;
  orders: number;
  totalSpent: number;
}

export interface AdminOffers {
  productsOnOffer: Product[];
  coupons: Coupon[];
}

/** Standard shape returned by every API endpoint */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; errors?: Record<string, string[]> };
