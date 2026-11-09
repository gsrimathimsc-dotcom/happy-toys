import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

/** Search box used in the navbar. Sends the user to /products?q=... */
export default function SearchBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const currentSearch = searchParams.get("q") ?? "";
  const [term, setTerm] = useState(currentSearch);
  const debouncedTerm = useDebouncedValue(term.trim(), 400);
  // The last search this box put in the URL itself.
  const sentTerm = useRef(currentSearch);

  // Keep the box in step with the URL, e.g. when a search is cleared elsewhere.
  useEffect(() => {
    if (currentSearch !== sentTerm.current) {
      sentTerm.current = currentSearch;
      setTerm(currentSearch);
    }
  }, [currentSearch]);

  // While browsing the products, search as the customer types (after a short pause).
  useEffect(() => {
    if (pathname !== "/products" || debouncedTerm === currentSearch) return;
    sentTerm.current = debouncedTerm;
    const params = new URLSearchParams(searchParams);
    if (debouncedTerm) params.set("q", debouncedTerm);
    else params.delete("q");
    navigate(`/products?${params.toString()}`, { replace: true, preventScrollReset: true });
    // Only a new debounced term should trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTerm]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const q = term.trim();
    sentTerm.current = q;
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full" role="search">
      <input
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search for toys, brands and more..."
        className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-5 pr-12 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
        aria-label="Search products"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}
