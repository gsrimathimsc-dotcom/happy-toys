import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminHeading, formatDateTime, LoadState, OrderStatusBadge, TablePanel } from "@/components/admin/AdminParts";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useLoad } from "@/hooks/useLoad";
import { formatPrice } from "@/lib/utils";
import { getAdminOrders } from "@/services/adminService";
import type { OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = ["confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  useDocumentTitle("Orders");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const { data, error, reload } = useLoad(() => getAdminOrders(status || undefined), status);

  return (
    <>
      <AdminHeading
        title="Orders"
        subtitle={data ? `${data.length} order${data.length === 1 ? "" : "s"}` : undefined}
        action={
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus | "")}
              className="input-field !w-auto capitalize"
            >
              <option value="">All</option>
              {STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        }
      />

      {!data ? (
        <LoadState error={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <p className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-muted shadow-sm">No orders to show.</p>
      ) : (
        <TablePanel>
          <thead className="border-b border-slate-100 text-xs uppercase text-muted">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Items</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((order) => (
              <tr key={order.id}>
                <td className="p-3 font-mono text-xs">
                  <Link to={`/admin/orders/${order.id}`} className="font-semibold text-primary hover:underline">
                    {order.id}
                  </Link>
                </td>
                <td className="p-3">
                  <p className="font-medium text-navy">{order.customer.name}</p>
                  <p className="text-xs text-muted">{order.customer.mobile}</p>
                </td>
                <td className="p-3 text-muted">{formatDateTime(order.createdDate)}</td>
                <td className="p-3">
                  <ul className="space-y-0.5">
                    {order.items.map((item) => (
                      <li key={item.productId}>
                        {item.quantity} x {item.name}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-3"><OrderStatusBadge status={order.status} /></td>
                <td className="p-3 text-right font-semibold">{formatPrice(order.totals.total)}</td>
              </tr>
            ))}
          </tbody>
        </TablePanel>
      )}
    </>
  );
}
