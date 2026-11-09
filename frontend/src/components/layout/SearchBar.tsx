import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatPrice } from "@/lib/utils";
import { searchSuggestions } from "@/services/productService";
import type { Product } from "@/types";

const MIN_SUGGESTION_LENGTH = 2;

/**
 * Search box used in the navbar.
 * - On the products page it filters the list as the customer types (after a short pause).
 * - On other pages it shows a dropdown of matching toys, and Enter opens the full results.
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

  const boxRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[] | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Keep the box in step with the URL, e.g. when a search is cleared elsewhere.
  useEffect(() => {
    if (currentSearch !== sentTerm.current) {
      sentTerm.current = currentSearch;
      setTerm(currentSearch);
    }
  }, [currentSearch]);

  // On the products page, search as the customer types.
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

  // Elsewhere, look up a few matches for the dropdown.
  useEffect(() => {
    if (onProductsPage || !open || debouncedTerm.length < MIN_SUGGESTION_LENGTH) {
      setSuggestions(null);
      return;
    }
    let cancelled = false;
    searchSuggestions(debouncedTerm)
      .then((result) => {
        if (cancelled) return;
        setSuggestions(result.items);
        setTotalCount(result.totalCount);
      })
      .catch(() => {
        if (!cancelled) setSuggestions(null);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedTerm, open, onProductsPage]);

  // Close the dropdown on a click outside the box or when the page changes.
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const q = term.trim();
    sentTerm.current = q;
    setOpen(false);
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  };

  const typing = term.trim();
  // The dropdown is for a term that has been typed and has settled (debounced).
  const showDropdown = open && !onProductsPage && typing.length >= MIN_SUGGESTION_LENGTH && typing === debouncedTerm;

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative w-full" role="search">
        <input
          type="search"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Search for toys, brands and more..."
          className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-5 pr-12 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
          aria-label="Search products"
          aria-expanded={showDropdown}
          autoComplete="off"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      {showDropdown && (
        <div
          role="listbox"
          aria-label="Search suggestions"
          className="absolute inset-x-0 top-full z-[70] mt-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl animate-drop-in"
        >
          {suggestions === null ? (
            <p className="px-4 py-3 text-sm text-muted">Searching...</p>
          ) : suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">No toys found for &ldquo;{typing}&rdquo;.</p>
          ) : (
            <>
              <ul className="max-h-[60dvh] divide-y divide-slate-50 overflow-y-auto">
                {suggestions.map((product) => (
                  <li key={product.id} role="option" aria-selected={false}>
                    <Link
                      to={`/products/${product.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-slate-50"
                    >
                      <img src={product.imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-slate-50 object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-navy">{product.name}</span>
                        <span className="block truncate text-xs text-muted">{product.categoryName}</span>
                      </span>
                      <span className="text-sm font-bold text-navy">{formatPrice(product.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full border-t border-slate-100 px-4 py-3 text-left text-sm font-semibold text-primary hover:bg-slate-50"
              >
                See all {totalCount} result{totalCount === 1 ? "" : "s"} for &ldquo;{typing}&rdquo;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
