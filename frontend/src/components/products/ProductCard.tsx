import { Link } from "react-router-dom";
import { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import PriceTag from "@/components/ui/PriceTag";
import StarRating from "@/components/ui/StarRating";
import Button from "@/components/ui/Button";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);
  const outOfStock = product.stockQuantity === 0;
  const saved = isWishlisted(product.id);

  const handleAdd = async () => {
    setAdding(true);
    await addToCart(product.id, 1);
    setAdding(false);
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/10">
      {/* Badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
        {product.discountPercentage > 0 && (
          <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-white">
            {product.discountPercentage}% OFF
          </span>
        )}
        {product.isNew && (
          <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white">
            NEW
          </span>
        )}
      </div>

      {/* Wishlist button */}
      <button
        onClick={() => toggleWishlist(product.id, product.name)}
        className={cn(
          "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110",
          saved ? "text-red-500" : "text-slate-400 hover:text-red-500"
        )}
        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart key={String(saved)} className={cn("h-5 w-5", saved && "animate-pop fill-red-500")} />
      </button>

      {/* Image */}
      <Link to={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-slate-50">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 group-hover:scale-110",
            outOfStock && "opacity-60 grayscale"
          )}
        />
        {outOfStock && (
          <span className="absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full bg-navy/85 px-3 py-1 text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{product.brand}</p>
        <Link
          to={`/products/${product.id}`}
          className="line-clamp-2 min-h-[2.5rem] font-semibold leading-snug text-navy transition hover:text-primary"
        >
          {product.name}
        </Link>
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        <PriceTag
          price={product.price}
          originalPrice={product.originalPrice}
          discount={product.discountPercentage}
        />
        <Button
          onClick={handleAdd}
          isLoading={adding}
          disabled={outOfStock}
          size="sm"
          fullWidth
          className="mt-auto min-h-10"
        >
          {!adding && <ShoppingCart className="h-4 w-4" />}
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </article>
  );
}
