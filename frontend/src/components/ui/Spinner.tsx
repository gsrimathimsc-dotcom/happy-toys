import { Loader2 } from "lucide-react";

/** Full-width loading indicator for pages and sections. */
export default function Spinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted" role="status">
      <Loader2 className="h-9 w-9 animate-spin text-primary" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
