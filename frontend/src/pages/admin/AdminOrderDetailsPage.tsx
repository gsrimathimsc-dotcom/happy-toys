import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AdminHeading, formatDateTime, LoadState, OrderStatusBadge } from "@/components/admin/AdminParts";
import OrderSummary from "@/components/cart/OrderSummary";
import Button from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useLoad } from "@/hooks/useLoad";
import { PAYMENT_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { updateOrderStatus } from "@/services/adminService";
import { getOrder } from "@/services/orderService";
import type { OrderStatus } from "@/types";

/** What can happen next at each stage. These match the rules in the API. */
const NEXT_STAGES: Record<OrderStatus, { status: OrderStatus; label: string }[]> = {
  confirmed: [{ status: "processing", label: "Start Processing" }, { status: "cancelled", label: "Cancel Order" }],
  processing: [{ status: "shipped", label: "Mark as Shipped" }, { status: "cancelled", label: "Cancel Order" }],
  shipped: [{ status: "delivered", label: "Mark as Delivered" }],
  delivered: [],
  cancelled: [],
};

export default function AdminOrderDetailsPage() {
  const { id = "" } = useParams<{ id: string }>();
  useDocumentTitle(`Order ${id}`);
  const { showToast } = useToast();
  const { data: order, error, reload } = useLoad(() => getOrder(id), id);
  const [saving, setSaving] = useState<OrderStatus | null>(null);

  if (!order) return <LoadState error={error} onRetry={reload} />;

  const changeStatus = async (status: OrderStatus) => {
    if (status === "cancelled" && !window.confirm("Cancel this order? Its items will go back into stock.")) return;
    setSaving(status);
    try {
      await updateOrderStatus(order.id, status);
      showToast(`Order is now ${status}`, "success");
      reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not update the order.", "error");
    } finally {
      setSaving(null);
    }
  };

  const { customer } = order;

  return (
    <>
      <Link to="/admin/orders" className="mb-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary">
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>
      <AdminHeading
        title={order.id}
        subtitle={`Placed ${formatDateTime(order.createdDate)}`}
        action={<OrderStatusBadge status={order.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-navy">Items</h2>
            <ul className="mt-3 divide-y divide-slate-100">
              {order.items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3 py-3">
                  <img src={item.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
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

          <section className="rounded-2xl border border-slate-100 bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm">
            <h2 className="mb-2 font-bold text-navy">Customer and delivery</h2>
            <p className="font-semibold text-navy">{customer.name}</p>
            <p>{customer.email}</p>
            <p>Mobile: {customer.mobile}</p>
            <p className="mt-2">{customer.address}</p>
            <p>
              {customer.city}, {customer.state} - {customer.pinCode}
            </p>
            <p className="mt-2">Payment method: {PAYMENT_LABELS[order.paymentMethod]} (demo)</p>
          </section>
        </div>

        <div className="space-y-4">
          <OrderSummary totals={order.totals} title="Payment Summary" />
          {NEXT_STAGES[order.status].map(({ status, label }) => (
            <Button
              key={status}
              fullWidth
              size="lg"
              variant={status === "cancelled" ? "ghost" : "primary"}
              isLoading={saving === status}
              disabled={saving !== null}
              onClick={() => changeStatus(status)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}
