import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice, LOW_STOCK_LIMIT } from "@/lib/utils";
import type { CartItem } from "@/types";
import QuantitySelector from "@/components/ui/QuantitySelector";

export default function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex gap-4 p-4 sm:p-5">
      <Link
        to={`/products/${item.productId}`}
        className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-50 sm:h-28 sm:w-28"
      >
        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <Link
            to={`/products/${item.productId}`}
            className="line-clamp-2 font-semibold text-navy hover:text-primary"
          >
            {item.name}
          </Link>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-bold text-navy">{formatPrice(item.price)}</span>
            {item.originalPrice > item.price && (
              <span className="text-sm text-muted line-through">{formatPrice(item.originalPrice)}</span>
            )}
          </div>
          {item.stockQuantity <= LOW_STOCK_LIMIT && <p className="mt-1 text-xs font-medium text-accent">Only {item.stockQuantity} left</p>}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap sm:justify-end sm:gap-4">
          <QuantitySelector
            value={item.quantity}
            max={item.stockQuantity}
            onChange={(q) => updateQuantity(item.productId, q)}
            size="sm"
          />
          <p className="order-last w-full text-right font-bold text-navy sm:order-none sm:w-24">{formatPrice(item.price * item.quantity)}</p>
          <button
            onClick={() => removeFromCart(item.productId)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
