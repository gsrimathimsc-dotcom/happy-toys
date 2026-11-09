import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Banknote, CreditCard, Lock, ShoppingBag, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { INDIAN_STATES, PAYMENT_LABELS } from "@/lib/constants";
import { saveToStorage, STORAGE_KEYS } from "@/lib/storage";
import { cn, formatPrice } from "@/lib/utils";
import { ApiError } from "@/services/apiClient";
import { placeOrder } from "@/services/orderService";
import type { PaymentMethod } from "@/types";
import { checkoutSchema, type CheckoutValues } from "@/validation/schemas";
import OrderSummary from "@/components/cart/OrderSummary";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import FormField from "@/components/ui/FormField";
import Spinner from "@/components/ui/Spinner";

const PAYMENT_OPTIONS: { value: PaymentMethod; hint: string; icon: LucideIcon }[] = [
  { value: "cod", hint: "Pay when it arrives", icon: Banknote },
  { value: "upi", hint: "Simulation only", icon: Smartphone },
  { value: "card", hint: "Simulation only", icon: CreditCard },
];

const EMPTY_FORM: CheckoutValues = {
  name: "",
  email: "",
  mobile: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",
};

export default function CheckoutPage() {
  useDocumentTitle("Checkout");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totals, clearCart, syncCart } = useCart();
  const { showToast } = useToast();

  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [placed, setPlaced] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({ resolver: zodResolver(checkoutSchema), defaultValues: EMPTY_FORM });

  // Show today's prices and stock before the customer pays.
  useEffect(() => {
    void syncCart();
  }, [syncCart]);

  // Pre-fill anything saved on a logged-in (demo) user's account.
  useEffect(() => {
    if (!user) return;
    reset(
      (current) => ({
        name: current.name || user.name,
        email: current.email || user.email,
        mobile: current.mobile || user.mobile,
        address: current.address || user.address,
        city: current.city || user.city,
        state: current.state || user.state,
        pinCode: current.pinCode || user.pinCode,
      }),
      { keepErrors: true }
    );
  }, [user, reset]);

  const submitOrder = async (customer: CheckoutValues) => {
    try {
      const order = await placeOrder({
        customer,
        paymentMethod: payment,
        items: items.map(({ productId, quantity }) => ({ productId, quantity })),
      });
      // Keep a copy in the browser too, in case the server restarts.
      saveToStorage(STORAGE_KEYS.lastOrder, order);
      setPlaced(true);
      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not place order.", "error");
      // Stock or prices changed: bring the cart up to date so it can be retried.
      if (error instanceof ApiError && error.status === 409) await syncCart();
    }
  };

  if (placed) return <Spinner label="Placing your order..." />;

  if (items.length === 0) {
    return (
      <div className="container-page py-12">
        <h1 className="sr-only">Checkout</h1>
        <EmptyState
          icon={ShoppingBag}
          title="Nothing to check out"
          message="Your cart is empty. Add some toys to your cart before checking out."
          actionLabel="Browse Toys"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-extrabold sm:text-3xl tracking-tight text-navy">Checkout</h1>

      <form
        onSubmit={handleSubmit(submitOrder, () => showToast("Please fix the highlighted fields.", "error"))}
        noValidate
        className="grid gap-8 lg:grid-cols-3"
      >
        <div className="space-y-6 lg:col-span-2">
          {/* Delivery details */}
          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-navy">1. Delivery Details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FormField label="Full Name" placeholder="e.g. Priya Sharma" autoComplete="name" error={errors.name?.message} {...register("name")} />
              <FormField label="Email" type="email" placeholder="you@example.com" autoComplete="email" error={errors.email?.message} {...register("email")} />
              <FormField label="Mobile Number" type="tel" placeholder="10-digit mobile number" maxLength={10} autoComplete="tel-national" error={errors.mobile?.message} {...register("mobile")} />
              <FormField label="City" placeholder="e.g. Chennai" autoComplete="address-level2" error={errors.city?.message} {...register("city")} />
              <div className="sm:col-span-2">
                <label htmlFor="address" className="mb-1.5 block text-sm font-semibold text-navy">
                  Delivery Address
                </label>
                <textarea
                  id="address"
                  rows={3}
                  placeholder="House no., street, area, landmark"
                  autoComplete="street-address"
                  aria-invalid={errors.address ? true : undefined}
                  className={cn("input-field resize-none", errors.address && "border-red-400")}
                  {...register("address")}
                />
                {errors.address && <p className="mt-1 text-xs font-medium text-red-600">{errors.address.message}</p>}
              </div>
              <div>
                <label htmlFor="state" className="mb-1.5 block text-sm font-semibold text-navy">
                  State
                </label>
                <select
                  id="state"
                  autoComplete="address-level1"
                  aria-invalid={errors.state ? true : undefined}
                  className={cn("input-field", errors.state && "border-red-400")}
                  {...register("state")}
                >
                  <option value="">Choose your state</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.state && <p className="mt-1 text-xs font-medium text-red-600">{errors.state.message}</p>}
              </div>
              <FormField label="PIN Code" placeholder="6-digit PIN code" maxLength={6} autoComplete="postal-code" error={errors.pinCode?.message} {...register("pinCode")} />
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-navy">2. Payment Method</h2>
            <p className="mt-1 text-sm text-muted">This is a demo - no real payment will be taken.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {PAYMENT_OPTIONS.map(({ value, hint, icon: Icon }) => (
                <label
                  key={value}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition",
                    payment === value ? "border-primary bg-primary-light/50" : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={value}
                    checked={payment === value}
                    onChange={() => setPayment(value)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      payment === value ? "bg-primary text-white" : "bg-slate-100 text-navy"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-navy">{PAYMENT_LABELS[value]}</span>
                    <span className="block text-xs text-muted">{hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-44 lg:self-start">
          <div className="mb-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-bold text-navy">Items ({totals.itemCount})</h2>
            <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3">
                  <img src={item.imageUrl} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-navy">{item.name}</p>
                    <p className="text-xs text-muted">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
          </div>
          <OrderSummary totals={totals}>
            <Button type="submit" variant="accent" size="lg" fullWidth isLoading={isSubmitting}>
              {!isSubmitting && <Lock className="h-4 w-4" />}
              Place Order - {formatPrice(totals.total)}
            </Button>
          </OrderSummary>
        </div>
      </form>
    </div>
  );
}
