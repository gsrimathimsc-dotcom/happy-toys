import { NavLink, Outlet } from "react-router-dom";
import { Boxes, CalendarDays, CalendarRange, LayoutDashboard, Package, ShoppingBag, Tags, TicketPercent, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/stock", label: "Stock", icon: Boxes },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/daily-sales", label: "Daily Sales", icon: CalendarDays },
  { to: "/admin/monthly-sales", label: "Monthly Sales", icon: CalendarRange },
  { to: "/admin/offers", label: "Offers", icon: TicketPercent },
];

/** The tabs shown at the top of every admin page. */
export default function AdminLayout() {
  return (
    <div className="container-page py-6">
      <nav
        aria-label="Admin"
        className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-sm"
      >
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition",
                isActive ? "bg-primary text-white" : "text-navy hover:bg-slate-100"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
