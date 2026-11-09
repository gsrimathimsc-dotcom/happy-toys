import { Link } from "react-router-dom";
import { House } from "lucide-react";
import { cn } from "@/lib/utils";

/** A small "Home" link to put at the top of a page. */
export default function HomeLink({ className, label = "Home" }: { className?: string; label?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        "inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-primary",
        className
      )}
    >
      <House className="h-4 w-4" /> {label}
    </Link>
  );
}
