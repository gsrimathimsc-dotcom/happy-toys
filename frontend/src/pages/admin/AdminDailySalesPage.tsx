import { useState } from "react";
import { AdminHeading, LoadState, TablePanel } from "@/components/admin/AdminParts";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useLoad } from "@/hooks/useLoad";
import { formatPrice } from "@/lib/utils";
import { getDailySales } from "@/services/adminService";

const PERIODS = [7, 30, 90];

export default function AdminDailySalesPage() {
  useDocumentTitle("Daily Sales");
  const [days, setDays] = useState(7);
  const { data, error, reload } = useLoad(() => getDailySales(days), days);

  const totals = (data ?? []).reduce(
    (sum, day) => ({ orders: sum.orders + day.orders, items: sum.items + day.itemsSold, sales: sum.sales + day.sales }),
    { orders: 0, items: 0, sales: 0 }
  );

  return (
    <>
      <AdminHeading
        title="Daily Sales"
        subtitle="Items ordered and total amount per day, in Indian time. Cancelled orders are left out."
        action={
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">Show</span>
            <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="input-field !w-auto">
              {PERIODS.map((period) => (
                <option key={period} value={period}>
                  Last {period} days
                </option>
              ))}
            </select>
          </label>
        }
      />

      {!data ? (
        <LoadState error={error} onRetry={reload} />
      ) : (
        <TablePanel>
          <thead className="border-b border-slate-100 text-xs uppercase text-muted">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Items ordered</th>
              <th className="p-3 text-right">Orders</th>
              <th className="p-3 text-right">Units</th>
              <th className="p-3 text-right">Total amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((day) => (
              <tr key={day.date} className="align-top">
                <td className="whitespace-nowrap p-3 font-medium text-navy">
                  {new Date(`${day.date}T00:00:00`).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="p-3">
                  {day.items.length === 0 ? (
                    <span className="text-muted">No sales</span>
                  ) : (
                    <ul className="space-y-0.5">
                      {day.items.map((item) => (
                        <li key={item.productId}>
                          {item.quantity} x {item.name}{" "}
                          <span className="text-muted">({formatPrice(item.amount)})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="p-3 text-right">{day.orders}</td>
                <td className="p-3 text-right">{day.itemsSold}</td>
                <td className="p-3 text-right font-semibold">{formatPrice(day.sales)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-slate-200 font-bold text-navy">
            <tr>
              <td className="p-3" colSpan={2}>Period total</td>
              <td className="p-3 text-right">{totals.orders}</td>
              <td className="p-3 text-right">{totals.items}</td>
              <td className="p-3 text-right">{formatPrice(totals.sales)}</td>
            </tr>
          </tfoot>
        </TablePanel>
      )}
    </>
  );
}
