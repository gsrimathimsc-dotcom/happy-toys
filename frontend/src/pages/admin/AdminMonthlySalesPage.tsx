import { useState } from "react";
import { AdminHeading, LoadState, TablePanel } from "@/components/admin/AdminParts";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useLoad } from "@/hooks/useLoad";
import { formatPrice } from "@/lib/utils";
import { getMonthlySales } from "@/services/adminService";

const PERIODS = [6, 12, 24];

export default function AdminMonthlySalesPage() {
  useDocumentTitle("Monthly Sales");
  const [months, setMonths] = useState(12);
  const { data, error, reload } = useLoad(() => getMonthlySales(months), months);

  const totals = (data ?? []).reduce(
    (sum, month) => ({ orders: sum.orders + month.orders, items: sum.items + month.itemsSold, sales: sum.sales + month.sales }),
    { orders: 0, items: 0, sales: 0 }
  );
  const highest = Math.max(1, ...(data ?? []).map((month) => month.sales));

  return (
    <>
      <AdminHeading
        title="Monthly Sales"
        subtitle="Orders and total amount per month, in Indian time. Cancelled orders are left out."
        action={
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">Show</span>
            <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className="input-field !w-auto">
              {PERIODS.map((period) => (
                <option key={period} value={period}>
                  Last {period} months
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
              <th className="p-3">Month</th>
              <th className="hidden p-3 sm:table-cell">Share of best month</th>
              <th className="p-3 text-right">Orders</th>
              <th className="p-3 text-right">Units</th>
              <th className="p-3 text-right">Total amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((month) => (
              <tr key={`${month.year}-${month.month}`}>
                <td className="whitespace-nowrap p-3 font-medium text-navy">{month.label}</td>
                <td className="hidden w-1/3 p-3 sm:table-cell">
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(month.sales / highest) * 100}%` }} />
                  </div>
                </td>
                <td className="p-3 text-right">{month.orders}</td>
                <td className="p-3 text-right">{month.itemsSold}</td>
                <td className="p-3 text-right font-semibold">{formatPrice(month.sales)}</td>
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
