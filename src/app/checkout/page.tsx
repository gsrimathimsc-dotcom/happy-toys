"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Banknote, CreditCard, Landmark, Lock, ShoppingBag, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { apiFetch } from "@/lib/api";
import { saveToStorage, STORAGE_KEYS } from "@/lib/storage";
import { cn, formatPrice, validators } from "@/lib/utils";
import type { CustomerDetails, Order, PaymentMethod } from "@/types";
import OrderSummary from "@/components/cart/OrderSummary";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; hint: string; icon: LucideIcon }[] = [
  { value: "upi", label: "UPI", hint: "GPay, PhonePe, Paytm", icon: Smartphone },
  { value: "card", label: "Credit / Debit Card", hint: "Visa, Mastercard, RuPay", icon: CreditCard },
  { value: "netbanking", label: "Net Banking", hint: "All major banks", icon: Landmark },
  { value: "cod", label: "Cash on Delivery", hint: "Pay when it arrives", icon: Banknote },
];

type FormErrors = Partial<Record<keyof CustomerDetails, string>>;

const EMPTY_FORM: CustomerDetails = {
  name: "",
  email: "",
  mobile: "",
  address: "",
  city: "",
  pinCode: "",
};

function validate(form: CustomerDetails): FormErrors {
  const errors: FormErrors = {};
  if (!validators.required(form.name)) errors.name = "Please enter your full name.";
  if (!validators.email(form.email)) errors.email = "Please enter a valid email address.";
  if (!validators.mobile(form.mobile)) errors.mobile = "Enter a valid 10-digit Indian mobile number.";
  if (form.address.trim().length < 10) errors.address = "Please enter your full delivery address.";
  if (!validators.required(form.city)) errors.city = "Please enter your city.";
  if (!validators.pinCode(form.pinCode)) errors.pinCode = "Enter a valid 6-digit PIN code.";
  return errors;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, totals, isReady, clearCart } = useCart();
  const { showToast } = useToast();

  const [form, setForm] = useState<CustomerDetails>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [payment, setPayment] = useState<PaymentMethod>("upi");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);

  // Pre-fill name and email for logged-in (demo) users.
  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, name: f.name || user.name, email: f.email || user.email }));
    }
  }, [user]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof CustomerDetails]) {
      setErrors((e) => ({ ...e, [name]: undefined }));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      showToast("Please fix the highlighted fields.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const order = await apiFetch<Order>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customer: form,
          paymentMethod: payment,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      // Keep a copy in the browser too, in case the server restarts.
      saveToStorage(STORAGE_KEYS.lastOrder, order);
      setPlaced(true);
      clearCart();
      router.push(`/order-confirmation/${order.orderId}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not place order.", "error");
      setSubmitting(false);
    }
  };

  if (!isReady || placed) {
    return <Spinner label={placed ? "Placing your order..." : "Loading checkout..."} />;
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-12">
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
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-navy">Checkout</h1>

      <form onSubmit={handleSubmit} noValidate className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Delivery details */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-navy">1. Delivery Details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" name="name" value={form.name} error={errors.name} onChange={handleChange} placeholder="e.g. Priya Sharma" />
              <Field label="Email" name="email" type="email" value={form.email} error={errors.email} onChange={handleChange} placeholder="you@example.com" />
              <Field label="Mobile Number" name="mobile" type="tel" value={form.mobile} error={errors.mobile} onChange={handleChange} placeholder="10-digit mobile number" maxLength={10} />
              <Field label="City" name="city" value={form.city} error={errors.city} onChange={handleChange} placeholder="e.g. Chennai" />
              <div className="sm:col-span-2">
                <label htmlFor="address" className="mb-1.5 block text-sm font-semibold text-navy">
                  Delivery Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={form.address}
                  onChange={handleChange}
                  placeholder="House no., street, area, landmark"
                  className={cn("input-field resize-none", errors.address && "border-red-400")}
                />
                {errors.address && <p className="mt-1 text-xs font-medium text-red-600">{errors.address}</p>}
              </div>
              <Field label="PIN Code" name="pinCode" value={form.pinCode} error={errors.pinCode} onChange={handleChange} placeholder="6-digit PIN code" maxLength={6} />
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-navy">2. Payment Method</h2>
            <p className="mt-1 text-sm text-muted">This is a demo - no real payment will be taken.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {PAYMENT_OPTIONS.map(({ value, label, hint, icon: Icon }) => (
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
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      payment === value ? "bg-primary text-white" : "bg-slate-100 text-navy"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-navy">{label}</span>
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
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
            <Button type="submit" variant="accent" size="lg" fullWidth isLoading={submitting}>
              {!submitting && <Lock className="h-4 w-4" />}
              Place Order - {formatPrice(totals.total)}
            </Button>
          </OrderSummary>
        </div>
      </form>
    </div>
  );
}

interface FieldProps {
  label: string;
  name: keyof CustomerDetails;
  value: string;
  error?: string;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function Field({ label, name, value, error, type = "text", placeholder, maxLength, onChange }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-navy">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn("input-field", error && "border-red-400")}
      />
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
