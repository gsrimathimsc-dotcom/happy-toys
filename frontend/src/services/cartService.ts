import type { CartValidation } from "@/types";
import { apiRequest } from "./apiClient";

export interface CartLine {
  productId: string;
  quantity: number;
}

/** Checks cart lines against the current prices and stock. Nothing is saved. */
export function validateCart(items: CartLine[]): Promise<CartValidation> {
  return apiRequest({ url: "/api/cart/validate", method: "POST", data: { items } });
}
