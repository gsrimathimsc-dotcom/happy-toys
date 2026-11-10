import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminSearch from "@/components/admin/AdminSearch";
import { AdminHeading, formatDateTime, LoadState, OrderStatusBadge, TablePanel } from "@/components/admin/AdminParts";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useLoad } from "@/hooks/useLoad";
import { formatPrice } from "@/lib/utils";
import { getAdminOrders } from "@/services/adminService";
import type { OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = ["confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  useDocumentTitle("Orders");
  const navigate = useNavigate();
  const [status, setStatus] = useState<OrderStatus | "">("");
  const { data, error, reload } = useLoad(() => getAdminOrders(status || undefined), status);
  const [search, setSearch] = useState("");

  const term = search.trim().toLowerCase();
  const orders = data?.filter((o) =>
    [o.id, o.customer.name, o.customer.mobile, o.customer.email, ...o.items.map((i) => i.name)].some((text) =>
      text.toLowerCase().includes(term)
    )
  );

  return (
    <>
      <AdminHeading
        title="Orders"
        subtitle={orders ? `${orders.length} order${orders.length === 1 ? "" : "s"}` : undefined}
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

      <AdminSearch
        onSearch={setSearch}
        label="Search orders"
        placeholder="Search by order number, customer, mobile or toy"
        className="mb-4"
        items={data ?? []}
        matches={(o, term) =>
          [o.id, o.customer.name, o.customer.mobile, o.customer.email, ...o.items.map((i) => i.name)].some((text) =>
            text.toLowerCase().includes(term)
          )
        }
        getKey={(o) => o.id}
        onSelect={(o) => navigate(`/admin/orders/${o.id}`)}
        renderItem={(o) => (
          <span className="flex items-center justify-between gap-3">
            <span className="min-w-0">
              <span className="block truncate font-mono text-xs font-semibold text-primary">{o.id}</span>
              <span className="block truncate text-xs text-muted">{o.customer.name}</span>
            </span>
            <span className="text-sm font-bold text-navy">{formatPrice(o.totals.total)}</span>
          </span>
        )}
      />

      {!orders ? (
        <LoadState error={error} onRetry={reload} />
      ) : orders.length === 0 ? (
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
            {orders.map((order) => (
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
