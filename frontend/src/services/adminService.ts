import type {
  AdminDashboard,
  AdminOffers,
  Category,
  CategoryInput,
  Coupon,
  CouponInput,
  Customer,
  DailySales,
  MonthlySales,
  Order,
  OrderStatus,
  Product,
  ProductInput,
} from "@/types";
import { apiRequest } from "./apiClient";

export function getDashboard(): Promise<AdminDashboard> {
  return apiRequest({ url: "/api/admin/dashboard" });
}

export function getAdminProducts(): Promise<Product[]> {
  return apiRequest({ url: "/api/admin/products" });
}

export function getAdminOrders(status?: OrderStatus): Promise<Order[]> {
  return apiRequest({ url: "/api/admin/orders", params: status ? { status } : undefined });
}

export function getDailySales(days: number): Promise<DailySales[]> {
  return apiRequest({ url: "/api/admin/reports/daily", params: { days } });
}

export function getMonthlySales(months: number): Promise<MonthlySales[]> {
  return apiRequest({ url: "/api/admin/reports/monthly", params: { months } });
}

export function getCustomers(): Promise<Customer[]> {
  return apiRequest({ url: "/api/admin/customers" });
}

export function createCategory(category: CategoryInput): Promise<Category> {
  return apiRequest({ url: "/api/categories", method: "POST", data: category });
}

export function updateCategory(id: string, category: CategoryInput): Promise<Category> {
  return apiRequest({ url: `/api/categories/${encodeURIComponent(id)}`, method: "PUT", data: category });
}

export function deleteCategory(id: string): Promise<unknown> {
  return apiRequest({ url: `/api/categories/${encodeURIComponent(id)}`, method: "DELETE" });
}

export function createCoupon(coupon: CouponInput): Promise<Coupon> {
  return apiRequest({ url: "/api/admin/coupons", method: "POST", data: coupon });
}

export function updateCoupon(id: number, coupon: CouponInput): Promise<Coupon> {
  return apiRequest({ url: `/api/admin/coupons/${id}`, method: "PUT", data: coupon });
}

export function deleteCoupon(id: number): Promise<unknown> {
  return apiRequest({ url: `/api/admin/coupons/${id}`, method: "DELETE" });
}

export function getOffers(): Promise<AdminOffers> {
  return apiRequest({ url: "/api/admin/offers" });
}

export function createProduct(product: ProductInput): Promise<Product> {
  return apiRequest({ url: "/api/products", method: "POST", data: product });
}

export function updateProduct(id: string, product: ProductInput): Promise<Product> {
  return apiRequest({ url: `/api/products/${encodeURIComponent(id)}`, method: "PUT", data: product });
}

export function updateStock(id: string, stockQuantity: number): Promise<Product> {
  return apiRequest({
    url: `/api/products/${encodeURIComponent(id)}/stock`,
    method: "PATCH",
    data: { stockQuantity },
  });
}

export function deleteProduct(id: string): Promise<unknown> {
  return apiRequest({ url: `/api/products/${encodeURIComponent(id)}`, method: "DELETE" });
}

export function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return apiRequest({
    url: `/api/orders/${encodeURIComponent(id)}/status`,
    method: "PUT",
    data: { status },
  });
}

/** The fields the API needs to save a product, taken from a loaded product. */
export function toProductInput(product: Product): ProductInput {
  return {
    name: product.name,
    categoryId: product.categoryId,
    brand: product.brand,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    imageUrl: product.imageUrl,
    stockQuantity: product.stockQuantity,
    isActive: product.isActive,
    ageGroup: product.ageGroup,
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
    isNew: product.isNew,
    specifications: product.specifications,
  };
}
