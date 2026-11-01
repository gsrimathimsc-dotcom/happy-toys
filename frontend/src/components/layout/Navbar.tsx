import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Heart, LogOut, Menu, ShoppingCart, Truck, User, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCategories } from "@/hooks/useCategories";
import { cn, formatPrice, FREE_DELIVERY_THRESHOLD } from "@/lib/utils";
import Logo from "./Logo";
import SearchBar from "./SearchBar";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-white ring-2 ring-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const categories = useCategories();
  const { user, logout } = useAuth();
  const { totals } = useCart();
  const { ids: wishlistIds } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the page changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  const iconButton =
    "relative flex h-10 w-10 items-center justify-center rounded-full text-navy transition hover:bg-slate-100 hover:text-primary";

  return (
    <header className="sticky top-0 z-50 bg-white/95 shadow-sm backdrop-blur">
      {/* Announcement bar */}
      <div className="bg-navy text-white">
        <p className="container-page flex items-center justify-center gap-2 py-2 text-xs font-medium sm:text-sm">
          <Truck className="h-4 w-4 text-secondary" />
          Free delivery on orders above {formatPrice(FREE_DELIVERY_THRESHOLD)} | Demo store - no real payments
        </p>
      </div>

      {/* Main bar */}
      <div className="container-page flex h-16 items-center gap-4 lg:h-20 lg:gap-8">
        <button
          className={cn(iconButton, "lg:hidden")}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <Logo />

        <div className="hidden flex-1 lg:block">
          <SearchBar />
        </div>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="flex items-center gap-2 rounded-full bg-primary-light px-3 py-1.5 text-sm font-semibold text-primary">
                <User className="h-4 w-4" />
                Hi, {user.name.split(" ")[0]}
              </span>
              <button onClick={logout} className={iconButton} aria-label="Log out" title="Log out">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-navy transition hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
              >
                Register
              </Link>
            </div>
          )}

          <Link to="/wishlist" className={iconButton} aria-label="Wishlist">
            <Heart className="h-6 w-6" />
            <CountBadge count={wishlistIds.length} />
          </Link>
          <Link to="/cart" className={iconButton} aria-label="Shopping cart">
            <ShoppingCart className="h-6 w-6" />
            <CountBadge count={totals.itemCount} />
          </Link>
        </nav>
      </div>

      {/* Search on mobile/tablet */}
      <div className="container-page pb-3 lg:hidden">
        <SearchBar />
      </div>

      {/* Category strip (desktop) */}
      <div className="hidden border-t border-slate-100 lg:block">
        <ul className="container-page flex items-center gap-1 overflow-x-auto py-1">
          <li>
            <Link
              to="/products"
              className="block whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-primary hover:bg-primary-light"
            >
              All Toys
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                to={`/products?category=${category.id}`}
                className="block whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-navy transition hover:bg-slate-100 hover:text-primary"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="animate-fade-in border-t border-slate-100 bg-white lg:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {user ? (
              <div className="mb-2 flex items-center justify-between rounded-xl bg-primary-light px-4 py-3">
                <span className="font-semibold text-primary">Hi, {user.name}</span>
                <button onClick={logout} className="text-sm font-semibold text-navy">
                  Log out
                </button>
              </div>
            ) : (
              <div className="mb-2 grid grid-cols-2 gap-2">
                <Link to="/login" className="rounded-full border border-primary py-2.5 text-center text-sm font-semibold text-primary">
                  Login
                </Link>
                <Link to="/register" className="rounded-full bg-primary py-2.5 text-center text-sm font-semibold text-white">
                  Register
                </Link>
              </div>
            )}
            <Link to="/products" className="rounded-lg px-3 py-2.5 font-semibold text-primary hover:bg-slate-50">
              All Toys
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="rounded-lg px-3 py-2.5 text-navy hover:bg-slate-50"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
