import type { ReactNode } from "react";
import { formatPrice } from "@/lib/utils";

export function ChartPanel({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-base font-bold text-navy">{title}</h2>
      {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export interface ChartPoint {
  label: string;
  value: number;
}

/** Vertical bars, one per point. Values are real figures passed in by the page. */
export function BarChart({ points, format = formatPrice }: { points: ChartPoint[]; format?: (value: number) => string }) {
  const max = Math.max(...points.map((p) => p.value), 1);
  return (
    <div className="flex h-48 items-end gap-2" role="img" aria-label="Bar chart">
      {points.map((p) => (
        <div key={p.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[10px] font-semibold text-navy">{p.value > 0 ? format(p.value) : ""}</span>
          <div
            className="w-full rounded-t-lg bg-primary"
            style={{ height: `${(p.value / max) * 100}%`, minHeight: p.value > 0 ? 4 : 0 }}
            title={`${p.label}: ${format(p.value)}`}
          />
          <span className="w-full truncate text-center text-[10px] text-muted">{p.label}</span>
        </div>
      ))}
    </div>
  );
}

/** A line with a soft fill, for trends over time. */
export function LineChart({ points }: { points: ChartPoint[] }) {
  const width = 100;
  const height = 40;
  const max = Math.max(...points.map((p) => p.value), 1);
  const step = points.length > 1 ? width / (points.length - 1) : 0;
  const coords = points.map((p, i) => `${i * step},${height - (p.value / max) * (height - 4) - 2}`);
  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-40 w-full" role="img" aria-label="Revenue trend">
        <polygon points={`0,${height} ${coords.join(" ")} ${width},${height}`} className="fill-primary/10" />
        <polyline points={coords.join(" ")} fill="none" strokeWidth="1.5" vectorEffect="non-scaling-stroke" className="stroke-primary" />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-muted">
        <span>{points[0]?.label}</span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}

/** Horizontal bars with a label and a count, for rankings and status splits. */
export function HorizontalBars({ rows }: { rows: { label: string; value: number; display?: string; color?: string }[] }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1 flex justify-between gap-3 text-xs">
            <span className="truncate font-medium text-navy">{r.label}</span>
            <span className="shrink-0 text-muted">{r.display ?? r.value}</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full"
              style={{ width: `${(r.value / max) * 100}%`, backgroundColor: r.color ?? "#2447C5" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
