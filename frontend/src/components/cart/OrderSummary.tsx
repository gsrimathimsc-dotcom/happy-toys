import type { ReactNode } from "react";
import { formatPrice, FREE_DELIVERY_THRESHOLD } from "@/lib/utils";
import type { CartTotals } from "@/types";

interface OrderSummaryProps {
  totals: CartTotals;
  /** Optional extra content, e.g. the checkout button */
  children?: ReactNode;
  title?: string;
}

/** Price breakdown box used on the cart, checkout and confirmation pages. */
export default function OrderSummary({ totals, children, title = "Order Summary" }: OrderSummaryProps) {
  const sellingTotal = totals.subtotal - totals.discount;
  const remainingForFreeDelivery = FREE_DELIVERY_THRESHOLD - sellingTotal;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-navy">{title}</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <Row label={`Subtotal (${totals.itemCount} item${totals.itemCount === 1 ? "" : "s"})`} value={formatPrice(totals.subtotal)} />
        <Row label="Discount" value={`- ${formatPrice(totals.discount)}`} valueClass="text-green-600" />
        <Row
          label="Delivery"
          value={totals.deliveryFee === 0 ? "FREE" : formatPrice(totals.deliveryFee)}
          valueClass={totals.deliveryFee === 0 ? "text-green-600" : undefined}
        />
        <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-4 text-base">
          <dt className="font-bold text-navy">Total Amount</dt>
          <dd className="text-xl font-extrabold text-navy">{formatPrice(totals.total)}</dd>
        </div>
      </dl>

      {totals.discount > 0 && (
        <p className="mt-4 rounded-xl bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700">
          You save {formatPrice(totals.discount)} on this order
        </p>
      )}
      {totals.deliveryFee > 0 && remainingForFreeDelivery > 0 && (
        <p className="mt-3 rounded-xl bg-secondary-light px-4 py-2.5 text-sm text-navy">
          Add {formatPrice(remainingForFreeDelivery)} more for <strong>free delivery</strong>
        </p>
      )}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={valueClass ?? "font-medium text-navy"}>{value}</dd>
    </div>
  );
}
