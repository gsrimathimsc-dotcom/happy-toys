import { ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import CartItemRow from "@/components/cart/CartItemRow";
import OrderSummary from "@/components/cart/OrderSummary";
import Button from "@/components/ui/Button";
import HomeLink from "@/components/ui/HomeLink";
import EmptyState from "@/components/ui/EmptyState";

export default function CartPage() {
  useDocumentTitle("Shopping Cart");
  const { items, totals, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-page py-12">
        <HomeLink className="mb-2" />
        <h1 className="sr-only">Shopping Cart</h1>
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Looks like you haven't added any toys yet. Explore our collection and find something fun!"
          actionLabel="Start Shopping"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <HomeLink className="mb-1" />
          <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
            Shopping Cart <span className="text-lg font-semibold text-muted">({totals.itemCount} items)</span>
          </h1>
        </div>
        <button onClick={clearCart} className="min-h-10 px-1 text-sm font-semibold text-red-500 hover:text-red-600">
          Clear cart
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            {items.map((item) => (
              <CartItemRow key={item.productId} item={item} />
            ))}
          </div>
          <Button href="/products" variant="ghost" className="mt-4">
            ← Continue Shopping
          </Button>
        </div>

        <div className="lg:sticky lg:top-44 lg:self-start">
          <OrderSummary totals={totals}>
            <Button href="/checkout" variant="accent" size="lg" fullWidth>
              Proceed to Checkout <ArrowRight className="h-5 w-5" />
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
              <ShieldCheck className="h-4 w-4 text-green-600" /> Safe & secure checkout (demo)
            </p>
          </OrderSummary>
        </div>
      </div>
    </div>
  );
}
