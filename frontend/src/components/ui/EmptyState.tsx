import type { LucideIcon } from "lucide-react";
import Button from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex animate-fade-in flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary-light">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-navy">{title}</h2>
      <p className="mt-2 max-w-md text-muted">{message}</p>
      {actionLabel && actionHref && (
        <Button href={actionHref} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
