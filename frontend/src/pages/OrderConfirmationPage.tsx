import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CircleAlert, CircleCheck, Mail, MapPin, Package, Wallet } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { PAYMENT_LABELS } from "@/lib/constants";
import { loadFromStorage, STORAGE_KEYS } from "@/lib/storage";
import { formatPrice } from "@/lib/utils";
import { getOrder } from "@/services/orderService";
import type { Order } from "@/types";
import OrderSummary from "@/components/cart/OrderSummary";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

export default function OrderConfirmationPage() {
  useDocumentTitle("Order Confirmation");
  const { orderId = "" } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Ask the backend: GET /api/orders/:id
    getOrder(orderId)
      .then(setOrder)
      .catch((err: Error) => {
        // 2. Fallback: the copy saved in the browser at checkout.
        const saved = loadFromStorage<Order | null>(STORAGE_KEYS.lastOrder, null);
        if (saved && saved.id === orderId) setOrder(saved);
        else setError(err.message);
      });
  }, [orderId]);

  if (error) {
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <CircleAlert className="h-12 w-12 text-red-500" />
        <h1 className="mt-4 text-2xl font-bold text-navy">Order not found</h1>
        <p className="mt-2 max-w-md text-muted">{error}</p>
        <Button href="/products" className="mt-6">
          Continue Shopping
        </Button>
      </div>
    );
  }

  if (!order) return <Spinner label="Loading your order..." />;

  const deliveryDate = new Date(order.createdDate);
  deliveryDate.setDate(deliveryDate.getDate() + 4);
  const { customer } = order;

  return (
    <div className="container-page py-10">
      {/* Success banner */}
      <div className="mx-auto max-w-3xl animate-slide-up text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CircleCheck className="h-12 w-12 text-green-600" />
        </span>
        <h1 className="mt-5 text-3xl font-extrabold text-navy sm:text-4xl">Order placed successfully!</h1>
        <p className="mt-2 text-muted">
          Thank you, {customer.name.split(" ")[0]}! Your toys are getting ready for their journey.
        </p>
        <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 shadow-sm ring-1 ring-slate-100">
          <span className="text-sm text-muted">Order number</span>
          <span className="font-mono text-lg font-bold text-primary">{order.id}</span>
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
              <Package className="h-5 w-5 text-primary" /> Items in this order
            </h2>
            <ul className="mt-4 divide-y divide-slate-100">
              {order.items.map((item) => (
                <li key={item.productId} className="flex items-center gap-4 py-3">
                  <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-navy">{item.name}</p>
                    <p className="text-sm text-muted">
                      {item.quantity} x {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Delivery + payment */}
          <section className="grid gap-4 sm:grid-cols-2">
            <InfoCard icon={MapPin} title="Delivering to">
              <p className="font-semibold text-navy">{customer.name}</p>
              <p>{customer.address}</p>
              <p>
                {customer.city}, {customer.state} - {customer.pinCode}
              </p>
              <p>Mobile: {customer.mobile}</p>
            </InfoCard>
            <InfoCard icon={Wallet} title="Payment & delivery">
              <p>
                Payment method: <span className="font-semibold text-navy">{PAYMENT_LABELS[order.paymentMethod]}</span> (demo)
              </p>
              <p>
                Expected by{" "}
                <span className="font-semibold text-navy">
                  {deliveryDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                </span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" /> Confirmation for {customer.email}
              </p>
            </InfoCard>
          </section>
        </div>

        <div className="space-y-4">
          <OrderSummary totals={order.totals} title="Payment Summary" />
          <Button href="/products" size="lg" fullWidth>
            Continue Shopping
          </Button>
          <Button href="/" variant="ghost" fullWidth>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof MapPin;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm">
      <h3 className="mb-2 flex items-center gap-2 font-bold text-navy">
        <Icon className="h-5 w-5 text-primary" /> {title}
      </h3>
      {children}
    </div>
  );
}
