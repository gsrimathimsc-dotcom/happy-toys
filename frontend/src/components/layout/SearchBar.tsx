import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatPrice } from "@/lib/utils";
import { searchSuggestions } from "@/services/productService";
import type { Product } from "@/types";
import SearchCombobox from "@/components/ui/SearchCombobox";

const MIN_SUGGESTION_LENGTH = 2;

/**
 * Search box used in the navbar.
 * - On every page it shows a dropdown of matching toys, and Enter opens the full results.
 * - On the products page it also filters the list behind it as the customer types.
 */
export default function SearchBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const currentSearch = searchParams.get("q") ?? "";
  const [term, setTerm] = useState(currentSearch);
  const debouncedTerm = useDebouncedValue(term.trim(), 400);
  // The last search this box put in the URL itself.
  const sentTerm = useRef(currentSearch);
  const onProductsPage = pathname === "/products";

  const [matches, setMatches] = useState<{ term: string; items: Product[]; total: number } | null>(null);

  // Keep the box in step with the URL, e.g. when a search is cleared elsewhere.
  useEffect(() => {
    if (currentSearch !== sentTerm.current) {
      sentTerm.current = currentSearch;
      setTerm(currentSearch);
    }
  }, [currentSearch]);

  // On the products page, filter the list as the customer types.
  useEffect(() => {
    if (!onProductsPage || debouncedTerm === currentSearch) return;
    sentTerm.current = debouncedTerm;
    const params = new URLSearchParams(searchParams);
    if (debouncedTerm) params.set("q", debouncedTerm);
    else params.delete("q");
    navigate(`/products?${params.toString()}`, { replace: true, preventScrollReset: true });
    // Only a new debounced term should trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTerm]);

  // Look up a few matches for the dropdown.
  useEffect(() => {
    if (debouncedTerm.length < MIN_SUGGESTION_LENGTH) {
      setMatches(null);
      return;
    }
    let cancelled = false;
    searchSuggestions(debouncedTerm)
      .then((result) => {
        if (!cancelled) setMatches({ term: debouncedTerm, items: result.items, total: result.totalCount });
      })
      .catch(() => {
        if (!cancelled) setMatches({ term: debouncedTerm, items: [], total: 0 });
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedTerm]);

  const openResults = (value: string) => {
    sentTerm.current = value;
    navigate(value ? `/products?q=${encodeURIComponent(value)}` : "/products");
  };

  // Matches belong to the term they were found for. While the customer is still typing, show "Searching...".
  const current = matches && matches.term === term.trim() ? matches : null;

  return (
    <SearchCombobox<Product>
      label="Search products"
      placeholder="Search for toys, brands and more..."
      value={term}
      onValueChange={setTerm}
      suggestions={current ? current.items : null}
      getKey={(product) => product.id}
      onSelect={(product) => navigate(`/products/${product.id}`)}
      onSubmit={openResults}
      minLength={MIN_SUGGESTION_LENGTH}
      emptyText={(typed) => `No toys found for "${typed}".`}
      showSubmitButton
      inputClassName="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-5 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
      renderItem={(product) => (
        <span className="flex items-center gap-3">
          <img src={product.imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-slate-50 object-cover" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-navy">{product.name}</span>
            <span className="block truncate text-xs text-muted">{product.categoryName}</span>
          </span>
          <span className="text-sm font-bold text-navy">{formatPrice(product.price)}</span>
        </span>
      )}
      footer={(close) =>
        current && current.total > 0 ? (
          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              close();
              openResults(current.term);
            }}
            className="w-full border-t border-slate-100 px-4 py-3 text-left text-sm font-semibold text-primary hover:bg-slate-50"
          >
            See all {current.total} result{current.total === 1 ? "" : "s"} for &ldquo;{current.term}&rdquo;
          </button>
        ) : null
      }
    />
  );
}
