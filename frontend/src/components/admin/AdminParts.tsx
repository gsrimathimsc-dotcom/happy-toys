import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

export function AdminHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  to,
  tone = "bg-primary-light text-primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  to?: string;
  tone?: string;
}) {
  const body = (
    <>
      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", tone)}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-muted">{label}</span>
        <span className="block truncate text-xl font-extrabold text-navy">{value}</span>
      </span>
    </>
  );
  const classes = "flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm";

  return to ? (
    <Link to={to} className={cn(classes, "transition hover:border-primary/30 hover:shadow-md")}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}

/** The loading and error screens shared by the admin pages. */
export function LoadState({ error, onRetry }: { error: string; onRetry: () => void }) {
  if (!error) return <Spinner />;
  return (
    <div className="flex flex-col items-center rounded-2xl border border-red-100 bg-red-50 p-10 text-center">
      <CircleAlert className="h-10 w-10 text-red-500" />
      <p className="mt-3 font-semibold text-red-700">{error}</p>
      <Button className="mt-5" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

/**
 * A white panel for a table. Wide tables scroll sideways inside the panel on
 * small screens. Tables that hide columns on phones can pass fit to skip that.
 */
export function TablePanel({ children, fit = false }: { children: ReactNode; fit?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
      <table className={cn("w-full text-left text-sm", !fit && "min-w-[640px]")}>{children}</table>
    </div>
  );
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  confirmed: "bg-blue-50 text-blue-700",
  processing: "bg-amber-50 text-amber-700",
  shipped: "bg-indigo-50 text-indigo-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", STATUS_STYLES[status])}>
      {status}
    </span>
  );
}

export function StockBadge({ stock }: { stock: number }) {
  const [label, style] =
    stock <= 0
      ? ["Out of stock", "bg-red-50 text-red-600"]
      : stock <= 10
        ? ["Low stock", "bg-amber-50 text-amber-700"]
        : ["In stock", "bg-green-50 text-green-700"];
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", style)}>{label}</span>;
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}
