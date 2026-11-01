import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  min?: number;
  size?: "sm" | "md";
}

export default function QuantitySelector({
  value,
  max,
  onChange,
  min = 1,
  size = "md",
}: QuantitySelectorProps) {
  const button = cn(
    "flex items-center justify-center text-navy transition hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent",
    size === "sm" ? "h-8 w-8" : "h-10 w-10"
  );
  return (
    <div className="inline-flex items-center overflow-hidden rounded-full border border-slate-200 bg-white">
      <button
        type="button"
        className={button}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className={cn("text-center font-semibold", size === "sm" ? "w-8 text-sm" : "w-10")}>
        {value}
      </span>
      <button
        type="button"
        className={button}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
