import { Link } from "react-router-dom";
import {
  Boxes,
  CalendarDays,
  ClipboardList,
  IndianRupee,
  Package,
  PackageX,
  ShoppingBag,
  TicketPercent,
  TriangleAlert,
  Users,
} from "lucide-react";
import { AdminHeading, formatDateTime, LoadState, OrderStatusBadge, StatCard, TablePanel } from "@/components/admin/AdminParts";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useLoad } from "@/hooks/useLoad";
import { formatPrice } from "@/lib/utils";
import { BarChart, ChartPanel, HorizontalBars, LineChart } from "@/components/admin/AdminCharts";
import { getDashboard, getMonthlySales } from "@/services/adminService";
import type { OrderStatus } from "@/types";

const STATUS_COLORS: Record<OrderStatus, string> = {
  confirmed: "#2447C5",
  processing: "#FF8A35",
  shipped: "#7C3AED",
  delivered: "#16A34A",
  cancelled: "#DC2626",
};

const getLastSixMonths = () => getMonthlySales(6);

export default function AdminDashboardPage() {
  useDocumentTitle("Admin Dashboard");
  const { data, error, reload } = useLoad(getDashboard);
  const { data: monthly } = useLoad(getLastSixMonths);

  if (!data) return <LoadState error={error} onRetry={reload} />;

  return (
    <>
      <AdminHeading title="Dashboard" subtitle="Live figures from the store's database." />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={IndianRupee} label="Total sales" value={formatPrice(data.totalSales)} tone="bg-green-50 text-green-700" />
        <StatCard icon={ShoppingBag} label="Total orders" value={data.totalOrders} to="/admin/orders" />
        <StatCard icon={ClipboardList} label="Open orders" value={data.openOrders} to="/admin/orders" tone="bg-amber-50 text-amber-700" />
        <StatCard icon={Users} label="Customers" value={data.totalCustomers} />
        <StatCard icon={Package} label="Products" value={data.totalProducts} to="/admin/products" />
        <StatCard icon={TriangleAlert} label="Low stock" value={data.lowStockProducts} to="/admin/stock" tone="bg-amber-50 text-amber-700" />
        <StatCard icon={PackageX} label="Out of stock" value={data.outOfStockProducts} to="/admin/stock" tone="bg-red-50 text-red-600" />
        <StatCard icon={TicketPercent} label="Products on offer" value={data.productsOnOffer} to="/admin/offers" />
        <StatCard icon={TicketPercent} label="Active coupons" value={data.activeCoupons} to="/admin/offers" />
        <StatCard icon={Boxes} label="Items sold today" value={data.today.itemsSold} to="/admin/daily-sales" />
        <StatCard icon={CalendarDays} label="Orders today" value={data.today.orders} to="/admin/daily-sales" />
        <StatCard icon={IndianRupee} label="Sales today" value={formatPrice(data.today.sales)} to="/admin/daily-sales" tone="bg-green-50 text-green-700" />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <ChartPanel title="Monthly sales" subtitle="Last 6 months, cancelled orders excluded">
          {monthly ? (
            <BarChart points={[...monthly].reverse().map((m) => ({ label: m.label, value: m.sales }))} />
          ) : (
            <p className="text-sm text-muted">Loading...</p>
          )}
        </ChartPanel>
        <ChartPanel title="Revenue trend" subtitle="Daily sales, last 7 days">
          <LineChart points={data.salesOverview.map((d) => ({ label: d.date.slice(5), value: d.sales }))} />
        </ChartPanel>
        <ChartPanel title="Orders by status">
          <HorizontalBars
            rows={data.orderStatusCounts.map((s) => ({
              label: s.status.charAt(0).toUpperCase() + s.status.slice(1),
              value: s.count,
              color: STATUS_COLORS[s.status],
            }))}
          />
        </ChartPanel>
        <ChartPanel title="Top-selling products" subtitle="By units sold">
          {data.bestSellingProducts.length === 0 ? (
            <p className="text-sm text-muted">No sales yet.</p>
          ) : (
            <HorizontalBars
              rows={data.bestSellingProducts.map((p) => ({
                label: p.name,
                value: p.unitsSold,
                display: `${p.unitsSold} sold`,
              }))}
            />
          )}
        </ChartPanel>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-bold text-navy">Recent orders</h2>
      {data.recentOrders.length === 0 ? (
        <p className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-muted shadow-sm">No orders yet.</p>
      ) : (
        <TablePanel>
          <thead className="border-b border-slate-100 text-xs uppercase text-muted">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.recentOrders.map((order) => (
              <tr key={order.id}>
                <td className="p-3 font-mono text-xs">
                  <Link to={`/admin/orders/${order.id}`} className="inline-flex min-h-10 items-center font-semibold text-primary hover:underline">
                    {order.id}
                  </Link>
                </td>
                <td className="p-3">{order.customer.name}</td>
                <td className="p-3 text-muted">{formatDateTime(order.createdDate)}</td>
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
