import type { CustomerDetails, Order, PaymentMethod } from "@/types";
import { apiRequest } from "./apiClient";
import type { CartLine } from "./cartService";

export interface NewOrder {
  customer: CustomerDetails;
  paymentMethod: PaymentMethod;
  items: CartLine[];
}

export function placeOrder(order: NewOrder): Promise<Order> {
  return apiRequest({ url: "/api/orders", method: "POST", data: order });
}

export function getOrder(id: string): Promise<Order> {
  return apiRequest({ url: `/api/orders/${encodeURIComponent(id)}` });
}
