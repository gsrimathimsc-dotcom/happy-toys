import type { Category, PagedResult, Product, ProductDetails, StoreSummary } from "@/types";
import { apiRequest } from "./apiClient";

/** The most products one request may return. Pagination arrives with the catalog work. */
const MAX_PAGE_SIZE = 100;

export function getProducts(filters?: URLSearchParams): Promise<PagedResult<Product>> {
  const params = new URLSearchParams(filters);
  params.set("pageSize", String(MAX_PAGE_SIZE));
  return apiRequest({ url: "/api/products", params });
}

export type ProductCollection = "featured" | "best-sellers" | "new-arrivals" | "offers";

export async function getCollection(collection: ProductCollection, limit = 4): Promise<Product[]> {
  const result = await apiRequest<PagedResult<Product>>({
    url: "/api/products",
    params: { collection, pageSize: limit },
  });
  return result.items;
}

export function getProductDetails(id: string): Promise<ProductDetails> {
  return apiRequest({ url: `/api/products/${encodeURIComponent(id)}` });
}

export function getStoreSummary(): Promise<StoreSummary> {
  return apiRequest({ url: "/api/products/summary" });
}

export function getCategories(): Promise<Category[]> {
  return apiRequest({ url: "/api/categories" });
}

/** A few matches for the search box dropdown. */
export function searchSuggestions(term: string, limit = 6): Promise<PagedResult<Product>> {
  return apiRequest({ url: "/api/products", params: { q: term, pageSize: limit } });
}
