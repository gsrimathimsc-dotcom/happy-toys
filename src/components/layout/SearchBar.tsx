"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";

/** Search box used in the navbar. Sends the user to /products?q=... */
export default function SearchBar({ onSearch }: { onSearch?: () => void }) {
  const router = useRouter();
  const [term, setTerm] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const q = term.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    onSearch?.();
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
