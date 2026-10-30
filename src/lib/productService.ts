// ---------------------------------------------------------------
// Product "service": the only place that reads the mock JSON data.
// API routes and server pages both call these functions.
// In a real app, this is where database queries would go.
// ---------------------------------------------------------------
import productsData from "@/data/products.json";
import categoriesData from "@/data/categories.json";
import type { Category, Product, ProductQuery, SortOption } from "@/types";
import { SORT_OPTIONS } from "./constants";

// JSON imports are loosely typed, so we tell TypeScript the real shape.
const products = productsData as unknown as Product[];
const categories = categoriesData as unknown as Category[];

export function getCategories(): Category[] {
  return categories;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProducts(query: ProductQuery = {}): Product[] {
  let result = [...products];

  if (query.category) {
    result = result.filter((p) => p.category === query.category);
  }

  if (query.search) {
    const term = query.search.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        (getCategoryBySlug(p.category)?.name.toLowerCase().includes(term) ?? false)
    );
  }

  if (typeof query.minPrice === "number") {
    const min = query.minPrice;
    result = result.filter((p) => p.price >= min);
  }
  if (typeof query.maxPrice === "number") {
    const max = query.maxPrice;
    result = result.filter((p) => p.price <= max);
  }

  switch (query.sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "popularity":
    default:
      result.sort((a, b) => b.reviewCount - a.reviewCount);
  }

  if (query.limit && query.limit > 0) {
    result = result.slice(0, query.limit);
  }

  return result;
}

export function getFeaturedProducts(limit = 8): Product[] {
  return products.filter((p) => p.isFeatured).slice(0, limit);
}

export function getBestSellers(limit = 8): Product[] {
  return products
    .filter((p) => p.isBestSeller)
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

export function getNewArrivals(limit = 8): Product[] {
  return products
    .filter((p) => p.isNew)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

/** "Special offers" = in-stock products with the biggest discounts. */
export function getSpecialOffers(limit = 4): Product[] {
  return products
    .filter((p) => p.stock > 0)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, limit);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .concat(products.filter((p) => p.category !== product.category && p.isBestSeller))
    .slice(0, limit);
}

export function countProductsInCategory(slug: string): number {
  return products.filter((p) => p.category === slug).length;
}

/** Parses URL search params into a ProductQuery (used by the API route). */
export function parseProductQuery(params: URLSearchParams): ProductQuery {
  const toNumber = (value: string | null) => {
    if (value === null || value.trim() === "") return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  };
  const sort = params.get("sort");
  const validSorts = SORT_OPTIONS.map((o) => o.value) as string[];

  return {
    category: params.get("category") || undefined,
    search: params.get("q") || undefined,
    minPrice: toNumber(params.get("minPrice")),
    maxPrice: toNumber(params.get("maxPrice")),
    sort: sort && validSorts.includes(sort) ? (sort as SortOption) : undefined,
    limit: toNumber(params.get("limit")),
  };
}
