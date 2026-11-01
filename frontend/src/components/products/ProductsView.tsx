import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CircleAlert, PackageSearch, SlidersHorizontal, X } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { SORT_OPTIONS } from "@/lib/constants";
import { getProducts } from "@/services/productService";
import type { Product } from "@/types";
import ProductFilters, { type FilterValues } from "./ProductFilters";
import ProductGrid from "./ProductGrid";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";

/**
 * The product listing UI. All filters live in the URL
 * (e.g. /products?category=soft-toys&sort=price-asc) so links can be shared.
 */
export default function ProductsView() {
  const categories = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") ?? "";
  const search = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "popularity";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const queryString = searchParams.toString();

  // Fetch products whenever the URL filters change.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getProducts(new URLSearchParams(queryString))
      .then((result) => {
        if (cancelled) return;
        setProducts(result.items);
        setTotalCount(result.totalCount);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [queryString, reloadKey]);

  /** Updates one or more URL parameters (empty values are removed). */
  const updateParams = (changes: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    setSearchParams(params, { replace: true, preventScrollReset: true });
  };

  const handleFilterChange = (changes: Partial<FilterValues>) => {
    updateParams(changes as Record<string, string>);
    setShowFilters(false);
  };

  const clearAll = () => {
    setSearchParams({}, { replace: true, preventScrollReset: true });
    setShowFilters(false);
  };

  const activeCategory = categories.find((c) => c.id === category);
  const heading = search ? `Results for "${search}"` : (activeCategory?.name ?? "All Toys");

  const filters = (
    <ProductFilters
      categories={categories}
      values={{ category, minPrice, maxPrice }}
      onChange={handleFilterChange}
      onClear={clearAll}
    />
  );

  return (
    <div className="container-page py-8">
      {/* Page header */}
      <div className="mb-6">
        <p className="text-sm text-muted">Home / Products{activeCategory ? ` / ${activeCategory.name}` : ""}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy">{heading}</h1>
        {activeCategory && !search && <p className="mt-1 text-muted">{activeCategory.description}</p>}
      </div>

      <div className="flex gap-8">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-44 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            {filters}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowFilters(true)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <p className="px-1 text-sm text-muted">
                {loading ? "Loading..." : `${totalCount} product${totalCount === 1 ? "" : "s"}`}
              </p>
              {search && (
                <button
                  onClick={() => updateParams({ q: "" })}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary"
                >
                  &ldquo;{search}&rdquo; <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted">Sort by</span>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 font-semibold text-navy outline-none focus:border-primary"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Results */}
          {loading ? (
            <Spinner label="Finding the best toys..." />
          ) : error ? (
            <div className="flex flex-col items-center rounded-2xl border border-red-100 bg-red-50 p-10 text-center">
              <CircleAlert className="h-10 w-10 text-red-500" />
              <p className="mt-3 font-semibold text-red-700">{error}</p>
              <Button className="mt-5" onClick={() => setReloadKey((k) => k + 1)}>
                Try again
              </Button>
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No toys found"
              message="Try a different search term or clear some filters to see more products."
              actionLabel="View all toys"
              actionHref="/products"
            />
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>

      {/* Filter drawer (mobile/tablet) */}
      {showFilters && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-navy/50" onClick={() => setShowFilters(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] animate-slide-up overflow-y-auto bg-white p-5 shadow-2xl">
            <button
              onClick={() => setShowFilters(false)}
              className="mb-4 ml-auto flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
            {filters}
          </div>
        </div>
      )}
    </div>
  );
}
